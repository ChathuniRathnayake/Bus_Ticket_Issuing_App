import { useAuth } from '../../context/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
} from '@mui/material';
import { useState } from 'react';

function Buses() {
  const { buses, setBuses } = useAuth();

  const [newBus, setNewBus] = useState({
    busNo: '',
    model: '',
    route: '',
    seats: '',
    ownerName: '',
    ownerContact: '',
  });

  const handleChange = (e) => {
    setNewBus({ ...newBus, [e.target.name]: e.target.value });
  };

  const handleAddBus = () => {
    if (!newBus.busNo || !newBus.model || !newBus.route || !newBus.seats) {
      alert('Bus No, Model, Route, and Seats are required');
      return;
    }

    setBuses(prev => [
      ...prev,
      {
        id: prev.length + 1,
        busNo: newBus.busNo,
        model: newBus.model,
        route: newBus.route,
        seats: Number(newBus.seats),
        available: Number(newBus.seats), // start with all available
        ownerName: newBus.ownerName || 'Not specified',
        ownerContact: newBus.ownerContact || '-',
      }
    ]);

    setNewBus({
      busNo: '',
      model: '',
      route: '',
      seats: '',
      ownerName: '',
      ownerContact: '',
    });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Manage Buses
      </Typography>

      {/* Buses Table */}
      <Table sx={{ minWidth: 850, mb: 5 }}>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Bus No / Plate</TableCell>
            <TableCell>Model</TableCell>
            <TableCell>Route</TableCell>
            <TableCell>Seats</TableCell>
            <TableCell>Available</TableCell>
            <TableCell>Owner Name</TableCell>
            <TableCell>Owner Contact</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {buses.map((bus) => (
            <TableRow key={bus.id}>
              <TableCell>{bus.id}</TableCell>
              <TableCell>{bus.busNo}</TableCell>
              <TableCell>{bus.model}</TableCell>
              <TableCell>{bus.route}</TableCell>
              <TableCell>{bus.seats}</TableCell>
              <TableCell>{bus.available}</TableCell>
              <TableCell>{bus.ownerName}</TableCell>
              <TableCell>{bus.ownerContact}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add New Bus Form */}
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Add New Bus
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Bus No / Plate"
            name="busNo"
            value={newBus.busNo}
            onChange={handleChange}
            required
            placeholder="WP-ABC-1234"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Model"
            name="model"
            value={newBus.model}
            onChange={handleChange}
            required
            placeholder="Volvo B11R"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Route"
            name="route"
            value={newBus.route}
            onChange={handleChange}
            required
            placeholder="Colombo-Kandy"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Total Seats"
            name="seats"
            type="number"
            value={newBus.seats}
            onChange={handleChange}
            required
            inputProps={{ min: 20 }}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Owner Name"
            name="ownerName"
            value={newBus.ownerName}
            onChange={handleChange}
            placeholder="Sunil Transport Ltd"
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Owner Contact"
            name="ownerContact"
            value={newBus.ownerContact}
            onChange={handleChange}
            placeholder="+94712345678"
          />
        </Grid>

        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleAddBus}>
            Add Bus
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Buses;