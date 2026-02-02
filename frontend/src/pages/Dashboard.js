/**
 * Dashboard Page Component
 */
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">FGL</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">
                Salesforce Management
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome, {user?.name}!
          </h1>
          <p className="text-gray-600 mb-6">
            You are logged in as <span className="font-semibold">{user?.role}</span>
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              🚀 Phase 1 Complete: Authentication & User Management
            </h2>
            <p className="text-blue-700 text-sm">
              Authentication system is now working! The following features are available:
            </p>
            <ul className="list-disc list-inside text-blue-700 text-sm mt-2 space-y-1">
              <li>User Registration (with approval workflow)</li>
              <li>Login/Logout with JWT authentication</li>
              <li>Role-based access control (Super User vs KAM)</li>
              <li>Password management (forgot/reset/change)</li>
              <li>User approval interface (coming soon in UI)</li>
            </ul>
          </div>

          {user?.role === 'SuperUser' && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-900 mb-2">
                🔐 Super User Access
              </h2>
              <p className="text-green-700 text-sm">
                As a Super User, you have access to:
              </p>
              <ul className="list-disc list-inside text-green-700 text-sm mt-2 space-y-1">
                <li>User Management (Approve/Reject/Deactivate users)</li>
                <li>View all KAM data organization-wide</li>
                <li>Assign monthly KPIs and targets</li>
                <li>Generate organization-wide reports</li>
              </ul>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Phases:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-gray-900 mb-2">Phase 2</h4>
                <p className="text-sm text-gray-600">
                  Meetings, Pipeline, Delivered Modules
                </p>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-gray-900 mb-2">Phase 3</h4>
                <p className="text-sm text-gray-600">
                  Dashboard with Charts & Analytics
                </p>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold text-gray-900 mb-2">Phase 4</h4>
                <p className="text-sm text-gray-600">
                  Reports, Export, Search & Filters
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
