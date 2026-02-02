/**
 * Dashboard Page Component - Enhanced with metrics
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    meetings: 0,
    pipelines: 0,
    delivered: 0,
    pipelineValue: 0,
    deliveredRevenue: 0,
    deliveredKPI: 0
  });
  const [loading, setLoading] = useState(true);
  const [myKPI, setMyKPI] = useState(null);

  useEffect(() => {
    fetchMetrics();
    if (user?.role === 'KAM') {
      fetchMyKPI();
    }
  }, [user]);

  const fetchMetrics = async () => {
    try {
      const [meetingsRes, pipelinesRes, deliveredRes] = await Promise.all([
        axios.get(`${API}/meetings/`),
        axios.get(`${API}/pipelines/stats/summary`),
        axios.get(`${API}/delivered/stats/summary`)
      ]);

      setMetrics({
        meetings: meetingsRes.data.length,
        pipelines: pipelinesRes.data.total_count,
        delivered: deliveredRes.data.total_count,
        pipelineValue: pipelinesRes.data.total_capacity_mrc,
        deliveredRevenue: deliveredRes.data.total_revenue,
        deliveredKPI: deliveredRes.data.total_kpi_achievement
      });
    } catch (err) {
      console.error('Failed to fetch metrics', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyKPI = async () => {
    try {
      const response = await axios.get(`${API}/kpi-assignments/my-current`);
      setMyKPI(response.data);
    } catch (err) {
      // No KPI assigned for current month
      console.log('No KPI assigned for current month');
    }
  };

  const calculateProgress = (achieved, target) => {
    if (!target || target === 0) return 0;
    return Math.min(Math.round((achieved / target) * 100), 100);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name}! 👋</h1>
          <p className="text-blue-100 text-lg">
            You're logged in as <span className="font-semibold">{user?.role}</span>
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Meetings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.meetings}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🤝</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Confirmed Pipeline</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.pipelines}</p>
                <p className="text-xs text-gray-500 mt-1">৳{metrics.pipelineValue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Delivered Clients</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.delivered}</p>
                <p className="text-xs text-gray-500 mt-1">৳{metrics.deliveredRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Progress for KAMs */}
        {user?.role === 'KAM' && myKPI && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Your KPI Progress - {myKPI.month}
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Revenue Target</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ৳{metrics.deliveredRevenue.toLocaleString()} / ৳{myKPI.revenue_target.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      calculateProgress(metrics.deliveredRevenue, myKPI.revenue_target) >= 100
                        ? 'bg-green-500'
                        : calculateProgress(metrics.deliveredRevenue, myKPI.revenue_target) >= 70
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${calculateProgress(metrics.deliveredRevenue, myKPI.revenue_target)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {calculateProgress(metrics.deliveredRevenue, myKPI.revenue_target)}% achieved
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Capacity Target</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {metrics.deliveredKPI} / {myKPI.capacity_target}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      calculateProgress(metrics.deliveredKPI, myKPI.capacity_target) >= 100
                        ? 'bg-green-500'
                        : calculateProgress(metrics.deliveredKPI, myKPI.capacity_target) >= 70
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${calculateProgress(metrics.deliveredKPI, myKPI.capacity_target)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {calculateProgress(metrics.deliveredKPI, myKPI.capacity_target)}% achieved
                </p>
              </div>

              {myKPI.notes && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Notes:</strong> {myKPI.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/meetings"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition text-center"
            >
              <div className="text-3xl mb-2">🤝</div>
              <p className="text-sm font-semibold text-gray-900">Add Meeting</p>
            </a>
            <a
              href="/pipelines"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition text-center"
            >
              <div className="text-3xl mb-2">📈</div>
              <p className="text-sm font-semibold text-gray-900">Track Pipeline</p>
            </a>
            <a
              href="/delivered"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition text-center"
            >
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm font-semibold text-gray-900">View Delivered</p>
            </a>
            {user?.role === 'SuperUser' && (
              <a
                href="/users"
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition text-center"
              >
                <div className="text-3xl mb-2">👥</div>
                <p className="text-sm font-semibold text-gray-900">Manage Users</p>
              </a>
            )}
          </div>
        </div>

        {/* System Info */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-900 mb-2">✅ System Status</h2>
          <p className="text-green-700">
            All modules are operational. Your data is being tracked in real-time.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
