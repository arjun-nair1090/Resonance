"use client";

import { AdminDashboard } from "@/lib/types";

export function AdminPanel({ data }: { data?: AdminDashboard | null }) {
  if (!data) {
    return (
      <section className="glass mt-8 rounded-lg p-5">
        <h2 className="text-2xl font-black">Admin Dashboard</h2>
        <p className="mt-2 text-sm text-white/58">Admin metrics appear here for users with admin access.</p>
      </section>
    );
  }

  const stats = [
    ["Total users", data.total_users],
    ["Active users", data.active_users],
    ["Playlists", data.playlist_creation_stats],
    ["Recommendation CTR", `${Math.round(data.recommendation_ctr * 100)}%`]
  ];

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-black">Admin Dashboard</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="glass rounded-lg p-4">
            <p className="text-sm text-white/55">{label}</p>
            <p className="mt-2 text-3xl font-black text-pulse">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <MetricList title="Most Played Songs" rows={data.most_played_songs.map((row) => `${row.track} - ${row.artist} (${row.plays})`)} />
        <MetricList title="Most Skipped Songs" rows={data.most_skipped_songs.map((row) => `${row.track} - ${row.artist} (${row.skips})`)} />
        <MetricList title="Top Moods" rows={data.top_moods_selected.map((row) => `${row.mood} (${row.count})`)} />
        <MetricList title="Region Trends" rows={data.region_trends.map((row) => `${row.city} (${row.count})`)} />
      </div>
    </section>
  );
}

function MetricList({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="glass rounded-lg p-4">
      <h3 className="font-black">{title}</h3>
      <div className="mt-3 space-y-2">
        {(rows.length ? rows : ["Waiting for listener data"]).map((row) => (
          <p key={row} className="rounded-md bg-white/7 px-3 py-2 text-sm text-white/68">{row}</p>
        ))}
      </div>
    </div>
  );
}
