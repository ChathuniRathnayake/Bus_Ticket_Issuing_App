export const mockBuses = [
  {
    id: 1,
    busNo: 'WP-ABC-1234',
    model: 'Volvo B11R',
    route: 'Colombo-Kandy',
    seats: 50,
    ownerName: 'Sunil Transport Ltd',
    ownerContact: '+94712345678',
    seatLayout: Array(50).fill(null).map((_, i) => ({
      number: i + 1,
      status: i % 5 === 0 ? 'booked' : 'available' // sample: every 5th seat booked
    }))
  },
  {
    id: 2,
    busNo: 'NP-KLM-5678',
    model: 'Ashok Leyland Viking',
    route: 'Colombo-Galle',
    seats: 40,
    ownerName: 'Galle Express Services',
    ownerContact: '+94798765432',
    seatLayout: Array(40).fill(null).map((_, i) => ({
      number: i + 1,
      status: i % 4 === 0 ? 'booked' : 'available'
    }))
  },
 
  {
    id: 3,
    busNo: 'WP-ABC-1234',
    model: 'Volvo B11R',
    route: 'Colombo-Kandy',
    seats: 54,
    ownerName: 'Sunil Transport Ltd',
    ownerContact: '+94712345678',
    seatLayout: Array(54).fill(null).map((_, i) => ({
      number: i + 1,
      status: i % 7 === 0 ? 'booked' : 'available' // demo mix
    }))
  },
  // Add seatLayout to all other buses the same way

  
];