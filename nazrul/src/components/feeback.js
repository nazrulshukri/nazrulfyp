import React from 'react';
import './feedback.css'; // Import your CSS fil
import nazrul from '../img/assets/feedbac/1665246418994.jpg'


const ImageGrid = () => {
  const feedbacks = [
    {
      text: "Booking Flex is made I easier to book within traveler really recommend!!",
      author: "Muhammad Nazrul Bin ahmad shukri",
      title: "A Dream Within a Dream",
      image: nazrul
    },
    {
      text: "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
      author: "Jane Austen",
      title: "Pride and Prejudice"
    },
    {
      text: "To be, or not to be, that is the question...",
      author: "William Shakespeare",
      title: "Hamlet"
    },
    {
      text: "Life is what happens when you're busy making other plans.",
      author: "John Lennon",
      title: "Life Is What Happens"
    },
    {
      text: "The purpose of our lives is to be happy.",
      author: "Dalai Lama",
      title: "Purpose of Life"
    },
    {
      text: "The purpose of our lives is to be happy.",
      author: "Dalai Lama",
      title: "Purpose of Life"
    },
    {
      text: "The purpose of our lives is to be happy.",
      author: "Dalai Lama",
      title: "Purpose of Life"
    },
    {
      text: "The purpose of our lives is to be happy.",
      author: "Dalai Lama",
      title: "Purpose of Life"
    },
    {
      text: "The purpose of our lives is to be happy.",
      author: "Dalai Lama",
      title: "Purpose of Life"
    },
    {
      text: "The purpose of our lives is to be happy.",
      author: "Dalai Lama",
      title: "Purpose of Life"
    },
    {
      text: "The purpose of our lives is to be happy.",
      author: "Dalai Lama",
      title: "Purpose of Life"
    },
    {
      text: "The purpose of our lives is to be happy.",
      author: "Dalai Lama",
      title: "Purpose of Life"
    },
    {
      text: "The purpose of our lives is to be happy.",
      author: "Dalai Lama",
      title: "Purpose of Life"
    },
    {
      text: "The purpose of our lives is to be happy.",
      author: "Dalai Lama",
      title: "Purpose of Life"
    },
    {
      text: "The purpose of our lives is to be happy.",
      author: "Dalai Lama",
      title: "Purpose of Life"
    },
    {
      text: "The purpose of our lives is to be happy.",
      author: "Dalai Lama",
      title: "Purpose of Life"
    },
    {
      text: "The purpose of our lives is to be happy.",
      author: "Dalai Lama",
      title: "Purpose of Life"
    },
    {
      text: "The purpose of our lives is to be happy.",
      author: "Dalai Lama",
      title: "Purpose of Life"
    },
    {
      text: "The purpose of our lives is to be happy.",
      author: "Dalai Lama",
      title: "Purpose of Life"
    },
    {
      text: "The purpose of our lives is to be happy.",
      author: "Dalai Lama",
      title: "Purpose of Life"
    },
    
    // Add more feedback objects as needed
  ];
  

  return (
    <div className="image-grid">
       <h1>Feedback</h1>
    {feedbacks.map((feedback, index) => (

      <div className="card2" key={index}>
        <div className="image-container">
          <img
            src={feedback.image}
            alt={`${feedback.author}'s avatar`}
            className="circle-image"
          />
        </div>
        <h3>{feedback.title}</h3>
        <p>{feedback.text}</p>
        <p><strong>- {feedback.author}</strong></p>
      </div>
    ))}
  </div>
  );
};

export default ImageGrid;
