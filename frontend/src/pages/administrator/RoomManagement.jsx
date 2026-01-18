import React, { useState, useEffect } from 'react';
import './RoomManagement.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomToDelete, setRoomToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    building: '',
    capacity: '',
    floor: '',
    equipment: '',
    is_available: true
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/administrator/rooms/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      } else {
        setError('Failed to load rooms');
      }
    } catch (err) {
      setError('Error loading rooms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openCreateModal = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      building: '',
      capacity: '',
      floor: '',
      equipment: '',
      is_available: true
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      building: room.building || '',
      capacity: room.capacity,
      floor: room.floor || '',
      equipment: room.equipment || '',
      is_available: room.is_available
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('accessToken');
      const url = editingRoom 
        ? `${API_BASE_URL}/administrator/rooms/${editingRoom.id}/update/`
        : `${API_BASE_URL}/administrator/rooms/create/`;
      
      const response = await fetch(url, {
        method: editingRoom ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessMessage(result.message || `Room ${editingRoom ? 'updated' : 'created'} successfully!`);
        await fetchRooms();
        setShowModal(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || Object.values(errorData).flat().join(', '));
      }
    } catch (err) {
      setError('Failed to save room');
      console.error(err);
    }
  };

  const openDeleteModal = (room) => {
    setRoomToDelete(room);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!roomToDelete) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/administrator/rooms/${roomToDelete.id}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSuccessMessage('Room deleted successfully!');
        await fetchRooms();
        setShowDeleteModal(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete room');
      }
    } catch (err) {
      setError('Error deleting room');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="room-management-container">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="room-management-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1><i className="fas fa-door-open"></i> Room Management</h1>
          <p>Manage available rooms for soutenances</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <i className="fas fa-plus"></i> Add New Room
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {successMessage}
        </div>
      )}

      {/* Rooms Grid */}
      <div className="rooms-grid">
        {rooms.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-door-open"></i>
            <h3>No Rooms Yet</h3>
            <p>Add your first room to get started</p>
            <button className="btn btn-primary" onClick={openCreateModal}>
              <i className="fas fa-plus"></i> Add Room
            </button>
          </div>
        ) : (
          rooms.map(room => (
            <div key={room.id} className={`room-card ${!room.is_available ? 'unavailable' : ''}`}>
              <div className="room-card-header">
                <h3><i className="fas fa-door-open"></i> {room.name}</h3>
                <span className={`badge ${room.is_available ? 'badge-available' : 'badge-unavailable'}`}>
                  {room.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>

              <div className="room-card-body">
                {room.building && (
                  <p><i className="fas fa-building"></i> <strong>Building:</strong> {room.building}</p>
                )}
                <p><i className="fas fa-users"></i> <strong>Capacity:</strong> {room.capacity} people</p>
                {room.floor && (
                  <p><i className="fas fa-layer-group"></i> <strong>Floor:</strong> {room.floor}</p>
                )}
                {room.equipment && (
                  <div className="equipment-section">
                    <p><strong><i className="fas fa-tools"></i> Equipment:</strong></p>
                    <p className="equipment-text">{room.equipment}</p>
                  </div>
                )}
              </div>

              <div className="room-card-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(room)}>
                  <i className="fas fa-edit"></i> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => openDeleteModal(room)}>
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <i className="fas fa-door-open"></i> {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-error">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Room Name <span className="required">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Room 101"
                    />
                  </div>

                  <div className="form-group">
                    <label>Building</label>
                    <input
                      type="text"
                      name="building"
                      value={formData.building}
                      onChange={handleInputChange}
                      placeholder="e.g., Building A"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Capacity <span className="required">*</span></label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      required
                      min="1"
                      placeholder="Max number of people"
                    />
                  </div>

                  <div className="form-group">
                    <label>Floor</label>
                    <input
                      type="text"
                      name="floor"
                      value={formData.floor}
                      onChange={handleInputChange}
                      placeholder="e.g., 1st Floor"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Equipment</label>
                  <textarea
                    name="equipment"
                    value={formData.equipment}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="e.g., Projector, Computer, Whiteboard"
                  />
                  <small>List available equipment in this room</small>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_available"
                      checked={formData.is_available}
                      onChange={handleInputChange}
                    />
                    <span>Room is available</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-save"></i> {editingRoom ? 'Update Room' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && roomToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-exclamation-triangle" style={{ color: '#dc3545' }}></i> Delete Room</h2>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <p style={{ marginBottom: '15px', fontSize: '1.05rem' }}>
                Are you sure you want to delete <strong>"{roomToDelete.name}"</strong>?
              </p>
              <p style={{ color: '#dc3545', marginBottom: '0' }}>
                <i className="fas fa-info-circle"></i> This action cannot be undone.
              </p>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete}>
                <i className="fas fa-trash"></i> Delete Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManagement;
