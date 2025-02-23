import React, { useState } from 'react';
import 'animate.css'; // Import Animate.css
import axios from 'axios'; // Import Axios
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBRow,
  MDBCol,
  MDBIcon,
  MDBInput,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalBody,
  MDBModalFooter
} from 'mdb-react-ui-kit';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import bookingImage from '../img/assets/logo .png'; // Adjust path as necessary
import logoImage from '../img/assets/BOOKING (4).png'; // Adjust path as necessary
import './signin.css'; // Import custom styles

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false); // State to manage modal visibility
  const [loading, setLoading] = useState(false); // State to manage loading status
  const [error, setError] = useState(''); // State to manage error messages
  const navigate = useNavigate(); // Initialize navigate

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError(''); // Clear previous errors
    setLoading(true); // Set loading to true
    try {
      const response = await axios.post('http://localhost:5000/signin', {
        email,
        password,
      });
      alert(response.data.message); // Display success message
      setShowModal(true); // Show the modal on successful login

      // Navigate after showing the modal
      setTimeout(() => {
        // navigate('/'); // Redirect to the home page (or any other path)

        navigate('/', { state: { email: email, userData: response.data } });
        console.log('email',email);
        console.log('userdata',response.data);
      }, 2000); // Adjust the timeout duration as needed
    } catch (error) {
      setError(error.response?.data?.message || 'Error signing in'); // Display error message
    } finally {
      setLoading(false); // Set loading to false regardless of the outcome
    }
  };

  return (
    <MDBContainer className="my-5" style={{ maxWidth: '2000px', paddingTop: '80px' }}>
  <MDBCard className="no-hover-container" style={{ width: '100%', maxWidth: '1000px', margin: 'auto', paddingTop: '40px' }}> 
    {/* Adjust width and margin */}
    <MDBRow className='g-0'>
      <MDBCol md='6'>
        <MDBCardImage 
          src={bookingImage} 
          alt="Booking Image" 
          className='rounded-start w-100 animate__animated animate__fadeIn' 
        />
      </MDBCol>
      <MDBCol md='6'>
        <MDBCardBody className='d-flex flex-column animate__animated animate__fadeIn'>
          <div className='d-flex flex-row mt-2 align-items-center'>
            <img src={logoImage} alt="Logo" style={{ width: '100px', height: '100px', marginRight: '70px' }} />
            <span className="h1 fw-bold mb-0">Welcome Back </span>
          </div>
          <h5 className="fw-normal my-4 pb-3" style={{ letterSpacing: '1px' }}>Sign into your account</h5>
          <MDBInput 
            wrapperClass='mb-4' 
            label='Email address' 
            id='formControlLg' 
            type='email' 
            size="lg" 
            onChange={(e) => setEmail(e.target.value)} // Update email state
          />
          <MDBInput 
            wrapperClass='mb-4' 
            label='Password' 
            id='formControlLg' 
            type='password' 
            size="lg" 
            onChange={(e) => setPassword(e.target.value)} // Update password state
          />
          <MDBBtn className="mb-4 px-5 no-hover" color='dark' size='lg' onClick={handleLogin} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </MDBBtn>
          {error && <p className="text-danger">{error}</p>} {/* Display error message */}
          <a className="small text-muted" href="/forgotpassword">Forgot password?</a>
          <p className="mb-5 pb-lg-2" style={{ color: '#393f81' }}>
            Don't have an account? <a href="/signup" style={{ color: '#393f81' }}>Register here</a>
          </p>
          <div className='d-flex justify-content-center'>
            <MDBBtn tag='a' color='none' className='mx-3 no-hover' style={{ color: '#1266f1' }}>
              <MDBIcon fab icon='facebook-f' size="sm"/>
            </MDBBtn>
            <MDBBtn tag='a' color='none' className='mx-3 no-hover' style={{ color: '#1266f1' }}>
              <MDBIcon fab icon='twitter' size="sm"/>
            </MDBBtn>
            <MDBBtn tag='a' color='none' className='mx-3 no-hover' style={{ color: '#1266f1' }}>
              <MDBIcon fab icon='google' size="sm"/>
            </MDBBtn>
            <MDBBtn tag='a' color='none' className='mx-3 no-hover' style={{ color: '#1266f1' }}>
              <MDBIcon fab icon='github' size="sm"/>
            </MDBBtn>
          </div>
        </MDBCardBody>
      </MDBCol>
    </MDBRow>
  </MDBCard>

  {/* Modal for Success Message */}
  <MDBModal show={showModal} setShow={setShowModal} tabIndex='-1'>
    <MDBModalDialog>
      <MDBModalContent>
        <MDBModalHeader>
          <h5 className='modal-title'>Congratulations!</h5>
          <MDBBtn className='btn-close' onClick={() => setShowModal(false)}></MDBBtn>
        </MDBModalHeader>
        <MDBModalBody>
          Welcome to Member Booking Flex!
        </MDBModalBody>
        <MDBModalFooter>
          <MDBBtn color='secondary' onClick={() => setShowModal(false)}>Close</MDBBtn>
        </MDBModalFooter>
      </MDBModalContent>
    </MDBModalDialog>
  </MDBModal>
</MDBContainer>

  );
}

export default SignIn;
