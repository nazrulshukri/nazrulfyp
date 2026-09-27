import { API_BASE } from "../lib/apiConfig";
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { generateMockHotels } from '../mockdata/Hotel';
import './Hotel.css';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  CalendarDays,
  Dumbbell,
  Hotel as HotelIcon,
  MapPin,
  Moon,
  ParkingCircle,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  Waves,
  Wifi,
} from 'lucide-react';
import { BookingSteps } from './flightresults';
import { formatDay } from '../lib/travelMeta';
import { localDate, validateSearch } from '../lib/searchValidation';

const HOTEL_STEPS = ['Search', 'Stay', 'Guest details', 'Payment'];
const AMENITY_ICONS = { WiFi: Wifi, Pool: Waves, Gym: Dumbbell, Parking: ParkingCircle, Spa: Sparkles };
const amenityIcon = (name) => {
  const Icon = AMENITY_ICONS[name] || HotelIcon;
  return <Icon size={14} />;
};
const pricePin = (price) =>
  L.divIcon({
    className: 'bf26-price-pin-host',
    html: `<span class="bf26-price-pin">MYR ${Number(price).toLocaleString('en-MY')}</span>`,
    iconSize: [86, 30],
    iconAnchor: [43, 30],
    popupAnchor: [0, -28],
  });

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
    const next = normalizeSearch(searchValues);
    const problem = validateSearch({
      mode: 'hotel',
      destination: next.location,
      departureDate: next.checkInDate,
      returnDate: next.checkOutDate,
      adults: next.people,
      children: 0,
      infants: 0,
    });
    if (problem) {
      setError(problem);
      return;
    }
    setError('');
    setAppliedSearch(next);
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
      const response = await fetch(`${API_BASE}/save-hotel`, {
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

  const minNightly = hotels.length
    ? Math.min(...hotels.map((hotel) => hotel.pricePerNight))
    : 0;
  const scoreLabel = (score) =>
    score >= 9 ? 'Exceptional' : score >= 8.5 ? 'Superb' : score >= 8 ? 'Very good' : 'Good';
  const chip = (name, value, label) => (
    <button
      key={`${name}-${value}`}
      type="button"
      aria-pressed={filters[name] === value}
      className={filters[name] === value ? 'is-active' : ''}
      onClick={() => setFilters((current) => ({ ...current, [name]: value }))}
    >
      {label}
    </button>
  );

  return (
    <section className="bf26-results bf26-hotels">
      <div className="bf26-results-top">
        <Link className="bf-back" to="/">
          <ArrowLeft size={15} /> Back to search
        </Link>
        <BookingSteps current="Stay" steps={HOTEL_STEPS} />
      </div>

      <header className="bf26-route bf26-route-hotel">
        <div className="bf26-route-main">
          <span className="bf26-kicker">
            <BedDouble size={14} /> Stays in
          </span>
          <h1 className="bf26-hotel-city">{appliedSearch.location || 'London'}</h1>
          <p className="bf26-route-meta">
            <span>
              <CalendarDays size={15} />{' '}
              {appliedSearch.checkInDate
                ? `${formatDay(appliedSearch.checkInDate)} – ${formatDay(appliedSearch.checkOutDate)}`
                : 'Choose dates'}
            </span>
            <span>
              <Moon size={15} /> {nights} night{nights === 1 ? '' : 's'}
            </span>
            <span>
              <Users size={15} /> {appliedSearch.people} guest{appliedSearch.people === 1 ? '' : 's'}
            </span>
          </p>
        </div>
        <div className="bf26-route-side">
          <div className="bf26-from-price">
            <span className="bf26-kicker">Stays from</span>
            <strong>{formatMYR(minNightly)}</strong>
            <small>per night · {filteredHotels.length} properties</small>
          </div>
        </div>
      </header>

      <form className="bf26-hotel-search" onSubmit={handleSearchSubmit} noValidate>
        <label>
          <span>Destination</span>
          <input
            type="text"
            name="location"
            value={searchValues.location}
            onChange={handleSearchChange}
            placeholder="City or destination"
            list="bf26-hotel-cities"
          />
        </label>
        <label>
          <span>Check-in</span>
          <input
            type="date"
            name="checkInDate"
            min={localDate()}
            value={searchValues.checkInDate}
            onChange={handleSearchChange}
          />
        </label>
        <label>
          <span>Check-out</span>
          <input
            type="date"
            name="checkOutDate"
            min={searchValues.checkInDate || localDate()}
            value={searchValues.checkOutDate}
            onChange={handleSearchChange}
          />
        </label>
        <label className="bf26-hotel-guests">
          <span>Guests</span>
          <input
            type="number"
            name="people"
            min="1"
            max="9"
            value={searchValues.people}
            onChange={handleSearchChange}
          />
        </label>
        <button className="bf26-primary" type="submit">
          <Search size={17} /> Update
        </button>
        <datalist id="bf26-hotel-cities">
          {['London', 'Kuala Lumpur', 'Bali', 'Tokyo', 'Paris', 'Singapore'].map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </form>
      {error && (
        <p className="bf-search-error bf26-hotel-error" role="alert">
          {error}
        </p>
      )}

      <div className="bf26-results-layout">
        <aside className="bf26-filters" aria-label="Hotel filters">
          <div className="bf26-filters-head">
            <h2>
              <SlidersHorizontal size={17} /> Filters
            </h2>
            <button
              type="button"
              onClick={() => setFilters(defaultFilters)}
              disabled={JSON.stringify(filters) === JSON.stringify(defaultFilters)}
            >
              Reset
            </button>
          </div>

          <fieldset>
            <legend>Sort by</legend>
            <select
              className="bf26-select"
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              aria-label="Sort hotels"
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: low to high</option>
              <option value="rating-high">Guest rating</option>
              <option value="distance">Closest to centre</option>
            </select>
          </fieldset>

          <fieldset>
            <legend>Nightly budget</legend>
            <div className="bf26-chips">
              {chip('priceRange', 'any', 'Any')}
              {chip('priceRange', '300', '< MYR 300')}
              {chip('priceRange', '400', '< MYR 400')}
              {chip('priceRange', '500', '< MYR 500')}
            </div>
          </fieldset>

          <fieldset>
            <legend>Star rating</legend>
            <div className="bf26-chips">
              {chip('starRating', 'any', 'Any')}
              {['3', '4', '5'].map((n) =>
                chip('starRating', n, (
                  <>
                    {n} <Star size={12} fill="currentColor" />
                  </>
                ))
              )}
            </div>
          </fieldset>

          <fieldset>
            <legend>Brand</legend>
            <div className="bf26-chips">
              {brandOptions.map((brand) => chip('hotelBrand', brand, brand === 'All' ? 'All brands' : brand))}
            </div>
          </fieldset>

          <div className="bf26-map-card bf26-hotel-map">
            <div className="bf26-map">
              <MapContainer
                center={mapCenter}
                zoom={12}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                {filteredHotels.map((hotel) => (
                  <Marker
                    key={hotel.id}
                    position={[hotel.latitude, hotel.longitude]}
                    icon={pricePin(hotel.pricePerNight)}
                  >
                    <Popup>
                      <div className="map-popup-card">
                        <h3>{hotel.hotelName}</h3>
                        <p>{hotel.location}</p>
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
        </aside>

        <div className="bf26-list">
          <div className="bf26-list-bar">
            <span>
              <strong>{filteredHotels.length}</strong> of {hotels.length} stays ·
              prices for {nights} night{nights === 1 ? '' : 's'}, {appliedSearch.people} guest
              {appliedSearch.people === 1 ? '' : 's'}
            </span>
          </div>

          {filteredHotels.length === 0 && (
            <div className="bf26-empty-card">
              <BedDouble size={28} />
              <h2>No stays match these filters.</h2>
              <button type="button" className="bf26-ghost" onClick={() => setFilters(defaultFilters)}>
                Clear filters
              </button>
            </div>
          )}

          {filteredHotels.map((hotel, index) => (
            <article
              key={hotel.id}
              className="bf26-hotel"
              style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
            >
              <div className="bf26-hotel-media">
                <Slider {...sliderSettings}>
                  {hotel.images?.map((image, i) => (
                    <div key={`${hotel.id}-${i}`}>
                      <img src={image} alt={`${hotel.hotelName} view ${i + 1}`} loading="lazy" />
                    </div>
                  ))}
                </Slider>
                {hotel.limitedDeal && <span className="bf26-hotel-deal">Limited-time deal</span>}
              </div>

              <div className="bf26-hotel-body">
                <div className="bf26-hotel-top">
                  <div>
                    <span className="bf26-hotel-brand">
                      {hotel.brand} · {'★'.repeat(hotel.starRating)}
                    </span>
                    <h3>{hotel.hotelName}</h3>
                    <p className="bf26-hotel-loc">
                      <MapPin size={14} /> {hotel.location} · {hotel.distanceFromCenter} km from centre
                      <button type="button" onClick={() => handleShowOnMap(hotel)}>
                        Show on map
                      </button>
                    </p>
                  </div>
                  <div className="bf26-score">
                    <span>
                      <strong>{scoreLabel(hotel.rating)}</strong>
                      <small>{hotel.reviews.toLocaleString('en-MY')} reviews</small>
                    </span>
                    <b>{hotel.rating}</b>
                  </div>
                </div>

                <p className="bf26-hotel-desc">{hotel.description}</p>

                <div className="bf26-hotel-feats">
                  <span>
                    <BedDouble size={14} /> {hotel.roomType}
                  </span>
                  <span>{hotel.bedType}</span>
                  <span>{hotel.roomSize} m²</span>
                  {hotel.amenities?.slice(0, 4).map((a) => (
                    <span key={a} className="is-amenity">
                      {amenityIcon(a)} {a}
                    </span>
                  ))}
                </div>

                <div className="bf26-hotel-bottom">
                  <span className={`bf26-rooms ${hotel.roomsAvailable <= 3 ? 'is-low' : ''}`}>
                    {hotel.roomsAvailable <= 3
                      ? `Only ${hotel.roomsAvailable} rooms left`
                      : 'Free cancellation on many rooms'}
                  </span>
                  <div className="bf26-hotel-price">
                    <small>
                      <s>{formatMYR(hotel.oldPrice)}</s> {formatMYR(hotel.pricePerNight)} / night
                    </small>
                    <strong>{formatMYR(hotel.totalPrice)}</strong>
                    <small>
                      total for {nights} night{nights === 1 ? '' : 's'}
                    </small>
                  </div>
                  <button className="bf26-primary" type="button" onClick={() => handleSubmitHotel(hotel.id)}>
                    View stay <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hotel;
