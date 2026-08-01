import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateMockHotels } from '../mockdata/Hotel';
import './Hotel.css';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  FaArrowRight,
  FaBed,
  FaCalendarAlt,
  FaDumbbell,
  FaHotel,
  FaMapMarkedAlt,
  FaMapMarkerAlt,
  FaParking,
  FaRuler,
  FaSearch,
  FaSearchLocation,
  FaSlidersH,
  FaSpa,
  FaStar,
  FaSwimmingPool,
  FaTags,
  FaUsers,
  FaWifi,
} from 'react-icons/fa';

const HOTEL_PARAMS_KEY = 'hotelParams';
const HOTEL_FILTERS_KEY = 'hotelFilters';
const HOTEL_SELECTED_DRAFT_KEY = 'hotelSelectedDraft';
const DEFAULT_CENTER = [51.5074, -0.1272];

const defaultFilters = {
  priceRange: 'any',
  starRating: 'any',
  hotelBrand: 'All',
  sortBy: 'recommended',
};

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

const readStorage = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  return safeParse(window.localStorage.getItem(key), fallback);
};

const writeStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const formatMYR = (value) => `MYR ${Number(value || 0).toLocaleString('en-MY')}`;

const getNightCount = (startDate, returnDate) => {
  const start = new Date(startDate);
  const end = new Date(returnDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 1;
  }

  return Math.max(1, Math.ceil((end - start) / 86400000));
};

const normalizeSearch = (params = {}) => ({
  checkInDate: params.checkInDate || params.startDate || '',
  checkOutDate: params.checkOutDate || params.returnDate || '',
  location: params.location || params.locationInput || 'London',
  people: Math.max(1, Number(params.people) || 1),
});

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 450,
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
};

const hotelGlassIcon = () =>
  L.divIcon({
    className: 'hotel-filter-glass-marker-host',
    html: `
      <div class="hotel-filter-glass-pin" aria-hidden="true">
        <span class="hotel-filter-glass-pin-core">
          <span class="hotel-filter-glass-pin-dot"></span>
        </span>
        <span class="hotel-filter-glass-pin-point"></span>
        <span class="hotel-filter-glass-pin-pulse"></span>
      </div>
    `,
    iconSize: [46, 54],
    iconAnchor: [23, 48],
    popupAnchor: [0, -45],
  });

const MapRecenter = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 12);
    const timeoutId = window.setTimeout(() => map.invalidateSize(), 120);
    return () => window.clearTimeout(timeoutId);
  }, [center, map]);

  return null;
};

