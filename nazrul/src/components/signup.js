import React, { useState } from 'react';
import './signup.css';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/signup', {
        email,
        password,
      });

      setSuccess(response.data.message);
      setError('');
      navigate('/signin'); // Redirect to signin page after signup
    } catch (error) {
      setError('Error signing up.');
      setSuccess('');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form card">
        <div className="card-body">
          <h3 className="text-center mb-4">Sign up</h3>
          <button className="btn btn-primary btn-block mb-2">
            <i className="fab fa-facebook-f"></i> Sign up with Facebook
          </button>
          <button className="btn btn-danger btn-block mb-4">
            <i className="fab fa-google"></i> Sign up with Google
          </button>
          <div className="text-center mb-3">OR</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="email"
                className="form-control"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                className="form-control"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-success btn-block">
              <i className="fas fa-sign-in-alt"></i> Sign up
            </button>
          </form>

          {error && <p className="text-danger mt-3">{error}</p>}
          {success && <p className="text-success mt-3">{success}</p>}
          <p className="mt-4 text-center">
            Already have an account? <Link to="/signin">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
