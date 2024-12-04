// src/NoteHistory.js
import React, { useState } from 'react';

const NoteHistory = ({ note, updateNoteLocally }) => {
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  const toggleHistory = () => {
    setIsHistoryVisible(!isHistoryVisible);
  };

  const revertToVersion = (version) => {
    const updatedNote = {
      ...note,
      content: version.content,
      lastEdited: new Date().toISOString(),
    };
    updateNoteLocally(note.id, updatedNote);
  };

  return (
    <div>
      <button onClick={toggleHistory}>
        {isHistoryVisible ? 'Hide History' : 'Show History'}
      </button>
      {isHistoryVisible && (
        <div className="note-history">
          <h4>Version History</h4>
          {note.versions && note.versions.length > 0 ? (
            note.versions.map((version, index) => (
              <div key={index}>
                <p>{version.content}</p>
                <p><strong>Edited At:</strong> {new Date(version.lastEdited).toLocaleString()}</p>
                <button onClick={() => revertToVersion(version)}>Revert to this version</button>
              </div>
            ))
          ) : (
            <p>No version history available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteHistory;
