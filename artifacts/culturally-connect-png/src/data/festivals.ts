export interface Festival {
  name: string;
  month: string;
  description: string;
  type: "ceremony" | "festival" | "ritual" | "market";
}

export interface DanceStyle {
  name: string;
  type: "highlands" | "islands" | "sepik" | "southern";
  description: string;
}

export const PROVINCE_FESTIVALS: Record<string, Festival[]> = {
  "eastern-highlands": [
    { name: "Goroka Show", month: "September", description: "The world-famous cultural festival with over 100 tribes performing their traditional sing-sing, bilas, and dances in full regalia.", type: "festival" },
    { name: "Kainantu Cultural Festival", month: "April", description: "Celebrates the diverse language groups of Kainantu district through music, dance, and traditional food.", type: "festival" },
  ],
  "western-highlands": [
    { name: "Mount Hagen Cultural Show", month: "August", description: "One of PNG's biggest cultural events gathering thousands of performers from across the Highlands in their most elaborate traditional dress.", type: "festival" },
    { name: "Minj Agricultural Show", month: "June", description: "Blends agricultural innovation with traditional dance performances celebrating the fertile Wahgi Valley.", type: "market" },
  ],
  "hela": [
    { name: "Hela Wigmen Festival", month: "June", description: "The iconic Huli Wigmen perform their spectacular jumping dance, wearing towering ceremonial wigs made of human hair adorned with Bird of Paradise feathers.", type: "festival" },
    { name: "Tari Bilas Festival", month: "October", description: "Full-body decoration ceremony where Huli warriors paint their faces yellow, red, and blue, celebrating ancestral warrior traditions.", type: "ceremony" },
  ],
  "enga": [
    { name: "Enga Cultural Show", month: "August", description: "Showcases the Enga people's elaborate ceremonial dress with possum fur, shells, and Bird of Paradise plumes in competitive sing-sing.", type: "festival" },
    { name: "Lai River Festival", month: "March", description: "Celebrates the sacred Lai River with water blessing rituals and traditional Enga storytelling.", type: "ritual" },
  ],
  "southern-highlands": [
    { name: "Mendi Cultural Festival", month: "July", description: "Highlands warriors from Mendi and surrounding districts perform traditional war dances and Moka exchange ceremonies.", type: "festival" },
    { name: "Pearl Show", month: "August", description: "Named for the pearlescent pig fat used in body decoration, celebrating the wealth and trade traditions of Southern Highlands clans.", type: "ceremony" },
  ],
  "chimbu": [
    { name: "Kundiawa Singsing", month: "September", description: "Chimbu (Simbu) dancers perform the distinctive kunai grass skirt dances unique to the rugged Wahgi-Sepik divide people.", type: "festival" },
    { name: "Mount Wilhelm Challenge", month: "May", description: "Combines adventure trekking with cultural celebration, honoring the spirits of PNG's highest peak.", type: "ceremony" },
  ],
  "jiwaka": [
    { name: "Wahgi Valley Festival", month: "August", description: "Celebrating Jiwaka's rich agricultural heritage and Melpa cultural traditions with singsing groups from across the Wahgi Valley.", type: "festival" },
    { name: "Minj Flower Festival", month: "July", description: "Known for spectacular floral displays incorporating traditional highland decorations, celebrating the valley's fertility.", type: "festival" },
  ],
  "madang": [
    { name: "Madang Festival", month: "June", description: "The 'Prettiest Town' festival celebrating Madang's coastal and highland diversity with canoe races and traditional dancing.", type: "festival" },
    { name: "Kalam Cultural Gathering", month: "April", description: "The Kalam people of the Schrader Range perform bird-of-paradise dances and forest ritual ceremonies.", type: "ceremony" },
  ],
  "east-sepik": [
    { name: "Sepik River Crocodile Festival", month: "August", description: "Young men of the Sepik undergo the sacred crocodile scarification initiation rite — a coming-of-age ceremony representing the power of the ancestral crocodile spirit.", type: "ritual" },
    { name: "Wewak Cultural Week", month: "September", description: "Celebrates Sepik art, including famous spirit house (haus tambaran) traditions, carving, and woven sago-palm ceremonial masks.", type: "festival" },
  ],
  "sandaun": [
    { name: "Green River Cultural Festival", month: "October", description: "Remote West Sepik communities gather to share traditional healing ceremonies and flute music of the Telefomin highlands.", type: "festival" },
    { name: "Telefomin Initiation", month: "Varies", description: "Sacred male initiation rites held deep in the Star Mountains, connecting young men to ancestral spirit houses.", type: "ritual" },
  ],
  "morobe": [
    { name: "Morobe Show", month: "October", description: "Lae's annual showcase combining industrial exhibitions with traditional Huon Gulf and Finschhafen tribal dances.", type: "festival" },
    { name: "Tami Islands Canoe Race", month: "November", description: "Traditional Tami carved canoe races and exchange ceremonies honoring the master carvers of Huon Gulf.", type: "ceremony" },
  ],
  "manus": [
    { name: "Manus Cultural Festival", month: "August", description: "Island communities from across the Admiralty Islands gather for traditional canoe sailing, shell money ceremonies, and Usiai and Matankor dances.", type: "festival" },
    { name: "Lou Island Obsidian Festival", month: "May", description: "Celebrates the ancient obsidian trading network of Manus, honoring ancestral trade routes across the Pacific.", type: "ceremony" },
  ],
  "new-ireland": [
    { name: "Malagan Festival", month: "July", description: "The sacred Malagan ceremony features elaborate carved masks and sculptures used to honor the dead and transmit clan knowledge across generations.", type: "ritual" },
    { name: "Kavieng Festival", month: "September", description: "Celebrates New Ireland's German colonial history alongside traditional Lihir and Nalik cultural ceremonies.", type: "festival" },
  ],
  "east-new-britain": [
    { name: "Mask Festival", month: "July", description: "The spectacular Tolai Warwagira features Dukduk and Tubuan masked figures — powerful ancestral spirits that emerge from the sea to enforce tradition.", type: "festival" },
    { name: "Frangipani Festival", month: "November", description: "Rabaul's iconic cultural celebration combining Tolai traditional music, Pomio arts, and Baining fire dancers.", type: "festival" },
  ],
  "west-new-britain": [
    { name: "Kandrian Cultural Festival", month: "August", description: "Remote Arawe and Kilenge communities celebrate with traditional outrigger canoe racing and ancestral carving ceremonies.", type: "festival" },
    { name: "Baining Fire Dance", month: "Varies", description: "The extraordinary Baining fire dance, performed at night, where dancers leap through flames wearing giant masks representing forest spirits.", type: "ritual" },
  ],
  "north-solomons": [
    { name: "Bougainville Cultural Festival", month: "August", description: "Celebrates the unique culture of Bougainville's people — Nasioi, Nagovisi, Rotokas — with traditional music, carving, and Konnou dancing.", type: "festival" },
    { name: "Panguna Peace Festival", month: "November", description: "Marking the peace after the Bougainville conflict, communities gather to share stories of reconciliation and cultural renewal.", type: "ceremony" },
  ],
  "gulf": [
    { name: "Gulf Hiri Festival", month: "October", description: "Commemorates the ancient Hiri trade voyages where Motuan sailors crossed the Gulf of Papua in great lakatoi canoes to trade with Gulf Province communities.", type: "festival" },
    { name: "Kerema Sing-Sing", month: "September", description: "Elema and Toaripi people perform traditional canoe-building ceremonies and bullroarer rituals on the Gulf coast.", type: "ceremony" },
  ],
  "western": [
    { name: "Fly River Festival", month: "July", description: "Communities along the mighty Fly River gather to celebrate with traditional dugout canoe races and Gogodala geometric art displays.", type: "festival" },
    { name: "Gogodala Cultural Ceremony", month: "October", description: "The Gogodala people of Lake Murray perform elaborate canoe painting ceremonies using ancient clan geometric patterns.", type: "ritual" },
  ],
  "central": [
    { name: "Hiri Moale Festival", month: "September", description: "Port Moresby's most beloved festival re-enacts the ancient Hiri trade voyages. Moale girls compete for the Hiri Queen title in full traditional bilas.", type: "festival" },
    { name: "Tatana Island Festival", month: "June", description: "The Motu-Koitabu sea people celebrate on Tatana Island with traditional lakatoi canoe races and Motu cultural ceremonies.", type: "festival" },
  ],
  "national-capital": [
    { name: "Port Moresby Show", month: "June", description: "The Queen's Birthday Show — a major urban cultural celebration mixing PNG's 851 language groups in the nation's capital.", type: "festival" },
    { name: "Unity Day Sing-Sing", month: "September", description: "Independence Week celebrations featuring cultural performances from all 22 provinces converging on Waigani.", type: "ceremony" },
  ],
  "milne-bay": [
    { name: "Kenu & Kundu Festival", month: "November", description: "Milne Bay's famous canoe (kenu) and drum (kundu) festival at Alotau, celebrating the seafaring Massim people's culture with traditional dancing and canoe racing.", type: "festival" },
    { name: "Kiriwina Harvest Festival", month: "August", description: "The Trobriand Islands celebrate the yam harvest with Milamala festivities, traditional dancing, and elaborate yam house displays.", type: "ritual" },
  ],
  "oro": [
    { name: "Northern Festival of Arts", month: "July", description: "Oro Province celebrates Orokaiva culture with fire-walking, tapa cloth making, and the dramatic pig tusker ceremony.", type: "festival" },
    { name: "Kokoda Track Memorial", month: "July", description: "Honors the WWII Kokoda Campaign with traditional Orokaiva ceremonies of respect and remembrance.", type: "ceremony" },
  ],
};

