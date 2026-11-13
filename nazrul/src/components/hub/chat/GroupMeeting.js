import React, { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Mic, MicOff, MonitorUp, PhoneOff, Users, Video, VideoOff } from "lucide-react";
import { Room, RoomEvent, Track } from "livekit-client";
import Avatar from "../Avatar";
import { mapi } from "../../../lib/messaging";

const metaOf = (p) => {
  try {
    return JSON.parse(p.metadata || "{}");
  } catch {
    return {};
  }
};

/** One person's video (or their avatar when the camera is off). */
function Tile({ participant, source = Track.Source.Camera, speaking }) {
  const ref = useRef(null);
  const pub = participant.getTrackPublication(source);
  const track = pub && !pub.isMuted ? pub.track : null;
  useEffect(() => {
    const el = ref.current;
    if (!track || !el) return undefined;
    track.attach(el);
    return () => {
      track.detach(el);
    };
  }, [track]);
  const name = participant.name || participant.identity;
  const micOff = !participant.isMicrophoneEnabled;
  const screen = source === Track.Source.ScreenShare;
  return (
    <div className={`hm-tile ${speaking ? "is-speaking" : ""} ${screen ? "is-screen" : ""}`}>
      {track ? (
        <video ref={ref} autoPlay playsInline muted={participant.isLocal} className={participant.isLocal && !screen ? "is-mirrored" : ""} />
      ) : (
        <div className="hm-avatar">
          <Avatar avatar={metaOf(participant).avatar} name={name} size={84} />
        </div>
      )}
      <span className="hm-name">
        {micOff && !screen && <MicOff size={13} />} {screen ? `${name}'s screen` : participant.isLocal ? `${name} (you)` : name}
      </span>
    </div>
  );
}

/**
 * A group video meeting for a chat room (up to 10 people), on LiveKit.
 * Opens full screen; `onClose` when you leave.
 */
