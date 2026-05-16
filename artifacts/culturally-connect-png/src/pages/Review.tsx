import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { CalendarDays, CheckCircle2, Clock, FileCheck2, Leaf, Loader2, MessageSquareText, Music2, XCircle, Home, type LucideIcon } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { apiJson } from "@/lib/api";
import {
  getGetHerbsQueryKey,
  getGetProvinceSummaryQueryKey,
  getGetStoriesQueryKey,
  getGetVillagesQueryKey,
  useGetProvinces,
  type Herb,
  type Province,
  type Story,
  type Village,
} from "@workspace/api-client-react";

type ContentKind = "stories" | "herbs" | "villages" | "songs" | "festivals";
type Song = {
  id: string;
  provinceId: string;
  title: string;
  description: string;
  performer?: string;
  status?: string;
};
type Festival = {
  id: string;
  provinceId: string;
  name: string;
  description: string;
  month?: string;
  status?: string;
};
type ModeratedItem = (Story | Herb | Village | Song | Festival) & { status?: string; provinceId: string };

const kindMeta = {
  stories: { title: "Stories", icon: MessageSquareText, path: "stories" },
  herbs: { title: "Herbs", icon: Leaf, path: "herbs" },
  villages: { title: "Villages", icon: Home, path: "villages" },
  songs: { title: "Songs", icon: Music2, path: "songs" },
  festivals: { title: "Festivals", icon: CalendarDays, path: "festivals" },
} satisfies Record<ContentKind, { title: string; icon: LucideIcon; path: string }>;

