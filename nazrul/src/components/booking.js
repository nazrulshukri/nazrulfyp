import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlane, FaHotel, FaTrain, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './booking.css';

  const locations = [
    'Kabul International Airport (Afghanistan)',
    'Tirana International Airport (Albania)',
    'Houari Boumediene International Airport (Algeria)',
    'Andorra–La Seu dUrgell Airport (Andorra)',
    'Quatro de Fevereiro International Airport (Angola)',
    'V.C. Bird International Airport (Antigua and Barbuda)',
    'Ministro Pistarini International Airport (Argentina)',
    'Zvartnots International Airport (Armenia)',
    'Sydney Kingsford Smith Airport (Australia)',
    'Heydar Aliyev International Airport (Azerbaijan)',
    'Freeport International Airport (Bahamas)',
    'Bahrain International Airport (Bahrain)',
    'Hazrat Shahjalal International Airport (Bangladesh)',
    'Grantley Adams International Airport (Barbados)',
    'Minsk National Airport (Belarus)',
    'Brussels Airport (Belgium)',
    'Philip S.W. Goldson International Airport (Belize)',
    'Benin City Airport (Benin)',
    'El Alto International Airport (Bolivia)',
    'Sarajevo International Airport (Bosnia and Herzegovina)',
    'Sir Seretse Khama International Airport (Botswana)',
    'Brasília International Airport (Brazil)',
    'Brunei International Airport (Brunei)',
    'Sofia Airport (Bulgaria)',
    'Thomas Sankara International Airport (Burkina Faso)',
    'Melchior Ndadaye International Airport (Burundi)',
    'Phnom Penh International Airport (Cambodia)',
    'Douala International Airport (Cameroon)',
    'Toronto Pearson International Airport (Canada)',
    'Owen Roberts International Airport (Cayman Islands)',
    'Bangui-MPoko International Airport (Central African Republic)',
    'NDjamena International Airport (Chad)',
    'Arturo Merino Benitez International Airport (Chile)',
    'Beijing Capital International Airport (China)',
    'El Dorado International Airport (Colombia)',
    'Prince Said Ibrahim International Airport (Comoros)',
    'Juan Santamaría International Airport (Costa Rica)',
    'Franjo Tuđman Airport (Croatia)',
    'José Martí International Airport (Cuba)',
    'Larnaka International Airport (Cyprus)',
    'Václav Havel Airport Prague (Czech Republic)',
    'Copenhagen Airport (Denmark)',
    'Ambouli International Airport (Djibouti)',
    'Douglas-Charles Airport (Dominica)',
    'Las Américas International Airport (Dominican Republic)',
    'Mariscal Sucre International Airport (Ecuador)',
    'Cairo International Airport (Egypt)',
    'Monseñor Óscar Arnulfo Romero International Airport (El Salvador)',
    'Malabo International Airport (Equatorial Guinea)',
    'Asmara International Airport (Eritrea)',
    'Tallinn Airport (Estonia)',
    'King Mswati III International Airport (Eswatini)',
    'Bole International Airport (Ethiopia)',
    'Nadi International Airport (Fiji)',
    'Helsinki-Vantaa Airport (Finland)',
    'Charles de Gaulle Airport (France)',
    'Leon M’ba International Airport (Gabon)',
    'Banjul International Airport (Gambia)',
    'Tbilisi International Airport (Georgia)',
    'Frankfurt Airport (Germany)',
    'Kotoka International Airport (Ghana)',
    'Eleftherios Venizelos Airport (Greece)',
    'Maurice Bishop International Airport (Grenada)',
    'La Aurora International Airport (Guatemala)',
    'Conakry International Airport (Guinea)',
    'Osvaldo Vieira International Airport (Guinea-Bissau)',
    'Cheddi Jagan International Airport (Guyana)',
    'Toussaint Louverture International Airport (Haiti)',
    'Toncontín International Airport (Honduras)',
    'Budapest Liszt Ferenc International Airport (Hungary)',
    'Keflavík International Airport (Iceland)',
    'Indira Gandhi International Airport (India)',
    'Soekarno–Hatta International Airport (Indonesia)',
    'Tehran Imam Khomeini International Airport (Iran)',
    'Baghdad International Airport (Iraq)',
    'Dublin Airport (Ireland)',
    'Ben Gurion Airport (Israel)',
    'Leonardo da Vinci International Airport (Italy)',
    'Norman Manley International Airport (Jamaica)',
    'Haneda International Airport (Japan)',
    'Queen Alia International Airport (Jordan)',
    'Almaty International Airport (Kazakhstan)',
    'Jomo Kenyatta International Airport (Kenya)',
    'Nauru International Airport (Kiribati)',
    'Incheon International Airport (South Korea)',
    'Pristina International Airport (Kosovo)',
    'Kuwait International Airport (Kuwait)',
    'Manas International Airport (Kyrgyzstan)',
    'Wattay International Airport (Laos)',
    'Riga International Airport (Latvia)',
    'Beirut-Rafic Hariri International Airport (Lebanon)',
    'Moshoeshoe I International Airport (Lesotho)',
    'Roberts International Airport (Liberia)',
    'Mitiga International Airport (Libya)',
    'Liechtenstein Airport (Liechtenstein)',
    'Vilnius International Airport (Lithuania)',
    'Luxembourg Findel Airport (Luxembourg)',
    'Ivato International Airport (Madagascar)',
    'Kamuzu International Airport (Malawi)',
    'Kuala Lumpur International Airport (Malaysia)',
    'Malé International Airport (Maldives)',
    'Mexico City International Airport (Mexico)',
    'Dubai International Airport (United Arab Emirates)',
    'Zanzibar International Airport (Tanzania)',
    'Lagos Murtala Muhammed International Airport (Nigeria)',
    'JFK International Airport (USA)',
    'O.R. Tambo International Airport (South Africa)',
    'London Heathrow Airport (United Kingdom)',
    'New Delhi Indira Gandhi International Airport (India)',
    'Hong Kong International Airport (Hong Kong)',
    'Bangkok Suvarnabhumi Airport (Thailand)',
    'Charles de Gaulle International Airport (France)',
    'Madrid Barajas International Airport (Spain)',
    'Fiumicino International Airport (Italy)',
    'Sydney Kingsford Smith International Airport (Australia)',
    'Changi Airport (Singapore)',
    'Cape Town International Airport (South Africa)',
    'Toronto Pearson International Airport (Canada)',
    'Shenzhen Bao’an International Airport (China)',
    'Berlin Brandenburg Airport (Germany)',
    'Düsseldorf Airport (Germany)',
    'Mexico City International Airport (Mexico)',
    'Ninoy Aquino International Airport (Philippines)',
    'Noi Bai International Airport (Vietnam)',
    'London','Malaysia','Petaling jaya','KLIA2','KLIA','Terminal Bersepadu Selatan(TBS)'
];