function Hotel() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeHotelParams = location.state?.hotelParams || location.state || {};
  const savedHotelParams = readStorage(HOTEL_PARAMS_KEY, {});
  const initialSearch = normalizeSearch(
    Object.keys(routeHotelParams).length > 0 ? routeHotelParams : savedHotelParams
  );

  const [searchValues, setSearchValues] = useState(initialSearch);
  const [appliedSearch, setAppliedSearch] = useState(initialSearch);
  const [filters, setFilters] = useState(() => ({
    ...defaultFilters,
    ...readStorage(HOTEL_FILTERS_KEY, {}),
  }));
  const [error, setError] = useState('');

  const hotels = useMemo(
    () =>
      generateMockHotels(
        appliedSearch.checkInDate,
        appliedSearch.checkOutDate,
        appliedSearch.location,
        appliedSearch.people
      ),
    [appliedSearch]
  );

  const filteredHotels = useMemo(() => {
    const filtered = hotels.filter((hotel) => {
      const matchesPrice =
        filters.priceRange === 'any' || hotel.pricePerNight <= Number(filters.priceRange);
      const matchesStars =
        filters.starRating === 'any' || hotel.starRating === Number(filters.starRating);
      const matchesBrand = filters.hotelBrand === 'All' || hotel.brand === filters.hotelBrand;

      return matchesPrice && matchesStars && matchesBrand;
    });

    return [...filtered].sort((a, b) => {
      if (filters.sortBy === 'price-low') return a.pricePerNight - b.pricePerNight;
      if (filters.sortBy === 'rating-high') return b.rating - a.rating;
      if (filters.sortBy === 'distance') return a.distanceFromCenter - b.distanceFromCenter;
      return Number(b.limitedDeal) - Number(a.limitedDeal) || b.rating - a.rating;
    });
  }, [filters, hotels]);

  const mapCenter = useMemo(() => {
    const firstHotel = filteredHotels[0] || hotels[0];

    if (firstHotel && Number.isFinite(firstHotel.latitude) && Number.isFinite(firstHotel.longitude)) {
      return [firstHotel.latitude, firstHotel.longitude];
    }

    return DEFAULT_CENTER;
  }, [filteredHotels, hotels]);

  const nights = getNightCount(appliedSearch.checkInDate, appliedSearch.checkOutDate);
  const brandOptions = useMemo(
    () => ['All', ...Array.from(new Set(hotels.map((hotel) => hotel.brand).filter(Boolean)))],
    [hotels]
  );

  useEffect(() => {
    writeStorage(HOTEL_PARAMS_KEY, appliedSearch);
  }, [appliedSearch]);

  useEffect(() => {
    writeStorage(HOTEL_FILTERS_KEY, filters);
  }, [filters]);

  const handleSearchChange = (event) => {
    const { name, value } = event.target;

    setSearchValues((current) => ({
      ...current,
      [name]: name === 'people' ? Math.max(1, Number(value) || 1) : value,
    }));
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setError('');
    setAppliedSearch(normalizeSearch(searchValues));
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleShowOnMap = (hotel) => {
    navigate('/Maps', {
      state: {
        location: {
          coordinates: [hotel.latitude, hotel.longitude],
          name: hotel.hotelName,
          brand: hotel.brand,
          rating: hotel.rating,
          reviews: hotel.reviews,
          pricePerNight: hotel.pricePerNight,
          roomsAvailable: hotel.roomsAvailable,
          distanceFromCenter: hotel.distanceFromCenter,
        },
        from: '/Hotel',
      },
    });
  };

  const saveHotelSelection = async (hotelData) => {
    try {
      const response = await fetch('http://localhost:5001/save-hotel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hotelData),
      });

      if (!response.ok) {
        console.warn(`Hotel selection was not saved. Status: ${response.status}`);
      }
    } catch (error) {
      console.warn('Hotel selection save failed, continuing with booking:', error);
    }
  };

  const handleSubmitHotel = (id) => {
    const selectedHotel = hotels.find((hotel) => hotel.id === id);

    if (!selectedHotel) {
      setError('Hotel not found. Please choose another property.');
      return;
    }

    const totalPrice = selectedHotel.totalPrice;
    const selectionState = {
      selectedHotel,
      totalPrice,
      locationInput: appliedSearch.location,
      startDate: appliedSearch.checkInDate,
      returnDate: appliedSearch.checkOutDate,
      people: appliedSearch.people,
    };

    const hotelData = {
      id: selectedHotel.id,
      hotelName: selectedHotel.hotelName,
      checkInDate: appliedSearch.checkInDate,
      checkOutDate: appliedSearch.checkOutDate,
      price: totalPrice,
      location: selectedHotel.location,
      images: selectedHotel.images,
      starRating: selectedHotel.starRating,
      roomtype: selectedHotel.roomType,
    };

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(HOTEL_SELECTED_DRAFT_KEY, JSON.stringify(selectionState));
    }

    saveHotelSelection(hotelData);

    navigate('/Hotelselected', {
      state: selectionState,
    });
  };

  const scrollToResults = () => {
    document.querySelector('.hotel-results-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderAmenities = (amenities = []) => {
    const icons = {
      WiFi: <FaWifi />,
      Pool: <FaSwimmingPool />,
      Gym: <FaDumbbell />,
      Parking: <FaParking />,
      Spa: <FaSpa />,
    };

    return amenities.slice(0, 4).map((amenity) => (
      <span key={amenity}>
        {icons[amenity] || <FaHotel />}
        {amenity}
      </span>
    ));
  };

  return (
    <div className="hotel-results-container1">
      <section className="hotel-results-hero" aria-label="Hotel results overview">
        <div className="hotel-results-hero-copy">
          <span className="hotel-modern-kicker">
            <FaHotel /> Curated hotel stays
          </span>
          <h1>{appliedSearch.location || 'London'} hotel stays for your next trip</h1>
          <p>
            Central stays with dependable ratings, room comfort, location context, and
            transparent pricing.
          </p>
          <div className="hotel-search-chips">
            <span>
              <FaMapMarkerAlt /> {appliedSearch.location || 'London'}
            </span>
            <span>
              <FaCalendarAlt /> {nights} night{nights === 1 ? '' : 's'}
            </span>
            <span>
              <FaUsers /> {appliedSearch.people} guest{appliedSearch.people === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        <div className="hotel-results-hero-panel">
          <strong>{filteredHotels.length}</strong>
          <span>properties found</span>
          <small>
            From {formatMYR(Math.min(...hotels.map((hotel) => hotel.pricePerNight)))}/night
          </small>
          <button type="button" onClick={scrollToResults}>
            View matches
          </button>
        </div>
      </section>

      <div className="hotel-main-content1">
        <aside className="filters5" aria-label="Hotel filters">
          <div className="filter-panel-header">
            <span className="filter-kicker">
              <FaSlidersH /> Smart filters
            </span>
            <p className="filter-text">Filter your hotel</p>
            <p>Nightly budget, star class, brand, and location context in one compact panel.</p>
          </div>

          <div className="filter-quick-stats">
            <span>
              <strong>{hotels.length}</strong>
              <small>stays</small>
            </span>
            <span>
              <strong>{filteredHotels.length}</strong>
              <small>matches</small>
            </span>
            <span>
              <strong>{nights}</strong>
              <small>nights</small>
            </span>
          </div>

          <div className="filter-control-grid">
            <div className="filter-section filter-select-section">
              <label htmlFor="priceRange">
                <span>
                  <FaTags /> Price range
                </span>
              </label>
              <select
                id="priceRange"
                name="priceRange"
                value={filters.priceRange}
                onChange={handleFilterChange}
              >
                <option value="any">Any price</option>
                <option value="300">Under MYR300/night</option>
                <option value="400">Under MYR400/night</option>
                <option value="500">Under MYR500/night</option>
              </select>
            </div>

            <div className="filter-section filter-select-section">
              <label htmlFor="starRating">
                <span>
                  <FaStar /> Star rating
                </span>
              </label>
              <select
                id="starRating"
                name="starRating"
                value={filters.starRating}
                onChange={handleFilterChange}
              >
                <option value="any">Any rating</option>
                <option value="3">3 stars</option>
                <option value="4">4 stars</option>
                <option value="5">5 stars</option>
              </select>
            </div>

            <div className="filter-section filter-select-section">
              <label htmlFor="hotelBrand">
                <span>
                  <FaHotel /> Hotel brand
                </span>
              </label>
              <select
                id="hotelBrand"
                name="hotelBrand"
                value={filters.hotelBrand}
                onChange={handleFilterChange}
              >
                {brandOptions.map((brand) => (
                  <option value={brand} key={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-section filter-select-section">
              <label htmlFor="sortBy">
                <span>
                  <FaSearchLocation /> Sort hotels
                </span>
              </label>
              <select id="sortBy" name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                <option value="recommended">Recommended</option>
                <option value="price-low">Price low to high</option>
                <option value="rating-high">Rating high to low</option>
                <option value="distance">Closest to centre</option>
              </select>
            </div>
          </div>

          <div className="filter-map-shell">
            <div className="filter-map-header">
              <span>
                <FaMapMarkedAlt /> Map preview
              </span>
              <small>{filteredHotels.length} pins</small>
            </div>
            <div className="map-container1">
              <MapContainer
                center={mapCenter}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                {filteredHotels.map((hotel) => (
                  <Marker
                    key={hotel.id}
                    position={[hotel.latitude, hotel.longitude]}
                    icon={hotelGlassIcon()}
                  >
                    <Popup>
                      <div className="map-popup-card">
                        <h3>{hotel.hotelName}</h3>
                        <p>{hotel.location}</p>
                        <div className="map-popup-meta">
                          <span>{hotel.rating} rating</span>
                          <span>{hotel.roomsAvailable} rooms left</span>
                        </div>
                        <strong>
                          {formatMYR(hotel.pricePerNight)}
                          <small>/night</small>
                        </strong>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                <MapRecenter center={mapCenter} />
              </MapContainer>
            </div>
          </div>

          <button className="filter-button" type="button" onClick={scrollToResults}>
            <FaSearch /> Apply filters
          </button>
        </aside>

        <section className="hotel-results-content">
          <div className="hotel-results-toolbar">
            <div>
              <span className="hotel-modern-kicker">Results</span>
              <h1 className="hotel-results-title">Hotel Results</h1>
            </div>
            <span className="hotel-sort-pill">
              {filters.sortBy === 'recommended' ? 'Recommended first' : 'Sorted results'}
            </span>
          </div>

          {error && <p className="error">{error}</p>}

          <form className="booking-form" onSubmit={handleSearchSubmit}>
            <div className="form-inline">
              <label>
                <span className="form-label">
                  <FaMapMarkerAlt /> Location
                </span>
                <input
                  type="text"
                  name="location"
                  value={searchValues.location}
                  onChange={handleSearchChange}
                  className="form-input"
                  placeholder="Enter destination"
                />
              </label>

              <label>
                <span className="form-label">
                  <FaCalendarAlt /> Check-in
                </span>
                <input
                  type="date"
                  name="checkInDate"
                  value={searchValues.checkInDate}
                  onChange={handleSearchChange}
                  className="form-input"
                />
              </label>

              <label>
                <span className="form-label">
                  <FaCalendarAlt /> Check-out
                </span>
                <input
                  type="date"
                  name="checkOutDate"
                  value={searchValues.checkOutDate}
                  onChange={handleSearchChange}
                  className="form-input"
                />
              </label>

              <label>
                <span className="form-label">
                  <FaUsers /> Guests
                </span>
                <input
                  type="number"
                  name="people"
                  min="1"
                  value={searchValues.people}
                  onChange={handleSearchChange}
                  className="form-input"
                />
              </label>

              <button className="hotel-search-button" type="submit">
                <FaSearch /> Search
              </button>
            </div>
          </form>

          <div className="hotel-list-container23">
            <div className="hotel-list-heading">
              <div>
                <h2>
                  {appliedSearch.location || 'London'}: {filteredHotels.length} properties found
                </h2>
                <p>
                  Prices shown per night and total stay for {appliedSearch.people} guest
                  {appliedSearch.people === 1 ? '' : 's'}.
                </p>
              </div>
            </div>

            <div className="hotel-list">
              {filteredHotels.map((hotel) => (
                <article key={hotel.id} className="hotel-card1">
                  <Slider {...sliderSettings}>
                    {hotel.images?.map((image, index) => (
                      <div key={`${hotel.id}-${index}`}>
                        <img
                          src={image}
                          alt={`${hotel.hotelName} view ${index + 1}`}
                          className="hotel-image"
                        />
                      </div>
                    ))}
                  </Slider>

                  <div className="hotel-details1">
                    <div className="hotel-card-topline">
                      <span className="hotel-brand-pill">{hotel.brand}</span>
                      <span className="hotel-status-pill">{hotel.roomsAvailable} rooms left</span>
                    </div>

                    <div className="hotel-header">
                      <div>
                        <h3 className="hotel-name1">{hotel.hotelName}</h3>
                        <div className="star-rating1" aria-label={`${hotel.starRating} star hotel`}>
                          {'★'.repeat(hotel.starRating)}
                        </div>
                      </div>
                      <div className="rating-container">
                        <div className="rating-section">
                          <span className="rating-score">{hotel.rating}</span>
                        </div>
                        <div className="reviews">{hotel.reviews.toLocaleString('en-MY')} reviews</div>
                      </div>
                    </div>

                    <div className="hotel-card-location">
                      <span className="hotel-location-main">
                        <FaMapMarkerAlt /> {hotel.location}
                      </span>
                      <button type="button" onClick={() => handleShowOnMap(hotel)} className="map-link">
                        <FaMapMarkedAlt /> Show on map
                      </button>
                      <span>{hotel.distanceFromCenter} km from centre</span>
                    </div>

                    {hotel.limitedDeal && <span className="deal-tag">Limited-time deal</span>}

                    <div className="hotel-card-description">
                      <span className="description-label">
                        <FaHotel /> Stay profile
                      </span>
                      <p>{hotel.description}</p>
                    </div>

                    <div className="hotel-feature-grid">
                      <span>
                        <FaBed /> {hotel.roomType}
                      </span>
                      <span>
                        <FaSearchLocation /> {hotel.bedType}
                      </span>
                      <span>
                        <FaRuler /> {hotel.roomSize}m2
                      </span>
                    </div>

                    <div className="hotel-feature-grid">{renderAmenities(hotel.amenities)}</div>

                    <div className="hotel-card-midline">
                      <p className="availability">Available now</p>
                      <div className="reviews">{nights} night total: {formatMYR(hotel.totalPrice)}</div>
                    </div>

                    <div className="hotel-card-footer">
                      <div className="pricing-info">
                        <span className="price-caption">Per night</span>
                        <span className="old-price">{formatMYR(hotel.oldPrice)}</span>
                        <span className="current-price">
                          {formatMYR(hotel.pricePerNight)}
                          <small>/night</small>
                        </span>
                        <span className="current-price">
                          <em>Total {formatMYR(hotel.totalPrice)}</em>
                        </span>
                      </div>

                      <button className="availability-btn" onClick={() => handleSubmitHotel(hotel.id)}>
                        <span>Book Now</span>
                        <FaArrowRight />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Hotel;
