import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './hotelselected.css';
import genius from '../img/assets/10.jpg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWalking, faLandmark, faSkiing, faUtensils, faTree, faTrain, faPlane} from '@fortawesome/free-solid-svg-icons';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { FaShareAlt, FaHeart } from "react-icons/fa";
import { faCalendarCheck, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { faWifi, faSwimmingPool, faDumbbell, faCar, faSpa, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FaClock, FaPaw, FaUserLock, FaUsers, FaCreditCard, FaChild, FaBed,FaLanguage } from "react-icons/fa"


const HotelSelected = () => {
  const location = useLocation();
  const { selectedHotel, totalPrice, startDate, returnDate, people } = location.state;
  const { images } = selectedHotel;
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // State to manage expanded/collapsed text

  const navigate = useNavigate();

  const handleNavigateToForm = () => {
    navigate('/hotelform', {
      state: {selectedHotel, totalPrice, startDate, returnDate, people }
    });
  };


  const handleNavigateToMap = () => {
    navigate('/maps'); // Redirects to the Maps route
  };


  const handleToggleText = () => {
    setIsExpanded(!isExpanded); // Toggle the state when the button is clicked
  };

  const handleMainImageClick = () => {
    console.log("modal"); // Add a message to indicate what happened
    setIsModalOpen(true); // Open modal when main image is clicked
  };

   // Close modal
   const handleCloseModal = (e) => {
    console.log("Modal background clicked:", e.target);
    // Ensure clicking on modal background closes it
    if (e.target === e.currentTarget) {
      setIsModalOpen(false);
      console.log("Modal closed"); // Log that the modal is closed
    }
  };

  // Handle thumbnail click
  const handleThumbnailClick = (image) => {
    console.log("Thumbnail clicked:", image);
    setSelectedImage(image);
    setIsModalOpen(true); // Open modal
  };

  const isThumbnailSelected = (image) => image === selectedImage;

  const [selectedRoom, setSelectedRoom] = useState(null);

  // Function to handle room selection
  const handleSelectRoom = (roomId) => {
    setSelectedRoom(roomId); // Set the selected room ID
  };
  
  const languages = [
    { code: 'de', name: 'German' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'it', name: 'Italian' },
    { code: 'pl', name: 'Polish' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ro', name: 'Romanian' },
  ];
 

  const [activeTab, setActiveTab] = useState("overview");

  // References for sections
  const overviewRef = useRef(null);
  const facilitiesRef = useRef(null);
  const houseRulesRef = useRef(null);
  const finePrintRef = useRef(null);
  const guestReviewsRef = useRef(null);

  const houseRules = {
    checkIn: "From 15:00",
    checkOut: "Until 11:00",
    cancellationPolicy: "Cancellation and prepayment policies vary according to accommodation type. Please check what conditions may apply to each option when making your selection.",
    childrenPolicy: "Children of any age are welcome. Children 4 years and above will be charged as adults at this property.",
    cotAndExtraBed: "Cots and extra beds are not available at this property.",
    ageRestriction: "The minimum age for check-in is 18.",
    pets: "Pets are not allowed.",
    groupsPolicy: "When booking more than 9 rooms, different policies and additional supplements may apply.",
    acceptedCards: ["American Express", "Visa", "Mastercard"],
  };


  const roomsData = [
    {
      roomType: "Superior Double Room",
      maxPersons: 2,
      price: "MYR 2,642",
      choices: [
        "Free toiletries",
        "Private bathroom with walk-in shower",
        "Flat-screen TV",
        "Free WiFi"
      ]
    },
    {
      roomType: "Deluxe Double Room",
      maxPersons: 2,
      price: "MYR 2,744",
      choices: [
        "Free cot available on request",
        "Tea and coffee maker",
        "City view"
      ]
    },
    {
      roomType: "Executive King",
      maxPersons: 2,
      price: "MYR 3,150",
      choices: [
        "Non-refundable",
        "Very good breakfast"
      ]
    },
    // Add more room objects as needed
  ];

  const getIconForAmenity = (amenity) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <FontAwesomeIcon icon={faWifi} />;
      case 'pool':
        return <FontAwesomeIcon icon={faSwimmingPool} />;
      case 'gym':
        return <FontAwesomeIcon icon={faDumbbell} />;
      case 'parking':
        return <FontAwesomeIcon icon={faCar} />;
      case 'spa':
        return <FontAwesomeIcon icon={faSpa} />;
      default:
        return <FontAwesomeIcon icon={faCheck} />;
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab.toLowerCase());
    // Scroll to the corresponding section
    switch (tab.toLowerCase()) {
      case 'overview':
        overviewRef.current.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'facilities':
        facilitiesRef.current.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'house rules':
        houseRulesRef.current.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'the fine print':
        finePrintRef.current.scrollIntoView({ behavior: 'smooth' });
        break;
      case 'guest reviews':
        guestReviewsRef.current.scrollIntoView({ behavior: 'smooth' });
        break;
      default:
        break;
    }
  };

  return (
    <div className="hotel-selected">
      <div className="container1">
        {/* Tab Navigation Section */}
        <div className="tab-header">
          {["Overview", "Info & prices", "Facilities", "House rules", "The fine print", "Guest reviews"].map((tab) => (
            <span
              key={tab}
              className={`tab-item ${activeTab === tab.toLowerCase() ? "active" : ""}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </span>
          ))}
        </div>

        <div className="hotel-header">
        <div className="hotel-container">
  <div className="hotel-info">
    <h1 className="hotel-name-rating">
      <span className="hotel-name">{selectedHotel.hotelName}</span>
      <span className="rating-stars">⭐️⭐️⭐️⭐️</span>
    </h1>
    <hr className="divider" />
    <p className="hotel-location">
      <FaMapMarkerAlt className="location-icon" />
      {selectedHotel.roomType}
      <span className="location-link" onClick={handleNavigateToMap}>
          Excellent location - show map
        </span>
    </p>
  </div>
</div>
          <div className="hotel-summary">
          <div className="review-container">
  <div className="review-box">
    <div className="review-text">
      <h3>Good</h3>
      <p>1,350 reviews</p>
    </div>
    <div className="score-box primary">
      <span>7.3</span>
    </div>
  </div>
  <div className="highlight-box">
    <p className="highlight-text">Great location!</p>
    <div className="score-box secondary">
      <span>8.5</span>
    </div>
  </div>
</div>
<div className="highlight-box1">
  <div className="date-info">
  <p className="checkin">
      <FontAwesomeIcon icon={faCalendarCheck} /> Check-in: <span>{startDate}</span>
    </p>
    <p className="checkout">
      <FontAwesomeIcon icon={faCalendarAlt} /> Check-out: <span>{returnDate}</span>
    </p>
  </div>
  <div className="action-buttons">
    <button className="icon-btn" aria-label="Share">
      <FaShareAlt className="icon share-icon" />
    </button>
    <button className="icon-btn" aria-label="Add to Favorites">
      <FaHeart className="icon heart-icon" />
    </button>
    <button className="reserve-btn">Reserve</button>
  </div>
</div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="image-gallery">
        <div className="main-image-container">
          <img
            src={selectedImage}
            alt="Main Hotel"
            className="main-image"
            onClick={handleMainImageClick} // Open modal on main image click
          />
        </div>

        <div className="thumbnail-gallery">
          {images.slice(0).map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className={`thumbnail-image ${isThumbnailSelected(image) ? 'selected' : ''}`}
              onClick={() => handleThumbnailClick(image)} // Set selected image
            />
          ))}
        </div>
      </div>

      {/* Modal for Image */}
      {isModalOpen && (
        <div className="modal" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Prevent modal close when clicking inside content */}
            <img src={selectedImage} alt="Selected Hotel" className="modal-image" />
            <span className="close-btn" onClick={handleCloseModal}>X</span>
          </div>
        </div>
      )}

        {/* Overview Section */}
        <div ref={overviewRef} className={`description-section ${activeTab === 'overview' ? 'active' : ''}`}>
      <div className="overview-container">
        <h2 className="overview-heading">
          Get the celebrity treatment with world-class service at {selectedHotel.hotelName}
        </h2>
        <p className="overview-description">
          Ideally located in the centre of London, Ruby Stella Hotel London offers air-conditioned rooms, a terrace, free WiFi and a bar. The property is around 1.7 km from Royal Opera House, 1.8 km from Lyceum Theatre and 1.6 km from Dominion Theatre. The property is allergy-free and is set 1.5 km from King's Cross St Pancras.
          <br />
          At the hotel, the rooms are equipped with a desk, a flat-screen TV, a private bathroom, bed linen and towels. All guest rooms feature a safety deposit box.
          <br />
          Breakfast is available every morning, and includes buffet, continental and vegetarian options.
          <br />
          Ruby Stella Hotel London can conveniently provide information at the reception to help guests to get around the area.
          <br />
          Popular points of interest near the accommodation include St Paul's Cathedral, King's Cross Station and British Museum. The nearest airport is London City Airport, 13 km from Ruby Stella Hotel London.
          <br />
          Distance in property description is calculated using © OpenStreetMap
          <br />
          {/* Conditional rendering for expanded content */}
          {isExpanded && (
            <>
              <br />
              Additional description goes here. You can add more details to make the content longer.
              <br />
              More information about amenities, rooms, or special offers at the hotel.
            </>
          )}
        </p>
         {/* Show More Button */}
        <button className="show-more" onClick={handleToggleText}>
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      </div>
    </div>

       {/* Facilities Section */}
<div ref={facilitiesRef} className={`facilities-container ${activeTab === 'facilities' ? 'active' : ''}`}>
  <h3>Most Popular Facilities</h3>
  <div className="facilities">
    {selectedHotel.amenities && selectedHotel.amenities.length > 0 ? (
      selectedHotel.amenities.map((amenity, index) => (
        <span key={index} className="facility-item">
          {getIconForAmenity(amenity)} {/* This will render the correct icon */}
          {amenity} {/* Display the amenity name */}
        </span>
      ))
    ) : (
      <p>No amenities available for this hotel.</p>
    )}
  </div>
</div>


        {/* Sign-in Section */}
      <div className="sign-in-banner">
        <div className="sign-in-content">
          <h2>Sign in, save money</h2>
          <p>To see if you can save 10% or more at this property, sign in.</p>
          <div className="button-group">
            <button className="sign-in-button">Sign in</button>
            <button className="create-account-button">Create an account</button>
          </div>
        </div>
        <img
          src={genius}
          alt="Genius Gift"
          className="genius-image"
        />
      </div>


      <div className="review-categories">
  <h3>Guest reviews:</h3>
  <div className="review-row">
    <div className="review-category50">
      <p>Staff</p>
      <div className="progress-bar900">
        <div className="progress90" style={{ width: "81%" }}></div>
      </div>
      <span className="rating">8.1</span>
    </div>
    <div className="review-category50">
      <p>Facilities</p>
      <div className="progress-bar900">
        <div className="progress90" style={{ width: "73%" }}></div>
      </div>
      <span className="rating">7.3</span>
    </div>
    <div className="review-category50">
      <p>Cleanliness</p>
      <div className="progress-bar900">
        <div className="progress90" style={{ width: "77%" }}></div>
      </div>
      <span className="rating">7.7</span>
    </div>
  </div>
  <div className="review-row">
    <div className="review-category50">
      <p>Comfort</p>
      <div className="progress-bar900">
        <div className="progress90" style={{ width: "78%" }}></div>
      </div>
      <span className="rating">7.8</span>
    </div>
    <div className="review-category50">
      <p>Value for money</p>
      <div className="progress-bar900">
        <div className="score3" style={{ width: "65%" }}></div>
      </div>
      <span className="rating">6.5</span>
    </div>
    <div className="review-category50">
      <p>Location</p>
      <div className="progress-bar900">
        <div className="progress90" style={{ width: "85%" }}></div>
      </div>
      <span className="rating">8.5</span>
    </div>
  </div>
</div>

        {/* Review Tags */}
        <div className="review-tags">
          {["Location", "Room", "Clean", "Breakfast", "Checkin"].map((tag) => (
            <button className="tag" key={tag}>
              + {tag}
            </button>
          ))}
        </div>
        

        <div ref={houseRulesRef} className={`house-rules ${activeTab === 'house rules' ? 'active' : ''}`}>
  <h3>House Rules</h3>
  <table className="house-rules-table">
    <tbody>
      <tr>
        <td><FaClock className="icon" /> <strong>Check-in:</strong></td>
        <td>{houseRules.checkIn}</td>
      </tr>
      <tr>
        <td><FaClock className="icon" /> <strong>Check-out:</strong></td>
        <td>{houseRules.checkOut}</td>
      </tr>
      <tr>
        <td><FaUserLock className="icon" /> <strong>Cancellation/Prepayment:</strong></td>
        <td>{houseRules.cancellationPolicy}</td>
      </tr>
      <tr>
        <td><FaChild className="icon" /> <strong>Children and Beds:</strong></td>
        <td>{houseRules.childrenPolicy}</td>
      </tr>
      <tr>
        <td><FaBed className="icon" /> <strong>Cot and Extra Bed Policies:</strong></td>
        <td>{houseRules.cotAndExtraBed}</td>
      </tr>
      <tr>
        <td><FaUserLock className="icon" /> <strong>Age Restriction:</strong></td>
        <td>{houseRules.ageRestriction}</td>
      </tr>
      <tr>
        <td><FaPaw className="icon" /> <strong>Pets:</strong></td>
        <td>{houseRules.pets}</td>
      </tr>
      <tr>
        <td><FaUsers className="icon" /> <strong>Groups:</strong></td>
        <td>{houseRules.groupsPolicy}</td>
      </tr>
      <tr>
      <td><FaCreditCard className="icon" /> <strong>Cards Accepted:</strong></td>
<td>
  {houseRules.acceptedCards.join(", ")}
  <div className="payment-icons">
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" 
      alt="Visa" 
      className="card-logo"
    />
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" 
      alt="American Express" 
      className="card-logo"
    />
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" 
      alt="MasterCard" 
      className="card-logo"
    />
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/3/31/PayPal_Logo2014.svg" 
      alt="PayPal" 
      className="card-logo"
    />
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" 
      alt="Apple Pay" 
      className="card-logo"
    />
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/1/19/Cash_template.svg" 
      alt="Cash" 
      className="card-logo"
    />
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/1/1e/RuPay-JCB_Global_Card.jpg" 
      alt="JCB" 
      className="card-logo"
       />
        </div>
        </td>
         </tr>
        </tbody>
        </table>
        </div>

        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Hotel surroundings</h2>
      <p style={{ color: '#666' }}>
        Guests loved walking around the neighbourhood! <span style={{ color: '#0071c2' }}>Excellent location - show map</span>
      </p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        
        {/* What's Nearby Section */}
        <div style={{ flex: '1 1 200px', margin: '10px' }}>
          <h3><FontAwesomeIcon icon={faWalking} /> What's nearby</h3>
          <ul>
            <li>Hyde Park - 550 m</li>
            <li>Home House Club - 650 m</li>
            <li>Grosvenor Square - 700 m</li>
            {/* Add more items */}
          </ul>
        </div>
        
        {/* Top Attractions Section */}
        <div style={{ flex: '1 1 200px', margin: '10px' }}>
          <h3><FontAwesomeIcon icon={faLandmark} /> Top attractions</h3>
          <ul>
            <li>Buckingham Palace - 1.9 km</li>
            <li>Regents Park - 2.4 km</li>
            <li>British Museum - 2 km</li>
            {/* Add more items */}
          </ul>
        </div>
        
        {/* Ski Lifts Section */}
        <div style={{ flex: '1 1 200px', margin: '10px' }}>
          <h3><FontAwesomeIcon icon={faSkiing} /> Ski lifts</h3>
          <ul>
            <li>Sandown Ski Centre Lift - 30 km</li>
            <li>Brentwood Park Lift - 37 km</li>
            {/* Add more items */}
          </ul>
        </div>
        
        {/* Restaurants & Cafes Section */}
        <div style={{ flex: '1 1 200px', margin: '10px' }}>
          <h3><FontAwesomeIcon icon={faUtensils} /> Restaurants & cafes</h3>
          <ul>
            <li>Restaurant · Meat Liqour - 100 m</li>
            {/* Add more items */}
          </ul>
        </div>
        
        {/* Natural Beauty Section */}
        <div style={{ flex: '1 1 200px', margin: '10px' }}>
          <h3><FontAwesomeIcon icon={faTree} /> Natural beauty</h3>
          <ul>
            <li>Lake · The Serpentine - 1.9 km</li>
            {/* Add more items */}
          </ul>
        </div>
        
        {/* Public Transport Section */}
        <div style={{ flex: '1 1 200px', margin: '10px' }}>
          <h3><FontAwesomeIcon icon={faTrain} /> Public transport</h3>
          <ul>
            <li>Metro · Bond Street - 150 m</li>
            {/* Add more items */}
          </ul>
        </div>
        
        {/* Closest Airports Section */}
        <div style={{ flex: '1 1 200px', margin: '10px' }}>
          <h3><FontAwesomeIcon icon={faPlane} /> Closest airports</h3>
          <ul>
            <li>London City Airport - 15 km</li>
            {/* Add more items */}
          </ul>
        </div>
        </div>
    </div>

        <div className="fine-print-container">
        <div className="fine-print-header">
        <h2 class="fine-print-title">The Fine Print</h2>
        <button class="availability-button">See Availability</button>
        </div>
          <p className="fine-print-subtitle">Need-to-know information for guests at this property</p>
      <hr className="divider" />

      <ul className="fine-print-list">
        <li>
          Rates are subject to a discretionary 5% Accommodation service charge.
        </li>
        <li>
          Guests are required to show a photo identification and credit card upon check-in. Please note that all Special Requests are subject to availability and additional charges may apply.
        </li>
        <li>
          Please inform The BoTree - Preferred Hotels and Resorts in advance of your expected arrival time. You can use the Special Requests box when booking, or contact the property directly with the contact details provided in your confirmation.
        </li>
        <li>
          Guests under the age of 18 can only check in with a parent or official guardian.
        </li>
        <li>
          In response to Coronavirus (COVID-19), additional safety and sanitation measures are in effect at this property.
        </li>
      </ul>
    </div>

    <table className="room-table">
      <thead>
        <tr>
          <th>Room Type</th>
          <th>Number of Guests</th>
          <th>Today's Price</th>
          <th>Your Choices</th>
          <th>Select Rooms</th>
        </tr>
      </thead>
      <tbody>
        {roomsData.map((room, index) => (
          <tr key={index}>
            <td>{room.roomType}</td>
            <td>Max persons: {room.maxPersons}</td>
            <td>{room.price}</td>
            <td>
              <ul>
                {room.choices.map((choice, idx) => (
                  <li key={idx}>{choice}</li>
                ))}
              </ul>
            </td>
            <td>
            <button
  className="select-button"
  onClick={() => handleSelectRoom('executive')}
>
  <span>{selectedRoom === 'executive' ? 'Selected' : 'Select rooms'}</span>
</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="facilities-container">
  <h2>Facilities of The BoTree - Preferred Hotels and Resorts</h2>
  <p>Great facilities! Review score: 9.2</p>

  {/* Most Popular Facilities Section */}
  <div className="facilities-section">
    <h3>Most Popular Facilities</h3>
    <div className="facility-wrapper">
      <div className="facility-item">
        <i className="facility-icon fas fa-smoking-ban"></i>
        <p className="facility-description">Non-smoking rooms</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-wheelchair"></i>
        <p className="facility-description">Facilities for disabled guests</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-concierge-bell"></i>
        <p className="facility-description">Room service</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-utensils"></i>
        <p className="facility-description">Restaurant</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-dumbbell"></i>
        <p className="facility-description">Fitness centre</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-wifi"></i>
        <p className="facility-description">Free WiFi</p>
      </div>
    </div>
  </div>

  {/* Additional Facilities Section */}
  <div className="facilities-section">
    <h3>Additional Facilities</h3>
    <div className="facility-wrapper">
      <div className="facility-item">
        <i className="facility-icon fas fa-sun"></i>
        <p className="facility-description">Outdoor furniture</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-paw"></i>
        <p className="facility-description">Pets allowed. No extra charges.</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-film"></i>
        <p className="facility-description">Evening entertainment</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-wine-glass-alt"></i>
        <p className="facility-description">Wine/champagne (Additional charge)</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-bread-slice"></i>
        <p className="facility-description">Special diet menus (on request)</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-coffee"></i>
        <p className="facility-description">Breakfast in the room</p>
      </div>
    </div>
  </div>

  {/* Internet & Parking Section */}
  <div className="facilities-section">
    <h3>Internet & Parking</h3>
    <div className="facility-wrapper">
      <div className="facility-item">
        <i className="facility-icon fas fa-wifi"></i>
        <p className="facility-description">WiFi is available in all areas and is free of charge</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-parking"></i>
        <p className="facility-description">No parking available</p>
      </div>
    </div>
  </div>

  {/* Reception & Services Section */}
  <div className="facilities-section">
    <h3>Reception & Services</h3>
    <div className="facility-wrapper">
      <div className="facility-item">
        <i className="facility-icon fas fa-file-invoice"></i>
        <p className="facility-description">Invoice provided</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-user-check"></i>
        <p className="facility-description">Private check-in/check-out</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-concierge-bell"></i>
        <p className="facility-description">Concierge service</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-luggage-cart"></i>
        <p className="facility-description">Luggage storage</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-calendar-alt"></i>
        <p className="facility-description">Tour desk</p>
      </div>
    </div>
  </div>

  {/* Cleaning & Business Services Section */}
  <div className="facilities-section">
    <h3>Cleaning & Business Services</h3>
    <div className="facility-wrapper">
      <div className="facility-item">
        <i className="facility-icon fas fa-broom"></i>
        <p className="facility-description">Daily housekeeping</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-iron"></i>
        <p className="facility-description">Ironing service (Additional charge)</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-dryer"></i>
        <p className="facility-description">Dry cleaning (Additional charge)</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-laundry"></i>
        <p className="facility-description">Laundry (Additional charge)</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-file-alt"></i>
        <p className="facility-description">Fax/photocopying (Additional charge)</p>
      </div>
    </div>
  </div>

  {/* Safety & Security Section */}
  <div className="facilities-section">
    <h3>Safety & Security</h3>
    <div className="facility-wrapper">
      <div className="facility-item">
        <i className="facility-icon fas fa-fire-extinguisher"></i>
        <p className="facility-description">Fire extinguishers</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-video"></i>
        <p className="facility-description">CCTV outside property</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-video-slash"></i>
        <p className="facility-description">CCTV in common areas</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-smoke"></i>
        <p className="facility-description">Smoke alarms</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-lock"></i>
        <p className="facility-description">Security alarm</p>
      </div>
    </div>
  </div>

  {/* General Amenities Section */}
  <div className="facilities-section">
    <h3>General Amenities</h3>
    <div className="facility-wrapper">
      <div className="facility-item">
        <i className="facility-icon fas fa-paw"></i>
        <p className="facility-description">Pet bowls</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-snowflake"></i>
        <p className="facility-description">Air conditioning</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-ban"></i>
        <p className="facility-description">Non-smoking throughout</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-bed"></i>
        <p className="facility-description">Allergy-free room</p>
      </div>
      <div className="facility-item">
        <i className="facility-icon fas fa-temperature-low"></i>
        <p className="facility-description">Heating</p>
      </div>
    </div>
  </div>

  {/* Wellness Section */}
  <div className="facilities-section">
    <h3>Wellness</h3>
    <div className="facility-wrapper">
      <div className="facility-item">
        <i className="facility-icon fas fa-dumbbell"></i>
        <p className="facility-description">Fitness centre</p>
      </div>
    </div>
  </div>

 {/* Languages Spoken Section */}
<div className="facilities-section1">
  <h3>
    <span className="icon">
      <FaLanguage /> {/* or use FaGlobe for a globe icon */}
    </span>
    Languages Spoken
  </h3>
  <div className="languages-container1">
    <p>German, English, Spanish, French, Italian, Polish, Portuguese, Romanian</p>
  </div>
</div>
</div>


     {/* Booking Summary */}
<div className="booking-summary">
  <p className="total-price">
    <span>Total Price for </span>
    <span className="guest-count">{people} guests</span>
    <span className="equals"> = </span>
    <span className="price">MYR {totalPrice}</span>
  </p>
  <button className="book-now-btn" onClick={handleNavigateToForm}>Book Now</button>
</div>
      </div>
    </div>
  );
};

export default HotelSelected;