function Booking() {
  const navigate = useNavigate();

  const [selectedOption, setSelectedOption] = useState('');
  const [tripType, setTripType] = useState('return');

  const [location, setLocation] = useState('');
  const [location1, setLocation1] = useState('');
  const [startDate, setStartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [people, setPeople] = useState(1);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [filteredFromLocations, setFilteredFromLocations] = useState([]);
  const [filteredToLocations, setFilteredToLocations] = useState([]);

  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);

  useEffect(() => {
    setFilteredFromLocations(
      locations.filter(loc =>
        loc.toLowerCase().includes(location.toLowerCase())
      )
    );
  }, [location]);

  useEffect(() => {
    setFilteredToLocations(
      locations.filter(loc =>
        loc.toLowerCase().includes(location1.toLowerCase())
      )
    );
  }, [location1]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedOption) {
      setError('Please select a booking option.');
      return;
    }

    try {
      if (selectedOption === 'flight') {
        navigate('/flight-results', {
          state: {
            departureDate: startDate,
            returnDate: tripType === 'oneway' ? null : returnDate,
            origin: location,
            destination: location1,
            people,
            tripType,
          },
        });
      }

      if (selectedOption === 'hotel') {
        navigate('/hotel', {
          state: {
            checkInDate: startDate,
            checkOutDate: returnDate,
            location: location1,
            people,
          },
        });
      }

      if (selectedOption === 'train') {
        navigate('/train', {
          state: {
            departureDate: startDate,
            returnDate,
            origin: location,
            destination: location1,
            people,
          },
        });
      }

      await axios.post('http://localhost:5001/bookings', {
        selectedOption,
        tripType,
        location,
        location1,
        startDate,
        returnDate,
        people,
      });

      setSuccess('Booking submitted successfully!');
      setError('');
    } catch (err) {
      setError('Error submitting booking.');
      setSuccess('');
    }
  };

  return (
    <div className="booking-wrapper">

      {/* Booking Type Buttons */}
      <div className="button-container">
        <button
          className={`option-button ${selectedOption === 'flight' ? 'active' : ''}`}
          onClick={() => setSelectedOption('flight')}
        >
          <FaPlane /> Flight
        </button>

        <button
          className={`option-button ${selectedOption === 'hotel' ? 'active' : ''}`}
          onClick={() => setSelectedOption('hotel')}
        >
          <FaHotel /> Hotel
        </button>

        <button
          className={`option-button ${selectedOption === 'train' ? 'active' : ''}`}
          onClick={() => setSelectedOption('train')}
        >
          <FaTrain /> Train
        </button>
      </div>

      <form className="booking-form" onSubmit={handleSubmit}>

        {/* From */}
        <div className="form-group">
          <label>From</label>
          <input
            ref={fromInputRef}
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setShowFromSuggestions(true);
            }}
            placeholder="Departure city"
          />
          {showFromSuggestions && (
            <ul className="suggestions-list">
              {filteredFromLocations.map((loc, i) => (
                <li key={i} onClick={() => {
                  setLocation(loc);
                  setShowFromSuggestions(false);
                }}>
                  {loc}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* To */}
        <div className="form-group">
          <label>To</label>
          <input
            ref={toInputRef}
            value={location1}
            onChange={(e) => {
              setLocation1(e.target.value);
              setShowToSuggestions(true);
            }}
            placeholder="Destination city"
          />
          {showToSuggestions && (
            <ul className="suggestions-list">
              {filteredToLocations.map((loc, i) => (
                <li key={i} onClick={() => {
                  setLocation1(loc);
                  setShowToSuggestions(false);
                }}>
                  {loc}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Trip Type SELECT (Flight only) */}
        {selectedOption === 'flight' && (
          <div className="form-group">
            <label>Trip Type</label>
            <select value={tripType} onChange={(e) => setTripType(e.target.value)}>
              <option value="return">Return</option>
              <option value="oneway">One Way</option>
              <option value="multicity">Multi-City</option>
            </select>
          </div>
        )}

        {/* Dates */}
        <div className="form-group">
          <label>Departure Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>

        {selectedOption === 'flight' && tripType !== 'oneway' && (
          <div className="form-group">
            <label>Return Date</label>
            <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
          </div>
        )}

        {/* People */}
        <div className="form-group">
          <label>People</label>
          <input
            type="number"
            min="1"
            value={people}
            onChange={(e) => setPeople(Number(e.target.value))}
          />
        </div>

        <button className="submit-button" type="submit">
          Submit Booking
        </button>

        {error && <div className="error-message"><FaTimesCircle /> {error}</div>}
        {success && <div className="success-message"><FaCheckCircle /> {success}</div>}
      </form>
    </div>
  );
}

export default Booking;