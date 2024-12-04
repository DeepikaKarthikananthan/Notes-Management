import React, { useState } from 'react';

function CreateNote({ addNewNote }) {
  const [noteContent, setNoteContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    addNewNote(noteContent);
    setNoteContent('');
  };

  return (
    <div className="create-note">
      <form onSubmit={handleSubmit}>
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Write your note here..."
          required
        />
        <button type="submit">Add Note</button>
      </form>
    </div>
  );
}

export default CreateNote;
