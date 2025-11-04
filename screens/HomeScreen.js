import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import BarberPost from '../components/BarberPost';
import { getAllPostsWithLikeStatus, getCurrentUserData } from '../services/authService';

const HomeScreen = ({ onViewProfile, onHashtagPress }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasConnectionError, setHasConnectionError] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setHasConnectionError(false); // Reset error state
      console.log('HomeScreen: Starting to load data...');
      
      // Carica l'utente corrente
      const userData = await getCurrentUserData();
      setCurrentUser(userData);
      
      // Usa la nuova funzione che gestisce automaticamente lo stato like
      const postsWithLikeStatus = await getAllPostsWithLikeStatus(userData?.user?.uid);
      console.log('HomeScreen: Loaded posts with like status:', postsWithLikeStatus.length);
      
      // Debug: mostra i primi post
      if (postsWithLikeStatus.length > 0) {
        console.log('HomeScreen: First post:', {
          id: postsWithLikeStatus[0].id,
          postId: postsWithLikeStatus[0].postId,
          isLiked: postsWithLikeStatus[0].isLiked,
          likesCount: postsWithLikeStatus[0].likesCount
        });
      }
      
      setPosts(postsWithLikeStatus);
      console.log('HomeScreen: Posts loaded successfully');
    } catch (error) {
      console.error('HomeScreen: Error loading data:', error);
      
      // Controlla se è un errore di connessione Firebase
      if (error.message?.includes('client is offline') || 
          error.message?.includes('Failed to get document') ||
          error.code === 'unavailable') {
        
        console.log('HomeScreen: Firebase offline, showing connection error state');
        setHasConnectionError(true);
        setPosts([]);
      } else {
        setPosts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BCD4" />
        <Text style={styles.loadingText}>Caricamento feed...</Text>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <ScrollView 
        style={styles.mainContent}
        contentContainerStyle={styles.emptyContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>
            {hasConnectionError ? '🌐 Connessione lenta' : 'Nessun post disponibile'}
          </Text>
          <Text style={styles.emptyDescription}>
            {hasConnectionError 
              ? 'Verifica la tua connessione internet e tira per aggiornare'
              : 'I parrucchieri non hanno ancora caricato foto. Torna più tardi per vedere i loro lavori!'
            }
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      style={styles.mainContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {posts.map((barber) => (
        <BarberPost 
          key={barber.id} 
          barber={barber} 
          onViewProfile={onViewProfile}
          onHashtagPress={onHashtagPress}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default HomeScreen;
