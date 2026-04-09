import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, StatusBar, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform } from 'react-native';

// Components
import MusicCard from './components/MusicCard';
import FilterBar from './components/FilterBar';
import SearchBar from './components/SearchBar';
import SimilarBanner from './components/SimilarBanner';

// Engine & Utils
import { sortByTimeOfDay, autoDetectTimeOfDay, computeSimilarity, getTopGenres } from './utils/engine';
import { loadFavorites, toggleFavorite } from './utils/favorites';

// Load the pre-processed JSON instead of parsing CSV at runtime
import songsData from './assets/songs.json';

export default function App() {
  const [allSongs, setAllSongs] = useState([]);
  const [allGenres, setAllGenres] = useState([]);

  // State
  const [displayedSongs, setDisplayedSongs] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [currentView, setCurrentView] = useState('all'); // 'all' | 'favorites'
  const [currentSimilarSong, setCurrentSimilarSong] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    timeOfDay: 'Morning',
    mood: 'All',
    genre: 'All'
  });

  // INIT
  useEffect(() => {
    // Load data and favorites
    const init = async () => {
      const favs = await loadFavorites();
      setFavorites(favs);

      // We loaded the json sync statically, so just set it
      setAllSongs(songsData);

      // Extract top genres
      const topGenres = getTopGenres(songsData, 30);
      setAllGenres(topGenres);

      // Detect initial time
      setFilters(prev => ({ ...prev, timeOfDay: autoDetectTimeOfDay() }));

      setLoading(false);
    };
    init();
  }, []);

  // REGULAR RECOMMENDATIONS EFFECT
  useEffect(() => {
    if (loading || currentSimilarSong || currentView === 'favorites') return;

    let results = [...allSongs];
    if (filters.mood !== 'All') {
      results = results.filter(s => s.mood === filters.mood);
    }
    if (filters.genre !== 'All') {
      results = results.filter(s => s.genre === filters.genre);
    }
    if (filters.timeOfDay && filters.timeOfDay !== 'All') {
      results = sortByTimeOfDay(results, filters.timeOfDay);
    } else {
      results.sort((a, b) => b.energyRaw - a.energyRaw);
    }

    setDisplayedSongs(results.slice(0, 30));
  }, [filters, allSongs, loading, currentSimilarSong, currentView]);

  // FAVORITES VIEW EFFECT
  useEffect(() => {
    if (currentView === 'favorites') {
      const favTracks = allSongs.filter(s => favorites.includes(s.id));
      setDisplayedSongs(favTracks);
    }
  }, [currentView, favorites, allSongs]);

  // HANDLERS
  const handleToggleFavorite = async (songId) => {
    const newFavs = await toggleFavorite(songId, favorites);
    setFavorites(newFavs);
  };

  const handleFindSimilar = (song) => {
    setCurrentSimilarSong(song);
    setCurrentView('all');

    const scored = allSongs
      .filter(s => s.id !== song.id)
      .map(s => ({ song: s, score: computeSimilarity(song, s) }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 20);

    setDisplayedSongs(scored.map(s => s.song));
  };

  const handleClearSimilar = () => {
    setCurrentSimilarSong(null);
    // The effect will regenerate basic recommendations
  };

  const handleShuffle = () => {
    setCurrentSimilarSong(null);
    setCurrentView('all');
    const shuffled = [...allSongs].sort(() => Math.random() - 0.5).slice(0, 20);
    setDisplayedSongs(shuffled);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A78BFA" />
        <Text style={styles.loadingText}>Tuning frequencies...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Main Content List */}
      <FlatList
        data={displayedSongs}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            <View style={styles.brandRow}>
              <Text style={styles.brandTitle}>Sound<Text style={styles.brandTitleAccent}>Scape</Text></Text>
              <TouchableOpacity style={styles.shuffleBtn} onPress={handleShuffle}>
                <Text style={styles.shuffleBtnText}>Shuffle</Text>
              </TouchableOpacity>
            </View>

            <SearchBar allSongs={allSongs} onFindSimilar={handleFindSimilar} />

            <View style={styles.viewTabs}>
              <TouchableOpacity
                style={[styles.tabBtn, currentView === 'all' && styles.tabBtnActive]}
                onPress={() => setCurrentView('all')}
              >
                <Text style={[styles.tabText, currentView === 'all' && styles.tabTextActive]}>Discover</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, currentView === 'favorites' && styles.tabBtnActive]}
                onPress={() => setCurrentView('favorites')}
              >
                <Text style={[styles.tabText, currentView === 'favorites' && styles.tabTextActive]}>Favorites ({favorites.length})</Text>
              </TouchableOpacity>
            </View>

            {currentView === 'all' && !currentSimilarSong && (
              <FilterBar filters={filters} setFilters={setFilters} allGenres={allGenres} />
            )}

            {currentSimilarSong && (
              <SimilarBanner song={currentSimilarSong} onClear={handleClearSimilar} />
            )}

            <View style={styles.resultsHeader}>
              <Text style={styles.resultsHeading}>
                {currentView === 'favorites'
                  ? `${displayedSongs.length} Saved Tracks`
                  : currentSimilarSong
                    ? `Found ${displayedSongs.length} similar tracks`
                    : `Found ${displayedSongs.length} recommendations`}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tracks found. Try a different vibe.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <MusicCard
            song={item}
            isFavorite={favorites.includes(item.id)}
            onToggleFavorite={handleToggleFavorite}
            onFindSimilar={handleFindSimilar}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F13',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F0F13',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#A1A1AA',
    marginTop: 16,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  headerArea: {
    marginBottom: 10,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  brandTitleAccent: {
    color: '#A78BFA',
  },
  shuffleBtn: {
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shuffleBtnText: {
    color: '#C4B5FD',
    fontWeight: '600',
    fontSize: 14,
  },
  viewTabs: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#2A2A35',
  },
  tabText: {
    color: '#A1A1AA',
    fontWeight: '500',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsHeading: {
    fontSize: 16,
    color: '#D4D4D8',
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#71717A',
    fontSize: 16,
  },
});
