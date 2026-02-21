import { Box, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

function RoleSelection() {
  const navigate = useNavigate();
  const [showCreateOptions, setShowCreateOptions] = useState(false);

  return (
    <Box
      sx={{
        maxWidth: 420,
        mx: 'auto',
        mt: 15,
        p: 5,
        bgcolor: 'white',
        borderRadius: 4,
        boxShadow: 6,
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" color="primary" gutterBottom>
        Select Role
      </Typography>

      {/* LOGIN OPTIONS */}
      <Stack spacing={2} sx={{ mt: 3 }}>

        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/admin/login')}
        >
          Admin Login
        </Button>

        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate('/passenger/login')}
        >
          Passenger Login
        </Button>

      </Stack>

      {/* CREATE ACCOUNT BUTTON */}
      <Button
        fullWidth
        sx={{ mt: 4 }}
        variant="text"
        onClick={() => setShowCreateOptions(!showCreateOptions)}
      >
        Create an Account
      </Button>

      {/* CREATE OPTIONS (TOGGLE) */}
      {showCreateOptions && (
        <Stack spacing={2} sx={{ mt: 2 }}>

          <Button
            variant="contained"
            color="success"
            onClick={() => navigate('/admin/create-conductor')}
          >
            Create Conductor Account
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/admin/create-admin')}
          >
            Create Admin Account
          </Button>

        </Stack>
      )}
    </Box>
  );
}

export default RoleSelection;