import React, { useState } from 'react';
import './tabs.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const questionsLeftColumn = [
    {
      id: 1,
      question: 'How does Booking Flex work?',
      answer: "We’re a flight, car hire and hotel search engine. We scan all the top airlines and travel providers across the net, so you can compare flight fares and other travel costs in one place. Once you’ve found the best flight, car hire, or hotel, you book directly with the provider."
    },
    {
      id: 2,
      question: 'How can I find the cheapest flight using Booking Flex?',
      answer: 'You can use our search tool to compare prices across different airlines and travel providers.'
    },
    {
      id: 3,
      question: 'Where should I book a flight to right now?',
      answer: 'You can book your flight to any destination; popular ones include Paris, Tokyo, and New York.'
    },
  ];

  const questionsRightColumn = [
    {
      id: 4,
      question: 'Does Booking Flex do hotels too?',
      answer: 'Yes! You can use the same magic that powers our flight search to find your perfect stay anywhere.'
    },
    {
      id: 5,
      question: 'What about car hire?',
      answer: 'We also provide car hire services from top providers for your convenience.'
    },
    {
      id: 6,
      question: 'Can I book a flexible flight ticket?',
      answer: 'Yes, we offer options for flexible flights based on your preferences.'
    },
  ];

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <h1 className="faq-header">Booking Flights with Booking Flex</h1>
      <div className="faq-grid">
        <div className="faq-column">
          {questionsLeftColumn.map((item) => (
            <div key={item.id} className="faq-item">
              <button
                onClick={() => handleToggle(item.id)}
                className={`faq-question ${openIndex === item.id ? 'active' : ''}`}
              >
                {item.question}
                <FontAwesomeIcon
                  icon={openIndex === item.id ? faChevronUp : faChevronDown}
                  className={`icon ${openIndex === item.id ? 'active' : ''}`}
                />
              </button>
              <div className={`faq-answer ${openIndex === item.id ? 'active' : ''}`}>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="faq-column">
          {questionsRightColumn.map((item) => (
            <div key={item.id} className="faq-item">
              <button
                onClick={() => handleToggle(item.id)}
                className={`faq-question ${openIndex === item.id ? 'active' : ''}`}
              >
                {item.question}
                <FontAwesomeIcon
                  icon={openIndex === item.id ? faChevronUp : faChevronDown}
                  className={`icon ${openIndex === item.id ? 'active' : ''}`}
                />
              </button>
              <div className={`faq-answer ${openIndex === item.id ? 'active' : ''}`}>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
