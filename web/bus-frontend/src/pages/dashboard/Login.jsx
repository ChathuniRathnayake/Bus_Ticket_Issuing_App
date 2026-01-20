import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button } from '@mui/material'; // ← use MUI components for better look

function Login() {
  const { register, handleSubmit } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    const role = data.email.includes('admin') ? 'dashboard' : 'passengers';
    login(role);
    navigate(`/${role}/home`);
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
        Login
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          {...register('email')}
          fullWidth
          label="Email"
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
          Sign In
        </Button>
      </form>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
        Use any password — email decides role
      </Typography>
    </Box>
  );
}

export default Login;