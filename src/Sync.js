import React from 'react';
import axios from 'axios';

function Sync({ notes, setMessage }) {
  // Sync notes with the server
  const syncNotesWithServer = async () => {
    const unsyncedNotes = notes.filter(note => !note.synced);  // Only sync unsynced notes
    if (unsyncedNotes.length === 0) {
      setMessage('All notes are already synced.');
      return;
    }

    if (navigator.onLine) {
      console.log('Syncing notes with server...', unsyncedNotes);
      for (const note of unsyncedNotes) {
        try {
          const response = await axios.post('http://localhost:5000/api/notes', {
            content: note.content,  // Send note content only
          });
          console.log('Note synced successfully:', response.data);

          // Mark note as synced (you may want to do this in your local storage logic)
          note.synced = true;
          setMessage(`Note synced successfully: ${response.data.message}`);
        } catch (error) {
          console.error('Error syncing notes:', error);
          setMessage('Error syncing some notes with the server.');
        }
      }
    } else {
      setMessage('You are offline. Notes will sync once you are back online.');
    }
  };

  return (
    <button onClick={syncNotesWithServer}>
      Sync Notes
    </button>
  );
}

export default Sync;
