/**
 * KAM Profile Page - Super User only
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '@/components/Layout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const KAMProfile = () => {
  const { user } = useAuth();
  const { kamUserId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (kamUserId) {
      fetchProfile();
    }
  }, [kamUserId]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/kam/profile/${kamUserId}`);
      setProfile(response.data);
    } catch (err) {
      setError('Failed to load KAM profile');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'SuperUser') {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">This page is only accessible to Super Users.</p>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">{error || 'Profile not found'}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">{profile.kam_info.name}</h1>
              <p className="text-blue-100 mt-2">{profile.kam_info.email}</p>
              {profile.kam_info.mobile && (
                <p className="text-blue-100 mt-1">📞 {profile.kam_info.mobile}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{profile.statistics.total_kpi_score}</div>
              <div className="text-blue-100 text-sm">Total KPI Score</div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 font-medium">Total Meetings</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{profile.statistics.total_meetings}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 font-medium">Total Pipelines</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{profile.statistics.total_pipelines}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600 font-medium">Total Delivered</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{profile.statistics.total_delivered}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
            <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              ৳{profile.statistics.total_revenue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b">
            <nav className="flex space-x-4 px-6">
              {['overview', 'meetings', 'pipelines', 'delivered', 'kpi_assignments'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 font-medium text-sm border-b-2 transition capitalize ${
                    activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Capacity Delivered</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {profile.statistics.total_capacity}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Account Status</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {profile.kam_info.status}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'meetings' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Serial #</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Client</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Contact</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {profile.meetings.map((meeting) => (
                      <tr key={meeting.meeting_id}>
                        <td className="px-4 py-3 text-sm">{meeting.serial_number}</td>
                        <td className="px-4 py-3 text-sm">{meeting.client_name}</td>
                        <td className="px-4 py-3 text-sm">{meeting.contact_name}</td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(meeting.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'pipelines' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Serial #</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Client</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">MRC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {profile.pipelines.map((pipeline) => (
                      <tr key={pipeline.pipeline_id}>
                        <td className="px-4 py-3 text-sm">{pipeline.serial_number}</td>
                        <td className="px-4 py-3 text-sm">{pipeline.client_name}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {pipeline.confirmation_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">৳{pipeline.capacity_mrc.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'delivered' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Serial #</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Client</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">KPI Score</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Revenue</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {profile.delivered.map((item) => (
                      <tr key={item.delivered_id}>
                        <td className="px-4 py-3 text-sm">{item.serial_number}</td>
                        <td className="px-4 py-3 text-sm">{item.client_name}</td>
                        <td className="px-4 py-3 text-sm font-bold text-blue-600">{item.kpi_score}</td>
                        <td className="px-4 py-3 text-sm">৳{item.capacity_mrc.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(item.delivered_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'kpi_assignments' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Month</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Revenue Target</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Capacity Target</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">KPI Score Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {profile.kpi_assignments.map((kpi) => (
                      <tr key={kpi.assignment_id}>
                        <td className="px-4 py-3 text-sm font-semibold">{kpi.month}</td>
                        <td className="px-4 py-3 text-sm">৳{kpi.revenue_target.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm">{kpi.capacity_target}</td>
                        <td className="px-4 py-3 text-sm font-bold text-blue-600">{kpi.kpi_score_target}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default KAMProfile;
