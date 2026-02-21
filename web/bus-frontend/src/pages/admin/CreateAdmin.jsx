import { Box, Typography, TextField, Button } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateAdmin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleCreate = async () => {
  try {
    await axios.post('http://localhost:5000/api/admin/create', {
      username,
      password,
    });

    alert('Admin created successfully!');
    navigate('/admin/login');

  } catch (error) {
    console.error(error);
    alert('Error creating admin');
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
        Create Admin Account
      </Typography>

      <TextField
        fullWidth
        label="Username"
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <TextField
        fullWidth
        label="Password"
        type="password"
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

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

export default CreateAdmin;