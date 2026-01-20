// src/components/DashboardLayout.jsx
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function DashboardLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button color="inherit" component={Link} to="/dashboard/home">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/dashboard/buses">
            Buses
          </Button>
          <Button color="inherit" component={Link} to="/dashboard/routes">
            Routes
          </Button>
          <Button color="inherit" component={Link} to="/dashboard/seats">
            Seat Layouts
          </Button>
          <Button color="inherit" component={Link} to="/dashboard/tickets">
            Tickets & Activity
          </Button>
          <Button color="inherit" component={Link} to="/dashboard/users">
            Users
          </Button>
          <Button color="inherit" onClick={() => { logout(); navigate('/login'); }}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4 }}>
        {children}
      </Box>
    </Box>
  );
}

export default DashboardLayout;