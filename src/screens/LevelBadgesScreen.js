import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import './LevelBadgesScreen.css';

function LevelBadgesScreen() {
  const [levels, setLevels] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    badgeFile: null,
    badgeUrl: '',
  });
  const [editLevelId, setEditLevelId] = useState(null);

  // Fetch levels from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'levels'), (snapshot) => {
      const levelsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLevels(levelsData);
    }, () => {
      toast.error('Error fetching levels. Please try again later.', { autoClose: 3000 });
    });

    return () => unsubscribe();
  }, []);

  const openModal = (level = null) => {
    if (level) {
      setFormData({
        name: level.name || '',
        badgeFile: null,
        badgeUrl: level.badgeUrl || '',
      });
      setEditLevelId(level.id);
    } else {
      setFormData({ name: '', badgeFile: null, badgeUrl: '' });
      setEditLevelId(null);
    }
    setModalOpen(true);
  };

  const handleFileUpload = async (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return reject('No file selected.');

      const storageRef = ref(storage, `levels/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        null,
        (error) => {
          toast.error('Error uploading file!');
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required.', { autoClose: 3000 });
      return;
    }

    try {
      let badgeUrl = formData.badgeUrl;

      if (formData.badgeFile) {
        badgeUrl = await handleFileUpload(formData.badgeFile);
      }

      if (editLevelId) {
        await updateDoc(doc(db, 'levels', editLevelId), {
          name: formData.name,
          badgeUrl: badgeUrl || '',
        });
        toast.success('Level updated successfully!', { autoClose: 3000 });
      } else {
        const levelsSnapshot = await getDocs(collection(db, 'levels'));
        const numericIds = levelsSnapshot.docs.map(doc => parseInt(doc.id)).filter(id => !isNaN(id));
        const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
        const newId = (maxId + 1).toString();

        await setDoc(doc(db, 'levels', newId), {
          name: `Level ${newId}`,
          badgeUrl: badgeUrl || '',
        });

        toast.success('Level added successfully!', { autoClose: 3000 });
      }

      setModalOpen(false);
      setFormData({ name: '', badgeFile: null, badgeUrl: '' });
      setEditLevelId(null);
    } catch {
      toast.error(`Failed to ${editLevelId ? 'update' : 'add'} level. Please try again.`, { autoClose: 3000 });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this level?')) return;

    try {
      await deleteDoc(doc(db, 'levels', id));
      toast.success('Level deleted successfully!', { autoClose: 3000 });
    } catch {
      toast.error('Failed to delete level. Please try again.', { autoClose: 3000 });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, badgeFile: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
                      placeholder="Enter level name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Badge Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleInputChange}
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
          <ToastContainer />
        </div>
      </div>
    </div>
  );
}

export default LevelBadgesScreen;
