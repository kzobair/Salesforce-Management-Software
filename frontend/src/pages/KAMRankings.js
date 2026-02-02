/**
 * KAM Rankings Page - Super User only
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const KAMRankings = () => {
  const { user } = useAuth();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    try {
      const response = await axios.get(`${API}/kam/rankings`);
      setRankings(response.data);
    } catch (err) {
      setError('Failed to load rankings');
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

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">KAM Rankings</h1>
          <p className="text-gray-600 mt-1">Performance leaderboard based on KPI scores</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Rankings Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">KAM Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Total KPI Score</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Total Revenue</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Delivered Count</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Target</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Achievement %</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rankings.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                      No KAM rankings available yet.
                    </td>
                  </tr>
                ) : (
                  rankings.map((ranking) => (
                    <tr 
                      key={ranking.user_id} 
                      className={`hover:bg-gray-50 ${ranking.rank <= 3 ? 'bg-yellow-50' : ''}`}
                    >
                      <td className="px-6 py-4 text-2xl font-bold">
                        {getMedalEmoji(ranking.rank)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {ranking.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {ranking.email}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold">
                          {ranking.total_kpi_score}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        ৳{ranking.total_revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                          {ranking.total_delivered}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {ranking.current_month_target}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                ranking.achievement_percentage >= 100
                                  ? 'bg-green-500'
                                  : ranking.achievement_percentage >= 70
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(ranking.achievement_percentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold">
                            {ranking.achievement_percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link
                          to={`/kam-profile/${ranking.user_id}`}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performers Section */}
        {rankings.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rankings.slice(0, 3).map((ranking, idx) => (
              <div
                key={ranking.user_id}
                className={`p-6 rounded-lg shadow-lg ${
                  idx === 0
                    ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-400'
                    : idx === 1
                    ? 'bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-400'
                    : 'bg-gradient-to-br from-orange-100 to-orange-200 border-2 border-orange-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-5xl mb-3">{getMedalEmoji(ranking.rank)}</div>
                  <h3 className="text-xl font-bold text-gray-900">{ranking.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{ranking.email}</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">KPI Score:</span>
                      <span className="text-lg font-bold text-blue-600">{ranking.total_kpi_score}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Revenue:</span>
                      <span className="text-sm font-semibold text-green-600">
                        ৳{ranking.total_revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default KAMRankings;
