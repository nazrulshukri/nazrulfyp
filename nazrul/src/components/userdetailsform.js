import React, { useState } from 'react';
import './userdetailsform.css'
import membership from '../img/assets/Hotel/BOOKING__5_-removebg-preview.png'

const UserDetailsForm = ({ onFormSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    country: 'Malaysia' ,
    phone: '',
    specialRequests: '',
    arrivalTime: '',
  });

  const countries = [
    'Malaysia', 'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 
    'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Azerbaijan', 
    'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 
    'Belize', 'Benin', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 
    'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 
    'Canada', 'Cayman Islands', 'Central African Republic', 'Chad', 'Chile', 
    'China', 'Colombia', 'Comoros', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 
    'Czechia', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 
    'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 
    'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 
    'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 
    'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 
    'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 
    'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Korea', 'Kosovo', 'Kuwait', 
    'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 
    'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 
    'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 
    'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 
    'Morocco', 'Mozambique', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 
    'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Niue', 'North Macedonia', 
    'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 
    'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 
    'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 
    'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 
    'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 
    'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 
    'South Africa', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 
    'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Tajikistan', 
    'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 
    'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 
    'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 
    'United Kingdom', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela', 
    'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
  ];


  const [selectedOption, setSelectedOption] = useState(null);

  // Function to handle selection
  const handleSelect = (option) => {
    // Toggle selection state
    setSelectedOption(option === selectedOption ? null : option);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFormSubmit(formData); // Pass the form data to parent component
  };

  const AddToStayOption = ({ icon, title, description, checked, onChange }) => {
    return (
      <div className="add-to-stay-option">

<div className="checkbox">
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange} // Call the handler passed from the parent
          />
        </div>
        <div className="icon">{icon}</div>
        <div className="details">
          <h4>{title}</h4>
          <p>{description}</p>
        </div>
       
      </div>
    );
  };

  return (
    <div>
    {/* This section is now outside the main form container */}
    <div className="promotion">
    <div className="promotion-content">
      <h3>
        Save 10% or more on this option when you sign in with Booking Flex, Booking.com’s loyalty programme
      </h3>
       {/* Add image aligned to the right of the text */}
       <img src={membership} alt="Booking Flex Logo" className="promo-image" />
       </div>
       {/* Add buttons for Sign In and Register */}
    <div className="promo-buttons">
      <button className="btn sign-in-btn">Sign In</button>
      <button className="btn register-btn">Register</button>
    </div>
    </div>
    

    <div className="user-details-form1">

   <div className="form-header-container">
  <h3>
  <i className="fas fa-info-circle info-icon" title="This form is required to proceed."></i>
    Almost done! Just fill in the <span className="required-asterisk">*</span> required info
   
  </h3>
</div>
  <form onSubmit={handleSubmit}>
    <div className="form-group">
      <label>
        <i className="fas fa-user"></i> First Name<span className="required-asterisk">*</span>
      </label>
      <input
        type="text"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        required
        placeholder="Enter your first name"
      />
    </div>

    <div className="form-group">
      <label>
        <i className="fas fa-user"></i> Last Name<span className="required-asterisk">*</span>
      </label>
      <input
        type="text"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        required
        placeholder="Enter your last name"
      />
    </div>

    <div className="form-group">
      <label>
        <i className="fas fa-envelope"></i> Email address<span className="required-asterisk">*</span>
      </label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        placeholder="Enter your email address"
      />
    </div>

    <div className="form-group">
      <label>
        <i className="fas fa-home"></i> Address<span className="required-asterisk">*</span>
      </label>
      <input
        type="text"
        name="address"
        value={formData.address}
        onChange={handleChange}
        required
        placeholder="Enter your address"
      />
    </div>

    <div className="form-group">
      <label>
        <i className="fas fa-city"></i> City<span className="required-asterisk">*</span>
      </label>
      <input
        type="text"
        name="city"
        value={formData.city}
        onChange={handleChange}
        required
        placeholder="Enter your city"
      />
    </div>
    <div className="form-group">
          <label>Zip/Postal Code (optional)</label>
          <input
            type="text"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            placeholder="Enter your zip code"
          />
        </div>

        <div className="form-group">
          <label>Country/Region<span className="required-asterisk">*</span></label>
          <select name="country" value={formData.country} onChange={handleChange} required>
            {countries.map((country, index) => (
              <option key={index} value={country}>{country}</option>
            ))}
          </select>
        </div>
        <div className="form-group phone-number">
  <label htmlFor="phone-number">
    Phone number <span className="required-asterisk">*</span>
  </label>
  <div className="phone-input">
    <select className="phone-code34" defaultValue="MY +60">
      <option value="MY +60">MY +60</option>
      <option value="US +1">US +1</option>
      <option value="UK +44">UK +44</option>
    </select>
    <input
      type="text"
      id="phone-number"
      placeholder="Enter your phone number"
      required
      value={formData.phone} // Bind the phone number value to formData.phone
      onChange={handleChange} // Ensure that changes to the input field update formData.phone
      name="phone" // Add name to access this value in formData
    />
  </div>
  <small>Needed by the property to validate your booking</small>
</div>

<div className="form-group checkbox-section">
  <label htmlFor="paperless-confirmation">
    Yes, I’d like free paperless confirmation (recommended)
    
  </label>
  <input type="checkbox" id="paperless-confirmation" />
</div>



{/* Horizontal line */}
<hr className="section-divider" />
<div className="form-group radio-group">
  <label>Who are you booking for? (optional)</label>
  <div className="radio-option">
    <input type="radio" id="main-guest" name="bookingFor" />
    <label htmlFor="main-guest">
      <span className="radio-icon">👤</span>
      I am the main guest
    </label>
  </div>
  <div className="radio-option">
    <input type="radio" id="someone-else" name="bookingFor" />
    <label htmlFor="someone-else">
      <span className="radio-icon">👥</span>
      Booking is for someone else
    </label>
  </div>
</div>

<div className="form-group radio-group">
  <label>Are you travelling for work? (optional)</label>
  <div className="radio-option">
    <input type="radio" id="yes" name="travellingForWork" />
    <label htmlFor="yes">
      <span className="radio-icon">✔️</span>
      Yes
    </label>
  </div>
  <div className="radio-option">
    <input type="radio" id="no" name="travellingForWork" />
    <label htmlFor="no">
      <span className="radio-icon">❌</span>
      No
    </label>
  </div>
</div>

<div className="good-to-know-container">
  <span className="info-icon">ℹ️</span>
  <div className="good-to-know-text">
    <strong>Good to know:</strong> Stay flexible: You can cancel for free before 31 December 2024, so lock in this great price today.
  </div>
</div>

        <div className="form-group">
          <label>Special Requests (optional)</label>
          <p>Special requests cannot be guaranteed – but the property will do its best to meet your needs. You can always make a special request after your booking is complete!
     Please write your requests in English. (optional)</p>
          <textarea
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            placeholder="Any special requests?"
          />
        </div>

        <div className="check-in-container">
  <div className="arrival-time-section">
    <h3>Your arrival time</h3> {/* "Your arrival time" title */}
    <p className="check-in-info">
      <i className="fas fa-clock"></i> {/* Clock icon for check-in time */}
      <span>Your room will be ready for check-in between 15:00 and 00:00.</span><br />
      <i className="fas fa-headset"></i> {/* Headset icon for 24-hour front desk */}
      <span>24-hour front desk – Help whenever you need it!</span>
    </p>
  </div>

  <div className="form-group arrival-time-container">
    <label htmlFor="arrivalTime">Add your estimated arrival time *</label> {/* Label */}
    <div className="input-with-icon">
    
      <input
        type="time"
        id="arrivalTime"
        name="arrivalTime"
        value={formData.arrivalTime}
        onChange={handleChange}
        placeholder="Select your arrival time"
        className="arrival-time-input"
      />
    </div>
  </div>
</div>

        
      
        <div className="add-to-stay">
  <h2>Add to your stay</h2>

  <AddToStayOption
  icon="✈️" // Replace with an actual icon component/library
  title="I'll need a flight for my trip"
  description="Flexible flight options from Kuala Lumpur to London from MYR 4,789/round trip. Finish booking this stay to get flight recommendations that match your selected dates."
>
  <div className="select-option" onClick={() => handleSelect('flight')}>
    <span className="option-label">Select for flight booking</span>
  </div>
</AddToStayOption>

<AddToStayOption
  icon="🚗"
  title="I'm interested in renting a car with 10% off"
  description="Save 10% on all rental cars when you book with us - we'll add car hire options in your booking confirmation."
>
  <div className="select-option" onClick={() => handleSelect('car')}>
    <span className="option-label">Select for car rental</span>
  </div>
</AddToStayOption>

<AddToStayOption
  icon="🚕"
  title="Want to book a taxi or shuttle ride in advance?"
  description="Avoid surprises - get from the airport to your accommodation without a hitch. We'll add taxi options to your booking confirmation."
>
  <div className="select-option" onClick={() => handleSelect('taxi')}>
    <span className="option-label">Select for taxi booking</span>
  </div>
</AddToStayOption>
</div>
    <button type="submit" className="submit-btn">Next: Final details</button>
    </form>
</div>
</div>
  );
};

export default UserDetailsForm;
