import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { getProvinceMedia } from "@/data/province-media";

interface ProvincePath {
  id: string;
  name: string;
  d: string;
  cx: number;
  cy: number;
}

interface SvgMapProps {
  provinces: any[];
  mapData: {
    width: number;
    height: number;
    provinces: ProvincePath[];
  };
  mapTitle: string;
}

const FALLBACK_COLOR = "#5C3D2E";

export default function SvgMap({ provinces, mapData, mapTitle }: SvgMapProps) {
  const [, setLocation] = useLocation();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const provinceById = useMemo(() => {
    const map = new Map<string, any>();
    for (const p of provinces) map.set(p.id, p);
    return map;
  }, [provinces]);

  const paths = mapData.provinces as ProvincePath[];
  const hovered = hoveredId
    ? provinceById.get(hoveredId) ??
      paths.find((p) => p.id === hoveredId)
    : null;
  const hoveredFallback = hoveredId
    ? paths.find((p) => p.id === hoveredId)
    : null;

  return (
    <div className="relative h-full w-full">
      <div className="absolute right-3 top-3 z-50 flex items-center gap-1 rounded-lg border border-white/10 bg-black/55 p-1 text-white shadow-xl backdrop-blur-md sm:right-4 sm:top-4">
        <button
          type="button"
          onClick={() => setZoom((value) => Math.min(2.8, Number((value + 0.25).toFixed(2))))}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/12"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom((value) => Math.max(1, Number((value - 0.25).toFixed(2))))}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/12"
          aria-label="Zoom out"
          title="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/12"
          aria-label="Reset zoom"
          title="Reset zoom"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="h-full w-full overflow-auto overscroll-contain rounded-lg touch-pan-x touch-pan-y">
        <div
          className="h-full min-h-[420px] w-full min-w-[760px] origin-center sm:min-w-0"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
            width: `${zoom * 100}%`,
            height: `${zoom * 100}%`,
          }}
        >
      <svg
        viewBox={`0 0 ${mapData.width} ${mapData.height}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.5))" }}
      >
        <defs>
          <radialGradient id="ocean-glow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(30, 60, 90, 0.15)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
          <pattern id="tapa-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.6" fill="rgba(255, 160, 50, 0.08)" />
          </pattern>
          {paths.map((prov) => {
            const media = getProvinceMedia(prov.id);
            return (
              <pattern
                key={`flag-pattern-${prov.id}`}
                id={`flag-pattern-${prov.id}`}
                patternUnits="userSpaceOnUse"
                x={prov.cx - 70}
                y={prov.cy - 42}
                width="140"
                height="84"
              >
                <rect width="140" height="84" fill="rgba(0,0,0,0.18)" />
                <image
                  href={media.flagImage}
                  x="0"
                  y="0"
                  width="140"
                  height="84"
                  preserveAspectRatio="xMidYMid slice"
                />
              </pattern>
            );
          })}
        </defs>
        <rect width={mapData.width} height={mapData.height} fill="url(#ocean-glow)" />
        <rect width={mapData.width} height={mapData.height} fill="url(#tapa-pattern)" />

        {paths.map((prov) => {
          const isHovered = hoveredId === prov.id;
          const apiProv = provinceById.get(prov.id);
          const color = apiProv?.flagColor || FALLBACK_COLOR;

          return (
            <path
              key={`fallback-${prov.id}`}
              d={prov.d}
              fill={isHovered ? color : `${color}9c`}
              stroke="rgba(0,0,0,0.78)"
              strokeWidth={1.6}
              strokeLinejoin="round"
              onMouseEnter={() => setHoveredId(prov.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setLocation(`/province/${prov.id}`)}
              className="cursor-pointer transition-all duration-150"
            />
          );
        })}

        {paths.map((prov) => {
          const isHovered = hoveredId === prov.id;
          return (
            <path
              key={`flag-fill-${prov.id}`}
              d={prov.d}
              fill={`url(#flag-pattern-${prov.id})`}
              opacity={isHovered ? 1 : 0.86}
              stroke="rgba(255,255,255,0.7)"
              strokeWidth={isHovered ? 2.2 : 1}
              strokeLinejoin="round"
              pointerEvents="none"
              style={{
                filter: isHovered
                  ? "drop-shadow(0 0 10px rgba(255,255,255,0.5))"
                  : "drop-shadow(0 2px 3px rgba(0,0,0,0.35))",
              }}
            />
          );
        })}

        {paths.map((prov) => {
          return (
            <path
              key={`hit-${prov.id}`}
              d={prov.d}
              fill="transparent"
              stroke="transparent"
              strokeWidth={8}
              strokeLinejoin="round"
              onMouseEnter={() => setHoveredId(prov.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setLocation(`/province/${prov.id}`)}
              className="cursor-pointer"
            />
          );
        })}

        {paths.map((prov) => {
          const isHovered = hoveredId === prov.id;
          if (!isHovered) return null;
          return (
            <text
              key={`label-${prov.id}`}
              x={prov.cx}
              y={prov.cy}
              textAnchor="middle"
              fontSize="11"
              fontWeight="700"
              fill="#fff"
              stroke="rgba(0,0,0,0.7)"
              strokeWidth="3"
              paintOrder="stroke"
              pointerEvents="none"
              style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              {prov.name}
            </text>
          );
        })}
      </svg>
        </div>
      </div>

      {hoveredId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-card/95 border border-white/10 px-6 py-4 rounded-lg shadow-2xl backdrop-blur-md pointer-events-none text-center min-w-[260px] z-50"
        >
          <div
            className="w-12 h-1 mx-auto mb-3 rounded-full"
            style={{
              backgroundColor:
                hovered?.flagColor || FALLBACK_COLOR,
            }}
          />
          <h3 className="font-serif font-bold text-xl text-foreground mb-1">
            {hovered?.name || hoveredFallback?.name}
          </h3>
          {hovered?.capital && (
            <p className="text-muted-foreground text-sm uppercase tracking-wider">
              Capital: {hovered.capital}
            </p>
          )}
          {hovered?.region && (
            <p className="text-xs text-accent/80 mt-1">{hovered.region} Region</p>
          )}
          <div className="mt-2 text-xs text-accent">
            {hovered ? "Click to enter vault" : "(no data yet)"}
          </div>
        </motion.div>
      )}

      <div className="absolute left-3 top-3 bg-black/55 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 text-xs text-muted-foreground pointer-events-none sm:left-4 sm:top-4">
        <div className="font-serif text-primary font-bold text-sm">{mapTitle}</div>
        <div className="text-[10px] mt-0.5">{paths.length} provinces · click to explore</div>
      </div>
    </div>
  );
}
