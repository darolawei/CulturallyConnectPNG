import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Leaf, Home, Mic, MicOff, ChevronRight, Loader2, PenLine, Volume2, CalendarDays, Users, MapPin, Languages } from "lucide-react";
import { 
  useGetProvince, 
  useGetStories, 
  useGetHerbs, 
  useGetVillages,
  useCreateStory,
  useCreateHerb,
  useCreateVillage,
  getGetStoriesQueryKey,
  getGetHerbsQueryKey,
  getGetVillagesQueryKey,
  useGetProvinceSummary,
  getGetProvinceQueryKey,
  getGetProvinceSummaryQueryKey,
  type Herb,
  type Story,
  type Village
} from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { TumbunaMan } from "@/components/TumbunaMan";
import { DancingBackground } from "@/components/DancingBackground";
import { ProvinceSatelliteMap } from "@/components/ProvinceSatelliteMap";
import { PROVINCE_FESTIVALS, PROVINCE_DANCE } from "@/data/festivals";
import { useAuth } from "@/lib/auth";

export default function ProvinceDashboard() {
  const [match, params] = useRoute("/province/:id");
  const [location, setLocation] = useLocation();
  const { canSubmit, canReview, user } = useAuth();
  const provinceId = params?.id || "central";
  type ProvinceTab = "stories" | "herbs" | "villages" | "festivals";
  const tabFromUrl = useMemo<ProvinceTab>(() => {
    const queryIndex = location.indexOf("?");
    if (queryIndex === -1) return "stories";
    const search = location.slice(queryIndex + 1);
    const urlParams = new URLSearchParams(search);
    const tab = urlParams.get("tab");
    if (tab === "stories" || tab === "herbs" || tab === "villages" || tab === "festivals") {
      return tab;
    }
    return "stories";
  }, [location]);

  const [activeTab, setActiveTab] = useState<ProvinceTab>(tabFromUrl);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl, provinceId]);

  const selectTab = (tab: ProvinceTab) => {
    setActiveTab(tab);
    setLocation(`/province/${provinceId}?tab=${tab}`);
  };

  const { data: province, isLoading: isProvinceLoading } = useGetProvince(provinceId, {
    query: { enabled: !!provinceId, queryKey: getGetProvinceQueryKey(provinceId) }
  });

  const { data: summary } = useGetProvinceSummary(provinceId, {
    query: { enabled: !!provinceId, queryKey: getGetProvinceSummaryQueryKey(provinceId) }
  });
  const moderationSummary = summary as (typeof summary & {
    pendingStoryCount?: number;
    pendingHerbCount?: number;
    pendingVillageCount?: number;
  }) | undefined;
  const pendingTotal =
    (moderationSummary?.pendingStoryCount || 0) +
    (moderationSummary?.pendingHerbCount || 0) +
    (moderationSummary?.pendingVillageCount || 0);

  const { data: stories, isLoading: isStoriesLoading } = useGetStories({ provinceId }, {
    query: { enabled: activeTab === "stories", queryKey: getGetStoriesQueryKey({ provinceId }) }
  });

  const { data: herbs, isLoading: isHerbsLoading } = useGetHerbs({ provinceId }, {
    query: { enabled: activeTab === "herbs", queryKey: getGetHerbsQueryKey({ provinceId }) }
  });

  const { data: villages, isLoading: isVillagesLoading } = useGetVillages({ provinceId }, {
    query: { enabled: activeTab === "villages", queryKey: getGetVillagesQueryKey({ provinceId }) }
  });

  if (isProvinceLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-primary font-serif text-xl flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin" />
            Entering Vault...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative min-h-screen pb-20">
        {/* Animated traditional dance background */}
        <DancingBackground
          provinceId={provinceId}
          provinceName={province?.name}
          color={province?.flagColor || "#C97000"}
        />
        <div className="absolute inset-0 z-0 bg-background/12 pointer-events-none" />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-background/10 via-background/28 to-background/78 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 pt-6">
          <Link href="/map" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-5 font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Map
          </Link>

          {/* Header Section */}
          <div className="mb-8 border-b border-white/10 pb-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
              <div className="max-w-3xl">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 mb-3"
                >
                  <div 
                    className="w-12 h-1.5 rounded-full" 
                    style={{ backgroundColor: province?.flagColor || "var(--primary)" }} 
                  />
                  <span className="uppercase tracking-widest text-xs font-semibold text-muted-foreground">
                    {province?.region || "Region"}
                  </span>
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold leading-tight text-foreground mb-3"
                  style={{ textShadow: "0 2px 14px rgba(0,0,0,0.72)" }}
                >
                  {province?.name || "Unknown Province"}
                </motion.h1>
                <p className="text-base sm:text-lg text-foreground/82 max-w-2xl leading-7" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.72)" }}>
                  {province?.description || "A sacred collection of oral histories, traditional medicines, and village origins."}
                </p>
              </div>
              
              <div className="bg-card/58 backdrop-blur-md p-4 rounded-lg border border-white/10 shadow-xl tapa-border space-y-4">
                {/* Province vitals */}
                <div>
                  <h3 className="font-serif text-xs uppercase tracking-widest mb-2.5 text-muted-foreground">Province Facts</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">Capital:</span>
                      <span className="font-semibold text-foreground">{province?.capital || "—"}</span>
                    </div>
                    {province?.population && (
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">Population:</span>
                        <span className="font-semibold text-foreground">{province.population.toLocaleString()}</span>
                      </div>
                    )}
                    {province?.area && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <span className="text-muted-foreground">Area:</span>
                        <span className="font-semibold text-foreground">{province.area.toLocaleString()} km²</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Languages */}
                {province?.languages && province.languages.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Languages className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">Languages</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {province.languages.map((lang: string) => (
                        <span key={lang} className="text-xs px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-foreground">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Vault counts */}
                <div className="border-t border-white/10 pt-3">
                  <h3 className="font-serif text-xs uppercase tracking-widest mb-2.5 text-muted-foreground">Vault Contents</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Recorded Stories</span>
                      <span className="font-bold text-foreground">{summary?.storyCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Medicinal Herbs</span>
                      <span className="font-bold text-foreground">{summary?.herbCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Village Origins</span>
                      <span className="font-bold text-foreground">{summary?.villageCount || 0}</span>
                    </div>
                  </div>
                </div>
                {pendingTotal > 0 && (
                  <div className="border-t border-white/10 pt-3">
                    <h3 className="font-serif text-xs uppercase tracking-widest mb-2.5 text-muted-foreground">Pending Review</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stories</span>
                        <span className="font-bold text-amber-300">{moderationSummary?.pendingStoryCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Herbs</span>
                        <span className="font-bold text-amber-300">{moderationSummary?.pendingHerbCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Villages</span>
                        <span className="font-bold text-amber-300">{moderationSummary?.pendingVillageCount || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="border-t border-white/10 pt-3">
                  <h3 className="font-serif text-xs uppercase tracking-widest mb-2.5 text-muted-foreground">Your Access</h3>
                  <p className="text-sm capitalize text-foreground">{user?.role || "visitor"}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {canSubmit
                      ? "You can submit new cultural records for review."
                      : canReview
                        ? "You can inspect pending records and moderate them from the review workspace."
                        : "You can browse approved public cultural records."}
                  </p>
                </div>
                {/* Dance style badge */}
                {PROVINCE_DANCE[provinceId] && (
                  <div className="border-t border-white/10 pt-3">
                    <p className="text-xs text-accent font-medium mb-1">🥁 {PROVINCE_DANCE[provinceId].name}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{PROVINCE_DANCE[provinceId].description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {province && (
            <ProvinceSatelliteMap
              provinceId={provinceId}
              provinceName={province.name}
              accentColor={province.flagColor || "#C97000"}
            />
          )}

          {/* Navigation Tabs */}
          <div className="flex max-w-full overflow-x-auto hide-scrollbar gap-1.5 mb-7 p-1 bg-black/25 rounded-lg border border-white/10 w-fit">
            {[
              { id: "stories", label: "Tubuna Stories", icon: BookOpen },
              { id: "herbs", label: "Olgeta Kru (Herbs)", icon: Leaf },
              { id: "villages", label: "Mama Graun (Villages)", icon: Home },
              { id: "festivals", label: "Singsing & Festivals", icon: CalendarDays },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => selectTab(tab.id as ProvinceTab)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-md text-sm font-medium transition-all relative ${
                    isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab" 
                      className="absolute inset-0 bg-primary/90 rounded-md z-0 tapa-border" 
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === "stories" && (
                <motion.div
                  key="stories"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h2 className="text-2xl font-serif text-foreground">Oral History Library</h2>
                    {canSubmit && <RecordStoryModal provinceId={provinceId} />}
                  </div>
                  
                  {isStoriesLoading ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {[1,2].map(i => <div key={i} className="h-48 bg-card/50 animate-pulse rounded-xl" />)}
                    </div>
                  ) : stories?.length === 0 ? (
                    <div className="text-center py-20 bg-card/30 rounded-xl border border-white/5 border-dashed">
                      <Mic className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-lg text-muted-foreground">No stories recorded for this province yet.</p>
                      <p className="text-sm text-muted-foreground/70">Be the first to preserve an elder's wisdom.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {stories?.map((story: Story, i: number) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={story.id} 
                          className="bg-card/40 backdrop-blur-sm border border-white/5 p-6 rounded-xl hover:bg-card/60 transition-colors group"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-serif text-primary mb-1 group-hover:text-accent transition-colors">{story.title}</h3>
                              <p className="text-sm text-muted-foreground">Told by {story.elderName}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className="bg-black/40 px-3 py-1 rounded text-xs text-muted-foreground flex items-center gap-2">
                                <Mic className="w-3 h-3 text-accent" /> {new Date(story.recordedAt).getFullYear()}
                              </div>
                              {canReview && <StatusBadge status={(story as any).status} />}
                            </div>
                          </div>
                          <p className="text-foreground/80 line-clamp-3 text-sm leading-relaxed mb-4">
                            {story.content}
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {story.language && (
                              <span className="text-xs px-2 py-1 bg-secondary/20 text-secondary-foreground rounded border border-secondary/20">
                                {story.language}
                              </span>
                            )}
                            {story.tags?.map((tag: string) => (
                              <span key={tag} className="text-xs px-2 py-1 bg-white/5 text-muted-foreground rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "herbs" && (
                <motion.div
                  key="herbs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h2 className="text-2xl font-serif text-foreground">Traditional Medicine Vault</h2>
                    {canSubmit && <AddHerbModal provinceId={provinceId} />}
                  </div>

                  {isHerbsLoading ? (
                    <div className="grid md:grid-cols-3 gap-6">
                      {[1,2,3].map(i => <div key={i} className="h-64 bg-card/50 animate-pulse rounded-xl" />)}
                    </div>
                  ) : herbs?.length === 0 ? (
                    <div className="text-center py-20 bg-card/30 rounded-xl border border-white/5 border-dashed">
                      <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-lg text-muted-foreground">No traditional medicines recorded yet.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                      {herbs?.map((herb: Herb, i: number) => (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          key={herb.id} 
                          className="bg-card/40 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden hover:bg-card/60 transition-colors"
                        >
                          <div className="h-32 bg-gradient-to-br from-secondary/20 to-black/40 flex items-center justify-center border-b border-white/5 relative">
                            <Leaf className="w-16 h-16 text-secondary opacity-20 absolute" />
                            <h3 className="font-serif text-2xl text-secondary-foreground relative z-10">{herb.name}</h3>
                          </div>
                          <div className="p-5">
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <p className="text-xs uppercase tracking-wider text-muted-foreground">Local Name: <span className="text-foreground">{herb.localName}</span></p>
                              {canReview && <StatusBadge status={(herb as any).status} />}
                            </div>
                            <p className="text-sm text-foreground/80 mb-4 line-clamp-2">{herb.description}</p>
                            <div className="space-y-3 text-sm border-t border-white/5 pt-4">
                              <p><strong className="text-primary font-medium block mb-1">Uses:</strong> <span className="text-muted-foreground">{herb.uses.join(", ")}</span></p>
                              {herb.preparation && <p className="line-clamp-2"><strong className="text-primary font-medium block mb-1">Preparation:</strong> <span className="text-muted-foreground">{herb.preparation}</span></p>}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "villages" && (
                <motion.div
                  key="villages"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h2 className="text-2xl font-serif text-foreground">Village Origins & Ethnography</h2>
                    {canSubmit && <AddVillageModal provinceId={provinceId} />}
                  </div>

                  {isVillagesLoading ? (
                    <div className="space-y-4">
                      {[1,2,3].map(i => <div key={i} className="h-24 bg-card/50 animate-pulse rounded-xl" />)}
                    </div>
                  ) : villages?.length === 0 ? (
                    <div className="text-center py-20 bg-card/30 rounded-xl border border-white/5 border-dashed">
                      <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-lg text-muted-foreground">No village histories recorded yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {villages?.map((village: Village, i: number) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          key={village.id} 
                          className="bg-card/40 backdrop-blur-sm border border-white/5 p-6 rounded-xl flex flex-col md:flex-row gap-6 md:items-center hover:bg-card/60 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <h3 className="text-xl font-serif text-foreground">{village.name}</h3>
                              {canReview && <StatusBadge status={(village as any).status} />}
                            </div>
                            <p className="text-sm text-primary mb-3">Origin Clan: {village.clanOrigin}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{village.foundingStory}</p>
                          </div>
                          <div className="flex-shrink-0 flex flex-wrap gap-2 md:w-48">
                            {village.languages?.map((lang: string) => (
                              <span key={lang} className="text-xs bg-black/40 border border-white/5 px-2 py-1 rounded">
                                {lang}
                              </span>
                            ))}
                          </div>
                          <button className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
              {activeTab === "festivals" && (
                <motion.div
                  key="festivals"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-serif text-foreground mb-6">Singsing, Ceremonies & Festivals</h2>

                  {/* Dance Style hero */}
                  {PROVINCE_DANCE[provinceId] && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-6 rounded-2xl overflow-hidden border border-white/10"
                      style={{ background: `linear-gradient(135deg, ${province?.flagColor || "#C97000"}22, transparent 70%)` }}
                    >
                      <div className="p-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="text-5xl">🥁</div>
                        <div>
                          <h3 className="text-xl font-serif font-bold text-primary mb-1">
                            {PROVINCE_DANCE[provinceId].name}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {PROVINCE_DANCE[provinceId].description}
                          </p>
                          <span className="mt-2 inline-block text-xs uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 text-muted-foreground">
                            {PROVINCE_DANCE[provinceId].type === "highlands" ? "🏔️ Highlands Style" :
                             PROVINCE_DANCE[provinceId].type === "islands" ? "🌊 Islands Style" :
                             PROVINCE_DANCE[provinceId].type === "sepik" ? "🐊 Sepik Style" :
                             "⛵ Southern Style"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Festival cards */}
                  {(PROVINCE_FESTIVALS[provinceId] || []).length === 0 ? (
                    <div className="text-center py-20 bg-card/30 rounded-xl border border-white/5 border-dashed">
                      <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-lg text-muted-foreground">Cultural calendar coming soon for this province.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {(PROVINCE_FESTIVALS[provinceId] || []).map((festival, i) => (
                        <motion.div
                          key={festival.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.12 }}
                          className="bg-card/40 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden hover:bg-card/60 transition-colors"
                        >
                          <div
                            className="h-2 w-full"
                            style={{ backgroundColor: province?.flagColor || "var(--primary)" }}
                          />
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <h3 className="font-serif text-lg text-foreground">{festival.name}</h3>
                              <span className="flex-shrink-0 text-xs px-2 py-1 rounded bg-black/30 border border-white/5 text-accent">
                                {festival.month}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                              {festival.description}
                            </p>
                            <span className="text-xs px-2 py-1 rounded-full border border-white/10 bg-white/5 text-muted-foreground capitalize">
                              {festival.type === "ceremony" ? "🔔 Ceremony" :
                               festival.type === "ritual" ? "🪶 Ritual" :
                               festival.type === "market" ? "🌾 Agricultural" :
                               "🎉 Festival"}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {province && <TumbunaMan provinceId={provinceId} provinceName={province.name} />}
    </Layout>
  );
}

// Sub-components for Modals
function StatusBadge({ status }: { status?: string }) {
  const styles =
    status === "approved"
      ? "border-primary/30 bg-primary/10 text-primary"
      : status === "rejected"
        ? "border-destructive/30 bg-destructive/10 text-destructive-foreground"
        : "border-amber-300/30 bg-amber-300/10 text-amber-200";

  return (
    <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-widest ${styles}`}>
      {status || "approved"}
    </span>
  );
}

type RecordMode = "choose" | "voice" | "write";

function RecordStoryModal({ provinceId }: { provinceId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<RecordMode>("choose");
  const createStory = useCreateStory();

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    elderName: "",
    content: "",
    language: "",
    tags: ""
  });

  const resetAll = useCallback(() => {
    setMode("choose");
    setIsRecording(false);
    setIsTranscribing(false);
    setFormData({ title: "", elderName: "", content: "", language: "", tags: "" });
    audioChunksRef.current = [];
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      toast({ title: "Microphone access denied", description: "Please allow microphone access to record.", variant: "destructive" });
    }
  };

  const stopRecordingAndTranscribe = async () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;

    setIsRecording(false);
    setIsTranscribing(true);

    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
      recorder.stream.getTracks().forEach(t => t.stop());
    });

    try {
      const mimeType = audioChunksRef.current[0]?.type || "audio/webm";
      const blob = new Blob(audioChunksRef.current, { type: mimeType });
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const resp = await fetch("/api/openai/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64, mimeType }),
      });
      const data = await resp.json() as { text?: string; error?: string };
      if (data.text) {
        setFormData(f => ({ ...f, content: data.text! }));
        toast({ title: "Voice transcribed!", description: "Your recording has been converted to text. Review and save." });
      } else {
        toast({ title: "Transcription failed", description: data.error || "Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Could not transcribe audio.", variant: "destructive" });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createStory.mutate({
      data: {
        provinceId,
        title: formData.title,
        elderName: formData.elderName,
        content: formData.content,
        language: formData.language || undefined,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : []
      }
    }, {
      onSuccess: () => {
        toast({ title: "Story preserved", description: "The oral history has been safely stored in the vault." });
        queryClient.invalidateQueries({ queryKey: getGetStoriesQueryKey({ provinceId }) });
        queryClient.invalidateQueries({ queryKey: getGetProvinceSummaryQueryKey(provinceId) });
        setOpen(false);
        resetAll();
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to record story.", variant: "destructive" });
      }
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetAll(); }}>
      <DialogTrigger className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(255,160,50,0.3)] tapa-border">
        <Mic className="w-4 h-4" />
        Record Tok-Stori
      </DialogTrigger>
      <DialogContent className="bg-card border-white/10 text-foreground sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-primary">Record Ancestral Story</DialogTitle>
        </DialogHeader>

        {/* Step 1: Choose mode */}
        {mode === "choose" && (
          <div className="pt-4 space-y-4">
            <p className="text-muted-foreground text-sm">How would you like to contribute this story?</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { setMode("voice"); }}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/15 hover:border-primary transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <Volume2 className="w-7 h-7 text-primary" />
                </div>
                <div className="text-center">
                  <div className="font-serif font-bold text-primary text-lg">Record Voice</div>
                  <div className="text-xs text-muted-foreground mt-1">Speak the story — AI will transcribe it</div>
                </div>
              </button>
              <button
                onClick={() => setMode("write")}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-accent/30 bg-accent/5 hover:bg-accent/15 hover:border-accent transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                  <PenLine className="w-7 h-7 text-accent" />
                </div>
                <div className="text-center">
                  <div className="font-serif font-bold text-accent text-lg">Write / Translate</div>
                  <div className="text-xs text-muted-foreground mt-1">Type or paste a story or translation</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Voice recording mode */}
        {mode === "voice" && (
          <div className="pt-4 space-y-5">
            {/* Mic recorder */}
            <div className="flex flex-col items-center gap-4 py-4">
              {isTranscribing ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <p className="text-muted-foreground text-sm">Transcribing your voice…</p>
                </div>
              ) : isRecording ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 animate-pulse" />
                    <button
                      onClick={stopRecordingAndTranscribe}
                      className="absolute inset-0 w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
                    >
                      <MicOff className="w-8 h-8 text-white" />
                    </button>
                  </div>
                  <p className="text-red-400 text-sm font-medium animate-pulse">Recording… tap to stop</p>
                </div>
              ) : formData.content ? (
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                    <Volume2 className="w-4 h-4" />
                    Voice transcribed — review below
                  </div>
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Mic className="w-3 h-3" /> Record again
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={startRecording}
                    className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center shadow-[0_0_20px_rgba(255,160,50,0.5)] transition-all"
                  >
                    <Mic className="w-9 h-9 text-primary-foreground" />
                  </button>
                  <p className="text-muted-foreground text-sm">Tap to start recording</p>
                </div>
              )}
            </div>

            {/* Form fields (shown after transcription) */}
            {formData.content && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground font-medium">Story Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    type="text" className="w-full bg-black/50 border border-white/10 rounded p-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" 
                    placeholder="e.g. How the Sepik River was formed" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground font-medium">Elder Name</label>
                  <input required value={formData.elderName} onChange={e => setFormData({...formData, elderName: e.target.value})}
                    type="text" className="w-full bg-black/50 border border-white/10 rounded p-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" 
                    placeholder="Who is telling this story?" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground font-medium">Transcribed Content — Edit if needed</label>
                  <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                    rows={4} className="w-full bg-black/50 border border-white/10 rounded p-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground font-medium">Language</label>
                    <input value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})}
                      type="text" className="w-full bg-black/50 border border-white/10 rounded p-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" placeholder="e.g. Tok Pisin" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground font-medium">Tags</label>
                    <input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})}
                      type="text" className="w-full bg-black/50 border border-white/10 rounded p-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" placeholder="creation, river" />
                  </div>
                </div>
                <button type="submit" disabled={createStory.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded font-serif font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {createStory.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save to Vault"}
                </button>
              </form>
            )}
            <button onClick={() => setMode("choose")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">← Back</button>
          </div>
        )}

        {/* Write / translate mode */}
        {mode === "write" && (
          <div className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground font-medium">Story Title</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  type="text" className="w-full bg-black/50 border border-white/10 rounded p-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" 
                  placeholder="e.g. How the Sepik River was formed" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground font-medium">Elder Name</label>
                <input required value={formData.elderName} onChange={e => setFormData({...formData, elderName: e.target.value})}
                  type="text" className="w-full bg-black/50 border border-white/10 rounded p-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" 
                  placeholder="Who is telling this story?" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground font-medium">Language</label>
                  <input value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})}
                    type="text" className="w-full bg-black/50 border border-white/10 rounded p-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" placeholder="e.g. Tok Pisin, Huli" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground font-medium">Tags (comma separated)</label>
                  <input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})}
                    type="text" className="w-full bg-black/50 border border-white/10 rounded p-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" placeholder="creation, river, ancestors" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground font-medium">Translation / Content</label>
                <textarea required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                  rows={5} className="w-full bg-black/50 border border-white/10 rounded p-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none" 
                  placeholder="Transcribe the story here..." />
              </div>
              <button type="submit" disabled={createStory.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded font-serif font-bold mt-4 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {createStory.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save to Vault"}
              </button>
            </form>
            <button onClick={() => setMode("choose")} className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors">← Back</button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AddHerbModal({ provinceId }: { provinceId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const createHerb = useCreateHerb();

  const [formData, setFormData] = useState({
    name: "",
    localName: "",
    description: "",
    uses: "",
    preparation: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createHerb.mutate({
      data: {
        provinceId,
        name: formData.name,
        localName: formData.localName,
        description: formData.description,
        uses: formData.uses ? formData.uses.split(",").map(t => t.trim()) : [],
        preparation: formData.preparation || undefined
      }
    }, {
      onSuccess: () => {
        toast({ title: "Herb added", description: "Traditional medicine has been recorded." });
        queryClient.invalidateQueries({ queryKey: getGetHerbsQueryKey({ provinceId }) });
        queryClient.invalidateQueries({ queryKey: getGetProvinceSummaryQueryKey(provinceId) });
        setOpen(false);
        setFormData({ name: "", localName: "", description: "", uses: "", preparation: "" });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to record herb.", variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
        <Leaf className="w-4 h-4" />
        Add Medicine
      </DialogTrigger>
      <DialogContent className="bg-card border-white/10 text-foreground sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-secondary">Add Traditional Herb</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground font-medium">Common Name</label>
              <input 
                required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                type="text" className="w-full bg-black/50 border border-white/10 rounded p-2 text-foreground focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground font-medium">Local/Tok Ples Name</label>
              <input 
                required value={formData.localName} onChange={e => setFormData({...formData, localName: e.target.value})}
                type="text" className="w-full bg-black/50 border border-white/10 rounded p-2 text-foreground focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground font-medium">Description</label>
            <textarea 
              required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              rows={2} className="w-full bg-black/50 border border-white/10 rounded p-2 text-foreground focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none resize-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground font-medium">Uses (comma separated)</label>
            <input 
              required value={formData.uses} onChange={e => setFormData({...formData, uses: e.target.value})}
              type="text" className="w-full bg-black/50 border border-white/10 rounded p-2 text-foreground focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none" 
              placeholder="e.g. fever, headache, cuts"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground font-medium">Preparation Method</label>
            <textarea 
              value={formData.preparation} onChange={e => setFormData({...formData, preparation: e.target.value})}
              rows={3} className="w-full bg-black/50 border border-white/10 rounded p-2 text-foreground focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none resize-none" 
              placeholder="How is it prepared and applied?"
            />
          </div>
          <button 
            type="submit" 
            disabled={createHerb.isPending}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-3 rounded font-serif font-bold mt-4 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {createHerb.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Store in Vault"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddVillageModal({ provinceId }: { provinceId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const createVillage = useCreateVillage();

  const [formData, setFormData] = useState({
    name: "",
    clanOrigin: "",
    foundingStory: "",
    languages: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createVillage.mutate({
      data: {
        provinceId,
        name: formData.name,
        clanOrigin: formData.clanOrigin,
        foundingStory: formData.foundingStory,
        languages: formData.languages ? formData.languages.split(",").map(t => t.trim()) : []
      }
    }, {
      onSuccess: () => {
        toast({ title: "Village recorded", description: "Village history has been preserved." });
        queryClient.invalidateQueries({ queryKey: getGetVillagesQueryKey({ provinceId }) });
        queryClient.invalidateQueries({ queryKey: getGetProvinceSummaryQueryKey(provinceId) });
        setOpen(false);
        setFormData({ name: "", clanOrigin: "", foundingStory: "", languages: "" });
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to record village.", variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
        <Home className="w-4 h-4" />
        Add Village
      </DialogTrigger>
      <DialogContent className="bg-card border-white/10 text-foreground sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-accent">Add Village Origin</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground font-medium">Village Name</label>
              <input 
                required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                type="text" className="w-full bg-black/50 border border-white/10 rounded p-2 text-foreground focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground font-medium">Origin Clan</label>
              <input 
                required value={formData.clanOrigin} onChange={e => setFormData({...formData, clanOrigin: e.target.value})}
                type="text" className="w-full bg-black/50 border border-white/10 rounded p-2 text-foreground focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground font-medium">Languages (comma separated)</label>
            <input 
              value={formData.languages} onChange={e => setFormData({...formData, languages: e.target.value})}
              type="text" className="w-full bg-black/50 border border-white/10 rounded p-2 text-foreground focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground font-medium">Founding Story</label>
            <textarea 
              required value={formData.foundingStory} onChange={e => setFormData({...formData, foundingStory: e.target.value})}
              rows={4} className="w-full bg-black/50 border border-white/10 rounded p-2 text-foreground focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none resize-none" 
              placeholder="How was this village established?"
            />
          </div>
          <button 
            type="submit" 
            disabled={createVillage.isPending}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3 rounded font-serif font-bold mt-4 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {createVillage.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Preserve History"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
