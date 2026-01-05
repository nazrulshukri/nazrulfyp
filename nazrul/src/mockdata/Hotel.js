import marriottImage from '../img/assets/selectedimage/marriotlist/448666213.jpg';
import marriottImage1 from '../img/assets/selectedimage/marriotlist/king-superior-room.jpg';
import marriottImage2 from '../img/assets/selectedimage/marriotlist/thomas-moore-meeting.jpg';
import marriottImage3 from '../img/assets/selectedimage/marriotlist/front-view-of-the-hotel.jpg';
import marriottImage4 from '../img/assets/selectedimage/marriotlist/lobby.jpg';
import marriottImage5 from '../img/assets/selectedimage/marriotlist/the-den.jpg';
import marriottImage6 from '../img/assets/selectedimage/marriotlist/20181218-063234-largejpg.jpg';
import marriottImage7 from '../img/assets/selectedimage/marriotlist/lobby.jpg';
import marriottImage8 from '../img/assets/selectedimage/marriotlist/lobby.jpg';
import Sofitel from '../img/assets/selectedimage/Sofitel London St James/422088699.jpg'
import Sofitel1 from '../img/assets/selectedimage/Sofitel London St James/443940309.jpg'
import Sofitel2 from '../img/assets/selectedimage/Sofitel London St James/511969409.jpg'
import Sofitel3 from '../img/assets/selectedimage/Sofitel London St James/511969411.jpg'
import Sofitel4 from '../img/assets/selectedimage/Sofitel London St James/608585077.jpg'
import citizenM from '../img/assets/selectedimage/citizenM/270976329.jpg'
import citizenM1 from '../img/assets/selectedimage/citizenM/597738350.jpg'
import citizenM2 from '../img/assets/selectedimage/citizenM/433628776.jpg'
import citizenM3 from '../img/assets/selectedimage/citizenM/london-shoreditch-cm.jpg'
import citizenM4 from '../img/assets/selectedimage/citizenM/photo4jpg.jpg'
import sonder from '../img/assets/selectedimage/Henry Hotel/486092703.jpg'
import sonder1 from '../img/assets/selectedimage/Henry Hotel/486092817.jpg'
import sonder2 from '../img/assets/selectedimage/Henry Hotel/486092860.jpg'
import sonder3 from '../img/assets/selectedimage/Henry Hotel/486092874.jpg'
import sonder4 from '../img/assets/selectedimage/Henry Hotel/520519202.jpg'
import Melia from '../img/assets/selectedimage/melia/121073066.jpg'
import Melia1 from '../img/assets/selectedimage/melia/169024354.jpg'
import melia2 from '../img/assets/selectedimage/melia/351964984.jpg'
import melia3 from '../img/assets/selectedimage/melia/351966487.jpg'
import melia4 from '../img/assets/selectedimage/melia/592838457.jpg'
import pinancle from '../img/assets/selectedimage/pinancle/587773788.jpg'
import pinancle1 from '../img/assets/selectedimage/pinancle/328780242.jpg'
import pinancle2 from '../img/assets/selectedimage/pinancle/328780248.jpg'
import pinancle3 from '../img/assets/selectedimage/pinancle/328780420.jpg'
import pinancle4 from '../img/assets/selectedimage/pinancle/328780648.jpg'
import myfair from '../img/assets/selectedimage/myfair/357727730.jpg'
import myfair1 from '../img/assets/selectedimage/myfair/357727730.jpg'
import myfair2 from '../img/assets/selectedimage/myfair/357727730.jpg'
import myfair3 from '../img/assets/selectedimage/myfair/357727730.jpg'
import myfair4 from '../img/assets/selectedimage/myfair/357727730.jpg'
import ruben from '../img/assets/selectedimage/Ruben/220828102.jpg'
import ruben1 from '../img/assets/selectedimage/Ruben/220828954.jpg'
import ruben2 from '../img/assets/selectedimage/Ruben/92892076.jpg'
import ruben3 from '../img/assets/selectedimage/Ruben/92892106.jpg'
import ruben4 from '../img/assets/selectedimage/Ruben/86364506.jpg'
import chesterfield from '../img/assets/selectedimage/chesterfield/590596236.jpg'
import chesterfield1 from '../img/assets/selectedimage/chesterfield/149243357.jpg'
import chesterfield2 from '../img/assets/selectedimage/chesterfield/149644538.jpg'
import chesterfield3 from '../img/assets/selectedimage/chesterfield/149646749.jpg'
import chesterfield4 from '../img/assets/selectedimage/chesterfield/13751220.jpg'
import chesam2hotel from '../img/assets/selectedimage/New folder/MainPage.jpg'
import chesam2hotel1 from '../img/assets/selectedimage/New folder/547650968.jpg'
import chesam2hotel2 from '../img/assets/selectedimage/New folder/547650986.jpg'
import chesam2hotel3 from '../img/assets/selectedimage/New folder/547651007.jpg'
import chesam2hotel4 from '../img/assets/selectedimage/New folder/551972745.jpg'
import hotel41 from '../img/assets/selectedimage/41/13750089.jpg'
import hotel412 from '../img/assets/selectedimage/41/13882901.jpg'
import hotel413 from '../img/assets/selectedimage/41/220805748.jpg'
import hotel414 from '../img/assets/selectedimage/41/37874296.jpg'
import hotel415 from '../img/assets/selectedimage/41/586123322.jpg'
import botree from '../img/assets/selectedimage/Botree/499914088.jpg'
import botree2 from '../img/assets/selectedimage/Botree/505773348.jpg'
import botree3 from '../img/assets/selectedimage/Botree/505773500.jpg'
import botree4 from '../img/assets/selectedimage/Botree/505774094.jpg'
import botree5 from '../img/assets/selectedimage/Botree/505774444.jpg'
import intercontinentalImage from '../img/assets/Hotel List/the-kensington-exterior.jpg';
import intercontinentalImage1 from '../img/assets/Hotel List/the-kensington-hotel.jpg';
import intercontinentalImage2 from '../img/assets/Hotel List/the-kensington.jpg';
import intercontinentalImage3 from '../img/assets/Hotel List/westbury-hotel-kensington-1024x683.jpg';

