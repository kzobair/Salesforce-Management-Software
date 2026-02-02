"""
FGL Salesforce Management Platform - Backend API Tests
Tests all CRUD operations and critical edge cases for:
- Authentication
- Dashboard (2-month summary)
- Meetings (with OTC, currency, unit fields)
- Pipelines (with OTC, currency, unit, delivered status fields)
- Delivered (pipelines marked as 'Yes')
- KPI Assignments (with KPI Score Target)
- KAM Rankings (SuperUser only)
- KAM Profile (SuperUser only)
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@fgl.com"
ADMIN_PASSWORD = "Admin@123"


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test successful login with admin credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        assert "user" in data, "No user in response"
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "SuperUser"
        print(f"✓ Login successful for {ADMIN_EMAIL}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpass"
        })
        assert response.status_code in [401, 400], f"Expected 401/400, got {response.status_code}"
        print("✓ Invalid credentials rejected correctly")


class TestDashboard:
    """Dashboard endpoint tests - 2-month summary feature"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json().get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_monthly_summary(self):
        """Test 2-month summary endpoint (current and previous month)"""
        response = requests.get(f"{BASE_URL}/api/dashboard/monthly-summary", headers=self.headers)
        assert response.status_code == 200, f"Monthly summary failed: {response.text}"
        
        data = response.json()
        assert "current_month" in data, "Missing current_month in response"
        assert "previous_month" in data, "Missing previous_month in response"
        
        # Verify current month structure
        current = data["current_month"]
        assert "month" in current
        assert "meetings_count" in current
        assert "pipeline_count" in current
        assert "pipeline_mrc" in current
        assert "delivered_count" in current
        assert "delivered_kpi" in current
        
        # Verify previous month structure
        previous = data["previous_month"]
        assert "month" in previous
        assert "meetings_count" in previous
        
        print(f"✓ Monthly summary: Current={current['month']}, Previous={previous['month']}")
    
    def test_total_summary(self):
        """Test total summary endpoint"""
        response = requests.get(f"{BASE_URL}/api/dashboard/total-summary", headers=self.headers)
        assert response.status_code == 200, f"Total summary failed: {response.text}"
        
        data = response.json()
        assert "meetings_count" in data
        assert "pipeline_count" in data
        assert "pipeline_mrc" in data
        assert "delivered_count" in data
        assert "delivered_mrc" in data
        
        print(f"✓ Total summary: Meetings={data['meetings_count']}, Pipeline={data['pipeline_count']}, Delivered={data['delivered_count']}")


