import { Image, Map, ShieldCheck, Upload, Video, type LucideIcon } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useGetProvinces, type Province } from "@workspace/api-client-react";

export default function AdminPage() {
  const { data: provinces = [], isLoading } = useGetProvinces();

  return (
    <Layout>
      <div className="container mx-auto flex-1 px-4 py-10">
        <div className="mb-8 border-b border-white/10 pb-6">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Admin workspace
          </p>
          <h1 className="font-serif text-4xl font-bold text-foreground">Province Media Control</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Admins can review content and prepare flags, videos, and province media for each dashboard.
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <SummaryCard icon={Map} label="Provinces" value={String(provinces.length)} />
          <SummaryCard icon={Image} label="Flag/Image Slots" value={String(provinces.length * 2)} />
          <SummaryCard icon={Video} label="Video Slots" value={String(provinces.length)} />
        </div>

        <div className="rounded-lg border border-white/10 bg-card/35">
          <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-3 border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <span>Province</span>
            <span>Media Access</span>
            <span>Action</span>
          </div>
          {isLoading ? (
            <div className="p-6 text-muted-foreground">Loading provinces...</div>
          ) : (
            provinces.map((province: Province) => (
              <div key={province.id} className="grid grid-cols-[1.2fr_1fr_1fr] gap-3 border-b border-white/5 px-4 py-4 last:border-b-0">
                <div>
                  <div className="font-serif text-lg text-foreground">{province.name}</div>
                  <div className="text-sm text-muted-foreground">{province.region}</div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">Flag</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">Hero image</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">Video</span>
                </div>
                <button
                  type="button"
                  className="inline-flex w-fit items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Upload className="h-4 w-4" />
                  Manage Media
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-card/40 p-5">
      <Icon className="mb-3 h-5 w-5 text-primary" />
      <div className="text-3xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