export const PROVINCE_DANCE: Record<string, DanceStyle> = {
  "hela": { name: "Huli Wigman Jump Dance", type: "highlands", description: "Huli warriors leap with powerful drumbeat pulses, their ceremonial wigs bobbing with each precise jump" },
  "enga": { name: "Enga War Dance", type: "highlands", description: "Synchronized warriors advance and retreat in waves, marking clan boundaries with powerful stamping" },
  "southern-highlands": { name: "Mendi Moka Dance", type: "highlands", description: "Wealth exchange ceremony dances celebrating pig-fat body decoration and pearl shell ornaments" },
  "chimbu": { name: "Simbu Warrior Dance", type: "highlands", description: "Fast-footed circle dances in kunai grass skirts performed on steep mountain ridgelines" },
  "western-highlands": { name: "Melpa Singsing", type: "highlands", description: "Thousands of Melpa warriors perform in unison at Mount Hagen — the world's greatest cultural show" },
  "eastern-highlands": { name: "Goroka Show Dance", type: "highlands", description: "Over 100 tribes converge for the famous Goroka Singsing — a kaleidoscope of feathers, paint, and song" },
  "jiwaka": { name: "Wahgi Valley Dance", type: "highlands", description: "Wahgi Valley dancers celebrate with flowing kunai grass skirts in the fertile valley floor ceremonies" },
  "madang": { name: "Madang Coastal Dance", type: "sepik", description: "Drumming-led dances blend Highlands and coastal traditions along the stunning Madang coastline" },
  "east-sepik": { name: "Sepik Spirit Dance", type: "sepik", description: "Sepik River peoples channel crocodile ancestors in powerful initiation dances outside the haus tambaran" },
  "sandaun": { name: "Telefomin Forest Dance", type: "sepik", description: "Remote Star Mountain communities perform sacred flute dances in deep jungle clearings at dawn" },
  "morobe": { name: "Huon Gulf Dance", type: "southern", description: "Finschhafen and Lae communities perform ceremonial dances honoring ancestral Tami Island trading voyages" },
  "manus": { name: "Admiralty Island Dance", type: "islands", description: "Manus sea people dance in elaborate shell money necklaces, re-enacting ancient Pacific trade voyages" },
  "new-ireland": { name: "Malagan Mask Dance", type: "islands", description: "Sacred Malagan-masked figures glide through village clearings at dusk, honoring the ancestors" },
  "east-new-britain": { name: "Dukduk Tubuan Dance", type: "islands", description: "Tolai Dukduk masked spirits emerge from the sea at dawn in the most sacred ceremony of New Britain" },
  "west-new-britain": { name: "Baining Fire Dance", type: "islands", description: "Baining dancers leap through roaring bonfires wearing giant bark-cloth masks representing forest spirits" },
  "north-solomons": { name: "Bougainville Konnou", type: "islands", description: "Bougainville's circular Konnou dance builds to a crescendo as dancers spin in traditional shell ornaments" },
  "gulf": { name: "Hiri Lakatoi Dance", type: "southern", description: "Gulf communities re-enact the great Hiri trade voyages with canoe-paddle movements on the beach" },
  "western": { name: "Gogodala Canoe Dance", type: "southern", description: "Lake Murray communities perform on painted canoes, their geometric art patterns alive in the water's reflection" },
  "central": { name: "Motu Hiri Dance", type: "southern", description: "Motu women in traditional grass skirts celebrate the Hiri voyage return with the iconic Moale dance" },
  "national-capital": { name: "Waigani Unity Singsing", type: "southern", description: "All 851 language groups converge on Port Moresby in the greatest celebration of Papua New Guinean nationhood" },
  "milne-bay": { name: "Massim Canoe Dance", type: "southern", description: "Trobriand and Massim seafarers dance around elaborately carved prow boards in the Kenu festival dawn ceremony" },
  "oro": { name: "Orokaiva Tapa Dance", type: "southern", description: "Orokaiva warriors in tapa cloth robes perform fire-walking ceremonies honoring ancestral warrior spirits" },
};
