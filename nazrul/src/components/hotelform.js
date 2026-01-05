import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HotelDetails from './hoteldetails';
import UserDetailsForm from './userdetailsform';
import './hotelform.css';

const HotelForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedHotel, totalPrice, startDate, returnDate, people } = location.state;

  const [currentStep, setCurrentStep] = useState(1);

  const handleFormSubmit = async (userData) => {
    console.log('User Details Submitted:', userData);
    setCurrentStep(3); // Move to the final step after form submission

    const bookingData = {
      hotelName: selectedHotel.hotelName,  // Ensure selectedHotel is defined and contains hotelName
      hotellocation: selectedHotel.location,    // Ensure selectedHotel contains location
      checkInDate: startDate,              // Ensure startDate is defined
      checkOutDate: returnDate,            // Ensure returnDate is defined
      price: totalPrice,                   // Ensure totalPrice is defined
      people,                              // Ensure people is defined
      userData: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        address: userData.address,
        city: userData.city,
        zip: userData.zip,
        country: userData.country,
        phone: userData.phone,
        specialRequests: userData.specialRequests,
        arrivalTime: userData.arrivalTime,
      },
    };

    try {
      const response = await fetch('http://localhost:5001/hotelform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        console.log('Booking data saved successfully');
        // Pass the entire bookingData including selectedHotel to the /hotelpaymentmethod route
        navigate('/hotelpaymentmethod', { state: bookingData });
      } else {
        console.error('Failed to save booking data', bookingData);
      }
    } catch (error) {
      console.error('Error saving booking data:', error);
    }
};

  
  useEffect(() => {
    const steps = document.querySelectorAll(".step");
    const lines = document.querySelectorAll(".line");

    steps.forEach((step, index) => {
      if (index < currentStep) {
        step.classList.add("completed");
        step.classList.remove("active");
        if (index < lines.length) lines[index].classList.add("completed-line");
      } else if (index === currentStep) {
        step.classList.add("active");
        step.classList.remove("completed");
        if (index > 0) lines[index - 1].classList.add("active-line");
      } else {
        step.classList.remove("active", "completed");
        if (index < lines.length) lines[index].classList.remove("completed-line", "active-line");
      }
    });
  }, [currentStep]);

  return (
    <div className="hotel-form">
      <div className="stepper-container">
        <div className="stepper">
          <div className={`step ${currentStep >= 1 ? "completed" : ""}`}>
            <div className="circle">1</div>
            <p>Your selection</p>
          </div>
          <div className="line"></div>
          <div className={`step ${currentStep === 2 ? "active" : ""}`}>
            <div className="circle">2</div>
            <p>Your details</p>
          </div>
          <div className="line"></div>
          <div className={`step ${currentStep === 3 ? "active" : ""}`}>
            <div className="circle">3</div>
            <p>Finish booking</p>
          </div>
        </div>
      </div>

      <div className="container34">
        <div className="hotel-details-wrapper">
          <HotelDetails
            selectedHotel={selectedHotel}
            totalPrice={totalPrice}
            returnDate={returnDate}
            startDate={startDate}
            people={people}
          />
        </div>

        <div className="user-details-form-wrapper12">
          <UserDetailsForm onFormSubmit={handleFormSubmit} />
        </div>
      </div>
    </div>
  );
};

export default HotelForm;
