import React, { useState } from 'react';

function GuestFormComponent() {
  const [gender, setGender] = useState('Male');
  const [firstName, setFirstName] = useState('Nazrul');
  const [lastName, setLastName] = useState('Ahmad Shukri');

  return (
    <div className="guest-form">
      <h4>Nazrul Ahmad Shukri</h4>
      <div className="gender-selection">
        <button onClick={() => setGender('Male')} className={gender === 'Male' ? 'active' : ''}>Male</button>
        <button onClick={() => setGender('Female')} className={gender === 'Female' ? 'active' : ''}>Female</button>
      </div>
      <div className="name-fields">
        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First/Given Name" />
        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Family Name/Surname" />
      </div>
    </div>
  );
}

export default GuestFormComponent;
