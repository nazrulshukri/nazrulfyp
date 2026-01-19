import React, { useMemo, useState } from "react";
import "animate.css";
import axios from "axios";
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
} from "mdb-react-ui-kit";
import { useNavigate, Link } from "react-router-dom";

import bookingImage from "../img/assets/logo .png";
import logoImage from "../img/assets/BOOKING (4).png";
import "./signin.css";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const baseURL = useMemo(
    () => process.env.REACT_APP_API_URL || "http://localhost:5001",
    []
  );

  const canLogin = email.trim() && password.trim() && !loading;

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${baseURL}/signin`, {
        email: email.trim(),
        password,
      });

      setShowModal(true);

      setTimeout(() => {
        navigate("/", { state: { email: email.trim(), userData: response.data } });
      }, 900);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Error signing in. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="si-page">
      <MDBContainer className="si-container">
        <MDBCard className="si-card animate__animated animate__fadeIn">
          <MDBRow className="g-0 si-row">
            {/* LEFT PANEL */}
            <MDBCol md="6" className="si-left">
              <div className="si-leftInner">
                <MDBCardImage src={bookingImage} alt="Booking" className="si-image" />
                <div className="si-leftOverlay">
                  <p className="si-leftBadge">
                    <MDBIcon fas icon="shield-alt" /> Secure Login
                  </p>
                  <h2 className="si-leftTitle">Welcome back</h2>
                  <p className="si-leftText">
                    Sign in to manage flights, bookings, and offers with Booking Flex.
                  </p>
                </div>
              </div>
            </MDBCol>

            {/* RIGHT PANEL */}
            <MDBCol md="6" className="si-right">
              <MDBCardBody className="si-body">
                <div className="si-top">
                  <img className="si-logo" src={logoImage} alt="Logo" />
                  <div>
                    <h1 className="si-title">Sign in</h1>
                    <p className="si-subtitle">Access your Booking Flex account</p>
                  </div>
                </div>

                <div className="si-form">
                  <MDBInput
                    wrapperClass="mb-3"
                    label="Email address"
                    type="email"
                    size="lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <MDBInput
                    wrapperClass="mb-3"
                    label="Password"
                    type="password"
                    size="lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && canLogin && handleLogin()}
                  />

                  {error && <div className="si-alert">{error}</div>}

                  <MDBBtn
                    className="si-btn"
                    color="dark"
                    size="lg"
                    onClick={handleLogin}
                    disabled={!canLogin}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </MDBBtn>

                  <div className="si-links">
                    <Link className="si-link" to="/forgotpassword">
                      Forgot password?
                    </Link>
                    <span className="si-dot">•</span>
                    <Link className="si-link" to="/signup">
                      Create an account
                    </Link>
                  </div>

                  <div className="si-divider">
                    <span>Or continue with</span>
                  </div>

                  <div className="si-social">
                    <MDBBtn tag="a" color="none" className="si-socialBtn">
                      <MDBIcon fab icon="facebook-f" />
                    </MDBBtn>
                    <MDBBtn tag="a" color="none" className="si-socialBtn">
                      <MDBIcon fab icon="twitter" />
                    </MDBBtn>
                    <MDBBtn tag="a" color="none" className="si-socialBtn">
                      <MDBIcon fab icon="google" />
                    </MDBBtn>
                    <MDBBtn tag="a" color="none" className="si-socialBtn">
                      <MDBIcon fab icon="github" />
                    </MDBBtn>
                  </div>
                </div>
              </MDBCardBody>
            </MDBCol>
          </MDBRow>
        </MDBCard>

        {/* SUCCESS MODAL */}
        <MDBModal show={showModal} setShow={setShowModal} tabIndex="-1">
          <MDBModalDialog centered>
            <MDBModalContent className="si-modal">
              <MDBModalHeader className="si-modalHeader">
                <h5 className="modal-title">✅ Login successful</h5>
                <MDBBtn className="btn-close" onClick={() => setShowModal(false)} />
              </MDBModalHeader>
              <MDBModalBody className="si-modalBody">
                Welcome to Booking Flex. Redirecting…
              </MDBModalBody>
            </MDBModalContent>
          </MDBModalDialog>
        </MDBModal>
      </MDBContainer>
    </div>
  );
};

export default SignIn;