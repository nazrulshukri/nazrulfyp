// src/components/api.js
import axios from 'axios';

const API_KEY = 'c15cf139f6mshbdc7c519124d649p1252bbjsn3e30f6339158'; // Replace with your actual API key

export const fetchFlights = async (params) => {
  try {
    const response = await axios.get('https://tripadvisor16.p.rapidapi.com/api/v1/flights/searchFlights', {
      params: {
        sourceAirportCode: params.sourceAirportCode,
        destinationAirportCode: params.destinationAirportCode,
        itineraryType: params.itineraryType,
        date: params.date,
        returnDate: params.returnDate,
        sortOrder: params.sortOrder,
        numAdults: params.numAdults,
        numSeniors: params.numSeniors,
        classOfService: params.classOfService,
        currencyCode: params.currencyCode,
        nearby: params.nearby,
        nonstop: params.nonstop,
        pageNumber: params.pageNumber
      },
      headers: {
        'x-rapidapi-host': 'tripadvisor16.p.rapidapi.com',
        'x-rapidapi-key': API_KEY
      }
    });
    return response.data; // Adjust based on the actual response structure
  } catch (error) {
    throw new Error('Error fetching flight data.');
  }
};
