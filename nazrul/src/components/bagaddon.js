import React from 'react';

const BaggageAndAddons = () => {
  return (
    <div className="baggage-addons">
      <div className="baggage">
        <h4>Baggage</h4>
        <p>Kuala Lumpur - Langkawi: 1 x 7 kg Carry-on baggage</p>
        <p>Langkawi - Kuala Lumpur: 1 x 7 kg Carry-on baggage</p>
        <button>Modify</button>
      </div>
      <div className="seat-selection">
        <h4>Pick a seat</h4>
        <p>From MYR 13.00</p>
        <button>Pick a seat</button>
      </div>
      <div className="meal-selection">
        <h4>Santan Value Meal</h4>
        <button>Add meal</button>
      </div>
    </div>
  );
};

export default BaggageAndAddons;
