// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   FaPlane,
//   FaHotel,
//   FaTrain,
//   FaCheckCircle,
//   FaTimesCircle,
//   FaExchangeAlt,
// } from "react-icons/fa";
// import Flatpickr from "react-flatpickr";
// import { AnimatePresence, motion } from "framer-motion";
// import "flatpickr/dist/themes/material_blue.css";
// import "./booking.css";

// const locations = [
//   "Kabul International Airport (Afghanistan)",
//   "Tirana International Airport (Albania)",
//   "Houari Boumediene International Airport (Algeria)",
//   "Andorra–La Seu dUrgell Airport (Andorra)",
//   "Quatro de Fevereiro International Airport (Angola)",
//   "V.C. Bird International Airport (Antigua and Barbuda)",
//   "Ministro Pistarini International Airport (Argentina)",
//   "Zvartnots International Airport (Armenia)",
//   "Sydney Kingsford Smith Airport (Australia)",
//   "Heydar Aliyev International Airport (Azerbaijan)",
//   "Freeport International Airport (Bahamas)",
//   "Bahrain International Airport (Bahrain)",
//   "Hazrat Shahjalal International Airport (Bangladesh)",
//   "Grantley Adams International Airport (Barbados)",
//   "Minsk National Airport (Belarus)",
//   "Brussels Airport (Belgium)",
//   "Philip S.W. Goldson International Airport (Belize)",
//   "Benin City Airport (Benin)",
//   "El Alto International Airport (Bolivia)",
//   "Sarajevo International Airport (Bosnia and Herzegovina)",
//   "Sir Seretse Khama International Airport (Botswana)",
//   "Brasília International Airport (Brazil)",
//   "Brunei International Airport (Brunei)",
//   "Sofia Airport (Bulgaria)",
//   "Thomas Sankara International Airport (Burkina Faso)",
//   "Melchior Ndadaye International Airport (Burundi)",
//   "Phnom Penh International Airport (Cambodia)",
//   "Douala International Airport (Cameroon)",
//   "Toronto Pearson International Airport (Canada)",
//   "Owen Roberts International Airport (Cayman Islands)",
//   "Bangui-MPoko International Airport (Central African Republic)",
//   "NDjamena International Airport (Chad)",
//   "Arturo Merino Benitez International Airport (Chile)",
//   "Beijing Capital International Airport (China)",
//   "El Dorado International Airport (Colombia)",
//   "Prince Said Ibrahim International Airport (Comoros)",
//   "Juan Santamaría International Airport (Costa Rica)",
//   "Franjo Tuđman Airport (Croatia)",
//   "José Martí International Airport (Cuba)",
//   "Larnaka International Airport (Cyprus)",
//   "Václav Havel Airport Prague (Czech Republic)",
//   "Copenhagen Airport (Denmark)",
//   "Ambouli International Airport (Djibouti)",
//   "Douglas-Charles Airport (Dominica)",
//   "Las Américas International Airport (Dominican Republic)",
//   "Mariscal Sucre International Airport (Ecuador)",
//   "Cairo International Airport (Egypt)",
//   "Monseñor Óscar Arnulfo Romero International Airport (El Salvador)",
//   "Malabo International Airport (Equatorial Guinea)",
//   "Asmara International Airport (Eritrea)",
//   "Tallinn Airport (Estonia)",
//   "King Mswati III International Airport (Eswatini)",
//   "Bole International Airport (Ethiopia)",
//   "Nadi International Airport (Fiji)",
//   "Helsinki-Vantaa Airport (Finland)",
//   "Charles de Gaulle Airport (France)",
//   "Leon M’ba International Airport (Gabon)",
//   "Banjul International Airport (Gambia)",
//   "Tbilisi International Airport (Georgia)",
//   "Frankfurt Airport (Germany)",
//   "Kotoka International Airport (Ghana)",
//   "Eleftherios Venizelos Airport (Greece)",
//   "Maurice Bishop International Airport (Grenada)",
//   "La Aurora International Airport (Guatemala)",
//   "Conakry International Airport (Guinea)",
//   "Osvaldo Vieira International Airport (Guinea-Bissau)",
//   "Cheddi Jagan International Airport (Guyana)",
//   "Toussaint Louverture International Airport (Haiti)",
//   "Toncontín International Airport (Honduras)",
//   "Budapest Liszt Ferenc International Airport (Hungary)",
//   "Keflavík International Airport (Iceland)",
//   "Indira Gandhi International Airport (India)",
//   "Soekarno–Hatta International Airport (Indonesia)",
//   "Tehran Imam Khomeini International Airport (Iran)",
//   "Baghdad International Airport (Iraq)",
//   "Dublin Airport (Ireland)",
//   "Ben Gurion Airport (Israel)",
//   "Leonardo da Vinci International Airport (Italy)",
//   "Norman Manley International Airport (Jamaica)",
//   "Haneda International Airport (Japan)",
//   "Queen Alia International Airport (Jordan)",
//   "Almaty International Airport (Kazakhstan)",
//   "Jomo Kenyatta International Airport (Kenya)",
//   "Nauru International Airport (Kiribati)",
//   "Incheon International Airport (South Korea)",
//   "Pristina International Airport (Kosovo)",
//   "Kuwait International Airport (Kuwait)",
//   "Manas International Airport (Kyrgyzstan)",
//   "Wattay International Airport (Laos)",
//   "Riga International Airport (Latvia)",
//   "Beirut-Rafic Hariri International Airport (Lebanon)",
//   "Moshoeshoe I International Airport (Lesotho)",
//   "Roberts International Airport (Liberia)",
//   "Mitiga International Airport (Libya)",
//   "Liechtenstein Airport (Liechtenstein)",
//   "Vilnius International Airport (Lithuania)",
//   "Luxembourg Findel Airport (Luxembourg)",
//   "Ivato International Airport (Madagascar)",
//   "Kamuzu International Airport (Malawi)",
//   "Kuala Lumpur International Airport (Malaysia)",
//   "Malé International Airport (Maldives)",
//   "Mexico City International Airport (Mexico)",
//   "Dubai International Airport (United Arab Emirates)",
//   "Zanzibar International Airport (Tanzania)",
//   "Lagos Murtala Muhammed International Airport (Nigeria)",
//   "JFK International Airport (USA)",
//   "O.R. Tambo International Airport (South Africa)",
//   "London Heathrow Airport (United Kingdom)",
//   "New Delhi Indira Gandhi International Airport (India)",
//   "Hong Kong International Airport (Hong Kong)",
//   "Bangkok Suvarnabhumi Airport (Thailand)",
//   "Madrid Barajas International Airport (Spain)",
//   "Fiumicino International Airport (Italy)",
//   "Changi Airport (Singapore)",
//   "Berlin Brandenburg Airport (Germany)",
//   "Düsseldorf Airport (Germany)",
//   "Ninoy Aquino International Airport (Philippines)",
//   "Noi Bai International Airport (Vietnam)",
//   "London",
//   "Malaysia",
//   "Petaling jaya",
//   "KLIA2",
//   "KLIA",
//   "Terminal Bersepadu Selatan(TBS)",
// ];

// const SUGGEST_LIMIT = 50; // change to 501 if you really want 501

// function Booking() {
//   const navigate = useNavigate();

//   const [selectedOption, setSelectedOption] = useState("");
//   const [tripType, setTripType] = useState("return");

//   const [location, setLocation] = useState("");
//   const [location1, setLocation1] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [returnDate, setReturnDate] = useState("");
//   const [people, setPeople] = useState(1);

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const bookingWrapperRef = useRef(null);

//   const fromInputRef = useRef(null);
//   const toInputRef = useRef(null);
//   const fromListRef = useRef(null);
//   const toListRef = useRef(null);

