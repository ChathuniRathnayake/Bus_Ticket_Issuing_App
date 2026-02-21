const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Bus Backend API Running');
});

// Server listen
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');

// CREATE ADMIN
app.post('/api/admin/create', (req, res) => {
  const { username, password } = req.body;

  console.log('Admin Created:', username);

  res.json({ message: 'Admin created successfully' });
});

// CREATE CONDUCTOR
app.post('/api/conductor/create', (req, res) => {
  const { conductorId, password, busId } = req.body;

  console.log('Conductor Created:', conductorId, busId);

  res.json({ message: 'Conductor created successfully' });
});

// PASSENGER SIGNUP
app.post('/api/passenger/signup', (req, res) => {
  const { name, email, phone, password } = req.body;

  console.log('Passenger Signup:', name);

  res.json({ message: 'Passenger registered successfully' });
});

});