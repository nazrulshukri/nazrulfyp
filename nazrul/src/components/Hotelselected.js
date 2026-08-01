import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faWifi,faSwimmingPool,
  faDumbbell,
  faCar,
  faSpa,
  faCheck,
  faCalendarCheck,
  faCalendarAlt,
  faWalking,
  faLandmark,
  faSkiing,
  faUtensils,
  faTree,
  faTrain,
  faPlane,
} from "@fortawesome/free-solid-svg-icons";

import {
  FaMapMarkerAlt,
  FaShareAlt,
  FaHeart,
  FaArrowRight,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaUserLock,
  FaChild,
  FaBed,
  FaPaw,
  FaUsers,
  FaCreditCard,
  FaGift,
  FaLanguage,
  FaPercent,
  FaTimes,
  FaImages,
  FaChevronLeft,
  FaChevronRight,
  FaShieldAlt,
  FaCheck,
} from "react-icons/fa";

import genius from "../img/assets/10.jpg";

const SIDE_GALLERY_PAGE_SIZE = 3;
const DEFAULT_GUEST_COUNT = 3;

const formatMYR = (value) => `MYR ${Number(value || 0).toLocaleString("en-MY")}`;

const toNumber = (value) => {
  if (typeof value === "number") {
    return value;
  }

  return Number(String(value || "").replace(/[^\d.]/g, "")) || 0;
};