//   const [showFromSuggestions, setShowFromSuggestions] = useState(false);
//   const [showToSuggestions, setShowToSuggestions] = useState(false);
//   const [filteredFromLocations, setFilteredFromLocations] = useState([]);
//   const [filteredToLocations, setFilteredToLocations] = useState([]);
//   const [fromSelected, setFromSelected] = useState(false);
//   const [toSelected, setToSelected] = useState(false);
//   const [fromPlaceholder, setFromPlaceholder] = useState("");
//   const [pauseFromTyping, setPauseFromTyping] = useState(false);
//   animated placeholder (TO)
// const [toPlaceholder, setToPlaceholder] = useState("");
// const [pauseToTyping, setPauseToTyping] = useState(false);
//   swap + typewriter
//   const [swapPulse, setSwapPulse] = useState(false);

//   const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
//   const typeTo = async (setter, text, speed = 10) => {
//     setter("");
//     for (let i = 0; i <= text.length; i++) {
//       setter(text.slice(0, i));
//       eslint-disable-next-line no-await-in-loop
//       await sleep(speed);
//     }
//   };

//   const handleSwap = async () => {
//     if (!location && !location1) return;

//     setSwapPulse(true);
//     setTimeout(() => setSwapPulse(false), 380);

//     const a = location;
//     const b = location1;

//     setShowFromSuggestions(false);
//     setShowToSuggestions(false);

//     await typeTo(setLocation, b, 8);
//     await typeTo(setLocation1, a, 8);

//     setFromSelected(!!b);
//     setToSelected(!!a);
//   };

//   useEffect(() => {
//   if (pauseToTyping || location1) return;

//   const texts = [
//     "London Heathrow (LHR)",
//     "Tokyo Haneda (HND)",
//     "Paris Charles de Gaulle (CDG)",
//     "New York JFK (JFK)",
//     "Singapore Changi (SIN)",
//   ];

//   let textIndex = 0;
//   let i = 0;
//   let deleting = false;
//   let timer;

//   const loop = () => {
//     const text = texts[textIndex];

//     if (!deleting) {
//       setToPlaceholder(text.slice(0, i + 1));
//       i++;
//       if (i === text.length) {
//         timer = setTimeout(() => (deleting = true), 1200);
//       }
//     } else {
//       setToPlaceholder(text.slice(0, i - 1));
//       i--;
//       if (i === 0) {
//         deleting = false;
//         textIndex = (textIndex + 1) % texts.length; // 🔁 next destination
//         timer = setTimeout(() => {}, 500);
//       }
//     }
//   };

//   const interval = setInterval(loop, 90);

//   return () => {
//     clearInterval(interval);
//     clearTimeout(timer);
//   };
// }, [pauseToTyping, location1]);
// useEffect(() => {
//   if (pauseFromTyping || location) return;

//   const texts = [
//     "Kuala Lumpur (KUL)",
//     "Bangkok (BKK)",
//     "Jakarta (CGK)",
//     "Singapore (SIN)",
//     "Hong Kong (HKG)",
//   ];

//   let textIndex = 0;
//   let i = 0;
//   let deleting = false;
//   let timer;

//   const loop = () => {
//     const text = texts[textIndex];

//     if (!deleting) {
//       setFromPlaceholder(text.slice(0, i + 1));
//       i++;
//       if (i === text.length) {
//         timer = setTimeout(() => (deleting = true), 1200);
//       }
//     } else {
//       setFromPlaceholder(text.slice(0, i - 1));
//       i--;
//       if (i === 0) {
//         deleting = false;
//         textIndex = (textIndex + 1) % texts.length; // 🔁 next destination
//         timer = setTimeout(() => {}, 500);
//       }
//     }
//   };

//   const interval = setInterval(loop, 90);

//   return () => {
//     clearInterval(interval);
//     clearTimeout(timer);
//   };
// }, [pauseFromTyping, location]);

//   Filter From suggestions (fast + capped)
//   useEffect(() => {
//     const q = location.trim().toLowerCase();
//     if (q.length < 2) {
//       setFilteredFromLocations([]);
//       return;
//     }
//     setFilteredFromLocations(
//       locations
//         .filter((loc) => loc.toLowerCase().includes(q))
//         .slice(0, SUGGEST_LIMIT)
//     );
//   }, [location]);

//   Filter To suggestions (fast + capped)
//   useEffect(() => {
//     const q = location1.trim().toLowerCase();
//     if (q.length < 2) {
//       setFilteredToLocations([]);
//       return;
//     }
//     setFilteredToLocations(
//       locations
//         .filter((loc) => loc.toLowerCase().includes(q))
//         .slice(0, SUGGEST_LIMIT)
//     );
//   }, [location1]);

//   Close suggestions when clicking outside
//  useEffect(() => {
//   const handleClickOutside = (e) => {
//     ✅ DO NOT close anything if user clicks the flatpickr calendar
//     if (e.target.closest(".flatpickr-calendar")) return;

//     const fromEl = fromInputRef.current;
//     const toEl = toInputRef.current;
//     const fromList = fromListRef.current;
//     const toList = toListRef.current;

//     if (fromEl && fromList && !fromEl.contains(e.target) && !fromList.contains(e.target)) {
//       setShowFromSuggestions(false);
//     }
//     if (toEl && toList && !toEl.contains(e.target) && !toList.contains(e.target)) {
//       setShowToSuggestions(false);
//     }
//   };

//   ✅ use capture so we detect correctly before other handlers
//   document.addEventListener("mousedown", handleClickOutside, true);
//   return () => document.removeEventListener("mousedown", handleClickOutside, true);
// }, []);

//   One-way clears return date
//   useEffect(() => {
//     if (tripType === "oneway") setReturnDate("");
//   }, [tripType]);

//   Sync dark mode to body (flatpickr appended to body)
//   useEffect(() => {
//     const syncBodyDarkMode = () => {
//       const appEl = document.querySelector(".app");
//       const isDark = !!(appEl && appEl.classList.contains("dark-mode"));
//       document.body.classList.toggle("dark-mode", isDark);
//     };

//     syncBodyDarkMode();

//     const appEl = document.querySelector(".app");
//     if (!appEl) return;

//     const obs = new MutationObserver(syncBodyDarkMode);
//     obs.observe(appEl, { attributes: true, attributeFilter: ["class"] });

//     return () => obs.disconnect();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setError("");
//     setSuccess("");

//     if (!selectedOption) {
//       setError("Please select a booking option.");
//       return;
//     }
//     if (!location || !location1) {
//       setError("Please fill From and To.");
//       return;
//     }
//     if (!startDate) {
//       setError("Please select a From Date.");
//       return;
//     }
//     if (((selectedOption === "flight" && tripType !== "oneway") || selectedOption === "hotel" || selectedOption === "train") && !returnDate) {
//       setError("Please select a Return Date.");
//       return;
//     }

//     try {
//       if (selectedOption === "flight") {
//         navigate("/flight-results", {
//           state: {
//             flightParams: {
//               departureDate: startDate,
//               returnDate: tripType === "oneway" ? "" : returnDate,
//               origin: location,
//               destination: location1,
//               people,
//               tripType,
//             },
//           },
//         });
//       }

//       if (selectedOption === "hotel") {
//         navigate("/hotel", {
//           state: {
//             checkInDate: startDate,
//             checkOutDate: returnDate,
//             location: location1,
//             people,
//           },
//         });
//       }

//       if (selectedOption === "train") {
//         navigate("/train", {
//           state: {
//             departureDate: startDate,
//             returnDate,
//             origin: location,
//             destination: location1,
//             people,
//           },
//         });
//       }

//       await axios.post("http://localhost:5001/bookings", {
//         selectedOption,
//         tripType,
//         location,
//         location1,
//         startDate,
//         returnDate,
//         people,
//       });

