"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { User } from "@/lib/types";

export function AuthPanel({ onAuth }: { onAuth: (token: string, user: User) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("arjun@example.com");
  const [password, setPassword] = useState("resonance123");
  const [name, setName] = useState("Arjun");
  const [city, setCity] = useState("Mumbai");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response =
        mode === "signup"
          ? await api.signup({ email, password, display_name: name, city, country: "IN" })
          : await api.login(email, password);
      localStorage.setItem("resonance_token", response.access_token);
      onAuth(response.access_token, response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function useDemo() {
    setLoading(true);
    setError("");
    const demo = {
      email: `demo.${Date.now()}@resonance.ai`,
      password: "resonance123",
      display_name: "Demo Listener",
      city: "Mumbai",
      country: "IN"
    };
    try {
      const response = await api.signup(demo);
      localStorage.setItem("resonance_token", response.access_token);
      onAuth(response.access_token, response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Demo account could not be created");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center overflow-hidden px-5 py-10">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute left-0 top-0 h-64 w-full bg-[linear-gradient(90deg,rgba(38,208,124,0.24),rgba(72,214,210,0.16),rgba(255,93,93,0.12))]" />
        <div className="absolute bottom-0 right-0 h-80 w-full bg-[radial-gradient(circle_at_80%_70%,rgba(249,199,79,0.18),transparent_34rem)]" />
      </div>
      <motion.form
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={submit}
        className="glass relative w-full max-w-5xl rounded-lg p-4 shadow-glow sm:p-6"
      >
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-lg bg-black/24 p-5">
            <p className="text-sm uppercase tracking-[0.28em] text-pulse">Resonance AI</p>
            <h1 className="mt-4 max-w-2xl text-5xl font-black leading-tight text-balance sm:text-6xl">
              Music that learns the room, the hour, and you.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/68">
              Real iTunes previews, behavior-aware recommendations, AI playlists, and an analytics cockpit built like a serious portfolio product.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {["iTunes previews", "Mood graph", "City trends"].map((item) => (
                <div key={item} className="rounded-md border border-white/10 bg-white/8 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/42">{item}</p>
                  <p className="mt-2 text-2xl font-black text-pulse">Live</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg bg-white/[0.055] p-5">
            <div className="grid grid-cols-2 rounded-lg bg-black/30 p-1">
              {(["signup", "login"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`rounded-md px-4 py-2 text-sm font-bold capitalize transition ${mode === item ? "bg-pulse text-ink" : "text-white/70 hover:text-white"}`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              {mode === "signup" && (
                <>
                  <input className="w-full rounded-md border border-white/12 bg-black/30 px-4 py-3 outline-none focus:border-pulse" value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" />
                  <input className="w-full rounded-md border border-white/12 bg-black/30 px-4 py-3 outline-none focus:border-pulse" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
                </>
              )}
              <input className="w-full rounded-md border border-white/12 bg-black/30 px-4 py-3 outline-none focus:border-pulse" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
              <input className="w-full rounded-md border border-white/12 bg-black/30 px-4 py-3 outline-none focus:border-pulse" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
            </div>

            {error && <p className="mt-4 rounded-md bg-coral/15 px-4 py-3 text-sm text-coral">{error}</p>}

            <button disabled={loading} className="mt-5 w-full rounded-md bg-pulse px-4 py-3 font-black text-ink transition hover:brightness-110 disabled:opacity-50">
              {loading ? "Connecting..." : mode === "signup" ? "Create Account" : "Log In"}
            </button>
            <button type="button" onClick={useDemo} disabled={loading} className="mt-3 w-full rounded-md border border-white/14 px-4 py-3 text-sm font-bold text-white/72 transition hover:border-aqua hover:text-aqua disabled:opacity-50">
              Try with a fresh demo account
            </button>
          </section>
        </div>
      </motion.form>
    </main>
  );
}
