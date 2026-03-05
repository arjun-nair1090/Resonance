import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function FilterBar({ filters, setFilters, allGenres }) {
    const handleTagPress = (genre) => {
        setFilters({ ...filters, genre });
    };

    return (
        <View style={styles.container}>
            <View style={styles.topRow}>
                <View style={styles.selectWrapper}>
                    <Text style={styles.label}>Time of Day</Text>
                    {/* Simplified selector for React Native; just basic buttons for now to avoid custom picker dependency */}
                </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll} contentContainerStyle={styles.genreContainer}>
                <TouchableOpacity
                    style={[styles.tag, filters.genre === 'All' && styles.tagActive]}
                    onPress={() => handleTagPress('All')}
                >
                    <Text style={[styles.tagText, filters.genre === 'All' && styles.tagTextActive]}>All</Text>
                </TouchableOpacity>
                {allGenres.slice(0, 15).map(genre => (
                    <TouchableOpacity
                        key={genre}
                        style={[styles.tag, filters.genre === genre && styles.tagActive]}
                        onPress={() => handleTagPress(genre)}
                    >
                        <Text style={[styles.tagText, filters.genre === genre && styles.tagTextActive]}>{genre}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    topRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    label: {
        color: '#A1A1AA',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    genreScroll: {
        marginLeft: -20,
        marginRight: -20,
    },
    genreContainer: {
        paddingHorizontal: 20,
        gap: 8,
        flexDirection: 'row',
    },
    tag: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    tagActive: {
        backgroundColor: 'rgba(167, 139, 250, 0.2)',
        borderColor: '#A78BFA',
    },
    tagText: {
        color: '#A1A1AA',
        fontSize: 14,
    },
    tagTextActive: {
        color: '#C4B5FD',
        fontWeight: '500',
    },
});
