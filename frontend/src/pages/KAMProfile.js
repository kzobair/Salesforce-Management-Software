import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

function PersonalInfoCard({ kamInfo }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
        Personal Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-500">Name</label>
          <p className="text-gray-900 font-medium" data-testid="kam-name">
            {kamInfo.name}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-500">Email</label>
          <p className="text-gray-900" data-testid="kam-email">{kamInfo.email}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500">Mobile</label>
          <p className="text-gray-900" data-testid="kam-mobile">
            {kamInfo.mobile || "N/A"}
          </p>
        </div>
        <div>
          <label className="text-sm text-gray-500">Role</label>
          <p className="text-gray-900">{kamInfo.role}</p>
        </div>
      </div>
    </div>
  );
}

function StatisticsCard({ statistics }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
        Performance Statistics
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-600 font-medium">Total KPI Score</p>
          <p className="text-2xl font-bold text-blue-800" data-testid="total-kpi-score">
            {statistics.total_kpi_score || 0}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-sm text-green-600 font-medium">Meetings</p>
          <p className="text-2xl font-bold text-green-800" data-testid="meetings-count">
            {statistics.total_meetings || 0}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-sm text-purple-600 font-medium">Pipelines</p>
          <p className="text-2xl font-bold text-purple-800">
            {statistics.total_pipelines || 0}
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <p className="text-sm text-orange-600 font-medium">Delivered</p>
          <p className="text-2xl font-bold text-orange-800" data-testid="delivered-count">
            {statistics.total_delivered || 0}
          </p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4 text-center">
          <p className="text-sm text-indigo-600 font-medium">Total Revenue</p>
          <p className="text-xl font-bold text-indigo-800">
            ৳{(statistics.total_revenue || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-teal-50 rounded-lg p-4 text-center">
          <p className="text-sm text-teal-600 font-medium">Total Capacity</p>
          <p className="text-xl font-bold text-teal-800">
            {statistics.total_capacity || 0}
          </p>
        </div>
      </div>
    </div>
  );
}

function KPIHistoryRow({ kpi }) {
  return (
    <tr>
      <td className="px-4 py-2 text-sm text-gray-900 font-medium">{kpi.month}</td>
      <td className="px-4 py-2 text-sm text-gray-900">{kpi.kpi_score_target || 0}</td>
      <td className="px-4 py-2 text-sm text-gray-900">৳{(kpi.revenue_target || 0).toLocaleString()}</td>
      <td className="px-4 py-2 text-sm text-gray-900">{kpi.capacity_target || 0}</td>
      <td className="px-4 py-2 text-sm text-gray-500">{kpi.notes || '-'}</td>
    </tr>
  );
}

function KPIHistoryTable({ kpiAssignments }) {
  if (!kpiAssignments || kpiAssignments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
          KPI Assignment History
        </h2>
        <p className="text-gray-500 text-center py-4">No KPI assignments found for this KAM.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
        KPI Assignment History
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Month
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                KPI Score Target
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Revenue Target
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Capacity Target
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {kpiAssignments.map((kpi, idx) => (
              <KPIHistoryRow key={idx} kpi={kpi} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function KAMProfile() {
  const { kamUserId } = useParams();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get(`${API_URL}/api/kam/profile/${kamUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileData(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch KAM profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (kamUserId) {
      fetchProfile();
    }
  }, [kamUserId]);

  if (user?.role !== "SuperUser") {
    return (
      <Layout>
        <div className="p-6" data-testid="kam-profile-page">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Access denied. Only Super Users can view KAM profiles.
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6" data-testid="kam-profile-page">
        <div className="mb-6">
          <Link to="/kam-rankings" className="text-blue-600 hover:text-blue-800 flex items-center">
            <span className="mr-1">&larr;</span>
            Back to Rankings
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">KAM Profile</h1>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!loading && !error && profileData && (
          <div className="space-y-6">
            <PersonalInfoCard kamInfo={profileData.kam_info} />
            <StatisticsCard statistics={profileData.statistics} />
            <KPIHistoryTable kpiAssignments={profileData.kpi_assignments} />
          </div>
        )}
      </div>
    </Layout>
  );
}
