import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./about.css";
import Logo from "../img/assets/Booking1.png";

const AboutUs = () => {
  return (
    <div>
      <header
        className="hero text-center bg-gradient-primary text-white py-5"
        style={{ position: "relative", top: "80px", width: "100%" }}
      >
        <div className="container d-flex align-items-center justify-content-center full-width-container">
          <div className="text-container text-center">
            <h1 className="display-4 fw-bold">Welcome To Booking Flex</h1>
            <p className="lead">to make it easier for everyone to experience the world</p>
          </div>

          <div className="image-container ms-4">
            <img
              src={Logo}
              alt="Icon"
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                borderRadius: "50%",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            />
          </div>
        </div>
      </header>
    </div>
  );
};

export default AboutUs;
