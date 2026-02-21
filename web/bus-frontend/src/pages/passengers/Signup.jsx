// src/pages/Signup.jsx (new file)
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button } from '@mui/material';

function Signup() {
  const { register, handleSubmit } = useForm();
  const { registerUser } = useAuth(); // NEW: We'll add this to AuthContext
  const navigate = useNavigate();

  const onSubmit = (data) => {
    registerUser(data.name, data.email, data.phone, data.password);
    alert('Signup successful! Please login.');
    navigate('/login');
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
        Signup
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
        Already have an account? <a href="/login">Login</a>
      </Typography>
    </Box>
  );
}

export default Signup;