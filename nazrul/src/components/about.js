import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./about.css";
import Logo from "../img/assets/Booking1.png"
import nazrul from "../img/assets/feedbac/1665246418994.jpg"
import nazrul1 from "../img/assets/feedbac/Nazrul23.jpg"
import { color } from "framer-motion";
const AboutUs = () => {
  return (
    <div>
      <header className="hero text-center bg-gradient-primary text-white py-5" style={{ position: "relative", top: "80px" , width: "100%" }}>
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

      <section className="mission-vision py-5 bg-light" style={{ position: "relative", top: "50px" }}>
        <div className="container">
          <h2 className="text-center mb-4">Mission & Vision</h2>
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h3 className="card-title">Mission</h3>
                  <p className="card-text">The aim of the Flexi Book project is to develop a comprehensive booking system that allows users to conveniently search, compare, and book flights, hotels, and trains through a single platform.</p>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <h3 className="card-title">Vision</h3>
                  <p className="card-text">The vision for the Flexi Book Project is to create a unified, all-in-one travel booking platform that transforms the way users plan and book their journeys by seamlessly integrating flights, hotels, and trains into a single, user-friendly system.  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="leadership py-5 bg-light" style={{ position: "relative", top: "10px" }}>
  <div className="container">
    <h2 className="text-center mb-4 display-4 fw-bold text-dark">Leadership</h2>
    <div className="row justify-content-center">
      <div className="col-md-4 text-center mb-4">
        <div className="leadership-card p-4 rounded shadow-lg bg-white text-center">
          <img 
            src={nazrul} 
            alt="Leader Name" 
            className="img-fluid rounded-circle mb-3 border border-3 border-primary" 
            style={{ width: '300px', height: '350px', objectFit: 'cover' }}
          />
          <h3 className="fw-bold text-dark">Muhammadd Nazrul Bin Ahmad Shukri</h3>
          <p className="text-muted">Chief Executive Officer</p>
      
        </div>
      </div>

      <div className="col-md-4 text-center mb-4">
        <div className="leadership-card p-4 rounded shadow-lg bg-white text-center">
          <img 
            src={nazrul1} 
            alt="Leader Name" 
            className="img-fluid rounded-circle mb-3 border border-3 border-primary" 
            style={{ width: '300px', height: '350px', objectFit: 'cover' }}
          />
          <h3 className="fw-bold text-dark">Muhammad Nazrul Bin Ahmad shukri</h3>
          <p className="text-muted">Chief Technology Officer</p>
      
        </div>
      </div>
    </div>
  </div>
</section>

<section className="timeline py-5 bg-light" style={{ width: "100%", maxWidth: "2000px", margin: "0 auto" , marginTop: "50px", /* Moves the section down */ }}>
  <div className="container">
    <h2 className="text-center mb-5 display-4">Journey Booking Flex</h2>
    <div className="timeline-wrapper position-relative">
      <div className="timeline-line "></div>
      {[
        { year: "September 2024", description: "Registration form with Supervisor Muhammad Azmin Bin Mohamed Ghazali ", color: "bg-primary" },
        { year: "October 2024", description: "Develop the Booking Flex website", color: "bg-success" },
        { year: "October 2024", description: "Develop the Flight booking Page", color: "bg-danger" },
        { year: "November 2024", description: "Develop the Hotel Booking Page ", color: "bg-warning" },
        { year: "December 2024", description: "Develop the Booking Train Page", color: "bg-info" },
        { year: "January 2025", description: "Maintenance and enhacement Booking flex", color: "bg-success" },
        { year: "February 2025", description: "Ready To launch", color: "bg-danger" },
        { year: "March 2025", description: "Achieved object recognition.", color: "bg-warning" },
        { year: "April 2025", description: "Ready to sent the project to Open University Malaysia ", color: "bg-info" },
        { year: "May 2025", description: "Get 1 Milion user Use it ", color: "bg-primary" },
      ].map((item, index) => (
        <div key={index} className="timeline-item text-center" >
          <div className={`timeline-point ${item.color}`}></div>
          <div className="timeline-content">
            <h4 className="timeline-year">{item.year}</h4>
            <p className="timeline-description">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>






      <section className="objectives py-5">
        <div className="container">
          <h2 className="text-center mb-4">Objectives</h2>
          <ul className="list-unstyled text-muted">
            <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i> To create a user-friendly interface that simplifies the process of booking flights,
            hotels, and train tickets.</li>
            <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>To integrate various third-party APIs for real-time information on availability,
            pricing, and booking options.</li>
            <li><i className="bi bi-check-circle-fill text-success me-2"></i> To provide personalized recommendations based on user preferences and past
            bookings.</li>
          </ul>
        </div>
      </section>

      <section className="methodology-outcomes py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-4">Purposed Methodology & Expected Outcomes</h2>
          <div className="row">
            <div className="col-md-6">
              <h3>Methodology</h3>
              <p>The project will adopt an agile development approach, starting with the design of the user
interface and database structure. The frontend will be built using React, with React Router
for navigation, creating a dynamic and responsive user experience. The backend will be
developed using Node.js, with MongoDB as the database. The system will integrate third-
party APIs for flight, hotel, and train bookings, and will include a secure payment system.
Continuous testing and user feedback will be used to refine and improve the platform
throughout development.</p>
            </div>
            <div className="col-md-6">
              <h3>Expected Outcomes</h3>
              <p>A unified platform where users can book flights, hotels, and trains effortlessly.
Increased user convenience through a single login and payment system for all
bookings.
Enhanced customer satisfaction through personalized recommendations and a
streamlined booking process.
Competitive advantage in the travel booking market by offering a multi-service
platform.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="benefits py-5">
        <div className="container">
          <h2 className="text-center mb-4">Benefits</h2>
          <p className="text-muted">Working with Booking Flex means:</p>
          <ul className="list-unstyled">
            <li className="mb-2"><i className="bi bi-star-fill text-warning me-2"></i> Enhanced customer satisfaction through personalized recommendations and a
            streamlined booking process.</li>
            <li className="mb-2"><i className="bi bi-star-fill text-warning me-2"></i> Competitive advantage in the travel booking market by offering a multi-service
            platform.</li>
            <li><i className="bi bi-star-fill text-warning me-2"></i> Easier to know and make it more details </li>
          </ul>
        </div>
      </section>

      <section className="about-us py-5">
        <div className="container">
          <h2 className="text-center mb-4">About Us</h2>
          <p className="text-muted">
            Founded in 2024, BookingFlex has been dedicated to Easier User for booking in the single platform. Our team specializes in Software  to deliver exceptional results for our clients.
          </p>
        </div>
      </section>

    
    </div>
  );
};

export default AboutUs;
