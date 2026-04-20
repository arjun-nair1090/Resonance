import { AdminDashboard, Playlist, RecommendationSection, Song, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type TokenResponse = {
  access_token: string;
  user: User;
};

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  if (!response.ok) {
    const body = await response.text();
    let message = body || response.statusText;
    try {
      const parsed = JSON.parse(body) as { detail?: string | Array<{ msg: string }> };
      if (typeof parsed.detail === "string") message = parsed.detail;
      if (Array.isArray(parsed.detail)) message = parsed.detail.map((item) => item.msg).join(", ");
    } catch {
      message = body || response.statusText;
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export const api = {
  signup(payload: { email: string; password: string; display_name: string; city: string; country: string }) {
    return request<TokenResponse>("/auth/signup", { method: "POST", body: JSON.stringify(payload) });
  },
  async login(email: string, password: string) {
    const form = new URLSearchParams();
    form.set("username", email);
    form.set("password", password);
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form
    });
    if (!response.ok) {
      const body = await response.text();
      let message = "Invalid credentials";
      try {
        const parsed = JSON.parse(body) as { detail?: string };
        message = parsed.detail || message;
      } catch {
        message = "Invalid credentials";
      }
      throw new Error(message);
    }
    return response.json() as Promise<TokenResponse>;
  },
  me(token: string) {
    return request<User>("/auth/me", {}, token);
  },
  search(query: string, token: string) {
    return request<Song[]>(`/music/search?q=${encodeURIComponent(query)}`, {}, token);
  },
  event(payload: { itunes_track_id: number; action: string; mood?: string; city?: string; geohash?: string; context?: object; song?: Song }, token: string) {
    return request<{ status: string }>("/music/events", { method: "POST", body: JSON.stringify(payload) }, token);
  },
  favorites(token: string) {
    return request<Song[]>("/music/favorites", {}, token);
  },
  recent(token: string) {
    return request<Song[]>("/music/recent", {}, token);
  },
  recommendations(payload: { mood?: string; city?: string; geohash?: string; refresh_nonce?: number; limit?: number }, token: string) {
    return request<RecommendationSection[]>("/recommendations", { method: "POST", body: JSON.stringify(payload) }, token);
  },
  trackLocation(latitude: number, longitude: number, token: string) {
    return request<{ geohash: string; frequent_geohash: string | null; visit_count: number }>(
      "/location/track",
      { method: "POST", body: JSON.stringify({ latitude, longitude }) },
      token
    );
  },
  playlists(token: string) {
    return request<Playlist[]>("/playlists", {}, token);
  },
  createPlaylist(payload: { name: string; description?: string; is_public?: boolean }, token: string) {
    return request<Playlist>("/playlists", { method: "POST", body: JSON.stringify(payload) }, token);
  },
  addTrack(playlistId: string, song: Song, token: string) {
    return request<{ status: string }>(`/playlists/${playlistId}/tracks`, { method: "POST", body: JSON.stringify(song) }, token);
  },
  playlistTracks(playlistId: string, token: string) {
    return request<Song[]>(`/playlists/${playlistId}/tracks`, {}, token);
  },
  admin(token: string) {
    return request<AdminDashboard>("/admin/dashboard", {}, token);
  }
};