//       setSuccess("Booking submitted successfully!");
//     } catch (err) {
//       setError("Error submitting booking.");
//     }
//   };

//   return (
//     <div ref={bookingWrapperRef} className="booking-wrapper">
//       <div className="button-container">
//         <button
//           className={`option-button ${selectedOption === "flight" ? "active" : ""}`}
//           onClick={() => setSelectedOption("flight")}
//           type="button"
//         >
//           <FaPlane /> Flight
//         </button>

//         <button
//           className={`option-button ${selectedOption === "hotel" ? "active" : ""}`}
//           onClick={() => setSelectedOption("hotel")}
//           type="button"
//         >
//           <FaHotel /> Hotel
//         </button>

//         <button
//           className={`option-button ${selectedOption === "train" ? "active" : ""}`}
//           onClick={() => setSelectedOption("train")}
//           type="button"
//         >
//           <FaTrain /> Train
//         </button>
//       </div>

//       <form className="booking-form" onSubmit={handleSubmit}>
//         {/* ✅ NEW ROUTE GRID HERE */}
//         <div className="route-grid">
//           {/* FROM */}
//           <motion.div
//             className="form-group"
//             animate={swapPulse ? { x: [-3, 3, -3, 3, 0] } : {}}
//             transition={{ duration: 0.22 }}
//           >
//             <label>From</label>
//            <input
//   ref={fromInputRef}
//   value={location}
//   placeholder={fromPlaceholder}
//   onFocus={() => {
//     setPauseFromTyping(true);
//     if (fromSelected) {
//       setLocation("");
//       setFromSelected(false);
//     }
//     setShowFromSuggestions(true);
//   }}
//   onBlur={() => {
//     if (!location) setPauseFromTyping(false);
//   }}
//   onChange={(e) => {
//     setLocation(e.target.value);
//     setPauseFromTyping(true);
//     setShowFromSuggestions(true);
//   }}
// />

//             <AnimatePresence>
//               {showFromSuggestions && (
//                 <motion.ul
//                   ref={fromListRef}
//                   className="suggestions-list modern"
//                   initial={{ opacity: 0, y: -10, scale: 0.98 }}
//                   animate={{ opacity: 1, y: 0, scale: 1 }}
//                   exit={{ opacity: 0, y: -10, scale: 0.98 }}
//                   transition={{ duration: 0.18, ease: "easeOut" }}
//                 >
//                   {filteredFromLocations.map((loc, i) => (
//                     <li
//                       key={i}
//                       onClick={() => {
//                         setLocation(loc);
//                         setShowFromSuggestions(false);
//                         setFromSelected(true);
//                       }}
//                     >
//                       <span className="suggestion-icon">
//                         <FaPlane />
//                       </span>
//                       <span className="suggestion-text">{loc}</span>
//                     </li>
//                   ))}
//                 </motion.ul>
//               )}
//             </AnimatePresence>
//           </motion.div>

//           {/* SWAP */}
//           <div className="swap-col">
//             <button type="button" className="swap-btn" onClick={handleSwap} aria-label="Swap">
//               <FaExchangeAlt />
//             </button>
//           </div>

//           {/* TO */}
//           <motion.div
//             className="form-group"
//             animate={swapPulse ? { x: [3, -3, 3, -3, 0] } : {}}
//             transition={{ duration: 0.22 }}
//           >
//             <label>To</label>
//             <input
//   ref={toInputRef}
//   value={location1}
//   placeholder={toPlaceholder}
//   onFocus={() => {
//     setPauseToTyping(true);
//     if (toSelected) {
//       setLocation1("");
//       setToSelected(false);
//     }
//     setShowToSuggestions(true);
//   }}
//   onBlur={() => {
//     if (!location1) setPauseToTyping(false);
//   }}
//   onChange={(e) => {
//     setLocation1(e.target.value);
//     setPauseToTyping(true);
//     setShowToSuggestions(true);
//   }}
// />

//             <AnimatePresence>
//               {showToSuggestions && (
//                 <motion.ul
//                   ref={toListRef}
//                   className="suggestions-list modern"
//                   initial={{ opacity: 0, y: -10, scale: 0.98 }}
//                   animate={{ opacity: 1, y: 0, scale: 1 }}
//                   exit={{ opacity: 0, y: -10, scale: 0.98 }}
//                   transition={{ duration: 0.18, ease: "easeOut" }}
//                 >
//                   {filteredToLocations.map((loc, i) => (
//                     <li
//                       key={i}
//                       onClick={() => {
//                         setLocation1(loc);
//                         setShowToSuggestions(false);
//                         setToSelected(true);
//                       }}
//                     >
//                       <span className="suggestion-icon">
//                         <FaPlane />
//                       </span>
//                       <span className="suggestion-text">{loc}</span>
//                     </li>
//                   ))}
//                 </motion.ul>
//               )}
//             </AnimatePresence>
//           </motion.div>
//         </div>

//         {selectedOption === "flight" && (
//           <div className="form-group">
//             <label>Trip Type</label>
//             <select value={tripType} onChange={(e) => setTripType(e.target.value)}>
//               <option value="return">Return</option>
//               <option value="oneway">One Way</option>
//               <option value="multicity">Multi-City</option>
//             </select>
//           </div>
//         )}

//         <div className="form-group">
//           <label>From Date</label>
//           <div className="calendar-wrapper">
//             <Flatpickr
//               value={startDate}
//               options={{
//                 minDate: "today",
//                 dateFormat: "Y-m-d",
//                 disableMobile: true,
//                 clickOpens: true,
//                 allowInput: false,
//                 closeOnSelect: true,
//                 appendTo: bookingWrapperRef.current || document.body,
//               }}
//               onChange={(_, dateStr) => {
//                 setStartDate(dateStr);
//                 if (tripType !== "oneway" && returnDate && dateStr > returnDate) {
//                   setReturnDate("");
//                 }
//               }}
//               className="modern-calendar"
//             />
//             <span className="calendar-icon">📅</span>
//           </div>
//         </div>

//         {((selectedOption === "flight" && tripType !== "oneway") ||
//           selectedOption === "hotel" ||
//           selectedOption === "train") && (
//           <div className="form-group">
//             <label>Return Date</label>
//             <div className="calendar-wrapper">
//               <Flatpickr
//                 value={returnDate}
//                 options={{
//                   minDate: startDate || "today",
//                   dateFormat: "Y-m-d",
//                   disableMobile: true,
//                   closeOnSelect: true,
//                   appendTo: bookingWrapperRef.current || document.body,
//                 }}
//                 onChange={(_, dateStr, instance) => {
//                   setReturnDate(dateStr);
//                   instance.close();
//                 }}
//                 className="modern-calendar"
//               />
//               <span className="calendar-icon">📅</span>
//             </div>
//           </div>
//         )}

//         <div className="form-group">
//           <label>People</label>
//           <input
//             type="number"
//             min="1"
//             value={people}
//             onChange={(e) => setPeople(Number(e.target.value))}
//           />
//         </div>

//         <button className="submit-button" type="submit">
//           Submit Booking
//         </button>

//         {error && (
//           <div className="error-message">
//             <FaTimesCircle /> {error}
//           </div>
//         )}
//         {success && (
//           <div className="success-message">
//             <FaCheckCircle /> {success}
//           </div>
//         )}
//       </form>
//     </div>
//   );
// }

// export default Booking;

// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { FaPlane, FaHotel, FaTrain, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
// import Flatpickr from "react-flatpickr";
// import "flatpickr/dist/themes/material_blue.css";
// import './booking.css';
// import { FaLocationDot } from "react-icons/fa6";
// const locations = [
//   'Kabul International Airport (Afghanistan)',
//   'Tirana International Airport (Albania)',
//   'Houari Boumediene International Airport (Algeria)',
//   'Andorra–La Seu dUrgell Airport (Andorra)',
//   'Quatro de Fevereiro International Airport (Angola)',
//   'V.C. Bird International Airport (Antigua and Barbuda)',
//   'Ministro Pistarini International Airport (Argentina)',
//   'Zvartnots International Airport (Armenia)',
//   'Sydney Kingsford Smith Airport (Australia)',
//   'Heydar Aliyev International Airport (Azerbaijan)',
//   'Freeport International Airport (Bahamas)',
//   'Bahrain International Airport (Bahrain)',
//   'Hazrat Shahjalal International Airport (Bangladesh)',
//   'Grantley Adams International Airport (Barbados)',
//   'Minsk National Airport (Belarus)',
//   'Brussels Airport (Belgium)',
//   'Philip S.W. Goldson International Airport (Belize)',
//   'Benin City Airport (Benin)',
//   'El Alto International Airport (Bolivia)',
//   'Sarajevo International Airport (Bosnia and Herzegovina)',
//   'Sir Seretse Khama International Airport (Botswana)',
//   'Brasília International Airport (Brazil)',
//   'Brunei International Airport (Brunei)',
//   'Sofia Airport (Bulgaria)',
//   'Thomas Sankara International Airport (Burkina Faso)',
//   'Melchior Ndadaye International Airport (Burundi)',
//   'Phnom Penh International Airport (Cambodia)',
//   'Douala International Airport (Cameroon)',
//   'Toronto Pearson International Airport (Canada)',
//   'Owen Roberts International Airport (Cayman Islands)',
//   'Bangui-MPoko International Airport (Central African Republic)',
//   'NDjamena International Airport (Chad)',
//   'Arturo Merino Benitez International Airport (Chile)',
//   'Beijing Capital International Airport (China)',
//   'El Dorado International Airport (Colombia)',
//   'Prince Said Ibrahim International Airport (Comoros)',
//   'Juan Santamaría International Airport (Costa Rica)',
//   'Franjo Tuđman Airport (Croatia)',
//   'José Martí International Airport (Cuba)',
//   'Larnaka International Airport (Cyprus)',
//   'Václav Havel Airport Prague (Czech Republic)',
//   'Copenhagen Airport (Denmark)',
//   'Ambouli International Airport (Djibouti)',
//   'Douglas-Charles Airport (Dominica)',
//   'Las Américas International Airport (Dominican Republic)',
//   'Mariscal Sucre International Airport (Ecuador)',
//   'Cairo International Airport (Egypt)',
//   'Monseñor Óscar Arnulfo Romero International Airport (El Salvador)',
//   'Malabo International Airport (Equatorial Guinea)',
//   'Asmara International Airport (Eritrea)',
//   'Tallinn Airport (Estonia)',
//   'King Mswati III International Airport (Eswatini)',
//   'Bole International Airport (Ethiopia)',
//   'Nadi International Airport (Fiji)',
//   'Helsinki-Vantaa Airport (Finland)',
//   'Charles de Gaulle Airport (France)',
//   'Leon M’ba International Airport (Gabon)',
//   'Banjul International Airport (Gambia)',
//   'Tbilisi International Airport (Georgia)',
//   'Frankfurt Airport (Germany)',
//   'Kotoka International Airport (Ghana)',
//   'Eleftherios Venizelos Airport (Greece)',
//   'Maurice Bishop International Airport (Grenada)',
//   'La Aurora International Airport (Guatemala)',
//   'Conakry International Airport (Guinea)',
//   'Osvaldo Vieira International Airport (Guinea-Bissau)',
//   'Cheddi Jagan International Airport (Guyana)',
//   'Toussaint Louverture International Airport (Haiti)',
//   'Toncontín International Airport (Honduras)',
//   'Budapest Liszt Ferenc International Airport (Hungary)',
//   'Keflavík International Airport (Iceland)',
//   'Indira Gandhi International Airport (India)',
//   'Soekarno–Hatta International Airport (Indonesia)',
//   'Tehran Imam Khomeini International Airport (Iran)',
//   'Baghdad International Airport (Iraq)',
//   'Dublin Airport (Ireland)',
//   'Ben Gurion Airport (Israel)',
//   'Leonardo da Vinci International Airport (Italy)',
//   'Norman Manley International Airport (Jamaica)',
//   'Haneda International Airport (Japan)',
//   'Queen Alia International Airport (Jordan)',
//   'Almaty International Airport (Kazakhstan)',
//   'Jomo Kenyatta International Airport (Kenya)',
//   'Nauru International Airport (Kiribati)',
//   'Incheon International Airport (South Korea)',
//   'Pristina International Airport (Kosovo)',
//   'Kuwait International Airport (Kuwait)',
//   'Manas International Airport (Kyrgyzstan)',
//   'Wattay International Airport (Laos)',
//   'Riga International Airport (Latvia)',
//   'Beirut-Rafic Hariri International Airport (Lebanon)',
//   'Moshoeshoe I International Airport (Lesotho)',
//   'Roberts International Airport (Liberia)',
//   'Mitiga International Airport (Libya)',
//   'Liechtenstein Airport (Liechtenstein)',
//   'Vilnius International Airport (Lithuania)',
//   'Luxembourg Findel Airport (Luxembourg)',
//   'Ivato International Airport (Madagascar)',
//   'Kamuzu International Airport (Malawi)',
//   'Kuala Lumpur International Airport (Malaysia)',
//   'Malé International Airport (Maldives)',
//   'Mexico City International Airport (Mexico)',
//   'Dubai International Airport (United Arab Emirates)',
//   'Zanzibar International Airport (Tanzania)',
//   'Lagos Murtala Muhammed International Airport (Nigeria)',
//   'JFK International Airport (USA)',
//   'O.R. Tambo International Airport (South Africa)',
//   'London Heathrow Airport (United Kingdom)',
//   'New Delhi Indira Gandhi International Airport (India)',
//   'Hong Kong International Airport (Hong Kong)',
//   'Bangkok Suvarnabhumi Airport (Thailand)',
//   'Charles de Gaulle International Airport (France)',
//   'Madrid Barajas International Airport (Spain)',
//   'Fiumicino International Airport (Italy)',
//   'Sydney Kingsford Smith International Airport (Australia)',
//   'Changi Airport (Singapore)',
//   'Cape Town International Airport (South Africa)',
//   'Toronto Pearson International Airport (Canada)',
//   'Shenzhen Bao’an International Airport (China)',
//   'Berlin Brandenburg Airport (Germany)',
//   'Düsseldorf Airport (Germany)',
//   'Mexico City International Airport (Mexico)',
//   'Ninoy Aquino International Airport (Philippines)',
//   'Noi Bai International Airport (Vietnam)',
//   'London', 'Malaysia', 'Petaling jaya', 'KLIA2', 'KLIA', 'Terminal Bersepadu Selatan(TBS)'
// ];

// const FieldSelect = ({ icon, label, value, onChange, options }) => (
//   <div className="field">
//     <div className={`field-shell ${String(value) !== "" ? "is-filled" : ""}`}>
//       <span className="field-icon" aria-hidden="true">{icon}</span>

//       <select className="field-select" value={value} onChange={onChange}>
//         {options.map((opt) => (
//           <option key={opt.value} value={opt.value}>
//             {opt.label}
//           </option>
//         ))}
//       </select>

//       <label className="floating-label">{label}</label>
//     </div>
//   </div>
// );





// const makeOptions = (min, max) =>
//   Array.from({ length: max - min + 1 }, (_, i) => {
//     const v = min + i;
//     return { value: v, label: String(v) };
//   });

// function Booking() {
//   const navigate = useNavigate();

//   const [selectedOption, setSelectedOption] = useState('');
//   const [tripType, setTripType] = useState('return');

