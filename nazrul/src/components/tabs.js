import React, { useMemo, useState } from "react";
import "./tabs.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { AnimatePresence, motion } from "framer-motion";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const items = useMemo(
    () => [
      {
        id: 1,
        question: "How does Booking Flex work?",
        answer:
          "We’re a flight, car hire and hotel search engine. We scan all the top airlines and travel providers across the net, so you can compare flight fares and other travel costs in one place. Once you’ve found the best flight, car hire, or hotel, you book directly with the provider.",
      },
      {
        id: 2,
        question: "How can I find the cheapest flight using Booking Flex?",
        answer:
          "You can use our search tool to compare prices across different airlines and travel providers.",
      },
      {
        id: 3,
        question: "Where should I book a flight to right now?",
        answer:
          "You can book your flight to any destination; popular ones include Paris, Tokyo, and New York.",
      },
      {
        id: 4,
        question: "Does Booking Flex do hotels too?",
        answer:
          "Yes! You can use the same magic that powers our flight search to find your perfect stay anywhere.",
      },
      {
        id: 5,
        question: "What about car hire?",
        answer:
          "We also provide car hire services from top providers for your convenience.",
      },
      {
        id: 6,
        question: "Can I book a flexible flight ticket?",
        answer:
          "Yes, we offer options for flexible flights based on your preferences.",
      },
    ],
    []
  );

  const toggle = (id) => setOpenIndex((cur) => (cur === id ? null : id));

  return (
    <section className="faq-wrap">
      <div className="faq-container premium">
        <div className="faq-top">
          <p className="faq-kicker">Support</p>
          <h1 className="faq-header">Booking Flex FAQ</h1>
          <p className="faq-subtitle">
            Quick answers. Clean experience. Built for speed and confidence.
          </p>
        </div>

        <div className="faq-grid modern">
          {items.map((item) => {
            const isOpen = openIndex === item.id;

            return (
              <motion.article
                key={item.id}
                className={`faq-item premium ${isOpen ? "open" : ""}`}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="faq-question premium"
                  aria-expanded={isOpen}
                >
                  <span className="faq-qtext">{item.question}</span>

                  <motion.span
                    className="icon premium"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FontAwesomeIcon icon={faChevronDown} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      className="faq-answer premium"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <motion.p
                        initial={{ y: 6, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 6, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                      >
                        {item.answer}
                      </motion.p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;