export type StoreItemId = string;
export type StoreItemCategory = "card_back" | "avatar" | "effect" | "title" | "frame";

export interface StoreItem {
  id: StoreItemId;
  category: StoreItemCategory;
  name: string;
  description: string;
  price: number;
  preview: string;
  previewColor: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  isDefault?: boolean;
  backColors?: string[];
  backAccent?: string;
  backPattern?: "diamonds" | "stars" | "circles" | "crosses" | "waves" | "hexagons";
}

// ═══════════════════════════════════════════════════════════════
// CARD BACKS — 30 total
// ═══════════════════════════════════════════════════════════════
export const CARD_BACKS: StoreItem[] = [
  // COMMON (7)
  { id: "back_default",   category: "card_back", name: "Clásico Azul",    description: "El dorso clásico del casino.",                    price: 0,   preview: "card", previewColor: "#1A3A6A", rarity: "common",    isDefault: true, backColors: ["#1E4080","#0e2248","#0a1832"], backAccent: "#D4AF37", backPattern: "diamonds" },
  { id: "back_crimson",   category: "card_back", name: "Carmesí",         description: "Rojo profundo. Audaz y dominante.",               price: 60,  preview: "card", previewColor: "#8B0000", rarity: "common",    backColors: ["#8B0000","#C0392B","#6B0000"], backAccent: "#FFD700", backPattern: "diamonds" },
  { id: "back_emerald",   category: "card_back", name: "Esmeralda",       description: "Verde intenso del jugador natural.",              price: 75,  preview: "card", previewColor: "#0B5A3E", rarity: "common",    backColors: ["#0B5A3E","#1A7A5A","#0A3D2A"], backAccent: "#D4AF37", backPattern: "diamonds" },
  { id: "back_copper",    category: "card_back", name: "Cobre",           description: "Cálido y terroso. Clásico de las plazas.",        price: 50,  preview: "card", previewColor: "#B87333", rarity: "common",    backColors: ["#B87333","#8B5E3C","#7A4A2A"], backAccent: "#FFD700", backPattern: "circles" },
  { id: "back_forest",    category: "card_back", name: "Bosque",          description: "Naturaleza salvaje en cada carta.",               price: 55,  preview: "card", previewColor: "#1A4A1A", rarity: "common",    backColors: ["#1A4A1A","#2D6A2D","#143014"], backAccent: "#90EE90", backPattern: "circles" },
  { id: "back_sunset",    category: "card_back", name: "Atardecer",       description: "Naranja y rosa del crepúsculo.",                  price: 65,  preview: "card", previewColor: "#C0582A", rarity: "common",    backColors: ["#C0582A","#E07040","#A04020"], backAccent: "#FFE680", backPattern: "waves" },
  { id: "back_vintage",   category: "card_back", name: "Vintage",         description: "Sepia antiguo. Aspecto de época.",                price: 70,  preview: "card", previewColor: "#8B7355", rarity: "common",    backColors: ["#6B5335","#8B7355","#4A3020"], backAccent: "#D4C090", backPattern: "crosses" },
  // RARE (10)
  { id: "back_gold",      category: "card_back", name: "Oro Real",        description: "Dorado brillante. Solo para élites.",             price: 100, preview: "card", previewColor: "#B8860B", rarity: "rare",      backColors: ["#B8860B","#D4AF37","#8B6914"], backAccent: "#1a0a00", backPattern: "diamonds" },
  { id: "back_midnight",  category: "card_back", name: "Medianoche",      description: "Negro absoluto con destellos plateados.",         price: 120, preview: "card", previewColor: "#0D0D1A", rarity: "rare",      backColors: ["#0D0D1A","#1a1a2e","#080810"], backAccent: "#C0C0C0", backPattern: "stars" },
  { id: "back_ocean",     category: "card_back", name: "Océano",          description: "Profundidades marinas con olas de luz.",          price: 90,  preview: "card", previewColor: "#006994", rarity: "rare",      backColors: ["#003D6B","#006994","#00A8CC"], backAccent: "#7FDFFF", backPattern: "waves" },
  { id: "back_arctic",    category: "card_back", name: "Ártico",          description: "Blanco glacial. Frío como el hielo.",             price: 110, preview: "card", previewColor: "#B8DDEF", rarity: "rare",      backColors: ["#8EC8E8","#B8DDEF","#6AAAC8"], backAccent: "#FFFFFF", backPattern: "diamonds" },
  { id: "back_amethyst",  category: "card_back", name: "Amatista",        description: "Violeta gemológico. Misterioso y profundo.",      price: 115, preview: "card", previewColor: "#7B3FA0", rarity: "rare",      backColors: ["#4B1F6A","#7B3FA0","#3A1550"], backAccent: "#DDA0FF", backPattern: "hexagons" },
  { id: "back_sakura",    category: "card_back", name: "Sakura",          description: "Rosa suave de flor de cerezo japonesa.",          price: 105, preview: "card", previewColor: "#E8789A", rarity: "rare",      backColors: ["#D05A7A","#E8789A","#B84060"], backAccent: "#FFF0F5", backPattern: "circles" },
  { id: "back_thunder",   category: "card_back", name: "Trueno",          description: "Amarillo eléctrico que sacude la mesa.",          price: 125, preview: "card", previewColor: "#C8A800", rarity: "rare",      backColors: ["#4A3000","#C8A800","#8A7000"], backAccent: "#FFFF44", backPattern: "crosses" },
  { id: "back_toxic",     category: "card_back", name: "Tóxico",          description: "Verde veneno. Para los más peligrosos.",          price: 130, preview: "card", previewColor: "#44AA00", rarity: "rare",      backColors: ["#1A4400","#44AA00","#228800"], backAccent: "#AAFFAA", backPattern: "hexagons" },
  { id: "back_digital",   category: "card_back", name: "Digital",         description: "Matrix de píxeles. Estilo hacker total.",         price: 135, preview: "card", previewColor: "#00CC44", rarity: "rare",      backColors: ["#001A00","#00CC44","#008822"], backAccent: "#00FF88", backPattern: "crosses" },
  { id: "back_bronze",    category: "card_back", name: "Bronce",          description: "Metal antiguo. Resistente como el jugador.",      price: 95,  preview: "card", previewColor: "#8C6A2A", rarity: "rare",      backColors: ["#6A4A1A","#8C6A2A","#4A3010"], backAccent: "#D4A060", backPattern: "diamonds" },
  // EPIC (8)
  { id: "back_ruby",      category: "card_back", name: "Rubí",            description: "La gema más codiciada en la mesa.",              price: 150, preview: "card", previewColor: "#9B111E", rarity: "epic",      backColors: ["#9B111E","#CC2936","#7A0C17"], backAccent: "#FFB3BA", backPattern: "hexagons" },
  { id: "back_obsidian",  category: "card_back", name: "Obsidiana",       description: "Piedra volcánica. Fría y amenazante.",            price: 160, preview: "card", previewColor: "#1C1C1C", rarity: "epic",      backColors: ["#111111","#2D2D2D","#1C1C1C"], backAccent: "#FF6B00", backPattern: "hexagons" },
  { id: "back_neon",      category: "card_back", name: "Neón",            description: "Luces de la ciudad de noche. Brillante.",        price: 180, preview: "card", previewColor: "#FF00FF", rarity: "epic",      backColors: ["#1A001A","#440044","#220022"], backAccent: "#FF00FF", backPattern: "circles" },
  { id: "back_aurora",    category: "card_back", name: "Aurora Boreal",   description: "Luces del norte bailando en tus cartas.",        price: 190, preview: "card", previewColor: "#006688", rarity: "epic",      backColors: ["#001A20","#006688","#00AA88"], backAccent: "#00FFCC", backPattern: "waves" },
  { id: "back_blood",     category: "card_back", name: "Sangre",          description: "Profundo rojo carmín. Para los valientes.",      price: 175, preview: "card", previewColor: "#6B0000", rarity: "epic",      backColors: ["#1A0000","#6B0000","#330000"], backAccent: "#FF2222", backPattern: "hexagons" },
  { id: "back_void",      category: "card_back", name: "El Vacío",        description: "Oscuridad absoluta. Nada lo puede detener.",     price: 200, preview: "card", previewColor: "#0A0010", rarity: "epic",      backColors: ["#000000","#0A0010","#05000A"], backAccent: "#8800FF", backPattern: "stars" },
  { id: "back_hurricane", category: "card_back", name: "Huracán",         description: "Vórtice de poder azul-gris devastador.",         price: 185, preview: "card", previewColor: "#4488AA", rarity: "epic",      backColors: ["#1A2A3A","#4488AA","#2A5A7A"], backAccent: "#AADDFF", backPattern: "circles" },
  { id: "back_plasma",    category: "card_back", name: "Plasma",          description: "Energía pura concentrada en tus manos.",         price: 195, preview: "card", previewColor: "#FF4400", rarity: "epic",      backColors: ["#1A0800","#FF4400","#AA2200"], backAccent: "#FFAA44", backPattern: "hexagons" },
  // LEGENDARY (5)
  { id: "back_crystal",   category: "card_back", name: "Cristal",         description: "Holográfico. Reflejos de todos los colores.",    price: 200, preview: "card", previewColor: "#4FC3F7", rarity: "legendary", backColors: ["#00B4DB","#4FC3F7","#0083B0"], backAccent: "#FFFFFF", backPattern: "hexagons" },
  { id: "back_galaxy",    category: "card_back", name: "Galaxia",         description: "El universo entero en tus manos.",               price: 220, preview: "card", previewColor: "#2C0066", rarity: "legendary", backColors: ["#0A0020","#2C0066","#1a0040"], backAccent: "#A855F7", backPattern: "stars" },
  { id: "back_inferno",   category: "card_back", name: "Infierno",        description: "Solo para los que no le temen al fuego.",        price: 280, preview: "card", previewColor: "#7C0000", rarity: "legendary", backColors: ["#1A0000","#7C0000","#CC3300"], backAccent: "#FF6600", backPattern: "hexagons" },
  { id: "back_prism",     category: "card_back", name: "Prisma",          description: "Arcoíris fraccionado. Único e irrepetible.",     price: 300, preview: "card", previewColor: "#FF6688", rarity: "legendary", backColors: ["#330022","#880044","#220033"], backAccent: "#FF88FF", backPattern: "hexagons" },
  { id: "back_shadow",    category: "card_back", name: "Sombra",          description: "La oscuridad que consume todo a su paso.",       price: 320, preview: "card", previewColor: "#0A0A14", rarity: "legendary", backColors: ["#000000","#0A0A14","#04040C"], backAccent: "#4400AA", backPattern: "stars" },
  { id: "back_divine",    category: "card_back", name: "Divino",          description: "Toca lo sagrado. Nadie más puede igualarlo.",    price: 380, preview: "card", previewColor: "#CCAA00", rarity: "legendary", backColors: ["#1A1400","#CCAA00","#886600"], backAccent: "#FFFFFF", backPattern: "diamonds" },
];

