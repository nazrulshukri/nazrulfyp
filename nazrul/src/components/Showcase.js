import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, ChevronLeft, ChevronRight } from "lucide-react";

const INTERVAL = 5500;

/**
 * Apple-style endless carousel: a large centred card with its neighbours
 * peeking in from both sides, a pill button and caption on the active card,
 * and dots + play/pause underneath. Each slide is
 * { id, title, tag, caption, cta, image, fallback?, video?, onSelect }.
 */
export default function Showcase({ title, slides }) {
  const n = slides.length;
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  // Three copies of the slides let the track loop forever: we always settle
  // back into the middle copy without the visitor seeing a jump.
  const [pos, setPos] = useState(n);
  const [animate, setAnimate] = useState(true);
  const [playing, setPlaying] = useState(!reduceMotion);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);
  const touch = useRef(null);
  const active = ((pos % n) + n) % n;

  const go = useCallback((delta) => {
    setAnimate(true);
    // Rapid clicks could outrun the reset; stay inside the three copies.
    setPos((p) => Math.min(3 * n - 1, Math.max(0, p + delta)));
  }, [n]);

  // Only advance while the carousel is on screen and the tab is visible.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !("IntersectionObserver" in window)) return setVisible(true);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !visible) return undefined;
    const id = setInterval(() => {
      if (!document.hidden) go(1);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [playing, visible, go, pos]);

  function settle() {
    if (pos >= 2 * n || pos < n) {
      setAnimate(false);
      setPos(((pos % n) + n) % n + n);
    }
  }

  // Turn the slide animation back on one frame after an invisible jump.
  useEffect(() => {
    if (animate) return undefined;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  function onKeyDown(e) {
    if (e.key === "ArrowRight") go(1);
    else if (e.key === "ArrowLeft") go(-1);
    else return;
    e.preventDefault();
    setPlaying(false);
  }

  const track = [...slides, ...slides, ...slides];

  return (
    <section
      ref={sectionRef}
      className="bf26-show"
      aria-roledescription="carousel"
      aria-label={title}
      onKeyDown={onKeyDown}
    >
      <h2 className="bf26-show-title">{title}</h2>

      <div
        className="bf26-show-viewport"
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current == null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          touch.current = null;
          if (Math.abs(dx) > 40) {
            setPlaying(false);
            go(dx < 0 ? 1 : -1);
          }
        }}
      >
        <div
          className={`bf26-show-track${animate ? "" : " is-jumping"}`}
          style={{ "--i": pos }}
          onTransitionEnd={(e) => e.target === e.currentTarget && settle()}
        >
          {track.map((s, i) => {
            const isActive = i === pos;
            return (
              <article
                key={`${s.id}-${i}`}
                className={`bf26-show-card${isActive ? " is-active" : ""}`}
                aria-hidden={!isActive}
                aria-roledescription="slide"
                aria-label={`${(i % n) + 1} of ${n}: ${s.title}`}
              >
                <img
                  src={s.image}
                  alt=""
                  loading={Math.abs(i - pos) <= 1 ? "eager" : "lazy"}
                  onError={(e) => {
                    if (s.fallback && e.currentTarget.src !== s.fallback) e.currentTarget.src = s.fallback;
                  }}
                />
                {s.video && isActive && !reduceMotion && (
                  <video
                    src={s.video}
                    muted
                    loop
                    autoPlay
                    playsInline
                    preload="none"
                    onCanPlay={(e) => e.currentTarget.classList.add("is-ready")}
                  />
                )}
                <span className="bf26-show-tag">{s.tag}</span>
                <div className="bf26-show-copy">
                  <button
                    type="button"
                    className="bf26-show-pill"
                    tabIndex={isActive ? 0 : -1}
                    onClick={s.onSelect}
                  >
                    {s.cta}
                  </button>
                  <p>
                    <strong>{s.title}.</strong> {s.caption}
                  </p>
                </div>
                {!isActive && (
                  <button
                    type="button"
                    className="bf26-show-peek"
                    tabIndex={-1}
                    aria-label={`Show ${s.title}`}
                    onClick={() => {
                      setPlaying(false);
                      go(i - pos);
                    }}
                  />
                )}
              </article>
            );
          })}
        </div>

        <button type="button" className="bf26-show-arrow is-prev" aria-label="Previous" onClick={() => { setPlaying(false); go(-1); }}>
          <ChevronLeft size={22} />
        </button>
        <button type="button" className="bf26-show-arrow is-next" aria-label="Next" onClick={() => { setPlaying(false); go(1); }}>
          <ChevronRight size={22} />
        </button>
      </div>

      <div className="bf26-show-controls">
        <div className="bf26-show-dots" role="group" aria-label="Choose a slide">
          {slides.map((s, k) => (
            <button
              key={s.id}
              type="button"
              className={k === active ? "is-active" : ""}
              aria-label={`Show ${s.title}`}
              aria-current={k === active}
              onClick={() => {
                setAnimate(true);
                setPos(n + k + (pos - n - active));
              }}
            >
              {k === active && playing && visible && (
                <i key={pos} style={{ animationDuration: `${INTERVAL}ms` }} />
              )}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="bf26-show-play"
          aria-label={playing ? "Pause" : "Play"}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>
      </div>
    </section>
  );
}
