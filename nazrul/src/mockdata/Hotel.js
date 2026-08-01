import botree from '../img/assets/selectedimage/Botree/499914088.jpg'
import botree2 from '../img/assets/selectedimage/Botree/505773348.jpg'
import botree3 from '../img/assets/selectedimage/Botree/505773500.jpg'
import botree4 from '../img/assets/selectedimage/Botree/505774094.jpg'
import botree5 from '../img/assets/selectedimage/Botree/505774444.jpg'
import kensington from '../img/assets/Hotel List/the-kensington-exterior.jpg'
import kensington2 from '../img/assets/Hotel List/the-kensington-hotel.jpg'
import kensington3 from '../img/assets/Hotel List/the-kensington.jpg'
import citizen from '../img/assets/selectedimage/citizenM/london-shoreditch-cm.jpg'
import citizen2 from '../img/assets/selectedimage/citizenM/photo4jpg.jpg'
import citizen3 from '../img/assets/selectedimage/citizenM/597738350.jpg'
import marriott from '../img/assets/selectedimage/marriotlist/front-view-of-the-hotel.jpg'
import marriott2 from '../img/assets/selectedimage/marriotlist/king-superior-room.jpg'
import marriott3 from '../img/assets/selectedimage/marriotlist/lobby.jpg'
import sofitel from '../img/assets/selectedimage/Sofitel London St James/511969409.jpg'
import sofitel2 from '../img/assets/selectedimage/Sofitel London St James/608585077.jpg'
import sofitel3 from '../img/assets/selectedimage/Sofitel London St James/443940309.jpg'

const getNightCount = (startDate, returnDate) => {
  const start = new Date(startDate);
  const end = new Date(returnDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 1;
  }

  return Math.max(1, Math.ceil((end - start) / 86400000));
};

export const generateMockHotels = (startDate, returnDate, locationInput, people) => {
  const nights = getNightCount(startDate, returnDate);
  const guests = Math.max(1, Number(people) || 1);
  const buildHotel = (hotel) => ({
    ...hotel,
    location: locationInput || "London",
    oldPrice: Math.round(hotel.pricePerNight * 1.22),
    totalPrice: hotel.pricePerNight * nights * guests,
  });

  return [
    buildHotel({
      id: 1,
      hotelName: "The BoTree - Preferred Hotels and Resorts",
      latitude: 51.5074,
      longitude: -0.1272,
      brand: "Marriott",
      starRating: 5,
      rating: 9.2,
      reviews: 1350,
      distanceFromCenter: 1.2,
      roomType: "Superior Double Room",
      bedType: "1 large double bed",
      roomSize: 22,
      roomsAvailable: 3,
      limitedDeal: true,
      description: "A polished luxury base near London's theatre, dining, and shopping district with refined rooms, calm service, and premium wellness access.",
      pricePerNight: 350,
      amenities: ["WiFi", "Pool", "Gym", "Parking"],
      images: [
        botree,
        botree2,
        botree3,
        botree4,
        botree5,
      ],
    }),
    buildHotel({
      id: 2,
      hotelName: "The Kensington London",
      latitude: 51.4942,
      longitude: -0.1783,
      brand: "Hilton",
      starRating: 5,
      rating: 9.0,
      reviews: 2164,
      distanceFromCenter: 2.4,
      roomType: "Luxury King Room",
      bedType: "1 king bed",
      roomSize: 27,
      roomsAvailable: 5,
      limitedDeal: false,
      description: "Classic townhouse elegance with quiet lounges, premium bedding, and a refined South Kensington address close to museums and cafes.",
      pricePerNight: 420,
      amenities: ["WiFi", "Spa", "Parking"],
      images: [kensington, kensington2, kensington3],
    }),
    buildHotel({
      id: 3,
      hotelName: "citizenM London Shoreditch",
      latitude: 51.5245,
      longitude: -0.0804,
      brand: "Sheraton",
      starRating: 4,
      rating: 8.8,
      reviews: 3920,
      distanceFromCenter: 3.1,
      roomType: "Smart View Room",
      bedType: "1 extra-large double bed",
      roomSize: 19,
      roomsAvailable: 7,
      limitedDeal: true,
      description: "A smart urban stay built for fast-moving travellers, with app-style room controls, bold interiors, and a social lobby in Shoreditch.",
      pricePerNight: 280,
      amenities: ["WiFi", "Gym"],
      images: [citizen, citizen2, citizen3],
    }),
    buildHotel({
      id: 4,
      hotelName: "London Marriott Hotel Park Lane",
      latitude: 51.5138,
      longitude: -0.1586,
      brand: "Marriott",
      starRating: 5,
      rating: 9.1,
      reviews: 1887,
      distanceFromCenter: 1.7,
      roomType: "Executive City Suite",
      bedType: "1 king bed",
      roomSize: 31,
      roomsAvailable: 2,
      limitedDeal: true,
      description: "A high-touch Park Lane retreat with executive rooms, elevated service, and quick access to Hyde Park, Mayfair, and Oxford Street.",
      pricePerNight: 510,
      amenities: ["WiFi", "Pool", "Gym", "Spa"],
      images: [marriott, marriott2, marriott3],
    }),
    buildHotel({
      id: 5,
      hotelName: "Sofitel London St James",
      latitude: 51.5071,
      longitude: -0.1321,
      brand: "Hilton",
      starRating: 5,
      rating: 9.3,
      reviews: 2441,
      distanceFromCenter: 0.8,
      roomType: "Premium Heritage Room",
      bedType: "1 queen bed",
      roomSize: 25,
      roomsAvailable: 4,
      limitedDeal: false,
      description: "A grand St James address blending heritage architecture, spa-level comfort, and a polished central location near Piccadilly.",
      pricePerNight: 470,
      amenities: ["WiFi", "Spa", "Gym"],
      images: [sofitel, sofitel2, sofitel3],
    }),
  ];
};