// ═══════════════════════════════════════════════════════════════
// AVATARS — 40 total
// ═══════════════════════════════════════════════════════════════
export const AVATARS: StoreItem[] = [
  // COMMON (7)
  { id: "avatar_knight",    category: "avatar", name: "Caballero",       description: "Valiente guerrero de la mesa.",                  price: 0,   preview: "shield",         previewColor: "#95A5A6", rarity: "common",    isDefault: true },
  { id: "avatar_merchant",  category: "avatar", name: "Mercader",        description: "Siempre con el mejor trato.",                    price: 30,  preview: "bag",            previewColor: "#8B7355", rarity: "common" },
  { id: "avatar_scholar",   category: "avatar", name: "Erudito",         description: "Conoce cada regla de memoria.",                  price: 30,  preview: "book",           previewColor: "#4A90D9", rarity: "common" },
  { id: "avatar_explorer",  category: "avatar", name: "Explorador",      description: "Aventurero sin fronteras.",                      price: 25,  preview: "compass",        previewColor: "#8B6914", rarity: "common" },
  { id: "avatar_chef",      category: "avatar", name: "Chef",            description: "Mezcla los ingredientes perfectos.",             price: 25,  preview: "restaurant",     previewColor: "#E74C3C", rarity: "common" },
  { id: "avatar_athlete",   category: "avatar", name: "Atleta",          description: "Siempre en la cima de su juego.",                price: 30,  preview: "fitness",        previewColor: "#27AE60", rarity: "common" },
  { id: "avatar_pilot",     category: "avatar", name: "Piloto",          description: "Controla el rumbo con precisión.",               price: 35,  preview: "airplane",       previewColor: "#1A8FC1", rarity: "common" },
  // RARE (15)
  { id: "avatar_wizard",    category: "avatar", name: "Mago",            description: "Maestro de la magia de cartas.",                 price: 60,  preview: "sparkles",       previewColor: "#9B59B6", rarity: "rare" },
  { id: "avatar_samurai",   category: "avatar", name: "Samurái",         description: "Honor y disciplina ante todo.",                  price: 70,  preview: "cut",            previewColor: "#E74C3C", rarity: "rare" },
  { id: "avatar_pirate",    category: "avatar", name: "Pirata",          description: "El riesgo es su apellido.",                      price: 80,  preview: "skull",          previewColor: "#2C3E50", rarity: "rare" },
  { id: "avatar_detective", category: "avatar", name: "Detective",       description: "Siempre un paso adelante.",                      price: 80,  preview: "search",         previewColor: "#7B5E3A", rarity: "rare" },
  { id: "avatar_bard",      category: "avatar", name: "Bardo",           description: "Las canciones inspiran a todos.",                price: 65,  preview: "musical-notes",  previewColor: "#E67E22", rarity: "rare" },
  { id: "avatar_ranger",    category: "avatar", name: "Guardabosques",   description: "Preciso como una flecha.",                       price: 70,  preview: "leaf",           previewColor: "#27AE60", rarity: "rare" },
  { id: "avatar_paladin",   category: "avatar", name: "Paladín",         description: "Fe y acero en partes iguales.",                  price: 75,  preview: "shield-checkmark", previewColor: "#F1C40F", rarity: "rare" },
  { id: "avatar_alchemist", category: "avatar", name: "Alquimista",      description: "Transforma la derrota en victoria.",             price: 80,  preview: "flask",          previewColor: "#9B59B6", rarity: "rare" },
  { id: "avatar_bounty",    category: "avatar", name: "Cazarrecompensas",description: "Siempre consigue su objetivo.",                  price: 85,  preview: "locate",         previewColor: "#E74C3C", rarity: "rare" },
  { id: "avatar_spy",       category: "avatar", name: "Espía",           description: "Nadie sabe quién es realmente.",                 price: 90,  preview: "eye",            previewColor: "#2C3E50", rarity: "rare" },
  { id: "avatar_vampire",   category: "avatar", name: "Vampiro",         description: "Inmortal y sediento de victorias.",              price: 85,  preview: "moon",           previewColor: "#6B0000", rarity: "rare" },
  { id: "avatar_werewolf",  category: "avatar", name: "Hombre Lobo",     description: "Luna llena o no, siempre gana.",                 price: 90,  preview: "paw",            previewColor: "#8B7355", rarity: "rare" },
  { id: "avatar_trickster", category: "avatar", name: "Embaucador",      description: "Sonríe aunque esté perdiendo.",                  price: 75,  preview: "happy",          previewColor: "#E67E22", rarity: "rare" },
  { id: "avatar_shaman",    category: "avatar", name: "Chamán",          description: "En contacto con fuerzas más allá.",              price: 85,  preview: "rainy",          previewColor: "#1A8FC1", rarity: "rare" },
  { id: "avatar_rogue",     category: "avatar", name: "Pícaro",          description: "Ágil, astuto e impredecible.",                   price: 80,  preview: "eye-off",        previewColor: "#2C3E50", rarity: "rare" },
  // EPIC (12)
  { id: "avatar_ninja",     category: "avatar", name: "Ninja",           description: "Silencioso y letal. Te sorprende.",              price: 100, preview: "eye-off",        previewColor: "#2C3E50", rarity: "epic" },
  { id: "avatar_dragon",    category: "avatar", name: "Dragón",          description: "Poder y fuego indomable.",                       price: 150, preview: "flame",          previewColor: "#E67E22", rarity: "epic" },
  { id: "avatar_gladiator", category: "avatar", name: "Gladiador",       description: "Nació para el combate.",                         price: 140, preview: "trophy",         previewColor: "#C0392B", rarity: "epic" },
  { id: "avatar_cyber",     category: "avatar", name: "Cyber",           description: "Inteligencia artificial al servicio del juego.", price: 180, preview: "hardware-chip",  previewColor: "#00D4FF", rarity: "epic" },
  { id: "avatar_titan",     category: "avatar", name: "Titán",           description: "Colosal. Aplasta la competencia.",               price: 160, preview: "barbell",        previewColor: "#7F8C8D", rarity: "epic" },
  { id: "avatar_oracle",    category: "avatar", name: "Oráculo",         description: "Ve el futuro antes de que suceda.",              price: 170, preview: "eye",            previewColor: "#9B59B6", rarity: "epic" },
  { id: "avatar_berserker", category: "avatar", name: "Berserker",       description: "Cuando pierde el control, arrasa todo.",         price: 155, preview: "flash",          previewColor: "#C0392B", rarity: "epic" },
  { id: "avatar_sorcerer",  category: "avatar", name: "Hechicero",       description: "Controla el tiempo y el destino.",               price: 165, preview: "planet",         previewColor: "#6C3483", rarity: "epic" },
  { id: "avatar_warlord",   category: "avatar", name: "Señor de la Guerra", description: "Comanda ejércitos de cartas.",               price: 175, preview: "people",         previewColor: "#C0392B", rarity: "epic" },
  { id: "avatar_assassin",  category: "avatar", name: "Asesino",         description: "Una jugada, una victoria.",                      price: 180, preview: "warning",        previewColor: "#1C1C1C", rarity: "epic" },
  { id: "avatar_guardian",  category: "avatar", name: "Guardián",        description: "Protege su mano hasta el final.",                price: 150, preview: "shield",         previewColor: "#1A8FC1", rarity: "epic" },
  { id: "avatar_sharpshooter", category: "avatar", name: "Francotirador", description: "Preciso. Calculador. Letal.",                  price: 160, preview: "locate",         previewColor: "#2C3E50", rarity: "epic" },
  // LEGENDARY (6)
  { id: "avatar_phoenix",   category: "avatar", name: "Fénix",           description: "Renace más fuerte con cada derrota.",            price: 280, preview: "sunny",          previewColor: "#D4AF37", rarity: "legendary" },
  { id: "avatar_reaper",    category: "avatar", name: "Segador",         description: "La muerte misma en la mesa.",                    price: 300, preview: "moon",           previewColor: "#1a0020", rarity: "legendary" },
  { id: "avatar_king",      category: "avatar", name: "El Rey",          description: "Por encima de todos. Sin discusión.",            price: 350, preview: "diamond",        previewColor: "#D4AF37", rarity: "legendary" },
  { id: "avatar_god_cards", category: "avatar", name: "Dios de las Cartas", description: "Trasciende el juego. Es el juego.",          price: 400, preview: "star",           previewColor: "#D4AF37", rarity: "legendary" },
  { id: "avatar_celestial", category: "avatar", name: "Celestial",       description: "De otro plano de existencia.",                   price: 380, preview: "planet",         previewColor: "#4FC3F7", rarity: "legendary" },
  { id: "avatar_chaos",     category: "avatar", name: "El Caos",         description: "Impredecible. Imposible de parar.",              price: 420, preview: "infinite",       previewColor: "#A855F7", rarity: "legendary" },
];

