export type User = {
  id: string;
  email: string;
  display_name: string;
  city?: string | null;
  country?: string | null;
  is_admin: boolean;
};

export type Song = {
  id?: string | null;
  itunes_track_id: number;
  track_name: string;
  artist_name: string;
  album_name?: string | null;
  genre?: string | null;
  preview_url?: string | null;
  artwork_url?: string | null;
  release_date?: string | null;
  duration_ms?: number | null;
  metadata?: Record<string, unknown>;
};

export type RecommendationSection = {
  title: string;
  key: string;
  reason: string;
  tracks: Song[];
};

export type Playlist = {
  id: string;
  name: string;
  description?: string | null;
  is_public: boolean;
  share_slug: string;
};

export type AdminDashboard = {
  total_users: number;
  active_users: number;
  playlist_creation_stats: number;
  recommendation_ctr: number;
  most_played_songs: Array<{ track: string; artist: string; plays: number }>;
  most_skipped_songs: Array<{ track: string; artist: string; skips: number }>;
  top_moods_selected: Array<{ mood: string; count: number }>;
  region_trends: Array<{ city: string; count: number }>;
};
