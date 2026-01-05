import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPlane, FaHotel, FaTrain, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './booking.css';


function Booking() {
  const [startDate, setStartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [location, setLocation] = useState('');
  const [location1, setLocation1] = useState('');
  const [people, setPeople] = useState(1);
  const [selectedOption, setSelectedOption] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [filteredFromLocations, setFilteredFromLocations] = useState([]);
  const [filteredToLocations, setFilteredToLocations] = useState([]);

  const locations = useMemo(() => [
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
], []);
    
 
  
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setFilteredFromLocations(locations.filter(loc => 
      loc.toLowerCase().includes(location.toLowerCase())
    ));
  }, [location, locations]);
  
  useEffect(() => {
    setFilteredToLocations(locations.filter(loc => 
      loc.toLowerCase().includes(location1.toLowerCase())
    ));
  }, [location1, locations]);

  const handleLocationChange = (e, setLocation, setShowSuggestions) => {
    setLocation(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (location, setLocation, setShowSuggestions) => {
    setLocation(location);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOption) {
      setError('Please select a booking option.');
      return;
    }
  
    try {
      if (selectedOption === 'flight') {
        const flightParams = {
          departureDate: startDate,
          returnDate: returnDate,
          origin: location,
          destination: location1,
          people: people,
        };
  
        navigate('/flight-results', { state: { flightParams } });
      } else if (selectedOption === 'hotel') {
        const hotelParams = {
          checkInDate: startDate,
          checkOutDate: returnDate,
          location: location1,
          people: people,
        };
  
        navigate('/hotel', { state: { hotelParams } });
      } else if (selectedOption === 'train') {
        const Train = {
          departureDate: startDate,
          returnDate: returnDate,
          origin: location,
          destination: location1,
          people: people,
        };
      
        // Log the trainParams object for debuggingß
        console.log('Navigating with trainParams:', Train);
      
        // Navigate to TrainPage with trainParams in state
        navigate('/train', { state: { Train } });
      }
      
  
      const response = await axios.post('http://localhost:5001/bookings', {
        startDate,
        returnDate,
        location,
        location1,
        people,
        bookingType: selectedOption,
      });
  
      setSuccess('Booking submitted successfully!');
      setError('');
  
      if (selectedOption === 'flight') {
        navigate('/flight-results', { state: { bookingData: response.data } });
      } else if (selectedOption === 'hotel') {
        navigate('/hotel', { state: { bookingData: response.data } });
      } else if (selectedOption === 'train') {
        navigate('/train', { state: { bookingData: response.data } });
      }
    } catch (error) {
      setError('Error submitting booking.');
      setSuccess('');
      console.error('Error:', error);
    }
  };

  return (
    <div className="booking-wrapper">
     <div className="button-container">
  <button
    className={`option-button ${selectedOption === 'flight' ? 'active' : ''}`}
    onClick={() => setSelectedOption(selectedOption === 'flight' ? '' : 'flight')}
  >
    <span className="icon">
      <FaPlane />
    </span>
    <span className="text">Flight</span>
  </button>
  <button
    className={`option-button ${selectedOption === 'hotel' ? 'active' : ''}`}
    onClick={() => setSelectedOption(selectedOption === 'hotel' ? '' : 'hotel')}
  >
    <span className="icon">
      <FaHotel />
    </span>
    <span className="text">Hotel</span>
  </button>
  <button
    className={`option-button ${selectedOption === 'train' ? 'active' : ''}`}
    onClick={() => setSelectedOption(selectedOption === 'train' ? '' : 'train')}
  >
    <span className="icon">
      <FaTrain />
    </span>
    <span className="text">Train</span>
  </button>
</div>



<form className="booking-form" onSubmit={handleSubmit}>
  <div className="form-row">
    {/* From Section */}
    <div className="form-group">
      <label>
        <i className="fas fa-map-marker-alt icon"></i> From:
      </label>
      <input
        type="text"
        value={location}
        onChange={(e) =>
          handleLocationChange(e, setLocation, setShowFromSuggestions)
        }
        onFocus={() => setShowFromSuggestions(true)}
        ref={fromInputRef}
        placeholder="Enter a departure city"
      />
      {showFromSuggestions && (
        <ul className="suggestions-list1">
          {filteredFromLocations.map((suggestion, index) => (
            <li
              key={index}
              onClick={() =>
                handleSuggestionClick(
                  suggestion,
                  setLocation,
                  setShowFromSuggestions
                )
              }
            >
              <span className="icon">&#x1F4CD;</span>
              <div className="suggestion-main">{suggestion}</div>
            </li>
          ))}
        </ul>
      )}
    </div>

    {/* To Section */}
    <div className="form-group">
      <label>
        <i className="fas fa-map-marker-alt icon"></i> To:
      </label>
      <input
        type="text"
        value={location1}
        onChange={(e) =>
          handleLocationChange(e, setLocation1, setShowToSuggestions)
        }
        onFocus={() => setShowToSuggestions(true)}
        ref={toInputRef}
        placeholder="Enter a destination city"
      />
      {showToSuggestions && (
        <ul className="suggestions-list1">
          {filteredToLocations.map((suggestion, index) => (
            <li
              key={index}
              onClick={() =>
                handleSuggestionClick(
                  suggestion,
                  setLocation1,
                  setShowToSuggestions
                )
              }
            >
              <span className="icon">&#x1F4CD;</span>
              <div className="suggestion-main">{suggestion}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>


  <div className="form-row">
  <div className="form-group">
    <label>
      <i className="fas fa-calendar-alt icon"></i> Departure Date:
    </label>
    <input
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
    />
  </div>

  <div className="form-group">
    <label>
      <i className="fas fa-calendar-alt icon"></i> Return Date:
    </label>
    <input
      type="date"
      value={returnDate}
      onChange={(e) => setReturnDate(e.target.value)}
    />
  </div>

  <div className="form-group">
    <label>
      <i className="fas fa-users icon"></i> People:
    </label>
    <input
      type="number"
      value={people}
      onChange={(e) => setPeople(Number(e.target.value))}
      min="1"
    />
  </div>
</div>

  <button type="submit" className="submit-button">
    Submit Booking
  </button>
  {error && <div className="error-message"><FaTimesCircle /> {error}</div>}
  {success && <div className="success-message"><FaCheckCircle /> {success}</div>}
</form>

    </div>
  );
}

export default Booking;
