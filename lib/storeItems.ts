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
}

export const STORE_ITEMS: StoreItem[] = [
  // Card Backs
  {
    id: "back_default",
    category: "card_back",
    name: "Clásico Azul",
    description: "El dorso clásico del juego.",
    price: 0,
    preview: "card",
    previewColor: "#1A3A6A",
    rarity: "common",
    isDefault: true,
  },
  {
    id: "back_gold",
    category: "card_back",
    name: "Oro Real",
    description: "Dorso dorado brillante para los más elegantes.",
    price: 80,
    preview: "card",
    previewColor: "#D4AF37",
    rarity: "rare",
  },
  {
    id: "back_crimson",
    category: "card_back",
    name: "Carmesí",
    description: "Rojo intenso que domina la mesa.",
    price: 60,
    preview: "card",
    previewColor: "#C0392B",
    rarity: "rare",
  },
  {
    id: "back_midnight",
    category: "card_back",
    name: "Medianoche",
    description: "Negro profundo con destellos plateados.",
    price: 100,
    preview: "card",
    previewColor: "#1a1a2e",
    rarity: "epic",
  },
  {
    id: "back_emerald",
    category: "card_back",
    name: "Esmeralda",
    description: "Verde esmeralda para el jugador natural.",
    price: 75,
    preview: "card",
    previewColor: "#0E6655",
    rarity: "rare",
  },
  {
    id: "back_crystal",
    category: "card_back",
    name: "Cristal",
    description: "Brillo legendario con efecto holográfico.",
    price: 200,
    preview: "card",
    previewColor: "#4FC3F7",
    rarity: "legendary",
  },
  {
    id: "back_galaxy",
    category: "card_back",
    name: "Galaxia",
    description: "El universo en tus cartas.",
    price: 180,
    preview: "card",
    previewColor: "#2C3E50",
    rarity: "legendary",
  },
  // Avatars
  {
    id: "avatar_knight",
    category: "avatar",
    name: "Caballero",
    description: "Valiente y noble guerrero.",
    price: 0,
    preview: "shield",
    previewColor: "#95A5A6",
    rarity: "common",
    isDefault: true,
  },
  {
    id: "avatar_wizard",
    category: "avatar",
    name: "Mago",
    description: "Maestro de la magia arcana.",
    price: 50,
    preview: "sparkles",
    previewColor: "#9B59B6",
    rarity: "rare",
  },
  {
    id: "avatar_samurai",
    category: "avatar",
    name: "Samurái",
    description: "Honor y disciplina.",
    price: 70,
    preview: "cut",
    previewColor: "#E74C3C",
    rarity: "rare",
  },
  {
    id: "avatar_ninja",
    category: "avatar",
    name: "Ninja",
    description: "Silencioso y letal.",
    price: 90,
    preview: "eye-off",
    previewColor: "#2C3E50",
    rarity: "epic",
  },
  {
    id: "avatar_dragon",
    category: "avatar",
    name: "Dragón",
    description: "Poder y fuego indomable.",
    price: 150,
    preview: "flame",
    previewColor: "#E67E22",
    rarity: "epic",
  },
  {
    id: "avatar_phoenix",
    category: "avatar",
    name: "Fénix",
    description: "Renace de sus cenizas más poderoso.",
    price: 250,
    preview: "sunny",
    previewColor: "#D4AF37",
    rarity: "legendary",
  },
  // Titles
  {
    id: "title_novice",
    category: "title",
    name: "Novato",
    description: "El comienzo de todo gran jugador.",
    price: 0,
    preview: "person",
    previewColor: "#95A5A6",
    rarity: "common",
    isDefault: true,
  },
  {
    id: "title_pro",
    category: "title",
    name: "Profesional",
    description: "Dominas las cartas.",
    price: 40,
    preview: "ribbon",
    previewColor: "#2196F3",
    rarity: "rare",
  },
  {
    id: "title_grandmaster",
    category: "title",
    name: "Gran Maestro",
    description: "Temido en toda la mesa.",
    price: 120,
    preview: "medal",
    previewColor: "#D4AF37",
    rarity: "epic",
  },
  {
    id: "title_legend",
    category: "title",
    name: "Leyenda Viviente",
    description: "Los demás jugadores te temen.",
    price: 300,
    preview: "trophy",
    previewColor: "#FFD700",
    rarity: "legendary",
  },
];

export function getItemsByCategory(category: StoreItemCategory): StoreItem[] {
  return STORE_ITEMS.filter((i) => i.category === category);
}

export function getItemById(id: StoreItemId): StoreItem | undefined {
  return STORE_ITEMS.find((i) => i.id === id);
}
