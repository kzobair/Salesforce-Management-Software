/**
 * Delivered Page - Track delivered clients with KPI
 * Shows only pipelines marked as "Yes" in delivered_status
 * SuperUser can assign KPI scores to each delivered item
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Layout from '@/components/Layout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Delivered = () => {
  const { user } = useAuth();
  const [delivered, setDelivered] = useState([]);
  const [deliveredPipelines, setDeliveredPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [viewMode, setViewMode] = useState('delivered');
  const [editingKpi, setEditingKpi] = useState(null);
  const [kpiValue, setKpiValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deliveredRes, pipelinesRes, summaryRes] = await Promise.all([
        axios.get(`${API}/delivered/`),
        axios.get(`${API}/pipelines/delivered-pipelines`),
        axios.get(`${API}/delivered/stats/summary`)
      ]);
      setDelivered(deliveredRes.data);
      setDeliveredPipelines(pipelinesRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error('Failed to load delivered records', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditKpi = (item) => {
    setEditingKpi(item.delivered_id);
    setKpiValue(item.kpi_score || 0);
  };

  const handleSaveKpi = async (deliveredId) => {
    try {
      setError('');
      await axios.patch(`${API}/delivered/${deliveredId}/kpi-score?kpi_score=${kpiValue}`);
      setEditingKpi(null);
      fetchData(); // Refresh data
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update KPI score');
    }
  };

  const handleCancelEdit = () => {
    setEditingKpi(null);
    setKpiValue('');
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
      <div className="space-y-6" data-testid="delivered-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Delivered Clients</h1>
            <p className="text-gray-600 mt-1">Track delivered clients with KPI values</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('delivered')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                viewMode === 'delivered'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              data-testid="view-delivered-btn"
            >
              Delivered Records ({delivered.length})
            </button>
            <button
              onClick={() => setViewMode('pipelines')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                viewMode === 'pipelines'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              data-testid="view-pipelines-btn"
            >
              From Pipeline ({deliveredPipelines.length})
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-600">Total Delivered</p>
              <p className="text-3xl font-bold text-blue-600 mt-2" data-testid="summary-count">
                {summary.total_count}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-600">Total Capacity</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {summary.total_capacity_delivered}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                ৳{summary.total_revenue?.toLocaleString() || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-600">Total KPI Score</p>
              <p className="text-3xl font-bold text-orange-600 mt-2" data-testid="summary-kpi">
                {summary.total_kpi_achievement || 0}
              </p>
            </div>
          </div>
        )}

        {/* Delivered Records Table */}
        {viewMode === 'delivered' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 bg-green-50 border-b">
              <h3 className="font-semibold text-green-800">Delivered Records with KPI Scores</h3>
              <p className="text-sm text-green-600">
                {user?.role === 'SuperUser' 
                  ? 'Click on KPI Score to edit and assign points to each delivery'
                  : 'View delivered records and their KPI scores'}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="delivered-table">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MRC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OTC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">KPI Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivered Date</th>
                    {user?.role === 'SuperUser' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {delivered.length === 0 ? (
                    <tr>
                      <td colSpan={user?.role === 'SuperUser' ? 9 : 8} className="px-6 py-8 text-center text-gray-500">
                        No delivered records yet. Mark pipelines as "Delivered: Yes" to create records.
                      </td>
                    </tr>
                  ) : (
                    delivered.map((item) => (
                      <tr key={item.delivered_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">{item.serial_number}</td>
                        <td className="px-6 py-4 text-sm">{item.client_name}</td>
                        <td className="px-6 py-4 text-sm">{item.contact_name}</td>
                        <td className="px-6 py-4 text-sm">{item.capacity_req} {item.capacity_unit || 'Mbps'}</td>
                        <td className="px-6 py-4 text-sm">
                          {item.capacity_mrc_currency === 'USD' ? '$' : '৳'}{item.capacity_mrc?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {item.capacity_otc > 0 
                            ? `${item.capacity_otc_currency === 'USD' ? '$' : '৳'}${item.capacity_otc.toLocaleString()}`
                            : '-'
                          }
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {editingKpi === item.delivered_id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={kpiValue}
                                onChange={(e) => setKpiValue(e.target.value)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveKpi(item.delivered_id)}
                                className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <span 
                              className={`font-semibold ${user?.role === 'SuperUser' ? 'text-blue-600 cursor-pointer hover:underline' : 'text-blue-600'}`}
                              onClick={() => user?.role === 'SuperUser' && handleEditKpi(item)}
                              data-testid={`kpi-score-${item.delivered_id}`}
                            >
                              {item.kpi_score || 0}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">{new Date(item.delivered_date).toLocaleDateString()}</td>
                        {user?.role === 'SuperUser' && (
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={() => handleEditKpi(item)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                              data-testid={`edit-kpi-${item.delivered_id}`}
                            >
                              Edit KPI
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delivered from Pipelines (Yes status) */}
        {viewMode === 'pipelines' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 bg-blue-50 border-b">
              <h3 className="font-semibold text-blue-800">
                Pipelines Marked as Delivered (Status: Yes)
              </h3>
              <p className="text-sm text-blue-600">These are pipeline records where delivered status is "Yes"</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="pipelines-table">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MRC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">OTC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conf. Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {deliveredPipelines.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No pipelines marked as delivered yet. Mark pipelines with "Delivered Status: Yes" to see them here.
                      </td>
                    </tr>
                  ) : (
                    deliveredPipelines.map((item) => (
                      <tr key={item.pipeline_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium">{item.serial_number}</td>
                        <td className="px-6 py-4 text-sm">{item.client_name}</td>
                        <td className="px-6 py-4 text-sm">{item.capacity_req} {item.capacity_unit || 'Mbps'}</td>
                        <td className="px-6 py-4 text-sm">
                          {item.capacity_mrc_currency === 'USD' ? '$' : '৳'}{item.capacity_mrc?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {item.capacity_otc > 0 
                            ? `${item.capacity_otc_currency === 'USD' ? '$' : '৳'}${item.capacity_otc.toLocaleString()}`
                            : '-'
                          }
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {item.confirmation_date ? new Date(item.confirmation_date).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Delivered
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Delivered;
