export const generateMockFlights = (departureDate, returnDate, origin, destination) => {
  const pricePerPerson = {
    'Malaysia Airlines': 3862,
    'British Airways': 3439,
    'Emirates': 4367,
    'Singapore Airlines': 4016,
    'Saudia': 4307,
    'Qatar': 5019,
    'Cathay Pacific': 5473,
    'Etihad': 4389,
    'Turkish Airlines': 4981,
    'Korean Air': 4600,
    'Air India': 4922,
    'All Nippon Airways': 3486,
  };

  // Function to calculate arrival time based on departure and flight duration in hours
  const calculateArrivalTime = (departureTime, flightDurationHours) => {
    const departureDateObj = new Date(departureTime);
    const arrivalDate = new Date(departureDateObj.getTime() + flightDurationHours * 60 * 60 * 1000);
    return arrivalDate.toISOString().substring(0, 19); // Formats to ISO without milliseconds
  };
  return [
    {
      id: 1,
      airline: 'Malaysia Airlines',
      flightNumber: 'MH360',
      departure: departureDate + 'T10:00:00',
      arrival: calculateArrivalTime(departureDate + 'T10:00:00', 7), // 7-hour flight
      price: pricePerPerson['Malaysia Airlines'],
      origin: origin,
      destination: destination,
      nonStop: true,
    },
    {
      id: 2,
      airline: 'British Airways',
      flightNumber: 'BA123',
      departure: departureDate + 'T15:00:00',
      arrival: calculateArrivalTime(departureDate + 'T15:00:00', 7), // 7-hour flight
      price: pricePerPerson['British Airways'],
      origin: origin,
      destination: destination,
      nonStop: false,
    },
    {
      id: 3,
      airline: 'Emirates',
      flightNumber: 'EK456',
      departure: departureDate + 'T18:00:00',
      arrival: calculateArrivalTime(departureDate + 'T18:00:00', 11), // 11-hour flight
      price: pricePerPerson['Emirates'],
      origin: origin,
      destination: destination,
      nonStop: true,
    },
    {
      id: 4,
      airline: 'Turkish Airlines',
      flightNumber: 'TK1983',
      departure: departureDate + 'T17:45:00',
      arrival: calculateArrivalTime(departureDate + 'T17:45:00', 13), // 13-hour flight
      price: pricePerPerson['Turkish Airlines'],
      origin: origin,
      destination: destination,
      nonStop: true,
    },
    {
      id: 5,
      airline: 'Qatar Airways',
      flightNumber: 'QR4990',
      departure: departureDate + 'T18:00:00',
      arrival: calculateArrivalTime(departureDate + 'T18:00:00', 12), // 12-hour flight
      price: pricePerPerson['Qatar'],
      origin: origin,
      destination: destination,
      nonStop: true,
    },
    {
      id: 6,
      airline: 'Etihad',
      flightNumber: 'EY456',
      departure: departureDate + 'T18:00:00',
      arrival: calculateArrivalTime(departureDate + 'T18:00:00', 14), // 14-hour flight
      price: pricePerPerson['Etihad'],
      origin: origin,
      destination: destination,
      nonStop: true,
    },
    {
      id: 7,
      airline: 'Cathay Pacific',
      flightNumber: 'CX888',
      departure: departureDate + 'T08:00:00',
      arrival: calculateArrivalTime(departureDate + 'T08:00:00', 13), // 13-hour flight
      price: pricePerPerson['Cathay Pacific'],
      origin: origin,
      destination: destination,
      nonStop: true,
    },
    {
      id: 8,
      airline: 'Saudia Airlines',
      flightNumber: 'SV301',
      departure: departureDate + 'T18:00:00',
      arrival: calculateArrivalTime(departureDate + 'T18:00:00', 10), // 10-hour flight
      price: pricePerPerson['Saudia'],
      origin: origin,
      destination: destination,
      nonStop: true,
    },
    {
      id: 9,
      airline: 'Singapore Airlines',
      flightNumber: 'SQ103',
      departure: departureDate + 'T18:00:00',
      arrival: calculateArrivalTime(departureDate + 'T18:00:00', 9), // 9-hour flight
      price: pricePerPerson['Singapore Airlines'],
      origin: origin,
      destination: destination,
      nonStop: true,
    },
    {
      id: 10,
      airline: 'Turkish Airlines',
      flightNumber: 'TK1984',
      departure: departureDate + 'T19:00:00',
      arrival: calculateArrivalTime(departureDate + 'T19:00:00', 11), // 11-hour flight
      price: pricePerPerson['Turkish Airlines'],
      origin: origin,
      destination: destination,
      nonStop: true,
    },
    {
      id: 11,
      airline: 'All Nippon Airways',
      flightNumber: 'A380',
      departure: departureDate + 'T08:00:00',
      arrival: calculateArrivalTime(departureDate + 'T08:00:00', 15), // 15-hour flight
      price: pricePerPerson['All Nippon Airways'],
      origin: origin,
      destination: destination,
      nonStop: true,
    },
  ];
};
