/**
 * KPI Assignments Page - Super User only
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Layout from '@/components/Layout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const KPIAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [kamUsers, setKamUsers] = useState([]);

  const [formData, setFormData] = useState({
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
    kam_user_id: '',
    revenue_target: 0,
    capacity_target: 0,
    kpi_score_target: 0,
    notes: ''
  });

  useEffect(() => {
    fetchAssignments();
    fetchKamUsers();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(`${API}/kpi-assignments/`);
      setAssignments(response.data);
    } catch (err) {
      setError('Failed to load KPI assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchKamUsers = async () => {
    try {
      const response = await axios.get(`${API}/users/kams`);
      setKamUsers(response.data);
    } catch (err) {
      console.error('Failed to load KAM users', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingAssignment) {
        await axios.put(`${API}/kpi-assignments/${editingAssignment.assignment_id}`, formData);
      } else {
        await axios.post(`${API}/kpi-assignments/`, formData);
      }
      fetchAssignments();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save KPI assignment');
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this KPI assignment?')) return;

    try {
      await axios.delete(`${API}/kpi-assignments/${assignmentId}`);
      fetchAssignments();
    } catch (err) {
      setError('Failed to delete KPI assignment');
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      month: assignment.month,
      kam_user_id: assignment.kam_user_id,
      revenue_target: assignment.revenue_target,
      capacity_target: assignment.capacity_target,
      kpi_score_target: assignment.kpi_score_target || 0,
      notes: assignment.notes || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      month: new Date().toISOString().slice(0, 7),
      kam_user_id: '',
      revenue_target: 0,
      capacity_target: 0,
      kpi_score_target: 0,
      notes: ''
    });
    setEditingAssignment(null);
    setShowForm(false);
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">KPI Assignments</h1>
            <p className="text-gray-600 mt-1">Assign monthly targets to Key Account Managers</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            data-testid="assign-kpi-btn"
          >
            + Assign KPI
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* KPI Assignment Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {editingAssignment ? 'Edit KPI Assignment' : 'Assign KPI Targets'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Month (YYYY-MM) *</label>
                      <input
                        type="month"
                        required
                        value={formData.month}
                        onChange={(e) => setFormData({...formData, month: e.target.value})}
                        disabled={!!editingAssignment}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Key Account Manager *</label>
                      <select
                        required
                        value={formData.kam_user_id}
                        onChange={(e) => setFormData({...formData, kam_user_id: e.target.value})}
                        disabled={!!editingAssignment}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      >
                        <option value="">Select KAM</option>
                        {kamUsers.map((kam) => (
                          <option key={kam.user_id} value={kam.user_id}>{kam.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Revenue Target *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.revenue_target}
                        onChange={(e) => setFormData({...formData, revenue_target: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 500000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacity Target *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.capacity_target}
                        onChange={(e) => setFormData({...formData, capacity_target: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 1000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">KPI Score Target *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.kpi_score_target}
                        onChange={(e) => setFormData({...formData, kpi_score_target: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      rows="3"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Additional notes or focus areas..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      {editingAssignment ? 'Update Assignment' : 'Assign KPI'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Assignments List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">KAM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue Target</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity Target</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assignments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No KPI assignments yet. Click "Assign KPI" to create monthly targets for KAMs.
                    </td>
                  </tr>
                ) : (
                  assignments.map((assignment) => (
                    <tr key={assignment.assignment_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium">{assignment.serial_number}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-blue-600">{assignment.month}</td>
                      <td className="px-6 py-4 text-sm">
                        {kamUsers.find(k => k.user_id === assignment.kam_user_id)?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm">৳{assignment.revenue_target.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">{assignment.capacity_target}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{assignment.notes || '-'}</td>
                      <td className="px-6 py-4 text-sm font-medium space-x-2">
                        <button onClick={() => handleEdit(assignment)} className="text-blue-600 hover:text-blue-900">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(assignment.assignment_id)} className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
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

export default KPIAssignments;
