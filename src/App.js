import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import axios from 'axios';
import './App.css';
import CreateNote from './CreateNote';
import NoteHistory from './NoteHistory'; // Import the NoteHistory component

function App() {
  const [notes, setNotes] = useState([]);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [lastSynced, setLastSynced] = useState(null); // State to track last synced time

  // Load notes from local storage on component mount
  useEffect(() => {
    const storedNotes = JSON.parse(localStorage.getItem('notes')) || [];
    setNotes(storedNotes);
  }, []);

  // Save notes to local storage
  const saveNotesToLocal = (notesToSave) => {
    localStorage.setItem('notes', JSON.stringify(notesToSave));
  };

  // Create a new note
  const addNewNote = (noteContent) => {
    const newNote = {
      id: Date.now(),
      content: noteContent,
      createdAt: new Date().toISOString(),
      lastEdited: null,
      versions: [] // Initialize versions array
    };
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    saveNotesToLocal(updatedNotes);
    setMessage('Note added successfully.');
  };

  // Edit a note
  const editNote = (id) => {
    const noteToEdit = notes.find(note => note.id === id);
    setIsEditing(id);
    setEditedContent(noteToEdit.content);
  };

  // Update a note locally
  const updateNoteLocally = (id, updatedNote) => {
    const updatedNotes = notes.map(note =>
      note.id === id ? updatedNote : note
    );
    setNotes(updatedNotes);
    saveNotesToLocal(updatedNotes);
  };

  // Update a note
  const updateNote = (id) => {
    const noteToUpdate = notes.find(note => note.id === id);
    
    const updatedNote = {
      ...noteToUpdate,
      content: editedContent,
      lastEdited: new Date().toISOString(),
      versions: [
        ...(noteToUpdate.versions || []),
        { content: noteToUpdate.content, lastEdited: new Date().toISOString() }
      ]
    };
    
    updateNoteLocally(id, updatedNote);
    setMessage('Note updated successfully.');
    setIsEditing(null);
  };

  // Delete a note
  const deleteNote = (id) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    saveNotesToLocal(updatedNotes);
    setMessage('Note deleted successfully.');
  };

  // Download a single note as a text file
  const downloadNote = (note) => {
    const blob = new Blob([note.content], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, `note_${note.id}.txt`);
  };

  // Extract all notes into a ZIP file
  const extractNotes = () => {
    const zip = new JSZip();
    notes.forEach(note => {
      zip.file(`note_${note.id}.txt`, note.content);
    });
    zip.generateAsync({ type: 'blob' })
      .then((content) => {
        FileSaver.saveAs(content, 'notes.zip');
        setMessage('Notes extracted into a ZIP file.');
      });
  };

  // Sync notes with the backend
  const syncNotes = () => {
    const apiUrl = 'http://localhost:5000/api/notes';
    
    // Pull latest notes from the database
    axios.get(apiUrl)
      .then((response) => {
        const fetchedNotes = response.data;
        setNotes(fetchedNotes);
        saveNotesToLocal(fetchedNotes); // Update local storage with fetched notes
        setMessage('Notes synced from the server.');

        // Get notes that are created or modified since last sync
        const notesToSync = notes.filter(note => {
          if (!lastSynced) return true; // Sync all if never synced
          return new Date(note.createdAt) > lastSynced || (note.lastEdited && new Date(note.lastEdited) > lastSynced);
        });

        if (notesToSync.length === 0) {
          setMessage('No new notes to sync.');
          return;
        }

        // Push new/modified notes to the server
        Promise.all(
          notesToSync.map(note => {
            return axios.post(apiUrl, {
              content: note.content,
              createdAt: note.createdAt,
              lastEdited: note.lastEdited,
              versions: note.versions,
            });
          })
        )
        .then(() => {
          setLastSynced(new Date()); // Update last synced time
          setMessage('All new notes synced with the server successfully.');
        })
        .catch((error) => {
          console.error('Error syncing notes:', error);
          setMessage('Error syncing notes. Please try again.');
        });
      })
      .catch((error) => {
        console.error('Error fetching notes:', error);
        setMessage('Error fetching notes from server. Please try again.');
      });
  };

  // Sort notes by last edited date first, then by created date
  const sortedNotes = notes.sort((a, b) => {
    if (a.lastEdited && b.lastEdited) {
      return new Date(b.lastEdited) - new Date(a.lastEdited);
    }
    if (a.lastEdited) return -1;
    if (b.lastEdited) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <Router>
      <div className="App">
        <h1>Notes Management System</h1>

        {message && <p>{message}</p>}

        <div className="nav-buttons">
          <Link to="/create">
            <button>Create Note</button>
          </Link>
          <button onClick={syncNotes}>Sync Notes</button>
          <button onClick={extractNotes}>Extract Notes</button>
        </div>

        <div className="note-list">
          {sortedNotes.length > 0 ? (
            sortedNotes.map((note) => (
              <div key={note.id} className="note">
                {isEditing === note.id ? (
                  <div>
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                    />
                    <button onClick={() => updateNote(note.id)}>Save</button>
                    <button onClick={() => setIsEditing(null)}>Cancel</button>
                  </div>
                ) : (
                  <div>
                    <p>{note.content}</p>
                    <p><strong>Created At:</strong> {new Date(note.createdAt).toLocaleString()}</p>
                    <p><strong>Last Edited:</strong> {note.lastEdited ? new Date(note.lastEdited).toLocaleString() : 'Never'}</p>
                    <button onClick={() => editNote(note.id)}>Edit</button>
                    <button onClick={() => deleteNote(note.id)}>Delete</button>
                    <button onClick={() => downloadNote(note)}>Download</button>
                    <NoteHistory note={note} updateNoteLocally={updateNoteLocally} />
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No notes available</p>
          )}
        </div>

        <Routes>
          <Route path="/create" element={<CreateNote addNewNote={addNewNote} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
