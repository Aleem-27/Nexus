import React, { useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Phone,
  X,
  Loader2,
} from 'lucide-react';
import { useWebRTCCall } from '../../hooks/useWebRTCCall';
import { Avatar } from '../ui/Avatar';

interface VideoCallPanelProps {
  partnerName: string;
  partnerAvatarUrl: string;
  partnerOnline?: boolean;
  onClose: () => void;
}

export const VideoCallPanel: React.FC<VideoCallPanelProps> = ({
  partnerName,
  partnerAvatarUrl,
  partnerOnline,
  onClose,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const {
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
    isInCall,
  } = useWebRTCCall();

  useEffect(() => {
    const el = localVideoRef.current;
    if (!el) return;
    el.srcObject = localStream;
  }, [localStream]);

  const handleEndCall = () => {
    endCall();
    onClose();
  };

  const handleClose = () => {
    if (isInCall) {
      endCall();
    } else {
      resetCall();
    }
    onClose();
  };

  const statusLabel = () => {
    switch (status) {
      case 'connecting':
        return 'Connecting…';
      case 'active':
        return 'Connected (demo — no signaling server)';
      case 'ended':
        return 'Call ended';
      default:
        return 'Ready to start';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-950 text-white animate-fade-in">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/90">
        <div className="flex items-center gap-3">
          <Avatar
            src={partnerAvatarUrl}
            alt={partnerName}
            size="sm"
            status={partnerOnline ? 'online' : 'offline'}
          />
          <div>
            <h2 className="text-sm font-semibold">{partnerName}</h2>
            <p className="text-xs text-gray-400">{statusLabel()}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          aria-label="Close call"
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative flex-1 min-h-0 bg-gray-900">
        {/* Remote (mock — partner preview until real peer is wired) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 to-gray-950">
          {status === 'active' ? (
            <>
              <img
                src={partnerAvatarUrl}
                alt={partnerName}
                className="w-32 h-32 rounded-full object-cover ring-4 ring-primary-500/40 shadow-xl"
              />
              <p className="mt-4 text-lg font-medium">{partnerName}</p>
              <p className="mt-1 text-sm text-gray-400">
                Remote video would appear here with a signaling server
              </p>
            </>
          ) : status === 'connecting' ? (
            <div className="flex flex-col items-center text-gray-300">
              <Loader2 size={40} className="animate-spin text-primary-400 mb-4" />
              <p>Establishing WebRTC session…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center px-6">
              <Avatar src={partnerAvatarUrl} alt={partnerName} size="xl" className="mb-4" />
              <p className="text-lg font-medium">{partnerName}</p>
              <p className="text-sm text-gray-400 mt-2 max-w-sm">
                Start a call to enable your camera and microphone via WebRTC. This demo uses
                local media only.
              </p>
            </div>
          )}
        </div>

        {/* Local preview (PIP) */}
        <div className="absolute bottom-4 right-4 w-40 sm:w-52 aspect-video rounded-lg overflow-hidden border-2 border-gray-700 shadow-2xl bg-gray-800">
          {localStream && isVideoEnabled ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror-video"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs">
              <VideoOff size={24} className="mb-1" />
              Camera off
            </div>
          )}
          <span className="absolute bottom-1 left-2 text-[10px] font-medium text-white/80 bg-black/50 px-1.5 rounded">
            You
          </span>
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 bg-error-500/20 border-t border-error-500/30 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="flex items-center justify-center gap-3 sm:gap-4 px-4 py-5 bg-gray-900 border-t border-gray-800">
        <ControlButton
          label={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
          onClick={toggleAudio}
          disabled={!isInCall}
          iconOn={<Mic size={22} />}
          iconOff={<MicOff size={22} />}
          isOn={isAudioEnabled}
        />

        <ControlButton
          label={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          onClick={toggleVideo}
          disabled={!isInCall}
          iconOn={<Video size={22} />}
          iconOff={<VideoOff size={22} />}
          isOn={isVideoEnabled}
        />

        {isInCall ? (
          <button
            type="button"
            onClick={handleEndCall}
            className="flex flex-col items-center gap-1 min-w-[4.5rem]"
            aria-label="End call"
          >
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-error-500 hover:bg-error-600 text-white shadow-lg transition-colors">
              <PhoneOff size={24} />
            </span>
            <span className="text-xs text-gray-400">End</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={startCall}
            disabled={status === 'connecting'}
            className="flex flex-col items-center gap-1 min-w-[4.5rem] disabled:opacity-50"
            aria-label="Start call"
          >
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-success-500 hover:bg-success-600 text-white shadow-lg transition-colors">
              {status === 'connecting' ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <Phone size={24} />
              )}
            </span>
            <span className="text-xs text-gray-400">Start</span>
          </button>
        )}
      </div>
    </div>
  );
};

interface ControlButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  iconOn: React.ReactNode;
  iconOff: React.ReactNode;
  isOn: boolean;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  label,
  onClick,
  disabled,
  iconOn,
  iconOff,
  isOn,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex flex-col items-center gap-1 min-w-[4rem] disabled:opacity-40 disabled:cursor-not-allowed"
    aria-label={label}
  >
    <span
      className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
        isOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 ring-2 ring-error-500/80'
      }`}
    >
      {isOn ? iconOn : iconOff}
    </span>
    <span className="text-xs text-gray-400">{isOn ? 'On' : 'Off'}</span>
  </button>
);
