import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Satellite, Search, MapPin } from "lucide-react";
import { getProvinceMapLocation, type ProvincePlace } from "@/data/province-locations";

declare global {
  interface Window {
    google?: any;
    __ccpngGoogleMapsPromise?: Promise<void>;
    __ccpngInitGoogleMaps?: () => void;
  }
}

interface ProvinceSatelliteMapProps {
  provinceId: string;
  provinceName: string;
  accentColor?: string;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

function loadGoogleMaps(): Promise<void> {
  if (window.google?.maps) return Promise.resolve();
  if (window.__ccpngGoogleMapsPromise) return window.__ccpngGoogleMapsPromise;

  window.__ccpngGoogleMapsPromise = new Promise((resolve, reject) => {
    window.__ccpngInitGoogleMaps = () => resolve();

    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: GOOGLE_MAPS_API_KEY || "",
      callback: "__ccpngInitGoogleMaps",
      v: "weekly",
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });

  return window.__ccpngGoogleMapsPromise;
}

function askTumbunaMan(provinceName: string, place: ProvincePlace) {
  const question = `Tell me about ${place.name} in ${place.district}, ${provinceName}. What cultural stories, village history, languages, and traditions are connected to this place?`;
  window.dispatchEvent(new CustomEvent("ccpng:ask-tumbuna", { detail: { question } }));
}

export function ProvinceSatelliteMap({ provinceId, provinceName, accentColor = "#C97000" }: ProvinceSatelliteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const infoWindowRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<ProvincePlace | null>(null);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const location = getProvinceMapLocation(provinceId);

  const groupedPlaces = useMemo(() => {
    const groups = new Map<string, ProvincePlace[]>();
    for (const place of location?.places || []) {
      const existing = groups.get(place.district) || [];
      existing.push(place);
      groups.set(place.district, existing);
    }
    return Array.from(groups.entries());
  }, [location]);

  useEffect(() => {
    if (!location || !mapRef.current || !GOOGLE_MAPS_API_KEY) return;

    let cancelled = false;
    setLoadState("loading");

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapRef.current || !window.google?.maps) return;

        const map = new window.google.maps.Map(mapRef.current, {
          center: location.center,
          zoom: location.zoom,
          mapTypeId: "satellite",
          gestureHandling: "greedy",
          streetViewControl: false,
          fullscreenControl: true,
          mapTypeControl: true,
          clickableIcons: true,
          zoomControl: true,
        });

        const infoWindow = new window.google.maps.InfoWindow();
        mapInstanceRef.current = map;
        infoWindowRef.current = infoWindow;
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        location.places.forEach((place) => {
          const marker = new window.google.maps.Marker({
            position: { lat: place.lat, lng: place.lng },
            map,
            title: place.name,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: accentColor,
              fillOpacity: 0.92,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              scale: place.type === "village" ? 7 : 8,
            },
          });

          marker.addListener("click", () => {
            setSelectedPlace(place);
            infoWindow.setContent(`
              <div style="font-family: Arial, sans-serif; color: #111827; min-width: 180px;">
                <strong>${place.name}</strong>
                <div style="margin-top: 4px; font-size: 12px;">${place.district}</div>
                <div style="margin-top: 6px; font-size: 11px; text-transform: uppercase; letter-spacing: .08em;">${place.type}</div>
              </div>
            `);
            infoWindow.open({ map, anchor: marker });
          });

          markersRef.current.push(marker);
        });

        setLoadState("ready");
      })
      .catch(() => {
        if (!cancelled) setLoadState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [accentColor, location, provinceId]);

  useEffect(() => {
    if (!mapInstanceRef.current || !selectedPlace) return;
    mapInstanceRef.current.panTo({ lat: selectedPlace.lat, lng: selectedPlace.lng });
    mapInstanceRef.current.setZoom(Math.max(mapInstanceRef.current.getZoom() || 10, 12));
  }, [selectedPlace]);

  if (!location) return null;

  return (
    <section className="mb-8 rounded-lg border border-white/10 bg-card/55 backdrop-blur-md shadow-xl overflow-hidden">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative min-h-[420px] sm:min-h-[520px] lg:min-h-[560px]">
          <div ref={mapRef} className="absolute inset-0 bg-black/50" />
          {!GOOGLE_MAPS_API_KEY && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-6 text-center">
              <div className="max-w-md">
                <Satellite className="mx-auto mb-4 h-10 w-10 text-primary" />
                <h2 className="font-serif text-2xl text-foreground">Google Satellite Map</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Add VITE_GOOGLE_MAPS_API_KEY in Render to turn on the live satellite map for {provinceName}.
                </p>
              </div>
            </div>
          )}
          {GOOGLE_MAPS_API_KEY && loadState === "loading" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-foreground">
              Loading satellite map...
            </div>
          )}
          {loadState === "error" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-6 text-center text-sm text-muted-foreground">
              Google Maps could not load. Check that the API key is valid and allowed for this website.
            </div>
          )}
        </div>

        <aside className="border-t border-white/10 bg-black/30 p-4 lg:border-l lg:border-t-0">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5">
              <Satellite className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-xl text-foreground">{provinceName} Satellite View</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Pinch or scroll to zoom, then select a district or village marker.
              </p>
            </div>
          </div>

          {selectedPlace && (
            <div className="mb-4 rounded-md border border-primary/25 bg-primary/10 p-3">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <div className="min-w-0">
                  <div className="font-serif text-base text-foreground">{selectedPlace.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedPlace.district}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => askTumbunaMan(provinceName, selectedPlace)}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <MessageCircle className="h-4 w-4" />
                Ask Tumbuna Man
              </button>
            </div>
          )}

          <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
            {groupedPlaces.map(([district, places]) => (
              <div key={district} className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{district}</div>
                <div className="space-y-1.5">
                  {places.map((place) => (
                    <button
                      key={`${place.district}-${place.name}`}
                      type="button"
                      onClick={() => setSelectedPlace(place)}
                      className="flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-white/10"
                    >
                      <span className="truncate">{place.name}</span>
                      <Search className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
