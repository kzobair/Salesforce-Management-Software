/**
 * Pipeline Page - Confirmed sales opportunities
 */
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Layout from '@/components/Layout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Pipelines = () => {
  const { user } = useAuth();
  const [pipelines, setPipelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [kamUsers, setKamUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const modalRef = useRef(null);

  // Scroll modal to top when it opens
  useEffect(() => {
    if (showForm && modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [showForm]);

  const [formData, setFormData] = useState({
    client_name: '',
    client_address: '',
    contact_name: '',
    contact_number: '',
    capacity_req: 0,
    capacity_unit: 'Mbps',
    capacity_mrc: 0,
    capacity_mrc_currency: 'BDT',
    capacity_otc: 0,
    capacity_otc_currency: 'BDT',
    other_cap_req: 0,
    other_cap_unit: 'Mbps',
    other_cap_mrc: 0,
    other_cap_mrc_currency: 'BDT',
    other_cap_otc: 0,
    other_cap_otc_currency: 'BDT',
    kam_user_id: user?.user_id || '',
    confirmation_status: 'Pending',
    confirmation_date: '',
    confirmation_notes: '',
    delivered_status: 'Pending'
  });

  useEffect(() => {
    fetchPipelines();
    fetchSummary();
    if (user?.role === 'SuperUser') {
      fetchKamUsers();
    }
  }, [user]);

  const fetchPipelines = async () => {
    try {
      const response = await axios.get(`${API}/pipelines/`);
      setPipelines(response.data);
    } catch (err) {
      setError('Failed to load pipelines');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${API}/pipelines/stats/summary`);
      setSummary(response.data);
    } catch (err) {
      console.error('Failed to load summary', err);
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

    // Format confirmation_date if status is Confirmed
    const submitData = { ...formData };
    if (submitData.confirmation_status === 'Confirmed' && submitData.confirmation_date) {
      submitData.confirmation_date = new Date(submitData.confirmation_date).toISOString();
    } else {
      submitData.confirmation_date = null;
    }

    try {
      if (editingPipeline) {
        await axios.put(`${API}/pipelines/${editingPipeline.pipeline_id}`, submitData);
      } else {
        await axios.post(`${API}/pipelines/`, submitData);
      }
      fetchPipelines();
      fetchSummary();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save pipeline');
    }
  };

  const handleDelete = async (pipelineId) => {
    if (!window.confirm('Are you sure you want to delete this pipeline?')) return;

    try {
      await axios.delete(`${API}/pipelines/${pipelineId}`);
      fetchPipelines();
      fetchSummary();
    } catch (err) {
      setError('Failed to delete pipeline');
    }
  };

  const handleEdit = (pipeline) => {
    setEditingPipeline(pipeline);
    setFormData({
      client_name: pipeline.client_name,
      client_address: pipeline.client_address,
      contact_name: pipeline.contact_name,
      contact_number: pipeline.contact_number,
      capacity_req: pipeline.capacity_req,
      capacity_unit: pipeline.capacity_unit || 'Mbps',
      capacity_mrc: pipeline.capacity_mrc,
      capacity_mrc_currency: pipeline.capacity_mrc_currency || 'BDT',
      capacity_otc: pipeline.capacity_otc || 0,
      capacity_otc_currency: pipeline.capacity_otc_currency || 'BDT',
      other_cap_req: pipeline.other_cap_req || 0,
      other_cap_unit: pipeline.other_cap_unit || 'Mbps',
      other_cap_mrc: pipeline.other_cap_mrc || 0,
      other_cap_mrc_currency: pipeline.other_cap_mrc_currency || 'BDT',
      other_cap_otc: pipeline.other_cap_otc || 0,
      other_cap_otc_currency: pipeline.other_cap_otc_currency || 'BDT',
      kam_user_id: pipeline.kam_user_id,
      confirmation_status: pipeline.confirmation_status,
      confirmation_date: pipeline.confirmation_date ? new Date(pipeline.confirmation_date).toISOString().split('T')[0] : '',
      confirmation_notes: pipeline.confirmation_notes || '',
      delivered_status: pipeline.delivered_status || 'Pending'
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      client_name: '',
      client_address: '',
      contact_name: '',
      contact_number: '',
      capacity_req: 0,
      capacity_unit: 'Mbps',
      capacity_mrc: 0,
      capacity_mrc_currency: 'BDT',
      capacity_otc: 0,
      capacity_otc_currency: 'BDT',
      other_cap_req: 0,
      other_cap_unit: 'Mbps',
      other_cap_mrc: 0,
      other_cap_mrc_currency: 'BDT',
      other_cap_otc: 0,
      other_cap_otc_currency: 'BDT',
      kam_user_id: user?.user_id || '',
      confirmation_status: 'Pending',
      confirmation_date: '',
      confirmation_notes: '',
      delivered_status: 'Pending'
    });
    setEditingPipeline(null);
    setShowForm(false);
  };

  const filteredPipelines = pipelines.filter(pipeline =>
    pipeline.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pipeline.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pipeline (Confirmed Only)</h1>
            <p className="text-gray-600 mt-1">Track confirmed sales opportunities</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            data-testid="add-pipeline-btn"
          >
            + Add Pipeline
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-600">Total Pipeline Count</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{summary.total_count}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-600">Total Capacity</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{summary.total_capacity_requirement}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-600">Total MRC</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">৳{summary.total_capacity_mrc.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <input
            type="text"
            placeholder="Search by client name or contact name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Pipeline Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowForm(false)}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col">
              <div className="p-6 border-b sticky top-0 bg-white rounded-t-lg">
                <h2 className="text-2xl font-bold">
                  {editingPipeline ? 'Edit Pipeline' : 'Add New Pipeline'}
                </h2>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                <form onSubmit={handleSubmit} className="space-y-4" id="pipeline-form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                      <input type="text" required value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" data-testid="client-name-input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
                      <input type="text" required value={formData.contact_name} onChange={(e) => setFormData({...formData, contact_name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" data-testid="contact-name-input" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Address *</label>
                    <input type="text" required value={formData.client_address} onChange={(e) => setFormData({...formData, client_address: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number *</label>
                    <input type="tel" required value={formData.contact_number} onChange={(e) => setFormData({...formData, contact_number: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>

                  {/* Primary Capacity Section */}
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Primary Capacity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacity Req *</label>
                        <div className="flex gap-2">
                          <input type="number" required min="0" step="0.01" value={formData.capacity_req} onChange={(e) => setFormData({...formData, capacity_req: parseFloat(e.target.value)})} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                          <select value={formData.capacity_unit} onChange={(e) => setFormData({...formData, capacity_unit: e.target.value})} className="w-24 px-2 py-2 border border-gray-300 rounded-lg">
                            <option value="Mbps">Mbps</option>
                            <option value="Gbps">Gbps</option>
                            <option value="IPLC">IPLC</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">MRC *</label>
                        <div className="flex gap-2">
                          <input type="number" required min="0" step="0.01" value={formData.capacity_mrc} onChange={(e) => setFormData({...formData, capacity_mrc: parseFloat(e.target.value)})} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                          <select value={formData.capacity_mrc_currency} onChange={(e) => setFormData({...formData, capacity_mrc_currency: e.target.value})} className="w-20 px-2 py-2 border border-gray-300 rounded-lg">
                            <option value="BDT">BDT</option>
                            <option value="USD">USD</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">OTC</label>
                        <div className="flex gap-2">
                          <input type="number" min="0" step="0.01" value={formData.capacity_otc} onChange={(e) => setFormData({...formData, capacity_otc: parseFloat(e.target.value)})} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                          <select value={formData.capacity_otc_currency} onChange={(e) => setFormData({...formData, capacity_otc_currency: e.target.value})} className="w-20 px-2 py-2 border border-gray-300 rounded-lg">
                            <option value="BDT">BDT</option>
                            <option value="USD">USD</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Other Capacity Section */}
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Other Capacity (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Capacity Req</label>
                        <div className="flex gap-2">
                          <input type="number" min="0" step="0.01" value={formData.other_cap_req} onChange={(e) => setFormData({...formData, other_cap_req: parseFloat(e.target.value)})} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                          <select value={formData.other_cap_unit} onChange={(e) => setFormData({...formData, other_cap_unit: e.target.value})} className="w-24 px-2 py-2 border border-gray-300 rounded-lg">
                            <option value="Mbps">Mbps</option>
                            <option value="Gbps">Gbps</option>
                            <option value="IPLC">IPLC</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">MRC</label>
                        <div className="flex gap-2">
                          <input type="number" min="0" step="0.01" value={formData.other_cap_mrc} onChange={(e) => setFormData({...formData, other_cap_mrc: parseFloat(e.target.value)})} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                          <select value={formData.other_cap_mrc_currency} onChange={(e) => setFormData({...formData, other_cap_mrc_currency: e.target.value})} className="w-20 px-2 py-2 border border-gray-300 rounded-lg">
                            <option value="BDT">BDT</option>
                            <option value="USD">USD</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">OTC</label>
                        <div className="flex gap-2">
                          <input type="number" min="0" step="0.01" value={formData.other_cap_otc} onChange={(e) => setFormData({...formData, other_cap_otc: parseFloat(e.target.value)})} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg" />
                          <select value={formData.other_cap_otc_currency} onChange={(e) => setFormData({...formData, other_cap_otc_currency: e.target.value})} className="w-20 px-2 py-2 border border-gray-300 rounded-lg">
                            <option value="BDT">BDT</option>
                            <option value="USD">USD</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {user?.role === 'SuperUser' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Key Account Manager *</label>
                      <select required value={formData.kam_user_id} onChange={(e) => setFormData({...formData, kam_user_id: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select KAM</option>
                        {kamUsers.map((kam) => (<option key={kam.user_id} value={kam.user_id}>{kam.name}</option>))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation Status *</label>
                      <select required value={formData.confirmation_status} onChange={(e) => setFormData({...formData, confirmation_status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmation Date {formData.confirmation_status === 'Confirmed' && '*'}
                      </label>
                      <input type="date" required={formData.confirmation_status === 'Confirmed'} value={formData.confirmation_date} onChange={(e) => setFormData({...formData, confirmation_date: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivered Status *</label>
                    <select required value={formData.delivered_status} onChange={(e) => setFormData({...formData, delivered_status: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="Pending">Pending</option>
                      <option value="In Process">In Process</option>
                      <option value="Yes">Yes (Delivered)</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmation Notes</label>
                    <textarea rows="3" value={formData.confirmation_notes} onChange={(e) => setFormData({...formData, confirmation_notes: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Additional notes about the confirmation..." />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                      {editingPipeline ? 'Update Pipeline' : 'Add Pipeline'}
                    </button>
                    <button type="button" onClick={resetForm} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Pipelines List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRC</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conf. Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPipelines.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                      No confirmed pipelines found. Click "Add Pipeline" to create your first pipeline record.
                    </td>
                  </tr>
                ) : (
                  filteredPipelines.map((pipeline) => (
                    <tr key={pipeline.pipeline_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pipeline.serial_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pipeline.client_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pipeline.contact_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pipeline.capacity_req} {pipeline.capacity_unit || 'Mbps'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pipeline.capacity_mrc_currency === 'USD' ? '$' : '৳'}{pipeline.capacity_mrc.toLocaleString()}
                        {pipeline.capacity_otc > 0 && (
                          <span className="text-xs text-gray-400 ml-1">+{pipeline.capacity_otc_currency === 'USD' ? '$' : '৳'}{pipeline.capacity_otc} OTC</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${pipeline.confirmation_status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {pipeline.confirmation_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          pipeline.delivered_status === 'Yes' ? 'bg-blue-100 text-blue-800' :
                          pipeline.delivered_status === 'In Process' ? 'bg-purple-100 text-purple-800' :
                          pipeline.delivered_status === 'No' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {pipeline.delivered_status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pipeline.confirmation_date ? new Date(pipeline.confirmation_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button onClick={() => handleEdit(pipeline)} className="text-blue-600 hover:text-blue-900">Edit</button>
                        <button onClick={() => handleDelete(pipeline.pipeline_id)} className="text-red-600 hover:text-red-900">Delete</button>
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

export default Pipelines;
