import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button } from '@mui/material';

function PassengerLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Temporary login logic
    console.log('Passenger login:', email, password);
    navigate('/passenger/home'); // or wherever passenger dashboard is
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
        Passenger Login
      </Typography>

      <TextField
        fullWidth
        label="Email"
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
        onClick={handleLogin}
      >
        Login
      </Button>

      <Typography sx={{ mt: 3 }}>
        Don't have an account?{' '}
        <span
          style={{ color: '#1976d2', cursor: 'pointer' }}
          onClick={() => navigate('/passenger/signup')}
        >
          Signup
        </span>
      </Typography>
    </Box>
  );
}

export default PassengerLogin;