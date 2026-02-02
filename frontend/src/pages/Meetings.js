/**
 * Meetings Page - List and manage client meetings
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import Layout from '../components/Layout';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Meetings = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [kamUsers, setKamUsers] = useState([]);

  const [formData, setFormData] = useState({
    client_name: '',
    client_address: '',
    contact_name: '',
    contact_number: '',
    capacity_req: 0,
    capacity_mrc: 0,
    other_cap_req: 0,
    other_cap_mrc: 0,
    kam_user_id: user?.user_id || '',
    meeting_minutes: ''
  });

  useEffect(() => {
    fetchMeetings();
    if (user?.role === 'SuperUser') {
      fetchKamUsers();
    }
  }, [user]);

  const fetchMeetings = async () => {
    try {
      const response = await axios.get(`${API}/meetings/`);
      setMeetings(response.data);
    } catch (err) {
      setError('Failed to load meetings');
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
      if (editingMeeting) {
        await axios.put(`${API}/meetings/${editingMeeting.meeting_id}`, formData);
      } else {
        await axios.post(`${API}/meetings/`, formData);
      }
      fetchMeetings();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save meeting');
    }
  };

  const handleDelete = async (meetingId) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) return;

    try {
      await axios.delete(`${API}/meetings/${meetingId}`);
      fetchMeetings();
    } catch (err) {
      setError('Failed to delete meeting');
    }
  };

  const handleEdit = (meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      client_name: meeting.client_name,
      client_address: meeting.client_address,
      contact_name: meeting.contact_name,
      contact_number: meeting.contact_number,
      capacity_req: meeting.capacity_req,
      capacity_mrc: meeting.capacity_mrc,
      other_cap_req: meeting.other_cap_req || 0,
      other_cap_mrc: meeting.other_cap_mrc || 0,
      kam_user_id: meeting.kam_user_id,
      meeting_minutes: meeting.meeting_minutes
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
      capacity_mrc: 0,
      other_cap_req: 0,
      other_cap_mrc: 0,
      kam_user_id: user?.user_id || '',
      meeting_minutes: ''
    });
    setEditingMeeting(null);
    setShowForm(false);
  };

  const filteredMeetings = meetings.filter(meeting =>
    meeting.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-3xl font-bold text-gray-900">Meeting Records</h1>
            <p className="text-gray-600 mt-1">Track all client meetings and interactions</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            data-testid="add-meeting-btn"
          >
            + Add Meeting
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
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

        {/* Meeting Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {editingMeeting ? 'Edit Meeting' : 'Add New Meeting'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.client_name}
                        onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.contact_name}
                        onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.client_address}
                      onChange={(e) => setFormData({...formData, client_address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.contact_number}
                      onChange={(e) => setFormData({...formData, contact_number: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacity Requirement *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.capacity_req}
                        onChange={(e) => setFormData({...formData, capacity_req: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacity MRC *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.capacity_mrc}
                        onChange={(e) => setFormData({...formData, capacity_mrc: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Other Capacity Requirement
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.other_cap_req}
                        onChange={(e) => setFormData({...formData, other_cap_req: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Other Capacity MRC
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.other_cap_mrc}
                        onChange={(e) => setFormData({...formData, other_cap_mrc: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {user?.role === 'SuperUser' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Key Account Manager *
                      </label>
                      <select
                        required
                        value={formData.kam_user_id}
                        onChange={(e) => setFormData({...formData, kam_user_id: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select KAM</option>
                        {kamUsers.map((kam) => (
                          <option key={kam.user_id} value={kam.user_id}>
                            {kam.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meeting Minutes *
                    </label>
                    <textarea
                      required
                      rows="4"
                      value={formData.meeting_minutes}
                      onChange={(e) => setFormData({...formData, meeting_minutes: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Detailed notes from the meeting..."
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      {editingMeeting ? 'Update Meeting' : 'Add Meeting'}
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

        {/* Meetings List */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMeetings.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No meetings found. Click "Add Meeting" to create your first meeting record.
                    </td>
                  </tr>
                ) : (
                  filteredMeetings.map((meeting) => (
                    <tr key={meeting.meeting_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {meeting.serial_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {meeting.client_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {meeting.contact_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {meeting.capacity_req}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ৳{meeting.capacity_mrc.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(meeting.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(meeting)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(meeting.meeting_id)}
                          className="text-red-600 hover:text-red-900"
                        >
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

export default Meetings;