// ═══════════════════════════════════════════════════════════════
// AVATAR FRAMES — 20 total
// ═══════════════════════════════════════════════════════════════
export const AVATAR_FRAMES: StoreItem[] = [
  // COMMON (4)
  { id: "frame_gold",     category: "frame", name: "Marco Dorado",     description: "Brilla como un campeón.",                         price: 0,   preview: "ellipse", previewColor: "#D4AF37", rarity: "common",    isDefault: true, backColors: ["#D4AF37","#B8860B"] },
  { id: "frame_silver",   category: "frame", name: "Marco Plateado",   description: "Elegancia clásica y discreta.",                   price: 40,  preview: "ellipse", previewColor: "#C0C0C0", rarity: "common",    backColors: ["#C0C0C0","#909090"] },
  { id: "frame_copper",   category: "frame", name: "Marco Cobre",      description: "Cálido y brillante.",                             price: 35,  preview: "ellipse", previewColor: "#B87333", rarity: "common",    backColors: ["#B87333","#8B5E3C"] },
  { id: "frame_bronze",   category: "frame", name: "Marco Bronce",     description: "Metal antiguo del coliseo.",                      price: 45,  preview: "ellipse", previewColor: "#8C6A2A", rarity: "common",    backColors: ["#8C6A2A","#6A4A1A"] },
  // RARE (8)
  { id: "frame_emerald",  category: "frame", name: "Marco Esmeralda",  description: "Verde brillante del jugador natural.",            price: 70,  preview: "ellipse", previewColor: "#27AE60", rarity: "rare",      backColors: ["#27AE60","#1A7A3C"] },
  { id: "frame_crimson",  category: "frame", name: "Marco Carmesí",    description: "Rojo ardiente. Señal de peligro.",                price: 80,  preview: "ellipse", previewColor: "#C0392B", rarity: "rare",      backColors: ["#C0392B","#8B0000"] },
  { id: "frame_ocean",    category: "frame", name: "Marco Océano",     description: "Profundo y misterioso como el mar.",              price: 90,  preview: "ellipse", previewColor: "#006994", rarity: "rare",      backColors: ["#0083B0","#00B4DB"] },
  { id: "frame_neon",     category: "frame", name: "Marco Neón",       description: "Ilumina la mesa entera.",                         price: 100, preview: "ellipse", previewColor: "#FF00FF", rarity: "rare",      backColors: ["#FF00FF","#AA00AA"] },
  { id: "frame_sakura",   category: "frame", name: "Marco Sakura",     description: "Delicado como pétalos de cerezo.",                price: 95,  preview: "ellipse", previewColor: "#E8789A", rarity: "rare",      backColors: ["#E8789A","#B84060"] },
  { id: "frame_thunder",  category: "frame", name: "Marco Trueno",     description: "Eléctrico y poderoso.",                           price: 110, preview: "ellipse", previewColor: "#C8A800", rarity: "rare",      backColors: ["#C8A800","#8A7000"] },
  { id: "frame_toxic",    category: "frame", name: "Marco Tóxico",     description: "Verde veneno. Aviso de peligro.",                 price: 105, preview: "ellipse", previewColor: "#44AA00", rarity: "rare",      backColors: ["#44AA00","#228800"] },
  { id: "frame_marble",   category: "frame", name: "Marco Mármol",     description: "Piedra blanca pulida. Sofisticado.",              price: 85,  preview: "ellipse", previewColor: "#DDDDDD", rarity: "rare",      backColors: ["#CCCCCC","#FFFFFF"] },
  // EPIC (5)
  { id: "frame_fire",     category: "frame", name: "Marco Fuego",      description: "Ardiente y dominante.",                           price: 150, preview: "ellipse", previewColor: "#E67E22", rarity: "epic",      backColors: ["#FF4500","#FF8C00"] },
  { id: "frame_galaxy",   category: "frame", name: "Marco Galaxia",    description: "El cosmos en tu avatar.",                         price: 200, preview: "ellipse", previewColor: "#A855F7", rarity: "epic",      backColors: ["#6B21A8","#A855F7"] },
  { id: "frame_void",     category: "frame", name: "Marco Vacío",      description: "Oscuridad que lo rodea todo.",                    price: 180, preview: "ellipse", previewColor: "#220044", rarity: "epic",      backColors: ["#000000","#220044"] },
  { id: "frame_aurora",   category: "frame", name: "Marco Aurora",     description: "Luces boreales eternamente bailando.",            price: 190, preview: "ellipse", previewColor: "#00AABB", rarity: "epic",      backColors: ["#006688","#00FFCC"] },
  { id: "frame_crystal2", category: "frame", name: "Marco Cristal",    description: "Transparente y brillante como diamante.",         price: 210, preview: "ellipse", previewColor: "#88DDFF", rarity: "epic",      backColors: ["#4FC3F7","#AAEEFF"] },
  // LEGENDARY (3)
  { id: "frame_diamond",  category: "frame", name: "Marco Diamante",   description: "El más raro y brillante de todos.",               price: 320, preview: "ellipse", previewColor: "#4FC3F7", rarity: "legendary", backColors: ["#00B4DB","#A855F7"] },
  { id: "frame_chaos",    category: "frame", name: "Marco Caos",       description: "Cambia de color. Nunca el mismo dos veces.",      price: 380, preview: "ellipse", previewColor: "#FF44FF", rarity: "legendary", backColors: ["#AA00FF","#FF0088"] },
  { id: "frame_divine",   category: "frame", name: "Marco Divino",     description: "Para el jugador que trasciende el juego.",        price: 420, preview: "ellipse", previewColor: "#FFEEAA", rarity: "legendary", backColors: ["#D4AF37","#FFFFFF"] },
];

