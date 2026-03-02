export type StoreItemId = string;
export type StoreItemCategory = "card_back" | "avatar" | "effect" | "title";

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
  // Card back design data
  backColors?: string[];
  backAccent?: string;
  backPattern?: "diamonds" | "stars" | "circles" | "crosses" | "waves" | "hexagons";
}

// Card backs — ordered common → legendary
export const CARD_BACKS: StoreItem[] = [
  {
    id: "back_default",
    category: "card_back",
    name: "Clásico Azul",
    description: "El dorso clásico del casino.",
    price: 0, preview: "card", previewColor: "#1A3A6A", rarity: "common", isDefault: true,
    backColors: ["#1E4080", "#0e2248", "#0a1832"], backAccent: "#D4AF37", backPattern: "diamonds",
  },
  {
    id: "back_crimson",
    category: "card_back",
    name: "Carmesí",
    description: "Rojo profundo. Audaz y dominante.",
    price: 60, preview: "card", previewColor: "#8B0000", rarity: "common",
    backColors: ["#8B0000", "#C0392B", "#6B0000"], backAccent: "#FFD700", backPattern: "diamonds",
  },
  {
    id: "back_emerald",
    category: "card_back",
    name: "Esmeralda",
    description: "Verde intenso del jugador natural.",
    price: 75, preview: "card", previewColor: "#0B5A3E", rarity: "common",
    backColors: ["#0B5A3E", "#1A7A5A", "#0A3D2A"], backAccent: "#D4AF37", backPattern: "diamonds",
  },
  {
    id: "back_gold",
    category: "card_back",
    name: "Oro Real",
    description: "Dorado brillante. Solo para élites.",
    price: 100, preview: "card", previewColor: "#B8860B", rarity: "rare",
    backColors: ["#B8860B", "#D4AF37", "#8B6914"], backAccent: "#1a0a00", backPattern: "diamonds",
  },
  {
    id: "back_midnight",
    category: "card_back",
    name: "Medianoche",
    description: "Negro absoluto con destellos plateados.",
    price: 120, preview: "card", previewColor: "#0D0D1A", rarity: "rare",
    backColors: ["#0D0D1A", "#1a1a2e", "#080810"], backAccent: "#C0C0C0", backPattern: "stars",
  },
  {
    id: "back_ocean",
    category: "card_back",
    name: "Océano",
    description: "Profundidades marinas con olas de luz.",
    price: 90, preview: "card", previewColor: "#006994", rarity: "rare",
    backColors: ["#003D6B", "#006994", "#00A8CC"], backAccent: "#7FDFFF", backPattern: "waves",
  },
  {
    id: "back_ruby",
    category: "card_back",
    name: "Rubí",
    description: "La gema más codiciada en la mesa.",
    price: 150, preview: "card", previewColor: "#9B111E", rarity: "epic",
    backColors: ["#9B111E", "#CC2936", "#7A0C17"], backAccent: "#FFB3BA", backPattern: "hexagons",
  },
  {
    id: "back_obsidian",
    category: "card_back",
    name: "Obsidiana",
    description: "Piedra volcánica. Fría y amenazante.",
    price: 160, preview: "card", previewColor: "#1C1C1C", rarity: "epic",
    backColors: ["#111111", "#2D2D2D", "#1C1C1C"], backAccent: "#FF6B00", backPattern: "hexagons",
  },
  {
    id: "back_crystal",
    category: "card_back",
    name: "Cristal",
    description: "Holográfico. Reflejos de todos los colores.",
    price: 200, preview: "card", previewColor: "#4FC3F7", rarity: "legendary",
    backColors: ["#00B4DB", "#4FC3F7", "#0083B0"], backAccent: "#FFFFFF", backPattern: "hexagons",
  },
  {
    id: "back_galaxy",
    category: "card_back",
    name: "Galaxia",
    description: "El universo entero en tus manos.",
    price: 220, preview: "card", previewColor: "#2C0066", rarity: "legendary",
    backColors: ["#0A0020", "#2C0066", "#1a0040"], backAccent: "#A855F7", backPattern: "stars",
  },
  {
    id: "back_inferno",
    category: "card_back",
    name: "Infierno",
    description: "Solo para los que no le temen al fuego.",
    price: 280, preview: "card", previewColor: "#7C0000", rarity: "legendary",
    backColors: ["#1A0000", "#7C0000", "#CC3300"], backAccent: "#FF6600", backPattern: "hexagons",
  },
];

