import React, { useState } from 'react';

function GuestSelectionComponent() {
  const [selectedGuest, setSelectedGuest] = useState(null);

  const handleGuestSelection = (guest) => {
    setSelectedGuest(guest);
  };

  return (
    <div className="guest-selection">
      <h4>Saved Guests</h4>
      <div onClick={() => handleGuestSelection('Nazrul Ahmad Shukri')}>
        <input type="radio" checked={selectedGuest === 'Nazrul Ahmad Shukri'} />
        <label>Nazrul Ahmad Shukri (Adult)</label>
      </div>
    </div>
  );
}

export default GuestSelectionComponent;
