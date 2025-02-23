import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/header';
import MainContent from './components/body';
import Footer from './components/footer';
import About from './components/about';
import Services from './components/services';
import ReturnFlights from './components/return'; // Ensure the correct import path
import Payment from './components/payment'; // Ensure the correct import path
import PaymentMethodPage from './components/paymentmethod'; // Ensure correct import path
import TicketPage from './components/ticketpage'; // Import TicketPage
import Hotel from './components/Hotel';
import Hotelselected from './components/Hotelselected';
import HotelForm from './components/hotelform';
import HotelPaymentMethod from './components/hotelpaymentmethod';
import HotelPaymentDone from './components/Hotelpaymentdone';
import Maps from './components/map';
import Contact from './components/contact';
import Signin from './components/signin'; // Use the correct casing
import Signup from './components/signup'; // Ensure correct import path
import { ThemeProvider, useTheme } from './components/themeprovider';
import FlightResults from './components/flightresults'; // Create this component for results
import FormPage from './components/fillform'
import TrainPaymentMethod from './components/trainpayment'
import TrainConfirmation from './components/trainconfirmation';
import ForgotPassword from './components/forgotpassword'; // Correct this line if the file is in the components folder
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import TrainPage from './components/train';


function AppContent() {
  const { isDarkMode } = useTheme(); // Access theme context here

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/flight-results" element={<FlightResults />} />
          <Route path="/return" element={<ReturnFlights />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/paymentmethod" element={<PaymentMethodPage />} />
          <Route path="/ticketpage" element={<TicketPage />} /> {/* Add TicketPage route */}
          <Route path="/Hotel" element={<Hotel />} /> {/* Add TicketPage route */}
          <Route path="/Hotelselected" element={<Hotelselected />} /> {/* Add TicketPage route */}
          <Route path="/Hotelform" element={<HotelForm />} /> {/* Add TicketPage route */}
          <Route path="/Hotelpaymentmethod" element={<HotelPaymentMethod />} /> {/* Add TicketPage route */}
          <Route path="/Hotelpaymentdone" element={<HotelPaymentDone />} /> {/* Add TicketPage route */}
          <Route path="/Maps" element={<Maps/>} /> {/* Add TicketPage route */}
          <Route path="/train" element={<TrainPage />} /> 
          <Route path="/fillform" element={<FormPage />} /> 
          <Route path="/trainpayment" element={<TrainPaymentMethod />} />
          <Route path="/trainconfirmation" element={<TrainConfirmation />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;
