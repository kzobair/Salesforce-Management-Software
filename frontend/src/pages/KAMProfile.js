import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function KAMProfile() {
  const { kamUserId } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (kamUserId) {
      fetchProfile();
    }
  }, [kamUserId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/kam/profile/${kamUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch KAM profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "Super User") {
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
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
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

        {!loading && !error && profile && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Name</label>
                  <p className="text-gray-900 font-medium" data-testid="kam-name">
                    {profile.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <p className="text-gray-900" data-testid="kam-email">{profile.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Mobile</label>
                  <p className="text-gray-900" data-testid="kam-mobile">
                    {profile.mobile || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Role</label>
                  <p className="text-gray-900">{profile.role}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                KPI Performance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-blue-600 font-medium">Total KPI Score</p>
                  <p className="text-3xl font-bold text-blue-800" data-testid="total-kpi-score">
                    {profile.total_kpi_score || 0}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-green-600 font-medium">Meetings</p>
                  <p className="text-3xl font-bold text-green-800" data-testid="meetings-count">
                    {profile.meetings_count || 0}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-purple-600 font-medium">Delivered</p>
                  <p className="text-3xl font-bold text-purple-800" data-testid="delivered-count">
                    {profile.delivered_count || 0}
                  </p>
                </div>
              </div>
            </div>

            {profile.kpi_history && profile.kpi_history.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  KPI History
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Month
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Score Target
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Meetings Target
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Pipeline Target
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Delivered Target
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {profile.kpi_history.map((kpi, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{kpi.month}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {kpi.kpi_score_target || 0}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {kpi.meetings_target || 0}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {kpi.pipeline_target || 0}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {kpi.delivered_target || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
