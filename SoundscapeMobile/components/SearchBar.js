import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, FlatList } from 'react-native';

export default function SearchBar({ allSongs, onFindSimilar }) {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const matches = query.length >= 2
        ? allSongs.filter(s =>
            s.title.toLowerCase().includes(query.toLowerCase()) ||
            s.artist.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 10)
        : [];

    const handleClear = () => {
        setQuery('');
    };

    const handleSelect = (song) => {
        setQuery(song.title);
        setIsFocused(false);
        onFindSimilar(song);
    };

    return (
        <View style={styles.container}>
            <View style={[styles.inputContainer, isFocused && styles.inputFocused]}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Search any song or artist..."
                    placeholderTextColor="#71717A"
                    value={query}
                    onChangeText={setQuery}
                    onFocus={() => setIsFocused(true)}
                // don't hide on blur immediately to allow touch on dropdown
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                        <Text style={styles.clearIcon}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {isFocused && query.length >= 2 && (
                <View style={styles.dropdown}>
                    {matches.length === 0 ? (
                        <View style={styles.dropdownItem}>
                            <Text style={styles.dropdownTitle}>No songs found</Text>
                        </View>
                    ) : (
                        matches.map(song => (
                            <TouchableOpacity key={song.id} style={styles.dropdownItem} onPress={() => handleSelect(song)}>
                                <View style={styles.itemInfo}>
                                    <Text style={styles.dropdownTitle} numberOfLines={1}>{song.title}</Text>
                                    <Text style={styles.dropdownMeta} numberOfLines={1}>
                                        {song.artist} · {song.genre || 'Unknown'} · {song.mood}
                                    </Text>
                                </View>
                                <Text style={styles.findSimilarText}>Find Similar →</Text>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        zIndex: 10,
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E24',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    inputFocused: {
        borderColor: '#A78BFA',
        backgroundColor: '#23232A',
    },
    searchIcon: {
        marginRight: 10,
        fontSize: 16,
        color: '#71717A',
    },
    input: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
    },
    clearBtn: {
        padding: 4,
    },
    clearIcon: {
        color: '#71717A',
        fontSize: 16,
    },
    dropdown: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        backgroundColor: '#1E1E24',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        maxHeight: 250,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'hidden',
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    itemInfo: {
        flex: 1,
    },
    dropdownTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    dropdownMeta: {
        color: '#A1A1AA',
        fontSize: 12,
    },
    findSimilarText: {
        color: '#A78BFA',
        fontSize: 12,
        fontWeight: '500',
    },
});