//   const [location, setLocation] = useState('');
//   const [location1, setLocation1] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [returnDate, setReturnDate] = useState('');
//   // const [people, setPeople] = useState(1);
//   const [adults, setAdults] = useState(1);
// const [children, setChildren] = useState(0); // 3–17
// const [infants, setInfants] = useState(0);   // 0–2

// const people = adults + children + infants; // ✅ derived, NOT state

//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   const fromListRef = useRef(null);
//   const toListRef = useRef(null);
//   const bookingWrapperRef = useRef(null);
  
//   const [showFromSuggestions, setShowFromSuggestions] = useState(false);
//   const [showToSuggestions, setShowToSuggestions] = useState(false);
//   const [filteredFromLocations, setFilteredFromLocations] = useState([]);
//   const [filteredToLocations, setFilteredToLocations] = useState([]);
//   const [fromSelected, setFromSelected] = useState(false);
//   const [toSelected, setToSelected] = useState(false);
//   const [fromFocused, setFromFocused] = useState(false);
//   const fromInputRef = useRef(null);
//   const toInputRef = useRef(null);
//   const [fromFlash, setFromFlash] = useState(false);
//   const [toFlash, setToFlash] = useState(false);
//  const [toFocused, setToFocused] = useState(false);
 

//   useEffect(() => {
//   if (infants > adults) setInfants(adults);
// }, [adults, infants]);

//   useEffect(() => {
//     setFilteredFromLocations(
//       locations.filter(loc => loc.toLowerCase().includes(location.toLowerCase()))
//     );
//   }, [location]);

//   useEffect(() => {
//     setFilteredToLocations(
//       locations.filter(loc => loc.toLowerCase().includes(location1.toLowerCase()))
//     );
//   }, [location1]);

//   // Keep suggestions closed when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       const fromEl = fromInputRef.current;
//       const toEl = toInputRef.current;
//       const fromList = fromListRef.current;
//       const toList = toListRef.current;

//       if (fromEl && fromList && !fromEl.contains(e.target) && !fromList.contains(e.target)) {
//         setShowFromSuggestions(false);
//       }
//       if (toEl && toList && !toEl.contains(e.target) && !toList.contains(e.target)) {
//         setShowToSuggestions(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // One-way clears return date
//   useEffect(() => {
//     if (tripType === 'oneway') setReturnDate('');
//   }, [tripType]);

//   // IMPORTANT: make calendar dark-mode CSS work even if popup is appended to <body>
//   // This mirrors .app.dark-mode -> body.dark-mode automatically
//   useEffect(() => {
//     const syncBodyDarkMode = () => {
//       const appEl = document.querySelector('.app');
//       const isDark = !!(appEl && appEl.classList.contains('dark-mode'));
//       document.body.classList.toggle('dark-mode', isDark);
//     };

  

//     syncBodyDarkMode();

//     const appEl = document.querySelector('.app');
//     if (!appEl) return;

//     const obs = new MutationObserver(syncBodyDarkMode);
//     obs.observe(appEl, { attributes: true, attributeFilter: ['class'] });

//     return () => obs.disconnect();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!selectedOption) {
//       setError('Please select a booking option.');
//       return;
//     }



//     try {
//     if (selectedOption === 'flight') {
//   navigate('/flight-results', {
//     state: {
//       flightParams: {
//         departureDate: startDate,
//         returnDate: tripType === 'oneway' ? '' : returnDate,
//         origin: location,
//         destination: location1,
//         people,
//         tripType,
//       },
//     },
//   });
// }

// if (selectedOption === 'hotel') {
//   navigate('/hotel', {
//     state: {
//       checkInDate: startDate,
//       checkOutDate: returnDate,
//       location: location1,
//       people,
//     },
//   });
// }

// if (selectedOption === 'train') {
//   navigate('/train', {
//     state: {
//       departureDate: startDate,
//       returnDate,
//       origin: location,
//       destination: location1,
//       people,
//     },
//   });
// }

//       await axios.post('http://localhost:5001/bookings', {
//         selectedOption,
//         tripType,
//         location,
//         location1,
//         startDate,
//         returnDate,
//         people,
//       });

//       setSuccess('Booking submitted successfully!');
//       setError('');
//     } catch (err) {
//       setError('Error submitting booking.');
//       setSuccess('');
//     }
//   };

//   return (
//     <div ref={bookingWrapperRef} className="booking-wrapper">
//       <div className="button-container">
//         <button
//           className={`option-button ${selectedOption === 'flight' ? 'active' : ''}`}
//           onClick={() => setSelectedOption('flight')}
//           type="button"
//         >
//           <FaPlane /> Flight
//         </button>

//         <button
//           className={`option-button ${selectedOption === 'hotel' ? 'active' : ''}`}
//           onClick={() => setSelectedOption('hotel')}
//           type="button"
//         >
//           <FaHotel /> Hotel
//         </button>

//         <button
//           className={`option-button ${selectedOption === 'train' ? 'active' : ''}`}
//           onClick={() => setSelectedOption('train')}
//           type="button"
//         >
//           <FaTrain /> Train
//         </button>
//       </div>

//       <form className="booking-form" onSubmit={handleSubmit}>
//      <div className="field">
//   <div className={`field-shell ${fromFocused || location ? "is-filled" : ""} ${fromFlash ? "flash" : ""}`}>
    
//     <span className="field-icon" aria-hidden="true">
//       <FaLocationDot />
//     </span>

//     <input
//       ref={fromInputRef}
//       value={location}
//       placeholder=" "
//       onFocus={() => {
//         setFromFocused(true);
//         if (fromSelected) { setLocation(""); setFromSelected(false); }
//         setShowFromSuggestions(true);
//       }}
//       onBlur={() => setFromFocused(false)}
//       onChange={(e) => {
//         setLocation(e.target.value);
//         setShowFromSuggestions(true);
//       }}
//     />

//     <label className="floating-label">From</label>
//   </div>

//   {showFromSuggestions && (
//     <ul ref={fromListRef} className="suggestions-list modern">
//       {filteredFromLocations.map((loc, i) => (
//         <li
//           key={i}
//           onMouseDown={(e) => e.preventDefault()}
//           onClick={() => {
//             setLocation(loc);
//             setShowFromSuggestions(false);
//             setFromSelected(true);

//             setFromFlash(false);
//             requestAnimationFrame(() => setFromFlash(true));
//             setTimeout(() => setFromFlash(false), 450);
//           }}
//         >
//           <span className="suggestion-icon">
//             <FaLocationDot />
//           </span>
//           <span className="suggestion-text">{loc}</span>
//         </li>
//       ))}
//     </ul>
//   )}
// </div>
        

//         <div className="field">
// <div className={`field-shell ${toFocused || location1 ? "is-filled" : ""} ${toFlash ? "flash" : ""}`}>

//     <span className="field-icon" aria-hidden="true">
//         <FaLocationDot />
//     </span>

//     <input
//       ref={toInputRef}
//       value={location1}
//       placeholder=" "
//      onFocus={() => {
//   setToFocused(true);
//   if (toSelected) { setLocation1(''); setToSelected(false); }
//   setShowToSuggestions(true);
// }}
// onBlur={() => {
//   setToFocused(false);
//   setShowToSuggestions(false);
// }}
//     />

//     <label className="floating-label">To</label>
//   </div>

//   {showToSuggestions && (
//     <ul ref={toListRef} className="suggestions-list modern">
//       {filteredToLocations.map((loc, i) => (
//         <li
//           key={i}
//           onMouseDown={(e) => e.preventDefault()}
//           onClick={() => {
//             setLocation1(loc);
//             setShowToSuggestions(false);
//             setToSelected(true);

