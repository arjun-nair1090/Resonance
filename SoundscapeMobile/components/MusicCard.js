import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';

export default function MusicCard({ song, isFavorite, onToggleFavorite, onFindSimilar }) {
    const [coverUrl, setCoverUrl] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchCover = async () => {
            try {
                const query = encodeURIComponent(`${song.title} ${song.artist} song`);
                const res = await fetch(`https://itunes.apple.com/search?term=${query}&limit=1&entity=song`);
                const data = await res.json();
                if (isMounted && data.results && data.results.length > 0) {
                    const url = data.results[0].artworkUrl100.replace('100x100bb', '300x300bb');
                    setCoverUrl(url);
                }
            } catch (e) { }
        };
        fetchCover();
        return () => { isMounted = false; };
    }, [song.title, song.artist]);

    const initial = song.title ? song.title.charAt(0).toUpperCase() : '?';
    // Generate a hue identical to web based on character codes
    const titleCode = song.title ? song.title.charCodeAt(0) : 0;
    const artistCode = song.artist ? song.artist.charCodeAt(0) : 0;
    const hue = (titleCode * 137 + artistCode * 53) % 360;
    const placeholderColor = `hsl(${hue}, 20%, 40%)`;

    const formatDuration = (ms) => {
        const min = Math.floor(ms / 60000);
        const sec = Math.floor((ms % 60000) / 1000);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const energyDots = Array.from({ length: 5 }, (_, i) => i < song.energy);

    return (
        <View style={styles.card}>
            <View style={styles.coverWrapper}>
                <View style={[styles.placeholder, { backgroundColor: placeholderColor }]}>
                    <Text style={styles.placeholderText}>{initial}</Text>
                </View>
                {coverUrl && <Image source={{ uri: coverUrl }} style={styles.coverImage} />}
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>{song.title}</Text>
                    <TouchableOpacity onPress={() => onToggleFavorite(song.id)} style={styles.favBtnWrap}>
                        <Text style={[styles.favBtn, isFavorite && styles.favBtnActive]}>
                            {isFavorite ? '★' : '☆'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.artist} numberOfLines={1}>{song.artist}</Text>

                <View style={styles.tagsContainer}>
                    <Text style={[styles.tag, styles.moodTag]}>{song.mood}</Text>
                    {!!song.genre && <Text style={[styles.tag, styles.genreTag]}>{song.genre}</Text>}
                    {!!song.vibe && <Text style={styles.tag}>{song.vibe}</Text>}
                    {!!song.tempo && <Text style={styles.tag}>{Math.round(song.tempo)} BPM</Text>}
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoBoxTitle}>Why this was recommended</Text>
                    <Text style={styles.infoBoxText}>{song.reason}</Text>
                </View>

                <View style={styles.footer}>
                    <View style={styles.energyBar}>
                        <Text style={styles.energyLabel}>Energy</Text>
                        <View style={styles.energyDots}>
                            {energyDots.map((filled, i) => (
                                <View key={i} style={[styles.dot, filled && styles.dotFilled]} />
                            ))}
                        </View>
                    </View>
                    <View style={styles.actions}>
                        {!!song.durationMs && <Text style={styles.durationBadge}>{formatDuration(song.durationMs)}</Text>}
                        {!!song.spotifyId && (
                            <TouchableOpacity onPress={() => Linking.openURL(`https://open.spotify.com/track/${song.spotifyId}`)}>
                                <Text style={styles.spotifyBtn}>🎧</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.similarBtn} onPress={() => onFindSimilar(song)}>
                            <Text style={styles.similarBtnText}>Find Similar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1E1E24',
        borderRadius: 16,
        marginBottom: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    coverWrapper: {
        width: '100%',
        aspectRatio: 1,
        position: 'relative',
        backgroundColor: '#2a2a35',
    },
    placeholder: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 72,
        color: 'rgba(255, 255, 255, 0.5)',
        fontWeight: 'bold',
    },
    coverImage: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginRight: 10,
    },
    favBtnWrap: {
        padding: 4,
    },
    favBtn: {
        fontSize: 24,
        color: 'rgba(255, 255, 255, 0.3)',
    },
    favBtnActive: {
        color: '#FBBF24',
    },
    artist: {
        fontSize: 14,
        color: '#A1A1AA',
        marginTop: 4,
        marginBottom: 12,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
        gap: 6,
    },
    tag: {
        fontSize: 11,
        color: '#D4D4D8',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden', // for iOS text border radius
    },
    moodTag: {
        backgroundColor: '#6366F1',
        color: '#FFFFFF',
        fontWeight: '600',
    },
    genreTag: {
        backgroundColor: 'rgba(167, 139, 250, 0.15)',
        color: '#C4B5FD',
        borderWidth: 1,
        borderColor: 'rgba(167, 139, 250, 0.3)',
    },
    infoBox: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        borderLeftWidth: 3,
        borderLeftColor: '#A78BFA',
    },
    infoBoxTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#A1A1AA',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    infoBoxText: {
        fontSize: 14,
        color: '#E4E4E7',
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        paddingTop: 16,
    },
    energyBar: {
        flexDirection: 'column',
    },
    energyLabel: {
        fontSize: 11,
        color: '#71717A',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    energyDots: {
        flexDirection: 'row',
        gap: 4,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    dotFilled: {
        backgroundColor: '#A78BFA',
        shadowColor: '#A78BFA',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 2,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    durationBadge: {
        fontSize: 12,
        color: '#A1A1AA',
        fontVariant: ['tabular-nums'],
    },
    spotifyBtn: {
        fontSize: 18,
    },
    similarBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    similarBtnText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#FFFFFF',
    },
});
