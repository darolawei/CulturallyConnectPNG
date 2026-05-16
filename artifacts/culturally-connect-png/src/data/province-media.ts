export type FlagPattern = "diagonal" | "split" | "triband" | "chevron";

export interface ProvinceMedia {
  flagImage: string;
  danceVideo: string;
  danceGif: string;
  galleryImages?: string[];
  flagColors: [string, string, string];
  flagPattern: FlagPattern;
}

const mediaRoot = "/media/provinces";
const flagRoot = "/media/province-flags";

function media(
  provinceId: string,
  flagColors: [string, string, string],
  flagPattern: FlagPattern,
  flagExt = "svg"
): ProvinceMedia {
  return {
    flagImage: `${flagRoot}/${provinceId}.${flagExt}`,
    danceVideo: `${mediaRoot}/${provinceId}/dance-short.mp4`,
    danceGif: `${mediaRoot}/${provinceId}/dance.gif`,
    flagColors,
    flagPattern,
  };
}

export const PROVINCE_MEDIA: Record<string, ProvinceMedia> = {
  "eastern-highlands": media("eastern-highlands", ["#C97000", "#111827", "#F8FAFC"], "diagonal"),
  "western-highlands": media("western-highlands", ["#B73A1B", "#0F172A", "#F7C948"], "chevron"),
  hela: media("hela", ["#D6A100", "#111827", "#C62828"], "split", "png"),
  enga: media("enga", ["#111827", "#D9A441", "#F8FAFC"], "triband", "png"),
  "southern-highlands": media("southern-highlands", ["#8B1E1E", "#111827", "#F8FAFC"], "diagonal", "png"),
  chimbu: media("chimbu", ["#111827", "#C97000", "#E5E7EB"], "chevron"),
  jiwaka: media("jiwaka", ["#2F7D32", "#D9A441", "#111827"], "split", "png"),
  madang: media("madang", ["#0E7490", "#C97000", "#F8FAFC"], "triband", "png"),
  "east-sepik": media("east-sepik", ["#7A1E1E", "#D9A441", "#111827"], "chevron", "png"),
  "west-sepik": media("west-sepik", ["#166534", "#7A1E1E", "#F8FAFC"], "diagonal", "png"),
  sandaun: media("west-sepik", ["#166534", "#7A1E1E", "#F8FAFC"], "diagonal", "png"),
  morobe: media("morobe", ["#C97000", "#0F766E", "#111827"], "split", "png"),
  manus: media("manus", ["#0E7490", "#F8FAFC", "#D9A441"], "diagonal", "png"),
  "new-ireland": media("new-ireland", ["#111827", "#B91C1C", "#F8FAFC"], "triband", "png"),
  "east-new-britain": media("east-new-britain", ["#7A1E1E", "#111827", "#D9A441"], "chevron", "png"),
  "west-new-britain": media("west-new-britain", ["#111827", "#7A1E1E", "#F97316"], "split", "png"),
  "north-solomons": media("north-solomons", ["#0F766E", "#111827", "#F8FAFC"], "diagonal"),
  gulf: media("gulf", ["#0E7490", "#C97000", "#F8FAFC"], "chevron", "png"),
  western: media("western", ["#166534", "#0F172A", "#D9A441"], "triband", "jpg"),
  central: {
    ...media("central", ["#C97000", "#111827", "#F8FAFC"], "split", "png"),
    danceVideo: `${mediaRoot}/national-capital/VID-20260515-WA0009.mp4`,
    danceGif: `${mediaRoot}/national-capital/IMG-20260515-WA0007.jpg`,
    galleryImages: [
      `${mediaRoot}/national-capital/IMG-20260515-WA0007.jpg`,
      `${mediaRoot}/national-capital/IMG-20260515-WA0008.jpg`,
    ],
  },
  "national-capital": {
    ...media("national-capital", ["#B91C1C", "#111827", "#F8FAFC"], "diagonal", "png"),
    danceVideo: `${mediaRoot}/national-capital/VID-20260515-WA0009.mp4`,
    danceGif: `${mediaRoot}/national-capital/IMG-20260515-WA0007.jpg`,
    galleryImages: [
      `${mediaRoot}/national-capital/IMG-20260515-WA0007.jpg`,
      `${mediaRoot}/national-capital/IMG-20260515-WA0008.jpg`,
    ],
  },
  "milne-bay": media("milne-bay", ["#0E7490", "#F8FAFC", "#C97000"], "split", "png"),
  oro: media("oro", ["#C97000", "#7A1E1E", "#F8FAFC"], "triband", "png"),
};

export function getProvinceMedia(provinceId: string): ProvinceMedia {
  if (provinceId.startsWith("fji-")) {
    const base = media(provinceId, ["#66CCFF", "#012169", "#FFFFFF"], "split", "png");
    return {
      ...base,
      flagImage: `${flagRoot}/fiji.png`,
    };
  }
  return PROVINCE_MEDIA[provinceId] ?? media(provinceId, ["#C97000", "#111827", "#F8FAFC"], "diagonal");
}
