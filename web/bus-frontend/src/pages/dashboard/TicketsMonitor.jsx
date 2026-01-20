import { useAuth } from '../../context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Box } from '@mui/material';

function TicketsMonitor() {
  const { tickets, activityLogs } = useAuth();  // Includes activityLogs

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Monitor Ticket Bookings
      </Typography>

      <Table sx={{ mb: 5 }}>
        <TableHead>
          <TableRow>
            <TableCell>Ticket ID</TableCell>
            <TableCell>Bus ID</TableCell>
            <TableCell>Route ID</TableCell>
            <TableCell>Seat</TableCell>
            <TableCell>Passenger Name</TableCell>
            <TableCell>Issue Method</TableCell>
            <TableCell>Conductor Name</TableCell>
            <TableCell>Boarding Stop</TableCell>
            <TableCell>Destination Stop</TableCell>
            <TableCell>Date & Time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tickets.map(t => (
            <TableRow key={t.id}>
              <TableCell>{t.id}</TableCell>
              <TableCell>{t.busId}</TableCell>
              <TableCell>{t.routeId}</TableCell>
              <TableCell>{t.seat}</TableCell>
              <TableCell>{t.passengerName}</TableCell>
              <TableCell>{t.type === 'conductor' ? 'Conductor Issued' : 'Online'}</TableCell>
              <TableCell>{t.type === 'conductor' ? t.conductorName : 'N/A'}</TableCell>
              <TableCell>{t.boardingStop}</TableCell>
              <TableCell>{t.destinationStop}</TableCell>
              <TableCell>{t.time}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Typography variant="h6" gutterBottom sx={{ mt: 5 }}>
        Conductor Activity Log
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Action</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activityLogs.map(l => (
            <TableRow key={l.id}>
              <TableCell>{l.action}</TableCell>
              <TableCell>{l.user}</TableCell>
              <TableCell>{l.time}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default TicketsMonitor;