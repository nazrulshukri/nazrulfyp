import botree from '../img/assets/selectedimage/Botree/499914088.jpg'
import botree2 from '../img/assets/selectedimage/Botree/505773348.jpg'
import botree3 from '../img/assets/selectedimage/Botree/505773500.jpg'
import botree4 from '../img/assets/selectedimage/Botree/505774094.jpg'
import botree5 from '../img/assets/selectedimage/Botree/505774444.jpg'

export const generateMockHotels = (startDate, returnDate, locationInput, people) => {
  return [
    {
      id: 1,
      hotelName: "The BoTree - Preferred Hotels and Resorts",
      location: locationInput || "London",
      latitude: 51.5074,
      longitude: -0.1272,
      starRating: 5,
      rating: 9.2,
      reviews: 1350,
      distanceFromCenter: 1.2,
      roomType: "Superior Double Room",
      bedType: "1 large double bed",
      roomSize: 22,
      roomsAvailable: 3,
      limitedDeal: true,
      oldPrice: 420,
      pricePerNight: 350,
      totalPrice: 350, // or compute using dates
      amenities: ["WiFi", "Pool", "Gym", "Parking"],
      images: [
        botree,
        botree2,
        botree3,
        botree4,
        botree5,
      ],
    },
  ];
};
