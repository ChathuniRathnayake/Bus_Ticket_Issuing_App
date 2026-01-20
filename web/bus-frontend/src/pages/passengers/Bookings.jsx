import { useAuth } from '../../context/AuthContext';
import {
  Typography,
  Box,
  Grid,
  Button,
  Paper,
  Chip,
  Tooltip,
  Stack,
  Divider,
} from '@mui/material';

function SeatLayouts() {
  const { buses, toggleSeatStatus } = useAuth();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
        Bus Seat Layout
      </Typography>

      {buses.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
          No buses added yet. Please add buses in the Buses section.
        </Typography>
      ) : (
        buses.map((bus) => {
          // Safety: if seatLayout is missing or not array, use empty array
          const seatLayout = Array.isArray(bus.seatLayout) ? bus.seatLayout : [];

          const availableCount = seatLayout.filter((s) => s?.status === 'available').length;
          const bookedCount = seatLayout.length - availableCount;

          // Front row: 1 seat
          const frontSeat = seatLayout.slice(0, 1);

          const mainRows = 11;
          const mainSeats = seatLayout.slice(1, 45); // seats 2 to 45
          const backSeats = seatLayout.slice(45); // seats 46 to 54 (9 seats)

          return (
            <Paper
              key={bus.id}
              elevation={4}
              sx={{
                p: 4,
                mb: 5,
                borderRadius: 3,
                backgroundColor: '#ffffff',
                maxWidth: 500,
                mx: 'auto',
              }}
            >
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, pb: 2, borderBottom: '2px solid #1976d2' }}>
                <Box>
                  <Typography variant="h5" fontWeight="600">
                    Bus {bus.id} – {bus.model} ({bus.busNo})
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Route: {bus.route} • Total Seats: {bus.seats || seatLayout.length || 'N/A'}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Chip label={`Available: ${availableCount}`} color="success" sx={{ fontWeight: 'bold' }} />
                  <Chip label={`Booked: ${bookedCount}`} color="error" sx={{ fontWeight: 'bold' }} />
                </Stack>
              </Box>

              {seatLayout.length === 0 ? (
                <Typography color="error" align="center" sx={{ my: 4 }}>
                  No seat layout defined for this bus yet.
                </Typography>
              ) : (
                <>
                  {/* FRONT */}
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                      FRONT OF BUS
                    </Typography>
                  </Box>

                  {/* Seat 1 */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                    {frontSeat.map((seat) => (
                      <Tooltip key={seat.number} title={`Seat ${seat.number} - ${seat.status}`} arrow>
                        <Button
                          variant="contained"
                          onClick={() => seat.status === 'available' && toggleSeatStatus(bus.id, seat.number)}
                          className={`seat-button ${seat.status}`}
                          sx={{ width: 90, height: 90, fontSize: '1.5rem' }}
                        >
                          {seat.number}
                        </Button>
                      </Tooltip>
                    ))}
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Main rows - 4 seats each */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" align="center" gutterBottom>
                      Main Seating Area (2+2)
                    </Typography>

                    <Grid container spacing={1.5} justifyContent="center">
                      {Array.from({ length: mainRows }).map((_, rowIndex) => {
                        const rowSeats = mainSeats.slice(rowIndex * 4, (rowIndex + 1) * 4);

                        return (
                          <Grid container item spacing={2} key={rowIndex}>
                            {/* Left 2 */}
                            {rowSeats.slice(0, 2).map((seat) => (
                              <Grid item xs={2.5} key={seat.number}>
                                <Button
                                  variant="contained"
                                  onClick={() => seat.status === 'available' && toggleSeatStatus(bus.id, seat.number)}
                                  className={`seat-button ${seat.status}`}
                                  sx={{
                                    width: '100%',
                                    height: 65,
                                    fontSize: '1.1rem',
                                  }}
                                >
                                  {seat.number}
                                </Button>
                              </Grid>
                            ))}

                            {/* Aisle */}
                            <Grid item xs={1.5} />

                            {/* Right 2 */}
                            {rowSeats.slice(2, 4).map((seat) => (
                              <Grid item xs={2.5} key={seat.number}>
                                <Button
                                  variant="contained"
                                  onClick={() => seat.status === 'available' && toggleSeatStatus(bus.id, seat.number)}
                                  className={`seat-button ${seat.status}`}
                                  sx={{
                                    width: '100%',
                                    height: 65,
                                    fontSize: '1.1rem',
                                  }}
                                >
                                  {seat.number}
                                </Button>
                              </Grid>
                            ))}
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Back row */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" align="center" gutterBottom>
                      Back Row
                    </Typography>

                    <Grid container spacing={1.5} justifyContent="center">
                      {backSeats.map((seat) => (
                        <Grid item xs={1.33} key={seat.number}>
                          <Button
                            variant="contained"
                            onClick={() => seat.status === 'available' && toggleSeatStatus(bus.id, seat.number)}
                            className={`seat-button ${seat.status}`}
                            sx={{
                              width: '100%',
                              height: 65,
                              fontSize: '1.1rem',
                            }}
                          >
                            {seat.number}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  {/* Legend */}
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
                </>
              )}
            </Paper>
          );
        })
      )}
    </Box>
  );
}

// Reusable Seat Button
function SeatButton({ seat, onToggle }) {
  return (
    <Tooltip title={`Seat ${seat.number} - ${seat.status}`} arrow>
      <Button
        variant="contained"
        disableRipple={seat.status === 'booked'}
        onClick={onToggle}
        className={`seat-button ${seat.status}`}
        sx={{
          width: '100%',
          height: 65,
          fontSize: '1.1rem',
          fontWeight: 'bold',
          borderRadius: 2,
        }}
      >
        {seat.number}
      </Button>
    </Tooltip>
  );
}

export default SeatLayouts;