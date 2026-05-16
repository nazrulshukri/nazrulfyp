// import React, { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";

// import Loading from "./loading";          // ✅ adjust path if different
// import FlightDetails from "./flightdetails"; // ✅ adjust path if different
// import Modal from "./modal";              // ✅ adjust path if different

// import "./payment.css"; // if you have it


// const Payment = ({ user }) => {
//   const navigate = useNavigate();
//   const { state } = useLocation();

//   const {
//     selectedOutboundFlight,
//     selectedReturnFlight,
//     returnPrice: returnPriceFromState,

//     outboundFlight: outboundFlightOld,
//     returnFlight: returnFlightOld,
//     price: priceOld,

//     passengerDetails,
//     selectedInsurance,
//     selectedSeats = [],
//   } = state || {};

//   // ✅ Final variables used by this component
//   const outboundFlight = outboundFlightOld || selectedOutboundFlight;
//   const returnFlight = returnFlightOld || selectedReturnFlight;

//   // price fallback
//   const price = returnPriceFromState ?? priceOld ?? 0;

//   // ✅ State
//   const [insurancePrice, setInsurancePrice] = useState(0);
//   const [showModal, setShowModal] = useState(false);
//   const [returnPrice] = useState(Number(price) || 0);
//   const [loading, setLoading] = useState(true);

//   const totalSeatPrice = (selectedSeats?.length || 0) * 20;

//   useEffect(() => {
//     // Simulate loading
//     const t = setTimeout(() => setLoading(false), 2000);

//     if (selectedInsurance?.price != null) {
//       setInsurancePrice(Number(selectedInsurance.price) || 0);
//     } else {
//       setInsurancePrice(0);
//     }

//     return () => clearTimeout(t);
//   }, [selectedInsurance]);

//   if (loading) {
//     return <Loading />;
//   }

//   if (!outboundFlight) {
//     return <div>No outbound flight selected. Please go back and choose a flight.</div>;
//   }

//   const getTotalCostForFlight = (p) => Number(p) || 0;

//   const outboundPrice = getTotalCostForFlight(outboundFlight.price);

//   const totalAmount = {
//     flightPrice: outboundPrice + returnPrice,
//     taxes: 50.0,
//     serviceCharges: totalSeatPrice + insurancePrice,
//     total: outboundPrice + returnPrice + 50.0 + totalSeatPrice + insurancePrice,
//   };


//   // const handleBooking = async () => {
//   //   if (!passengerDetails || !passengerDetails.email) {
//   //     setShowModal(true);
//   //     return;
//   //   }

//     const bookingData = {x

//   // const handleContinue = () => {
   
//   // };

//   //  navigate('/paymentmethod');
// // const handleBooking = async () => {
// //   if (!passengerDetails || !passengerDetails.email) {
// //     setShowModal(true);
// //     return;
// //   }

// //   const bookingData = {
// //     outboundFlight,
// //     returnFlight,
// //     passengerDetails,
// //     selectedSeats,
// //     selectedInsurance,
// //     returnPrice,
// //     totalAmount: {
// //       flightPrice: outboundPrice + returnPrice,
// //       taxes: totalAmount.taxes,
// //       serviceCharges: totalAmount.serviceCharges,
// //       total: totalAmount.total,
// //     },
// //     userId: passengerDetails.email,
// //   };

// //   let bookingId = "TEMP-" + Date.now(); // ✅ fallback

// //   try {
// //     const response = await axios.post("http://localhost:5001/process-payment", bookingData);
// //     console.log("API Response:", response.data);

// //     if (response.data?.success) {
// //       bookingId = response.data.bookingId || bookingId;
// //     } else {
// //       console.warn("Backend returned success:false. Continue anyway.");
// //     }
// //   } catch (error) {
// //     console.error("Error saving booking:", error);
// //     console.warn("Backend failed. Continue anyway.");
// //   }

// //   // ✅ ALWAYS NAVIGATE (no matter backend OK or not)
// //   navigate("/paymentmethod", {
// //     state: {
// //       bookingId,
// //       totalAmount: bookingData.totalAmount.total,

// //       outboundFlight,
// //       returnFlight,
// //       passengerDetails,
// //       selectedSeats,
// //       selectedInsurance,

// //       returnPrice,
// //       totalAmount: {
// //         flightPrice: totalAmount.flightPrice,
// //         taxes: totalAmount.taxes,
// //         serviceCharges: totalAmount.serviceCharges,
// //         total: totalAmount.total,
// //       },
// //       userId: passengerDetails.email,
// //     };

// //     try {
// //       const response = await axios.post("http://localhost:5001/process-payment", bookingData);

// //       if (response.data?.success) {
// //         // optional reset
// //         setInsurancePrice(0);

