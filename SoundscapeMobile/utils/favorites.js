import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'resonance_favorites';

export async function loadFavorites() {
    try {
        const stored = await AsyncStorage.getItem(FAVORITES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Failed to load favorites', e);
        return [];
    }
}

export async function toggleFavorite(songId, currentFavorites) {
    let newFavs = [...currentFavorites];
    const idx = newFavs.indexOf(songId);
    if (idx > -1) {
        newFavs.splice(idx, 1);
    } else {
        newFavs.push(songId);
    }

    try {
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavs));
    } catch (e) {
        console.error('Failed to save favorites', e);
    }
    return newFavs;
}
