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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { useState } from 'react';
import dayjs from 'dayjs';

function RoutesPage() {
  const { routes, setRoutes, buses, users } = useAuth();

  // Filter for drivers & conductors (if you have separate driver role)
  const drivers = users.filter(u => u.role === 'conductor' || u.role === 'driver');
  const conductors = users.filter(u => u.role === 'conductor');

  const [newRoute, setNewRoute] = useState({
    name: '',
    stops: '',
    startTime: null,
    endTime: null,
    driverId: '',
    conductorId: '',
    busId: '', // ← NEW: Bus ID selection
  });

  const handleChange = (e) => {
    setNewRoute({ ...newRoute, [e.target.name]: e.target.value });
  };

  const handleTimeChange = (field, value) => {
    setNewRoute({ ...newRoute, [field]: value });
  };

  const handleAdd = () => {
    if (!newRoute.name || !newRoute.stops || !newRoute.startTime || !newRoute.endTime ||
        !newRoute.driverId || !newRoute.conductorId || !newRoute.busId) {
      alert('All fields are required');
      return;
    }

    const selectedBus = buses.find(b => b.id === Number(newRoute.busId));

    setRoutes([
      ...routes,
      {
        id: `R${routes.length + 1}`,
        name: newRoute.name,
        stops: newRoute.stops.split(',').map(s => s.trim()),
        startTime: dayjs(newRoute.startTime).format('HH:mm'),
        endTime: dayjs(newRoute.endTime).format('HH:mm'),
        driver: users.find(u => u.id === newRoute.driverId)?.name || 'Unknown',
        conductor: users.find(u => u.id === newRoute.conductorId)?.name || 'Unknown',
        busId: newRoute.busId,
        busInfo: selectedBus ? `${selectedBus.busNo} (${selectedBus.model})` : 'Unknown',
      },
    ]);

    setNewRoute({
      name: '',
      stops: '',
      startTime: null,
      endTime: null,
      driverId: '',
      conductorId: '',
      busId: '',
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Typography variant="h5" gutterBottom>
          Manage Routes & Schedules
        </Typography>

        {/* Routes Table */}
        <Table sx={{ mb: 5 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Route Name</TableCell>
              <TableCell>Stops</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>Conductor</TableCell>
              <TableCell>Bus</TableCell> {/* ← NEW COLUMN */}
            </TableRow>
          </TableHead>
          <TableBody>
            {routes.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.stops.join(' → ')}</TableCell>
                <TableCell>{r.startTime}</TableCell>
                <TableCell>{r.endTime}</TableCell>
                <TableCell>{r.driver}</TableCell>
                <TableCell>{r.conductor}</TableCell>
                <TableCell>{r.busInfo || `Bus ${r.busId}`}</TableCell> {/* ← NEW */}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Add New Route Form */}
        <Typography variant="h6" gutterBottom sx={{ mt: 5 }}>
          Add New Route
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Route Name"
              name="name"
              value={newRoute.name}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Stops (comma separated)"
              name="stops"
              value={newRoute.stops}
              onChange={handleChange}
              required
              helperText="Example: Colombo, Kegalle, Kandy"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TimePicker
              label="Start Time"
              value={newRoute.startTime}
              onChange={(newValue) => handleTimeChange('startTime', newValue)}
              renderInput={(params) => <TextField {...params} fullWidth required />}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TimePicker
              label="End Time"
              value={newRoute.endTime}
              onChange={(newValue) => handleTimeChange('endTime', newValue)}
              renderInput={(params) => <TextField {...params} fullWidth required />}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Bus</InputLabel>
              <Select
                name="busId"
                value={newRoute.busId}
                label="Bus"
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>Select Bus</em>
                </MenuItem>
                {buses.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    Bus {b.id} - {b.busNo} ({b.model})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Driver</InputLabel>
              <Select
                name="driverId"
                value={newRoute.driverId}
                label="Driver"
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>Select Driver</em>
                </MenuItem>
                {drivers.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Conductor</InputLabel>
              <Select
                name="conductorId"
                value={newRoute.conductorId}
                label="Conductor"
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>Select Conductor</em>
                </MenuItem>
                {conductors.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleAdd} size="large">
              Add Route
            </Button>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}

export default RoutesPage;