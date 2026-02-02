"""
Initialization script to create a Super User account
Run this once to create the first admin user
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import sys

# Add parent directory to path to import modules
sys.path.append(str(Path(__file__).parent))

from auth_utils import get_password_hash
from datetime import datetime
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def create_super_user():
    """Create a default Super User account"""
    
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Default Super User credentials
    email = "admin@fgl.com"
    password = "Admin@123"
    name = "FGL Administrator"
    
    # Check if super user already exists
    existing = await db.users.find_one({"email": email.lower()})
    
    if existing:
        print(f"✅ Super User already exists with email: {email}")
        print(f"   User ID: {existing['user_id']}")
        print(f"   Status: {existing['status']}")
        client.close()
        return
    
    # Create Super User
    user_doc = {
        "user_id": str(uuid.uuid4()),
        "name": name,
        "email": email.lower(),
        "mobile": None,
        "password_hash": get_password_hash(password),
        "role": "SuperUser",
        "status": "Active",  # Super User is active by default
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "last_login_at": None
    }
    
    await db.users.insert_one(user_doc)
    
    print("=" * 60)
    print("✅ Super User created successfully!")
    print("=" * 60)
    print(f"Email:    {email}")
    print(f"Password: {password}")
    print(f"Role:     SuperUser")
    print(f"Status:   Active")
    print("=" * 60)
    print("⚠️  IMPORTANT: Please change the password after first login!")
    print("=" * 60)
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_super_user())