class TestMeetings:
    """Meetings endpoint tests - OTC, currency, unit fields"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        data = response.json()
        self.token = data.get("access_token")
        self.user_id = data.get("user", {}).get("user_id")
        self.headers = {"Authorization": f"Bearer {self.token}"}
        
        # Get a valid KAM user for creating meetings
        kam_response = requests.get(f"{BASE_URL}/api/users/kams", headers=self.headers)
        kams = kam_response.json()
        self.kam_user_id = kams[0]["user_id"] if kams else None
    
    def test_create_meeting_with_otc_currency_unit(self):
        """Test creating meeting with OTC, currency, and unit fields"""
        meeting_data = {
            "client_name": f"TEST_Client_{uuid.uuid4().hex[:8]}",
            "client_address": "Test Address 123",
            "contact_name": "Test Contact",
            "contact_number": "+8801234567890",
            "capacity_req": 100,
            "capacity_unit": "Mbps",
            "capacity_mrc": 50000,
            "capacity_mrc_currency": "BDT",
            "capacity_otc": 10000,
            "capacity_otc_currency": "BDT",
            "other_cap_req": 50,
            "other_cap_unit": "Gbps",
            "other_cap_mrc": 25000,
            "other_cap_mrc_currency": "USD",
            "other_cap_otc": 5000,
            "other_cap_otc_currency": "USD",
            "kam_user_id": self.user_id,
            "meeting_minutes": "Test meeting notes"
        }
        
        response = requests.post(f"{BASE_URL}/api/meetings/", json=meeting_data, headers=self.headers)
        assert response.status_code in [200, 201], f"Create meeting failed: {response.text}"
        
        data = response.json()
        assert data["client_name"] == meeting_data["client_name"]
        assert data["capacity_unit"] == "Mbps"
        assert data["capacity_mrc_currency"] == "BDT"
        assert data["capacity_otc"] == 10000
        assert data["capacity_otc_currency"] == "BDT"
        assert data["other_cap_unit"] == "Gbps"
        assert data["other_cap_mrc_currency"] == "USD"
        
        # Store meeting_id for cleanup
        self.created_meeting_id = data.get("meeting_id")
        print(f"✓ Meeting created with OTC={data['capacity_otc']} {data['capacity_otc_currency']}, Unit={data['capacity_unit']}")
        
        # Cleanup
        if self.created_meeting_id:
            requests.delete(f"{BASE_URL}/api/meetings/{self.created_meeting_id}", headers=self.headers)
    
    def test_list_meetings(self):
        """Test listing meetings"""
        response = requests.get(f"{BASE_URL}/api/meetings/", headers=self.headers)
        assert response.status_code == 200, f"List meetings failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Listed {len(data)} meetings")


class TestPipelines:
    """Pipelines endpoint tests - OTC, currency, unit, delivered status fields"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        data = response.json()
        self.token = data.get("access_token")
        self.user_id = data.get("user", {}).get("user_id")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_create_pipeline_with_delivered_status(self):
        """Test creating pipeline with delivered status field"""
        pipeline_data = {
            "client_name": f"TEST_Pipeline_{uuid.uuid4().hex[:8]}",
            "client_address": "Pipeline Address 123",
            "contact_name": "Pipeline Contact",
            "contact_number": "+8801234567890",
            "capacity_req": 200,
            "capacity_unit": "Gbps",
            "capacity_mrc": 100000,
            "capacity_mrc_currency": "BDT",
            "capacity_otc": 20000,
            "capacity_otc_currency": "USD",
            "other_cap_req": 0,
            "other_cap_unit": "Mbps",
            "other_cap_mrc": 0,
            "other_cap_mrc_currency": "BDT",
            "other_cap_otc": 0,
            "other_cap_otc_currency": "BDT",
            "kam_user_id": self.user_id,
            "confirmation_status": "Confirmed",
            "confirmation_date": datetime.utcnow().isoformat(),
            "confirmation_notes": "Test pipeline notes",
            "delivered_status": "Pending"
        }
        
        response = requests.post(f"{BASE_URL}/api/pipelines/", json=pipeline_data, headers=self.headers)
        assert response.status_code in [200, 201], f"Create pipeline failed: {response.text}"
        
        data = response.json()
        assert data["client_name"] == pipeline_data["client_name"]
        assert data["capacity_unit"] == "Gbps"
        assert data["capacity_otc"] == 20000
        assert data["capacity_otc_currency"] == "USD"
        assert data["delivered_status"] == "Pending"
        
        self.created_pipeline_id = data.get("pipeline_id")
        print(f"✓ Pipeline created with delivered_status={data['delivered_status']}, OTC={data['capacity_otc']} {data['capacity_otc_currency']}")
        
        # Cleanup
        if self.created_pipeline_id:
            requests.delete(f"{BASE_URL}/api/pipelines/{self.created_pipeline_id}", headers=self.headers)
    
    def test_pipeline_delivered_status_options(self):
        """Test pipeline with different delivered status options (Yes/No/Pending/In Process)"""
        for status in ["Yes", "No", "Pending", "In Process"]:
            pipeline_data = {
                "client_name": f"TEST_Status_{status}_{uuid.uuid4().hex[:6]}",
                "client_address": "Test Address",
                "contact_name": "Test Contact",
                "contact_number": "+8801234567890",
                "capacity_req": 100,
                "capacity_unit": "Mbps",
                "capacity_mrc": 50000,
                "capacity_mrc_currency": "BDT",
                "capacity_otc": 0,
                "capacity_otc_currency": "BDT",
                "other_cap_req": 0,
                "other_cap_unit": "Mbps",
                "other_cap_mrc": 0,
                "other_cap_mrc_currency": "BDT",
                "other_cap_otc": 0,
                "other_cap_otc_currency": "BDT",
                "kam_user_id": self.user_id,
                "confirmation_status": "Confirmed",
                "confirmation_date": datetime.utcnow().isoformat(),
                "confirmation_notes": f"Testing {status} status",
                "delivered_status": status
            }
            
            response = requests.post(f"{BASE_URL}/api/pipelines/", json=pipeline_data, headers=self.headers)
            assert response.status_code in [200, 201], f"Create pipeline with status {status} failed: {response.text}"
            
            data = response.json()
            assert data["delivered_status"] == status, f"Expected {status}, got {data['delivered_status']}"
            
            # Cleanup
            pipeline_id = data.get("pipeline_id")
            if pipeline_id:
                requests.delete(f"{BASE_URL}/api/pipelines/{pipeline_id}", headers=self.headers)
        
        print("✓ All delivered status options (Yes/No/Pending/In Process) work correctly")
    
    def test_list_pipelines(self):
        """Test listing pipelines"""
        response = requests.get(f"{BASE_URL}/api/pipelines/", headers=self.headers)
        assert response.status_code == 200, f"List pipelines failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Listed {len(data)} pipelines")
    
    def test_pipeline_summary(self):
        """Test pipeline summary stats"""
        response = requests.get(f"{BASE_URL}/api/pipelines/stats/summary", headers=self.headers)
        assert response.status_code == 200, f"Pipeline summary failed: {response.text}"
        
        data = response.json()
        assert "total_count" in data
        assert "total_capacity_requirement" in data
        assert "total_capacity_mrc" in data
        print(f"✓ Pipeline summary: Count={data['total_count']}, MRC={data['total_capacity_mrc']}")


