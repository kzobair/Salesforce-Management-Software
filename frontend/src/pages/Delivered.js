/**
 * Delivered Page - Track delivered clients with KPI
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
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchDelivered();
    fetchSummary();
  }, []);

  const fetchDelivered = async () => {
    try {
      const response = await axios.get(`${API}/delivered/`);
      setDelivered(response.data);
    } catch (err) {
      console.error('Failed to load delivered records', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${API}/delivered/stats/summary`);
      setSummary(response.data);
    } catch (err) {
      console.error('Failed to load summary', err);
    }
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Delivered Clients</h1>
          <p className="text-gray-600 mt-1">Track delivered clients with KPI values</p>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-600">Total Delivered</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{summary.total_count}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-600">Total Capacity</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{summary.total_capacity_delivered}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">৳{summary.total_revenue.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-600">Total KPI</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{summary.total_kpi_achievement}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MRC</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">KPI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {delivered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No delivered clients yet. Delivered clients will appear here.
                    </td>
                  </tr>
                ) : (
                  delivered.map((item) => (
                    <tr key={item.delivered_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">{item.serial_number}</td>
                      <td className="px-6 py-4 text-sm">{item.client_name}</td>
                      <td className="px-6 py-4 text-sm">{item.capacity_req}</td>
                      <td className="px-6 py-4 text-sm">৳{item.capacity_mrc.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-blue-600">{item.kpi_value}</td>
                      <td className="px-6 py-4 text-sm">{new Date(item.delivered_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {item.delivered_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Delivered;
