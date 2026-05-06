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

// Localized prefix used in front of a reward's name. `item` is the card-back
// category in the SeasonExclusive type system. Shared by both Battle Pass
// reward labels and seasonal-exclusive labels.
export const BP_PREFIXES: Record<
  "avatar" | "frame" | "title" | "item" | "effect",
  Record<Lang, string>
> = {
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
  effect: {
    es:"Efecto", en:"Effect", pt:"Efeito", fr:"Effet", de:"Effekt", it:"Effetto",
    tr:"Efekt", ru:"Эффект", pl:"Efekt", nl:"Effect", sv:"Effekt", da:"Effekt",
    fi:"Tehoste", no:"Effekt", zh:"特效", ja:"エフェクト", ko:"이펙트", hi:"प्रभाव",
    th:"เอฟเฟกต์", vi:"Hiệu ứng", id:"Efek", ar:"تأثير",
  },
};

// Backwards-compat alias used internally for the SeasonExclusive prefixes.
const EXCLUSIVE_PREFIXES: Record<SeasonExclusive["rewardType"], Record<Lang, string>> = {
  avatar: BP_PREFIXES.avatar,
  frame: BP_PREFIXES.frame,
  title: BP_PREFIXES.title,
  item: BP_PREFIXES.item,
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
  { tier:  2, xpRequired: 32    ,    rewardType: "effect",  rewardValue: "effect_sparkle",      rewardLabel: "Efecto: Destellos",           icon: "sparkles",         iconColor: "#D4AF37" },
  { tier:  3, xpRequired: 72    ,    rewardType: "item",    rewardValue: "back_crimson",        rewardLabel: "Dorso: Carmesí",              icon: "card",             iconColor: "#C0392B" },
  { tier:  4, xpRequired: 128   ,    rewardType: "frame",   rewardValue: "frame_silver",        rewardLabel: "Marco: Plata",                icon: "ellipse",          iconColor: "#C0C0C0" },
  { tier:  5, xpRequired: 200   ,    rewardType: "avatar",  rewardValue: "avatar_wizard",       rewardLabel: "Avatar: Mago",                icon: "sparkles",         iconColor: "#9B59B6" },
  { tier:  6, xpRequired: 288   ,   rewardType: "effect",  rewardValue: "effect_confetti",     rewardLabel: "Efecto: Confeti",             icon: "balloon",          iconColor: "#FF69B4" },
  { tier:  7, xpRequired: 392   ,   rewardType: "coins",   rewardValue: 250,                  rewardLabel: "250 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier:  8, xpRequired: 512   ,   rewardType: "item",    rewardValue: "back_emerald",        rewardLabel: "Dorso: Esmeralda",            icon: "card",             iconColor: "#0E6655" },
  { tier:  9, xpRequired: 648   ,   rewardType: "title",   rewardValue: "title_pro",           rewardLabel: "Título: Profesional",         icon: "ribbon",           iconColor: "#2196F3" },
  { tier: 10, xpRequired: 800   ,   rewardType: "chest",   rewardValue: "rare",               rewardLabel: "Cofre Raro",                  icon: "cube-outline",     iconColor: "#4A90D9" },
  { tier: 11, xpRequired: 968   ,   rewardType: "avatar",  rewardValue: "avatar_samurai",      rewardLabel: "Avatar: Samurái",             icon: "cut",              iconColor: "#E74C3C" },
  { tier: 12, xpRequired: 1152  ,   rewardType: "item",    rewardValue: "back_gold",           rewardLabel: "Dorso: Oro Real",             icon: "card",             iconColor: "#D4AF37" },
  { tier: 13, xpRequired: 1352  ,   rewardType: "effect",  rewardValue: "effect_fire",         rewardLabel: "Efecto: Llamas",              icon: "flame",            iconColor: "#E74C3C" },
  { tier: 14, xpRequired: 1568  ,   rewardType: "title",   rewardValue: "title_strategist",    rewardLabel: "Título: Estratega",           icon: "git-network",      iconColor: "#1A8FC1" },
  { tier: 15, xpRequired: 1800  ,   rewardType: "avatar",  rewardValue: "avatar_ninja",        rewardLabel: "Avatar: Ninja",               icon: "eye-off",          iconColor: "#2C3E50" },
  { tier: 16, xpRequired: 2048  ,   rewardType: "item",    rewardValue: "back_midnight",       rewardLabel: "Dorso: Medianoche",           icon: "card",             iconColor: "#C0C0C0" },
  { tier: 17, xpRequired: 2312  ,  rewardType: "frame",   rewardValue: "frame_gold",          rewardLabel: "Marco: Oro",                  icon: "ellipse",          iconColor: "#D4AF37" },
  { tier: 18, xpRequired: 2592  ,  rewardType: "avatar",  rewardValue: "avatar_dragon",       rewardLabel: "Avatar: Dragón",              icon: "flame",            iconColor: "#E67E22" },
  { tier: 19, xpRequired: 2888  ,  rewardType: "title",   rewardValue: "title_grandmaster",   rewardLabel: "Título: Gran Maestro",        icon: "medal",            iconColor: "#D4AF37" },
  { tier: 20, xpRequired: 3200  ,  rewardType: "chest",   rewardValue: "epic",               rewardLabel: "Cofre Épico",                 icon: "diamond",          iconColor: "#9B59B6" },
  // ─── Tiers 21-40: Epic rewards ──────────────────────────────────────────────
  { tier: 21, xpRequired: 3528  ,  rewardType: "effect",  rewardValue: "effect_electric",     rewardLabel: "Efecto: Eléctrico",           icon: "flash",            iconColor: "#FFFF00" },
  { tier: 22, xpRequired: 3872  ,  rewardType: "avatar",  rewardValue: "avatar_pirate",       rewardLabel: "Avatar: Pirata",              icon: "skull",            iconColor: "#2C3E50" },
  { tier: 23, xpRequired: 4232  ,  rewardType: "item",    rewardValue: "back_ruby",           rewardLabel: "Dorso: Rubí",                 icon: "card",             iconColor: "#9B111E" },
  { tier: 24, xpRequired: 4608  ,  rewardType: "title",   rewardValue: "title_phantom",       rewardLabel: "Título: El Fantasma",         icon: "eye",              iconColor: "#9B59B6" },
  { tier: 25, xpRequired: 5000  ,  rewardType: "coins",   rewardValue: 750,                  rewardLabel: "750 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
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
  { tier: 42, xpRequired: 14112 , rewardType: "effect",  rewardValue: "effect_plasma_r",     rewardLabel: "Efecto: Plasma",              icon: "nuclear",          iconColor: "#FF00FF" },
  { tier: 43, xpRequired: 14792 , rewardType: "avatar",  rewardValue: "avatar_titan",        rewardLabel: "Avatar: Titán",               icon: "barbell",          iconColor: "#7F8C8D" },
  { tier: 44, xpRequired: 15488 , rewardType: "frame",   rewardValue: "frame_neon",          rewardLabel: "Marco: Neón",                 icon: "ellipse",          iconColor: "#FF00FF" },
  { tier: 45, xpRequired: 16200 , rewardType: "item",    rewardValue: "back_aurora",         rewardLabel: "Dorso: Aurora Boreal",        icon: "card",             iconColor: "#00FFCC" },
  { tier: 46, xpRequired: 16928 , rewardType: "title",   rewardValue: "title_invincible",    rewardLabel: "Título: Invencible",          icon: "shield",           iconColor: "#C0392B" },
  { tier: 47, xpRequired: 17672 , rewardType: "coins",   rewardValue: 1200,                 rewardLabel: "1200 Monedas",                icon: "cash",             iconColor: "#F1C40F" },
  { tier: 48, xpRequired: 18432 , rewardType: "avatar",  rewardValue: "avatar_oracle",       rewardLabel: "Avatar: Oráculo",             icon: "eye",              iconColor: "#9B59B6" },
  { tier: 49, xpRequired: 19208 , rewardType: "item",    rewardValue: "back_blood",          rewardLabel: "Dorso: Sangre",               icon: "card",             iconColor: "#6B0000" },
  { tier: 50, xpRequired: 20000 , rewardType: "chest",   rewardValue: "legendary",          rewardLabel: "Cofre Legendario",            icon: "star",             iconColor: "#D4AF37" },
  // ─── Tiers 51-90: extended end-game progression ─────────────────────────────
  { tier: 51, xpRequired: 20808 , rewardType: "effect",  rewardValue: "effect_crystal_r",    rewardLabel: "Efecto: Cristalino",          icon: "diamond",          iconColor: "#F0F8FF" },
  { tier: 52, xpRequired: 21632 , rewardType: "avatar",  rewardValue: "avatar_pirate",      rewardLabel: "Avatar: Pirata",              icon: "skull",            iconColor: "#2C3E50" },
  { tier: 53, xpRequired: 22472 , rewardType: "item",    rewardValue: "back_ruby",          rewardLabel: "Dorso: Rubí",                 icon: "card",             iconColor: "#9B111E" },
  { tier: 54, xpRequired: 23328 , rewardType: "title",   rewardValue: "title_phantom",      rewardLabel: "Título: El Fantasma",         icon: "eye",              iconColor: "#9B59B6" },
  { tier: 55, xpRequired: 24200 , rewardType: "chest",   rewardValue: "rare",               rewardLabel: "Cofre Raro",                  icon: "cube-outline",     iconColor: "#4A90D9" },
  { tier: 56, xpRequired: 25088 , rewardType: "coins",   rewardValue: 400,                  rewardLabel: "400 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 57, xpRequired: 25992 , rewardType: "avatar",  rewardValue: "avatar_cyber",       rewardLabel: "Avatar: Cyber",               icon: "hardware-chip",    iconColor: "#00D4FF" },
  { tier: 58, xpRequired: 26912 , rewardType: "item",    rewardValue: "back_galaxy",        rewardLabel: "Dorso: Galaxia",              icon: "card",             iconColor: "#A855F7" },
  { tier: 59, xpRequired: 27848 , rewardType: "frame",   rewardValue: "frame_neon",         rewardLabel: "Marco: Neón",                 icon: "ellipse",          iconColor: "#FF00FF" },
  { tier: 60, xpRequired: 28800 , rewardType: "chest",   rewardValue: "epic",               rewardLabel: "Cofre Épico",                 icon: "diamond",          iconColor: "#9B59B6" },
  { tier: 61, xpRequired: 29768 , rewardType: "effect",  rewardValue: "effect_glitch_r",     rewardLabel: "Efecto: Glitch",              icon: "barcode",          iconColor: "#00FF00" },
  { tier: 62, xpRequired: 30752 , rewardType: "title",   rewardValue: "title_legend",       rewardLabel: "Título: Leyenda Viviente",    icon: "trophy",           iconColor: "#FFD700" },
  { tier: 63, xpRequired: 31752 , rewardType: "item",    rewardValue: "back_aurora",        rewardLabel: "Dorso: Aurora Boreal",        icon: "card",             iconColor: "#00FFCC" },
  { tier: 64, xpRequired: 32768 , rewardType: "avatar",  rewardValue: "avatar_titan",       rewardLabel: "Avatar: Titán",               icon: "barbell",          iconColor: "#7F8C8D" },
  { tier: 65, xpRequired: 33800 , rewardType: "chest",   rewardValue: "rare",               rewardLabel: "Cofre Raro",                  icon: "cube-outline",     iconColor: "#4A90D9" },
  { tier: 66, xpRequired: 34848 , rewardType: "coins",   rewardValue: 600,                  rewardLabel: "600 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 67, xpRequired: 35912 , rewardType: "avatar",  rewardValue: "avatar_oracle",      rewardLabel: "Avatar: Oráculo",             icon: "eye",              iconColor: "#9B59B6" },
  { tier: 68, xpRequired: 36992 , rewardType: "item",    rewardValue: "back_blood",         rewardLabel: "Dorso: Sangre",               icon: "card",             iconColor: "#6B0000" },
  { tier: 69, xpRequired: 38088 , rewardType: "title",   rewardValue: "title_invincible",   rewardLabel: "Título: Invencible",          icon: "shield",           iconColor: "#C0392B" },
  { tier: 70, xpRequired: 39200 , rewardType: "chest",   rewardValue: "epic",               rewardLabel: "Cofre Épico",                 icon: "diamond",          iconColor: "#9B59B6" },
  { tier: 71, xpRequired: 40328 , rewardType: "effect",  rewardValue: "effect_gold_dust",    rewardLabel: "Efecto: Polvo de Oro",        icon: "sparkles",         iconColor: "#FFD700" },
  { tier: 72, xpRequired: 41472 , rewardType: "avatar",  rewardValue: "avatar_phoenix",     rewardLabel: "Avatar: Fénix",               icon: "sunny",            iconColor: "#D4AF37" },
  { tier: 73, xpRequired: 42632 , rewardType: "item",    rewardValue: "back_inferno",       rewardLabel: "Dorso: Infierno",             icon: "flame",            iconColor: "#FF6600" },
  { tier: 74, xpRequired: 43808 , rewardType: "frame",   rewardValue: "frame_neon",         rewardLabel: "Marco: Neón",                 icon: "ellipse",          iconColor: "#FF00FF" },
  { tier: 75, xpRequired: 45000 , rewardType: "chest",   rewardValue: "epic",               rewardLabel: "Cofre Épico",                 icon: "diamond",          iconColor: "#9B59B6" },
  { tier: 76, xpRequired: 46208 , rewardType: "coins",   rewardValue: 900,                  rewardLabel: "900 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 77, xpRequired: 47432 , rewardType: "title",   rewardValue: "title_immortal",     rewardLabel: "Título: Inmortal",            icon: "infinite",         iconColor: "#FF6B6B" },
  { tier: 78, xpRequired: 48672 , rewardType: "avatar",  rewardValue: "avatar_reaper",      rewardLabel: "Avatar: Segador",             icon: "moon",             iconColor: "#1a0020" },
  { tier: 79, xpRequired: 49928 , rewardType: "item",    rewardValue: "back_neon",          rewardLabel: "Dorso: Neón",                 icon: "card",             iconColor: "#FF00FF" },
  { tier: 80, xpRequired: 51200 , rewardType: "chest",   rewardValue: "legendary",          rewardLabel: "Cofre Legendario",            icon: "star",             iconColor: "#D4AF37" },
  { tier: 81, xpRequired: 52488 , rewardType: "effect",  rewardValue: "effect_cyber_r",      rewardLabel: "Efecto: Cyberpuntos",         icon: "grid",             iconColor: "#00FFFF" },
  { tier: 82, xpRequired: 53792 , rewardType: "avatar",  rewardValue: "avatar_king",        rewardLabel: "Avatar: El Rey",              icon: "diamond",          iconColor: "#D4AF37" },
  { tier: 83, xpRequired: 55112 , rewardType: "title",   rewardValue: "title_god",          rewardLabel: "Título: El Dios",             icon: "sparkles",         iconColor: "#D4AF37" },
  { tier: 84, xpRequired: 56448 , rewardType: "item",    rewardValue: "back_galaxy",        rewardLabel: "Dorso: Galaxia",              icon: "card",             iconColor: "#A855F7" },
  { tier: 85, xpRequired: 57800 , rewardType: "chest",   rewardValue: "epic",               rewardLabel: "Cofre Épico",                 icon: "diamond",          iconColor: "#9B59B6" },
  { tier: 86, xpRequired: 59168 , rewardType: "coins",   rewardValue: 1500,                 rewardLabel: "1500 Monedas",                icon: "cash",             iconColor: "#FFD700" },
  { tier: 87, xpRequired: 60552 , rewardType: "avatar",  rewardValue: "avatar_phoenix",     rewardLabel: "Avatar: Fénix Real",          icon: "sunny",            iconColor: "#FFD700" },
  { tier: 88, xpRequired: 61952 , rewardType: "item",    rewardValue: "back_inferno",       rewardLabel: "Dorso: Infierno Final",       icon: "flame",            iconColor: "#FF3300" },
  { tier: 89, xpRequired: 63368 , rewardType: "title",   rewardValue: "title_god",          rewardLabel: "Título: Maestro Supremo",     icon: "sparkles",         iconColor: "#FFD700" },
  { tier: 90, xpRequired: 64800 , rewardType: "chest",   rewardValue: "legendary",          rewardLabel: "¡Cofre Legendario Final!",    icon: "star",             iconColor: "#FFD700" },
  // ─── Tiers 91-120: Endgame stretch — added for the 120-mission cap ──────────
  { tier:  91, xpRequired: 66248 , rewardType: "coins",   rewardValue: 600,                  rewardLabel: "600 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier:  92, xpRequired: 67712 , rewardType: "effect",  rewardValue: "effect_sparkle",      rewardLabel: "Efecto: Destellos",           icon: "sparkles",         iconColor: "#D4AF37" },
  { tier:  93, xpRequired: 69192 , rewardType: "item",    rewardValue: "back_galaxy",        rewardLabel: "Dorso: Galaxia",              icon: "card",             iconColor: "#A855F7" },
  { tier:  94, xpRequired: 70688 , rewardType: "chest",   rewardValue: "epic",               rewardLabel: "Cofre Épico",                 icon: "diamond",          iconColor: "#9B59B6" },
  { tier:  95, xpRequired: 72200 , rewardType: "frame",   rewardValue: "frame_neon",         rewardLabel: "Marco: Neón",                 icon: "ellipse",          iconColor: "#FF00FF" },
  { tier:  96, xpRequired: 73728 , rewardType: "coins",   rewardValue: 800,                  rewardLabel: "800 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier:  97, xpRequired: 75272 , rewardType: "avatar",  rewardValue: "avatar_phoenix",     rewardLabel: "Avatar: Fénix Real",          icon: "sunny",            iconColor: "#FFD700" },
  { tier:  98, xpRequired: 76832 , rewardType: "title",   rewardValue: "title_immortal",     rewardLabel: "Título: Inmortal",            icon: "infinite",         iconColor: "#FF6B6B" },
  { tier:  99, xpRequired: 78408 , rewardType: "item",    rewardValue: "back_inferno",       rewardLabel: "Dorso: Infierno Final",       icon: "flame",            iconColor: "#FF3300" },
  { tier: 100, xpRequired: 80000 , rewardType: "chest",   rewardValue: "legendary",          rewardLabel: "Cofre Legendario · Hito 100", icon: "trophy",           iconColor: "#FFD700" },
  { tier: 101, xpRequired: 81608 , rewardType: "coins",   rewardValue: 750,                  rewardLabel: "750 Monedas",                 icon: "cash",             iconColor: "#F1C40F" },
  { tier: 102, xpRequired: 83232 , rewardType: "effect",  rewardValue: "effect_fire",         rewardLabel: "Efecto: Llamas",              icon: "flame",            iconColor: "#E74C3C" },
  { tier: 103, xpRequired: 84872 , rewardType: "frame",   rewardValue: "frame_gold",          rewardLabel: "Marco: Oro",                  icon: "ellipse",          iconColor: "#D4AF37" },
  { tier: 104, xpRequired: 86528 , rewardType: "item",    rewardValue: "back_neon",          rewardLabel: "Dorso: Neón",                 icon: "card",             iconColor: "#FF00FF" },
  { tier: 105, xpRequired: 88200 , rewardType: "chest",   rewardValue: "epic",               rewardLabel: "Cofre Épico",                 icon: "diamond",          iconColor: "#9B59B6" },
  { tier: 106, xpRequired: 89888 , rewardType: "coins",   rewardValue: 1000,                 rewardLabel: "1000 Monedas",                icon: "cash",             iconColor: "#F1C40F" },
  { tier: 107, xpRequired: 91592 , rewardType: "avatar",  rewardValue: "avatar_king",        rewardLabel: "Avatar: El Rey",              icon: "diamond",          iconColor: "#D4AF37" },
  { tier: 108, xpRequired: 93312 , rewardType: "effect",  rewardValue: "effect_confetti",     rewardLabel: "Efecto: Confeti",             icon: "balloon",          iconColor: "#FF69B4" },
  { tier: 109, xpRequired: 95048 , rewardType: "title",   rewardValue: "title_god",          rewardLabel: "Título: Maestro Supremo",     icon: "sparkles",         iconColor: "#FFD700" },
  { tier: 110, xpRequired: 96800 , rewardType: "chest",   rewardValue: "legendary",          rewardLabel: "Cofre Legendario · Hito 110", icon: "trophy",           iconColor: "#FFD700" },
  { tier: 111, xpRequired: 98568 , rewardType: "coins",   rewardValue: 1200,                 rewardLabel: "1200 Monedas",                icon: "cash",             iconColor: "#F1C40F" },
  { tier: 112, xpRequired: 100352, rewardType: "effect",  rewardValue: "effect_cyber_r",      rewardLabel: "Efecto: Cyberpuntos",         icon: "grid",             iconColor: "#00FFFF" },
  { tier: 113, xpRequired: 102152, rewardType: "item",    rewardValue: "back_midnight",       rewardLabel: "Dorso: Medianoche",           icon: "card",             iconColor: "#C0C0C0" },
  { tier: 114, xpRequired: 103968, rewardType: "frame",   rewardValue: "frame_silver",        rewardLabel: "Marco: Plata",                icon: "ellipse",          iconColor: "#C0C0C0" },
  { tier: 115, xpRequired: 105800, rewardType: "chest",   rewardValue: "epic",               rewardLabel: "Cofre Épico",                 icon: "diamond",          iconColor: "#9B59B6" },
  { tier: 116, xpRequired: 107648, rewardType: "coins",   rewardValue: 1500,                 rewardLabel: "1500 Monedas",                icon: "cash",             iconColor: "#FFD700" },
  { tier: 117, xpRequired: 109512, rewardType: "avatar",  rewardValue: "avatar_reaper",      rewardLabel: "Avatar: Segador",             icon: "moon",             iconColor: "#1a0020" },
  { tier: 118, xpRequired: 111392, rewardType: "title",   rewardValue: "title_god",          rewardLabel: "Título: El Dios",             icon: "sparkles",         iconColor: "#D4AF37" },
  { tier: 119, xpRequired: 113288, rewardType: "item",    rewardValue: "back_gold",           rewardLabel: "Dorso: Oro Real",             icon: "card",             iconColor: "#D4AF37" },
  { tier: 120, xpRequired: 115200, rewardType: "chest",   rewardValue: "legendary",          rewardLabel: "¡GRAN PREMIO · Cofre Legendario Supremo!", icon: "trophy",  iconColor: "#FFD700" },
];

// ─── BATTLE PASS LABEL LOCALIZATION ─────────────────────────────────────────
// Localized "Coins" suffix for the "<n> Coins" coin-tier label.
const BP_COIN_WORD: Record<Lang, string> = {
  es:"Monedas", en:"Coins", pt:"Moedas", fr:"Pièces", de:"Münzen", it:"Monete",
  tr:"Altın", ru:"Монет", pl:"Monet", nl:"Munten", sv:"Mynt", da:"Mønter",
  fi:"Kolikkoa", no:"Mynter", zh:"金币", ja:"コイン", ko:"코인", hi:"सिक्के",
  th:"เหรียญ", vi:"Xu", id:"Koin", ar:"عملات",
};

// Localized full names for each chest rarity used as Battle Pass rewards.
const BP_CHEST_NAMES: Record<"common" | "rare" | "epic" | "legendary", Record<Lang, string>> = {
  common: {
    es:"Cofre Común", en:"Common Chest", pt:"Cofre Comum", fr:"Coffre Commun",
    de:"Gewöhnliche Truhe", it:"Forziere Comune", tr:"Sıradan Sandık", ru:"Обычный Сундук",
    pl:"Zwykła Skrzynia", nl:"Gewone Kist", sv:"Vanlig Kista", da:"Almindelig Kiste",
    fi:"Tavallinen Arkku", no:"Vanlig Kiste", zh:"普通宝箱", ja:"ノーマル宝箱",
    ko:"일반 상자", hi:"साधारण संदूक", th:"หีบธรรมดา", vi:"Rương Thường",
    id:"Peti Biasa", ar:"صندوق عادي",
  },
  rare: {
    es:"Cofre Raro", en:"Rare Chest", pt:"Cofre Raro", fr:"Coffre Rare",
    de:"Seltene Truhe", it:"Forziere Raro", tr:"Nadir Sandık", ru:"Редкий Сундук",
    pl:"Rzadka Skrzynia", nl:"Zeldzame Kist", sv:"Sällsynt Kista", da:"Sjælden Kiste",
    fi:"Harvinainen Arkku", no:"Sjelden Kiste", zh:"稀有宝箱", ja:"レア宝箱",
    ko:"희귀 상자", hi:"दुर्लभ संदूक", th:"หีบหายาก", vi:"Rương Hiếm",
    id:"Peti Langka", ar:"صندوق نادر",
  },
  epic: {
    es:"Cofre Épico", en:"Epic Chest", pt:"Cofre Épico", fr:"Coffre Épique",
    de:"Epische Truhe", it:"Forziere Epico", tr:"Destansı Sandık", ru:"Эпический Сундук",
    pl:"Epicka Skrzynia", nl:"Epische Kist", sv:"Episk Kista", da:"Episk Kiste",
    fi:"Eeppinen Arkku", no:"Episk Kiste", zh:"史诗宝箱", ja:"エピック宝箱",
    ko:"에픽 상자", hi:"महाकाव्य संदूक", th:"หีบมหากาพย์", vi:"Rương Sử Thi",
    id:"Peti Epik", ar:"صندوق ملحمي",
  },
  legendary: {
    es:"Cofre Legendario", en:"Legendary Chest", pt:"Cofre Lendário", fr:"Coffre Légendaire",
    de:"Legendäre Truhe", it:"Forziere Leggendario", tr:"Efsanevi Sandık", ru:"Легендарный Сундук",
    pl:"Legendarna Skrzynia", nl:"Legendarische Kist", sv:"Legendarisk Kista", da:"Legendarisk Kiste",
    fi:"Legendaarinen Arkku", no:"Legendarisk Kiste", zh:"传说宝箱", ja:"レジェンド宝箱",
    ko:"전설 상자", hi:"पौराणिक संदूक", th:"หีบในตำนาน", vi:"Rương Huyền Thoại",
    id:"Peti Legendaris", ar:"صندوق أسطوري",
  },
};

// Localized names for every cosmetic ID used in the Battle Pass tier list.
// Keyed by reward ID (back_*, avatar_*, title_*, frame_*). The label rendered
// to the player is `${BP_PREFIXES[type][lang]}: ${BP_ITEM_NAMES[id][lang]}`.
const BP_ITEM_NAMES: Record<string, Record<Lang, string>> = {
  // ── Card backs ──────────────────────────────────────────────────────────
  back_crimson: {
    es:"Carmesí", en:"Crimson", pt:"Carmesim", fr:"Cramoisi", de:"Karmesin", it:"Cremisi",
    tr:"Kızıl", ru:"Багровый", pl:"Karmazyn", nl:"Karmozijn", sv:"Karmosin", da:"Karmosin",
    fi:"Karmiininpunainen", no:"Karmosin", zh:"绯红", ja:"クリムゾン", ko:"크림슨",
    hi:"क्रिमसन", th:"แดงเข้ม", vi:"Đỏ Thẫm", id:"Merah Tua", ar:"قرمزي",
  },
  back_emerald: {
    es:"Esmeralda", en:"Emerald", pt:"Esmeralda", fr:"Émeraude", de:"Smaragd", it:"Smeraldo",
    tr:"Zümrüt", ru:"Изумруд", pl:"Szmaragd", nl:"Smaragd", sv:"Smaragd", da:"Smaragd",
    fi:"Smaragdi", no:"Smaragd", zh:"翡翠", ja:"エメラルド", ko:"에메랄드",
    hi:"पन्ना", th:"มรกต", vi:"Lục Bảo", id:"Zamrud", ar:"زمرد",
  },
  back_gold: {
    es:"Oro Real", en:"Royal Gold", pt:"Ouro Real", fr:"Or Royal", de:"Königsgold", it:"Oro Reale",
    tr:"Kraliyet Altını", ru:"Королевское Золото", pl:"Królewskie Złoto", nl:"Koninklijk Goud",
    sv:"Kungligt Guld", da:"Kongeligt Guld", fi:"Kuninkaallinen Kulta", no:"Kongelig Gull",
    zh:"皇家黄金", ja:"ロイヤルゴールド", ko:"로열 골드", hi:"शाही सोना",
    th:"ทองคำหลวง", vi:"Vàng Hoàng Gia", id:"Emas Kerajaan", ar:"ذهب ملكي",
  },
  back_midnight: {
    es:"Medianoche", en:"Midnight", pt:"Meia-noite", fr:"Minuit", de:"Mitternacht", it:"Mezzanotte",
    tr:"Gece Yarısı", ru:"Полночь", pl:"Północ", nl:"Middernacht", sv:"Midnatt", da:"Midnat",
    fi:"Keskiyö", no:"Midnatt", zh:"午夜", ja:"ミッドナイト", ko:"미드나잇",
    hi:"मध्यरात्रि", th:"เที่ยงคืน", vi:"Nửa Đêm", id:"Tengah Malam", ar:"منتصف الليل",
  },
  back_ruby: {
    es:"Rubí", en:"Ruby", pt:"Rubi", fr:"Rubis", de:"Rubin", it:"Rubino",
    tr:"Yakut", ru:"Рубин", pl:"Rubin", nl:"Robijn", sv:"Rubin", da:"Rubin",
    fi:"Rubiini", no:"Rubin", zh:"红宝石", ja:"ルビー", ko:"루비",
    hi:"माणिक", th:"ทับทิม", vi:"Hồng Ngọc", id:"Rubi", ar:"ياقوت",
  },
  back_obsidian: {
    es:"Obsidiana", en:"Obsidian", pt:"Obsidiana", fr:"Obsidienne", de:"Obsidian", it:"Ossidiana",
    tr:"Obsidiyen", ru:"Обсидиан", pl:"Obsydian", nl:"Obsidiaan", sv:"Obsidian", da:"Obsidian",
    fi:"Obsidiaani", no:"Obsidian", zh:"黑曜石", ja:"オブシディアン", ko:"흑요석",
    hi:"ऑब्सीडियन", th:"ออบซิเดียน", vi:"Hắc Diện Thạch", id:"Obsidian", ar:"السبج",
  },
  back_arctic: {
    es:"Ártico", en:"Arctic", pt:"Ártico", fr:"Arctique", de:"Arktis", it:"Artico",
    tr:"Kutup", ru:"Арктика", pl:"Arktyka", nl:"Arctisch", sv:"Arktisk", da:"Arktisk",
    fi:"Arktinen", no:"Arktisk", zh:"北极", ja:"アークティック", ko:"북극",
    hi:"आर्कटिक", th:"อาร์กติก", vi:"Bắc Cực", id:"Arktik", ar:"القطب الشمالي",
  },
  back_galaxy: {
    es:"Galaxia", en:"Galaxy", pt:"Galáxia", fr:"Galaxie", de:"Galaxie", it:"Galassia",
    tr:"Galaksi", ru:"Галактика", pl:"Galaktyka", nl:"Sterrenstelsel", sv:"Galax", da:"Galakse",
    fi:"Galaksi", no:"Galakse", zh:"银河", ja:"ギャラクシー", ko:"갤럭시",
    hi:"आकाशगंगा", th:"กาแล็กซี", vi:"Thiên Hà", id:"Galaksi", ar:"المجرة",
  },
  back_inferno: {
    es:"Infierno", en:"Inferno", pt:"Inferno", fr:"Enfer", de:"Inferno", it:"Inferno",
    tr:"Cehennem", ru:"Преисподняя", pl:"Piekło", nl:"Inferno", sv:"Inferno", da:"Inferno",
    fi:"Helvetin Tuli", no:"Inferno", zh:"炼狱", ja:"インフェルノ", ko:"인페르노",
    hi:"नरकाग्नि", th:"นรก", vi:"Hỏa Ngục", id:"Neraka", ar:"الجحيم",
  },
  back_neon: {
    es:"Neón", en:"Neon", pt:"Néon", fr:"Néon", de:"Neon", it:"Neon",
    tr:"Neon", ru:"Неон", pl:"Neon", nl:"Neon", sv:"Neon", da:"Neon",
    fi:"Neon", no:"Neon", zh:"霓虹", ja:"ネオン", ko:"네온",
    hi:"नियॉन", th:"นีออน", vi:"Đèn Neon", id:"Neon", ar:"نيون",
  },
  back_aurora: {
    es:"Aurora Boreal", en:"Aurora Borealis", pt:"Aurora Boreal", fr:"Aurore Boréale",
    de:"Polarlicht", it:"Aurora Boreale", tr:"Kuzey Işıkları", ru:"Северное Сияние",
    pl:"Zorza Polarna", nl:"Noorderlicht", sv:"Norrsken", da:"Nordlys",
    fi:"Revontulet", no:"Nordlys", zh:"北极光", ja:"オーロラ", ko:"오로라",
    hi:"उत्तरी ज्योति", th:"แสงเหนือ", vi:"Cực Quang", id:"Aurora", ar:"الشفق القطبي",
  },
  back_blood: {
    es:"Sangre", en:"Blood", pt:"Sangue", fr:"Sang", de:"Blut", it:"Sangue",
    tr:"Kan", ru:"Кровь", pl:"Krew", nl:"Bloed", sv:"Blod", da:"Blod",
    fi:"Veri", no:"Blod", zh:"血色", ja:"ブラッド", ko:"블러드",
    hi:"रक्त", th:"เลือด", vi:"Máu", id:"Darah", ar:"الدم",
  },
  // ── Avatars ─────────────────────────────────────────────────────────────
  avatar_wizard: {
    es:"Mago", en:"Wizard", pt:"Mago", fr:"Magicien", de:"Magier", it:"Mago",
    tr:"Büyücü", ru:"Волшебник", pl:"Czarodziej", nl:"Tovenaar", sv:"Trollkarl", da:"Troldmand",
    fi:"Velho", no:"Trollmann", zh:"巫师", ja:"ウィザード", ko:"위저드",
    hi:"जादूगर", th:"พ่อมด", vi:"Phù Thủy", id:"Penyihir", ar:"ساحر",
  },
  avatar_samurai: {
    es:"Samurái", en:"Samurai", pt:"Samurai", fr:"Samouraï", de:"Samurai", it:"Samurai",
    tr:"Samuray", ru:"Самурай", pl:"Samuraj", nl:"Samoerai", sv:"Samuraj", da:"Samurai",
    fi:"Samurai", no:"Samurai", zh:"武士", ja:"侍", ko:"사무라이",
    hi:"सामुराई", th:"ซามูไร", vi:"Samurai", id:"Samurai", ar:"ساموراي",
  },
  avatar_ninja: {
    es:"Ninja", en:"Ninja", pt:"Ninja", fr:"Ninja", de:"Ninja", it:"Ninja",
    tr:"Ninja", ru:"Ниндзя", pl:"Ninja", nl:"Ninja", sv:"Ninja", da:"Ninja",
    fi:"Ninja", no:"Ninja", zh:"忍者", ja:"忍者", ko:"닌자",
    hi:"निंजा", th:"นินจา", vi:"Ninja", id:"Ninja", ar:"نينجا",
  },
  avatar_dragon: {
    es:"Dragón", en:"Dragon", pt:"Dragão", fr:"Dragon", de:"Drache", it:"Drago",
    tr:"Ejderha", ru:"Дракон", pl:"Smok", nl:"Draak", sv:"Drake", da:"Drage",
    fi:"Lohikäärme", no:"Drage", zh:"龙", ja:"ドラゴン", ko:"드래곤",
    hi:"ड्रैगन", th:"มังกร", vi:"Rồng", id:"Naga", ar:"تنين",
  },
  avatar_pirate: {
    es:"Pirata", en:"Pirate", pt:"Pirata", fr:"Pirate", de:"Pirat", it:"Pirata",
    tr:"Korsan", ru:"Пират", pl:"Pirat", nl:"Piraat", sv:"Pirat", da:"Pirat",
    fi:"Merirosvo", no:"Pirat", zh:"海盗", ja:"パイレーツ", ko:"해적",
    hi:"समुद्री लुटेरा", th:"โจรสลัด", vi:"Hải Tặc", id:"Bajak Laut", ar:"قرصان",
  },
  avatar_gladiator: {
    es:"Gladiador", en:"Gladiator", pt:"Gladiador", fr:"Gladiateur", de:"Gladiator", it:"Gladiatore",
    tr:"Gladyatör", ru:"Гладиатор", pl:"Gladiator", nl:"Gladiator", sv:"Gladiator", da:"Gladiator",
    fi:"Gladiaattori", no:"Gladiator", zh:"角斗士", ja:"剣闘士", ko:"검투사",
    hi:"ग्लैडिएटर", th:"นักสู้", vi:"Đấu Sĩ", id:"Gladiator", ar:"مصارع",
  },
  avatar_cyber: {
    es:"Cyber", en:"Cyber", pt:"Cyber", fr:"Cyber", de:"Cyber", it:"Cyber",
    tr:"Siber", ru:"Кибер", pl:"Cyber", nl:"Cyber", sv:"Cyber", da:"Cyber",
    fi:"Kyber", no:"Cyber", zh:"赛博", ja:"サイバー", ko:"사이버",
    hi:"साइबर", th:"ไซเบอร์", vi:"Cyber", id:"Cyber", ar:"سايبر",
  },
  avatar_phoenix: {
    es:"Fénix", en:"Phoenix", pt:"Fênix", fr:"Phénix", de:"Phönix", it:"Fenice",
    tr:"Anka", ru:"Феникс", pl:"Feniks", nl:"Feniks", sv:"Fenix", da:"Føniks",
    fi:"Feeniks", no:"Føniks", zh:"凤凰", ja:"フェニックス", ko:"피닉스",
    hi:"फीनिक्स", th:"ฟีนิกซ์", vi:"Phượng Hoàng", id:"Phoenix", ar:"العنقاء",
  },
  avatar_reaper: {
    es:"Segador", en:"Reaper", pt:"Ceifador", fr:"Faucheur", de:"Sensenmann", it:"Mietitore",
    tr:"Azrail", ru:"Жнец", pl:"Żniwiarz", nl:"Maaier", sv:"Skördemästaren", da:"Høstmand",
    fi:"Viikatemies", no:"Mannen med Ljåen", zh:"死神", ja:"リーパー", ko:"리퍼",
    hi:"मृत्यु दूत", th:"ยมทูต", vi:"Tử Thần", id:"Reaper", ar:"الحاصد",
  },
  avatar_king: {
    es:"El Rey", en:"The King", pt:"O Rei", fr:"Le Roi", de:"Der König", it:"Il Re",
    tr:"Kral", ru:"Король", pl:"Król", nl:"De Koning", sv:"Kungen", da:"Kongen",
    fi:"Kuningas", no:"Kongen", zh:"国王", ja:"キング", ko:"왕",
    hi:"राजा", th:"ราชา", vi:"Đức Vua", id:"Sang Raja", ar:"الملك",
  },
  avatar_titan: {
    es:"Titán", en:"Titan", pt:"Titã", fr:"Titan", de:"Titan", it:"Titano",
    tr:"Titan", ru:"Титан", pl:"Tytan", nl:"Titaan", sv:"Titan", da:"Titan",
    fi:"Titaani", no:"Titan", zh:"泰坦", ja:"タイタン", ko:"타이탄",
    hi:"टाइटन", th:"ไททัน", vi:"Titan", id:"Titan", ar:"عملاق",
  },
  avatar_oracle: {
    es:"Oráculo", en:"Oracle", pt:"Oráculo", fr:"Oracle", de:"Orakel", it:"Oracolo",
    tr:"Kâhin", ru:"Оракул", pl:"Wyrocznia", nl:"Orakel", sv:"Orakel", da:"Orakel",
    fi:"Oraakkeli", no:"Orakel", zh:"先知", ja:"オラクル", ko:"오라클",
    hi:"भविष्यवक्ता", th:"ผู้พยากรณ์", vi:"Nhà Tiên Tri", id:"Oracle", ar:"العرّاف",
  },
  // ── Titles ──────────────────────────────────────────────────────────────
  title_novice: {
    es:"Novato", en:"Novice", pt:"Novato", fr:"Novice", de:"Neuling", it:"Novizio",
    tr:"Acemi", ru:"Новичок", pl:"Nowicjusz", nl:"Beginner", sv:"Nybörjare", da:"Nybegynder",
    fi:"Aloittelija", no:"Nybegynner", zh:"新手", ja:"初心者", ko:"초보자",
    hi:"नौसिखिया", th:"มือใหม่", vi:"Tân Binh", id:"Pemula", ar:"مبتدئ",
  },
  title_rookie: {
    es:"Recién Llegado", en:"Rookie", pt:"Estreante", fr:"Recrue", de:"Anfänger", it:"Recluta",
    tr:"Çaylak", ru:"Новенький", pl:"Żółtodziób", nl:"Groentje", sv:"Rekryt", da:"Rekrut",
    fi:"Tulokas", no:"Rookie", zh:"菜鸟", ja:"ルーキー", ko:"루키",
    hi:"नवागंतुक", th:"หน้าใหม่", vi:"Tân Thủ", id:"Pendatang Baru", ar:"وافد جديد",
  },
  title_pro: {
    es:"Profesional", en:"Pro", pt:"Profissional", fr:"Pro", de:"Profi", it:"Pro",
    tr:"Profesyonel", ru:"Профи", pl:"Zawodowiec", nl:"Pro", sv:"Proffs", da:"Pro",
    fi:"Ammattilainen", no:"Proff", zh:"职业玩家", ja:"プロ", ko:"프로",
    hi:"प्रो", th:"โปร", vi:"Chuyên Nghiệp", id:"Pro", ar:"محترف",
  },
  title_strategist: {
    es:"Estratega", en:"Strategist", pt:"Estrategista", fr:"Stratège", de:"Stratege", it:"Stratega",
    tr:"Stratejist", ru:"Стратег", pl:"Strateg", nl:"Strateeg", sv:"Strateg", da:"Strateg",
    fi:"Strategi", no:"Strateg", zh:"战略家", ja:"ストラテジスト", ko:"전략가",
    hi:"रणनीतिकार", th:"นักวางแผน", vi:"Chiến Lược Gia", id:"Ahli Strategi", ar:"استراتيجي",
  },
  title_grandmaster: {
    es:"Gran Maestro", en:"Grandmaster", pt:"Grão-Mestre", fr:"Grand Maître",
    de:"Großmeister", it:"Gran Maestro", tr:"Büyük Usta", ru:"Гроссмейстер",
    pl:"Arcymistrz", nl:"Grootmeester", sv:"Stormästare", da:"Stormester",
    fi:"Suurmestari", no:"Stormester", zh:"宗师", ja:"グランドマスター",
    ko:"그랜드마스터", hi:"महागुरु", th:"ปรมาจารย์", vi:"Đại Sư", id:"Maha Guru",
    ar:"المعلم الأعلى",
  },
  title_phantom: {
    es:"El Fantasma", en:"The Phantom", pt:"O Fantasma", fr:"Le Fantôme", de:"Das Phantom",
    it:"Il Fantasma", tr:"Hayalet", ru:"Фантом", pl:"Fantom", nl:"Het Fantoom",
    sv:"Fantomen", da:"Fantomet", fi:"Aave", no:"Fantomet", zh:"幻影",
    ja:"ファントム", ko:"팬텀", hi:"प्रेत", th:"แฟนทอม", vi:"Bóng Ma",
    id:"Sang Phantom", ar:"الشبح",
  },
  title_ace: {
    es:"El As", en:"The Ace", pt:"O Ás", fr:"L'As", de:"Das Ass", it:"L'Asso",
    tr:"As", ru:"Туз", pl:"As", nl:"De Aas", sv:"Esset", da:"Esset",
    fi:"Ässä", no:"Esset", zh:"王牌", ja:"エース", ko:"에이스",
    hi:"इक्का", th:"เอซ", vi:"Ách Chủ Bài", id:"Sang As", ar:"الآص",
  },
  title_legend: {
    es:"Leyenda Viviente", en:"Living Legend", pt:"Lenda Viva", fr:"Légende Vivante",
    de:"Lebende Legende", it:"Leggenda Vivente", tr:"Yaşayan Efsane", ru:"Живая Легенда",
    pl:"Żywa Legenda", nl:"Levende Legende", sv:"Levande Legend", da:"Levende Legende",
    fi:"Elävä Legenda", no:"Levende Legende", zh:"活着的传奇", ja:"生ける伝説",
    ko:"살아있는 전설", hi:"जीवित किंवदंती", th:"ตำนานที่ยังมีชีวิต", vi:"Huyền Thoại Sống",
    id:"Legenda Hidup", ar:"أسطورة حية",
  },
  title_immortal: {
    es:"Inmortal", en:"Immortal", pt:"Imortal", fr:"Immortel", de:"Unsterblich", it:"Immortale",
    tr:"Ölümsüz", ru:"Бессмертный", pl:"Nieśmiertelny", nl:"Onsterfelijk", sv:"Odödlig", da:"Udødelig",
    fi:"Kuolematon", no:"Udødelig", zh:"不朽", ja:"イモータル", ko:"불멸자",
    hi:"अमर", th:"อมตะ", vi:"Bất Tử", id:"Abadi", ar:"الخالد",
  },
  title_god: {
    es:"El Dios", en:"The God", pt:"O Deus", fr:"Le Dieu", de:"Der Gott", it:"Il Dio",
    tr:"Tanrı", ru:"Бог", pl:"Bóg", nl:"De God", sv:"Guden", da:"Guden",
    fi:"Jumala", no:"Guden", zh:"神", ja:"神", ko:"신",
    hi:"देवता", th:"เทพเจ้า", vi:"Thần Linh", id:"Sang Dewa", ar:"الإله",
  },
  title_invincible: {
    es:"Invencible", en:"Invincible", pt:"Invencível", fr:"Invincible", de:"Unbesiegbar",
    it:"Invincibile", tr:"Yenilmez", ru:"Непобедимый", pl:"Niezwyciężony", nl:"Onoverwinnelijk",
    sv:"Oövervinnerlig", da:"Uovervindelig", fi:"Voittamaton", no:"Uovervinnelig",
    zh:"无敌", ja:"無敵", ko:"무적", hi:"अजेय", th:"ไร้พ่าย", vi:"Bất Bại",
    id:"Tak Terkalahkan", ar:"الذي لا يُقهر",
  },
  // ── Frames ──────────────────────────────────────────────────────────────
  frame_silver: {
    es:"Plata", en:"Silver", pt:"Prata", fr:"Argent", de:"Silber", it:"Argento",
    tr:"Gümüş", ru:"Серебро", pl:"Srebro", nl:"Zilver", sv:"Silver", da:"Sølv",
    fi:"Hopea", no:"Sølv", zh:"白银", ja:"シルバー", ko:"실버",
    hi:"चाँदी", th:"เงิน", vi:"Bạc", id:"Perak", ar:"فضي",
  },
  frame_gold: {
    es:"Oro", en:"Gold", pt:"Ouro", fr:"Or", de:"Gold", it:"Oro",
    tr:"Altın", ru:"Золото", pl:"Złoto", nl:"Goud", sv:"Guld", da:"Guld",
    fi:"Kulta", no:"Gull", zh:"黄金", ja:"ゴールド", ko:"골드",
    hi:"सोना", th:"ทอง", vi:"Vàng", id:"Emas", ar:"ذهبي",
  },
  frame_neon: {
    es:"Neón", en:"Neon", pt:"Néon", fr:"Néon", de:"Neon", it:"Neon",
    tr:"Neon", ru:"Неон", pl:"Neon", nl:"Neon", sv:"Neon", da:"Neon",
    fi:"Neon", no:"Neon", zh:"霓虹", ja:"ネオン", ko:"네온",
    hi:"नियॉन", th:"นีออน", vi:"Đèn Neon", id:"Neon", ar:"نيون",
  },
  // ── Effects ─────────────────────────────────────────────────────────────
  effect_sparkle: {
    es:"Destellos", en:"Sparkles", pt:"Brilhos", fr:"Étincelles", de:"Funkeln", it:"Scintille",
    tr:"Parıltılar", ru:"Искры", pl:"Iskierki", nl:"Sprankels", sv:"Glitter", da:"Glimt",
    fi:"Kimallus", no:"Glimt", zh:"闪光", ja:"きらめき", ko:"반짝임",
    hi:"चमक", th:"ประกาย", vi:"Lấp Lánh", id:"Kilauan", ar:"بريق",
  },
  effect_confetti: {
    es:"Confeti", en:"Confetti", pt:"Confete", fr:"Confettis", de:"Konfetti", it:"Coriandoli",
    tr:"Konfeti", ru:"Конфетти", pl:"Konfetti", nl:"Confetti", sv:"Konfetti", da:"Konfetti",
    fi:"Konfetti", no:"Konfetti", zh:"彩纸", ja:"紙吹雪", ko:"색종이",
    hi:"कन्फेटी", th:"คอนเฟตติ", vi:"Hoa Giấy", id:"Konfeti", ar:"قصاصات ملونة",
  },
  effect_fire: {
    es:"Llamas", en:"Flames", pt:"Chamas", fr:"Flammes", de:"Flammen", it:"Fiamme",
    tr:"Alevler", ru:"Пламя", pl:"Płomienie", nl:"Vlammen", sv:"Lågor", da:"Flammer",
    fi:"Liekit", no:"Flammer", zh:"火焰", ja:"炎", ko:"화염",
    hi:"लपटें", th:"เปลวไฟ", vi:"Ngọn Lửa", id:"Api", ar:"لهب",
  },
  effect_electric: {
    es:"Eléctrico", en:"Electric", pt:"Elétrico", fr:"Électrique", de:"Elektrisch", it:"Elettrico",
    tr:"Elektrik", ru:"Электричество", pl:"Elektryczny", nl:"Elektrisch", sv:"Elektrisk", da:"Elektrisk",
    fi:"Sähköinen", no:"Elektrisk", zh:"电光", ja:"エレクトリック", ko:"일렉트릭",
    hi:"विद्युत", th:"ไฟฟ้า", vi:"Điện Giật", id:"Listrik", ar:"كهربائي",
  },
  effect_plasma_r: {
    es:"Plasma", en:"Plasma", pt:"Plasma", fr:"Plasma", de:"Plasma", it:"Plasma",
    tr:"Plazma", ru:"Плазма", pl:"Plazma", nl:"Plasma", sv:"Plasma", da:"Plasma",
    fi:"Plasma", no:"Plasma", zh:"等离子", ja:"プラズマ", ko:"플라즈마",
    hi:"प्लाज़्मा", th:"พลาสมา", vi:"Plasma", id:"Plasma", ar:"بلازما",
  },
  effect_crystal_r: {
    es:"Cristalino", en:"Crystalline", pt:"Cristalino", fr:"Cristallin", de:"Kristallin", it:"Cristallino",
    tr:"Kristal", ru:"Кристаллический", pl:"Krystaliczny", nl:"Kristallijn", sv:"Kristallin", da:"Krystallinsk",
    fi:"Kristallinen", no:"Krystallinsk", zh:"水晶", ja:"クリスタル", ko:"크리스탈",
    hi:"क्रिस्टलीय", th:"คริสตัล", vi:"Pha Lê", id:"Kristal", ar:"بلوري",
  },
  effect_glitch_r: {
    es:"Glitch", en:"Glitch", pt:"Glitch", fr:"Glitch", de:"Glitch", it:"Glitch",
    tr:"Glitch", ru:"Глитч", pl:"Glitch", nl:"Glitch", sv:"Glitch", da:"Glitch",
    fi:"Glitch", no:"Glitch", zh:"故障", ja:"グリッチ", ko:"글리치",
    hi:"ग्लिच", th:"กลิตช์", vi:"Glitch", id:"Glitch", ar:"خلل",
  },
  effect_gold_dust: {
    es:"Polvo de Oro", en:"Gold Dust", pt:"Pó de Ouro", fr:"Poussière d'Or",
    de:"Goldstaub", it:"Polvere d'Oro", tr:"Altın Tozu", ru:"Золотая Пыль",
    pl:"Złoty Pył", nl:"Goudstof", sv:"Guldstoft", da:"Guldstøv",
    fi:"Kultapöly", no:"Gullstøv", zh:"金粉", ja:"金粉", ko:"황금가루",
    hi:"स्वर्ण धूल", th:"ผงทอง", vi:"Bụi Vàng", id:"Debu Emas", ar:"غبار الذهب",
  },
  effect_cyber_r: {
    es:"Cyberpuntos", en:"Cyberpoints", pt:"Cyberpontos", fr:"Cyberpoints",
    de:"Cyberpunkte", it:"Cyberpunti", tr:"Sibernoktalar", ru:"Киберточки",
    pl:"Cyberpunkty", nl:"Cyberpunten", sv:"Cyberpoäng", da:"Cyberpoint",
    fi:"Kyberpisteet", no:"Cyberpoeng", zh:"赛博点阵", ja:"サイバーポイント",
    ko:"사이버포인트", hi:"साइबरपॉइंट्स", th:"ไซเบอร์พอยต์", vi:"Điểm Cyber",
    id:"Cyberpoin", ar:"نقاط سايبر",
  },
};

function localizedItemName(rewardValue: string | number, lang: Lang): string | null {
  const id = String(rewardValue);
  const entry = BP_ITEM_NAMES[id];
  if (!entry) return null;
  return entry[lang] ?? entry.en ?? entry.es;
}

function localizedChestName(rewardValue: string | number, lang: Lang): string | null {
  const v = String(rewardValue) as keyof typeof BP_CHEST_NAMES;
  const entry = BP_CHEST_NAMES[v];
  if (!entry) return null;
  return entry[lang] ?? entry.en ?? entry.es;
}

function bpPrefix(type: BattlePassTier["rewardType"], lang: Lang): string | null {
  if (type === "coins" || type === "chest") return null;
  const entry = BP_PREFIXES[type];
  return entry[lang] ?? entry.en ?? entry.es;
}

export function getBPRewardLabel(tier: BattlePassTier, lang: Lang): string {
  if (tier.isExclusive && tier.exclusiveLabel) {
    return tier.exclusiveLabel[lang] ?? tier.exclusiveLabel.en ?? tier.exclusiveLabel.es;
  }
  if (lang === "es") return tier.rewardLabel;

  if (tier.rewardType === "coins") {
    const n = typeof tier.rewardValue === "number"
      ? tier.rewardValue.toLocaleString()
      : tier.rewardValue;
    const coinWord = BP_COIN_WORD[lang] ?? BP_COIN_WORD.en;
    const isSpecial = tier.rewardLabel.startsWith("¡");
    return isSpecial ? `${n} ${coinWord}!` : `${n} ${coinWord}`;
  }

  if (tier.rewardType === "chest") {
    return localizedChestName(tier.rewardValue, lang) ?? tier.rewardLabel;
  }

  const prefix = bpPrefix(tier.rewardType, lang);
  if (!prefix) return tier.rewardLabel;

  const namePart = localizedItemName(tier.rewardValue, lang);
  if (namePart) return `${prefix}: ${namePart}`;

  // Fall back to whatever name appears after the colon in the Spanish label.
  const parts = tier.rewardLabel.split(": ");
  const fallback = parts.length > 1 ? parts.slice(1).join(": ") : parts[0];
  return `${prefix}: ${fallback}`;
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

// Localized label for a free-track reward in the requested language.
// Format: "<Chest Name> + <coins>" for chest milestones, "<coins> <Coins>"
// for plain coin tiers.
export function getFreeRewardLabel(reward: FreeReward, lang: Lang): string {
  if (reward.type === "chest" && reward.chestType) {
    const chestName = localizedChestName(reward.chestType, lang) ?? reward.label;
    return `${chestName} + ${reward.coins}`;
  }
  const coinWord = BP_COIN_WORD[lang] ?? BP_COIN_WORD.en;
  return `${reward.coins} ${coinWord}`;
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
