/**
 * Dashboard Page Component - Enhanced with 2-month summary
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { user } = useAuth();
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [totalSummary, setTotalSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myKPI, setMyKPI] = useState(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const promises = [
        axios.get(`${API}/dashboard/monthly-summary`),
        axios.get(`${API}/dashboard/total-summary`)
      ];
      
      if (user?.role === 'KAM') {
        promises.push(axios.get(`${API}/kpi-assignments/my-current`).catch(() => ({ data: null })));
      }
      
      const results = await Promise.all(promises);
      setMonthlySummary(results[0].data);
      setTotalSummary(results[1].data);
      
      if (user?.role === 'KAM' && results[2]?.data) {
        setMyKPI(results[2].data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (achieved, target) => {
    if (!target || target === 0) return 0;
    return Math.min(Math.round((achieved / target) * 100), 100);
  };

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
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
      <div className="space-y-6" data-testid="dashboard-page">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name}!</h1>
          <p className="text-blue-100 text-lg">
            You're logged in as <span className="font-semibold">{user?.role}</span>
          </p>
        </div>

        {/* 2-Month Summary Section */}
        {monthlySummary && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Monthly Comparison</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Month */}
              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {formatMonth(monthlySummary.current_month.month)} (Current)
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Meetings</p>
                    <p className="text-2xl font-bold text-blue-600" data-testid="current-meetings">
                      {monthlySummary.current_month.meetings_count}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Pipeline</p>
                    <p className="text-2xl font-bold text-green-600" data-testid="current-pipeline">
                      {monthlySummary.current_month.pipeline_count}
                    </p>
                    <p className="text-xs text-gray-400">৳{monthlySummary.current_month.pipeline_mrc.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Delivered</p>
                    <p className="text-2xl font-bold text-purple-600" data-testid="current-delivered">
                      {monthlySummary.current_month.delivered_count}
                    </p>
                    <p className="text-xs text-gray-400">KPI: {monthlySummary.current_month.delivered_kpi}</p>
                  </div>
                </div>
              </div>

              {/* Previous Month */}
              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-400">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {formatMonth(monthlySummary.previous_month.month)} (Previous)
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Meetings</p>
                    <p className="text-2xl font-bold text-blue-400" data-testid="prev-meetings">
                      {monthlySummary.previous_month.meetings_count}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Pipeline</p>
                    <p className="text-2xl font-bold text-green-400" data-testid="prev-pipeline">
                      {monthlySummary.previous_month.pipeline_count}
                    </p>
                    <p className="text-xs text-gray-400">৳{monthlySummary.previous_month.pipeline_mrc.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Delivered</p>
                    <p className="text-2xl font-bold text-purple-400" data-testid="prev-delivered">
                      {monthlySummary.previous_month.delivered_count}
                    </p>
                    <p className="text-xs text-gray-400">KPI: {monthlySummary.previous_month.delivered_kpi}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Total Summary Cards */}
        {totalSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Meetings</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2" data-testid="total-meetings">
                    {totalSummary.meetings_count}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Confirmed Pipeline</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2" data-testid="total-pipeline">
                    {totalSummary.pipeline_count}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">৳{totalSummary.pipeline_mrc.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Delivered Clients</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2" data-testid="total-delivered">
                    {totalSummary.delivered_count}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">৳{totalSummary.delivered_mrc.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>
          </div>
        )}

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
                    ৳{totalSummary?.delivered_mrc.toLocaleString() || 0} / ৳{myKPI.revenue_target.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      calculateProgress(totalSummary?.delivered_mrc || 0, myKPI.revenue_target) >= 100
                        ? 'bg-green-500'
                        : calculateProgress(totalSummary?.delivered_mrc || 0, myKPI.revenue_target) >= 70
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${calculateProgress(totalSummary?.delivered_mrc || 0, myKPI.revenue_target)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Capacity Target</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {totalSummary?.delivered_kpi || 0} / {myKPI.capacity_target}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      calculateProgress(totalSummary?.delivered_kpi || 0, myKPI.capacity_target) >= 100
                        ? 'bg-green-500'
                        : calculateProgress(totalSummary?.delivered_kpi || 0, myKPI.capacity_target) >= 70
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${calculateProgress(totalSummary?.delivered_kpi || 0, myKPI.capacity_target)}%` }}
                  ></div>
                </div>
              </div>

              {myKPI.kpi_score_target && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">KPI Score Target</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {totalSummary?.delivered_kpi || 0} / {myKPI.kpi_score_target}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        calculateProgress(totalSummary?.delivered_kpi || 0, myKPI.kpi_score_target) >= 100
                          ? 'bg-green-500'
                          : calculateProgress(totalSummary?.delivered_kpi || 0, myKPI.kpi_score_target) >= 70
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${calculateProgress(totalSummary?.delivered_kpi || 0, myKPI.kpi_score_target)}%` }}
                    ></div>
                  </div>
                </div>
              )}

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
              data-testid="quick-meetings"
            >
              <div className="text-3xl mb-2">📝</div>
              <p className="text-sm font-semibold text-gray-900">Add Meeting</p>
            </a>
            <a
              href="/pipelines"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition text-center"
              data-testid="quick-pipelines"
            >
              <div className="text-3xl mb-2">📊</div>
              <p className="text-sm font-semibold text-gray-900">Track Pipeline</p>
            </a>
            <a
              href="/delivered"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition text-center"
              data-testid="quick-delivered"
            >
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm font-semibold text-gray-900">View Delivered</p>
            </a>
            {user?.role === 'SuperUser' && (
              <a
                href="/kam-rankings"
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition text-center"
                data-testid="quick-rankings"
              >
                <div className="text-3xl mb-2">🏆</div>
                <p className="text-sm font-semibold text-gray-900">KAM Rankings</p>
              </a>
            )}
          </div>
        </div>

        {/* System Info */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-green-900 mb-2">System Status</h2>
          <p className="text-green-700">
            All modules are operational. Your data is being tracked in real-time.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
