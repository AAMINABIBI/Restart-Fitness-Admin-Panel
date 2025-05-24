import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import './LevelBadgesScreen.css';

function LevelBadgesScreen() {
  const [levels, setLevels] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    badgeUrl: '',
  });
  const [editLevelId, setEditLevelId] = useState(null);

  // Fetch levels from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'levels'), (snapshot) => {
      const levelsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLevels(levelsData);
    }, (error) => {
      toast.error('Error fetching levels. Please try again later.');
    });

    return () => unsubscribe();
  }, []);

  const openModal = (level = null) => {
    if (level) {
      setFormData({
        name: level.name || '',
        badgeUrl: level.badgeUrl || '',
      });
      setEditLevelId(level.id);
    } else {
      setFormData({ name: '', badgeUrl: '' });
      setEditLevelId(null);
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required.');
      return;
    }

    try {
      if (editLevelId) {
        await updateDoc(doc(db, 'levels', editLevelId), {
          name: formData.name,
          badgeUrl: formData.badgeUrl || '',
        });
        toast.success('Level updated successfully!');
      } else {
        const levelsSnapshot = await getDocs(collection(db, 'levels'));
        const numericIds = levelsSnapshot.docs
          .map(doc => parseInt(doc.id))
          .filter(id => !isNaN(id));
        const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
        const newId = (maxId + 1).toString();
        await setDoc(doc(db, 'levels', newId), {
          name: `Level ${newId}`,
          badgeUrl: formData.badgeUrl || '',
        });
        toast.success('Level added successfully!');
      }
      setModalOpen(false);
      setFormData({ name: '', badgeUrl: '' });
      setEditLevelId(null);
    } catch (error) {
      toast.error(`Failed to ${editLevelId ? 'update' : 'add'} level. Please try again.`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this level?')) return;

    try {
      await deleteDoc(doc(db, 'levels', id));
      toast.success('Level deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete level. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="level-badges-screen-container">
      <div className="side-bar-container">
        <SideBar />
      </div>
      <div className="main-content">
        <TopBar />
        <div className="level-badges-section">
          <h2>Levels Management</h2>
          <button className="add-button" onClick={() => openModal()}>
            <FaPlus /> Add Level
          </button>
          <table className="level-badges-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Badge</th>
                <th>Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {levels.map((level) => (
                <tr key={level.id}>
                  <td>{level.name || 'Unnamed Level'}</td>
                  <td>
                    {level.badgeUrl ? (
                      <img src={level.badgeUrl} alt={level.name || 'Badge Image'} className="badge-image" />
                    ) : (
                      'No Badge'
                    )}
                  </td>
                  <td>
                    <FaEdit className="edit-icon" onClick={() => openModal(level)} />
                  </td>
                  <td>
                    <FaTrash className="delete-icon" onClick={() => handleDelete(level.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {modalOpen && (
            <div className="modal">
              <div className="modal-content">
                <h3>{editLevelId ? 'Edit Level' : 'Add New Level'}</h3>
                <div className="modal-form">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter level name (e.g., Level 1)"
                    />
                  </div>
                  <div className="form-group">
                    <label>Badge URL</label>
                    <input
                      type="text"
                      name="badgeUrl"
                      value={formData.badgeUrl}
                      onChange={handleInputChange}
                      placeholder="Enter badge URL"
                    />
                  </div>
                </div>
                <div className="modal-buttons">
                  <button onClick={handleSave}>{editLevelId ? 'Update' : 'Save'}</button>
                  <button onClick={() => setModalOpen(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LevelBadgesScreen;