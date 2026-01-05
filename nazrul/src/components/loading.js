import React from 'react';
import './loading.css'; // Create a loading CSS file for styles

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Processing your request...</p>
    </div>
  );
};

export default Loading;
