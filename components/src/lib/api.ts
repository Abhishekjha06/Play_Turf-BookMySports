/**
 * play_Turf API client.
 *
 * In production, set VITE_BACKEND_URL (or REACT_APP_BACKEND_URL) to your FastAPI
 * server (e.g. https://api.playturf.app). All requests are then sent there with
 * `credentials: "include"` so the httpOnly session cookie works.
 *
 * When VITE_BACKEND_URL is unset, every endpoint falls back to in-memory mock data
 * seeded from src/data/seed.ts so the entire app is interactive immediately.
 */
import {
  banners as seedBanners,
  turfs as seedTurfs,
  offers as seedOffers,
  tournaments as seedTournaments,
  type Banner,
  type Turf,
  type Offer,
  type Tournament,
  type Booking,
  type User,
  type Review,
} from "@/data/seed";

const BACKEND_URL =
  (import.meta.env.VITE_BACKEND_URL as string | undefined) ||
  (import.meta.env.REACT_APP_BACKEND_URL as string | undefined) ||
  "";

const USE_MOCK = !BACKEND_URL;

// ---------- mock state (localStorage backed) ----------
const LS_BOOKINGS = "playturf:bookings";
const LS_USER = "playturf:user";
const LS_TURFS = "playturf:turfs";
const LS_BANNERS = "playturf:banners";
const LS_OFFERS = "playturf:offers";
const LS_TOURNAMENTS = "playturf:tournaments";
const LS_FAVORITES = "playturf:favorites";
const LS_REVIEWS = "playturf:reviews";
const LS_ACCESS_TOKEN = "playturf:access_token";
const ADMIN_EMAIL = "jabhishek0606@gamil.com";
const ADMIN_PASSWORD = "9307483082@Aj";

function lsGet<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function lsSet<T>(key: string, val: T) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* noop */ }
}
function lsRemove(key: string) {
  try { localStorage.removeItem(key); } catch { /* noop */ }
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function getMockTurfs(): Turf[]      { return lsGet<Turf[]>(LS_TURFS, seedTurfs); }
function setMockTurfs(v: Turf[])     { lsSet(LS_TURFS, v); }
function getMockBanners(): Banner[]  { return lsGet<Banner[]>(LS_BANNERS, seedBanners); }
function setMockBanners(v: Banner[]) { lsSet(LS_BANNERS, v); }
function getMockOffers(): Offer[]    { return lsGet<Offer[]>(LS_OFFERS, seedOffers); }
function setMockOffers(v: Offer[])   { lsSet(LS_OFFERS, v); }
function getMockTournaments(): Tournament[]    { return lsGet<Tournament[]>(LS_TOURNAMENTS, seedTournaments); }
function setMockTournaments(v: Tournament[])   { lsSet(LS_TOURNAMENTS, v); }

function getMockBookings(): Booking[] { return lsGet<Booking[]>(LS_BOOKINGS, []); }
function setMockBookings(v: Booking[]) { lsSet(LS_BOOKINGS, v); }
function getMockFavorites(): string[] { return lsGet<string[]>(LS_FAVORITES, []); }
function setMockFavorites(v: string[]) { lsSet(LS_FAVORITES, v); }
function getMockReviews(): Review[] { return lsGet<Review[]>(LS_REVIEWS, []); }
function setMockReviews(v: Review[]) { lsSet(LS_REVIEWS, v); }

function getMockUser(): User | null { return lsGet<User | null>(LS_USER, null); }
function setMockUser(u: User | null) { lsSet(LS_USER, u); }

let accessToken = lsGet<string | null>(LS_ACCESS_TOKEN, null);
let refreshPromise: Promise<string | null> | null = null;

type TokenOut = {
  access_token: string;
  token_type?: string;
};
type OtpVerifyPayload = {
  phone: string;
  otp: string;
  name?: string;
  email?: string;
};

function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    lsSet(LS_ACCESS_TOKEN, token);
  } else {
    lsRemove(LS_ACCESS_TOKEN);
  }
}

function normalizeUser(raw: Partial<User> & { role?: string; user_id?: string | number }): User {
  const userId = raw.user_id ?? "";
  const role = raw.role ?? "";
  return {
    user_id: String(userId),
    email: raw.email ?? "",
    name: raw.name ?? "Player",
    picture: raw.picture ?? "",
    is_admin: raw.is_admin ?? role === "admin",
  };
}

