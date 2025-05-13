import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './ChapterModal.css';

const ChapterModal = ({ isOpen, onClose, onAddChapter }) => {
  const [chapter, setChapter] = useState({
    title: '',
    startTime: '',
    endTime: '',
    description: '',
  });

  useEffect(() => {
    console.log('ChapterModal isOpen:', isOpen);
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setChapter({ ...chapter, [name]: value });
  };

  const handleSubmit = () => {
    const newChapter = {
      title: chapter.title,
      startTime: parseInt(chapter.startTime) || 0,
      endTime: parseInt(chapter.endTime) || 0,
      description: chapter.description,
    };
    onAddChapter(newChapter);
    onClose();
    setChapter({ title: '', startTime: '', endTime: '', description: '' });
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Add Chapter Modal"
      style={{
        overlay: { zIndex: 1000 },
        content: { zIndex: 1001 },
      }}
    >
      <h2>Add Chapter</h2>
      <div>
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={chapter.title}
          onChange={handleInputChange}
          placeholder="Warm-up"
          required
        />
      </div>
      <div>
        <label>Start Time (seconds)</label>
        <input
          type="number"
          name="startTime"
          value={chapter.startTime}
          onChange={handleInputChange}
          placeholder="0"
          required
        />
      </div>
      <div>
        <label>End Time (seconds)</label>
        <input
          type="number"
          name="endTime"
          value={chapter.endTime}
          onChange={handleInputChange}
          placeholder="60"
          required
        />
      </div>
      <div>
        <label>Description</label>
        <textarea
          name="description"
          value={chapter.description}
          onChange={handleInputChange}
          placeholder="Describe this chapter"
          rows="3"
        />
      </div>
      <div className="button-group">
        <button onClick={handleSubmit}>Add Chapter</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
};

export default ChapterModal;