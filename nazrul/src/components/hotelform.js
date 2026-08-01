import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HotelDetails from './hoteldetails';
import UserDetailsForm from './userdetailsform';
import './hotelform.css';

const HOTEL_DRAFT_KEY = 'hotelBookingDraft';
const HOTEL_PAYMENT_DRAFT_KEY = 'hotelPaymentDraft';

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

const HotelForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingState = location.state || safeParse(sessionStorage.getItem(HOTEL_DRAFT_KEY), {});
  const { selectedHotel, totalPrice, startDate, returnDate, people } = bookingState;

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

    sessionStorage.setItem(HOTEL_DRAFT_KEY, JSON.stringify({ selectedHotel, totalPrice, startDate, returnDate, people }));
    sessionStorage.setItem(HOTEL_PAYMENT_DRAFT_KEY, JSON.stringify(bookingData));

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
      } else {
        console.warn('Hotel booking was not saved, continuing to payment.', bookingData);
      }
    } catch (error) {
      console.warn('Hotel booking save failed, continuing to payment:', error);
    }

    navigate('/hotelpaymentmethod', { state: bookingData });
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

  if (!selectedHotel) {
    return (
      <div className="hotel-form">
        <div className="container34">
          <div className="hotel-details-wrapper">
            <h2>No hotel booking data found</h2>
            <p>Please choose a hotel again to continue your booking.</p>
            <button className="submit-btn" onClick={() => navigate('/Hotel')}>Back to Hotels</button>
          </div>
        </div>
      </div>
    );
  }

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