// ═══════════════════════════════════════════════════════════════
// TITLES — 35 total
// ═══════════════════════════════════════════════════════════════
export const TITLES: StoreItem[] = [
  // COMMON (9)
  { id: "title_novice",      category: "title", name: "Novato",              description: "El inicio del camino.",                       price: 0,   preview: "person",       previewColor: "#95A5A6", rarity: "common",    isDefault: true },
  { id: "title_rookie",      category: "title", name: "Recién Llegado",      description: "Aún aprendiendo.",                            price: 15,  preview: "walk",         previewColor: "#7F8C8D", rarity: "common" },
  { id: "title_regular",     category: "title", name: "Jugador Regular",     description: "Ya conoces el terreno.",                      price: 25,  preview: "card",         previewColor: "#95A5A6", rarity: "common" },
  { id: "title_wanderer",    category: "title", name: "Vagabundo",           description: "Juega donde lo llevan las cartas.",           price: 20,  preview: "navigate",     previewColor: "#8B7355", rarity: "common" },
  { id: "title_veteran",     category: "title", name: "Veterano",            description: "Muchas batallas en la espalda.",              price: 30,  preview: "medal",        previewColor: "#95A5A6", rarity: "common" },
  { id: "title_survivor",    category: "title", name: "Superviviente",       description: "Cae pero siempre se levanta.",                price: 30,  preview: "flash",        previewColor: "#E67E22", rarity: "common" },
  { id: "title_drifter",     category: "title", name: "Trotamundos",         description: "De mesa en mesa, ganando siempre.",           price: 25,  preview: "airplane",     previewColor: "#1A8FC1", rarity: "common" },
  { id: "title_gambler",     category: "title", name: "Apostador",           description: "Todo o nada en cada jugada.",                 price: 35,  preview: "cash",         previewColor: "#D4AF37", rarity: "common" },
  { id: "title_casual",      category: "title", name: "Casual",              description: "Juega por diversión, no por ganar.",         price: 15,  preview: "happy",        previewColor: "#27AE60", rarity: "common" },
  // RARE (12)
  { id: "title_pro",         category: "title", name: "Profesional",         description: "Dominas las cartas.",                         price: 50,  preview: "ribbon",       previewColor: "#2196F3", rarity: "rare" },
  { id: "title_strategist",  category: "title", name: "Estratega",           description: "Cada jugada es calculada.",                   price: 60,  preview: "git-network",  previewColor: "#1A8FC1", rarity: "rare" },
  { id: "title_shark",       category: "title", name: "Tiburón",             description: "Hambriento de victorias.",                    price: 70,  preview: "fish",         previewColor: "#0077B6", rarity: "rare" },
  { id: "title_hustler",     category: "title", name: "Buscavidas",          description: "Siempre encuentra la jugada.",                price: 70,  preview: "navigate",     previewColor: "#27AE60", rarity: "rare" },
  { id: "title_fox",         category: "title", name: "El Zorro",            description: "Astuto e impredecible.",                      price: 65,  preview: "alert-circle", previewColor: "#E67E22", rarity: "rare" },
  { id: "title_predator",    category: "title", name: "Depredador",          description: "Acecha antes de atacar.",                     price: 75,  preview: "eye",          previewColor: "#C0392B", rarity: "rare" },
  { id: "title_trickster",   category: "title", name: "El Tramposo",         description: "Tiene un as en la manga siempre.",            price: 80,  preview: "shuffle",      previewColor: "#9B59B6", rarity: "rare" },
  { id: "title_renegade",    category: "title", name: "Renegado",            description: "No sigue reglas. Las reescribe.",             price: 80,  preview: "alert",        previewColor: "#E74C3C", rarity: "rare" },
  { id: "title_maverick",    category: "title", name: "Maverick",            description: "Independiente. A su propio ritmo.",           price: 75,  preview: "infinite",     previewColor: "#1A8FC1", rarity: "rare" },
  { id: "title_outlaw",      category: "title", name: "Forajido",            description: "Juega fuera de los límites.",                 price: 85,  preview: "close-circle", previewColor: "#C0392B", rarity: "rare" },
  { id: "title_shadow2",     category: "title", name: "La Sombra",           description: "Invisible hasta el golpe final.",             price: 90,  preview: "moon",         previewColor: "#2C3E50", rarity: "rare" },
  { id: "title_comeback",    category: "title", name: "El Comeback",         description: "Nunca lo cuentes fuera.",                     price: 85,  preview: "arrow-up-circle", previewColor: "#27AE60", rarity: "rare" },
  // EPIC (8)
  { id: "title_grandmaster", category: "title", name: "Gran Maestro",        description: "Temido en toda la mesa.",                     price: 130, preview: "medal",        previewColor: "#D4AF37", rarity: "epic" },
  { id: "title_phantom",     category: "title", name: "El Fantasma",         description: "Nadie sabe cómo gana.",                       price: 150, preview: "eye",          previewColor: "#9B59B6", rarity: "epic" },
  { id: "title_ace",         category: "title", name: "El As",               description: "El rey de todas las cartas.",                 price: 160, preview: "star",         previewColor: "#E74C3C", rarity: "epic" },
  { id: "title_overlord",    category: "title", name: "El Señor",            description: "Todos le obedecen en la mesa.",               price: 170, preview: "people",       previewColor: "#6C3483", rarity: "epic" },
  { id: "title_invincible",  category: "title", name: "Invencible",          description: "No ha perdido todavía. ¿Puedes vencerlo?",   price: 180, preview: "shield",       previewColor: "#C0392B", rarity: "epic" },
  { id: "title_dark_lord",   category: "title", name: "Señor Oscuro",        description: "La oscuridad le favorece siempre.",           price: 175, preview: "moon",         previewColor: "#4A235A", rarity: "epic" },
  { id: "title_slayer",      category: "title", name: "El Exterminador",     description: "Sin piedad. Sin derrota.",                    price: 165, preview: "warning",      previewColor: "#E74C3C", rarity: "epic" },
  { id: "title_dominator",   category: "title", name: "Dominador",           description: "Controla la mesa desde el primer turno.",     price: 185, preview: "flash",        previewColor: "#D4AF37", rarity: "epic" },
  // LEGENDARY (6)
  { id: "title_legend",      category: "title", name: "Leyenda Viviente",    description: "Los demás te temen.",                         price: 300, preview: "trophy",       previewColor: "#FFD700", rarity: "legendary" },
  { id: "title_immortal",    category: "title", name: "Inmortal",            description: "No hay quien lo derrote.",                    price: 350, preview: "infinite",     previewColor: "#FF6B6B", rarity: "legendary" },
  { id: "title_god",         category: "title", name: "El Dios",             description: "Trasciende el juego mismo.",                  price: 500, preview: "diamond",      previewColor: "#D4AF37", rarity: "legendary" },
  { id: "title_absolute",    category: "title", name: "El Absoluto",         description: "No hay comparación. Es único.",               price: 450, preview: "star",         previewColor: "#FFFFFF", rarity: "legendary" },
  { id: "title_eternal",     category: "title", name: "Eterno",              description: "Jugará para siempre. Y siempre ganará.",      price: 480, preview: "infinite",     previewColor: "#A855F7", rarity: "legendary" },
  { id: "title_alpha",       category: "title", name: "El Alfa",             description: "El primero. El último. El único.",            price: 550, preview: "flash",        previewColor: "#FF4400", rarity: "legendary" },
];

