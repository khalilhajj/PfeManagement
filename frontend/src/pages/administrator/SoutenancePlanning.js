import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { getSoutenances, createSoutenance, updateSoutenance, deleteSoutenance, getSoutenanceCandidates, getTeachersList, getAvailableRooms } from '../../api';
import './SoutenancePlanning.css';
import { FaCalendarAlt, FaClock, FaDoorOpen, FaChalkboardTeacher, FaUserGraduate, FaSearch, FaPlus, FaCheckCircle, FaHourglassHalf, FaEdit, FaTrash } from 'react-icons/fa';

const SoutenancePlanning = () => {
    const [soutenances, setSoutenances] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // Form
    const [candidateSearch, setCandidateSearch] = useState('');
    const [formData, setFormData] = useState({
        internship_id: '',
        date: '',
        time: '',
        room: '',
        jury1: '',
        jury2: ''
    });
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [sData, tData, cData, rData] = await Promise.all([
                getSoutenances(),
                getTeachersList(),
                getSoutenanceCandidates(),
                getAvailableRooms()
            ]);
            setSoutenances(sData);
            setTeachers(tData);
            setCandidates(cData);
            setRooms(rData);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (soutenance) => {
        setEditMode(true);
        setSelectedId(soutenance.id);
        setFormData({
            internship_id: soutenance.internship, // Assuming serializer returns ID. Note: list view returns names. We might need the ID from the s object if available.
            // Check serializer: id, date, time, room, internship (ID), juries (List of objects or IDs?)
            // If API returns detailed objects, we might need to map or store IDs. 
            // NOTE: The list view serializer often returns nested data. 
            // I'll assume I need to manually set these or fetching Detail is safer. 
            // For now, let's look at what `s` has from `getSoutenances`.
            // The console log would help, but I'll assume standard serializer fields: internship (id), juries (list of objects).
            // Actually, my list view serializer likely returns strings for names. 
            // I should verify `SoutenanceSerializer`. 
            // Strategy: I will blindly populate what I can, or better: fetch detail on Edit.
            date: soutenance.date,
            time: soutenance.time,
            room: typeof soutenance.room === 'object' ? soutenance.room?.id : soutenance.room,
            // We need to map jury objects back to IDs if they are objects
            jury1: soutenance.juries[0]?.id || '', 
            jury2: soutenance.juries[1]?.id || ''
        });
        // We also need to set internship_id. If serializer returns object, take id.
        setFormData(prev => ({
           ...prev,
           internship_id: typeof soutenance.internship === 'object' ? soutenance.internship.id : soutenance.internship
        }));
        
        setShowModal(true);
    };
    
    const handleDeleteClick = (id) => {
        setSelectedId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteSoutenance(selectedId);
            setSuccess('Soutenance deleted successfully');
            setShowDeleteModal(false);
            fetchData();
        } catch (err) {
            setError('Failed to delete soutenance');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        try {
            const payload = {
                internship: formData.internship_id,
                date: formData.date,
                time: formData.time,
                room: formData.room,
                jury_ids: [parseInt(formData.jury1), parseInt(formData.jury2)]
            };
            
            if (editMode) {
                await updateSoutenance(selectedId, payload);
                setSuccess('Soutenance updated successfully!');
            } else {
                await createSoutenance(payload);
                setSuccess('Soutenance planned successfully!');
            }
            
            setShowModal(false);
            setFormData({ internship_id: '', date: '', time: '', room: '', jury1: '', jury2: '' });
            setCandidateSearch('');
            setEditMode(false);
            fetchData();
        } catch (err) {
            setError('Failed to save soutenance. Ensure date is future and jurors are unique.');
        }
    };

    // Calculate Stats
    const stats = {
        total: soutenances.length,
        planned: soutenances.filter(s => s.status === 'Planned').length,
        done: soutenances.filter(s => s.status === 'Done').length
    };

    // Filter Data
    const filteredSoutenances = soutenances.filter(s => {
        const matchesSearch = s.student_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              s.internship_title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || s.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="soutenance-planning-container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1><FaUserGraduate /> Soutenance Planning</h1>
                    <p>Manage defense schedules and juries</p>
                </div>
                <button className="btn-primary" onClick={() => {
                    setEditMode(false);
                    setFormData({ internship_id: '', date: '', time: '', room: '', jury1: '', jury2: '' });
                    setShowModal(true);
                }}>
                    <FaPlus /> Plan New Soutenance
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card stat-total">
                    <div className="stat-icon"><FaCalendarAlt /></div>
                    <div className="stat-content">
                        <h3>{stats.total}</h3>
                        <p>Total Defenses</p>
                    </div>
                </div>
                <div className="stat-card stat-planned">
                    <div className="stat-icon"><FaHourglassHalf /></div>
                    <div className="stat-content">
                        <h3>{stats.planned}</h3>
                        <p>Planned</p>
                    </div>
                </div>
                <div className="stat-card stat-done">
                    <div className="stat-icon"><FaCheckCircle /></div>
                    <div className="stat-content">
                        <h3>{stats.done}</h3>
                        <p>Completed</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <FaSearch />
                    <input 
                        type="text" 
                        placeholder="Search by student, title..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Form.Select 
                    style={{width: '200px'}} 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="Planned">Planned</option>
                    <option value="Done">Done</option>
                </Form.Select>
            </div>

            {/* Table */}
            <div className="table-container">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Student</th>
                            <th>Title</th>
                            <th>Date & Time</th>
                            <th>Room</th>
                            <th>Jury Members</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSoutenances.length > 0 ? (
                            filteredSoutenances.map(s => (
                                <tr key={s.id}>
                                    <td>
                                        <strong>{s.student_name}</strong>
                                    </td>
                                    <td>{s.internship_title}</td>
                                    <td>
                                        <div><FaCalendarAlt /> {s.date}</div>
                                        <div className="text-muted"><FaClock /> {s.time}</div>
                                    </td>
                                    <td><FaDoorOpen /> {s.room_display || 'Not assigned'}</td>
                                    <td>
                                        {s.juries.map(j => (
                                            <div key={j.id}><FaChalkboardTeacher /> {j.member_name}</div>
                                        ))}
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${s.status.toLowerCase()}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn-icon btn-edit" onClick={() => handleEdit(s)}>
                                                <FaEdit />
                                            </button>
                                            <button className="btn-icon btn-delete" onClick={() => handleDeleteClick(s.id)}>
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center p-5 text-muted">No soutenances found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editMode ? <><FaEdit /> Edit Soutenance</> : <><FaPlus /> Plan New Soutenance</>}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Student Candidate</Form.Label>
                            {!editMode ? (
                                <>
                                    <Form.Control 
                                        type="text"
                                        placeholder="Type to filter candidates..."
                                        value={candidateSearch}
                                        onChange={(e) => setCandidateSearch(e.target.value)}
                                        className="mb-2"
                                    />
                                    <Form.Select 
                                        value={formData.internship_id}
                                        onChange={e => setFormData({...formData, internship_id: e.target.value})}
                                        required
                                    >
                                        <option value="">-- Select Candidate --</option>
                                        {candidates
                                            .filter(c => c.student_name.toLowerCase().includes(candidateSearch.toLowerCase()))
                                            .map(c => (
                                                <option key={c.id} value={c.id}>{c.student_name} - {c.title}</option>
                                            ))
                                        }
                                    </Form.Select>
                                </>
                            ) : (
                                <Form.Control 
                                    type="text" 
                                    value="Warning: Changing student/internship is not supported in Edit mode for safety." 
                                    disabled 
                                    className="text-muted"
                                />
                            )}
                        </Form.Group>

                        <div className="row">
                            <div className="col-md-4">
                                <Form.Group className="mb-3">
                                    <Form.Label>Date</Form.Label>
                                    <Form.Control type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                                </Form.Group>
                            </div>
                            <div className="col-md-4">
                                <Form.Group className="mb-3">
                                    <Form.Label>Time</Form.Label>
                                    <Form.Control type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                                </Form.Group>
                            </div>
                            <div className="col-md-4">
                                <Form.Group className="mb-3">
                                    <Form.Label>Room</Form.Label>
                                    <Form.Select 
                                        required 
                                        value={formData.room} 
                                        onChange={e => setFormData({...formData, room: e.target.value})}
                                    >
                                        <option value="">-- Select Room --</option>
                                        {rooms.map(r => (
                                            <option key={r.id} value={r.id}>
                                                {r.building ? `${r.name} - ${r.building}` : r.name} ({r.capacity} seats)
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Jury President</Form.Label>
                                    <Form.Select required value={formData.jury1} onChange={e => setFormData({...formData, jury1: e.target.value})}>
                                        <option value="">Select Teacher</option>
                                        {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Jury Member</Form.Label>
                                    <Form.Select required value={formData.jury2} onChange={e => setFormData({...formData, jury2: e.target.value})}>
                                        <option value="">Select Teacher</option>
                                        {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button type="submit" className="btn-primary">{editMode ? 'Update Plan' : 'Save Plan'}</button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this soutenance planning? This action cannot be undone, and the student will be notified.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default SoutenancePlanning;