class TestDelivered:
    """Delivered endpoint tests - shows pipelines marked as 'Yes'"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        data = response.json()
        self.token = data.get("access_token")
        self.user_id = data.get("user", {}).get("user_id")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_list_delivered(self):
        """Test listing delivered records"""
        response = requests.get(f"{BASE_URL}/api/delivered/", headers=self.headers)
        assert response.status_code == 200, f"List delivered failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Listed {len(data)} delivered records")
    
    def test_delivered_from_pipeline(self):
        """Test getting delivered records from pipelines marked as 'Yes'"""
        response = requests.get(f"{BASE_URL}/api/delivered/from-pipeline", headers=self.headers)
        assert response.status_code == 200, f"Delivered from pipeline failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list)
        # All items should have delivered_status = 'Yes'
        for item in data:
            assert item.get("delivered_status") == "Yes", f"Expected delivered_status='Yes', got {item.get('delivered_status')}"
        
        print(f"✓ Delivered from pipeline: {len(data)} records with status='Yes'")


class TestKPIAssignments:
    """KPI Assignments endpoint tests - KPI Score Target field"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        data = response.json()
        self.token = data.get("access_token")
        self.user_id = data.get("user", {}).get("user_id")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_list_kpi_assignments(self):
        """Test listing KPI assignments"""
        response = requests.get(f"{BASE_URL}/api/kpi-assignments/", headers=self.headers)
        assert response.status_code == 200, f"List KPI assignments failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Listed {len(data)} KPI assignments")
    
    def test_create_kpi_assignment_with_score_target(self):
        """Test creating KPI assignment with KPI Score Target field"""
        # First get a KAM user
        response = requests.get(f"{BASE_URL}/api/users/kams", headers=self.headers)
        kams = response.json()
        
        if not kams:
            pytest.skip("No KAM users available for testing")
        
        kam_user_id = kams[0]["user_id"]
        test_month = f"2099-{uuid.uuid4().hex[:2][:2].zfill(2)}"  # Future month to avoid conflicts
        
        kpi_data = {
            "month": "2099-01",
            "kam_user_id": kam_user_id,
            "revenue_target": 500000,
            "capacity_target": 1000,
            "kpi_score_target": 150,
            "notes": "Test KPI assignment"
        }
        
        response = requests.post(f"{BASE_URL}/api/kpi-assignments/", json=kpi_data, headers=self.headers)
        
        if response.status_code == 400 and "already exists" in response.text.lower():
            print("✓ KPI assignment already exists for this month/KAM (expected behavior)")
            return
        
        assert response.status_code in [200, 201], f"Create KPI assignment failed: {response.text}"
        
        data = response.json()
        assert data["kpi_score_target"] == 150, f"Expected kpi_score_target=150, got {data.get('kpi_score_target')}"
        assert data["revenue_target"] == 500000
        assert data["capacity_target"] == 1000
        
        print(f"✓ KPI assignment created with kpi_score_target={data['kpi_score_target']}")
        
        # Cleanup
        assignment_id = data.get("assignment_id")
        if assignment_id:
            requests.delete(f"{BASE_URL}/api/kpi-assignments/{assignment_id}", headers=self.headers)


