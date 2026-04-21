import { STORE_ITEMS, localizeItem } from "./storeItems";
import type { Lang } from "./i18n";

export interface BattlePassTier {
  tier: number;
  xpRequired: number;
  rewardType: "coins" | "item" | "title" | "avatar" | "frame" | "effect" | "chest";
  rewardValue: string | number;
  rewardLabel: string;
  icon: string;
  iconColor: string;
  isExclusive?: boolean;
  exclusiveLabel?: Record<Lang, string>;
}

// ─── SEASONAL EXCLUSIVES ────────────────────────────────────────────────────
// Themed pools of exclusive cosmetics that ONLY appear during a given season's
// battle pass. These IDs are intentionally NOT registered in `storeItems` so
// they cannot be purchased — they are battle-pass-only "limited edition"
// rewards that rotate with the season number.
export interface SeasonExclusive {
  rewardType: "item" | "avatar" | "frame" | "title";
  rewardValue: string;
  /** Full prefixed label (e.g. "Avatar: Phoenix Lord") per supported language. */
  label: Record<Lang, string>;
  icon: string;
  iconColor: string;
}

export interface SeasonTheme {
  themeName: Record<Lang, string>;
  exclusives: SeasonExclusive[]; // at least 2 per season, slotted at tiers 27 & 35
}

// Localized prefix used in front of the exclusive's name. `item` is the
// card-back category in the SeasonExclusive type system.
const EXCLUSIVE_PREFIXES: Record<SeasonExclusive["rewardType"], Record<Lang, string>> = {
  avatar: {
    es:"Avatar", en:"Avatar", pt:"Avatar", fr:"Avatar", de:"Avatar", it:"Avatar",
    tr:"Avatar", ru:"Аватар", pl:"Awatar", nl:"Avatar", sv:"Avatar", da:"Avatar",
    fi:"Avatar", no:"Avatar", zh:"头像", ja:"アバター", ko:"아바타", hi:"अवतार",
    th:"อวตาร", vi:"Ảnh đại diện", id:"Avatar", ar:"الصورة الرمزية",
  },
  frame: {
    es:"Marco", en:"Frame", pt:"Moldura", fr:"Cadre", de:"Rahmen", it:"Cornice",
    tr:"Çerçeve", ru:"Рамка", pl:"Ramka", nl:"Kader", sv:"Ram", da:"Ramme",
    fi:"Kehys", no:"Ramme", zh:"边框", ja:"フレーム", ko:"프레임", hi:"फ्रेम",
    th:"กรอบ", vi:"Khung", id:"Bingkai", ar:"إطار",
  },
  title: {
    es:"Título", en:"Title", pt:"Título", fr:"Titre", de:"Titel", it:"Titolo",
    tr:"Unvan", ru:"Титул", pl:"Tytuł", nl:"Titel", sv:"Titel", da:"Titel",
    fi:"Titteli", no:"Tittel", zh:"称号", ja:"称号", ko:"칭호", hi:"उपाधि",
    th:"ฉายา", vi:"Danh hiệu", id:"Gelar", ar:"لقب",
  },
  item: {
    es:"Dorso", en:"Back", pt:"Dorso", fr:"Dos", de:"Rückseite", it:"Retro",
    tr:"Arka", ru:"Рубашка", pl:"Rewers", nl:"Achterkant", sv:"Baksida", da:"Bagside",
    fi:"Tausta", no:"Bakside", zh:"卡背", ja:"カード裏", ko:"카드 뒷면", hi:"पिछला भाग",
    th:"หลังการ์ด", vi:"Mặt sau", id:"Punggung Kartu", ar:"ظهر البطاقة",
  },
};

const ALL_LANGS: Lang[] = [
  "es","en","pt","fr","de","it","tr","ru","pl","nl","sv","da","fi","no",
  "zh","ja","ko","hi","th","vi","id","ar",
];

// Build the full `label` record by joining the localized category prefix with
// the localized exclusive name in each language.
function mkExclusiveLabel(
  type: SeasonExclusive["rewardType"],
  names: Record<Lang, string>,
): Record<Lang, string> {
  const prefixes = EXCLUSIVE_PREFIXES[type];
  const out = {} as Record<Lang, string>;
  for (const l of ALL_LANGS) out[l] = `${prefixes[l]}: ${names[l]}`;
  return out;
}

// Resolve an exclusive's full label in the requested language, falling back
// to English then Spanish if a translation is missing.
export function getExclusiveLabel(ex: SeasonExclusive, lang: Lang): string {
  return ex.label[lang] ?? ex.label.en ?? ex.label.es;
}

