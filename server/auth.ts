import { Router } from "express";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

const router = Router();

const USERS_FILE = path.join("/tmp", "ocho_users.json");

interface User {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  googleId?: string;
  facebookId?: string;
  stats?: {
    wins: number;
    gamesPlayed: number;
    xp: number;
    coins: number;
  };
}

interface TokenPayload {
  userId: string;
  username: string;
  iat: number;
  exp: number;
}

function loadUsers(): User[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    }
  } catch {}
  return [];
}

function saveUsers(users: User[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

function generateToken(userId: string, username: string): string {
  const payload: TokenPayload = {
    userId,
    username,
    iat: Date.now(),
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };
  const data = JSON.stringify(payload);
  const secret = process.env.SESSION_SECRET || "ocho-locos-secret-2024";
  const sig = crypto.createHmac("sha256", secret).update(data).digest("hex");
  return Buffer.from(data).toString("base64") + "." + sig;
}

function verifyToken(token: string): TokenPayload | null {
  try {
    const [dataB64, sig] = token.split(".");
    if (!dataB64 || !sig) return null;
    const data = Buffer.from(dataB64, "base64").toString("utf8");
    const secret = process.env.SESSION_SECRET || "ocho-locos-secret-2024";
    const expected = crypto.createHmac("sha256", secret).update(data).digest("hex");
    if (sig !== expected) return null;
    const payload = JSON.parse(data) as TokenPayload;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// ─── POST /api/auth/register ─────────────────────────────────────────────────
router.post("/register", (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    return res.status(400).json({ error: "username and password required" });
  }
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: "Username must be 3-20 characters" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  const users = loadUsers();
  const exists = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (exists) {
    return res.status(409).json({ error: "Username already taken" });
  }

  const salt = crypto.randomBytes(32).toString("hex");
  const passwordHash = hashPassword(password, salt);
  const id = crypto.randomBytes(16).toString("hex");

  const newUser: User = {
    id,
    username,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
    stats: { wins: 0, gamesPlayed: 0, xp: 0, coins: 100 },
  };
  users.push(newUser);
  saveUsers(users);

  const token = generateToken(id, username);
  return res.json({ ok: true, token, user: { id, username } });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", (req, res) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    return res.status(400).json({ error: "username and password required" });
  }

  const users = loadUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const hash = hashPassword(password, user.salt);
  if (hash !== user.passwordHash) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const token = generateToken(user.id, user.username);
  return res.json({ ok: true, token, user: { id: user.id, username: user.username } });
});

// ─── POST /api/auth/verify ────────────────────────────────────────────────────
router.post("/verify", (req, res) => {
  const { token } = req.body as { token?: string };
  if (!token) return res.status(400).json({ error: "token required" });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: "invalid or expired token" });
  return res.json({ ok: true, user: { id: payload.userId, username: payload.username } });
});

// ─── POST /api/auth/google ────────────────────────────────────────────────────
router.post("/google", async (req, res) => {
  const { accessToken, idToken } = req.body as { accessToken?: string; idToken?: string };
  const token = idToken || accessToken;
  if (!token) return res.status(400).json({ error: "token required" });

  try {
    const resp = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken || idToken}` },
    });
    if (!resp.ok) {
      return res.status(401).json({ error: "invalid Google token" });
    }
    const gUser = await resp.json() as { sub: string; name: string; email: string; picture?: string };

    const users = loadUsers();
    let user = users.find(u => u.googleId === gUser.sub);

    if (!user) {
      let username = gUser.name?.replace(/[^a-zA-Z0-9_]/g, "").substring(0, 18) || "Player";
      let base = username;
      let counter = 1;
      while (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        username = `${base}${counter++}`;
      }

      const id = crypto.randomBytes(16).toString("hex");
      user = {
        id,
        username,
        passwordHash: "",
        salt: "",
        createdAt: new Date().toISOString(),
        googleId: gUser.sub,
        stats: { wins: 0, gamesPlayed: 0, xp: 0, coins: 100 },
      };
      users.push(user);
      saveUsers(users);
    }

    const authToken = generateToken(user.id, user.username);
    return res.json({ ok: true, token: authToken, user: { id: user.id, username: user.username } });
  } catch (e) {
    return res.status(500).json({ error: "Google auth failed" });
  }
});

// ─── POST /api/auth/facebook ──────────────────────────────────────────────────
router.post("/facebook", async (req, res) => {
  const { accessToken } = req.body as { accessToken?: string };
  if (!accessToken) return res.status(400).json({ error: "accessToken required" });

  try {
    const appId = process.env.FACEBOOK_APP_ID;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    if (!appId || !appSecret) {
      return res.status(503).json({ error: "Facebook not configured" });
    }

    const appTokenResp = await fetch(`https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`);
    const appTokenData = await appTokenResp.json() as { access_token: string };

    const verifyResp = await fetch(`https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${appTokenData.access_token}`);
    const verifyData = await verifyResp.json() as { data: { is_valid: boolean; user_id: string } };
    if (!verifyData.data?.is_valid) {
      return res.status(401).json({ error: "invalid Facebook token" });
    }

    const meResp = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${accessToken}`);
    const fbUser = await meResp.json() as { id: string; name: string };

    const users = loadUsers();
    let user = users.find(u => u.facebookId === fbUser.id);

    if (!user) {
      let username = fbUser.name?.replace(/[^a-zA-Z0-9_]/g, "").substring(0, 18) || "Player";
      let base = username;
      let counter = 1;
      while (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        username = `${base}${counter++}`;
      }
      const id = crypto.randomBytes(16).toString("hex");
      user = {
        id,
        username,
        passwordHash: "",
        salt: "",
        createdAt: new Date().toISOString(),
        facebookId: fbUser.id,
        stats: { wins: 0, gamesPlayed: 0, xp: 0, coins: 100 },
      };
      users.push(user);
      saveUsers(users);
    }

    const authToken = generateToken(user.id, user.username);
    return res.json({ ok: true, token: authToken, user: { id: user.id, username: user.username } });
  } catch {
    return res.status(500).json({ error: "Facebook auth failed" });
  }
});

export default router;
