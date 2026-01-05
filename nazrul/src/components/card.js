// src/components/Card.js
import React from 'react';
import './card.css'; // Import your styles

const Card = ({ image, title }) => {
    return (
        <div className="card">
            <img src={image} alt={title} className="card-image" />
            <h3 className="card-title">{title}</h3>
        </div>
    );
};

export default Card;