// //         navigate("/paymentmethod", {
// //           state: {
// //             bookingId: response.data.bookingId,
// //             totalAmount: bookingData.totalAmount.total,
// //             outboundFlight,
// //             returnFlight,
// //             passengerDetails,
// //             selectedSeats,
// //             selectedInsurance,
// //           },
// //         });
// //       } else {
// //         alert("Payment failed. Please try again.");
// //       }
// //     } catch (error) {
// //       console.error("Error saving booking:", error);
// //       alert("Payment failed. Please try again.");
// //     }
// //   };

// //     },
// //   });
// // };


//   return (
//     <div className="payment-container1">
//       <div className="details-summary">
//         <div className="flight-details-section">
//           <h2>Flight Details</h2>
//           <FlightDetails
//             outboundFlight={outboundFlight}
//             returnFlight={returnFlight}
//             returnPrice={returnPrice}
//           />
//         </div>

//         <div className="fare-summary-section">
//           <h2 className="fare-summary-title">Fare Summary</h2>

//           <div className="flight-summary-container">
//             <div className="flight-summary-card">
//               <h3 className="flight-summary-heading">Departure Flight Summary</h3>
//               <p className="flight-price">Price: MYR {outboundPrice.toFixed(2)}</p>
//             </div>

//             <div className="flight-summary-card">
//               <h3 className="flight-summary-heading">Return Flight Summary</h3>
//               <p className="flight-price">Price: MYR {returnPrice.toFixed(2)}</p>
//             </div>
//           </div>

//           {selectedSeats?.length > 0 && (
//             <div className="selected-seats">
//               <h3 className="selected-seats-title">Selected Seats:</h3>
//               <p className="selected-seats-list">{selectedSeats.join(", ")}</p>
//             </div>
//           )}

//           <div className="fare-details">
//             <div className="fare-detail">
//               <span className="fare-label">
//                 <i className="fas fa-ticket-alt"></i> Base fare:
//               </span>
//               <span className="fare-amount">MYR {(outboundPrice + returnPrice).toFixed(2)}</span>
//             </div>

//             <div className="fare-detail">
//               <span className="fare-label">
//                 <i className="fas fa-percent"></i> Taxes & surcharges:
//               </span>
//               <span className="fare-amount">MYR {totalAmount.taxes.toFixed(2)}</span>
//             </div>

//             <div className="fare-detail">
//               <span className="fare-label">
//                 <i className="fas fa-plus-circle"></i> Insurance:
//               </span>
//               <span className="fare-amount">MYR {insurancePrice.toFixed(2)}</span>
//             </div>

//             <div className="fare-detail">
//               <span className="fare-label">
//                 <i className="fas fa-chair"></i> Seat Selection:
//               </span>
//               <span className="fare-amount">MYR {totalSeatPrice.toFixed(2)}</span>
//             </div>

//             <div className="fare-detail total">
//               <span className="fare-label">
//                 <i className="fas fa-receipt"></i> Total:
//               </span>
//               <span className="fare-amount">MYR {totalAmount.total.toFixed(2)}</span>
//             </div>
//           </div>

//           <button className="continue-btn" onClick={handleBooking}>
//             Book Now
//           </button>
//         </div>
//       </div>

//       <Modal
//         show={showModal}
//         onClose={() => setShowModal(false)}
//         title="Incomplete Information"
//         message="Please complete all passenger details before booking."
//       />
//     </div>
//   );
// };

// export default Payment;
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import Loading from "./loading";
import FlightDetails from "./flightdetails";
import Modal from "./modal";

import "./payment.css";