export const SEASON_THEMES: SeasonTheme[] = [
  {
    themeName: {
      es: "Hierro y Fuego", en: "Iron and Fire", pt: "Ferro e Fogo",
      fr: "Fer et Feu", de: "Eisen und Feuer", it: "Ferro e Fuoco",
      tr: "Demir ve Ateş", ru: "Железо и Огонь", pl: "Żelazo i Ogień",
      nl: "IJzer en Vuur", sv: "Järn och Eld", da: "Jern og Ild",
      fi: "Rauta ja Tuli", no: "Jern og Ild", zh: "钢铁与烈焰",
      ja: "鉄と炎", ko: "강철과 불꽃", hi: "लोहा और आग",
      th: "เหล็กและเปลวไฟ", vi: "Sắt và Lửa", id: "Besi dan Api",
      ar: "الحديد والنار",
    },
    exclusives: [
      { rewardType: "avatar", rewardValue: "exclusive_s1_phoenix_lord", icon: "flame",   iconColor: "#FF4500",
        label: mkExclusiveLabel("avatar", {
          es:"Señor Fénix", en:"Phoenix Lord", pt:"Senhor Fênix", fr:"Seigneur Phénix", de:"Phönixfürst",
          it:"Signore Fenice", tr:"Anka Lordu", ru:"Лорд Феникс", pl:"Pan Feniksów", nl:"Feniksheer",
          sv:"Fenixlord", da:"Føniksherre", fi:"Feeniksherra", no:"Føniksherre", zh:"凤凰之主",
          ja:"不死鳥の主", ko:"불사조의 군주", hi:"फीनिक्स लॉर्ड", th:"เจ้าฟีนิกซ์",
          vi:"Lãnh Chúa Phượng Hoàng", id:"Tuan Phoenix", ar:"سيد العنقاء",
        }) },
      { rewardType: "frame",  rewardValue: "exclusive_s1_ember_frame", icon: "ellipse", iconColor: "#FF6B00",
        label: mkExclusiveLabel("frame", {
          es:"Brasa Eterna", en:"Eternal Ember", pt:"Brasa Eterna", fr:"Braise Éternelle", de:"Ewige Glut",
          it:"Brace Eterna", tr:"Ebedi Köz", ru:"Вечный Уголь", pl:"Wieczny Żar", nl:"Eeuwige Sintels",
          sv:"Evig Glöd", da:"Evig Glød", fi:"Ikuinen Hiillos", no:"Evig Glør", zh:"永恒余烬",
          ja:"永遠の残り火", ko:"영원한 불씨", hi:"शाश्वत अंगारा", th:"ถ่านนิรันดร์",
          vi:"Tro Tàn Vĩnh Cửu", id:"Bara Abadi", ar:"جمرة أبدية",
        }) },
      { rewardType: "title",  rewardValue: "exclusive_s1_iron_burned", icon: "ribbon",  iconColor: "#C0392B",
        label: mkExclusiveLabel("title", {
          es:"Forjado en Fuego", en:"Forged in Fire", pt:"Forjado no Fogo", fr:"Forgé dans le Feu",
          de:"Im Feuer Geschmiedet", it:"Forgiato nel Fuoco", tr:"Ateşte Dövülmüş", ru:"Закалённый в Огне",
          pl:"Wykuty w Ogniu", nl:"Gesmeed in Vuur", sv:"Smidd i Eld", da:"Smedet i Ild",
          fi:"Tulessa Taottu", no:"Smidd i Ild", zh:"烈火淬炼", ja:"炎で鍛えられし者",
          ko:"불꽃에 단련된 자", hi:"अग्नि में गढ़ा", th:"หลอมในเปลวไฟ", vi:"Tôi Luyện Trong Lửa",
          id:"Ditempa dalam Api", ar:"مصاغ في النار",
        }) },
    ],
  },
  {
    themeName: {
      es: "Tormenta Eterna", en: "Eternal Storm", pt: "Tempestade Eterna",
      fr: "Tempête Éternelle", de: "Ewiger Sturm", it: "Tempesta Eterna",
      tr: "Sonsuz Fırtına", ru: "Вечная Буря", pl: "Wieczna Burza",
      nl: "Eeuwige Storm", sv: "Evig Storm", da: "Evig Storm",
      fi: "Ikuinen Myrsky", no: "Evig Storm", zh: "永恒风暴",
      ja: "永遠の嵐", ko: "영원한 폭풍", hi: "शाश्वत तूफ़ान",
      th: "พายุนิรันดร์", vi: "Bão Vĩnh Cửu", id: "Badai Abadi",
      ar: "العاصفة الأبدية",
    },
    exclusives: [
      { rewardType: "avatar", rewardValue: "exclusive_s2_storm_caller", icon: "thunderstorm", iconColor: "#4A90E2",
        label: mkExclusiveLabel("avatar", {
          es:"Invocador de Tormentas", en:"Storm Caller", pt:"Invocador de Tempestades", fr:"Invocateur de Tempête",
          de:"Sturmrufer", it:"Evocatore di Tempeste", tr:"Fırtına Çağıran", ru:"Призыватель Бурь",
          pl:"Przyzywacz Burzy", nl:"Stormroeper", sv:"Stormkallare", da:"Stormkalder",
          fi:"Myrskykutsuja", no:"Stormkaller", zh:"风暴召唤者", ja:"嵐の招来者",
          ko:"폭풍 소환사", hi:"तूफान आह्वानकर्ता", th:"ผู้เรียกพายุ", vi:"Triệu Hồi Bão Tố",
          id:"Pemanggil Badai", ar:"مستدعي العاصفة",
        }) },
      { rewardType: "frame",  rewardValue: "exclusive_s2_lightning_frame", icon: "flash", iconColor: "#FFD700",
        label: mkExclusiveLabel("frame", {
          es:"Relámpago", en:"Lightning", pt:"Relâmpago", fr:"Foudre", de:"Blitz", it:"Fulmine",
          tr:"Şimşek", ru:"Молния", pl:"Błyskawica", nl:"Bliksem", sv:"Blixt", da:"Lyn",
          fi:"Salama", no:"Lyn", zh:"闪电", ja:"稲妻", ko:"번개", hi:"बिजली",
          th:"สายฟ้า", vi:"Tia Sét", id:"Petir", ar:"برق",
        }) },
      { rewardType: "title",  rewardValue: "exclusive_s2_thunderlord", icon: "ribbon", iconColor: "#4A90E2",
        label: mkExclusiveLabel("title", {
          es:"Señor del Trueno", en:"Thunder Lord", pt:"Senhor do Trovão", fr:"Seigneur du Tonnerre",
          de:"Donnerfürst", it:"Signore del Tuono", tr:"Gök Gürültüsü Lordu", ru:"Лорд Грома",
          pl:"Pan Gromów", nl:"Donderheer", sv:"Åskherre", da:"Tordenherre",
          fi:"Ukkosenherra", no:"Tordenherre", zh:"雷霆之主", ja:"雷霆の主",
          ko:"천둥의 군주", hi:"गर्जन प्रभु", th:"เจ้าสายฟ้า", vi:"Lãnh Chúa Sấm Sét",
          id:"Tuan Petir", ar:"سيد الرعد",
        }) },
    ],
  },
  {
    themeName: {
      es: "Reino Sombrío", en: "Shadow Realm", pt: "Reino Sombrio",
      fr: "Royaume des Ombres", de: "Schattenreich", it: "Regno delle Ombre",
      tr: "Gölgeler Krallığı", ru: "Царство Теней", pl: "Królestwo Cieni",
      nl: "Schaduwrijk", sv: "Skuggriket", da: "Skyggeriget",
      fi: "Varjojen Valtakunta", no: "Skyggeriket", zh: "暗影领域",
      ja: "影の王国", ko: "그림자 왕국", hi: "छाया का साम्राज्य",
      th: "อาณาจักรเงา", vi: "Vương Quốc Bóng Tối", id: "Kerajaan Bayangan",
      ar: "مملكة الظلال",
    },
    exclusives: [
      { rewardType: "avatar", rewardValue: "exclusive_s3_shadow_walker", icon: "moon", iconColor: "#6A0DAD",
        label: mkExclusiveLabel("avatar", {
          es:"Caminante Sombrío", en:"Shadow Walker", pt:"Andarilho Sombrio", fr:"Marcheur des Ombres",
          de:"Schattenwanderer", it:"Camminatore d'Ombra", tr:"Gölge Yürüyüşçü", ru:"Странник Теней",
          pl:"Wędrowiec Cieni", nl:"Schaduwloper", sv:"Skuggvandrare", da:"Skyggevandrer",
          fi:"Varjokulkija", no:"Skyggevandrer", zh:"暗影行者", ja:"影渡り",
          ko:"그림자 방랑자", hi:"छाया पथिक", th:"ผู้เดินเงา", vi:"Kẻ Bước Trong Bóng Tối",
          id:"Pengembara Bayangan", ar:"ماشي الظلال",
        }) },
      { rewardType: "item",   rewardValue: "exclusive_s3_void_back", icon: "card", iconColor: "#1a0020",
        label: mkExclusiveLabel("item", {
          es:"Vacío Profundo", en:"Deep Void", pt:"Vazio Profundo", fr:"Vide Profond", de:"Tiefe Leere",
          it:"Vuoto Profondo", tr:"Derin Boşluk", ru:"Глубокая Пустота", pl:"Głęboka Pustka",
          nl:"Diepe Leegte", sv:"Djupa Tomheten", da:"Dyb Tomhed", fi:"Syvä Tyhjyys",
          no:"Dyp Tomhet", zh:"深邃虚空", ja:"深淵", ko:"깊은 공허", hi:"गहरा शून्य",
          th:"ความว่างเปล่าลึก", vi:"Hư Vô Sâu Thẳm", id:"Kekosongan Dalam", ar:"الفراغ العميق",
        }) },
      { rewardType: "title",  rewardValue: "exclusive_s3_nightbringer", icon: "ribbon", iconColor: "#6A0DAD",
        label: mkExclusiveLabel("title", {
          es:"Portador de Noche", en:"Nightbringer", pt:"Portador da Noite", fr:"Porteur de Nuit",
          de:"Nachtbringer", it:"Portatore di Notte", tr:"Gece Getiren", ru:"Несущий Ночь",
          pl:"Niosący Noc", nl:"Nachtbrenger", sv:"Nattbringaren", da:"Natbringer",
          fi:"Yön Tuoja", no:"Nattbringer", zh:"夜之使者", ja:"夜をもたらす者",
          ko:"밤의 인도자", hi:"रात्रि वाहक", th:"ผู้นำพาราตรี", vi:"Kẻ Mang Đêm Tối",
          id:"Pembawa Malam", ar:"جالب الليل",
        }) },
    ],
  },
  {
    themeName: {
      es: "Cielos Cósmicos", en: "Cosmic Skies", pt: "Céus Cósmicos",
      fr: "Cieux Cosmiques", de: "Kosmische Himmel", it: "Cieli Cosmici",
      tr: "Kozmik Gökyüzü", ru: "Космические Небеса", pl: "Kosmiczne Niebiosa",
      nl: "Kosmische Hemelen", sv: "Kosmiska Himlar", da: "Kosmiske Himle",
      fi: "Kosmiset Taivaat", no: "Kosmiske Himler", zh: "宇宙苍穹",
      ja: "宇宙の空", ko: "우주의 하늘", hi: "ब्रह्मांडीय आकाश",
      th: "ท้องฟ้าจักรวาล", vi: "Bầu Trời Vũ Trụ", id: "Langit Kosmik",
      ar: "السماوات الكونية",
    },
    exclusives: [
      { rewardType: "avatar", rewardValue: "exclusive_s4_starborn", icon: "sparkles", iconColor: "#A855F7",
        label: mkExclusiveLabel("avatar", {
          es:"Nacido de Estrellas", en:"Starborn", pt:"Nascido das Estrelas", fr:"Né des Étoiles",
          de:"Sterngeboren", it:"Nato dalle Stelle", tr:"Yıldızdan Doğan", ru:"Звёзднорождённый",
          pl:"Zrodzony z Gwiazd", nl:"Stergeboren", sv:"Stjärnfödd", da:"Stjernefødt",
          fi:"Tähdistä Syntynyt", no:"Stjernefødt", zh:"星辰之子", ja:"星生まれ",
          ko:"별의 후예", hi:"तारों से जन्मा", th:"ผู้ถือกำเนิดดาว", vi:"Sinh Ra Từ Sao",
          id:"Lahir dari Bintang", ar:"مولود النجوم",
        }) },
      { rewardType: "frame",  rewardValue: "exclusive_s4_nebula_frame", icon: "ellipse", iconColor: "#A855F7",
        label: mkExclusiveLabel("frame", {
          es:"Nebulosa", en:"Nebula", pt:"Nebulosa", fr:"Nébuleuse", de:"Nebel", it:"Nebulosa",
          tr:"Nebula", ru:"Туманность", pl:"Mgławica", nl:"Nevel", sv:"Nebulosa", da:"Nebula",
          fi:"Sumu", no:"Nebula", zh:"星云", ja:"星雲", ko:"성운", hi:"नीहारिका",
          th:"เนบิวลา", vi:"Tinh Vân", id:"Nebula", ar:"سديم",
        }) },
      { rewardType: "item",   rewardValue: "exclusive_s4_constellation_back", icon: "card", iconColor: "#001a40",
        label: mkExclusiveLabel("item", {
          es:"Constelación", en:"Constellation", pt:"Constelação", fr:"Constellation", de:"Sternbild",
          it:"Costellazione", tr:"Takımyıldız", ru:"Созвездие", pl:"Konstelacja",
          nl:"Sterrenbeeld", sv:"Stjärnbild", da:"Stjernebillede", fi:"Tähtikuvio",
          no:"Stjernebilde", zh:"星座", ja:"星座", ko:"별자리", hi:"नक्षत्र",
          th:"กลุ่มดาว", vi:"Chòm Sao", id:"Rasi Bintang", ar:"كوكبة",
        }) },
    ],
  },
  {
    themeName: {
      es: "Bosque Encantado", en: "Enchanted Forest", pt: "Floresta Encantada",
      fr: "Forêt Enchantée", de: "Verzauberter Wald", it: "Foresta Incantata",
      tr: "Büyülü Orman", ru: "Зачарованный Лес", pl: "Zaczarowany Las",
      nl: "Betoverd Bos", sv: "Förtrollad Skog", da: "Fortryllet Skov",
      fi: "Lumottu Metsä", no: "Fortryllet Skog", zh: "魔法森林",
      ja: "魔法の森", ko: "마법의 숲", hi: "जादुई जंगल",
      th: "ป่ามนตรา", vi: "Rừng Phép Thuật", id: "Hutan Sihir",
      ar: "الغابة المسحورة",
    },
    exclusives: [
      { rewardType: "avatar", rewardValue: "exclusive_s5_druid", icon: "leaf", iconColor: "#27AE60",
        label: mkExclusiveLabel("avatar", {
          es:"Druida Ancestral", en:"Ancient Druid", pt:"Druida Ancestral", fr:"Druide Ancien",
          de:"Alter Druide", it:"Druido Antico", tr:"Kadim Drud", ru:"Древний Друид",
          pl:"Pradawny Druid", nl:"Oude Druïde", sv:"Forntida Druid", da:"Ældgammel Druide",
          fi:"Muinainen Druidi", no:"Eldgammel Druide", zh:"远古德鲁伊", ja:"古代のドルイド",
          ko:"고대 드루이드", hi:"प्राचीन ड्रूड", th:"ดรูอิดโบราณ", vi:"Druid Cổ Đại",
          id:"Druid Kuno", ar:"درويد قديم",
        }) },
      { rewardType: "frame",  rewardValue: "exclusive_s5_vine_frame", icon: "ellipse", iconColor: "#27AE60",
        label: mkExclusiveLabel("frame", {
          es:"Enredadera", en:"Vine", pt:"Trepadeira", fr:"Liane", de:"Ranke", it:"Liana",
          tr:"Sarmaşık", ru:"Лоза", pl:"Pnącze", nl:"Wijnrank", sv:"Ranka", da:"Ranke",
          fi:"Köynnös", no:"Ranke", zh:"藤蔓", ja:"蔦", ko:"덩굴", hi:"बेल",
          th:"เถาวัลย์", vi:"Dây Leo", id:"Tanaman Rambat", ar:"كرمة",
        }) },
      { rewardType: "title",  rewardValue: "exclusive_s5_woodlands", icon: "ribbon", iconColor: "#27AE60",
        label: mkExclusiveLabel("title", {
          es:"Guardián del Bosque", en:"Forest Guardian", pt:"Guardião da Floresta", fr:"Gardien de la Forêt",
          de:"Waldhüter", it:"Guardiano della Foresta", tr:"Orman Muhafızı", ru:"Хранитель Леса",
          pl:"Strażnik Lasu", nl:"Boswachter", sv:"Skogsväktare", da:"Skovvogter",
          fi:"Metsänvartija", no:"Skogsvokter", zh:"森林守护者", ja:"森の守護者",
          ko:"숲의 수호자", hi:"वन रक्षक", th:"ผู้พิทักษ์ป่า", vi:"Hộ Vệ Rừng",
          id:"Penjaga Hutan", ar:"حارس الغابة",
        }) },
    ],
  },
  {
    themeName: {
      es: "Era de Hielo", en: "Ice Age", pt: "Era do Gelo",
      fr: "Ère Glaciaire", de: "Eiszeit", it: "Era Glaciale",
      tr: "Buz Çağı", ru: "Ледниковый Период", pl: "Epoka Lodowcowa",
      nl: "IJstijdperk", sv: "Istiden", da: "Istiden",
      fi: "Jääkausi", no: "Istiden", zh: "冰河时代",
      ja: "氷河時代", ko: "빙하 시대", hi: "हिम युग",
      th: "ยุคน้ำแข็ง", vi: "Kỷ Băng Hà", id: "Zaman Es",
      ar: "العصر الجليدي",
    },
    exclusives: [
      { rewardType: "avatar", rewardValue: "exclusive_s6_frost_giant", icon: "snow", iconColor: "#7FDBFF",
        label: mkExclusiveLabel("avatar", {
          es:"Gigante de Hielo", en:"Frost Giant", pt:"Gigante de Gelo", fr:"Géant des Glaces",
          de:"Frostriese", it:"Gigante del Gelo", tr:"Buz Devi", ru:"Ледяной Великан",
          pl:"Lodowy Olbrzym", nl:"Vorstreus", sv:"Frostjätte", da:"Frostkæmpe",
          fi:"Pakkasjättiläinen", no:"Frostkjempe", zh:"霜巨人", ja:"霜の巨人",
          ko:"서리 거인", hi:"हिम दानव", th:"ยักษ์น้ำแข็ง", vi:"Gã Khổng Lồ Băng Giá",
          id:"Raksasa Es", ar:"عملاق الصقيع",
        }) },
      { rewardType: "item",   rewardValue: "exclusive_s6_glacier_back", icon: "card", iconColor: "#B8DDEF",
        label: mkExclusiveLabel("item", {
          es:"Glaciar Eterno", en:"Eternal Glacier", pt:"Geleira Eterna", fr:"Glacier Éternel",
          de:"Ewiger Gletscher", it:"Ghiacciaio Eterno", tr:"Ebedi Buzul", ru:"Вечный Ледник",
          pl:"Wieczny Lodowiec", nl:"Eeuwige Gletsjer", sv:"Evig Glaciär", da:"Evig Gletsjer",
          fi:"Ikuinen Jäätikkö", no:"Evig Isbre", zh:"永恒冰川", ja:"永遠の氷河",
          ko:"영원한 빙하", hi:"शाश्वत हिमनद", th:"ธารน้ำแข็งนิรันดร์", vi:"Sông Băng Vĩnh Cửu",
          id:"Gletser Abadi", ar:"نهر جليدي أبدي",
        }) },
      { rewardType: "title",  rewardValue: "exclusive_s6_iceborn", icon: "ribbon", iconColor: "#7FDBFF",
        label: mkExclusiveLabel("title", {
          es:"Hijo del Hielo", en:"Iceborn", pt:"Filho do Gelo", fr:"Né des Glaces",
          de:"Eisgeboren", it:"Nato dal Ghiaccio", tr:"Buzdan Doğan", ru:"Рождённый Льдом",
          pl:"Zrodzony z Lodu", nl:"IJsgeboren", sv:"Isfödd", da:"Isfødt",
          fi:"Jäästä Syntynyt", no:"Isfødt", zh:"冰之子", ja:"氷生まれ",
          ko:"얼음의 후예", hi:"हिम जन्मा", th:"ผู้ถือกำเนิดน้ำแข็ง", vi:"Sinh Ra Từ Băng",
          id:"Lahir dari Es", ar:"مولود الجليد",
        }) },
    ],
  },
];