async function parseError(res: Response): Promise<string> {
  const json = await res.json().catch(() => null) as { detail?: string } | null;
  if (json?.detail) return json.detail;
  const text = await res.text().catch(() => "");
  return text || `Request failed: ${res.status}`;
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      setAccessToken(null);
      return null;
    }
    const data = (await res.json()) as TokenOut;
    if (!data.access_token) {
      setAccessToken(null);
      return null;
    }
    setAccessToken(data.access_token);
    return data.access_token;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

// ---------- HTTP helper ----------
async function http<T>(path: string, init: RequestInit = {}, retryOnUnauthorized = true): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const res = await fetch(`${BACKEND_URL}/api${path}`, {
    credentials: "include",
    headers,
    ...init,
  });
  if (
    !USE_MOCK &&
    res.status === 401 &&
    retryOnUnauthorized &&
    path !== "/auth/refresh" &&
    path !== "/auth/otp/verify" &&
    path !== "/auth/otp/request"
  ) {
    const nextToken = await refreshAccessToken();
    if (nextToken) {
      return http<T>(path, init, false);
    }
  }
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));

function distanceKm(a?: { lat: number; lng: number }, b?: { lat?: number; lng?: number }) {
  if (!a || typeof b?.lat !== "number" || typeof b?.lng !== "number") return Number.POSITIVE_INFINITY;
  const r = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}

