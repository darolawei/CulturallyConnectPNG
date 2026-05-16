import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PROVINCE_DANCE } from "@/data/festivals";
import { getProvinceMedia, type ProvinceMedia } from "@/data/province-media";

interface DancingBackgroundProps {
  provinceId: string;
  color?: string;
  provinceName?: string;
}

// Dance animation keyframes injected once
const KEYFRAMES = `
@keyframes highlands-jump {
  0%, 100% { transform: translateY(0) scaleX(1); }
  20%       { transform: translateY(-28px) scaleX(0.9); }
  40%       { transform: translateY(-18px) scaleX(0.95); }
  60%       { transform: translateY(-28px) scaleX(0.9); }
  80%       { transform: translateY(-6px) scaleX(1); }
}
@keyframes highlands-arm-l {
  0%, 100% { transform: rotate(-30deg); transform-origin: 50% 0; }
  20%       { transform: rotate(-110deg); transform-origin: 50% 0; }
  50%       { transform: rotate(-70deg); transform-origin: 50% 0; }
}
@keyframes highlands-arm-r {
  0%, 100% { transform: rotate(30deg); transform-origin: 50% 0; }
  20%       { transform: rotate(110deg); transform-origin: 50% 0; }
  50%       { transform: rotate(70deg); transform-origin: 50% 0; }
}
@keyframes highlands-head-wobble {
  0%, 100% { transform: rotate(0deg); }
  25%       { transform: rotate(-8deg); }
  75%       { transform: rotate(8deg); }
}
@keyframes sway-body {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25%       { transform: translateX(6px) rotate(3deg); }
  75%       { transform: translateX(-6px) rotate(-3deg); }
}
@keyframes sway-arm-l {
  0%, 100% { transform: rotate(-45deg); transform-origin: 50% 0; }
  50%       { transform: rotate(-130deg); transform-origin: 50% 0; }
}
@keyframes sway-arm-r {
  0%, 100% { transform: rotate(45deg); transform-origin: 50% 0; }
  50%       { transform: rotate(130deg); transform-origin: 50% 0; }
}
@keyframes sepik-flow {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  33%       { transform: translateY(-12px) rotate(2deg); }
  66%       { transform: translateY(-6px) rotate(-1deg); }
}
@keyframes sepik-arm-l {
  0%, 100% { transform: rotate(-60deg) scaleY(1); transform-origin: 50% 0; }
  50%       { transform: rotate(-20deg) scaleY(1.1); transform-origin: 50% 0; }
}
@keyframes sepik-arm-r {
  0%, 100% { transform: rotate(60deg) scaleY(1); transform-origin: 50% 0; }
  50%       { transform: rotate(20deg) scaleY(1.1); transform-origin: 50% 0; }
}
@keyframes paddle-body {
  0%, 100% { transform: rotate(0deg); }
  25%       { transform: rotate(-10deg) translateX(-4px); }
  75%       { transform: rotate(10deg) translateX(4px); }
}
@keyframes paddle-arm-l {
  0%, 100% { transform: rotate(-80deg); transform-origin: 50% 0; }
  50%       { transform: rotate(-10deg); transform-origin: 50% 0; }
}
@keyframes paddle-arm-r {
  0%, 100% { transform: rotate(10deg); transform-origin: 50% 0; }
  50%       { transform: rotate(80deg); transform-origin: 50% 0; }
}
@keyframes drift {
  0%, 100% { opacity: 0.08; }
  50%       { opacity: 0.18; }
}
@keyframes drift2 {
  0%, 100% { opacity: 0.05; }
  50%       { opacity: 0.12; }
}
@keyframes province-media-in {
  0% { opacity: 0; transform: scale(1.04); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes province-flag-drift {
  0%, 100% { transform: scale(1) translate3d(0, 0, 0); }
  50% { transform: scale(1.04) translate3d(-1.5%, 1%, 0); }
}
`;

type DanceType = "highlands" | "islands" | "sepik" | "southern";

const FLAG_IMAGE_PHASE_MS = 10000;

function getDanceType(provinceId: string): DanceType {
  const dance = PROVINCE_DANCE[provinceId];
  return dance?.type ?? "southern";
}

