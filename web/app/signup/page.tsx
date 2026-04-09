"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Music2, Check } from "lucide-react";

const GENRE_OPTIONS = [
    "Pop", "Rock", "Hip Hop", "R&B", "Electronic", "Indie",
    "Jazz", "Classical", "Lo-Fi", "Synthwave", "Folk", "Metal"
];

export default function SignupPage() {
    const [step, setStep] = useState(1); // 1: credentials, 2: preferences
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { signup, updateUser, user } = useAuth();
    const router = useRouter();

    const toggleGenre = (genre: string) => {
        setSelectedGenres(prev =>
            prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
        );
    };

    const handleStep1 = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (name.trim().length < 2) {
            setError("Name must be at least 2 characters");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setStep(2);
    };

    const handleStep2 = async () => {
        setError("");
        setIsLoading(true);

        await new Promise(res => setTimeout(res, 500));

        const result = signup(name, email, password);
        if (result.success && result.user) {
            // Update preferences
            const updatedUser = {
                ...result.user,
                preferences: {
                    ...result.user.preferences,
                    favoriteGenres: selectedGenres,
                },
            };
            updateUser(updatedUser);
            router.push("/");
        } else {
            setError(result.error || "Signup failed");
            setStep(1);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
            {/* Background orbs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute -top-[30%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-pink-600/25 blur-[120px]"
                    animate={{ x: [0, -50, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
                    transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-[50%] -left-[15%] w-[50vw] h-[50vw] rounded-full bg-purple-600/25 blur-[150px]"
                    animate={{ x: [0, 40, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute -bottom-[30%] right-[30%] w-[45vw] h-[45vw] rounded-full bg-blue-600/20 blur-[100px]"
                    animate={{ x: [0, -60, 0], y: [0, 30, 0] }}
                    transition={{ duration: 18, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                <div className="relative overflow-hidden rounded-3xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_60px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500" />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />

                    <div className="relative p-10">
                        {/* Logo & Header */}
                        <motion.div
                            className="flex flex-col items-center mb-10"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.4)] mb-5">
                                <Music2 className="w-7 h-7 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                                {step === 1 ? "Join Resonance" : "Your Music Taste"}
                            </h1>
                            <p className="text-white/50 text-sm">
                                {step === 1 ? "Create your account to get started" : "Select genres you love (pick at least 2)"}
                            </p>
                        </motion.div>

                        {/* Progress indicator */}
                        <div className="flex items-center gap-3 mb-8">
                            <div className="flex-1 h-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                            <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step >= 2 ? "bg-gradient-to-r from-pink-500 to-blue-500" : "bg-white/10"}`} />
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.form
                                    key="step1"
                                    onSubmit={handleStep1}
                                    className="flex flex-col gap-5"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-purple-400 transition-colors" />
                                        <input
                                            id="signup-name"
                                            type="text"
                                            placeholder="Full Name"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            required
                                            className="w-full pl-12 pr-4 py-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all text-sm"
                                        />
                                    </div>

                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-purple-400 transition-colors" />
                                        <input
                                            id="signup-email"
                                            type="email"
                                            placeholder="Email address"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                            className="w-full pl-12 pr-4 py-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all text-sm"
                                        />
                                    </div>

                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-purple-400 transition-colors" />
                                        <input
                                            id="signup-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Password (min 6 characters)"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                            className="w-full pl-12 pr-12 py-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-purple-400 transition-colors" />
                                        <input
                                            id="signup-confirm-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Confirm Password"
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            required
                                            className="w-full pl-12 pr-4 py-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(168,85,247,0.1)] transition-all text-sm"
                                        />
                                    </div>

                                    <motion.button
                                        type="submit"
                                        className="relative w-full py-4 rounded-xl font-semibold text-sm overflow-hidden group"
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-[length:200%_100%]" />
                                        <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                                            Continue
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </motion.button>
                                </motion.form>
                            ) : (
                                <motion.div
                                    key="step2"
                                    className="flex flex-col gap-6"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="grid grid-cols-3 gap-3">
                                        {GENRE_OPTIONS.map(genre => {
                                            const isSelected = selectedGenres.includes(genre);
                                            return (
                                                <motion.button
                                                    key={genre}
                                                    type="button"
                                                    onClick={() => toggleGenre(genre)}
                                                    className={`relative px-3 py-3 rounded-xl text-sm font-medium transition-all border ${
                                                        isSelected
                                                            ? "bg-purple-500/20 border-purple-500/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                                                            : "bg-white/[0.03] border-white/[0.08] text-white/60 hover:bg-white/[0.06] hover:text-white"
                                                    }`}
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.97 }}
                                                >
                                                    {isSelected && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="absolute top-1.5 right-1.5"
                                                        >
                                                            <Check className="w-3 h-3 text-purple-400" />
                                                        </motion.div>
                                                    )}
                                                    {genre}
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    <div className="flex gap-3">
                                        <motion.button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="flex-1 py-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] transition-all text-sm font-medium text-white/70"
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                        >
                                            Back
                                        </motion.button>
                                        <motion.button
                                            type="button"
                                            onClick={handleStep2}
                                            disabled={selectedGenres.length < 2 || isLoading}
                                            className="relative flex-[2] py-4 rounded-xl font-semibold text-sm overflow-hidden group disabled:opacity-40 disabled:cursor-not-allowed"
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-[length:200%_100%]" />
                                            <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                                                {isLoading ? (
                                                    <motion.div
                                                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    />
                                                ) : (
                                                    <>
                                                        Create Account
                                                        <ArrowRight className="w-4 h-4" />
                                                    </>
                                                )}
                                            </span>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {step === 1 && (
                            <>
                                <div className="flex items-center gap-4 my-8">
                                    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
                                    <span className="text-xs text-white/30 font-medium">ALREADY HAVE AN ACCOUNT?</span>
                                    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
                                </div>

                                <Link href="/login">
                                    <motion.div
                                        className="w-full py-4 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all text-center text-sm font-medium text-white/70 hover:text-white cursor-pointer"
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                    >
                                        Sign In Instead
                                    </motion.div>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-pink-600/20 blur-[60px] rounded-full pointer-events-none" />
            </motion.div>
        </div>
    );
}