export function getSeasonTheme(seasonNumber: number): SeasonTheme {
  const idx = ((seasonNumber - 1) % SEASON_THEMES.length + SEASON_THEMES.length) % SEASON_THEMES.length;
  return SEASON_THEMES[idx];
}

// Returns the season's theme name in the requested language, falling back to
// English and then Spanish if a translation is missing.
export function getSeasonThemeName(seasonNumber: number, lang: Lang): string {
  const theme = getSeasonTheme(seasonNumber);
  return theme.themeName[lang] ?? theme.themeName.en ?? theme.themeName.es;
}

// ─── EXCLUSIVE LOOKUP HELPERS ───────────────────────────────────────────────
// Battle-pass-only IDs (prefix `exclusive_s`) are NOT in `STORE_ITEMS`, so the
// inventory and avatar/frame/title/back pickers need to resolve them via
// SEASON_THEMES to display name, icon and a "Limited Edition · Season X" badge.
export type ExclusiveCategory = "card_back" | "avatar" | "frame" | "title";

export interface ResolvedExclusive {
  id: string;
  category: ExclusiveCategory;
  name: string;          // localized, prefix-stripped (e.g. "Phoenix Lord")
  fullLabel: string;     // localized, with prefix ("Avatar: Phoenix Lord")
  icon: string;
  iconColor: string;
  seasonNumber: number;
  themeName: string;
  isExclusive: true;
}

