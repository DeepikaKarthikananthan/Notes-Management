const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');

// Middleware
app.use(cors()); // To allow cross-origin requests
app.use(express.json()); // To parse incoming JSON requests

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // Your MySQL username
  password: 'root123', // Your MySQL password
  database: 'notesmanagement'   // Your database name
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL Database');
});

// Create a new note
app.post('/api/notes', (req, res) => {
  const { content } = req.body;

  const query = 'INSERT INTO notes (content) VALUES (?)';
  db.query(query, [content], (err, result) => {
    if (err) {
      console.error('Error adding note:', err);
      res.status(500).json({ error: 'Failed to add note' });
    } else {
      res.json({ message: 'Note added successfully', noteId: result.insertId });
    }
  });
});

// Get all notes
app.get('/api/notes', (req, res) => {
  const query = 'SELECT * FROM notes';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching notes:', err);
      res.status(500).json({ error: 'Failed to fetch notes' });
    } else {
      res.json(results);
    }
  });
});

// Update a note by id
app.put('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  const { content } = req.body;

  const query = 'UPDATE notes SET content = ? WHERE id = ?';
  db.query(query, [content, noteId], (err, result) => {
    if (err) {
      console.error('Error updating note:', err);
      res.status(500).json({ error: 'Failed to update note', details: err });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Note not found' });
    } else {
      res.json({ message: 'Note updated successfully', noteId });
    }
  });
});

// Delete a note by id
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;

  const query = 'DELETE FROM notes WHERE id = ?';
  db.query(query, [noteId], (err, result) => {
    if (err) {
      console.error('Error deleting note:', err);
      res.status(500).json({ error: 'Failed to delete note' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Note not found' });
    } else {
      res.json({ message: 'Note deleted successfully', noteId });
    }
  });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
