import { useAuth } from '../../context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function PassengersHome() {
  const { routes } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Available Routes
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Route Name</TableCell>
            <TableCell>Stops</TableCell>
            <TableCell>Start Time</TableCell>
            <TableCell>End Time</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {routes.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.name}</TableCell>
              <TableCell>{r.stops.join(' → ')}</TableCell>
              <TableCell>{r.startTime}</TableCell>
              <TableCell>{r.endTime}</TableCell>
              <TableCell>
                <Button variant="contained" color="primary" onClick={() => navigate(`/passengers/book/${r.id}`)}>
                  Book Ticket
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default PassengersHome;