function getGeneratedFlagBackground(media: ProvinceMedia, accentColor: string): string {
  const [primary, secondary, highlight] = media.flagColors;

  const pattern = {
    diagonal: `linear-gradient(135deg, ${primary} 0 46%, ${highlight} 46% 50%, ${secondary} 50% 100%)`,
    split: `linear-gradient(90deg, ${primary} 0 48%, ${highlight} 48% 52%, ${secondary} 52% 100%)`,
    triband: `linear-gradient(180deg, ${primary} 0 33%, ${highlight} 33% 38%, ${secondary} 38% 100%)`,
    chevron: `linear-gradient(135deg, transparent 0 37%, ${highlight} 37% 42%, transparent 42% 100%),
      linear-gradient(45deg, transparent 0 37%, ${highlight} 37% 42%, transparent 42% 100%),
      linear-gradient(90deg, ${primary} 0 45%, ${secondary} 45% 100%)`,
  }[media.flagPattern];

  return `
    radial-gradient(circle at 18% 22%, ${accentColor}55 0 10%, transparent 28%),
    ${pattern}
  `;
}

// A single dancer SVG silhouette, style determined by dance type
function Dancer({
  x,
  y,
  scale = 1,
  delay = 0,
  speed = 1.2,
  danceType,
  color,
  mirror = false,
}: {
  x: number;
  y: number;
  scale?: number;
  delay?: number;
  speed?: number;
  danceType: DanceType;
  color: string;
  mirror?: boolean;
}) {
  const flip = mirror ? "scale(-1,1)" : "";

  // Animation config per dance type
  const bodyAnim = {
    highlands: `highlands-jump ${speed}s ease-in-out ${delay}s infinite`,
    islands:   `sway-body ${speed * 1.4}s ease-in-out ${delay}s infinite`,
    sepik:     `sepik-flow ${speed * 1.2}s ease-in-out ${delay}s infinite`,
    southern:  `paddle-body ${speed}s ease-in-out ${delay}s infinite`,
  }[danceType];

  const armLAnim = {
    highlands: `highlands-arm-l ${speed}s ease-in-out ${delay}s infinite`,
    islands:   `sway-arm-l ${speed * 1.4}s ease-in-out ${delay}s infinite`,
    sepik:     `sepik-arm-l ${speed * 1.1}s ease-in-out ${delay}s infinite`,
    southern:  `paddle-arm-l ${speed}s ease-in-out ${delay}s infinite`,
  }[danceType];

  const armRAnim = {
    highlands: `highlands-arm-r ${speed}s ease-in-out ${delay}s infinite`,
    islands:   `sway-arm-r ${speed * 1.4}s ease-in-out ${delay}s infinite`,
    sepik:     `sepik-arm-r ${speed * 1.1}s ease-in-out ${delay}s infinite`,
    southern:  `paddle-arm-r ${speed}s ease-in-out ${delay}s infinite`,
  }[danceType];

  const headAnim = {
    highlands: `highlands-head-wobble ${speed * 0.5}s ease-in-out ${delay}s infinite`,
    islands:   `sway-body ${speed * 1.4}s ease-in-out ${delay}s infinite`,
    sepik:     `sepik-flow ${speed * 1.5}s ease-in-out ${delay + 0.1}s infinite`,
    southern:  `paddle-body ${speed * 0.8}s ease-in-out ${delay}s infinite`,
  }[danceType];

  // Headdress per type
  const headdress = {
    highlands: (
      // Wig Man headdress — tall fan of feathers
      <g>
        {[-20, -12, -4, 4, 12, 20].map((ox, i) => (
          <line key={i} x1={ox} y1={-28} x2={ox * 1.3} y2={-52} stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
        ))}
        <ellipse cx={0} cy={-28} rx={22} ry={6} fill={color} opacity="0.6" />
      </g>
    ),
    islands: (
      // Mask / large round headdress
      <g>
        <ellipse cx={0} cy={-26} rx={16} ry={20} fill={color} opacity="0.5" />
        <ellipse cx={-6} cy={-28} rx={3} ry={4} fill="rgba(0,0,0,0.4)" />
        <ellipse cx={6} cy={-28} rx={3} ry={4} fill="rgba(0,0,0,0.4)" />
        {[-14, -7, 0, 7, 14].map((ox, i) => (
          <line key={i} x1={ox} y1={-44} x2={ox} y2={-56} stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        ))}
      </g>
    ),
    sepik: (
      // Spirit headdress — crescent horns
      <g>
        <path d="M -20 -20 Q -14 -52 0 -48 Q 14 -52 20 -20" fill="none" stroke={color} strokeWidth="3" opacity="0.7" />
        <circle cx={0} cy={-48} r={5} fill={color} opacity="0.6" />
        {[-16, -8, 8, 16].map((ox, i) => (
          <line key={i} x1={ox} y1={-36} x2={ox * 1.5} y2={-54} stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        ))}
      </g>
    ),
    southern: (
      // Canoe/coastal headdress — leaf crown
      <g>
        {[-18, -10, 0, 10, 18].map((ox, i) => (
          <ellipse key={i} cx={ox} cy={-32 - Math.abs(ox) * 0.4} rx={4} ry={10} fill={color} opacity="0.5" transform={`rotate(${ox * 3} ${ox} -30)`} />
        ))}
        <rect x={-16} y={-26} width={32} height={5} rx={2} fill={color} opacity="0.6" />
      </g>
    ),
  }[danceType];

  // Skirt/costume per type
  const skirt = {
    highlands: (
      // Grass skirt with movement
      <g>
        {[-14, -9, -4, 1, 6, 11].map((ox, i) => (
          <line key={i} x1={ox} y1={20} x2={ox - 3 + i} y2={48} stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        ))}
      </g>
    ),
    islands: (
      // Wide ceremonial skirt
      <g>
        <path d={`M -16 20 Q -22 40 -18 50 M -8 20 Q -12 42 -8 52 M 0 20 Q 0 44 2 54 M 8 20 Q 12 42 10 52 M 16 20 Q 22 40 18 50`}
          fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      </g>
    ),
    sepik: (
      // Flowing robes
      <g>
        <path d="M -14 20 Q -20 36 -16 52 Q -6 44 0 54 Q 6 44 16 52 Q 20 36 14 20"
          fill={color} opacity="0.3" />
      </g>
    ),
    southern: (
      // Tapa cloth wrap
      <g>
        <rect x={-14} y={20} width={28} height={28} rx={2} fill={color} opacity="0.3" />
        {[-8, 0, 8].map((ox, i) => (
          <line key={i} x1={ox} y1={20} x2={ox} y2={48} stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" />
        ))}
      </g>
    ),
  }[danceType];

  return (
    <g transform={`translate(${x},${y}) ${flip}`}>
      <g style={{ animation: bodyAnim }}>
        {/* Headdress (animated separately for head wobble) */}
        <g style={{ animation: headAnim }}>
          {headdress}
          {/* Head */}
          <circle cx={0} cy={-16} r={10} fill={color} opacity="0.8" />
          {/* Face paint / detail */}
          <line x1={-4} y1={-17} x2={-8} y2={-16} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={4} y1={-17} x2={8} y2={-16} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Torso */}
        <rect x={-9} y={-5} width={18} height={26} rx={4} fill={color} opacity="0.75" />

        {/* Left Arm */}
        <g style={{ transformOrigin: "-9px 0px" }}>
          <line x1={-9} y1={0} x2={-24} y2={22}
            stroke={color} strokeWidth="5" strokeLinecap="round"
            style={{ animation: armLAnim, transformOrigin: "-9px 0px" }}
          />
        </g>

        {/* Right Arm */}
        <g style={{ transformOrigin: "9px 0px" }}>
          <line x1={9} y1={0} x2={24} y2={22}
            stroke={color} strokeWidth="5" strokeLinecap="round"
            style={{ animation: armRAnim, transformOrigin: "9px 0px" }}
          />
        </g>

        {/* Skirt/costume */}
        {skirt}

        {/* Legs */}
        <line x1={-5} y1={48} x2={-8} y2={72} stroke={color} strokeWidth="5" strokeLinecap="round" />
        <line x1={5} y1={48} x2={8} y2={72} stroke={color} strokeWidth="5" strokeLinecap="round" />
        {/* Scale indicator — small decoration */}
        <g transform={`scale(${scale})`} />
      </g>
    </g>
  );
}

