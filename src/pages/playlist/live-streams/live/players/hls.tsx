import {
  LucideMaximize2,
  LucidePause,
  LucidePlay,
  LucideVolume2,
  LucideVolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import hls from "hls.js";
import { Stream } from "@/pages/playlist/live-streams";
import { StreamEpg } from "@/pages/playlist/live-streams/live";

const HlsPlayer = ({
  stream,
  epg,
  src,
}: {
  stream: Stream;
  epg: StreamEpg[];
  src: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const hlsRef = useRef<hls | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 100;

  const [connectionStatus, setConnectionStatus] = useState<string | null>(
    "Connectando..."
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false); // Unhide this state
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initPlayer = () => {
    if (!videoRef.current) return;

    if (hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      setConnectionStatus("Conectando...");
      const player = new hls();
      hlsRef.current = player;

      player.loadSource(src);
      player.attachMedia(videoRef.current);

      player.on(hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play();
        setIsPlaying(true);
        retryCount.current = 0;
        setConnectionStatus(null);
        toast("Stream conectada com sucesso");
      });

      player.on(hls.Events.LEVEL_LOADED, () => {
        retryCount.current = 0;
      });

      player.on(hls.Events.ERROR, (event, data) => {
        console.error("HLS Player Error:", data, event);
        if (data.fatal) {
          if (retryCount.current < maxRetries) {
            retryCount.current += 1;

            const message = `Tentando se reconectar... (${retryCount.current}/${maxRetries})`;
            setConnectionStatus(message);
            toast(message);

            setTimeout(() => {
              initPlayer();
            }, 1000);
          } else {
            const message =
              "Falha ao reconectar a stream depois de muitas tentativas";
            setConnectionStatus(message);
            toast(message);
            console.error("Max retries reached, playback failed");
          }
        }
      });
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = src;
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };
  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;

    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleMouseMove = () => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    retryCount.current = 0;
    initPlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [src]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setShowControls(true);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <div
      className="w-full relative group"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        controlsList="nodownload nofullscreen noremoteplayback"
        controls={false}
        className={`bg-zinc-900/40 rounded-lg object-fill w-full ${
          isFullscreen ? "h-screen" : "h-[650px]"
        }`}
      />

      {connectionStatus && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div className="text-white text-lg font-semibold">
            <h1>{connectionStatus}</h1>
          </div>
        </div>
      )}

      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 cursor-none"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-0 left-0 ring-0 p-4">
          <h2 className="text-white text-lg font-semibold mb-2">
            {stream.name} - {epg.length > 0 && <span>{epg[0].title}</span>}
          </h2>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* <div className="w-full h-1 bg-white/20 rounded-full mb-4" /> */}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <LucidePause className="h-6 w-6" />
                ) : (
                  <LucidePlay className="h-6 w-6" />
                )}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <LucideVolumeX className="h-6 w-6" />
                  ) : (
                    <LucideVolume2 className="h-6 w-6" />
                  )}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-24 accent-white"
                />
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={toggleFullscreen}
            >
              <LucideMaximize2 className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HlsPlayer;