function isOpenNow(timing: string) {
  const match = timing.match(/(\d{1,2}):(\d{2})\s*(AM|PM).*?(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return true;
  const toHour = (h: string, m: string, ap: string) => {
    const base = Number(h) % 12;
    return base + (ap.toUpperCase() === "PM" ? 12 : 0) + Number(m) / 60;
  };
  const start = toHour(match[1], match[2], match[3]);
  const end = toHour(match[4], match[5], match[6]);
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  return end < start ? hour >= start || hour <= end : hour >= start && hour <= end;
}

// ---------- Public API ----------
export const api = {
  // banners
  async listBanners(): Promise<Banner[]> {
    if (USE_MOCK) { await delay(150); return [...getMockBanners()].sort((a, b) => a.order - b.order); }
    return http<Banner[]>("/banners");
  },

  // turfs
  async listTurfs(opts: {
    popular?: boolean;
    nearby?: boolean;
    q?: string;
    city?: string;
    area?: string;
    sport?: string;
    amenity?: string;
    maxPrice?: number;
    minRating?: number;
    openNow?: boolean;
    userLocation?: { lat: number; lng: number };
  } = {}): Promise<Turf[]> {
    if (USE_MOCK) {
      await delay(150);
      let list = getMockTurfs();
      if (opts.popular) list = list.filter((t) => t.is_popular);
      if (opts.nearby) list = list.filter((t) => t.is_nearby);
      if (opts.city) {
        const city = opts.city.toLowerCase();
        list = list.filter((t) => t.city.toLowerCase() === city);
      }
      if (opts.area) {
        const area = opts.area.toLowerCase();
        list = list.filter((t) => t.address.toLowerCase().includes(area));
      }
      if (opts.sport) list = list.filter((t) => t.sport_types.some((s) => s.toLowerCase() === opts.sport?.toLowerCase()));
      if (opts.amenity) list = list.filter((t) => t.amenities.some((a) => a.toLowerCase() === opts.amenity?.toLowerCase()));
      if (opts.maxPrice) list = list.filter((t) => t.price_per_hour <= Number(opts.maxPrice));
      if (opts.minRating) list = list.filter((t) => t.rating >= Number(opts.minRating));
      if (opts.openNow) list = list.filter((t) => isOpenNow(t.timing));
      if (opts.q) {
        const q = opts.q.toLowerCase();
        list = list.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.city.toLowerCase().includes(q) ||
            t.address.toLowerCase().includes(q) ||
            t.sport_types.some((s) => s.toLowerCase().includes(q))
        );
      }
      if (opts.userLocation) {
        list = [...list].sort((a, b) => distanceKm(opts.userLocation, a) - distanceKm(opts.userLocation, b));
      }
      return list;
    }
    const params = new URLSearchParams();
    if (opts.popular) params.set("popular", "1");
    if (opts.nearby) params.set("nearby", "1");
    if (opts.q) params.set("q", opts.q);
    if (opts.city) params.set("city", opts.city);
    if (opts.area) params.set("area", opts.area);
    if (opts.sport) params.set("sport", opts.sport);
    if (opts.amenity) params.set("amenity", opts.amenity);
    if (opts.maxPrice) params.set("maxPrice", String(opts.maxPrice));
    if (opts.minRating) params.set("minRating", String(opts.minRating));
    if (opts.openNow) params.set("openNow", "1");
    const qs = params.toString();
    return http<Turf[]>(`/turfs${qs ? `?${qs}` : ""}`);
  },
  async getTurf(id: string): Promise<Turf> {
    if (USE_MOCK) {
      await delay(120);
      const t = getMockTurfs().find((x) => x.id === id);
      if (!t) throw new Error("Turf not found");
      return t;
    }
    return http<Turf>(`/turfs/${id}`);
  },
  distanceKm,

  // favorites
  async listFavorites(): Promise<string[]> {
    if (USE_MOCK) { await delay(60); return getMockFavorites(); }
    return http<string[]>("/favorites");
  },
  async toggleFavorite(turfId: string): Promise<string[]> {
    if (USE_MOCK) {
      await delay(80);
      const favorites = getMockFavorites();
      const next = favorites.includes(turfId) ? favorites.filter((id) => id !== turfId) : [...favorites, turfId];
      setMockFavorites(next);
      return next;
    }
    return http<string[]>("/favorites/toggle", { method: "POST", body: JSON.stringify({ turf_id: turfId }) });
  },

  // reviews
  async listReviews(turfId: string): Promise<Review[]> {
    if (USE_MOCK) { await delay(80); return getMockReviews().filter((review) => review.turf_id === turfId); }
    return http<Review[]>(`/turfs/${turfId}/reviews`);
  },
  async addReview(turfId: string, rating: number, comment: string): Promise<Review> {
    if (USE_MOCK) {
      await delay(120);
      const user = getMockUser();
      if (!user) throw new Error("Please sign in first");
      const review: Review = {
        id: uid("rev"),
        turf_id: turfId,
        user_id: user.user_id,
        user_name: user.name,
        rating,
        comment,
        created_at: new Date().toISOString(),
      };
      setMockReviews([review, ...getMockReviews()]);
      return review;
    }
    return http<Review>(`/turfs/${turfId}/reviews`, { method: "POST", body: JSON.stringify({ rating, comment }) });
  },

  // offers
  async listOffers(): Promise<Offer[]> {
    if (USE_MOCK) { await delay(120); return getMockOffers(); }
    return http<Offer[]>("/offers");
  },

  // tournaments
  async listTournaments(): Promise<Tournament[]> {
    if (USE_MOCK) { await delay(120); return getMockTournaments(); }
    return http<Tournament[]>("/tournaments");
  },
  async getTournament(id: string): Promise<Tournament> {
    if (USE_MOCK) {
      await delay(120);
      const t = getMockTournaments().find((x) => x.id === id);
      if (!t) throw new Error("Tournament not found");
      return t;
    }
    return http<Tournament>(`/tournaments/${id}`);
  },

  // ---------- AUTH ----------
  async requestOtp(phone: string): Promise<void> {
    if (USE_MOCK) {
      await delay(180);
      return;
    }
    await http<{ message: string }>("/auth/otp/request", { method: "POST", body: JSON.stringify({ phone }) });
  },
  async verifyOtp(payload: OtpVerifyPayload): Promise<User> {
    if (USE_MOCK) {
      await delay(200);
      const u: User = {
        user_id: uid("user"),
        email: payload.email || "you@playturf.app",
        name: payload.name || "Player One",
        picture: "",
        is_admin: false,
      };
      setMockUser(u);
      return u;
    }
    const token = await http<TokenOut>("/auth/otp/verify", { method: "POST", body: JSON.stringify(payload) });
    setAccessToken(token.access_token);
    const me = await api.me();
    if (!me) throw new Error("Unable to load user profile after OTP verification");
    return me;
  },
  async me(): Promise<User | null> {
    if (USE_MOCK) { await delay(80); return getMockUser(); }
    try {
      const response = await http<Partial<User> & { role?: string; user_id?: string | number }>("/auth/me");
      return normalizeUser(response);
    } catch {
      return null;
    }
  },
  async exchangeSession(sessionId: string): Promise<User> {
    if (USE_MOCK) {
      await delay(200);
      const u: User = {
        user_id: uid("user").replace("user_", "user_"),
        email: "you@playturf.app",
        name: "Player One",
        picture: "",
        is_admin: false,
      };
      setMockUser(u);
      return u;
    }
    const response = await http<User | (Partial<User> & TokenOut & { user?: Partial<User> })>(
      "/auth/google/session",
      { method: "POST", body: JSON.stringify({ session_id: sessionId }) }
    );
    if ("access_token" in response && response.access_token) {
      setAccessToken(response.access_token);
      if (response.user) {
        return normalizeUser(response.user);
      }
      const me = await api.me();
      if (me) return me;
    }
    return normalizeUser(response as Partial<User>);
  },
  async mockGoogleSignIn(asAdmin = false): Promise<User> {
    // dev helper used by /login when no backend is wired
    await delay(250);
    const u: User = {
      user_id: uid("user"),
      email: asAdmin ? "admin@playturf.app" : "you@playturf.app",
      name: asAdmin ? "Admin" : "Player One",
      picture: "",
      is_admin: asAdmin,
    };
    setMockUser(u);
    return u;
  },
  async adminPasswordSignIn(email: string, password: string): Promise<User> {
    if (!USE_MOCK) {
      const response = await http<User | (Partial<User> & TokenOut & { user?: Partial<User> })>(
        "/auth/admin-login",
        { method: "POST", body: JSON.stringify({ email, password }) }
      );
      if ("access_token" in response && response.access_token) {
        setAccessToken(response.access_token);
        if (response.user) {
          return normalizeUser(response.user);
        }
        const me = await api.me();
        if (me) return me;
      }
      return normalizeUser(response as Partial<User>);
    }
    await delay(250);
    if (email.trim() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      throw new Error("Invalid admin ID or password");
    }
    const u: User = {
      user_id: "admin_jabhishek1018",
      email: ADMIN_EMAIL,
      name: "Admin",
      picture: "",
      is_admin: true,
    };
    setMockUser(u);
    return u;
  },
  async logout(): Promise<void> {
    if (USE_MOCK) { setMockUser(null); return; }
    await http<void>("/auth/logout", { method: "POST" });
    setAccessToken(null);
  },

  // ---------- BOOKINGS ----------
  async createBooking(payload: {
    turf_id: string; date: string; start_time: string; hours: number;
  }): Promise<Booking> {
    if (USE_MOCK) {
      await delay(200);
      const user = getMockUser();
      if (!user) throw new Error("Not signed in");
      const turf = getMockTurfs().find((t) => t.id === payload.turf_id);
      if (!turf) throw new Error("Turf missing");
      const [h, m] = payload.start_time.split(":").map(Number);
      const endH = (h + payload.hours).toString().padStart(2, "0");
      const booking: Booking = {
        id: uid("bkg"),
        user_id: user.user_id,
        turf_id: turf.id,
        turf_name: turf.name,
        turf_image: turf.image,
        date: payload.date,
        start_time: payload.start_time,
        end_time: `${endH}:${String(m).padStart(2, "0")}`,
        hours: payload.hours,
        amount: turf.price_per_hour * payload.hours,
        status: "PENDING",
        payment_id: null,
        created_at: new Date().toISOString(),
      };
      setMockBookings([booking, ...getMockBookings()]);
      return booking;
    }
    return http<Booking>("/bookings", { method: "POST", body: JSON.stringify(payload) });
  },
  async bookedSlots(turfId: string, date: string): Promise<string[]> {
    if (USE_MOCK) {
      await delay(80);
      return getMockBookings()
        .filter((booking) => booking.turf_id === turfId && booking.date === date && booking.status !== "CANCELLED")
        .map((booking) => booking.start_time);
    }
    return http<string[]>(`/turfs/${turfId}/booked-slots?date=${encodeURIComponent(date)}`);
  },
  async payMock(bookingId: string): Promise<Booking> {
    if (USE_MOCK) {
      await delay(800);
      const list = getMockBookings();
      const idx = list.findIndex((b) => b.id === bookingId);
      if (idx < 0) throw new Error("Booking missing");
      list[idx] = { ...list[idx], status: "CONFIRMED", payment_id: uid("pay") };
      setMockBookings(list);
      return list[idx];
    }
    return http<Booking>(`/bookings/${bookingId}/pay-mock`, { method: "POST" });
  },
  async myBookings(): Promise<Booking[]> {
    if (USE_MOCK) {
      await delay(120);
      const u = getMockUser();
      if (!u) return [];
      return getMockBookings().filter((b) => b.user_id === u.user_id);
    }
    return http<Booking[]>("/bookings/me");
  },
  async upcomingBookings(): Promise<Booking[]> {
    if (USE_MOCK) {
      await delay(100);
      const u = getMockUser();
      if (!u) return [];
      const today = new Date().toISOString().slice(0, 10);
      return getMockBookings().filter(
        (b) => b.user_id === u.user_id && b.status === "CONFIRMED" && b.date >= today
      );
    }
    return http<Booking[]>("/bookings/upcoming");
  },

  // ---------- ADMIN ----------
  admin: {
    async addTurf(t: Partial<Turf>): Promise<Turf> {
      if (USE_MOCK) {
        const turf: Turf = {
          id: uid("turf"),
          name: t.name || "New Turf",
          city: t.city || "City",
          address: t.address || "Address",
          lat: t.lat,
          lng: t.lng,
          image: t.image || seedTurfs[0].image,
          gallery: t.gallery || [],
          rating: t.rating ?? 4.5,
          timing: t.timing || "06:00 AM – 11:00 PM",
          price_per_hour: t.price_per_hour ?? 1000,
          sport_types: t.sport_types || ["Football"],
          amenities: t.amenities || ["Floodlights"],
          videos: t.videos || [],
          description: t.description || "",
          is_popular: t.is_popular ?? false,
          is_nearby: t.is_nearby ?? false,
        };
        const next = [turf, ...getMockTurfs()];
        setMockTurfs(next);
        return turf;
      }
      return http<Turf>("/admin/turfs", { method: "POST", body: JSON.stringify(t) });
    },
    async updateTurf(id: string, patch: Partial<Turf>): Promise<Turf> {
      if (USE_MOCK) {
        const list = getMockTurfs();
        const idx = list.findIndex((t) => t.id === id);
        if (idx < 0) throw new Error("Turf not found");
        list[idx] = { ...list[idx], ...patch };
        setMockTurfs(list);
        return list[idx];
      }
      return http<Turf>(`/admin/turfs/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
    },
    async deleteTurf(id: string): Promise<void> {
      if (USE_MOCK) { setMockTurfs(getMockTurfs().filter((t) => t.id !== id)); return; }
      await http<void>(`/admin/turfs/${id}`, { method: "DELETE" });
    },
    async addBanner(b: Partial<Banner>): Promise<Banner> {
      if (USE_MOCK) {
        const banner: Banner = {
          id: uid("ban"), title: b.title || "Banner", highlight: b.highlight || "",
          subtitle: b.subtitle || "", image: b.image || seedBanners[0].image,
          badge: b.badge || "NEW", cta_text: b.cta_text || "Explore",
          cta_link: b.cta_link || "/", order: b.order ?? 99,
        };
        setMockBanners([...getMockBanners(), banner]);
        return banner;
      }
      return http<Banner>("/admin/banners", { method: "POST", body: JSON.stringify(b) });
    },
    async deleteBanner(id: string): Promise<void> {
      if (USE_MOCK) { setMockBanners(getMockBanners().filter((x) => x.id !== id)); return; }
      await http<void>(`/admin/banners/${id}`, { method: "DELETE" });
    },
    async addOffer(o: Partial<Offer>): Promise<Offer> {
      if (USE_MOCK) {
        const off: Offer = {
          id: uid("off"), title: o.title || "Offer", subtitle: o.subtitle || "",
          badge: o.badge || "DEAL", image: o.image || seedOffers[0].image,
          discount: o.discount || "10%",
        };
        setMockOffers([...getMockOffers(), off]);
        return off;
      }
      return http<Offer>("/admin/offers", { method: "POST", body: JSON.stringify(o) });
    },
    async deleteOffer(id: string): Promise<void> {
      if (USE_MOCK) { setMockOffers(getMockOffers().filter((x) => x.id !== id)); return; }
      await http<void>(`/admin/offers/${id}`, { method: "DELETE" });
    },
    async addTournament(t: Partial<Tournament>): Promise<Tournament> {
      if (USE_MOCK) {
        const tnt: Tournament = {
          id: uid("tnt"), name: t.name || "Tournament", sport: t.sport || "Football",
          location: t.location || "City", image: t.image || seedTournaments[0].image,
          date: t.date || new Date().toISOString().slice(0, 10),
          prize_pool: t.prize_pool || "₹10,000", teams: t.teams ?? 8,
          entry_fee: t.entry_fee ?? 1000, description: t.description || "",
        };
        setMockTournaments([...getMockTournaments(), tnt]);
        return tnt;
      }
      return http<Tournament>("/admin/tournaments", { method: "POST", body: JSON.stringify(t) });
    },
    async deleteTournament(id: string): Promise<void> {
      if (USE_MOCK) { setMockTournaments(getMockTournaments().filter((x) => x.id !== id)); return; }
      await http<void>(`/admin/tournaments/${id}`, { method: "DELETE" });
    },
    async listAllBookings(): Promise<Booking[]> {
      if (USE_MOCK) { await delay(100); return getMockBookings(); }
      return http<Booking[]>("/admin/bookings");
    },
  },
};

export const isMockMode = USE_MOCK;
export const session = {
  getAccessToken: () => accessToken,
  setAccessToken,
  clear: () => setAccessToken(null),
};