// Atmospheric background elements (tapa patterns, trees, waves)
function Atmosphere({ danceType, color }: { danceType: DanceType; color: string }) {
  if (danceType === "highlands") {
    // Mountain silhouettes
    return (
      <g opacity="0.12">
        <polygon points="0,720 200,480 400,720" fill={color} />
        <polygon points="150,720 400,420 650,720" fill={color} />
        <polygon points="500,720 750,460 1000,720" fill={color} />
        <polygon points="800,720 1000,500 1200,720" fill={color} />
        {/* Grass tufts */}
        {[60, 160, 280, 380, 500, 620, 750, 880].map((x, i) => (
          <g key={i}>
            <line x1={x} y1={720} x2={x - 8} y2={695} stroke={color} strokeWidth="3" strokeLinecap="round" />
            <line x1={x} y1={720} x2={x} y2={688} stroke={color} strokeWidth="3" strokeLinecap="round" />
            <line x1={x} y1={720} x2={x + 8} y2={695} stroke={color} strokeWidth="3" strokeLinecap="round" />
          </g>
        ))}
      </g>
    );
  }
  if (danceType === "islands") {
    // Waves + palm trees
    return (
      <g opacity="0.12">
        <path d="M0 680 Q 100 660 200 680 Q 300 700 400 680 Q 500 660 600 680 Q 700 700 800 680 Q 900 660 1000 680 L 1000 720 L 0 720 Z" fill={color} />
        <path d="M0 700 Q 150 680 300 700 Q 450 720 600 700 Q 750 680 900 700 L 1000 700 L 1000 720 L 0 720 Z" fill={color} opacity="0.8" />
        {[80, 300, 600, 850].map((x, i) => (
          <g key={i} transform={`translate(${x}, 680)`}>
            <line x1={0} y1={0} x2={-10} y2={-80} stroke={color} strokeWidth="6" strokeLinecap="round" />
            <ellipse cx={-10} cy={-80} rx={25} ry={14} fill={color} opacity="0.8" transform="rotate(-20 -10 -80)" />
            <ellipse cx={-10} cy={-80} rx={22} ry={12} fill={color} opacity="0.7" transform="rotate(15 -10 -80)" />
          </g>
        ))}
      </g>
    );
  }
  if (danceType === "sepik") {
    // Crocodile / river ripples + haus tambaran
    return (
      <g opacity="0.12">
        <path d="M0 700 Q 250 690 500 700 Q 750 710 1000 700 L 1000 720 L 0 720 Z" fill={color} />
        {/* Haus Tambaran (spirit house) silhouette */}
        <polygon points="400,600 500,440 600,600" fill={color} opacity="0.8" />
        <rect x={420} y={600} width={160} height={80} fill={color} opacity="0.7" />
        {/* Crocodile ripples */}
        {[100, 300, 700, 900].map((x, i) => (
          <g key={i}>
            <ellipse cx={x} cy={712} rx={40} ry={6} fill="none" stroke={color} strokeWidth="2" />
            <ellipse cx={x} cy={712} rx={20} ry={3} fill="none" stroke={color} strokeWidth="1.5" />
          </g>
        ))}
      </g>
    );
  }
  // southern — ocean horizon + lakatoi sail
  return (
    <g opacity="0.12">
      <path d="M0 680 Q 200 660 400 672 Q 600 684 800 668 Q 900 660 1000 672 L 1000 720 L 0 720 Z" fill={color} />
      {/* Lakatoi sail */}
      <polygon points="450,580 500,440 550,580" fill={color} opacity="0.7" />
      <line x1={500} y1={440} x2={500} y2={660} stroke={color} strokeWidth="4" />
      <ellipse cx={500} cy={660} rx={60} ry={10} fill={color} opacity="0.5" />
    </g>
  );
}

