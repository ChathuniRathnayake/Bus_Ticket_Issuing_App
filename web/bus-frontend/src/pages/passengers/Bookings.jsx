// src/pages/passengers/SeatBooking.jsx (updated with better error handling)
import { useAuth } from '../../context/AuthContext';
import {
  Typography,
  Box,
  Grid,
  Button,
  Paper,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function SeatBooking() {
  const { routes, buses, tickets, bookSeat } = useAuth();
  const { routeId } = useParams();
  const navigate = useNavigate();

  const route = routes.find((r) => r.id === routeId);
  const bus = route ? buses.find((b) => b.id === Number(route.busId)) : null;

  const [boardingStop, setBoardingStop] = useState('');
  const [destinationStop, setDestinationStop] = useState('');
  const [availableCount, setAvailableCount] = useState(0);
  const [freeingCount, setFreeingCount] = useState(0);

  useEffect(() => {
    if (!route || !bus || !boardingStop || !destinationStop) return;

    const stops = route.stops;
    const relevantTickets = tickets.filter((t) => t.routeId === routeId && t.busId === bus.id);

    const fromIndex = stops.indexOf(boardingStop);
    const toIndex = stops.indexOf(destinationStop);
    let avail = 0;
    for (let seat = 1; seat <= bus.seats; seat++) {
      const isAvailable = !relevantTickets.some(
        (t) =>
          t.seat === seat &&
          Math.max(fromIndex, stops.indexOf(t.boardingStop)) < Math.min(toIndex, stops.indexOf(t.destinationStop))
      );
      if (isAvailable) avail++;
    }
    setAvailableCount(avail);

    const freeing = relevantTickets.filter((t) => t.destinationStop === boardingStop).length;
    setFreeingCount(freeing);
  }, [boardingStop, destinationStop, route, bus, tickets, routeId]);

  if (!route) {
    return <Typography>Route not found. Please check if the route exists.</Typography>;
  }
  if (!bus) {
    return <Typography>Bus not found for this route. Please ensure a bus is assigned in the admin dashboard.</Typography>;
  }

  const stops = route.stops;
  const relevantTickets = tickets.filter((t) => t.routeId === routeId && t.busId === bus.id);

  const handleBook = (seat) => {
    bookSeat(bus.id, route.id, seat, boardingStop, destinationStop);
    alert(`Seat ${seat} booked from ${boardingStop} to ${destinationStop}!`);
    navigate('/passengers/home');
  };

  const getIsAvailable = (seatNumber) => {
    if (!boardingStop || !destinationStop) return false;
    const fromIndex = stops.indexOf(boardingStop);
    const toIndex = stops.indexOf(destinationStop);
    return !relevantTickets.some(
      (t) =>
        t.seat === seatNumber &&
        Math.max(fromIndex, stops.indexOf(t.boardingStop)) < Math.min(toIndex, stops.indexOf(t.destinationStop))
    );
  };

  // Generate seat layout (assuming 1 front, up to 44 main, rest back; adjust slices safely)
  const seatLayout = Array.from({ length: bus.seats }, (_, i) => ({ number: i + 1 }));
  const frontSeat = seatLayout.slice(0, 1);
  const mainRows = Math.min(11, Math.floor((bus.seats - 1 - (bus.seats % 5 || 5)) / 4)); // Approximate
  const mainSeats = seatLayout.slice(1, 1 + mainRows * 4);
  const backSeats = seatLayout.slice(1 + mainRows * 4);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom align="center">
        Book Seat for {route.name}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Boarding Stop</InputLabel>
            <Select value={boardingStop} onChange={(e) => setBoardingStop(e.target.value)} label="Boarding Stop">
              {stops.map((stop) => (
                <MenuItem key={stop} value={stop}>
                  {stop}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Destination Stop</InputLabel>
            <Select
              value={destinationStop}
              onChange={(e) => setDestinationStop(e.target.value)}
              label="Destination Stop"
              disabled={!boardingStop}
            >
              {stops
                .slice(stops.indexOf(boardingStop) + 1)
                .map((stop) => (
                  <MenuItem key={stop} value={stop}>
                    {stop}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {boardingStop && destinationStop && (
        <>
          <Typography variant="h6" gutterBottom>
            Seats becoming free at {boardingStop}: {freeingCount}
          </Typography>
          <Typography variant="h6" gutterBottom>
            Total available seats from {boardingStop} to {destinationStop}: {availableCount}
          </Typography>
        </>
      )}

      <Paper elevation={4} sx={{ p: 4, mt: 4, borderRadius: 3, maxWidth: 500, mx: 'auto' }}>
        <Typography variant="h5" gutterBottom>
          Bus {bus.id} - {bus.model} ({bus.busNo})
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Total Seats: {bus.seats}
        </Typography>

        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" color="primary">
            FRONT OF BUS
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          {frontSeat.map((seat) => {
            const isAvailable = getIsAvailable(seat.number);
            return (
              <Button
                key={seat.number}
                disabled={!isAvailable}
                onClick={() => handleBook(seat.number)}
                sx={{
                  width: 90,
                  height: 90,
                  fontSize: '1.5rem',
                  backgroundColor: isAvailable ? '#4caf50' : '#f44336',
                  color: 'white',
                  '&:hover': { backgroundColor: isAvailable ? '#388e3c' : '#d32f2f' },
                  '&:disabled': { backgroundColor: '#f44336', color: 'white' },
                }}
              >
                {seat.number}
              </Button>
            );
          })}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" align="center" gutterBottom>
            Main Seating Area (2+2)
          </Typography>
          <Grid container spacing={1.5} justifyContent="center">
            {Array.from({ length: mainRows }).map((_, rowIndex) => {
              const rowSeats = mainSeats.slice(rowIndex * 4, (rowIndex + 1) * 4);
              return (
                <Grid container item spacing={2} key={rowIndex}>
                  {rowSeats.slice(0, 2).map((seat) => {
                    const isAvailable = getIsAvailable(seat.number);
                    return (
                      <Grid item xs={2.5} key={seat.number}>
                        <Button
                          disabled={!isAvailable}
                          onClick={() => handleBook(seat.number)}
                          sx={{
                            width: '100%',
                            height: 65,
                            fontSize: '1.1rem',
                            backgroundColor: isAvailable ? '#4caf50' : '#f44336',
                            color: 'white',
                            '&:hover': { backgroundColor: isAvailable ? '#388e3c' : '#d32f2f' },
                            '&:disabled': { backgroundColor: '#f44336', color: 'white' },
                          }}
                        >
                          {seat.number}
                        </Button>
                      </Grid>
                    );
                  })}
                  <Grid item xs={1.5} />
                  {rowSeats.slice(2, 4).map((seat) => {
                    const isAvailable = getIsAvailable(seat.number);
                    return (
                      <Grid item xs={2.5} key={seat.number}>
                        <Button
                          disabled={!isAvailable}
                          onClick={() => handleBook(seat.number)}
                          sx={{
                            width: '100%',
                            height: 65,
                            fontSize: '1.1rem',
                            backgroundColor: isAvailable ? '#4caf50' : '#f44336',
                            color: 'white',
                            '&:hover': { backgroundColor: isAvailable ? '#388e3c' : '#d32f2f' },
                            '&:disabled': { backgroundColor: '#f44336', color: 'white' },
                          }}
                        >
                          {seat.number}
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
              );
            })}
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" align="center" gutterBottom>
            Back Row
          </Typography>
          <Grid container spacing={1.5} justifyContent="center">
            {backSeats.map((seat) => {
              const isAvailable = getIsAvailable(seat.number);
              return (
                <Grid item xs={1.33} key={seat.number}>
                  <Button
                    disabled={!isAvailable}
                    onClick={() => handleBook(seat.number)}
                    sx={{
                      width: '100%',
                      height: 65,
                      fontSize: '1.1rem',
                      backgroundColor: isAvailable ? '#4caf50' : '#f44336',
                      color: 'white',
                      '&:hover': { backgroundColor: isAvailable ? '#388e3c' : '#d32f2f' },
                      '&:disabled': { backgroundColor: '#f44336', color: 'white' },
                    }}
                  >
                    {seat.number}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        <Stack direction="row" spacing={4} justifyContent="center" sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 24, height: 24, bgcolor: '#4caf50', borderRadius: 1 }} />
            <Typography>Available (click to book)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 24, height: 24, bgcolor: '#f44336', borderRadius: 1 }} />
            <Typography>Booked</Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

export default SeatBooking;