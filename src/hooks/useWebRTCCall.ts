import { useCallback, useEffect, useRef, useState } from 'react';

export type CallStatus = 'idle' | 'connecting' | 'active' | 'ended';

interface UseWebRTCCallOptions {
  onConnected?: () => void;
}

export const useWebRTCCall = (options: UseWebRTCCallOptions = {}) => {
  const [status, setStatus] = useState<CallStatus>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const connectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopLocalTracks = useCallback((stream: MediaStream | null) => {
    stream?.getTracks().forEach((track) => track.stop());
  }, []);

  const teardownPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  }, []);

  const endCall = useCallback(() => {
    if (connectTimerRef.current) {
      clearTimeout(connectTimerRef.current);
      connectTimerRef.current = null;
    }
    stopLocalTracks(localStream);
    setLocalStream(null);
    teardownPeerConnection();
    setStatus('ended');
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
  }, [localStream, stopLocalTracks, teardownPeerConnection]);

  const startCall = useCallback(async () => {
    setError(null);
    setStatus('connecting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const pc = new RTCPeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      peerConnectionRef.current = pc;

      setLocalStream(stream);
      setIsVideoEnabled(true);
      setIsAudioEnabled(true);

      connectTimerRef.current = setTimeout(() => {
        setStatus('active');
        options.onConnected?.();
      }, 1200);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Could not access camera or microphone. Check browser permissions.';
      setError(message);
      setStatus('idle');
      teardownPeerConnection();
    }
  }, [options, teardownPeerConnection]);

  const toggleVideo = useCallback(() => {
    if (!localStream) return;
    const next = !isVideoEnabled;
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });
    setIsVideoEnabled(next);
  }, [isVideoEnabled, localStream]);

  const toggleAudio = useCallback(() => {
    if (!localStream) return;
    const next = !isAudioEnabled;
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });
    setIsAudioEnabled(next);
  }, [isAudioEnabled, localStream]);

  const resetCall = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (connectTimerRef.current) clearTimeout(connectTimerRef.current);
      stopLocalTracks(localStream);
      teardownPeerConnection();
    };
  }, [localStream, stopLocalTracks, teardownPeerConnection]);

  return {
    status,
    localStream,
    isVideoEnabled,
    isAudioEnabled,
    error,
    startCall,
    endCall,
    toggleVideo,
    toggleAudio,
    resetCall,
    isInCall: status === 'connecting' || status === 'active',
  };
};