// ═══════════════════════════════════════════════════════════════
// EFFECTS — 8 total (existing category, visual polish)
// ═══════════════════════════════════════════════════════════════
export const EFFECTS: StoreItem[] = [
  { id: "effect_none",     category: "effect", name: "Sin Efecto",     description: "Juego limpio sin efectos especiales.",            price: 0,   preview: "close-circle",    previewColor: "#95A5A6", rarity: "common",    isDefault: true },
  { id: "effect_sparkle",  category: "effect", name: "Destellos",      description: "Brillo dorado al jugar tus cartas.",              price: 80,  preview: "sparkles",        previewColor: "#D4AF37", rarity: "common" },
  { id: "effect_fire",     category: "effect", name: "Llamas",         description: "Fuego ardiente en cada jugada.",                  price: 120, preview: "flame",           previewColor: "#E74C3C", rarity: "rare" },
  { id: "effect_ice",      category: "effect", name: "Hielo",          description: "Cristales de hielo que congelan el ambiente.",    price: 130, preview: "snow",            previewColor: "#4FC3F7", rarity: "rare" },
  { id: "effect_thunder",  category: "effect", name: "Rayos",          description: "Electricidad pura al cambiar de turno.",          price: 150, preview: "flash",           previewColor: "#F1C40F", rarity: "epic" },
  { id: "effect_smoke",    category: "effect", name: "Humo",           description: "Misteriosa nube de humo en tus jugadas.",         price: 160, preview: "cloud",           previewColor: "#7F8C8D", rarity: "epic" },
  { id: "effect_galaxy",   category: "effect", name: "Galaxia",        description: "Partículas del cosmos brillan al jugar.",         price: 200, preview: "planet",          previewColor: "#A855F7", rarity: "legendary" },
  { id: "effect_rainbow",  category: "effect", name: "Arcoíris",       description: "Colores explosivos en cada carta jugada.",        price: 250, preview: "color-palette",   previewColor: "#FF6B6B", rarity: "legendary" },
];

export const STORE_ITEMS: StoreItem[] = [...CARD_BACKS, ...AVATARS, ...TITLES, ...AVATAR_FRAMES, ...EFFECTS];

export function getItemsByCategory(category: StoreItemCategory): StoreItem[] {
  return STORE_ITEMS.filter((i) => i.category === category);
}

export function getItemById(id: StoreItemId): StoreItem | undefined {
  return STORE_ITEMS.find((i) => i.id === id);
}

export function getCardBackById(id: string): StoreItem {
  return CARD_BACKS.find(b => b.id === id) ?? CARD_BACKS[0];
}