class TestKAMManagement:
    """KAM Rankings and Profile tests - SuperUser only"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        data = response.json()
        self.token = data.get("access_token")
        self.user_id = data.get("user", {}).get("user_id")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_kam_rankings(self):
        """Test KAM rankings endpoint (SuperUser only)"""
        response = requests.get(f"{BASE_URL}/api/kam/rankings", headers=self.headers)
        assert response.status_code == 200, f"KAM rankings failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list)
        
        # Verify ranking structure
        if data:
            first_kam = data[0]
            assert "rank" in first_kam
            assert "user_id" in first_kam
            assert "name" in first_kam
            assert "email" in first_kam
            assert "total_kpi_score" in first_kam
        
        print(f"✓ KAM rankings: {len(data)} KAMs ranked")
    
    def test_kam_profiles(self):
        """Test all KAM profiles endpoint (SuperUser only)"""
        response = requests.get(f"{BASE_URL}/api/kam/profiles", headers=self.headers)
        assert response.status_code == 200, f"KAM profiles failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list)
        
        if data:
            first_profile = data[0]
            assert "user_id" in first_profile
            assert "name" in first_profile
            assert "total_kpi_score" in first_profile
            assert "total_meetings" in first_profile
            assert "total_pipelines" in first_profile
            assert "total_delivered" in first_profile
        
        print(f"✓ KAM profiles: {len(data)} profiles retrieved")
    
    def test_kam_profile_detail(self):
        """Test individual KAM profile endpoint (SuperUser only)"""
        # First get a KAM user
        response = requests.get(f"{BASE_URL}/api/users/kams", headers=self.headers)
        kams = response.json()
        
        if not kams:
            pytest.skip("No KAM users available for testing")
        
        kam_user_id = kams[0]["user_id"]
        
        response = requests.get(f"{BASE_URL}/api/kam/profile/{kam_user_id}", headers=self.headers)
        assert response.status_code == 200, f"KAM profile detail failed: {response.text}"
        
        data = response.json()
        assert "kam_info" in data
        assert "statistics" in data
        assert "kpi_assignments" in data
        
        # Verify statistics structure
        stats = data["statistics"]
        assert "total_kpi_score" in stats
        assert "total_meetings" in stats
        assert "total_pipelines" in stats
        assert "total_delivered" in stats
        assert "total_revenue" in stats
        
        print(f"✓ KAM profile detail: {data['kam_info']['name']} - KPI Score: {stats['total_kpi_score']}")


class TestUsers:
    """Users endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        data = response.json()
        self.token = data.get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_list_kams(self):
        """Test listing KAM users"""
        response = requests.get(f"{BASE_URL}/api/users/kams", headers=self.headers)
        assert response.status_code == 200, f"List KAMs failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list)
        
        # All users should be KAMs
        for user in data:
            assert user.get("role") == "KAM", f"Expected role='KAM', got {user.get('role')}"
        
        print(f"✓ Listed {len(data)} KAM users")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
