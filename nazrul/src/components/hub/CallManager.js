import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import Avatar from "./Avatar";
import { ICE_SERVERS, mapi, waitForIce } from "../../lib/messaging";

const CallContext = createContext({ startCall: () => {}, inCall: false });
export const useCalls = () => useContext(CallContext);

// A soft two-tone ring made with the Web Audio API (no sound files needed).
function useRingtone(on) {
  useEffect(() => {
    if (!on) return undefined;
    let ctx;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      return undefined;
    }
    const beep = () => {
      [0, 0.25].forEach((offset, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = i ? 660 : 880;
        g.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
        g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + offset + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.22);
        o.connect(g).connect(ctx.destination);
        o.start(ctx.currentTime + offset);
        o.stop(ctx.currentTime + offset + 0.24);
      });
    };
    beep();
    const id = setInterval(beep, 2000);
    return () => {
      clearInterval(id);
      ctx.close();
    };
  }, [on]);
}

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/**
 * Voice and video calls between friends. Wrap the dashboard in this; any
 * child can call useCalls().startCall(friend, "audio" | "video").
 */
export function CallProvider({ children, enabled = true }) {
  const [incoming, setIncoming] = useState(null);
  const [call, setCall] = useState(null); // { id, kind, friend, phase, outgoing, note }
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const pc = useRef(null);
  const local = useRef(null);
  const remote = useRef(new MediaStream());
  const poll = useRef(null);
  const callRef = useRef(null);
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const remoteAudio = useRef(null);
  callRef.current = call;

  useRingtone(Boolean(incoming) && !call);

  const cleanup = useCallback((note) => {
    clearInterval(poll.current);
    poll.current = null;
    if (pc.current) {
      pc.current.ontrack = null;
      pc.current.onconnectionstatechange = null;
      pc.current.close();
      pc.current = null;
    }
    if (local.current) local.current.getTracks().forEach((t) => t.stop());
    local.current = null;
    remote.current = new MediaStream();
    setMuted(false);
    setCameraOff(false);
    setSeconds(0);
    if (note) {
      setCall((c) => (c ? { ...c, phase: "over", note } : null));
      setTimeout(() => setCall((c) => (c && c.phase === "over" ? null : c)), 2600);
    } else {
      setCall(null);
    }
  }, []);

  const hangUp = useCallback(
    async (status = "ended") => {
      const c = callRef.current;
      if (c && c.id) mapi(`/calls/${c.id}/end`, { method: "POST", body: { status } }).catch(() => {});
      cleanup(status === "declined" ? null : "Call ended");
    },
    [cleanup],
  );

  // Attach streams to the video/audio elements whenever they render.
  useEffect(() => {
    if (localVideo.current && local.current) localVideo.current.srcObject = local.current;
    if (remoteVideo.current) remoteVideo.current.srcObject = remote.current;
    if (remoteAudio.current) remoteAudio.current.srcObject = remote.current;
  });

  // Timer while connected.
  useEffect(() => {
    if (!call || call.phase !== "connected") return undefined;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [call]);

  // Look for incoming calls every few seconds (only when not already on a call).
  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    const check = async () => {
      if (callRef.current || document.hidden) return;
      try {
        const { calls } = await mapi("/calls/incoming");
        if (alive) setIncoming(calls[0] || null);
      } catch {
        /* signed out or offline: try again later */
      }
    };
    check();
    const id = setInterval(check, 3000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [enabled]);

  function newPeer() {
    const p = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    p.ontrack = (e) => {
      e.streams[0].getTracks().forEach((t) => remote.current.addTrack(t));
      if (remoteVideo.current) remoteVideo.current.srcObject = remote.current;
      if (remoteAudio.current) remoteAudio.current.srcObject = remote.current;
    };
    p.onconnectionstatechange = () => {
      if (p.connectionState === "connected") setCall((c) => (c ? { ...c, phase: "connected" } : c));
      if (p.connectionState === "failed") {
        hangUp("ended");
        setTimeout(
          () => setCall({ ...(callRef.current || {}), phase: "over", note: "Couldn't connect. This network may block direct calls." }),
          50,
        );
      }
    };
    pc.current = p;
    return p;
  }

  async function getMedia(kind) {
    try {
      return await navigator.mediaDevices.getUserMedia({ audio: true, video: kind === "video" ? { width: 1280, height: 720 } : false });
    } catch (e) {
      throw new Error(
        e && e.name === "NotAllowedError"
          ? `Allow ${kind === "video" ? "camera and microphone" : "microphone"} access in your browser to call.`
          : "No microphone or camera was found.",
      );
    }
  }

  // Watch our call's status on the server (answered, declined, hung up).
  function watch(id, onAnswer) {
    clearInterval(poll.current);
    poll.current = setInterval(async () => {
      try {
        const { call: c } = await mapi(`/calls/${id}`);
        if (c.status === "accepted" && c.answer && onAnswer) {
          const fn = onAnswer;
          onAnswer = null;
          await fn(c.answer);
        }
        if (["declined", "ended", "missed"].includes(c.status)) {
          cleanup(c.status === "declined" ? "Call declined" : c.status === "missed" ? "No answer" : "Call ended");
        }
      } catch {
        /* keep trying */
      }
    }, 1200);
  }

  const startCall = useCallback(
    async (friend, kind = "video") => {
      if (callRef.current) return;
      setIncoming(null);
      setCall({ friend, kind, phase: "calling", outgoing: true });
      try {
        const stream = await getMedia(kind);
        local.current = stream;
        const p = newPeer();
        stream.getTracks().forEach((t) => p.addTrack(t, stream));
        await p.setLocalDescription(await p.createOffer());
        await waitForIce(p);
        const { call: c } = await mapi("/calls", { method: "POST", body: { to: friend.email, kind, offer: p.localDescription } });
        setCall((x) => (x ? { ...x, id: c.id, phase: "ringing" } : x));
        watch(c.id, async (answer) => {
          if (pc.current) await pc.current.setRemoteDescription(answer);
          setCall((x) => (x ? { ...x, phase: "connecting" } : x));
        });
        // Give up after 45 seconds without an answer.
        setTimeout(() => {
          const x = callRef.current;
          if (x && x.id === c.id && (x.phase === "ringing" || x.phase === "calling")) hangUp("ended");
        }, 46000);
      } catch (e) {
        cleanup(e.message);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cleanup, hangUp],
  );

  async function accept() {
    const inc = incoming;
    if (!inc) return;
    setIncoming(null);
    setCall({ id: inc.id, friend: inc.caller, kind: inc.kind, phase: "connecting", outgoing: false });
    try {
      const stream = await getMedia(inc.kind);
      local.current = stream;
      const p = newPeer();
      await p.setRemoteDescription(inc.offer);
      stream.getTracks().forEach((t) => p.addTrack(t, stream));
      await p.setLocalDescription(await p.createAnswer());
      await waitForIce(p);
      await mapi(`/calls/${inc.id}/answer`, { method: "POST", body: { answer: p.localDescription } });
      watch(inc.id, null);
    } catch (e) {
      mapi(`/calls/${inc.id}/end`, { method: "POST", body: {} }).catch(() => {});
      cleanup(e.message);
    }
  }

  function decline() {
    const inc = incoming;
    setIncoming(null);
    if (inc) mapi(`/calls/${inc.id}/end`, { method: "POST", body: { status: "declined" } }).catch(() => {});
  }

  function toggleMute() {
    if (!local.current) return;
    const next = !muted;
    local.current.getAudioTracks().forEach((t) => (t.enabled = !next));
    setMuted(next);
  }
  function toggleCamera() {
    if (!local.current) return;
    const next = !cameraOff;
    local.current.getVideoTracks().forEach((t) => (t.enabled = !next));
    setCameraOff(next);
  }

  const host = typeof document !== "undefined" ? document.querySelector(".app") || document.body : null;
  const statusText = !call
    ? ""
    : call.phase === "calling"
      ? "Starting call…"
      : call.phase === "ringing"
        ? "Ringing…"
        : call.phase === "connecting"
          ? "Connecting…"
          : call.phase === "connected"
            ? mmss(seconds)
            : call.note || "";

  return (
    <CallContext.Provider value={{ startCall, inCall: Boolean(call) }}>
      {children}

      {host &&
        incoming &&
        !call &&
        createPortal(
          <div className="hub-call-toast" role="alertdialog" aria-label={`Incoming call from ${incoming.caller.name}`}>
            <Avatar avatar={incoming.caller.avatar} name={incoming.caller.name} size={52} />
            <div>
              <strong>{incoming.caller.name}</strong>
              <small>Incoming {incoming.kind === "video" ? "video" : "voice"} call…</small>
            </div>
            <button type="button" className="hub-call-btn is-decline" aria-label="Decline" onClick={decline}>
              <PhoneOff size={20} />
            </button>
            <button type="button" className="hub-call-btn is-accept" aria-label="Accept" onClick={accept}>
              {incoming.kind === "video" ? <Video size={20} /> : <Phone size={20} />}
            </button>
          </div>,
          host,
        )}

      {host &&
        call &&
        createPortal(
          <div className={`hub-call ${call.kind === "video" ? "is-video" : "is-audio"}`} role="dialog" aria-label={`Call with ${call.friend.name}`}>
            <audio ref={remoteAudio} autoPlay />
            {call.kind === "video" && <video ref={remoteVideo} className="hub-call-remote" autoPlay playsInline />}
            {(call.kind === "audio" || call.phase !== "connected") && (
              <div className="hub-call-who">
                <Avatar avatar={call.friend.avatar} name={call.friend.name} size={120} ring />
                <h2>{call.friend.name}</h2>
                <p>{statusText}</p>
              </div>
            )}
            {call.kind === "video" && call.phase === "connected" && <span className="hub-call-timer">{statusText}</span>}
            {call.kind === "video" && <video ref={localVideo} className={`hub-call-local ${cameraOff ? "is-off" : ""}`} autoPlay playsInline muted />}
            {call.phase !== "over" && (
              <div className="hub-call-controls">
                <button type="button" className={`hub-call-btn ${muted ? "is-on" : ""}`} aria-pressed={muted} aria-label={muted ? "Unmute" : "Mute"} onClick={toggleMute}>
                  {muted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>
                {call.kind === "video" && (
                  <button type="button" className={`hub-call-btn ${cameraOff ? "is-on" : ""}`} aria-pressed={cameraOff} aria-label={cameraOff ? "Turn camera on" : "Turn camera off"} onClick={toggleCamera}>
                    {cameraOff ? <VideoOff size={22} /> : <Video size={22} />}
                  </button>
                )}
                <button type="button" className="hub-call-btn is-decline" aria-label="Hang up" onClick={() => hangUp("ended")}>
                  <PhoneOff size={22} />
                </button>
              </div>
            )}
          </div>,
          host,
        )}
    </CallContext.Provider>
  );
}
