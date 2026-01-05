// src/components/InquiryForm.js
import React, { useState } from 'react';
import './inquriy.css'; // Updated styles
import logo from '../img/assets/logo .png'; // Image

const InquiryForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5001/inquiries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to submit inquiry');
            }

            const result = await response.json();
            console.log(result);
            alert('Inquiry submitted successfully!');
            setFormData({ name: '', email: '', phone: '', message: '' }); // Reset form
        } catch (error) {
            console.error('Error:', error);
            alert('There was an error submitting your inquiry. Please try again.');
        }
    };

    return (
        <div className="inquiry-container">
            <div className="inquiry-form-wrapper">
                <div className="inquiry-form-image">
                    <img src={logo} alt="Inquiry" />
                </div>
                <div className="inquiry-form-container">
                    <h2>Contact Us</h2>
                    <p className="subheading">We'd love to hear from you! Please fill out the form below.</p>
                    <form onSubmit={handleSubmit} className="inquiry-form">
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="john.doe@example.com" required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="(123) 456-7890" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="message">Your Message</label>
                            <textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder="Type your message here..." required />
                        </div>
                        <button type="submit">Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InquiryForm;
