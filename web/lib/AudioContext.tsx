"use client";

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { addListeningEntry } from '@/lib/auth';
import { useAuth } from '@/lib/AuthContext';

interface Track {
    id: string;
    title: string;
    artist: string;
    cover: string;
    url?: string;
    color?: string;
}

interface AudioContextType {
    currentTrack: Track | null;
    isPlaying: boolean;
    playTrack: (track: Track) => void;
    togglePlay: () => void;
    progress: number;
    duration: number;
    volume: number;
    setVolume: (v: number) => void;
    seek: (percent: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.7);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
        }
        
        const audio = audioRef.current;
        
        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
                setDuration(audio.duration);
            }
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', handleEnded);
        audio.volume = volume;

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const playTrack = (track: Track) => {
        if (!audioRef.current) return;
        
        if (currentTrack?.id === track.id) {
            togglePlay();
            return;
        }

        setCurrentTrack(track);

        // Record listening entry
        if (user) {
            addListeningEntry(user.id, {
                trackId: track.id,
                trackTitle: track.title,
                artist: track.artist,
                genre: (track as any).genre || 'Pop',
                mood: (track as any).mood || 'Happy',
                energy: (track as any).energy || 0.7,
                valence: (track as any).valence || 0.6,
                location: 'Current',
                cover: track.cover
            });
        }
        // Using a mock audio URL for now if not provided, for user experience
        const audioUrl = track.url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
        audioRef.current.src = audioUrl;
        audioRef.current.play().then(() => {
            setIsPlaying(true);
        }).catch(err => {
            console.error("Playback failed", err);
        });
    };

    const togglePlay = () => {
        if (!audioRef.current || !currentTrack) return;
        
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(err => {
                console.error("Playback failed", err);
            });
        }
    };

    const seek = (percent: number) => {
        if (!audioRef.current || !duration) return;
        const time = (percent / 100) * duration;
        audioRef.current.currentTime = time;
        setProgress(percent);
    };

    return (
        <AudioContext.Provider value={{
            currentTrack,
            isPlaying,
            playTrack,
            togglePlay,
            progress,
            duration,
            volume,
            setVolume,
            seek
        }}>
            {children}
        </AudioContext.Provider>
    );
}

export function useAudio() {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
}
