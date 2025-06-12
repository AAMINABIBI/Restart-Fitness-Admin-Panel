import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore'; // Added import for Timestamp
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TopBar from '../components/topBar';
import SideBar from '../components/SideBar';
import './ParticipantsScreen.css';
import { FaCheck, FaPlay } from "react-icons/fa";

function ParticipantsScreen() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const challengeDoc = await getDoc(doc(db, 'weeklyChallenges', challengeId));
        if (challengeDoc.exists()) {
          const challengeData = { id: challengeId, ...challengeDoc.data() };
          setChallenges([challengeData]);

          const participantsSnapshot = await getDocs(collection(db, 'weeklyChallenges', challengeId, 'participants'));
          const participantsList = participantsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            joinedAt: doc.data().joinedAt instanceof Timestamp ? doc.data().joinedAt.toDate() : null, // Using imported Timestamp
          }));
          setParticipants(participantsList);
        } else {
          toast.error('Challenge not found.', { autoClose: 3000 });
          navigate('/weekly-challenges');
        }
      } catch (err) {
        console.error('Error fetching participants:', err.message);
        toast.error('Failed to load participants. Please try again.', { autoClose: 3000 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [challengeId, navigate]);

  const handleSaveFeedback = async (participantId, roundIndex, score, feedback) => {
    try {
      const participantRef = doc(db, 'weeklyChallenges', challengeId, 'participants', participantId);
      const participantDoc = await getDoc(participantRef);
      if (participantDoc.exists()) {
        const data = participantDoc.data();
        const updatedVideoUrls = { ...data.videoUrls };
        const roundKey = `round${roundIndex + 1}`;
        updatedVideoUrls[roundKey] = {
          ...(updatedVideoUrls[roundKey] || { url: data.videoUrls[roundKey]?.url || '' }),
          score: score !== null ? score : updatedVideoUrls[roundKey]?.score,
          feedback: feedback || updatedVideoUrls[roundKey]?.feedback,
        };
        await updateDoc(participantRef, {
          videoUrls: updatedVideoUrls,
          updatedAt: serverTimestamp(),
        });
        toast.success('Feedback and score saved successfully!', { autoClose: 3000 });
        // Refresh participants list
        const participantsSnapshot = await getDocs(collection(db, 'weeklyChallenges', challengeId, 'participants'));
        const participantsList = participantsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          joinedAt: doc.data().joinedAt instanceof Timestamp ? doc.data().joinedAt.toDate() : null, // Using imported Timestamp
        }));
        setParticipants(participantsList);
      }
    } catch (err) {
      console.error('Error saving feedback:', err.message);
      toast.error('Failed to save feedback.', { autoClose: 3000 });
    }
  };

  const handlePlayVideo = (videoUrl) => {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="participants-container">
      <div className="side-bar-container">
        <SideBar />
      </div>
      <div className="main-content">
        <TopBar />
        <div className="participants-section">
          <h2>Participants for {challenges[0]?.title || 'Unknown Challenge'}</h2>
          <button className="back-button" onClick={() => navigate('/weekly-challenges')}>
            Back to Challenges
          </button>
          {participants.length === 0 ? (
            <p>No participants found.</p>
          ) : (
            <table className="participants-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Joined At</th>
                  <th>Status</th>
                  <th>Rounds Completed</th>
                  <th>Videos</th>
                  <th>Score</th>
                  <th>Feedback</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr key={participant.id}>
                    <td>{participant.userId}</td>
                    <td>{participant.joinedAt?.toLocaleString() || 'N/A'}</td>
                    <td>{participant.status}</td>
                    <td>{participant.roundsCompleted.join(', ') || 'None'}</td>
                    <td>
                      {participant.roundsCompleted.map((roundIdx) => {
                        const roundKey = `round${roundIdx + 1}`;
                        const videoUrl = participant.videoUrls[roundKey]?.url;
                        return (
                          <div key={roundIdx} className="video-row">
                            Round {roundIdx + 1}:{' '}
                            {videoUrl ? (
                              <button
                                className="play-button"
                                onClick={() => handlePlayVideo(videoUrl)}
                              >
                                <FaPlay /> Play Video
                              </button>
                            ) : 'No video'}
                          </div>
                        );
                      })}
                    </td>
                    <td>
                      {participant.roundsCompleted.map((roundIdx) => {
                        const roundKey = `round${roundIdx + 1}`;
                        return (
                          <div key={roundIdx} className="score-row">
                            Round {roundIdx + 1}:{' '}
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="Score"
                              defaultValue={participant.videoUrls[roundKey]?.score || ''}
                              onChange={(e) => {
                                const newScore = parseInt(e.target.value) || null;
                                setParticipants(prev =>
                                  prev.map(p =>
                                    p.id === participant.id ? { ...p, tempScore: { ...p.tempScore, [roundKey]: newScore } } : p
                                  )
                                );
                              }}
                            />
                          </div>
                        );
                      })}
                    </td>
                    <td>
                      {participant.roundsCompleted.map((roundIdx) => {
                        const roundKey = `round${roundIdx + 1}`;
                        return (
                          <div key={roundIdx} className="feedback-row">
                            Round {roundIdx + 1}:{' '}
                            <input
                              type="text"
                              placeholder="Feedback"
                              defaultValue={participant.videoUrls[roundKey]?.feedback || ''}
                              onChange={(e) => {
                                const newFeedback = e.target.value;
                                setParticipants(prev =>
                                  prev.map(p =>
                                    p.id === participant.id ? { ...p, tempFeedback: { ...p.tempFeedback, [roundKey]: newFeedback } } : p
                                  )
                                );
                              }}
                            />
                          </div>
                        );
                      })}
                    </td>
                    <td>
                      {participant.roundsCompleted.map((roundIdx) => {
                        const roundKey = `round${roundIdx + 1}`;
                        return (
                          <div key={roundIdx} className="action-row">
                            <button
                              className="submit-score-btn"
                              onClick={() => handleSaveFeedback(participant.id, roundIdx, participant.tempScore?.[roundKey] || null, null)}
                              disabled={!participant.tempScore?.[roundKey] && participant.tempScore?.[roundKey] !== 0}
                            >
                              <FaCheck /> Submit Score
                            </button>
                            <button
                              className="submit-feedback-btn"
                              onClick={() => handleSaveFeedback(participant.id, roundIdx, null, participant.tempFeedback?.[roundKey] || '')}
                              disabled={!participant.tempFeedback?.[roundKey]}
                            >
                              <FaCheck /> Submit Feedback
                            </button>
                          </div>
                        );
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default ParticipantsScreen;