//             /* Flash animation */
//             setToFlash(false);
//             requestAnimationFrame(() => setToFlash(true));
//             setTimeout(() => setToFlash(false), 450);
//           }}
//         >
//           <span className="suggestion-icon">
//            <FaLocationDot />
//           </span>
//           <span className="suggestion-text">{loc}</span>
//         </li>
//       ))}
//     </ul>
//   )}
// </div>

//        {selectedOption === "flight" && (
//   <div className="field">
//     <div className={`field-shell ${tripType ? "is-filled" : ""}`}>
//       <span className="field-icon" aria-hidden="true">
//         <FaPlane />
//       </span>

//       <select
//         className="field-select"
//         value={tripType}
//         onChange={(e) => setTripType(e.target.value)}
//       >
//         <option value="return">Return</option>
//         <option value="oneway">One Way</option>
//         <option value="multicity">Multi-City</option>
//       </select>

//       <label className="floating-label">Trip Type</label>
//       <span className="field-select-caret" aria-hidden="true">▾</span>
//     </div>
//   </div>
// )}

//        <div className="field">
//   <div className={`field-shell ${startDate ? "is-filled" : ""}`}>
//     <span className="field-icon" aria-hidden="true">📅</span>

//     <Flatpickr
//       value={startDate}
//       options={{
//         minDate: "today",
//         dateFormat: "j F Y",
//         disableMobile: true,
//         clickOpens: true,
//         closeOnSelect: true,
//         appendTo: bookingWrapperRef.current || document.body,
//       }}
//       onChange={(_, dateStr) => {
//         setStartDate(dateStr);
//         if (tripType !== "oneway" && returnDate && dateStr > returnDate) {
//           setReturnDate("");
//         }
//       }}
//       className="field-flatpickr"
//     />

//     <label className="floating-label">From Date</label>
//   </div>
// </div>

//        {((selectedOption === "flight" && tripType !== "oneway") ||
//   selectedOption === "hotel" ||
//   selectedOption === "train") && (
//   <div className="field">
//     <div className={`field-shell ${returnDate ? "is-filled" : ""}`}>
//       <span className="field-icon" aria-hidden="true">📅</span>

//       <Flatpickr
//         value={returnDate}
//         options={{
//           minDate: startDate || "today",
//           dateFormat: "j F Y",
//           disableMobile: true,
//           closeOnSelect: true,
//           appendTo: bookingWrapperRef.current || document.body,
//         }}
//         onChange={(_, dateStr, instance) => {
//           setReturnDate(dateStr);
//           instance.close();
//         }}
//         className="field-flatpickr"
//       />

//       <label className="floating-label">Return Date</label>
//     </div>
//   </div>
// )}

//         <FieldSelect
//   icon="🧑"
//   label="Adults (18+)"
//   value={adults}
//   onChange={(e) => setAdults(Number(e.target.value))}
//   options={makeOptions(1, 9)}
// />

// <FieldSelect
//   icon="🧒"
//   label="Children (3–17)"
//   value={children}
//   onChange={(e) => setChildren(Number(e.target.value))}
//   options={makeOptions(0, 9)}
// />

// <FieldSelect
//   icon="👶"
//   label="Infants (0–2)"
//   value={infants}
//   onChange={(e) => setInfants(Number(e.target.value))}
//   options={makeOptions(0, 9)}
// />

//         <button className="submit-button" type="submit">
//           Submit Booking
//         </button>

//         {error && <div className="error-message"><FaTimesCircle /> {error}</div>}
//         {success && <div className="success-message"><FaCheckCircle /> {success}</div>}
//       </form>
//     </div>
//   );
// }

// export default Booking;
 
// src/components/Booking.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaPlane, FaHotel, FaTrain, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import "./booking.css";
import { FaLocationDot } from "react-icons/fa6";

const locations = [
  "Kabul International Airport (Afghanistan)",
  "Tirana International Airport (Albania)",
  "Houari Boumediene International Airport (Algeria)",
  "Andorra–La Seu dUrgell Airport (Andorra)",
  "Quatro de Fevereiro International Airport (Angola)",
  "V.C. Bird International Airport (Antigua and Barbuda)",
  "Ministro Pistarini International Airport (Argentina)",
  "Zvartnots International Airport (Armenia)",
  "Sydney Kingsford Smith Airport (Australia)",
  "Heydar Aliyev International Airport (Azerbaijan)",
  "Freeport International Airport (Bahamas)",
  "Bahrain International Airport (Bahrain)",
  "Hazrat Shahjalal International Airport (Bangladesh)",
  "Grantley Adams International Airport (Barbados)",
  "Minsk National Airport (Belarus)",
  "Brussels Airport (Belgium)",
  "Philip S.W. Goldson International Airport (Belize)",
  "Benin City Airport (Benin)",
  "El Alto International Airport (Bolivia)",
  "Sarajevo International Airport (Bosnia and Herzegovina)",
  "Sir Seretse Khama International Airport (Botswana)",
  "Brasília International Airport (Brazil)",
  "Brunei International Airport (Brunei)",
  "Sofia Airport (Bulgaria)",
  "Thomas Sankara International Airport (Burkina Faso)",
  "Melchior Ndadaye International Airport (Burundi)",
  "Phnom Penh International Airport (Cambodia)",
  "Douala International Airport (Cameroon)",
  "Toronto Pearson International Airport (Canada)",
  "Owen Roberts International Airport (Cayman Islands)",
  "Bangui-MPoko International Airport (Central African Republic)",
  "NDjamena International Airport (Chad)",
  "Arturo Merino Benitez International Airport (Chile)",
  "Beijing Capital International Airport (China)",
  "El Dorado International Airport (Colombia)",
  "Prince Said Ibrahim International Airport (Comoros)",
  "Juan Santamaría International Airport (Costa Rica)",
  "Franjo Tuđman Airport (Croatia)",
  "José Martí International Airport (Cuba)",
  "Larnaka International Airport (Cyprus)",
  "Václav Havel Airport Prague (Czech Republic)",
  "Copenhagen Airport (Denmark)",
  "Ambouli International Airport (Djibouti)",
  "Douglas-Charles Airport (Dominica)",
  "Las Américas International Airport (Dominican Republic)",
  "Mariscal Sucre International Airport (Ecuador)",
  "Cairo International Airport (Egypt)",
  "Monseñor Óscar Arnulfo Romero International Airport (El Salvador)",
  "Malabo International Airport (Equatorial Guinea)",
  "Asmara International Airport (Eritrea)",
  "Tallinn Airport (Estonia)",
  "King Mswati III International Airport (Eswatini)",
  "Bole International Airport (Ethiopia)",
  "Nadi International Airport (Fiji)",
  "Helsinki-Vantaa Airport (Finland)",
  "Charles de Gaulle Airport (France)",
  "Leon M’ba International Airport (Gabon)",
  "Banjul International Airport (Gambia)",
  "Tbilisi International Airport (Georgia)",
  "Frankfurt Airport (Germany)",
  "Kotoka International Airport (Ghana)",
  "Eleftherios Venizelos Airport (Greece)",
  "Maurice Bishop International Airport (Grenada)",
  "La Aurora International Airport (Guatemala)",
  "Conakry International Airport (Guinea)",
  "Osvaldo Vieira International Airport (Guinea-Bissau)",
  "Cheddi Jagan International Airport (Guyana)",
  "Toussaint Louverture International Airport (Haiti)",
  "Toncontín International Airport (Honduras)",
  "Budapest Liszt Ferenc International Airport (Hungary)",
  "Keflavík International Airport (Iceland)",
  "Indira Gandhi International Airport (India)",
  "Soekarno–Hatta International Airport (Indonesia)",
  "Tehran Imam Khomeini International Airport (Iran)",
  "Baghdad International Airport (Iraq)",
  "Dublin Airport (Ireland)",
  "Ben Gurion Airport (Israel)",
  "Leonardo da Vinci International Airport (Italy)",
  "Norman Manley International Airport (Jamaica)",
  "Haneda International Airport (Japan)",
  "Queen Alia International Airport (Jordan)",
  "Almaty International Airport (Kazakhstan)",
  "Jomo Kenyatta International Airport (Kenya)",
  "Nauru International Airport (Kiribati)",
  "Incheon International Airport (South Korea)",
  "Pristina International Airport (Kosovo)",
  "Kuwait International Airport (Kuwait)",
  "Manas International Airport (Kyrgyzstan)",
  "Wattay International Airport (Laos)",
  "Riga International Airport (Latvia)",
  "Beirut-Rafic Hariri International Airport (Lebanon)",
  "Moshoeshoe I International Airport (Lesotho)",
  "Roberts International Airport (Liberia)",
  "Mitiga International Airport (Libya)",
  "Liechtenstein Airport (Liechtenstein)",
  "Vilnius International Airport (Lithuania)",
  "Luxembourg Findel Airport (Luxembourg)",
  "Ivato International Airport (Madagascar)",
  "Kamuzu International Airport (Malawi)",
  "Kuala Lumpur International Airport (Malaysia)",
  "Malé International Airport (Maldives)",
  "Mexico City International Airport (Mexico)",
  "Dubai International Airport (United Arab Emirates)",
  "Zanzibar International Airport (Tanzania)",
  "Lagos Murtala Muhammed International Airport (Nigeria)",
  "JFK International Airport (USA)",
  "O.R. Tambo International Airport (South Africa)",
  "London Heathrow Airport (United Kingdom)",
  "New Delhi Indira Gandhi International Airport (India)",
  "Hong Kong International Airport (Hong Kong)",
  "Bangkok Suvarnabhumi Airport (Thailand)",
  "Madrid Barajas International Airport (Spain)",
  "Fiumicino International Airport (Italy)",
  "Changi Airport (Singapore)",
  "Berlin Brandenburg Airport (Germany)",
  "Düsseldorf Airport (Germany)",
  "Ninoy Aquino International Airport (Philippines)",
  "Noi Bai International Airport (Vietnam)",
  "London",
  "Malaysia",
  "Petaling jaya",
  "KLIA2",
  "KLIA",
  "Terminal Bersepadu Selatan(TBS)",
];
const FieldNumber = ({ icon, label, value, onChange, min = 0, max = 1000 }) => (
  <div className="field">
    <div className={`field-shell ${String(value) !== "" ? "is-filled" : ""}`}>
      <span className="field-icon" aria-hidden="true">{icon}</span>

      <input
        className="field-number"
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={onChange}
      />

      <label className="floating-label">{label}</label>
    </div>
  </div>
);

