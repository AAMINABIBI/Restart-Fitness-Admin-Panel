import React, { useState } from 'react';
import Modal from 'react-modal';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import './AddEquipmentModal.css';

const AddEquipmentModal = ({ isOpen, onClose, onAddEquipment }) => {
  const [equipment, setEquipment] = useState({
    id: '',
    name: '',
    weight: '',
    weightUnit: 'kg',
    iconUrl: null,
    description: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEquipment({ ...equipment, [name]: value });
  };

  const handleFileChange = (e) => {
    setEquipment({ ...equipment, iconUrl: e.target.files[0] });
  };

  const handleSubmit = async () => {
    try {
      let iconUrl = equipment.iconUrl;
      if (equipment.iconUrl instanceof File) {
        const iconRef = ref(storage, `equipments/icons/${Date.now()}_${equipment.iconUrl.name}`);
        const uploadTask = uploadBytesResumable(iconRef, equipment.iconUrl);
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            null,
            (error) => reject(error),
            async () => {
              iconUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }
      const newEquipment = {
        id: Date.now().toString(),
        name: equipment.name,
        weight: equipment.weight ? parseFloat(equipment.weight) : null,
        weightUnit: equipment.weight ? equipment.weightUnit : null,
        iconUrl: iconUrl || '',
        description: equipment.description,
      };
      onAddEquipment(newEquipment);
      onClose();
      setEquipment({ id: '', name: '', weight: '', weightUnit: 'kg', iconUrl: null, description: '' });
    } catch (err) {
      console.error('Error uploading equipment icon:', err.message);
      alert('Failed to upload equipment icon. Please try again.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Add Equipment Modal"
      style={{
        overlay: { zIndex: 1000 },
        content: { zIndex: 1001 },
      }}
    >
      <h2>Add Equipment</h2>
      <div>
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={equipment.name}
          onChange={handleInputChange}
          placeholder="Dumbbell"
          required
        />
      </div>
      <div>
        <label>Weight</label>
        <input
          type="number"
          name="weight"
          value={equipment.weight}
          onChange={handleInputChange}
          placeholder="10"
        />
      </div>
      <div>
        <label>Weight Unit</label>
        <select
          name="weightUnit"
          value={equipment.weightUnit}
          onChange={handleInputChange}
          disabled={!equipment.weight}
        >
          <option value="kg">kg</option>
          <option value="lbs">lbs</option>
        </select>
      </div>
      <div>
        <label>Icon</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      <div>
        <label>Description</label>
        <textarea
          name="description"
          value={equipment.description}
          onChange={handleInputChange}
          placeholder="Describe the equipment"
          rows="3"
        />
      </div>
      <div className="button-group">
        <button onClick={handleSubmit}>Add Equipment</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
};

export default AddEquipmentModal;