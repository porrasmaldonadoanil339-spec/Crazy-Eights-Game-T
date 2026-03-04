import React, { useState, useCallback, useRef } from "react";
import {
  View, Text, StyleSheet, FlatList, Pressable, TextInput,
  Modal, Image, Platform, Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { useProfile } from "@/context/ProfileContext";
import { useT } from "@/hooks/useT";
import { CPU_PROFILES } from "@/lib/cpuProfiles";
import { PlayerProfileModal, type PlayerProfileData } from "@/components/PlayerProfileModal";

function seededRand(seed: number) {
  const x = Math.sin(seed + 91) * 10000;
  return x - Math.floor(x);
}

interface Friend {
  id: string;
  name: string;
  level: number;
  avatarIcon: string;
  avatarColor: string;
  photoUrl?: string;
  online: boolean;
  wins: number;
  lastSeen: string;
  titleName: string;
}

interface FriendRequest {
  id: string;
  name: string;
  level: number;
  avatarIcon: string;
  avatarColor: string;
  photoUrl?: string;
  status: "pending" | "accepted" | "rejected";
  direction: "incoming" | "outgoing";
  resolvedAt?: number;
}

const TITLE_NAMES: Record<string, string> = {
  title_rookie: "Novato", title_regular: "Regular", title_pro: "Profesional",
  title_ace: "El As", title_legend: "Leyenda", title_god: "El Dios",
  title_grandmaster: "Gran Maestro", title_immortal: "Inmortal", title_shark: "Tiburón",
  title_hustler: "Buscavidas", title_phantom: "El Fantasma", title_queen: "La Reina",
  title_veteran: "Veterano", title_strategist: "Estratega",
};

const LAST_SEEN = ["Hace 2 min", "Hace 15 min", "Hace 1 hora", "Hace 3 horas", "Ayer", "Hace 2 días"];

function buildInitialFriends(): Friend[] {
  return CPU_PROFILES.slice(0, 18).map((p, i) => ({
    id: p.name,
    name: p.name,
    level: p.level,
    avatarIcon: p.avatarIcon,
    avatarColor: p.avatarColor,
    photoUrl: p.photoUrl,
    online: seededRand(i) > 0.55,
    wins: Math.floor(p.level * 12 + seededRand(i + 5) * 100),
    lastSeen: LAST_SEEN[Math.floor(seededRand(i + 3) * LAST_SEEN.length)],
    titleName: TITLE_NAMES[p.titleId] ?? "Jugador",
  }));
}

function buildPendingRequests(): FriendRequest[] {
  return CPU_PROFILES.slice(18, 21).map((p, i) => ({
    id: p.name + "_req",
    name: p.name,
    level: p.level,
    avatarIcon: p.avatarIcon,
    avatarColor: p.avatarColor,
    photoUrl: p.photoUrl,
    status: "pending" as const,
    direction: "incoming" as const,
  }));
}

export default function FriendsScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const T = useT();
  const isDark = profile.darkMode !== false;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [friends, setFriends] = useState<Friend[]>(buildInitialFriends);
  const [requests, setRequests] = useState<FriendRequest[]>(buildPendingRequests);
  const [tab, setTab] = useState<"friends" | "requests" | "search">("friends");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());
  const [profileModal, setProfileModal] = useState<PlayerProfileData | null>(null);
  const [inviteToast, setInviteToast] = useState<string | null>(null);
  const toastAnim = useRef(new Animated.Value(0)).current;

  const showToast = (msg: string) => {
    setInviteToast(msg);
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.delay(1800),
      Animated.timing(toastAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setInviteToast(null));
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const lower = q.toLowerCase();
    const results = CPU_PROFILES
      .filter(p => p.name.toLowerCase().includes(lower))
      .slice(0, 12)
      .map((p, i) => ({
        id: p.name,
        name: p.name,
        level: p.level,
        avatarIcon: p.avatarIcon,
        avatarColor: p.avatarColor,
        photoUrl: p.photoUrl,
        online: seededRand(i + 22) > 0.5,
        wins: Math.floor(p.level * 12),
        lastSeen: LAST_SEEN[Math.floor(seededRand(i + 6) * LAST_SEEN.length)],
        titleName: TITLE_NAMES[p.titleId] ?? "Jugador",
      }));
    setSearchResults(results);
  };

  const handleAddFriend = (name: string) => {
    setSentRequests(prev => new Set([...prev, name]));
    setProfileModal(null);

    // 70% chance to auto-accept after delay
    const accept = Math.random() < 0.7;
    const delay = 2000 + Math.random() * 3000;
    setTimeout(() => {
      if (accept) {
        const profile = CPU_PROFILES.find(p => p.name === name);
        if (profile) {
          const newFriend: Friend = {
            id: profile.name,
            name: profile.name,
            level: profile.level,
            avatarIcon: profile.avatarIcon,
            avatarColor: profile.avatarColor,
            photoUrl: profile.photoUrl,
            online: Math.random() > 0.4,
            wins: Math.floor(profile.level * 12),
            lastSeen: "Ahora",
            titleName: TITLE_NAMES[profile.titleId] ?? "Jugador",
          };
          setFriends(prev => [newFriend, ...prev.filter(f => f.id !== name)]);
          setSentRequests(prev => { const s = new Set(prev); s.delete(name); return s; });
          showToast(`${name} aceptó tu solicitud`);
        }
      }
    }, delay);

    showToast("Solicitud enviada");
  };

  const handleAcceptRequest = (req: FriendRequest) => {
    const newFriend: Friend = {
      id: req.name,
      name: req.name,
      level: req.level,
      avatarIcon: req.avatarIcon,
      avatarColor: req.avatarColor,
      photoUrl: req.photoUrl,
      online: true,
      wins: Math.floor(req.level * 12),
      lastSeen: "Ahora",
      titleName: "Jugador",
    };
    setFriends(prev => [newFriend, ...prev]);
    setRequests(prev => prev.filter(r => r.id !== req.id));
    showToast(`Ahora eres amigo de ${req.name}`);
  };

  const handleRejectRequest = (req: FriendRequest) => {
    setRequests(prev => prev.filter(r => r.id !== req.id));
  };

  const handleRemoveFriend = (id: string) => {
    setFriends(prev => prev.filter(f => f.id !== id));
  };

  const openProfile = (f: Friend) => {
    setProfileModal({
      name: f.name,
      level: f.level,
      wins: f.wins,
      score: f.wins * 10,
      avatarIcon: f.avatarIcon,
      avatarColor: f.avatarColor,
      photoUrl: f.photoUrl,
      titleName: f.titleName,
      isFriend: true,
    });
  };

  const onlineFriends = friends.filter(f => f.online);
  const offlineFriends = friends.filter(f => !f.online);

  const bg = isDark ? ["#010804", "#041008"] as const : ["#e8f5e2", "#d0e8c8"] as const;
  const surfaceColor = isDark ? Colors.surface : "#c4ddb8";
  const textColor = isDark ? Colors.text : "#1a3a1a";
  const textMuted = isDark ? Colors.textMuted : "#4a7a4a";
  const borderColor = isDark ? Colors.border : "#aacfa0";

  const renderFriend = ({ item }: { item: Friend }) => (
    <Pressable
      style={({ pressed }) => [styles.friendRow, { backgroundColor: surfaceColor, borderColor }, pressed && { opacity: 0.85 }]}
      onPress={() => openProfile(item)}
    >
      <View style={styles.friendLeft}>
        <View style={styles.avatarWrap}>
          {item.photoUrl ? (
            <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarIcon, { backgroundColor: item.avatarColor + "33" }]}>
              <Ionicons name={item.avatarIcon as any} size={22} color={item.avatarColor} />
            </View>
          )}
          <View style={[styles.statusDot, { backgroundColor: item.online ? "#27AE60" : "#555" }]} />
        </View>
        <View style={styles.friendInfo}>
          <Text style={[styles.friendName, { color: textColor }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.friendSub, { color: textMuted }]}>
            Nv.{item.level} · {item.online ? "En línea" : item.lastSeen}
          </Text>
        </View>
      </View>
      <View style={styles.friendRight}>
        <Pressable
          style={[styles.inviteBtn]}
          onPress={() => { showToast(`Invitación enviada a ${item.name}`); }}
        >
          <LinearGradient colors={[Colors.gold, "#A07800"]} style={styles.inviteBtnGrad}>
            <Ionicons name="game-controller" size={13} color="#1a0a00" />
          </LinearGradient>
        </Pressable>
        <Pressable onPress={() => handleRemoveFriend(item.id)} style={styles.removeBtn}>
          <Ionicons name="close-circle-outline" size={18} color={textMuted} />
        </Pressable>
      </View>
    </Pressable>
  );

  const renderRequest = ({ item }: { item: FriendRequest }) => (
    <View style={[styles.requestRow, { backgroundColor: surfaceColor, borderColor }]}>
      <View style={styles.friendLeft}>
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarIcon, { backgroundColor: item.avatarColor + "33" }]}>
            <Ionicons name={item.avatarIcon as any} size={22} color={item.avatarColor} />
          </View>
        )}
        <View style={styles.friendInfo}>
          <Text style={[styles.friendName, { color: textColor }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.friendSub, { color: textMuted }]}>Nv.{item.level} · Quiere ser tu amigo</Text>
        </View>
      </View>
      <View style={styles.requestBtns}>
        <Pressable style={styles.acceptBtn} onPress={() => handleAcceptRequest(item)}>
          <LinearGradient colors={["#27AE60", "#1a7a43"]} style={styles.reqBtnGrad}>
            <Ionicons name="checkmark" size={14} color="#fff" />
          </LinearGradient>
        </Pressable>
        <Pressable style={styles.rejectBtn} onPress={() => handleRejectRequest(item)}>
          <View style={[styles.reqBtnGrad, { backgroundColor: "#E74C3C22", borderWidth: 1, borderColor: "#E74C3C44" }]}>
            <Ionicons name="close" size={14} color="#E74C3C" />
          </View>
        </Pressable>
      </View>
    </View>
  );

  const renderSearchResult = ({ item }: { item: Friend }) => {
    const alreadyFriend = friends.some(f => f.id === item.id);
    const sent = sentRequests.has(item.name);
    return (
      <Pressable
        style={({ pressed }) => [styles.friendRow, { backgroundColor: surfaceColor, borderColor }, pressed && { opacity: 0.85 }]}
        onPress={() => setProfileModal({
          name: item.name, level: item.level, wins: item.wins, score: item.wins * 10,
          avatarIcon: item.avatarIcon, avatarColor: item.avatarColor, photoUrl: item.photoUrl,
          isFriend: alreadyFriend, requestSent: sent,
        })}
      >
        <View style={styles.friendLeft}>
          <View style={styles.avatarWrap}>
            {item.photoUrl ? (
              <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarIcon, { backgroundColor: item.avatarColor + "33" }]}>
                <Ionicons name={item.avatarIcon as any} size={22} color={item.avatarColor} />
              </View>
            )}
          </View>
          <View style={styles.friendInfo}>
            <Text style={[styles.friendName, { color: textColor }]} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.friendSub, { color: textMuted }]}>Nv.{item.level}</Text>
          </View>
        </View>
        {!alreadyFriend && !sent && (
          <Pressable style={styles.addBtn} onPress={() => handleAddFriend(item.name)}>
            <LinearGradient colors={["#27AE60", "#1a7a43"]} style={styles.addBtnGrad}>
              <Ionicons name="person-add" size={14} color="#fff" />
            </LinearGradient>
          </Pressable>
        )}
        {sent && <Ionicons name="checkmark-circle" size={20} color={Colors.textMuted} />}
        {alreadyFriend && <Ionicons name="people" size={18} color={Colors.gold} />}
      </Pressable>
    );
  };

  return (
    <LinearGradient colors={bg} style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={textColor} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: textColor }]}>Amigos</Text>
        <View style={[styles.countBadge, { backgroundColor: Colors.gold + "22" }]}>
          <Text style={styles.countBadgeTxt}>{friends.length}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: borderColor }]}>
        {(["friends", "requests", "search"] as const).map(t => {
          const labels = { friends: "Amigos", requests: `Solicitudes${requests.length ? ` (${requests.length})` : ""}`, search: "Buscar" };
          const icons = { friends: "people", requests: "person-add", search: "search" };
          return (
            <Pressable key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <Ionicons name={icons[t] as any} size={14} color={tab === t ? Colors.gold : textMuted} />
              <Text style={[styles.tabLabel, { color: tab === t ? Colors.gold : textMuted }]}>{labels[t]}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Friends tab */}
      {tab === "friends" && (
        <FlatList
          data={[...onlineFriends, ...offlineFriends]}
          keyExtractor={i => i.id}
          renderItem={renderFriend}
          contentContainerStyle={{ padding: 14, gap: 8, paddingBottom: botPad + 20 }}
          ListHeaderComponent={
            friends.length > 0 ? (
              <View style={styles.onlineHeader}>
                <View style={[styles.onlineDot, { backgroundColor: "#27AE60" }]} />
                <Text style={[styles.onlineHeaderTxt, { color: textMuted }]}>
                  {onlineFriends.length} en línea · {offlineFriends.length} desconectados
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={textMuted} />
              <Text style={[styles.emptyTxt, { color: textMuted }]}>Aún no tienes amigos</Text>
              <Text style={[styles.emptySubTxt, { color: textMuted }]}>Búscalos en la pestaña "Buscar"</Text>
            </View>
          }
        />
      )}

      {/* Requests tab */}
      {tab === "requests" && (
        <FlatList
          data={requests}
          keyExtractor={i => i.id}
          renderItem={renderRequest}
          contentContainerStyle={{ padding: 14, gap: 8, paddingBottom: botPad + 20 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="person-add-outline" size={48} color={textMuted} />
              <Text style={[styles.emptyTxt, { color: textMuted }]}>No hay solicitudes pendientes</Text>
            </View>
          }
        />
      )}

      {/* Search tab */}
      {tab === "search" && (
        <View style={{ flex: 1 }}>
          <View style={[styles.searchBox, { backgroundColor: surfaceColor, borderColor }]}>
            <Ionicons name="search" size={16} color={textMuted} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Buscar jugadores..."
              placeholderTextColor={textMuted}
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => { setSearchQuery(""); setSearchResults([]); }}>
                <Ionicons name="close-circle" size={16} color={textMuted} />
              </Pressable>
            )}
          </View>
          <FlatList
            data={searchResults}
            keyExtractor={i => i.id}
            renderItem={renderSearchResult}
            contentContainerStyle={{ padding: 14, gap: 8, paddingBottom: botPad + 20 }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="search-outline" size={44} color={textMuted} />
                <Text style={[styles.emptyTxt, { color: textMuted }]}>
                  {searchQuery.length < 2 ? "Escribe al menos 2 caracteres" : "No se encontraron jugadores"}
                </Text>
              </View>
            }
          />
        </View>
      )}

      {/* Player profile modal */}
      <PlayerProfileModal
        visible={!!profileModal}
        player={profileModal}
        onClose={() => setProfileModal(null)}
        onAddFriend={handleAddFriend}
        onInvite={(name) => { setProfileModal(null); showToast(`Invitación enviada a ${name}`); }}
      />

      {/* Toast */}
      {inviteToast && (
        <Animated.View style={[styles.toast, { opacity: toastAnim, bottom: botPad + 20 }]}>
          <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
          <Text style={styles.toastTxt}>{inviteToast}</Text>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: "Nunito_900ExtraBold",
    fontSize: 20,
    flex: 1,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gold + "44",
  },
  countBadgeTxt: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
    color: Colors.gold,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginHorizontal: 14,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: Colors.gold,
  },
  tabLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 12,
  },
  onlineHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  onlineHeaderTxt: {
    fontFamily: "Nunito_700Bold",
    fontSize: 11,
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  requestRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  friendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#041008",
  },
  friendInfo: { flex: 1, gap: 2 },
  friendName: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
  },
  friendSub: {
    fontFamily: "Nunito_400Regular",
    fontSize: 11,
  },
  friendRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  inviteBtn: {
    borderRadius: 8,
    overflow: "hidden",
  },
  inviteBtnGrad: {
    padding: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtn: { padding: 4 },
  requestBtns: {
    flexDirection: "row",
    gap: 6,
  },
  acceptBtn: { borderRadius: 8, overflow: "hidden" },
  rejectBtn: { borderRadius: 8, overflow: "hidden" },
  reqBtnGrad: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: { borderRadius: 8, overflow: "hidden" },
  addBtnGrad: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 14,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    padding: 0,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    gap: 8,
  },
  emptyTxt: {
    fontFamily: "Nunito_700Bold",
    fontSize: 15,
  },
  emptySubTxt: {
    fontFamily: "Nunito_400Regular",
    fontSize: 12,
  },
  toast: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toastTxt: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    color: Colors.text,
  },
});
