import React from 'react';

const GuestDetails = () => {
  return (
    <div className="guest-details">
      <h2>Guest Details</h2>
      <form>
        <div className="saved-guests">
          <label>
            <input type="checkbox" checked /> Nazrul Ahmad Shukri (Adult)
          </label>
        </div>
        <div className="guest-info">
          <h3>Nazrul Ahmad Shukri</h3>
          <p>Male</p>
          <p>Date of birth: 17/06/2000</p>
          <p>Nationality: Malaysia</p>
          <p>Email: lolbaker88@gmail.com</p>
        </div>
      </form>
    </div>
  );
};

export default GuestDetails;
