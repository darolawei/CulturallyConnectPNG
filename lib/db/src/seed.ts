import { db, pool } from "./index";
import { provincesTable } from "./schema";

const provinces = [
  { id: "central", name: "Central", capital: "Port Moresby", region: "Southern", flagColor: "#c97000", languages: ["Koiari", "Motu", "Hiri Motu", "Tok Pisin"], description: "Coastal and inland communities surrounding the national capital district." },
  { id: "chimbu", name: "Chimbu (Simbu)", capital: "Kundiawa", region: "Highlands", flagColor: "#7f1d1d", languages: ["Kuman", "Tok Pisin"], description: "A rugged highlands province known for strong clan traditions and mountain settlements." },
  { id: "eastern-highlands", name: "Eastern Highlands", capital: "Goroka", region: "Highlands", flagColor: "#166534", languages: ["Gahuku", "Asaro", "Tok Pisin"], description: "Highlands communities known for singsing, coffee gardens, and cultural gatherings." },
  { id: "east-new-britain", name: "East New Britain", capital: "Kokopo", region: "Islands", flagColor: "#991b1b", languages: ["Kuanua", "Tok Pisin"], description: "Tolai and Baining cultural areas with volcanic landscapes and coastal villages." },
  { id: "east-sepik", name: "East Sepik", capital: "Wewak", region: "Momase", flagColor: "#92400e", languages: ["Iatmul", "Abelam", "Tok Pisin"], description: "Sepik River communities with rich carving, story, and ceremonial traditions." },
  { id: "enga", name: "Enga", capital: "Wabag", region: "Highlands", flagColor: "#1d4ed8", languages: ["Enga", "Tok Pisin"], description: "A highlands province with strong Enga language identity and ceremonial exchange traditions." },
  { id: "gulf", name: "Gulf", capital: "Kerema", region: "Southern", flagColor: "#0f766e", languages: ["Toaripi", "Tok Pisin"], description: "Delta, river, and coastal communities along the Papuan Gulf." },
  { id: "hela", name: "Hela", capital: "Tari", region: "Highlands", flagColor: "#b45309", languages: ["Huli", "Tok Pisin"], description: "Home of Huli cultural traditions, highlands valleys, and ceremonial body decoration." },
  { id: "jiwaka", name: "Jiwaka", capital: "Banz", region: "Highlands", flagColor: "#15803d", languages: ["Melpa", "Kuman", "Tok Pisin"], description: "A fertile highlands province connecting Wahgi Valley communities." },
  { id: "madang", name: "Madang", capital: "Madang", region: "Momase", flagColor: "#0369a1", languages: ["Bel", "Tok Pisin"], description: "Coastal, island, and mountain communities with diverse languages and trade routes." },
  { id: "manus", name: "Manus", capital: "Lorengau", region: "Islands", flagColor: "#1e40af", languages: ["Manus", "Tok Pisin"], description: "Island communities with strong seafaring, carving, and clan histories." },
  { id: "milne-bay", name: "Milne Bay", capital: "Alotau", region: "Southern", flagColor: "#0891b2", languages: ["Dobu", "Suau", "Tok Pisin"], description: "Island and coastal cultures across the eastern tip of Papua New Guinea." },
  { id: "morobe", name: "Morobe", capital: "Lae", region: "Momase", flagColor: "#65a30d", languages: ["Yabem", "Bukawa", "Tok Pisin"], description: "A large province spanning Huon Gulf, Markham Valley, and mountain communities." },
  { id: "national-capital", name: "National Capital District", capital: "Port Moresby", region: "Southern", flagColor: "#be123c", languages: ["Motu", "Hiri Motu", "Tok Pisin", "English"], description: "Papua New Guinea's capital district and a meeting place for people from all provinces." },
  { id: "new-ireland", name: "New Ireland", capital: "Kavieng", region: "Islands", flagColor: "#7c3aed", languages: ["Nalik", "Tok Pisin"], description: "Island communities known for malagan traditions, sea routes, and coastal heritage." },
  { id: "north-solomons", name: "Autonomous Region of Bougainville", capital: "Buka", region: "Islands", flagColor: "#111827", languages: ["Nasioi", "Halia", "Tok Pisin"], description: "Autonomous island region with distinct cultural identities and histories." },
  { id: "oro", name: "Northern (Oro)", capital: "Popondetta", region: "Southern", flagColor: "#dc2626", languages: ["Orokaiva", "Tok Pisin"], description: "Northern coastal and inland communities with strong tapa and dance traditions." },
  { id: "sandaun", name: "West Sepik (Sandaun)", capital: "Vanimo", region: "Momase", flagColor: "#047857", languages: ["Amanab", "Tok Pisin"], description: "Border, river, and coastal communities in Papua New Guinea's northwest." },
  { id: "southern-highlands", name: "Southern Highlands", capital: "Mendi", region: "Highlands", flagColor: "#a16207", languages: ["Mendi", "Tok Pisin"], description: "Highlands valleys and ridges with clan histories and ceremonial exchange." },
  { id: "west-new-britain", name: "West New Britain", capital: "Kimbe", region: "Islands", flagColor: "#0e7490", languages: ["Nakanai", "Tok Pisin"], description: "Volcanic island landscapes and coastal communities around Kimbe Bay." },
  { id: "western", name: "Western", capital: "Daru", region: "Southern", flagColor: "#334155", languages: ["Kiwai", "Tok Pisin"], description: "River, delta, and border communities across Papua New Guinea's largest province." },
  { id: "western-highlands", name: "Western Highlands", capital: "Mount Hagen", region: "Highlands", flagColor: "#7c2d12", languages: ["Melpa", "Tok Pisin"], description: "Wahgi Valley communities known for large cultural shows and highlands exchange." },
  { id: "fji-ba", name: "Ba", capital: "Ba", region: "Western Division", flagColor: "#1d4ed8", languages: ["Fijian", "Fiji Hindi", "English"], description: "A major province in western Viti Levu with farming, towns, and coastal communities." },
  { id: "fji-bua", name: "Bua", capital: "Nabouwalu", region: "Northern Division", flagColor: "#0f766e", languages: ["Fijian", "English"], description: "Northern Vanua Levu communities linked by coastal and inland cultural traditions." },
  { id: "fji-cakaudrove", name: "Cakaudrove", capital: "Savusavu", region: "Northern Division", flagColor: "#a16207", languages: ["Fijian", "English"], description: "Large province across Vanua Levu and islands, known for deep chiefly and village ties." },
  { id: "fji-kadavu", name: "Kadavu", capital: "Vunisea", region: "Eastern Division", flagColor: "#166534", languages: ["Fijian", "English"], description: "Island province with strong marine stewardship and village-based cultural life." },
  { id: "fji-lau", name: "Lau", capital: "Tubou", region: "Eastern Division", flagColor: "#b91c1c", languages: ["Fijian", "English"], description: "Eastern island chain with rich voyaging history and inter-island kinship networks." },
  { id: "fji-lomaiviti", name: "Lomaiviti", capital: "Levuka", region: "Eastern Division", flagColor: "#7c3aed", languages: ["Fijian", "English"], description: "Historic island province centered on Levuka and surrounding island communities." },
  { id: "fji-macuata", name: "Macuata", capital: "Labasa", region: "Northern Division", flagColor: "#0891b2", languages: ["Fijian", "Fiji Hindi", "English"], description: "Northern Fiji province with large rural districts and diverse language communities." },
  { id: "fji-nadroga-navosa", name: "Nadroga-Navosa", capital: "Sigatoka", region: "Western Division", flagColor: "#be123c", languages: ["Fijian", "Fiji Hindi", "English"], description: "Western province spanning highlands and coral coast settlements." },
  { id: "fji-naitasiri", name: "Naitasiri", capital: "Nausori Highlands", region: "Central Division", flagColor: "#334155", languages: ["Fijian", "English"], description: "Central interior communities with strong vanua identity and river-linked settlements." },
  { id: "fji-namosi", name: "Namosi", capital: "Navua", region: "Central Division", flagColor: "#7f1d1d", languages: ["Fijian", "English"], description: "Mountain and riverine province with close ties between inland and coastal villages." },
  { id: "fji-ra", name: "Ra", capital: "Vaileka", region: "Western Division", flagColor: "#1e40af", languages: ["Fijian", "Fiji Hindi", "English"], description: "Northwestern Viti Levu province with distinct dialect and ceremonial traditions." },
  { id: "fji-rewa", name: "Rewa", capital: "Lomanikoro", region: "Central Division", flagColor: "#b45309", languages: ["Fijian", "English"], description: "Delta and river communities with influential chiefly history around central Fiji." },
  { id: "fji-rotuma", name: "Rotuma", capital: "Ahau", region: "Rotuma Dependency", flagColor: "#0f766e", languages: ["Rotuman", "Fijian", "English"], description: "Remote island dependency north of Fiji with distinct Rotuman culture and language." },
  { id: "fji-serua", name: "Serua", capital: "Nakorovou", region: "Central Division", flagColor: "#0e7490", languages: ["Fijian", "English"], description: "Southern Viti Levu province with intertwined coastal and inland cultural life." },
  { id: "fji-tailevu", name: "Tailevu", capital: "Nausori", region: "Central Division", flagColor: "#15803d", languages: ["Fijian", "English"], description: "Central-eastern Viti Levu province with major settlements and customary land areas." },
];

try {
  const pngProvinces = provinces.filter((province) => !province.id.startsWith("fji-"));

  for (const province of pngProvinces) {
    await db
      .insert(provincesTable)
      .values(province)
      .onConflictDoUpdate({
        target: provincesTable.id,
        set: province,
      });
  }

  console.log(`Seeded ${pngProvinces.length} Papua New Guinea provinces.`);
} finally {
  await pool.end();
}
