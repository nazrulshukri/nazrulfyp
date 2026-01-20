<<<<<<< HEAD


=======
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateMockHotels } from '../mockdata/Hotel'; // Assuming this function generates hotel data
import './Hotel.css';
import Slider from 'react-slick'; // Import react-slick for the image slider
// import malaysiaLogo from '../img/assets/images.png';
// import britishAirwaysLogo from '../img/assets/britishairways.jpg';
// import emiratesLogo from '../img/assets/Emirates_logo.png';
// import transparentHotelImage from '../img/assets/Hotel/Hotel1.jpeg';
// import luggage from '../img/assets/Hotel List/westbury-hotel-kensington-1024x683.jpg';
import markerImage from '../img/assets/maps/pngtree-vector-location-icon-png-image_2413694.jpg'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { FaBed, FaRuler, FaSearchLocation } from 'react-icons/fa';  // Importing Bed and Ruler icons

// const hotelLogos = {
//   'Malaysia Hotel': malaysiaLogo,
//   'British Hotel': britishAirwaysLogo,
//   'Emirates Hotel': emiratesLogo,
// };

function Hotel() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hotelParams } = location.state || {};
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  // const [people, setPeople] = useState(hotelParams?.people || 1);
  const [people] = useState(hotelParams?.people || 1);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(hotelParams?.checkInDate || '');
  const [returnDate, setReturnDate] = useState(hotelParams?.checkOutDate || '');
  const [locationInput, setLocationInput] = useState(hotelParams?.location || '');
  // const [selectedHotelId, setSelectedHotelId] = useState(null);
  const center = [51.5074, -0.1272]; // Centered on London


