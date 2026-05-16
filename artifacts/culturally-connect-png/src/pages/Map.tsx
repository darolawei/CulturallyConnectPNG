import { Layout } from "@/components/Layout";
import SvgMap from "@/components/SvgMap";
import { motion } from "framer-motion";
import { useGetProvinces } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import pngMapData from "@/data/png-map.json";
import fijiMapData from "@/data/fiji-map.json";

type CountryKey = "png" | "fji";

export default function MapPage() {
  const { data: provinces, isLoading } = useGetProvinces();
  const [country, setCountry] = useState<CountryKey>("png");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCountry(params.get("country") === "fji" ? "fji" : "png");
  }, []);

  const changeCountry = (nextCountry: CountryKey) => {
    setCountry(nextCountry);
    const url = new URL(window.location.href);
    url.searchParams.set("country", nextCountry);
    window.history.replaceState({}, "", `${url.pathname}?${url.searchParams.toString()}`);
  };

  const allProvinces = provinces || [];
  const countryProvinces = allProvinces.filter((province: any) =>
    country === "fji" ? String(province.id).startsWith("fji-") : !String(province.id).startsWith("fji-"),
  );
  const activeMapData = country === "fji" ? fijiMapData : pngMapData;
  const backgroundFlag = country === "fji" ? "/media/fiji.png" : "/media/papua-new-guinea-flag.png";
  const heading = country === "fji" ? "Fiji Provinces" : "The 22 Provinces";
  const description =
    country === "fji"
      ? "Explore Fiji province by province. Select an area to open its cultural vault."
      : "Explore the cultural diversity, languages, and ancestral heritage of Papua New Guinea. Select a province to enter its vault.";
  const mapTitle = country === "fji" ? "Fiji" : "Papua New Guinea";

  return (
    <Layout>
      <div className="flex-1 flex flex-col relative overflow-hidden bg-background">
        <img
          src={backgroundFlag}
          alt=""
          className="absolute inset-0 z-0 h-full w-full object-cover"
          style={{
            opacity: 0.34,
            filter: "saturate(1.12) contrast(1.08)",
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/48 to-background/88 z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.18)_72%,_rgba(0,0,0,0.42)_100%)] z-0" />
        
        <div className="container mx-auto px-4 pt-8 pb-4 sm:pt-12 sm:pb-6 relative z-10">
          <div className="mx-auto mb-5 flex w-fit max-w-full items-center gap-2 rounded-lg border border-white/10 bg-black/35 p-1">
            <button
              onClick={() => changeCountry("png")}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${country === "png" ? "bg-primary text-primary-foreground" : "text-foreground/85 hover:bg-white/10"}`}
            >
              Papua New Guinea
            </button>
            <button
              onClick={() => changeCountry("fji")}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${country === "fji" ? "bg-primary text-primary-foreground" : "text-foreground/85 hover:bg-white/10"}`}
            >
              Fiji
            </button>
          </div>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto mb-6 sm:mb-12"
          >
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-3 sm:mb-4"
              style={{ textShadow: "0 3px 22px rgba(0,0,0,0.75)" }}
            >
              {heading}
            </h1>
            <p className="text-foreground/80 text-sm leading-6 sm:text-lg" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.72)" }}>
              {description}
            </p>
          </motion.div>
        </div>

        <div className="relative w-full max-w-6xl mx-auto px-2 pb-8 z-10 flex items-center justify-center sm:px-4 sm:pb-12">
          {isLoading ? (
            <div className="flex flex-col items-center text-primary py-32">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="font-serif animate-pulse">Loading Map...</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="w-full min-h-[360px] sm:min-h-0"
              style={{ aspectRatio: "1000 / 720" }}
            >
              <SvgMap provinces={countryProvinces} mapData={activeMapData} mapTitle={mapTitle} />
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