// const makeOptions = (min, max) =>
//   Array.from({ length: max - min + 1 }, (_, i) => {
//     const v = min + i;
//     return { value: v, label: String(v) };
//   });

const TripTypeDropdown = ({ value, onChange, icon = <FaPlane /> }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);

  const options = useMemo(
    () => [
      { value: "return", label: "Return" },
      { value: "oneway", label: "One Way" },
      { value: "multicity", label: "Multi-City" },
    ],
    []
  );

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const onDown = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", onDown, true);
    return () => document.removeEventListener("mousedown", onDown, true);
  }, []);

  const pick = (v) => {
    onChange(v);
    setIsOpen(false);
  };

  return (
    <div className="field" ref={wrapRef}>
      <div className={`field-shell ${value ? "is-filled" : ""} ${isOpen ? "is-open" : ""}`}>
        <span className="field-icon" aria-hidden="true">
          {icon}
        </span>

        <button
          type="button"
          className="field-select-btn"
          onClick={() => setIsOpen((s) => !s)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="field-select-value">{selected ? selected.label : "Select trip type"}</span>

          <span className={`field-select-arrow ${isOpen ? "up" : ""}`} aria-hidden="true">
            ▾
          </span>
        </button>

        <label className="floating-label">Trip Type</label>
      </div>

      {isOpen && (
        <ul className="suggestions-list modern triptype" role="listbox">
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={active}
                className={active ? "active" : ""}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(opt.value)}
              >
                <span className="suggestion-icon">✈️</span>
                <span className="suggestion-text">{opt.label}</span>
                {active && <span className="triptype-check">✓</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

function Booking() {
  const navigate = useNavigate();

  const [selectedOption, setSelectedOption] = useState("");
  const [tripType, setTripType] = useState(""); // ✅ start blank (no default Return)

  const [location, setLocation] = useState("");
  const [location1, setLocation1] = useState("");
  const [startDate, setStartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const people = adults + children + infants;

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fromListRef = useRef(null);
  const toListRef = useRef(null);
  const bookingWrapperRef = useRef(null);

  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [filteredFromLocations, setFilteredFromLocations] = useState([]);
  const [filteredToLocations, setFilteredToLocations] = useState([]);
  const [fromSelected, setFromSelected] = useState(false);
  const [toSelected, setToSelected] = useState(false);
  const [fromFocused, setFromFocused] = useState(false);
  const [toFocused, setToFocused] = useState(false);
  const fromInputRef = useRef(null);
  const toInputRef = useRef(null);
  const [fromFlash, setFromFlash] = useState(false);
  const [toFlash, setToFlash] = useState(false);
  
  // infants cannot exceed adults
  useEffect(() => {
    if (infants > adults) setInfants(adults);
  }, [adults, infants]);

  // filter
  useEffect(() => {
    const q = location.trim().toLowerCase();
    if (!q) return setFilteredFromLocations([]);
    setFilteredFromLocations(locations.filter((loc) => loc.toLowerCase().includes(q)).slice(0, 60));
  }, [location]);

  useEffect(() => {
    const q = location1.trim().toLowerCase();
    if (!q) return setFilteredToLocations([]);
    setFilteredToLocations(locations.filter((loc) => loc.toLowerCase().includes(q)).slice(0, 60));
  }, [location1]);

  // click outside close suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      // don't close when clicking calendar popup
      if (e.target.closest(".flatpickr-calendar")) return;

      const fromEl = fromInputRef.current;
      const toEl = toInputRef.current;
      const fromList = fromListRef.current;
      const toList = toListRef.current;

      if (fromEl && fromList && !fromEl.contains(e.target) && !fromList.contains(e.target)) {
        setShowFromSuggestions(false);
      }
      if (toEl && toList && !toEl.contains(e.target) && !toList.contains(e.target)) {
        setShowToSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, []);

  // oneway clears return date
  useEffect(() => {
    if (tripType === "oneway") setReturnDate("");
  }, [tripType]);

  // ✅ if user switches away from flight, clear trip type
  useEffect(() => {
    if (selectedOption !== "flight") setTripType("");
  }, [selectedOption]);

  // dark mode sync to body (flatpickr in body)
  useEffect(() => {
    const syncBodyDarkMode = () => {
      const appEl = document.querySelector(".app");
      const isDark = !!(appEl && appEl.classList.contains("dark-mode"));
      document.body.classList.toggle("dark-mode", isDark);
    };

    syncBodyDarkMode();

    const appEl = document.querySelector(".app");
    if (!appEl) return;

    const obs = new MutationObserver(syncBodyDarkMode);
    obs.observe(appEl, { attributes: true, attributeFilter: ["class"] });

    return () => obs.disconnect();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedOption) {
      setError("Please select a booking option.");
      return;
    }

    if (!location || !location1) {
      setError("Please fill From and To.");
      return;
    }

    if (!startDate) {
      setError("Please select a From Date.");
      return;
    }

    if (adults <= 0) {
  setError("At least 1 adult is required.");
  return;
}
if (infants > adults) {
  setError("Infants cannot exceed adults.");
  return;
}

    // ✅ flight needs trip type chosen
    if (selectedOption === "flight" && !tripType) {
      setError("Please select Trip Type.");
      return;
    }

    // return date validation
    const needsReturn =
      selectedOption === "hotel" ||
      selectedOption === "train" ||
      (selectedOption === "flight" && tripType !== "oneway");

    if (needsReturn && !returnDate) {
      setError("Please select a Return Date.");
      return;
    }

    try {
      if (selectedOption === "flight") {
       navigate("/flight-results", {
  state: {
    flightParams: {
      departureDate: startDate,
      returnDate: tripType === "oneway" ? "" : returnDate,
      origin: location,
      destination: location1,

      adults,
      children,
      infants,

      tripType,
    },
  },
});
      }

      if (selectedOption === "hotel") {
        navigate("/hotel", {
          state: {
            checkInDate: startDate,
            checkOutDate: returnDate,
            location: location1,
            people,
          },
        });
      }

      if (selectedOption === "train") {
        navigate("/train", {
          state: {
            departureDate: startDate,
            returnDate,
            origin: location,
            destination: location1,
            people,
          },
        });
      }

     await axios.post("http://localhost:5001/bookings", {
  selectedOption,
  tripType,
  location,
  location1,
  startDate,
  returnDate,
  people,
  adults,
  children,
  infants,
});

      setSuccess("Booking submitted successfully!");
    } catch (err) {
      setError("Error submitting booking.");
    }
  };

  return (
    <div ref={bookingWrapperRef} className="booking-wrapper">
      <div className="button-container">
        <button
          className={`option-button ${selectedOption === "flight" ? "active" : ""}`}
          onClick={() => setSelectedOption("flight")}
          type="button"
        >
          <FaPlane /> Flight
        </button>

        <button
          className={`option-button ${selectedOption === "hotel" ? "active" : ""}`}
          onClick={() => setSelectedOption("hotel")}
          type="button"
        >
          <FaHotel /> Hotel
        </button>

        <button
          className={`option-button ${selectedOption === "train" ? "active" : ""}`}
          onClick={() => setSelectedOption("train")}
          type="button"
        >
          <FaTrain /> Train
        </button>
      </div>

      <form className="booking-form" onSubmit={handleSubmit}>
        {/* FROM */}
        <div className="field">
          <div
            className={`field-shell ${fromFocused || location ? "is-filled" : ""} ${
              fromFlash ? "flash" : ""
            }`}
          >
            <span className="field-icon" aria-hidden="true">
              <FaLocationDot />
            </span>

            <input
              ref={fromInputRef}
              value={location}
              placeholder=" "
              onFocus={() => {
                setFromFocused(true);
                if (fromSelected) {
                  setLocation("");
                  setFromSelected(false);
                }
                setShowFromSuggestions(true);
              }}
              onBlur={() => setFromFocused(false)}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowFromSuggestions(true);
              }}
            />

            <label className="floating-label">From</label>
          </div>

          {showFromSuggestions && filteredFromLocations.length > 0 && (
            <ul ref={fromListRef} className="suggestions-list modern">
              {filteredFromLocations.map((loc, i) => (
                <li
                  key={i}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setLocation(loc);
                    setShowFromSuggestions(false);
                    setFromSelected(true);

                    setFromFlash(false);
                    requestAnimationFrame(() => setFromFlash(true));
                    setTimeout(() => setFromFlash(false), 450);
                  }}
                >
                  <span className="suggestion-icon">
                    <FaLocationDot />
                  </span>
                  <span className="suggestion-text">{loc}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* TO */}
        <div className="field">
          <div
            className={`field-shell ${toFocused || location1 ? "is-filled" : ""} ${
              toFlash ? "flash" : ""
            }`}
          >
            <span className="field-icon" aria-hidden="true">
              <FaLocationDot />
            </span>

            <input
              ref={toInputRef}
              value={location1}
              placeholder=" "
              onFocus={() => {
                setToFocused(true);
                if (toSelected) {
                  setLocation1("");
                  setToSelected(false);
                }
                setShowToSuggestions(true);
              }}
              onBlur={() => setToFocused(false)}
              onChange={(e) => {
                setLocation1(e.target.value);
                setShowToSuggestions(true);
              }}
            />

            <label className="floating-label">To</label>
          </div>

          {showToSuggestions && filteredToLocations.length > 0 && (
            <ul ref={toListRef} className="suggestions-list modern">
              {filteredToLocations.map((loc, i) => (
                <li
                  key={i}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setLocation1(loc);
                    setShowToSuggestions(false);
                    setToSelected(true);

                    setToFlash(false);
                    requestAnimationFrame(() => setToFlash(true));
                    setTimeout(() => setToFlash(false), 450);
                  }}
                >
                  <span className="suggestion-icon">
                    <FaLocationDot />
                  </span>
                  <span className="suggestion-text">{loc}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* TRIP TYPE (CUSTOM DROPDOWN) */}
        {selectedOption === "flight" && (
          <TripTypeDropdown value={tripType} onChange={setTripType} icon={<FaPlane />} />
        )}

        {/* FROM DATE */}
        <div className="field">
          <div className={`field-shell ${startDate ? "is-filled" : ""}`}>
            <span className="field-icon" aria-hidden="true">
              📅
            </span>

            <Flatpickr
              value={startDate}
              options={{
                minDate: "today",
                dateFormat: "Y-m-d",
                disableMobile: true,
                clickOpens: true,
                closeOnSelect: true,
                appendTo: bookingWrapperRef.current || document.body,
              }}
              onChange={(_, dateStr) => {
                setStartDate(dateStr);
                if (tripType !== "oneway" && returnDate && dateStr > returnDate) {
                  setReturnDate("");
                }
              }}
              className="field-flatpickr"
            />

            <label className="floating-label">From Date</label>
          </div>
        </div>

        {/* RETURN DATE */}
        {((selectedOption === "flight" && tripType && tripType !== "oneway") ||
          selectedOption === "hotel" ||
          selectedOption === "train") && (
          <div className="field">
            <div className={`field-shell ${returnDate ? "is-filled" : ""}`}>
              <span className="field-icon" aria-hidden="true">
                📅
              </span>

              <Flatpickr
                value={returnDate}
                options={{
                  minDate: startDate || "today",
                  dateFormat: "Y-m-d",
                  disableMobile: true,
                  closeOnSelect: true,
                  appendTo: bookingWrapperRef.current || document.body,
                }}
                onChange={(_, dateStr, instance) => {
                  setReturnDate(dateStr);
                  instance.close();
                }}
                className="field-flatpickr"
              />

              <label className="floating-label">Return Date</label>
            </div>
          </div>
        )}

        {/* PEOPLE */}
       {/* PEOPLE (3 in one row) */}
<div className="people-row">
  <FieldNumber
  icon="🧑"
  label="Adults (18+)"
  value={adults}
  onChange={(e) => setAdults(Number(e.target.value) || 1)}
  min={1}
  max={1000}
/>

  <FieldNumber
    icon="🧒"
    label="Children (3–17)"
    value={children}
    onChange={(e) => setChildren(Number(e.target.value))}
    min={0}
    max={1000}
  />

  <FieldNumber
    icon="👶"
    label="Infants (0–2)"
    value={infants}
    onChange={(e) => setInfants(Number(e.target.value))}
    min={0}
    max={1000}
  />
</div>

        <button className="submit-button" type="submit">
          Submit Booking
        </button>

        {error && (
          <div className="error-message">
            <FaTimesCircle /> {error}
          </div>
        )}
        {success && (
          <div className="success-message">
            <FaCheckCircle /> {success}
          </div>
        )}
      </form>
    </div>
  );
}

export default Booking;