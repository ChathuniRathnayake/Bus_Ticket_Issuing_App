import { Box, Typography, TextField, Button } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateConductor() {
  const navigate = useNavigate();

  // State for fields
  const [conductorId, setConductorId] = useState('');
  const [password, setPassword] = useState('');
  const [busId, setBusId] = useState('');

  const handleCreate = async () => {
  try {
    await axios.post('http://localhost:5000/api/conductor/create', {
      conductorId,
      password,
      busId,
    });

    alert('Conductor created successfully!');
    navigate('/admin/login');

  } catch (error) {
    console.error(error);
    alert('Error creating conductor');
  }
};

  return (
    <Box
      sx={{
        maxWidth: 420,
        mx: 'auto',
        mt: 12,
        p: 5,
        bgcolor: 'white',
        borderRadius: 4,
        boxShadow: 6,
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" color="primary" gutterBottom>
        Create Conductor Account
      </Typography>

      {/* Conductor ID */}
      <TextField
        fullWidth
        label="Conductor ID"
        margin="normal"
        value={conductorId}
        onChange={(e) => setConductorId(e.target.value)}
      />

      {/* Password */}
      <TextField
        fullWidth
        label="Password"
        type="password"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* Assigned Bus ID */}
      <TextField
        fullWidth
        label="Assigned Bus ID"
        margin="normal"
        value={busId}
        onChange={(e) => setBusId(e.target.value)}
      />

      {/* Create Button */}
      <Button
        fullWidth
        variant="contained"
        size="large"
        sx={{ mt: 3 }}
        onClick={handleCreate}
      >
        Create
      </Button>
    </Box>
  );
}

export default CreateConductor;