// Avatars — ordered common → legendary
export const AVATARS: StoreItem[] = [
  { id: "avatar_knight", category: "avatar", name: "Caballero", description: "Valiente guerrero de la mesa.", price: 0, preview: "shield", previewColor: "#95A5A6", rarity: "common", isDefault: true },
  { id: "avatar_merchant", category: "avatar", name: "Mercader", description: "Siempre con el mejor trato.", price: 30, preview: "bag", previewColor: "#8B7355", rarity: "common" },
  { id: "avatar_scholar", category: "avatar", name: "Erudito", description: "Conoce cada regla de memoria.", price: 30, preview: "book", previewColor: "#4A90D9", rarity: "common" },
  { id: "avatar_wizard", category: "avatar", name: "Mago", description: "Maestro de la magia de cartas.", price: 60, preview: "sparkles", previewColor: "#9B59B6", rarity: "rare" },
  { id: "avatar_samurai", category: "avatar", name: "Samurái", description: "Honor y disciplina ante todo.", price: 70, preview: "cut", previewColor: "#E74C3C", rarity: "rare" },
  { id: "avatar_pirate", category: "avatar", name: "Pirata", description: "El riesgo es su apellido.", price: 80, preview: "skull", previewColor: "#2C3E50", rarity: "rare" },
  { id: "avatar_detective", category: "avatar", name: "Detective", description: "Siempre un paso adelante.", price: 80, preview: "search", previewColor: "#7B5E3A", rarity: "rare" },
  { id: "avatar_ninja", category: "avatar", name: "Ninja", description: "Silencioso y letal. Te sorprende.", price: 100, preview: "eye-off", previewColor: "#2C3E50", rarity: "epic" },
  { id: "avatar_dragon", category: "avatar", name: "Dragón", description: "Poder y fuego indomable.", price: 150, preview: "flame", previewColor: "#E67E22", rarity: "epic" },
  { id: "avatar_gladiator", category: "avatar", name: "Gladiador", description: "Nació para el combate.", price: 140, preview: "trophy", previewColor: "#C0392B", rarity: "epic" },
  { id: "avatar_cyber", category: "avatar", name: "Cyber", description: "Inteligencia artificial al servicio del juego.", price: 180, preview: "hardware-chip", previewColor: "#00D4FF", rarity: "epic" },
  { id: "avatar_phoenix", category: "avatar", name: "Fénix", description: "Renace más fuerte con cada derrota.", price: 280, preview: "sunny", previewColor: "#D4AF37", rarity: "legendary" },
  { id: "avatar_reaper", category: "avatar", name: "Segador", description: "La muerte misma en la mesa.", price: 300, preview: "moon", previewColor: "#1a0020", rarity: "legendary" },
  { id: "avatar_king", category: "avatar", name: "El Rey", description: "Por encima de todos. Sin discusión.", price: 350, preview: "diamond", previewColor: "#D4AF37", rarity: "legendary" },
];

// Titles — ordered common → legendary
export const TITLES: StoreItem[] = [
  { id: "title_novice",      category: "title", name: "Novato",            description: "El inicio del camino.",              price: 0,   preview: "person",       previewColor: "#95A5A6", rarity: "common",    isDefault: true },
  { id: "title_rookie",      category: "title", name: "Recién Llegado",    description: "Aún aprendiendo.",                   price: 15,  preview: "walk",         previewColor: "#7F8C8D", rarity: "common" },
  { id: "title_regular",     category: "title", name: "Jugador Regular",   description: "Ya conoces el terreno.",             price: 25,  preview: "card",         previewColor: "#95A5A6", rarity: "common" },
  { id: "title_pro",         category: "title", name: "Profesional",       description: "Dominas las cartas.",                price: 50,  preview: "ribbon",       previewColor: "#2196F3", rarity: "rare" },
  { id: "title_strategist",  category: "title", name: "Estratega",         description: "Cada jugada es calculada.",          price: 60,  preview: "git-network",  previewColor: "#1A8FC1", rarity: "rare" },
  { id: "title_shark",       category: "title", name: "Tiburón",           description: "Hambriento de victorias.",           price: 70,  preview: "fish",         previewColor: "#0077B6", rarity: "rare" },
  { id: "title_hustler",     category: "title", name: "Buscavidas",        description: "Siempre encuentra la jugada.",       price: 70,  preview: "navigate",     previewColor: "#27AE60", rarity: "rare" },
  { id: "title_grandmaster", category: "title", name: "Gran Maestro",      description: "Temido en toda la mesa.",            price: 130, preview: "medal",        previewColor: "#D4AF37", rarity: "epic" },
  { id: "title_phantom",     category: "title", name: "El Fantasma",       description: "Nadie sabe cómo gana.",              price: 150, preview: "eye",          previewColor: "#9B59B6", rarity: "epic" },
  { id: "title_ace",         category: "title", name: "El As",             description: "El rey de todas las cartas.",        price: 160, preview: "star",         previewColor: "#E74C3C", rarity: "epic" },
  { id: "title_legend",      category: "title", name: "Leyenda Viviente",  description: "Los demás te temen.",                price: 300, preview: "trophy",       previewColor: "#FFD700", rarity: "legendary" },
  { id: "title_immortal",    category: "title", name: "Inmortal",          description: "No hay quien lo derrote.",           price: 350, preview: "infinite",     previewColor: "#FF6B6B", rarity: "legendary" },
  { id: "title_god",         category: "title", name: "El Dios",           description: "Trasciende el juego mismo.",         price: 500, preview: "diamond",      previewColor: "#D4AF37", rarity: "legendary" },
];

export const STORE_ITEMS: StoreItem[] = [...CARD_BACKS, ...AVATARS, ...TITLES];

export function getItemsByCategory(category: StoreItemCategory): StoreItem[] {
  return STORE_ITEMS.filter((i) => i.category === category);
}

export function getItemById(id: StoreItemId): StoreItem | undefined {
  return STORE_ITEMS.find((i) => i.id === id);
}

export function getCardBackById(id: string): StoreItem {
  return CARD_BACKS.find(b => b.id === id) ?? CARD_BACKS[0];
}