export const generateMockHotels = (checkInDate, checkOutDate, location) => {
  const pricePerNight = {
      'Marriott': 150,
      'Citizenm': 139,
      'Sofitel London St James': 3741,
      'Sonder The Henry': 220,
      'InterContinental': 3206,
      '2 Chesham Hotel': 3038,
      'Pinancle': 2536,
      'Holiday Inn': 170,
      'Mayfair House': 2132,
      '41': 8000,
      'The Botree': 2665,
  };

  // Function to calculate the total price based on nights and price per night
  const calculateTotalPrice = (pricePerNight, nights) => pricePerNight * nights;

  // Calculate the number of nights based on check-in and check-out dates
  const calculateNights = (checkIn, checkOut) => {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      return Math.floor((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights(checkInDate, checkOutDate);

  // Return mock hotels with latitude and longitude
  return [
      {
        id: 1,
        hotelName: 'Marriott',
        starRating: 4, 
        roomType: '134 George Street, Westminster Borough, London, W1H 5DN, United Kingdom',
        images : [
            marriottImage,
            marriottImage1,
            marriottImage2,
            marriottImage3,
            marriottImage4,
            marriottImage5,
            marriottImage6,
            marriottImage7,
            marriottImage8
          ],
        checkIn: checkInDate,
        checkOut: checkOutDate,
        bedType: 'Single',
        roomSize: '5000',
        rating: '8.2',
        reviews: '1,200',
        pricePerNight: pricePerNight['Marriott'],
        totalPrice: calculateTotalPrice(pricePerNight['Marriott'], nights),
        location: location,
        latitude: 51.5074,  // London
        longitude: -0.1278,   // London
        amenities: ['Free WiFi', 'Swimming Pool', 'Gym'],
        distanceFromCenter: 2.5, // distance from center in km
        roomsAvailable: 5, // rooms left at this price
        oldPrice: 250, // original price before any discounts
        limitedDeal: true, // true if a limited-time deal applies
      },
      {
          id: 2,
          hotelName: 'Citizenm London Shoreditch Hotel',
          starRating:  4.5,
          roomType: 'Kings room',
          images : [
            citizenM,
            citizenM1,
            citizenM2,
            citizenM3,
            citizenM4
          ],
          checkIn: checkInDate,
          checkOut: checkOutDate,
          bedType: 'King size',
          roomSize: '8000',
          rating: '9.0',
          reviews: '5,000',
          pricePerNight: pricePerNight['Hilton'],
          totalPrice: calculateTotalPrice(pricePerNight['Hilton'], nights),
          location: location,
          latitude: 34.0522,  // Example latitude for Hilton
          longitude: -118.2437, // Example longitude for Hilton
          amenities: ['Free WiFi', 'Gym', 'Spa'],
          distanceFromCenter: 2.5, // distance from center in km
          roomsAvailable: 10, // rooms left at this price
          oldPrice: 158, // original price before any discounts
          limitedDeal: true, // true if a limited-time deal applies
      },
      {
          id: 3,
          hotelName: 'Sofitel London St James',
          starRating : 5,
          roomType: 'Superior King Room',
          images : [
            Sofitel,
            Sofitel1,
            Sofitel2,
            Sofitel3,
            Sofitel4
          ],
          checkIn: checkInDate,
          checkOut: checkOutDate,
          bedType: 'Queen Size',
          roomSize: '10000',
          rating: '9.1',
          pricePerNight: pricePerNight['Sofitel London St James'],
          totalPrice: calculateTotalPrice(pricePerNight['Sofitel London St James'], nights),
          location: location,
          latitude: 51.5074,  // Example latitude for Sheraton
          longitude: -0.1278, // Example longitude for Sheraton
          amenities: ['Airport Shuttle', 'Superb Breakfast', 'Non Smoking Rooms'],
          distanceFromCenter: 0.35, // distance from center in km
          roomsAvailable: 7, // rooms left at this price
          limitedDeal: true, // true if a limited-time deal applies
      },
      {
          id: 4,
          hotelName: 'Sonder The Henry',
          starRating : 4,
          roomType: 'Deluxe Queen Room',
          images : [
            sonder,
            sonder1,
            sonder2,
            sonder3,
            sonder4
          ],
          checkIn: checkInDate,
          checkOut: checkOutDate,
          bedType: 'Queen Room',
          roomSize: '8000',
          rating: '8.2',
          reviews: '1,200',
          pricePerNight: pricePerNight['Sonder The Henry'],
          totalPrice: calculateTotalPrice(pricePerNight['Sonder The Henry'], nights),
          location: location,
          latitude: 48.8566,  // Example latitude for Hyatt
          longitude: 2.3522,  // Example longitude for Hyatt
          amenities: ['Free WiFi', 'Swimming Pool', 'Restaurant'],
          distanceFromCenter: 2.4, // distance from center in km
          roomsAvailable: 1, // rooms left at this price
          limitedDeal: true, // true if a limited-time deal applies
      },
      {
          id: 5,
          hotelName: 'ME London by Melia - Covent Garden',
          starRating : 4.5,
          roomType: 'Westminster Borough, London',
          images : [
            Melia,
            Melia1,
            melia2,
            melia3,
            melia4
          ],
          checkIn: checkInDate,
          checkOut: checkOutDate,
          bedType: 'Always ME City View',
          roomSize: '8000',
          rating: '8.2',
          reviews: '1,200',
          pricePerNight: pricePerNight['InterContinental'],
          totalPrice: calculateTotalPrice(pricePerNight['InterContinental'], nights),
          location: location,
          latitude: 40.730610, // Example latitude for InterContinental
          longitude: -73.935242, // Example longitude for InterContinental
          amenities: ['Good Breakfast', 'Room Service', '3 restaurants','Balcony'],
          distanceFromCenter: 2.4, // distance from center in km
          roomsAvailable: 100, // rooms left at this price
          oldPrice: 5500, // original price before any discounts
          limitedDeal: true, // true if a limited-time deal applies
      },
      {
        id : 6,
        hotelName: '2 Chesham Hotel',
        starRating: 5,
        roomType: '40 trinity square, City of London, London, EC3N 4DJ, United Kingdom',
        images : [
            chesam2hotel,
            chesam2hotel1,
            chesam2hotel2,
            chesam2hotel3,
            chesam2hotel4
          ],
        checkIn: checkInDate,
        checkOut: checkOutDate,
        bedType: 'Superior Double room',
        roomSize: '9000',
        rating: '9.3',
        reviews: '1,200',
        pricePerNight: pricePerNight['2 Chesham Hotel'],
        totalPrice: calculateTotalPrice(pricePerNight['2 Chesham Hotel'], nights),
        location: location,
        latitude: 40.730610, // Example latitude for InterContinental
        longitude: -73.935242, // Example longitude for InterContinental
        amenities: ['Free WiFi', '24-hour front desk', 'Tea/coffee maker in all rooms'],
        distanceFromCenter: 2.4, // distance from center in km
        roomsAvailable: 100, // rooms left at this price
        oldPrice: 3303, // original price before any discounts
        limitedDeal: true, // true if a limited-time deal applies
    },
    {
        id: 7,
        hotelName: 'Cove Landmark Pinnacle',
        starRating : 4,
        roomType: '15 Westferry Road, Tower Hamlets, London,',
        images : [
            pinancle,
            pinancle1,
            pinancle2,
            pinancle3,
            pinancle4
          ],
        checkIn: checkInDate,
        checkOut: checkOutDate,
        bedType: 'standart studio',
        roomSize: '7000',
        rating: '8.9',
        reviews: '1,200',
        pricePerNight: pricePerNight['InterContinental'],
        totalPrice: calculateTotalPrice(pricePerNight['InterContinental'], nights),
        location: location,
        latitude: 40.730610, // Example latitude for InterContinental
        longitude: -73.935242, // Example longitude for InterContinental
        amenities: ['Aparments', 'Private Bathroom', 'Balcony'],
        distanceFromCenter: 4.6, // distance from center in km
        roomsAvailable: 100, // rooms left at this price
        oldPrice: 2756, // original price before any discounts
        limitedDeal: true, // true if a limited-time deal applies
    },
    {
        id: 8,
        hotelName: 'Rubens At The Palace',
        starRating : 5,
        roomType: '39 Buckingham Palace Road, Westminster Borough, London',
        images : [
            ruben,
            ruben1,
            ruben2,
            ruben3,
            ruben4
          ],
        checkIn: checkInDate,
        checkOut: checkOutDate,
        bedType: 'Royal Mews View Classic Double',
        roomSize: '6500',
        rating: '8.6',
        reviews: '4,378',
        pricePerNight: pricePerNight['InterContinental'],
        totalPrice: calculateTotalPrice(pricePerNight['InterContinental'], nights),
        location: location,
        latitude: 40.730610, // Example latitude for InterContinental
        longitude: -73.935242, // Example longitude for InterContinental
        amenities: ['Free WiFi', '2 restaurants', 'Very good breakfast'],
        distanceFromCenter: 1.5, // distance from center in km
        roomsAvailable: 1, // rooms left at this price
        oldPrice: 2756, // original price before any discounts
        limitedDeal: true, // true if a limited-time deal applies
    },
    {
        id: 9,
        hotelName: 'Mayfair House',
        starRating : 5,
        roomType: '22-28 Shepherd Street, Westminster Borough, London, W1J 7JH, United Kingdom',
        images : [
            myfair,
            myfair1,
            myfair2,
            myfair3,
            myfair4
          ],
        checkIn: checkInDate,
        checkOut: checkOutDate,
        bedType: 'Superior One-Bedroom Apartment',
        roomSize: '6000',
        rating: '8.1',
        reviews: '357',
        pricePerNight: pricePerNight['Mayfair House'],
        totalPrice: calculateTotalPrice(pricePerNight['Mayfair House'], nights),
        location: location,
        latitude: 40.730610, // Example latitude for InterContinental
        longitude: -73.935242, // Example longitude for InterContinental
        amenities: ['Apartments', 'family room', 'Air-conditioning'],
        distanceFromCenter: 1.4, // distance from center in km
        roomsAvailable: 80, // rooms left at this price
        oldPrice: 2300, // original price before any discounts
        limitedDeal: true, // true if a limited-time deal applies
    },
    {
        id: 10,
        hotelName: 'The Chesterfield Myfair',
        starRating : 4,
        roomType: '35 Charles Street, Mayfair, Westminster Borough, London, W1J 5EB, United Kingdom',
        images : [
            chesterfield,
            chesterfield1,
            chesterfield2,
            chesterfield3,
            chesterfield4
          ],
        checkIn: checkInDate,
        checkOut: checkOutDate,
        bedType: 'Superior One-Bedroom Apartment',
        roomSize: '6000',
        rating: '9.0',
        reviews: '3.077',
        pricePerNight: pricePerNight['InterContinental'],
        totalPrice: calculateTotalPrice(pricePerNight['InterContinental'], nights),
        location: location,
        latitude: 40.730610, // Example latitude for InterContinental
        longitude: -73.935242, // Example longitude for InterContinental
        amenities: ['Free WiFi', 'Private Pool', 'Spa'],
        distanceFromCenter: 1.4, // distance from center in km
        roomsAvailable: 80, // rooms left at this price
        oldPrice: 2300, // original price before any discounts
        limitedDeal: true, // true if a limited-time deal applies
    },
    {
        id: 11,
        hotelName: '41',
        starRating : 5,
        roomType: '41 Buckingham Palace Road, Westminster Borough, London, SW1W 0PS, United Kingdom',
        images : [
            hotel41,
            hotel412,
            hotel413,
            hotel414,
            hotel415
          ],
        checkIn: checkInDate,
        checkOut: checkOutDate,
        bedType: 'Superior One-Bedroom Apartment',
        roomSize: '6000',
        rating: '9.7',
        reviews: '975',
        pricePerNight: pricePerNight['InterContinental'],
        totalPrice: calculateTotalPrice(pricePerNight['InterContinental'], nights),
        location: location,
        latitude: 40.730610, // Example latitude for InterContinental
        longitude: -73.935242, // Example longitude for InterContinental
        amenities: ['Room service', '2 restaurants', 'Free WiFi'],
        distanceFromCenter: 2.9, // distance from center in km
        roomsAvailable: 2, // rooms left at this price
        oldPrice: 9429, // original price before any discounts
        limitedDeal: true, // true if a limited-time deal applies

    },
    {
        id: 12,
        hotelName: 'The BoTree',
        starRating : 5,
        roomType: '30 Marylebone Lane, Westminster Borough, London, W1U 2DR, United Kingdom',
        images : [
            botree,
            botree2,
            botree3,
            botree4,
            botree5
          ],
        checkIn: checkInDate,
        checkOut: checkOutDate,
        pricePerNight: pricePerNight['The BoTree'],
        totalPrice: calculateTotalPrice(pricePerNight['The BoTree'], nights),
        location: location,
        latitude: 40.730610, // Example latitude for InterContinental
        longitude: -73.935242, // Example longitude for InterContinental
        amenities: ['Non-smoking rooms', 'Fitness centre', 'Room service','Restaurant' , 'Free WiFi' , 'Family rooms' , '24-hour front desk' ,'Bar' , 'Very good breakfast'],
        distanceFromCenter: 2.9, // distance from center in km
        roomsAvailable: 5, // rooms left at this price
        limitedDeal: true, // true if a limited-time deal applies
    },
  ];
 
};
