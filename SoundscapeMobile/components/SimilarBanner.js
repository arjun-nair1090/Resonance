import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function SimilarBanner({ song, onClear }) {
    if (!song) return null;

    return (
        <View style={styles.banner}>
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={1}>Similar to: {song.title} by {song.artist}</Text>
                <Text style={styles.subtitle} numberOfLines={1}>Based on audio features</Text>
            </View>
            <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
                <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(167, 139, 250, 0.3)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    info: {
        flex: 1,
        marginRight: 10,
    },
    title: {
        color: '#C4B5FD',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    subtitle: {
        color: '#A78BFA',
        fontSize: 12,
        opacity: 0.8,
    },
    clearBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    clearText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
});
