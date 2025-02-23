// returnlondon.js
export const generateMockReturnFlights1 = (departureDate, returnDate, origin, destination) => {
  const pricePerPerson = {
    'Malaysia Airlines': 1345,
    'British Airways': 2000,
    'Emirates': 1931.5,
    'Singapore Airlines': 1450,
    'Saudia Airlines': 1764,
    'Qatar': 1894,
    'Etihad': 1765,
    'Turkish Airlines': 1600,
    'Air India': 1876,
    'Korean Airline' : 1745,
    'Thai Airways' : 1650,
    'Oman Air' : 1867,
    'Biman Bangladesh Airlines' : 1580,
    'Finnair' : 1670,
    'Malaysia Airlines1': 1440,
    'China southern Airlines' : 1677,
    'KLM Royal Dutch Airlines' : 1674,
    'Air France Airline' : 1654,
    'Emirates1': 1453,
    'Kuwait Airways' : 1545,
  };

  const calculateArrivalTime = (departureTime, flightDurationHours) => {
    return new Date(new Date(departureTime).getTime() + flightDurationHours * 60 * 60 * 1000)
      .toISOString().substring(0, 19);
  };

  return [
    {
      id: 1,
      airline: 'Malaysia Airlines',
      flightNumber: 'A350',
      departure: returnDate + 'T10:00:00',
      arrival: calculateArrivalTime(returnDate + 'T10:00:00', 13),
      price: pricePerPerson['Malaysia Airlines'],
      origin: destination, // London
      destination: origin,  // Malaysia
      nonStop: true,
    },
    {
      id: 2,
      airline: 'British Airways',
      flightNumber: 'BA124',
      departure: returnDate + 'T15:00:00',
      arrival: calculateArrivalTime(returnDate + 'T15:00:00', 15),
      price: pricePerPerson['British Airways'],
      origin: destination,
      destination: origin,
      nonStop: false,
    },
    {
      id: 3,
      airline: 'Qatar',
      flightNumber: 'A330',
      departure: returnDate + 'T20:00:00',
      arrival: calculateArrivalTime(returnDate + 'T20:00:00', 18),
      price: pricePerPerson['Qatar'],
      origin: destination,
      destination: origin,
      nonStop: true,
    },
    {
      id: 4,
      airline: 'Emirates',
      flightNumber: 'A350-900',
      departure: returnDate + 'T20:00:00',
      arrival: calculateArrivalTime(returnDate + 'T20:00:00', 14),
      price: pricePerPerson['Emirates'],
      origin: destination,
      destination: origin,
      nonStop: true,
    },
    {
      id: 5,
      airline: 'Saudia Airlines',
      flightNumber: 'SV118',
      departure: returnDate + 'T20:00:00',
      arrival: calculateArrivalTime(returnDate + 'T20:00:00', 16),
      price: pricePerPerson['Saudia Airlines'],
      origin: destination,
      destination: origin,
      nonStop: true,
    },
    {
      id: 6,
      airline: 'Korean Airline',
      flightNumber: 'Boeing 747',
      departure: returnDate + 'T20:00:00',
      arrival: calculateArrivalTime(returnDate + 'T20:00:00', 17),
      price: pricePerPerson['Korean Airline'],
      origin: destination,
      destination: origin,
      nonStop: true,
    },
    {
      id: 7,
      airline: 'Air India',
      flightNumber: 'AI 737 Max',
      departure: returnDate + 'T20:00:00',
      arrival: calculateArrivalTime(returnDate + 'T20:00:00', 18),
      price: pricePerPerson['Air India'],
      origin: destination,
      destination: origin,
      nonStop: true,
    },
    {
      id: 8,
      airline: 'Etihad',
      flightNumber: 'EY 418',
      departure: returnDate + 'T20:00:00',
      arrival: calculateArrivalTime(returnDate + 'T20:00:00', 19),
      price: pricePerPerson['Etihad'],
      origin: destination,
      destination: origin,
      nonStop: true,
    },
    {
      id: 9,
      airline: 'Turkish Airlines',
      flightNumber: 'TA 450',
      departure: returnDate + 'T20:00:00',
      arrival: calculateArrivalTime(returnDate + 'T20:00:00', 14),
      price: pricePerPerson['Turkish Airlines'],
      origin: destination,
      destination: origin,
      nonStop: true,
    },
    {
      id: 10,
      airline: 'Singapore Airlines',
      flightNumber: 'QR5001',
      departure: returnDate + 'T20:00:00',
      arrival: calculateArrivalTime(returnDate + 'T20:00:00', 15),
      price: pricePerPerson['Singapore Airlines'],
      origin: destination,
      destination: origin,
      nonStop: true,
    },
    {
      id: 11,
      airline: 'Oman Air',
      flightNumber: 'QR5001',
      departure: returnDate + 'T20:00:00',
      arrival: calculateArrivalTime(returnDate + 'T20:00:00', 16),
      price: pricePerPerson['Oman Air'],
      origin: destination,
      destination: origin,
      nonStop: true,
    },
    {
      id: 12,
      airline: 'Biman Bangladesh Airlines',
      flightNumber: 'QR5001',
      departure: returnDate + 'T20:00:00',
      arrival: calculateArrivalTime(returnDate + 'T20:00:00', 20),
      price: pricePerPerson['Biman Bangladesh Airlines'],
      origin: destination,
      destination: origin,
      nonStop: true,
    },
    {
      id: 13,
      airline: 'Kuwait Airways',
      flightNumber: 'QR5001',
      departure: returnDate + 'T20:00:00',
      arrival: calculateArrivalTime(returnDate + 'T20:00:00', 15),
      price: pricePerPerson['Kuwait Airways'],
      origin: destination,
      destination: origin,
      nonStop: true,
    },
    {
      id: 14,
      airline: 'Thai Airways',
      flightNumber: 'QR5001',
      departure: returnDate + 'T20:00:00',
      arrival: calculateArrivalTime(returnDate + 'T20:00:00', 17),
      price: pricePerPerson['Thai Airways'],
      origin: destination,
      destination: origin,
      nonStop: true,
    },
    {
      id: 15,
      airline: 'Emirates Airline',
      flightNumber: 'QR5001',
      departure: returnDate + 'T20:00:00',
      arrival: calculateArrivalTime(returnDate + 'T20:00:00', 18),
      price: pricePerPerson['Emirates1'],
      origin: destination,
      destination: origin,
      nonStop: true,
    },
    {
      id: 16,
      airline: 'Malaysia Airlines',
      flightNumber: 'Boeing 777',
      departure: returnDate + 'T20:00:00',
      arrival: calculateArrivalTime(returnDate + 'T20:00:00', 13),
      price: pricePerPerson['Malaysia Airlines1'],
      origin: destination,
      destination: origin,
      nonStop: true,
    },
    {
      id: 17,
      airline: 'Finnair',
      flightNumber: 'ATR 72',
      departure: returnDate + 'T20:00:00',
      arrival: calculateArrivalTime(returnDate + 'T20:00:00', 16),
      price: pricePerPerson['Finnair'],
      origin: destination,
      destination: origin,
      nonStop: true,
    },
    {
      id: 18,
      airline: 'China southern Airlines',
      flightNumber: 'B737',
      departure: returnDate + 'T20:00:00',
      arrival: calculateArrivalTime(returnDate + 'T20:00:00', 17),
      price: pricePerPerson['China southern Airlines'],
      origin: destination,
      destination: origin,
      nonStop: true,
    },
    {
      id: 19,
      airline: 'KLM Royal Dutch Airlines',
      flightNumber: 'A321 NEO',
      departure: returnDate + 'T20:00:00',
      arrival: calculateArrivalTime(returnDate + 'T20:00:00', 18),
      price: pricePerPerson['KLM Royal Dutch Airlines'],
      origin: destination,
      destination: origin,
      nonStop: true,
    },
    {
      id: 20,
      airline: 'Air France Airline',
      flightNumber: 'AF320',
      departure: returnDate + 'T20:00:00',
      arrival: calculateArrivalTime(returnDate + 'T20:00:00', 19),
      price: pricePerPerson['Air France Airline'],
      origin: destination,
      destination: origin,
      nonStop: true,
    },
  ];
};