const HotelSelected = () => {
  const location = useLocation();
  const savedHotelState = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('hotelSelectedDraft') || 'null');
    } catch (error) {
      return null;
    }
  }, []);
  const { selectedHotel, totalPrice, startDate, returnDate, people } = location.state || savedHotelState || {};
  const images = useMemo(() => selectedHotel?.images || [], [selectedHotel]);
  const [selectedImage, setSelectedImage] = useState(images[0] || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [galleryPage, setGalleryPage] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false); // State to manage expanded/collapsed text
  const [isSavingsPopupOpen, setIsSavingsPopupOpen] = useState(false);

  const navigate = useNavigate();

  const selectedImageIndex = images.findIndex((image) => image === selectedImage);
  const activeImageIndex = selectedImageIndex >= 0 ? selectedImageIndex : 0;
  const galleryPageCount = Math.max(1, Math.ceil(images.length / SIDE_GALLERY_PAGE_SIZE));
  const sideGalleryStart = galleryPage * SIDE_GALLERY_PAGE_SIZE;
  const sideGalleryImages = images.slice(sideGalleryStart, sideGalleryStart + SIDE_GALLERY_PAGE_SIZE);
  const guestCount = Math.max(1, Number(people) || DEFAULT_GUEST_COUNT);

  useEffect(() => {
    if (images.length === 0) {
      setSelectedImage("");
      setGalleryPage(0);
      return;
    }

    if (images.length > 0 && !images.includes(selectedImage)) {
      setSelectedImage(images[0]);
    }

    setGalleryPage((page) => Math.min(page, Math.max(0, Math.ceil(images.length / SIDE_GALLERY_PAGE_SIZE) - 1)));
  }, [images, selectedImage]);

  const handleNavigateToForm = () => {
    sessionStorage.setItem(
      'hotelBookingDraft',
      JSON.stringify({ selectedHotel, totalPrice, startDate, returnDate, people })
    );

    navigate('/hotelform', {
      state: {selectedHotel, totalPrice, startDate, returnDate, people }
    });
  };


  const handleNavigateToMap = () => {
    const hasCoordinates = Number.isFinite(selectedHotel?.latitude) && Number.isFinite(selectedHotel?.longitude);

    navigate('/Maps', {
      state: {
        location: {
          coordinates: hasCoordinates ? [selectedHotel.latitude, selectedHotel.longitude] : undefined,
          name: selectedHotel?.hotelName,
          brand: selectedHotel?.brand,
          rating: selectedHotel?.rating,
          reviews: selectedHotel?.reviews,
          pricePerNight: selectedHotel?.pricePerNight || selectedHotel?.price,
          roomsAvailable: selectedHotel?.roomsAvailable,
          distanceFromCenter: selectedHotel?.distanceFromCenter,
        },
        from: "/Hotelselected",
      },
    });
  };


  const handleToggleText = () => {
    setIsExpanded(!isExpanded); // Toggle the state when the button is clicked
  };

  const openGalleryModal = (image = selectedImage, imageIndex = activeImageIndex) => {
    if (image) {
      setSelectedImage(image);
    }

    if (imageIndex >= 0) {
      setGalleryPage(Math.floor(imageIndex / SIDE_GALLERY_PAGE_SIZE));
    }

    setIsModalOpen(true);
  };

  const closeGalleryModal = () => {
    setIsModalOpen(false);
  };

  const handleGalleryBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      closeGalleryModal();
    }
  };

  const selectGalleryImage = (image, index) => {
    setSelectedImage(image);
    setGalleryPage(Math.floor(index / SIDE_GALLERY_PAGE_SIZE));
  };

  const handleGalleryPageChange = (direction) => {
    setGalleryPage((page) => (page + direction + galleryPageCount) % galleryPageCount);
  };

  const isThumbnailSelected = (image) => image === selectedImage;

  const [selectedRoom, setSelectedRoom] = useState(null);

  // Function to handle room selection
  const handleSelectRoom = (roomId) => {
    setSelectedRoom(roomId); // Set the selected room ID
  };
  
  // const languages = [
  //   { code: 'de', name: 'German' },
  //   { code: 'en', name: 'English' },
  //   { code: 'es', name: 'Spanish' },
  //   { code: 'fr', name: 'French' },
  //   { code: 'it', name: 'Italian' },
  //   { code: 'pl', name: 'Polish' },
  //   { code: 'pt', name: 'Portuguese' },
  //   { code: 'ro', name: 'Romanian' },
  // ];
 

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
      priceValue: 2642,
      badge: "Best value",
      description: "Bright comfort room with smart essentials for a smooth city stay.",
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
      priceValue: 2744,
      badge: "Guest favourite",
      description: "A calmer room upgrade with extra convenience and a refined city feel.",
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
      priceValue: 3150,
      badge: "Premium pick",
      description: "More space, stronger benefits, and breakfast value included.",
      choices: [
        "Non-refundable",
        "Very good breakfast"
      ]
    },
    // Add more room objects as needed
  ];

  const getRoomsNeeded = (room) => Math.max(1, Math.ceil(guestCount / room.maxPersons));
  const getRoomTotal = (room) => (room.priceValue || toNumber(room.price)) * getRoomsNeeded(room);
  const selectedRoomData = roomsData.find((room) => room.roomType === selectedRoom);
  const displayTotalPrice = selectedRoomData
    ? getRoomTotal(selectedRoomData)
    : toNumber(totalPrice) || getRoomTotal(roomsData[0]);

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

  if (!selectedHotel) {
    return (
      <div className="hotel-selected">
        <div className="container1">
          <h2>No hotel selected</h2>
          <p>Please choose a hotel from the results page to continue your booking.</p>
          <button className="book-now-btn" onClick={() => navigate('/Hotel')}>Back to Hotels</button>
        </div>
      </div>
    );
  }

  return (
    <div className="hotel-selected">
      <div className="container1">
        <section className="selected-hotel-hero" aria-label="Selected hotel overview">
          <div className="selected-hotel-hero-media">
            {selectedImage && <img src={selectedImage} alt={selectedHotel.hotelName} />}
          </div>
          <div className="selected-hotel-hero-copy">
            <span className="selected-hero-kicker">{selectedHotel.brand || "Premium stay"} collection</span>
            <h1>{selectedHotel.hotelName}</h1>
            <p>
              A refined booking experience with clear dates, room details, guest confidence,
              and a faster path to reserve your stay.
            </p>
            <div className="selected-hero-chips">
              <span>{selectedHotel.rating || "9.2"} guest rating</span>
              <span>{people || 1} guest{Number(people) > 1 ? "s" : ""}</span>
              <span>{startDate || "Check-in"} to {returnDate || "Check-out"}</span>
            </div>
          </div>
          <div className="selected-hero-action">
            <span>Total stay</span>
            <strong>MYR {totalPrice || selectedHotel.totalPrice || selectedHotel.pricePerNight}</strong>
            <button className="reserve-btn hero-reserve-btn" onClick={handleNavigateToForm}>
              <span>Reserve now</span>
              <FaArrowRight />
            </button>
          </div>
        </section>

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
    <button className="reserve-btn" onClick={handleNavigateToForm}>Reserve</button>
  </div>
</div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="image-gallery" aria-label="Hotel photo gallery">
          <div className="main-image-container">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={`${selectedHotel.hotelName} main view`}
                className="main-image"
                onClick={() => openGalleryModal(selectedImage, activeImageIndex)}
              />
            ) : (
              <div className="gallery-empty-state">No photos available</div>
            )}

            <button
              type="button"
              className="view-gallery-btn"
              onClick={() => openGalleryModal(selectedImage, activeImageIndex)}
              disabled={images.length === 0}
            >
              <FaImages />
              <span>View gallery</span>
              <strong>{images.length}</strong>
            </button>
          </div>

          <aside className="gallery-side-panel" aria-label="Hotel gallery thumbnails">
            <div className="side-gallery-header">
              <span>Photos</span>
              <strong>{galleryPage + 1}/{galleryPageCount}</strong>
            </div>
            <div className="thumbnail-gallery">
              {sideGalleryImages.map((image, offset) => {
                const imageIndex = sideGalleryStart + offset;

                return (
                  <button
                    type="button"
                    key={`${image}-${imageIndex}`}
                    className={`thumbnail-image ${isThumbnailSelected(image) ? 'selected' : ''}`}
                    onClick={() => selectGalleryImage(image, imageIndex)}
                    aria-label={`Show photo ${imageIndex + 1}`}
                  >
                    <img src={image} alt={`${selectedHotel.hotelName} thumbnail ${imageIndex + 1}`} />
                    <span>{imageIndex + 1}</span>
                  </button>
                );
              })}
            </div>
            {images.length > SIDE_GALLERY_PAGE_SIZE && (
              <div className="side-gallery-controls">
                <button
                  type="button"
                  onClick={() => handleGalleryPageChange(-1)}
                  aria-label="Previous gallery page"
                >
                  <FaChevronLeft />
                </button>
                <button
                  type="button"
                  onClick={() => handleGalleryPageChange(1)}
                  aria-label="Next gallery page"
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </aside>
        </div>

      {/* Modal for Image */}
      {isModalOpen && (
        <div className="gallery-popup-backdrop" onClick={handleGalleryBackdropClick}>
          <div className="gallery-popup" role="dialog" aria-modal="true" aria-label={`${selectedHotel.hotelName} full gallery`}>
            <div className="gallery-popup-header">
              <div>
                <span>Gallery</span>
                <h2>{selectedHotel.hotelName}</h2>
                <p>{images.length} photo{images.length === 1 ? '' : 's'} available</p>
              </div>
              <button type="button" className="gallery-popup-close" onClick={closeGalleryModal} aria-label="Close gallery popup">
                <FaTimes />
              </button>
            </div>

            <div className="gallery-popup-body">
              <div className="gallery-popup-main">
                {selectedImage && (
                  <img src={selectedImage} alt={`${selectedHotel.hotelName} selected view`} />
                )}
              </div>
              <div className="gallery-popup-list" aria-label="All hotel gallery images">
                {images.map((image, index) => (
                  <button
                    type="button"
                    key={`${image}-popup-${index}`}
                    className={`gallery-popup-thumb ${isThumbnailSelected(image) ? 'selected' : ''}`}
                    onClick={() => selectGalleryImage(image, index)}
                  >
                    <img src={image} alt={`${selectedHotel.hotelName} gallery view ${index + 1}`} />
                    <span>Photo {index + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

        <div className="selected-overview-layout">
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
        <button
          className={`show-more ${isExpanded ? 'expanded' : ''}`}
          onClick={handleToggleText}
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>
    </div>

        {/* Sign-in Section */}
      <div className="sign-in-banner selected-savings-card">
        <div className="savings-card-orb">
          <FaGift />
        </div>
        <div className="sign-in-content">
          <span className="savings-kicker"><FaPercent /> Member deal</span>
          <h2>Sign in, save money</h2>
          <p>To see if you can save 10% or more at this property, sign in.</p>
          <div className="button-group">
            <button className="sign-in-button" onClick={() => setIsSavingsPopupOpen(true)}>
              View savings
            </button>
            <button className="create-account-button" onClick={() => navigate('/signup')}>
              Create an account
            </button>
          </div>
        </div>
        <div className="savings-visual">
          <img
            src={genius}
            alt="Genius Gift"
            className="genius-image"
          />
          <span>10%+</span>
        </div>
      </div>
      </div>

      {isSavingsPopupOpen && (
        <div className="savings-popup-overlay" onClick={() => setIsSavingsPopupOpen(false)}>
          <div className="savings-popup" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="savings-popup-close"
              onClick={() => setIsSavingsPopupOpen(false)}
              aria-label="Close savings popup"
            >
              <FaTimes />
            </button>
            <span className="savings-kicker"><FaPercent /> Genius member price</span>
            <h2>Unlock a private hotel saving</h2>
            <p>
              Sign in to check whether this stay has an extra member discount, faster checkout,
              and saved booking details for your trip.
            </p>
            <div className="savings-popup-stat">
              <strong>10%+</strong>
              <span>possible saving on selected stays</span>
            </div>
            <div className="button-group">
              <button className="sign-in-button" onClick={() => navigate('/signin')}>
                Sign in
              </button>
              <button className="create-account-button" onClick={() => navigate('/signup')}>
                Create an account
              </button>
            </div>
          </div>
        </div>
      )}

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

        <div className="hotel-surroundings">
      <h2>Hotel surroundings</h2>
      <p>
        Guests loved walking around the neighbourhood! <span onClick={handleNavigateToMap}>Excellent location - show map</span>
      </p>
      
      <div className="surroundings-grid">
        
        {/* What's Nearby Section */}
        <div className="surroundings-card">
          <h3><FontAwesomeIcon icon={faWalking} /> What's nearby</h3>
          <ul>
            <li>Hyde Park - 550 m</li>
            <li>Home House Club - 650 m</li>
            <li>Grosvenor Square - 700 m</li>
            {/* Add more items */}
          </ul>
        </div>
        
        {/* Top Attractions Section */}
        <div className="surroundings-card">
          <h3><FontAwesomeIcon icon={faLandmark} /> Top attractions</h3>
          <ul>
            <li>Buckingham Palace - 1.9 km</li>
            <li>Regents Park - 2.4 km</li>
            <li>British Museum - 2 km</li>
            {/* Add more items */}
          </ul>
        </div>
        
        {/* Ski Lifts Section */}
        <div className="surroundings-card">
          <h3><FontAwesomeIcon icon={faSkiing} /> Ski lifts</h3>
          <ul>
            <li>Sandown Ski Centre Lift - 30 km</li>
            <li>Brentwood Park Lift - 37 km</li>
            {/* Add more items */}
          </ul>
        </div>
        
        {/* Restaurants & Cafes Section */}
        <div className="surroundings-card">
          <h3><FontAwesomeIcon icon={faUtensils} /> Restaurants & cafes</h3>
          <ul>
            <li>Restaurant · Meat Liqour - 100 m</li>
            {/* Add more items */}
          </ul>
        </div>
        
        {/* Natural Beauty Section */}
        <div className="surroundings-card">
          <h3><FontAwesomeIcon icon={faTree} /> Natural beauty</h3>
          <ul>
            <li>Lake · The Serpentine - 1.9 km</li>
            {/* Add more items */}
          </ul>
        </div>
        
        {/* Public Transport Section */}
        <div className="surroundings-card">
          <h3><FontAwesomeIcon icon={faTrain} /> Public transport</h3>
          <ul>
            <li>Metro · Bond Street - 150 m</li>
            {/* Add more items */}
          </ul>
        </div>
        
        {/* Closest Airports Section */}
        <div className="surroundings-card">
          <h3><FontAwesomeIcon icon={faPlane} /> Closest airports</h3>
          <ul>
            <li>London City Airport - 15 km</li>
            {/* Add more items */}
          </ul>
        </div>
        </div>
    </div>

        <section ref={finePrintRef} className="fine-print-container">
          <div className="fine-print-header">
            <div>
              <span className="fine-print-kicker"><FaShieldAlt /> Stay terms</span>
              <h2 className="fine-print-title">The Fine Print</h2>
              <p className="fine-print-subtitle">Need-to-know information for guests at this property</p>
            </div>
            <button
              type="button"
              className="availability-button"
              onClick={() => document.querySelector(".room-selection-section")?.scrollIntoView({ behavior: "smooth" })}
            >
              See Availability
            </button>
          </div>

          <div className="fine-print-grid">
            {[
              ["Service charge", "Rates are subject to a discretionary 5% accommodation service charge."],
              ["Check-in documents", "Guests are required to show photo identification and a credit card upon check-in."],
              ["Arrival time", "Please inform the property in advance of your expected arrival time."],
              ["Age policy", "Guests under the age of 18 can only check in with a parent or official guardian."],
              ["Safety measures", "Additional safety and sanitation measures may be in effect at this property."],
            ].map(([title, copy], index) => (
              <article className="fine-print-card" key={title} style={{ "--delay": `${index * 70}ms` }}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="room-selection-section" aria-label="Select room">
          <div className="room-selection-header">
            <div>
              <span className="room-kicker"><FaUsers /> {guestCount} guests</span>
              <h2>Choose your room</h2>
              <p>Prices update for {guestCount} guest{guestCount === 1 ? "" : "s"} and include the room count needed for capacity.</p>
            </div>
            <div className="room-total-preview">
              <span>{selectedRoomData ? "Selected total" : "Estimated total"}</span>
              <strong>{formatMYR(displayTotalPrice)}</strong>
            </div>
          </div>

          <div className="room-card-grid">
            {roomsData.map((room, index) => {
              const isSelected = selectedRoom === room.roomType;
              const roomsNeeded = getRoomsNeeded(room);
              const roomTotal = getRoomTotal(room);

              return (
                <article
                  className={`room-choice-card ${isSelected ? "selected" : ""}`}
                  key={room.roomType}
                  style={{ "--delay": `${index * 90}ms` }}
                >
                  <div className="room-choice-top">
                    <span className="room-badge">{room.badge}</span>
                    <strong>{room.roomType}</strong>
                    <p>{room.description}</p>
                  </div>

                  <div className="room-choice-meta">
                    <span><FaUsers /> Max {room.maxPersons} per room</span>
                    <span>{roomsNeeded} room{roomsNeeded === 1 ? "" : "s"} for {guestCount} guest{guestCount === 1 ? "" : "s"}</span>
                  </div>

                  <ul className="room-choice-list">
                    {room.choices.map((choice) => (
                      <li key={choice}>
                        <FaCheck />
                        <span>{choice}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="room-choice-footer">
                    <div className="room-price-block">
                      <span>Today's total</span>
                      <strong>{formatMYR(roomTotal)}</strong>
                      <small>{room.price} per room</small>
                    </div>
                    <button
                      type="button"
                      className="select-button"
                      onClick={() => handleSelectRoom(room.roomType)}
                    >
                      <span>{isSelected ? "Selected" : "Select room"}</span>
                      <FaArrowRight />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

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
    <span className="guest-count">{guestCount} guest{guestCount === 1 ? "" : "s"}</span>
    <span className="equals"> = </span>
    <span className="price">{formatMYR(displayTotalPrice)}</span>
  </p>
  <button className="book-now-btn" onClick={handleNavigateToForm}>
    <span>Book Now</span>
    <FaArrowRight />
  </button>
</div>
      </div>
    </div>
  );
};

export default HotelSelected;