const EXCLUSIVE_CATEGORY_MAP: Record<SeasonExclusive["rewardType"], ExclusiveCategory> = {
  item:   "card_back",
  avatar: "avatar",
  frame:  "frame",
  title:  "title",
};

export function findExclusiveById(id: string, lang: Lang = "es"): ResolvedExclusive | null {
  if (!id || !id.startsWith("exclusive_s")) return null;
  for (let i = 0; i < SEASON_THEMES.length; i++) {
    const theme = SEASON_THEMES[i];
    const ex = theme.exclusives.find(e => e.rewardValue === id);
    if (!ex) continue;
    const fullLabel = getExclusiveLabel(ex, lang);
    const name = fullLabel.includes(": ")
      ? fullLabel.split(": ").slice(1).join(": ")
      : fullLabel;
    return {
      id,
      category: EXCLUSIVE_CATEGORY_MAP[ex.rewardType],
      name,
      fullLabel,
      icon: ex.icon,
      iconColor: ex.iconColor,
      seasonNumber: i + 1,
      themeName: theme.themeName[lang] ?? theme.themeName.en ?? theme.themeName.es,
      isExclusive: true,
    };
  }
  return null;
}

export function getOwnedExclusives(
  ownedIds: string[] | undefined,
  category: ExclusiveCategory,
  lang: Lang = "es",
): ResolvedExclusive[] {
  if (!ownedIds || ownedIds.length === 0) return [];
  const out: ResolvedExclusive[] = [];
  for (const id of ownedIds) {
    const ex = findExclusiveById(id, lang);
    if (ex && ex.category === category) out.push(ex);
  }
  return out;
}