const markerIcon = new L.Icon({
  iconUrl: markerImage,
  iconSize: [32, 32],  // Adjust size as needed
  iconAnchor: [16, 32], // Anchor the icon at the base
  popupAnchor: [0, -32], // Popup position relative to the icon
});

  const [filters, setFilters] = useState({
    priceRange: 'any',
    starRating: 'any',
    location: 'any',
    hotelBrand: 'All',
  });

  useEffect(() => {
    try {
      // Load hotels from localStorage on page load
      const savedHotels = localStorage.getItem('hotels');
      if (savedHotels) {
        setHotels(JSON.parse(savedHotels));
        setFilteredHotels(JSON.parse(savedHotels));
      } else if (hotelParams) {
        // Generate hotels if not already in localStorage
        const generatedHotels = generateMockHotels(startDate, returnDate, locationInput, people);
        setHotels(generatedHotels);
        setFilteredHotels(generatedHotels);
        localStorage.setItem('hotels', JSON.stringify(generatedHotels));
      }
    } catch (error) {
      setError('Error fetching hotel data.');
      console.error('Error:', error);
    }
  }, [hotelParams, startDate, returnDate, locationInput, people]);

  useEffect(() => {
    // Save filters to localStorage whenever they change
    localStorage.setItem('filters', JSON.stringify(filters));
  }, [filters]);
  
  useEffect(() => {
    // Load filters from localStorage on component mount
    const savedFilters = localStorage.getItem('filters');
    if (savedFilters) {
      try {
        const parsedFilters = JSON.parse(savedFilters);
        // Ensure the parsed filters are valid before updating state
        if (parsedFilters && typeof parsedFilters === 'object') {
          setFilters(parsedFilters);
        }
      } catch (error) {
        console.error('Error parsing filters from localStorage:', error);
      }
    }
  }, []);
  

  useEffect(() => {
    const applyFilters = () => {
      let filtered = hotels;

      if (filters.priceRange !== 'any') {
        filtered = filtered.filter(hotel => hotel.price <= filters.priceRange);
      }

      if (filters.starRating !== 'any') {
        filtered = filtered.filter(hotel => hotel.starRating === filters.starRating);
      }

      if (filters.hotelBrand !== 'All') {
        filtered = filtered.filter(hotel => hotel.brand === filters.hotelBrand);
      }

      setFilteredHotels(filtered);
    };

    applyFilters();
  }, [hotels, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // const handleSelectHotel = (id) => {
  //   setSelectedHotelId(id);
  // };

  // const handleCloseDetails = () => {
  //   setSelectedHotelId(null);
  // };

  const handleShowOnMap = (hotel) => {
    navigate("/Maps", {
      state: {
        location: {
          coordinates: [hotel.latitude, hotel.longitude],
          name: hotel.hotelName,
        },
      },
    });
  };

    const handleSubmitHotel = (id) => {
      const selectedHotel = hotels.find(hotel => hotel.id === id);
    
      if (selectedHotel) {
        const hotelData = {
          id: selectedHotel.id,
          hotelName: selectedHotel.hotelName,
          checkInDate: startDate,
          checkOutDate: returnDate,
          price: selectedHotel.totalPrice * people,
          location: selectedHotel.location,
          images: selectedHotel.images,
          starRating: selectedHotel.starRating,
          roomtype : selectedHotel.roomType
        };
    
        // Log the hotel data being sent to the backend
        console.log('Sending hotel data to backend:', hotelData);
    
        // Send the selected hotel data to the backend to save in MongoDB
        fetch('http://localhost:5001/save-hotel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(hotelData),  // Send the hotel data in the request body
        })
        .then((response) => {
          // Log the response status and content
          console.log('Backend response status:', response.status);
          
          if (!response.ok) {
            throw new Error(`Failed to save hotel. Status: ${response.status}`);
          }
          
          return response.json(); // Parse the response as JSON
        })
        .then((data) => {
          console.log('Hotel saved successfully:', data);  // Log the success response
        })
        .catch((error) => {
          console.error('Error saving hotel:', error);  // Log any errors that occurred
        });
    
        // Log the navigation data
        console.log('Navigating to booking summary page with data:', {
          selectedHotel: hotelData,
          totalPrice: hotelData.price,
          locationInput,
          startDate,
          returnDate,
          people,
        });
    
        // Navigate to the booking summary page
        navigate('/Hotelselected', {
          state: {
            selectedHotel: selectedHotel,
            totalPrice: hotelData.price,
            locationInput,
            startDate,
            returnDate,
            people,
          },
        });
      } else {
        console.error('Hotel not found for id:', id);  // Log if no hotel is found
      }
    };

  return (
    <div className="hotel-results-container1">
    <div className="hotel-main-content1">
      <div className="filters5">
        <p className="filter-text">Filter Your Hotel:</p>
        <div className="filter-section">
          <label>
            Price Range:
            <select
              name="priceRange"
              value={filters.priceRange}
              onChange={handleFilterChange}
            >
              <option value="any">Any</option>
              <option value="100">Under MYR100</option>
              <option value="200">Under MYR200</option>
              <option value="300">Under MYR300</option>
            </select>
          </label>
        </div>
  
        <div className="filter-section">
          <label>
            Star Rating:
            <select
              name="starRating"
              value={filters.starRating}
              onChange={handleFilterChange}
            >
              <option value="any">Any</option>
              <option value="3">1 Stars</option>
              <option value="3">2 Stars</option>
              <option value="3">3 Stars</option>
              <option value="4">4 Stars</option>
              <option value="5">5 Stars</option>
            </select>
          </label>
        </div>
  
        <div className="filter-section">
          <label>
            Hotel Brand:
            <select
              name="hotelBrand"
              value={filters.hotelBrand}
              onChange={handleFilterChange}
            >
              <option value="All">All</option>
              <option value="Marriott">Marriot</option>
              <option value="Hilton">Hilton</option>
              <option value="Sheraton">Sheraton</option>
            </select>
          </label>
        </div>
  
        <div className="filter-section">
          <label>
            Location:
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="form-input"
              placeholder="Enter location"
            />
          </label>
          
          <div className="map-container1">
              <MapContainer
                center={center}
                zoom={6}
                style={{ height: '500px', width: '100%' }}
                scrollWheelZoom={true}
                gestureHandling="greedy"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
               {filteredHotels.map(hotel => (
      <Marker
        key={hotel.id}
        position={[hotel.latitude, hotel.longitude]} // Dynamically use latitude and longitude
        icon={markerIcon} // Set your custom marker icon
      >
        <Popup>
          <div>
            <h3>{hotel.hotelName}</h3>
            <p>{hotel.location}</p>
            <p>Rating: {hotel.rating} Stars</p>
            <p>{hotel.roomsAvailable} rooms left</p>
            <p>Price: MYR {hotel.totalPrice} per night</p>
          </div>
        </Popup>
      </Marker>
    ))}
              </MapContainer>
            </div>
          </div>
  
      
       
  
        <button className="filter-button" onClick={() => {/* Apply Filters */}}>
          Apply Filters
        </button>
      </div>

        <div className="hotel-results-content">
          <h1 className="hotel-results-title">Hotel Results</h1>
          {error && <p className="error">{error}</p>}
          <form className="booking-form" onSubmit={(e) => e.preventDefault()}>
    <div className="form-inline">
      <label>
        <span className="form-label">
          <i className="fas fa-map-marker-alt"></i> Location:
        </span>
        <input
          type="text"
          value={locationInput}
          onChange={(e) => {
            setLocationInput(e.target.value);
            localStorage.setItem('locationInput', e.target.value); // Save to localStorage
          }}        
          className="form-input"
          placeholder="Enter destination"
        />
      </label>
      <label>
        <span className="form-label">
          <i className="fas fa-calendar-alt"></i> Check-in Date:
        </span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            localStorage.setItem('startDate', e.target.value); // Save to localStorage
          }}
          className="form-input"
        />
      </label>
            <label>
        <span className="form-label">
          <i className="fas fa-calendar-alt"></i> Check-out Date:
             </span>
             <input
             type="date"
             value={returnDate}
              onChange={(e) => {
    setReturnDate(e.target.value);
    localStorage.setItem('returnDate', e.target.value); // Save to localStorage
  }}
              className="form-input"
             />
           </label>
            </div>
         </form>

          <div className="hotel-list-container23">
            <h2>London: {hotels.length} properties found</h2>
            <div className="hotel-list">
            {filteredHotels.map(hotel => (
                <div key={hotel.id} className="hotel-card1">
                  {/* Image Slider */}
                  <Slider
                    dots={true}
                    infinite={true}
                    speed={500}
                    slidesToShow={1}
                    slidesToScroll={1}
                  >
                    {hotel.images?.map((image, index) => (
                      <div key={index}>
                        <img
                          src={image}
                          alt={`Hotel ${hotel.hotelName}`}
                          className="hotel-image"
                        />
                      </div>
                    ))}
                  </Slider>
                  <div className="hotel-details1">
                    <div className="hotel-header">
                      <h3 className="hotel-name1">{hotel.hotelName}</h3>
                      <div className="star-rating1">
                        {'★'.repeat(hotel.starRating)}
                      </div>
                    </div>
                   <p className="location">
  {hotel.location} •{" "}
  <button
    type="button"
    onClick={() => handleShowOnMap(hotel)}
    className="map-link"
  >
    Show on map
  </button>
  • {hotel.distanceFromCenter} km from centre
</p>
                    {hotel.limitedDeal && <span className="deal-tag">Limited-time Deal</span>}
                    <p className="room-info">
                      <FaSearchLocation /> {hotel.roomType} • 
                      <FaBed /> {hotel.bedType} • 
                      <FaRuler /> {hotel.roomSize}m² 
                    </p>
                     {/* Display Rooms Available */}
                       <p className="availability">
                       {hotel.roomsAvailable} rooms left at this price!
                     </p>

                        {/* Rating Container */}
                        <div className="rating-container">
                        <div className="rating-section">
                        <span className="rating-score">{hotel.rating}</span>
                       </div>
                       </div>
                       <div className="reviews">{hotel.reviews} reviews</div>
                         {/* <div className="pricing-info">
                            <span className="old-price">MYR {hotel.oldPrice}</span>
                          <span className="current-price">MYR {hotel.totalPrice} per night</span>
                           </div> */}

                        <p className="availability">Available</p>
                        <div className="pricing-info">
                        <span className="old-price">MYR {hotel.oldPrice}</span>
                        <span className="current-price">MYR {hotel.pricePerNight} per night</span>
                         </div>
                        <button
                       className="availability-btn"
                      onClick={() => handleSubmitHotel(hotel.id)}
                       >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hotel; 
>>>>>>> d8f1e94 (Fix ESLint warnings and improve accessibility)