export default function GroupMeeting({ room: chatRoom, video = true, onClose }) {
  const [state, setState] = useState({ phase: "connecting", error: null });
  const [, rerender] = useReducer((n) => n + 1, 0);
  const [speakers, setSpeakers] = useState([]);
  const lk = useRef(null);
  const audioBox = useRef(null);
  const closing = useRef(false);

  const leave = useCallback(
    async (endForAll) => {
      if (closing.current) return;
      closing.current = true;
      if (endForAll) await mapi(`/rooms/${chatRoom.id}/meeting/end`, { method: "POST" }).catch(() => {});
      if (lk.current) await lk.current.disconnect().catch(() => {});
      onClose();
    },
    [chatRoom.id, onClose],
  );

  useEffect(() => {
    let cancelled = false;
    const room = new Room({ adaptiveStream: true, dynacast: true });
    lk.current = room;
    const update = () => !cancelled && rerender();
    room
      .on(RoomEvent.ParticipantConnected, update)
      .on(RoomEvent.ParticipantDisconnected, update)
      .on(RoomEvent.TrackMuted, update)
      .on(RoomEvent.TrackUnmuted, update)
      .on(RoomEvent.LocalTrackPublished, update)
      .on(RoomEvent.LocalTrackUnpublished, update)
      .on(RoomEvent.TrackUnsubscribed, (track) => {
        track.detach().forEach((el) => el.remove());
        update();
      })
      .on(RoomEvent.TrackSubscribed, (track) => {
        // Remote voices play through hidden <audio> elements.
        if (track.kind === Track.Kind.Audio && audioBox.current) audioBox.current.appendChild(track.attach());
        update();
      })
      .on(RoomEvent.ActiveSpeakersChanged, (list) => !cancelled && setSpeakers(list.map((p) => p.identity)))
      .on(RoomEvent.Disconnected, () => {
        if (!closing.current && !cancelled) setState({ phase: "ended", error: null });
      });

    (async () => {
      try {
        const { url, token } = await mapi(`/rooms/${chatRoom.id}/meeting`, { method: "POST" });
        if (cancelled) return;
        await room.connect(url, token);
        if (cancelled) return room.disconnect();
        setState({ phase: "live", error: null });
        try {
          await room.localParticipant.setMicrophoneEnabled(true);
          if (video) await room.localParticipant.setCameraEnabled(true);
        } catch {
          setState({ phase: "live", error: "Allow camera and microphone access in your browser to be seen and heard." });
        }
        update();
      } catch (e) {
        if (!cancelled) setState({ phase: "failed", error: e.message || "Couldn't join the meeting." });
      }
    })();

    return () => {
      cancelled = true;
      room.disconnect();
    };
  }, [chatRoom.id, video]);

  const room = lk.current;
  const local = room && room.localParticipant;
  const people = room ? [room.localParticipant, ...room.remoteParticipants.values()] : [];
  const screens = people.filter((p) => p.isScreenShareEnabled);
  const canShare = typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia;
  const toggle = async (fn) => {
    try {
      await fn();
    } catch (e) {
      setState((s) => ({ ...s, error: e.message || "That didn't work. Check your browser's permissions." }));
    }
    rerender();
  };

  return createPortal(
    <div className="hm" role="dialog" aria-modal="true" aria-label={`${chatRoom.name} meeting`}>
      <header className="hm-head">
        <span className="hm-icon">{chatRoom.icon}</span>
        <div>
          <strong>{chatRoom.name}</strong>
          <small>
            <Users size={13} /> {people.length || 1} in the meeting
          </small>
        </div>
      </header>

      {state.phase === "connecting" && (
        <div className="hm-center">
          <Loader2 size={30} className="hub-spin" />
          <p>Joining the meeting…</p>
        </div>
      )}
      {(state.phase === "failed" || state.phase === "ended") && (
        <div className="hm-center">
          <p>{state.phase === "ended" ? "You left the meeting." : state.error}</p>
          <button type="button" className="hub-btn" onClick={onClose}>
            Close
          </button>
        </div>
      )}

      {state.phase === "live" && (
        <>
          {state.error && <p className="hm-note">{state.error}</p>}
          <div className={`hm-grid n-${Math.min(people.length + screens.length, 12)} ${screens.length ? "has-screen" : ""}`}>
            {screens.map((p) => (
              <Tile key={`${p.identity}-screen`} participant={p} source={Track.Source.ScreenShare} />
            ))}
            {people.map((p) => (
              <Tile key={p.identity} participant={p} speaking={speakers.includes(p.identity)} />
            ))}
          </div>
          <footer className="hm-controls">
            <button type="button" className={local && !local.isMicrophoneEnabled ? "is-off" : ""} aria-label={local && local.isMicrophoneEnabled ? "Mute" : "Unmute"} onClick={() => toggle(() => local.setMicrophoneEnabled(!local.isMicrophoneEnabled))}>
              {local && local.isMicrophoneEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            <button type="button" className={local && !local.isCameraEnabled ? "is-off" : ""} aria-label={local && local.isCameraEnabled ? "Turn camera off" : "Turn camera on"} onClick={() => toggle(() => local.setCameraEnabled(!local.isCameraEnabled))}>
              {local && local.isCameraEnabled ? <Video size={20} /> : <VideoOff size={20} />}
            </button>
            {canShare && (
              <button type="button" className={local && local.isScreenShareEnabled ? "is-on" : ""} aria-label={local && local.isScreenShareEnabled ? "Stop sharing" : "Share screen"} onClick={() => toggle(() => local.setScreenShareEnabled(!local.isScreenShareEnabled))}>
                <MonitorUp size={20} />
              </button>
            )}
            <button type="button" className="hm-leave" onClick={() => leave(false)}>
              <PhoneOff size={18} /> Leave
            </button>
            {chatRoom.isOwner && (
              <button type="button" className="hm-end" onClick={() => window.confirm("End the meeting for everyone?") && leave(true)}>
                End for all
              </button>
            )}
          </footer>
        </>
      )}
      <div ref={audioBox} hidden />
    </div>,
    document.body,
  );
}
