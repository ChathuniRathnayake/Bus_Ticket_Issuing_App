// src/pages/passengers/Signup.jsx

import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';

function Signup() {
  const { register, handleSubmit } = useForm();
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
  try {
    await axios.post(
      'http://localhost:5000/api/passenger/signup',
      data
    );

    alert('Signup successful!');
    navigate('/passenger/login');

  } catch (error) {
    console.error(error);
    alert('Signup failed');
  }
};

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: 'auto',
        mt: 12,
        p: 5,
        bgcolor: 'white',
        borderRadius: 3,
        boxShadow: 6,
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" color="primary" gutterBottom>
        Passenger Signup
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          {...register('name')}
          fullWidth
          label="Full Name"
          margin="normal"
          variant="outlined"
          required
        />

        <TextField
          {...register('email')}
          fullWidth
          label="Email"
          type="email"
          margin="normal"
          variant="outlined"
          required
        />

        <TextField
          {...register('phone')}
          fullWidth
          label="Phone Number"
          margin="normal"
          variant="outlined"
          required
        />

        <TextField
          {...register('password')}
          fullWidth
          label="Password"
          type="password"
          margin="normal"
          variant="outlined"
          required
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 3, py: 1.5 }}
        >
          Sign Up
        </Button>
      </form>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
        Already have an account?{" "}
        <span
          style={{ color: '#1976d2', cursor: 'pointer', fontWeight: 500 }}
          onClick={() => navigate('/passenger/login')}
        >
          Login
        </span>
      </Typography>
    </Box>
  );
}

export default Signup;