export function DancingBackground({ provinceId, color = "#C97000", provinceName }: DancingBackgroundProps) {
  const injected = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const media = getProvinceMedia(provinceId);
  const [mediaPhase, setMediaPhase] = useState<"video" | "flag">("video");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [flagFailed, setFlagFailed] = useState(false);
  const [flagReady, setFlagReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [shortVideoFailed, setShortVideoFailed] = useState(false);
  const [danceMediaReady, setDanceMediaReady] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [gifFailed, setGifFailed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (injected.current) return;
    injected.current = true;
    const style = document.createElement("style");
    style.textContent = KEYFRAMES;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    setFlagFailed(false);
    setFlagReady(false);
    setVideoFailed(false);
    setShortVideoFailed(false);
    setDanceMediaReady(false);
    setShouldLoadVideo(false);
    setGifFailed(false);
    setSoundEnabled(true);
    setMediaPhase("video");
    setGalleryIndex(0);
  }, [provinceId]);

  useEffect(() => {
    const timer = window.setTimeout(() => setShouldLoadVideo(true), 900);
    return () => window.clearTimeout(timer);
  }, [provinceId]);

  useEffect(() => {
    if (!media.galleryImages?.length || mediaPhase !== "flag") return;
    if (galleryIndex >= media.galleryImages.length - 1) return;

    const timer = window.setTimeout(
      () => setGalleryIndex((index) => Math.min(index + 1, media.galleryImages!.length - 1)),
      FLAG_IMAGE_PHASE_MS,
    );

    return () => window.clearTimeout(timer);
  }, [media.galleryImages, mediaPhase, galleryIndex]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !danceMediaReady || videoFailed) return;

    video.muted = !soundEnabled;
    video.volume = soundEnabled ? 0.72 : 0;

    void video.play().catch(() => {
      video.muted = true;
      video.volume = 0;
      setSoundEnabled(false);
    });
  }, [danceMediaReady, mediaPhase, soundEnabled, videoFailed]);

  const danceType = getDanceType(provinceId);

  const toggleSound = () => {
    const video = videoRef.current;
    const nextEnabled = !soundEnabled;

    if (video) {
      video.muted = !nextEnabled;
      video.volume = nextEnabled ? 1 : 0;

      if (nextEnabled) {
        void video.play().catch(() => {
          setSoundEnabled(false);
        });
      }
    }

    setSoundEnabled(nextEnabled);
  };

  // Dancer layout: spread across width, in visible range
  const baseY = 550;
  const dancers = [
    { x: 80,  scale: 0.8, delay: 0,    speed: 1.1, mirror: false },
    { x: 200, scale: 0.9, delay: 0.25, speed: 1.0, mirror: true  },
    { x: 330, scale: 1.0, delay: 0.5,  speed: 1.2, mirror: false },
    { x: 460, scale: 1.1, delay: 0.1,  speed: 0.95,mirror: false },
    { x: 590, scale: 1.0, delay: 0.4,  speed: 1.15,mirror: true  },
    { x: 720, scale: 0.9, delay: 0.2,  speed: 1.05,mirror: false },
    { x: 840, scale: 0.85,delay: 0.6,  speed: 1.1, mirror: true  },
    { x: 950, scale: 0.75,delay: 0.35, speed: 0.9, mirror: false },
  ];

  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1000 720"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        style={{ opacity: danceMediaReady ? 0.1 : 0.18 }}
      >
        <defs>
          <radialGradient id={`dance-glow-${provinceId}`} cx="50%" cy="85%" r="60%">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
          <filter id="dancer-blur">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>

        {/* Glow from ground */}
        <rect width={1000} height={720} fill={`url(#dance-glow-${provinceId})`} />

        {/* Atmospheric elements (mountains/waves/river) */}
        <Atmosphere danceType={danceType} color={color} />

        {/* Silhouette group — blurred for depth */}
        <g filter="url(#dancer-blur)">
          {dancers.map((d, i) => (
            <Dancer
              key={i}
              x={d.x}
              y={baseY}
              scale={d.scale}
              delay={d.delay}
              speed={d.speed}
              danceType={danceType}
              color={color}
              mirror={d.mirror}
            />
          ))}
        </g>
      </svg>

      <div
        key={`flag-fallback-${provinceId}`}
        className="absolute inset-0"
        style={{
          background: getGeneratedFlagBackground(media, color),
          opacity: mediaPhase === "flag" ? 0.18 : flagReady ? 0.04 : 0.2,
          mixBlendMode: "soft-light",
          animation: "province-flag-drift 18s ease-in-out infinite",
          transition: "opacity 900ms ease",
        }}
      />

      {!flagFailed && (
        <img
          key={`flag-${provinceId}`}
          src={media.flagImage}
          alt=""
          className="absolute inset-0 h-full w-full object-contain p-8 sm:p-10 lg:p-14"
          style={{
            opacity: flagReady ? (mediaPhase === "flag" ? 0.72 : 0.2) : 0,
            mixBlendMode: "normal",
            filter: "saturate(1.08) contrast(1.02) brightness(0.92)",
            animation: "province-media-in 700ms ease-out both, province-flag-drift 22s ease-in-out infinite",
            transition: "opacity 900ms ease, filter 900ms ease",
          }}
          onLoad={() => setFlagReady(true)}
          onError={() => {
            setFlagFailed(true);
            setFlagReady(false);
          }}
        />
      )}

      {media.galleryImages?.map((image, index) => (
        <img
          key={`gallery-${provinceId}-${image}`}
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: mediaPhase === "flag" && galleryIndex === index ? 0.68 : 0,
            objectPosition: "center center",
            filter: "saturate(1.08) contrast(1.04) brightness(0.92)",
            transition: "opacity 900ms ease",
          }}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ))}

      {!gifFailed && (
        <img
          key={`dance-gif-preview-${provinceId}`}
          src={media.danceGif}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: danceMediaReady && !videoFailed ? 0 : 0.36,
            objectPosition: "center center",
            filter: "saturate(1.05) contrast(1.02) brightness(0.92)",
            animation: "province-media-in 500ms ease-out both",
            transition: "opacity 500ms ease",
          }}
          onLoad={() => {
            if (!shouldLoadVideo) setDanceMediaReady(true);
          }}
          onError={() => setGifFailed(true)}
        />
      )}

      {shouldLoadVideo && !videoFailed && (
        <video
          ref={videoRef}
          key={`dance-video-${provinceId}-${shortVideoFailed ? "full" : "short"}`}
          src={shortVideoFailed ? media.danceVideo.replace("/dance-short.mp4", "/dance.mp4") : media.danceVideo}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: danceMediaReady && mediaPhase === "video" ? 0.72 : 0.08,
            objectPosition: "center center",
            filter: "saturate(1.08) contrast(1.03) brightness(0.9)",
            animation: "province-media-in 900ms ease-out both",
            transition: "opacity 900ms ease, filter 900ms ease",
          }}
          loop
          autoPlay
          muted={!soundEnabled}
          playsInline
          preload="auto"
          aria-label={provinceName ? `${provinceName} traditional dance background` : "Traditional dance background"}
          onLoadedMetadata={(event) => {
            const video = event.currentTarget;
            video.muted = !soundEnabled;
            video.volume = soundEnabled ? 0.72 : 0;
            setDanceMediaReady(true);
            void video.play().catch(() => {
              video.muted = true;
              video.volume = 0;
              setSoundEnabled(false);
            });
          }}
          onLoadedData={() => setDanceMediaReady(true)}
          onCanPlay={() => setDanceMediaReady(true)}
          onTimeUpdate={(event) => {
            const video = event.currentTarget;
            if (video.paused) {
              void video.play().catch(() => setSoundEnabled(false));
            }
          }}
          onEnded={(event) => {
            const video = event.currentTarget;
            video.currentTime = 0;
            void video.play().catch(() => setSoundEnabled(false));
          }}
          onError={() => {
            if (!shortVideoFailed) {
              setShortVideoFailed(true);
              setDanceMediaReady(false);
              return;
            }
            setVideoFailed(true);
            setDanceMediaReady(false);
          }}
          onVolumeChange={(event) => {
            const video = event.currentTarget;
            setSoundEnabled(!video.muted && video.volume > 0);
          }}
        />
      )}

      {videoFailed && !gifFailed && (
        <img
          key={`dance-gif-${provinceId}`}
          src={media.danceGif}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            opacity: danceMediaReady ? 0.42 : 0,
            objectPosition: "center center",
            filter: "saturate(1.05) contrast(1.02) brightness(0.9)",
            animation: "province-media-in 900ms ease-out both",
          }}
          onLoad={() => setDanceMediaReady(true)}
          onError={() => {
            setGifFailed(true);
            setDanceMediaReady(false);
          }}
        />
      )}

      {danceMediaReady && !videoFailed && (
        <button
          type="button"
          onClick={toggleSound}
          className="pointer-events-auto absolute bottom-5 right-5 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-2xl backdrop-blur-md transition-colors hover:bg-black/75"
          aria-label={soundEnabled ? "Mute dance video" : "Play dance video sound"}
          title={soundEnabled ? "Mute dance video" : "Play dance video sound"}
        >
          {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
      )}

      {/* Gradient fade to dark at top */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.1) 45%, var(--background) 100%)`,
        }}
      />
    </div>
  );
}