const Payment = ({ user }) => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const {
    selectedOutboundFlight,
    selectedReturnFlight,
    returnPrice: returnPriceFromState,

    outboundFlight: outboundFlightOld,
    returnFlight: returnFlightOld,
    price: priceOld,

    passengerDetails: passengerDetailsFromState,
    selectedInsurance: selectedInsuranceFromState,
    selectedSeats: selectedSeatsFromState = [],
  } = state || {};

  const outboundFlight = outboundFlightOld || selectedOutboundFlight;
  const returnFlight = returnFlightOld || selectedReturnFlight;

  const price = returnPriceFromState ?? priceOld ?? 0;

  const [passengerDetails, setPassengerDetails] = useState(passengerDetailsFromState || {});
  const [selectedInsurance, setSelectedInsurance] = useState(selectedInsuranceFromState || null);
  const [selectedSeats, setSelectedSeats] = useState(selectedSeatsFromState || []);
  const [showModal, setShowModal] = useState(false);
  const [returnPrice] = useState(Number(price) || 0);
  const [loading, setLoading] = useState(true);

  const insurancePrice = Number(selectedInsurance?.price) || 0;
  const totalSeatPrice = (selectedSeats?.length || 0) * 20;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2000);

    return () => clearTimeout(t);
  }, []);

  if (loading) return <Loading />;

  if (!outboundFlight) {
    return (
      <div>
        No outbound flight selected. Please go back and choose a flight.
      </div>
    );
  }

  const outboundPrice = Number(outboundFlight.price) || 0;

  const totalAmount = {
    flightPrice: outboundPrice + returnPrice,
    taxes: 50.0,
    serviceCharges: totalSeatPrice + insurancePrice,
    total:
      outboundPrice +
      returnPrice +
      50.0 +
      totalSeatPrice +
      insurancePrice,
  };

  // ✅ FIXED BOOKING FUNCTION
  const handleBooking = async () => {
    if (!passengerDetails || !passengerDetails.email) {
      setShowModal(true);
      return;
    }

    const bookingData = {
      outboundFlight,
      returnFlight,
      passengerDetails,
      selectedSeats,
      selectedInsurance,
      returnPrice,
      totalAmount,
      userId: passengerDetails.email,
    };

    let bookingId = "TEMP-" + Date.now();

    try {
      const response = await axios.post(
        "http://localhost:5001/process-payment",
        bookingData
      );

      if (response.data?.success) {
        bookingId = response.data.bookingId || bookingId;
      }
    } catch (error) {
      console.error("Backend error:", error);
    }

    navigate("/paymentmethod", {
      state: {
        bookingId,
        totalAmount: totalAmount.total,
        outboundFlight,
        returnFlight,
        passengerDetails,
        selectedSeats,
        selectedInsurance,
        returnPrice,
      },
    });
  };

  return (
    <div className="payment-container1">
      <div className="details-summary">
        <section className="flight-details-section payment-panel">
          <div className="payment-section-heading">
            <span className="payment-eyebrow">Secure checkout</span>
            <h2>Flight Details</h2>
          </div>
          <FlightDetails
            outboundFlight={outboundFlight}
            returnFlight={returnFlight}
            returnPrice={returnPrice}
            initialPassengerDetails={passengerDetails}
            initialSelectedSeats={selectedSeats}
            initialSelectedInsurance={selectedInsurance}
            onPassengerDetailsChange={setPassengerDetails}
            onSelectedSeatsChange={setSelectedSeats}
            onSelectedInsuranceChange={setSelectedInsurance}
            showBookingButton={false}
          />
        </section>

        <aside className="fare-summary-section payment-panel">
          <div className="fare-summary-header">
            <span className="payment-eyebrow">Booking total</span>
            <h2 className="fare-summary-title">Fare Summary</h2>
          </div>

          <div className="flight-summary-container">
            <div className="flight-summary-card">
              <span className="summary-chip">Outbound</span>
              <h3>Departure Flight</h3>
              <p>MYR {outboundPrice.toFixed(2)}</p>
            </div>

            <div className="flight-summary-card">
              <span className="summary-chip">Return</span>
              <h3>Return Flight</h3>
              <p>MYR {returnPrice.toFixed(2)}</p>
            </div>
          </div>

          {selectedSeats?.length > 0 && (
            <div className="selected-seats">
              <h3 className="selected-seats-title">Selected Seats</h3>
              <div className="selected-seats-list">
                {selectedSeats.map((seat) => (
                  <span className="seat-pill" key={seat}>
                    {seat}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="fare-details">
            <div className="fare-detail">
              <span className="fare-label">
                <i className="fas fa-ticket-alt"></i> Base fare
              </span>
              <span className="fare-amount">MYR {(outboundPrice + returnPrice).toFixed(2)}</span>
            </div>

            <div className="fare-detail">
              <span className="fare-label">
                <i className="fas fa-percent"></i> Taxes
              </span>
              <span className="fare-amount">MYR {totalAmount.taxes.toFixed(2)}</span>
            </div>

            <div className="fare-detail">
              <span className="fare-label">
                <i className="fas fa-shield-alt"></i> Insurance
              </span>
              <span className="fare-amount">MYR {insurancePrice.toFixed(2)}</span>
            </div>

            <div className="fare-detail">
              <span className="fare-label">
                <i className="fas fa-chair"></i> Seat selection
              </span>
              <span className="fare-amount">MYR {totalSeatPrice.toFixed(2)}</span>
            </div>

            <div className="fare-detail total">
              <span className="fare-label">
                <i className="fas fa-receipt"></i> Total
              </span>
              <span className="fare-amount">MYR {totalAmount.total.toFixed(2)}</span>
            </div>
          </div>

          <button className="continue-btn" onClick={handleBooking}>
            <span>Book Now</span>
            <i className="fas fa-arrow-right"></i>
          </button>
        </aside>
      </div>

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Incomplete Information"
        message="Please complete all passenger details before booking."
      />
    </div>
  );
};

export default Payment;
