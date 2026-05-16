import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import "./tabs.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faXmark,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { AnimatePresence, motion } from "framer-motion";

const springy = { type: "spring", stiffness: 420, damping: 34, mass: 0.8 };

const FAQ = () => {
  const [openId, setOpenId] = useState(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const itemRefs = useRef({});

  const items = useMemo(
    () => [
      { id: 1, question: "How does Booking Flex work?", answer: "We scan airlines & travel providers so you can compare and then book directly with the provider." },
      { id: 2, question: "How can I find the cheapest flight?", answer: "Use filters, flexible dates, and compare providers. Try nearby airports for better deals." },
      { id: 3, question: "Where should I book a flight to right now?", answer: "Explore trending destinations or search by budget—Booking Flex shows options across providers." },
      { id: 4, question: "Does Booking Flex do hotels too?", answer: "Yes—use the same search experience to compare stays and book with the provider." },
      { id: 5, question: "What about car hire?", answer: "We compare car hire providers so you can choose price, coverage, and pickup options easily." },
      { id: 6, question: "Can I book a flexible ticket?", answer: "Yes—look for flexible fare policies and filters that support changes/cancellations." },
      { id: 7, question: "Can I change my booking later?", answer: "Changes depend on the provider’s policy. Booking Flex redirects you to the provider to manage your booking." },
      { id: 8, question: "Do prices change after I search?", answer: "Yes—prices can change quickly due to availability and demand. Refresh to confirm the latest price." },
      { id: 9, question: "Is my payment handled by Booking Flex?", answer: "Usually payment is handled by the provider. You book directly with them after comparing." },
      { id: 10, question: "Can I book for multiple travelers?", answer: "Yes—set your passenger count and we’ll show options that match." },
      { id: 11, question: "How do I find hotels near landmarks?", answer: "Use map view + location filters and sort by distance to landmarks." },
      { id: 12, question: "Can I save favorites?", answer: "You can add items to favorites for quick access later (if your app supports it)." },
    ],
    []
  );

  const visibleItems = items.slice(0, 6);

  const toggle = (id) => {
    setOpenId((cur) => (cur === id ? null : id));
    requestAnimationFrame(() => {
      setTimeout(() => {
        itemRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    });
  };

  const openModalAt = (index) => {
    setModalIndex(index);
    setDirection(1);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const go = useCallback((delta) => {
    const next = modalIndex + delta;
    if (next < 0 || next >= items.length) return;
    setDirection(delta > 0 ? 1 : -1);
    setModalIndex(next);
  }, [items.length, modalIndex]);

  // ✅ Keyboard navigation (ESC / Left / Right)
  useEffect(() => {
    if (!isModalOpen) return;

    const onKey = (e) => {
      if (e.key === "Escape") setIsModalOpen(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, isModalOpen]);

  const modalVariants = {
    enter: (dir) => ({ x: dir > 0 ? 44 : -44, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -44 : 44, opacity: 0 }),
  };

  return (
    <section className="faq-wrap">
      <div className="faq-container premium">
        <div className="faq-top">
          <h1 className="faq-header">Booking Flex FAQ</h1>
          <p className="faq-subtitle">
            Quick answers. Clean experience. Built for speed and confidence.
          </p>
        </div>

        <div className="faq-grid modern">
          {visibleItems.map((item) => {
            const isOpen = openId === item.id;

            return (
              <motion.article
                key={item.id}
                ref={(el) => (itemRefs.current[item.id] = el)}
                layout="position"
               animate={{ scale: isOpen ? 1.01 : 1 }}transition={springy}
                className={`faq-item premium ${isOpen ? "open" : ""}`}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.99 }}
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="faq-question premium"
                  aria-expanded={isOpen}
                >
                  <span className="faq-qtext">{item.question}</span>

                  <motion.span
                    className="faq-icon"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                  >
                    <FontAwesomeIcon icon={faChevronDown} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                    layout="position"
                      className="faq-answer premium"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <motion.p
                        initial={{ y: 8, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 8, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
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

        {/* ✅ Bottom-right button INSIDE container */}
        <div className="faq-bottom">
          <button className="faq-open-modal" onClick={() => openModalAt(0)}>
            All questions
          </button>
        </div>
      </div>

      {/* ✅ Modal Popup */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="faq-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="faq-modal"
          initial={{ y: 24, opacity: 0, scale: 0.96, filter: "blur(6px)" }}
animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
exit={{ y: 18, opacity: 0, scale: 0.96, filter: "blur(6px)" }}
transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="faq-modal-topbar">
                <div className="faq-modal-count">
                  {modalIndex + 1} / {items.length}
                </div>

                <button className="faq-modal-close" onClick={closeModal} aria-label="Close">
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              <div className="faq-modal-body">
                <button className="faq-nav-btn" onClick={() => go(-1)} disabled={modalIndex === 0}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>

                <div className="faq-modal-content">
                  <AnimatePresence custom={direction} mode="wait">
                    <motion.div
                      key={items[modalIndex].id}
                      custom={direction}
                      variants={modalVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                      className="faq-slide"
                    >
                      <h3 className="faq-modal-q">{items[modalIndex].question}</h3>
                      <p className="faq-modal-a">{items[modalIndex].answer}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <button className="faq-nav-btn" onClick={() => go(1)} disabled={modalIndex === items.length - 1}>
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>

              <div className="faq-modal-actions">
                <button className="faq-modal-pill" onClick={() => go(-1)} disabled={modalIndex === 0}>
                  Back
                </button>
                <button className="faq-modal-pill primary" onClick={() => go(1)} disabled={modalIndex === items.length - 1}>
                  Next
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FAQ;