// Tier slots in the epic block (21-40) where exclusives are injected.
const EXCLUSIVE_SLOTS = [27, 35];

export const BATTLE_PASS_TIERS: BattlePassTier[] = [
  // ─── Tiers 1-20: Common & Rare rewards ──────────────────────────────────────
  { tier:  1, xpRequired: 8     ,      rewardType: "title",   rewardValue: "title_novice",       rewardLabel: "Título: Novato",              icon: "person",           iconColor: "#95A5A6" },
  { tier:  2, xpRequired: 32    ,    rewardType: "coins",   rewardValue: 25,                   rewardLabel: "25 Monedas",                  icon: "cash",             iconColor: "#F1C40F" },
  { tier:  3, xpRequired: 72    ,    rewardType: "item",    rewardValue: "back_crimson",        rewardLabel: "Dorso: Carmesí",              icon: "card",             iconColor: "#C0392B" },
  { tier:  4, xpRequired: 128   ,    rewardType: "coins",   rewardValue: 40,                   rewardLabel: "40 Monedas",                  icon: "cash",             iconColor: "#F1C40F" },
  { tier:  5, xpRequired: 200   ,    rewardType: "avatar",  rewardValue: "avatar_wizard",       rewardLabel: "Avatar: Mago",                icon: "sparkles",         iconColor: "#9B59B6" },
  { tier:  6, xpRequired: 288   ,   rewardType: "title",   rewardValue: "title_rookie",        rewardLabel: "Título: Recién Llegado",      icon: "walk",             iconColor: "#95A5A6" },
  { tier:  7, xpRequired: 392   ,   rewardType: "coins",   rewardValue: 60,                   rewardLabel: "60 Monedas",                  icon: "cash",             iconColor: "#F1C40F" },
  { tier:  8, xpRequired: 512   ,   rewardType: "item",    rewardValue: "back_emerald",        rewardLabel: "Dorso: Esmeralda",            icon: "card",             iconColor: "#0E6655" },
  { tier:  9, xpRequired: 648   ,   rewardType: "title",   rewardValue: "title_pro",           rewardLabel: "Título: Profesional",         icon: "ribbon",           iconColor: "#2196F3" },
  { tier: 10, xpRequired: 800   ,   rewardType: "chest",   rewardValue: "common",             rewardLabel: "Cofre Común",                 icon: "cube",             iconColor: "#95A5A6" },
  { tier: 11, xpRequired: 968   ,   rewardType: "avatar",  rewardValue: "avatar_samurai",      rewardLabel: "Avatar: Samurái",             icon: "cut",              iconColor: "#E74C3C" },
  { tier: 12, xpRequired: 1152  ,   rewardType: "item",    rewardValue: "back_gold",           rewardLabel: "Dorso: Oro Real",             icon: "card",             iconColor: "#D4AF37" },
  { tier: 13, xpRequired: 1352  ,   rewardType: "coins",   rewardValue: 150,                  rewardLabel: "150 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 14, xpRequired: 1568  ,   rewardType: "title",   rewardValue: "title_strategist",    rewardLabel: "Título: Estratega",           icon: "git-network",      iconColor: "#1A8FC1" },
  { tier: 15, xpRequired: 1800  ,   rewardType: "avatar",  rewardValue: "avatar_ninja",        rewardLabel: "Avatar: Ninja",               icon: "eye-off",          iconColor: "#2C3E50" },
  { tier: 16, xpRequired: 2048  ,   rewardType: "item",    rewardValue: "back_midnight",       rewardLabel: "Dorso: Medianoche",           icon: "card",             iconColor: "#C0C0C0" },
  { tier: 17, xpRequired: 2312  ,  rewardType: "coins",   rewardValue: 200,                  rewardLabel: "200 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 18, xpRequired: 2592  ,  rewardType: "avatar",  rewardValue: "avatar_dragon",       rewardLabel: "Avatar: Dragón",              icon: "flame",            iconColor: "#E67E22" },
  { tier: 19, xpRequired: 2888  ,  rewardType: "title",   rewardValue: "title_grandmaster",   rewardLabel: "Título: Gran Maestro",        icon: "medal",            iconColor: "#D4AF37" },
  { tier: 20, xpRequired: 3200  ,  rewardType: "chest",   rewardValue: "rare",               rewardLabel: "Cofre Raro",                  icon: "cube-outline",     iconColor: "#4A90D9" },
  // ─── Tiers 21-40: Epic rewards ──────────────────────────────────────────────
  { tier: 21, xpRequired: 3528  ,  rewardType: "coins",   rewardValue: 300,                  rewardLabel: "300 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 22, xpRequired: 3872  ,  rewardType: "avatar",  rewardValue: "avatar_pirate",       rewardLabel: "Avatar: Pirata",              icon: "skull",            iconColor: "#2C3E50" },
  { tier: 23, xpRequired: 4232  ,  rewardType: "item",    rewardValue: "back_ruby",           rewardLabel: "Dorso: Rubí",                 icon: "card",             iconColor: "#9B111E" },
  { tier: 24, xpRequired: 4608  ,  rewardType: "title",   rewardValue: "title_phantom",       rewardLabel: "Título: El Fantasma",         icon: "eye",              iconColor: "#9B59B6" },
  { tier: 25, xpRequired: 5000  ,  rewardType: "coins",   rewardValue: 500,                  rewardLabel: "500 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 26, xpRequired: 5408  ,  rewardType: "item",    rewardValue: "back_obsidian",       rewardLabel: "Dorso: Obsidiana",            icon: "card",             iconColor: "#2D2D2D" },
  { tier: 27, xpRequired: 5832  ,  rewardType: "avatar",  rewardValue: "avatar_gladiator",    rewardLabel: "Avatar: Gladiador",           icon: "trophy",           iconColor: "#C0392B" },
  { tier: 28, xpRequired: 6272  ,  rewardType: "title",   rewardValue: "title_ace",           rewardLabel: "Título: El As",               icon: "star",             iconColor: "#E74C3C" },
  { tier: 29, xpRequired: 6728  ,  rewardType: "item",    rewardValue: "back_arctic",         rewardLabel: "Dorso: Ártico",               icon: "card",             iconColor: "#B8DDEF" },
  { tier: 30, xpRequired: 7200  ,  rewardType: "chest",   rewardValue: "epic",               rewardLabel: "Cofre Épico",                 icon: "diamond",          iconColor: "#9B59B6" },
  { tier: 31, xpRequired: 7688  ,  rewardType: "avatar",  rewardValue: "avatar_cyber",        rewardLabel: "Avatar: Cyber",               icon: "hardware-chip",    iconColor: "#00D4FF" },
  { tier: 32, xpRequired: 8192  ,  rewardType: "item",    rewardValue: "back_galaxy",         rewardLabel: "Dorso: Galaxia",              icon: "card",             iconColor: "#A855F7" },
  { tier: 33, xpRequired: 8712  , rewardType: "title",   rewardValue: "title_legend",        rewardLabel: "Título: Leyenda Viviente",    icon: "trophy",           iconColor: "#FFD700" },
  { tier: 34, xpRequired: 9248  , rewardType: "coins",   rewardValue: 1500,                 rewardLabel: "¡1500 Monedas!",              icon: "cash",             iconColor: "#FFD700" },
  { tier: 35, xpRequired: 9800  , rewardType: "avatar",  rewardValue: "avatar_phoenix",      rewardLabel: "Avatar: Fénix",               icon: "sunny",            iconColor: "#D4AF37" },
  { tier: 36, xpRequired: 10368 , rewardType: "item",    rewardValue: "back_inferno",        rewardLabel: "Dorso: Infierno",             icon: "flame",            iconColor: "#FF6600" },
  { tier: 37, xpRequired: 10952 , rewardType: "avatar",  rewardValue: "avatar_reaper",       rewardLabel: "Avatar: Segador",             icon: "moon",             iconColor: "#1a0020" },
  { tier: 38, xpRequired: 11552 , rewardType: "title",   rewardValue: "title_immortal",      rewardLabel: "Título: Inmortal",            icon: "infinite",         iconColor: "#FF6B6B" },
  { tier: 39, xpRequired: 12168 , rewardType: "avatar",  rewardValue: "avatar_king",         rewardLabel: "Avatar: El Rey",              icon: "diamond",          iconColor: "#D4AF37" },
  { tier: 40, xpRequired: 12800 , rewardType: "title",   rewardValue: "title_god",           rewardLabel: "Título: El Dios",             icon: "sparkles",         iconColor: "#D4AF37" },
  // ─── Tiers 41-60: New epic & legendary rewards ──────────────────────────────
  { tier: 41, xpRequired: 13448 , rewardType: "item",    rewardValue: "back_neon",           rewardLabel: "Dorso: Neón",                 icon: "card",             iconColor: "#FF00FF" },
  { tier: 42, xpRequired: 14112 , rewardType: "coins",   rewardValue: 800,                  rewardLabel: "800 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 43, xpRequired: 14792 , rewardType: "avatar",  rewardValue: "avatar_titan",        rewardLabel: "Avatar: Titán",               icon: "barbell",          iconColor: "#7F8C8D" },
  { tier: 44, xpRequired: 15488 , rewardType: "frame",   rewardValue: "frame_neon",          rewardLabel: "Marco: Neón",                 icon: "ellipse",          iconColor: "#FF00FF" },
  { tier: 45, xpRequired: 16200 , rewardType: "item",    rewardValue: "back_aurora",         rewardLabel: "Dorso: Aurora Boreal",        icon: "card",             iconColor: "#00FFCC" },
  { tier: 46, xpRequired: 16928 , rewardType: "title",   rewardValue: "title_invincible",    rewardLabel: "Título: Invencible",          icon: "shield",           iconColor: "#C0392B" },
  { tier: 47, xpRequired: 17672 , rewardType: "coins",   rewardValue: 1200,                 rewardLabel: "1200 Monedas",                icon: "cash",             iconColor: "#F1C40F" },
  { tier: 48, xpRequired: 18432 , rewardType: "avatar",  rewardValue: "avatar_oracle",       rewardLabel: "Avatar: Oráculo",             icon: "eye",              iconColor: "#9B59B6" },
  { tier: 49, xpRequired: 19208 , rewardType: "item",    rewardValue: "back_blood",          rewardLabel: "Dorso: Sangre",               icon: "card",             iconColor: "#6B0000" },
  { tier: 50, xpRequired: 20000 , rewardType: "chest",   rewardValue: "legendary",          rewardLabel: "Cofre Legendario",            icon: "star",             iconColor: "#D4AF37" },
  // ─── Tiers 51-90: extended end-game progression ─────────────────────────────
  { tier: 51, xpRequired: 20808 , rewardType: "coins",   rewardValue: 350,                  rewardLabel: "350 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 52, xpRequired: 21632 , rewardType: "avatar",  rewardValue: "avatar_pirate",      rewardLabel: "Avatar: Pirata",              icon: "skull",            iconColor: "#2C3E50" },
  { tier: 53, xpRequired: 22472 , rewardType: "item",    rewardValue: "back_ruby",          rewardLabel: "Dorso: Rubí",                 icon: "card",             iconColor: "#9B111E" },
  { tier: 54, xpRequired: 23328 , rewardType: "title",   rewardValue: "title_phantom",      rewardLabel: "Título: El Fantasma",         icon: "eye",              iconColor: "#9B59B6" },
  { tier: 55, xpRequired: 24200 , rewardType: "chest",   rewardValue: "rare",               rewardLabel: "Cofre Raro",                  icon: "cube-outline",     iconColor: "#4A90D9" },
  { tier: 56, xpRequired: 25088 , rewardType: "coins",   rewardValue: 400,                  rewardLabel: "400 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 57, xpRequired: 25992 , rewardType: "avatar",  rewardValue: "avatar_cyber",       rewardLabel: "Avatar: Cyber",               icon: "hardware-chip",    iconColor: "#00D4FF" },
  { tier: 58, xpRequired: 26912 , rewardType: "item",    rewardValue: "back_galaxy",        rewardLabel: "Dorso: Galaxia",              icon: "card",             iconColor: "#A855F7" },
  { tier: 59, xpRequired: 27848 , rewardType: "frame",   rewardValue: "frame_neon",         rewardLabel: "Marco: Neón",                 icon: "ellipse",          iconColor: "#FF00FF" },
  { tier: 60, xpRequired: 28800 , rewardType: "chest",   rewardValue: "epic",               rewardLabel: "Cofre Épico",                 icon: "diamond",          iconColor: "#9B59B6" },
  { tier: 61, xpRequired: 29768 , rewardType: "coins",   rewardValue: 500,                  rewardLabel: "500 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 62, xpRequired: 30752 , rewardType: "title",   rewardValue: "title_legend",       rewardLabel: "Título: Leyenda Viviente",    icon: "trophy",           iconColor: "#FFD700" },
  { tier: 63, xpRequired: 31752 , rewardType: "item",    rewardValue: "back_aurora",        rewardLabel: "Dorso: Aurora Boreal",        icon: "card",             iconColor: "#00FFCC" },
  { tier: 64, xpRequired: 32768 , rewardType: "avatar",  rewardValue: "avatar_titan",       rewardLabel: "Avatar: Titán",               icon: "barbell",          iconColor: "#7F8C8D" },
  { tier: 65, xpRequired: 33800 , rewardType: "chest",   rewardValue: "rare",               rewardLabel: "Cofre Raro",                  icon: "cube-outline",     iconColor: "#4A90D9" },
  { tier: 66, xpRequired: 34848 , rewardType: "coins",   rewardValue: 600,                  rewardLabel: "600 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 67, xpRequired: 35912 , rewardType: "avatar",  rewardValue: "avatar_oracle",      rewardLabel: "Avatar: Oráculo",             icon: "eye",              iconColor: "#9B59B6" },
  { tier: 68, xpRequired: 36992 , rewardType: "item",    rewardValue: "back_blood",         rewardLabel: "Dorso: Sangre",               icon: "card",             iconColor: "#6B0000" },
  { tier: 69, xpRequired: 38088 , rewardType: "title",   rewardValue: "title_invincible",   rewardLabel: "Título: Invencible",          icon: "shield",           iconColor: "#C0392B" },
  { tier: 70, xpRequired: 39200 , rewardType: "chest",   rewardValue: "epic",               rewardLabel: "Cofre Épico",                 icon: "diamond",          iconColor: "#9B59B6" },
  { tier: 71, xpRequired: 40328 , rewardType: "coins",   rewardValue: 700,                  rewardLabel: "700 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 72, xpRequired: 41472 , rewardType: "avatar",  rewardValue: "avatar_phoenix",     rewardLabel: "Avatar: Fénix",               icon: "sunny",            iconColor: "#D4AF37" },
  { tier: 73, xpRequired: 42632 , rewardType: "item",    rewardValue: "back_inferno",       rewardLabel: "Dorso: Infierno",             icon: "flame",            iconColor: "#FF6600" },
  { tier: 74, xpRequired: 43808 , rewardType: "frame",   rewardValue: "frame_neon",         rewardLabel: "Marco: Neón",                 icon: "ellipse",          iconColor: "#FF00FF" },
  { tier: 75, xpRequired: 45000 , rewardType: "chest",   rewardValue: "epic",               rewardLabel: "Cofre Épico",                 icon: "diamond",          iconColor: "#9B59B6" },
  { tier: 76, xpRequired: 46208 , rewardType: "coins",   rewardValue: 900,                  rewardLabel: "900 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 77, xpRequired: 47432 , rewardType: "title",   rewardValue: "title_immortal",     rewardLabel: "Título: Inmortal",            icon: "infinite",         iconColor: "#FF6B6B" },
  { tier: 78, xpRequired: 48672 , rewardType: "avatar",  rewardValue: "avatar_reaper",      rewardLabel: "Avatar: Segador",             icon: "moon",             iconColor: "#1a0020" },
  { tier: 79, xpRequired: 49928 , rewardType: "item",    rewardValue: "back_neon",          rewardLabel: "Dorso: Neón",                 icon: "card",             iconColor: "#FF00FF" },
  { tier: 80, xpRequired: 51200 , rewardType: "chest",   rewardValue: "legendary",          rewardLabel: "Cofre Legendario",            icon: "star",             iconColor: "#D4AF37" },
  { tier: 81, xpRequired: 52488 , rewardType: "coins",   rewardValue: 1000,                 rewardLabel: "1000 Monedas",                icon: "cash",             iconColor: "#F1C40F" },
  { tier: 82, xpRequired: 53792 , rewardType: "avatar",  rewardValue: "avatar_king",        rewardLabel: "Avatar: El Rey",              icon: "diamond",          iconColor: "#D4AF37" },
  { tier: 83, xpRequired: 55112 , rewardType: "title",   rewardValue: "title_god",          rewardLabel: "Título: El Dios",             icon: "sparkles",         iconColor: "#D4AF37" },
  { tier: 84, xpRequired: 56448 , rewardType: "item",    rewardValue: "back_galaxy",        rewardLabel: "Dorso: Galaxia",              icon: "card",             iconColor: "#A855F7" },
  { tier: 85, xpRequired: 57800 , rewardType: "chest",   rewardValue: "epic",               rewardLabel: "Cofre Épico",                 icon: "diamond",          iconColor: "#9B59B6" },
  { tier: 86, xpRequired: 59168 , rewardType: "coins",   rewardValue: 1500,                 rewardLabel: "1500 Monedas",                icon: "cash",             iconColor: "#FFD700" },
  { tier: 87, xpRequired: 60552 , rewardType: "avatar",  rewardValue: "avatar_phoenix",     rewardLabel: "Avatar: Fénix Real",          icon: "sunny",            iconColor: "#FFD700" },
  { tier: 88, xpRequired: 61952 , rewardType: "item",    rewardValue: "back_inferno",       rewardLabel: "Dorso: Infierno Final",       icon: "flame",            iconColor: "#FF3300" },
  { tier: 89, xpRequired: 63368 , rewardType: "title",   rewardValue: "title_god",          rewardLabel: "Título: Maestro Supremo",     icon: "sparkles",         iconColor: "#FFD700" },
  { tier: 90, xpRequired: 64800 , rewardType: "chest",   rewardValue: "legendary",          rewardLabel: "¡Cofre Legendario Final!",    icon: "star",             iconColor: "#FFD700" },
];

export function getBPRewardLabel(tier: BattlePassTier, lang: "es" | "en" | "pt"): string {
  if (tier.isExclusive && tier.exclusiveLabel) {
    return tier.exclusiveLabel[lang] ?? tier.exclusiveLabel.es;
  }
  if (lang === "es") return tier.rewardLabel;

  if (tier.rewardType === "coins") {
    const n = typeof tier.rewardValue === "number" ? tier.rewardValue.toLocaleString() : tier.rewardValue;
    const coinWord = lang === "pt" ? "Moedas" : "Coins";
    const isSpecial = tier.rewardLabel.startsWith("¡");
    return isSpecial ? `${n} ${coinWord}!` : `${n} ${coinWord}`;
  }

  if (tier.rewardType === "chest") {
    const chestNames: Record<string, { en: string; pt: string }> = {
      common:    { en: "Common Chest",    pt: "Cofre Comum"    },
      rare:      { en: "Rare Chest",      pt: "Cofre Raro"     },
      epic:      { en: "Epic Chest",      pt: "Cofre Épico"    },
      legendary: { en: "Legendary Chest", pt: "Cofre Lendário" },
    };
    const v = String(tier.rewardValue);
    return chestNames[v]?.[lang] ?? tier.rewardLabel;
  }

  const prefixMap: Record<string, { en: string; pt: string }> = {
    title:  { en: "Title",  pt: "Título"  },
    item:   { en: "Back",   pt: "Dorso"   },
    avatar: { en: "Avatar", pt: "Avatar"  },
    frame:  { en: "Frame",  pt: "Moldura" },
    effect: { en: "Effect", pt: "Efeito"  },
  };

  const prefix = prefixMap[tier.rewardType];
  if (!prefix) return tier.rewardLabel;

  const parts = tier.rewardLabel.split(": ");
  let namePart = parts.length > 1 ? parts.slice(1).join(": ") : parts[0];

  // If the reward value is an item ID, we can try to localize its name
  const itemId = String(tier.rewardValue);
  const foundItem = STORE_ITEMS.find(i => i.id === itemId);
  if (foundItem) {
    const localizedItem = localizeItem(foundItem, lang);
    namePart = localizedItem.name;
  }

  return `${prefix[lang]}: ${namePart}`;
}

export const XP_FOR_LEVEL = (level: number) => Math.floor(60 * Math.pow(level, 1.5));

export function getPlayerLevel(totalXp: number): number {
  let level = 1;
  while (XP_FOR_LEVEL(level + 1) <= totalXp) level++;
  return Math.min(level, 99);
}

export function getXpProgress(totalXp: number): { current: number; needed: number; level: number } {
  const level = getPlayerLevel(totalXp);
  const currentLevelXp = XP_FOR_LEVEL(level);
  const nextLevelXp = XP_FOR_LEVEL(level + 1);
  return {
    current: totalXp - currentLevelXp,
    needed: nextLevelXp - currentLevelXp,
    level,
  };
}

export function getCurrentBattlePassTier(totalXp: number): number {
  let tier = 0;
  for (const t of BATTLE_PASS_TIERS) {
    if (totalXp >= t.xpRequired) tier = t.tier;
  }
  return tier;
}

// ─── SEASONAL ROTATION ──────────────────────────────────────────────────────
// Rotate the cosmetic rewards (item/avatar/frame/title) each season so the
// premium track feels fresh while the XP curve and chest milestones stay
// stable. Coin and chest tiers are NEVER rotated.
function rotatedTier(tier: BattlePassTier, seasonNumber: number): BattlePassTier {
  if (
    tier.rewardType !== "item" &&
    tier.rewardType !== "avatar" &&
    tier.rewardType !== "frame" &&
    tier.rewardType !== "title"
  ) {
    return tier;
  }
  const pool = BATTLE_PASS_TIERS.filter((t) => t.rewardType === tier.rewardType);
  if (pool.length <= 1) return tier;
  const idxInPool = pool.findIndex((t) => t.tier === tier.tier);
  if (idxInPool < 0) return tier;
  const offset = ((seasonNumber - 1) % pool.length + pool.length) % pool.length;
  const replacement = pool[(idxInPool + offset) % pool.length];
  if (replacement.tier === tier.tier) return tier;
  return {
    ...tier,
    rewardValue: replacement.rewardValue,
    rewardLabel: replacement.rewardLabel,
    icon: replacement.icon,
    iconColor: replacement.iconColor,
  };
}

export function getBattlePassTiers(seasonNumber: number): BattlePassTier[] {
  const theme = getSeasonTheme(seasonNumber);
  const rotated = seasonNumber > 1
    ? BATTLE_PASS_TIERS.map((t) => rotatedTier(t, seasonNumber))
    : BATTLE_PASS_TIERS.slice();

  return rotated.map((t) => {
    const slotIdx = EXCLUSIVE_SLOTS.indexOf(t.tier);
    if (slotIdx < 0) return t;
    const exclusive = theme.exclusives[slotIdx % theme.exclusives.length];
    if (!exclusive) return t;
    return {
      ...t,
      rewardType: exclusive.rewardType,
      rewardValue: exclusive.rewardValue,
      rewardLabel: exclusive.label.es,
      icon: exclusive.icon,
      iconColor: exclusive.iconColor,
      isExclusive: true,
      exclusiveLabel: exclusive.label,
    };
  });
}

export function getSeasonExclusiveIds(seasonNumber: number): string[] {
  return getBattlePassTiers(seasonNumber)
    .filter((t) => t.isExclusive)
    .map((t) => String(t.rewardValue));
}

// ─── FREE TRACK ─────────────────────────────────────────────────────────────
// Per spec: free pass should NOT be only coins — must include backs, items,
// emotes and chests (which contain that variety) at meaningful intervals.
export interface FreeReward {
  type: "coins" | "chest";
  coins: number;          // bonus coins (always granted alongside type)
  chestType?: "common" | "rare" | "epic" | "legendary";
  label: string;          // localized in render layer (kept simple here)
  icon: string;
  iconColor: string;
}

export function getFreeReward(tier: number): FreeReward {
  const baseCoins = 25 + tier * 5;
  // Milestone chests (checked in priority order, biggest first)
  if (tier > 0 && tier % 50 === 0) {
    return { type: "chest", chestType: "legendary", coins: baseCoins, label: `Cofre Legendario + ${baseCoins}`, icon: "diamond", iconColor: "#F1C40F" };
  }
  if (tier > 0 && tier % 25 === 0) {
    return { type: "chest", chestType: "epic", coins: baseCoins, label: `Cofre Épico + ${baseCoins}`, icon: "cube", iconColor: "#9B59B6" };
  }
  if (tier > 0 && tier % 10 === 0) {
    return { type: "chest", chestType: "rare", coins: baseCoins, label: `Cofre Raro + ${baseCoins}`, icon: "cube", iconColor: "#3498DB" };
  }
  if (tier > 0 && tier % 5 === 0) {
    return { type: "chest", chestType: "common", coins: baseCoins, label: `Cofre Común + ${baseCoins}`, icon: "cube", iconColor: "#95A5A6" };
  }
  return { type: "coins", coins: baseCoins, label: `${baseCoins} Monedas`, icon: "cash", iconColor: "#F1C40F" };
}