export default function ReviewPage() {
  const { data: provinces = [], isLoading: provincesLoading } = useGetProvinces();
  const provinceIds = provinces.map((province: Province) => province.id);

  const storyQueries = useQueries({
    queries: provinceIds.map((provinceId) => ({
      queryKey: getGetStoriesQueryKey({ provinceId }),
      queryFn: () => apiJson<Story[]>(`/api/stories?provinceId=${encodeURIComponent(provinceId)}`),
      enabled: provinceIds.length > 0,
    })),
  });
  const herbQueries = useQueries({
    queries: provinceIds.map((provinceId) => ({
      queryKey: getGetHerbsQueryKey({ provinceId }),
      queryFn: () => apiJson<Herb[]>(`/api/herbs?provinceId=${encodeURIComponent(provinceId)}`),
      enabled: provinceIds.length > 0,
    })),
  });
  const villageQueries = useQueries({
    queries: provinceIds.map((provinceId) => ({
      queryKey: getGetVillagesQueryKey({ provinceId }),
      queryFn: () => apiJson<Village[]>(`/api/villages?provinceId=${encodeURIComponent(provinceId)}`),
      enabled: provinceIds.length > 0,
    })),
  });
  const songQueries = useQueries({
    queries: provinceIds.map((provinceId) => ({
      queryKey: ["/api/songs", { provinceId }],
      queryFn: () => apiJson<Song[]>(`/api/songs?provinceId=${encodeURIComponent(provinceId)}`),
      enabled: provinceIds.length > 0,
    })),
  });
  const festivalQueries = useQueries({
    queries: provinceIds.map((provinceId) => ({
      queryKey: ["/api/festivals", { provinceId }],
      queryFn: () => apiJson<Festival[]>(`/api/festivals?provinceId=${encodeURIComponent(provinceId)}`),
      enabled: provinceIds.length > 0,
    })),
  });

  const loading = provincesLoading || [...storyQueries, ...herbQueries, ...villageQueries, ...songQueries, ...festivalQueries].some((query) => query.isLoading);
  const pending = {
    stories: storyQueries.flatMap((query) => (query.data || []).filter((item: any) => item.status === "pending")),
    herbs: herbQueries.flatMap((query) => (query.data || []).filter((item: any) => item.status === "pending")),
    villages: villageQueries.flatMap((query) => (query.data || []).filter((item: any) => item.status === "pending")),
    songs: songQueries.flatMap((query) => (query.data || []).filter((item: any) => item.status === "pending")),
    festivals: festivalQueries.flatMap((query) => (query.data || []).filter((item: any) => item.status === "pending")),
  };
  const totalPending = pending.stories.length + pending.herbs.length + pending.villages.length + pending.songs.length + pending.festivals.length;
  const provinceName = new Map(provinces.map((province: Province) => [province.id, province.name]));

  return (
    <Layout>
      <div className="container mx-auto flex-1 px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              <FileCheck2 className="h-4 w-4 text-primary" />
              Reviewer workspace
            </p>
            <h1 className="font-serif text-4xl font-bold text-foreground">Pending Content Review</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Approve culturally ready submissions or reject items that need correction before publishing.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-card/40 px-5 py-4">
            <div className="text-3xl font-bold text-primary">{totalPending}</div>
            <div className="text-sm text-muted-foreground">pending items</div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-primary">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading pending submissions...
          </div>
        ) : totalPending === 0 ? (
          <div className="rounded-lg border border-white/10 bg-card/35 p-10 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" />
            <h2 className="font-serif text-2xl text-foreground">No pending content</h2>
            <p className="mt-2 text-muted-foreground">New contributor submissions will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {(Object.keys(pending) as ContentKind[]).map((kind) => (
              <ReviewSection
                key={kind}
                kind={kind}
                items={pending[kind]}
                provinceName={provinceName}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

function ReviewSection({
  kind,
  items,
  provinceName,
}: {
  kind: ContentKind;
  items: ModeratedItem[];
  provinceName: Map<string, string>;
}) {
  const meta = kindMeta[kind];
  const Icon = meta.icon;
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 font-serif text-2xl text-foreground">
        <Icon className="h-5 w-5 text-primary" />
        {meta.title}
      </h2>
      <div className="grid gap-4">
        {items.map((item) => (
          <ReviewCard key={`${kind}-${item.id}`} kind={kind} item={item} provinceName={provinceName.get(item.provinceId) || item.provinceId} />
        ))}
      </div>
    </section>
  );
}

function ReviewCard({ kind, item, provinceName }: { kind: ContentKind; item: ModeratedItem; provinceName: string }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const mutation = useMutation({
    mutationFn: (status: "approved" | "rejected") =>
      apiJson(`/api/${kindMeta[kind].path}/${item.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetStoriesQueryKey({ provinceId: item.provinceId }) });
      queryClient.invalidateQueries({ queryKey: getGetHerbsQueryKey({ provinceId: item.provinceId }) });
      queryClient.invalidateQueries({ queryKey: getGetVillagesQueryKey({ provinceId: item.provinceId }) });
      queryClient.invalidateQueries({ queryKey: ["/api/songs", { provinceId: item.provinceId }] });
      queryClient.invalidateQueries({ queryKey: ["/api/festivals", { provinceId: item.provinceId }] });
      queryClient.invalidateQueries({ queryKey: getGetProvinceSummaryQueryKey(item.provinceId) });
      toast({ title: "Review saved", description: "The submission status was updated." });
    },
    onError: () => {
      toast({ title: "Review failed", description: "Could not update the submission.", variant: "destructive" });
    },
  });

  const title = "title" in item ? item.title : "name" in item ? item.name : "Submission";
  const body = "content" in item ? item.content : "description" in item ? item.description : "foundingStory" in item ? item.foundingStory : "";

  return (
    <article className="rounded-lg border border-white/10 bg-card/40 p-5">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-serif text-xl text-primary">{title}</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {provinceName}
          </p>
        </div>
        <span className="w-fit rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-200">
          Pending
        </span>
      </div>
      <p className="mb-4 line-clamp-3 text-sm leading-6 text-foreground/80">{body}</p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate("approved")}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" />
          Approve
        </button>
        <button
          type="button"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate("rejected")}
          className="inline-flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/20 disabled:opacity-50"
        >
          <XCircle className="h-4 w-4" />
          Reject
        </button>
        <Link href={`/province/${item.provinceId}`} className="inline-flex items-center rounded-md border border-white/10 px-4 py-2 text-sm text-muted-foreground hover:bg-white/10 hover:text-foreground">
          Open province
        </Link>
      </div>
    </article>
  );
}
