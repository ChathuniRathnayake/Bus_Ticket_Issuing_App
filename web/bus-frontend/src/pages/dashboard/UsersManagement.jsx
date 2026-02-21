import { useAuth } from '../../context/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Grid,
} from '@mui/material';
import { useState } from 'react';

function UsersManagement() {
  const { users, buses, addUser } = useAuth();

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'conductor', // default to conductor (admin cannot add passengers)
    assignedBus: '',
  });

  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!newUser.name || !newUser.email) {
      alert('Name and Email are required');
      return;
    }

    if (newUser.role === 'conductor' || newUser.role === 'driver') {
      if (!newUser.phone || !newUser.assignedBus) {
        alert('Phone number and Assigned Bus are required for conductors/drivers');
        return;
      }
    }

    addUser(newUser);

    setNewUser({
      name: '',
      email: '',
      phone: '',
      role: 'conductor', // reset to conductor
      assignedBus: '',
    });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Manage Drivers & Conductors
      </Typography>

      {/* Table shows ALL users (including passengers) */}
      <Table sx={{ mb: 5, minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Assigned Bus</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.id}</TableCell>
              <TableCell>{u.name || '-'}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.phone || '-'}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>{u.assignedBus ? `Bus ${u.assignedBus}` : '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Form - Admin can only add conductor or driver */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Add New Driver or Conductor
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={newUser.name}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={newUser.email}
            onChange={handleChange}
            required
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormControl fullWidth required>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={newUser.role}
              label="Role"
              onChange={handleChange}
            >
              {/* Admin can only choose these two */}
              <MenuItem value="driver">Driver</MenuItem>
              <MenuItem value="conductor">Conductor</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Show extra fields for driver & conductor */}
        {(newUser.role === 'conductor' || newUser.role === 'driver') && (
          <>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={newUser.phone}
                onChange={handleChange}
                required
                placeholder="+94771234567"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Assigned Bus</InputLabel>
                <Select
                  name="assignedBus"
                  value={newUser.assignedBus}
                  label="Assigned Bus"
                  onChange={handleChange}
                >
                  <MenuItem value="">Select Bus</MenuItem>
                  {buses.map((bus) => (
                    <MenuItem key={bus.id} value={bus.id}>
                      Bus {bus.id} - {bus.model}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleAdd}>
            Add {newUser.role === 'conductor' ? 'Conductor' : 'Driver'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default UsersManagement;