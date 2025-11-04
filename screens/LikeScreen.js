import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
  AppState
} from 'react-native';
import { getCurrentUserData } from '../services/authService';
import { collection, query, where, getDocs, doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';

const logoLike = require('../assets/icons8-cuore-48.png');
const { width } = Dimensions.get('window');
const itemSize = (width - 48) / 2; // 2 colonne con margini

const LikeScreen = () => {
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    loadLikedPosts();
  }, []);

  // Ricarica i dati quando l'app torna in foreground
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('LikeScreen: App tornata in foreground, ricaricando like...');
        loadLikedPosts();
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [appState]);

  const loadLikedPosts = async () => {
    try {
      setLoading(true);
      const userData = await getCurrentUserData();
      if (userData) {
        setCurrentUser(userData);
        console.log('LikeScreen: Loading liked posts for user:', userData.user.uid);
        
        // Carica tutti i post che contengono l'userId nell'array likes
        const postsQuery = query(
          collection(db, 'posts'),
          where('likes', 'array-contains', userData.user.uid)
        );
        
        const querySnapshot = await getDocs(postsQuery);
        const likedPostsData = [];
        
        querySnapshot.forEach((doc) => {
          const postData = doc.data();
          likedPostsData.push({
            postId: doc.id,
            imageUrl: postData.imageUrl,
            barberName: postData.barberName || 'Parrucchiere',
            barberId: postData.barberId,
            likedAt: new Date().toISOString(), // Per ora usiamo data corrente
            ...postData
          });
        });
        
        console.log('LikeScreen: Loaded liked posts:', likedPostsData.length);
        setLikedPosts(likedPostsData);
      } else {
        console.log('LikeScreen: No user logged in');
        setLikedPosts([]);
      }
    } catch (error) {
      console.error('LikeScreen: Errore nel caricamento dei like:', error);
      setLikedPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLike = async (postId) => {
    Alert.alert(
      'Rimuovi dai preferiti',
      'Vuoi rimuovere questa foto dai tuoi preferiti?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Rimuovi',
          style: 'destructive',
          onPress: async () => {
            try {
              if (currentUser) {
                console.log('LikeScreen: Removing like for post:', postId);
                
                // Rimuovi l'userId dall'array likes del post
                const postRef = doc(db, 'posts', postId);
                await updateDoc(postRef, {
                  likes: arrayRemove(currentUser.user.uid)
                });
                
                // Aggiorna la lista locale
                setLikedPosts(prev => prev.filter(post => post.postId !== postId));
                console.log('LikeScreen: Like rimosso con successo');
              }
            } catch (error) {
              console.error('LikeScreen: Errore rimozione like:', error);
              Alert.alert('Errore', 'Impossibile rimuovere dai preferiti');
            }
          }
        }
      ]
    );
  };

  const renderLikedPost = ({ item }) => (
    <TouchableOpacity 
      style={styles.postContainer}
      onLongPress={() => handleRemoveLike(item.postId)}
    >
      <Image 
        source={{ uri: item.imageUrl || item.mediaUrl }} 
        style={styles.postImage}
        resizeMode="cover"
      />
      <View style={styles.postInfo}>
        <Text style={styles.barberName} numberOfLines={1}>
          {item.barberName || 'Parrucchiere'}
        </Text>
        <Text style={styles.likedDate} numberOfLines={1}>
          {item.likedAt ? new Date(item.likedAt).toLocaleDateString() : 'Data non disponibile'}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.unlikeButton}
        onPress={() => handleRemoveLike(item.postId)}
      >
        <Text style={styles.unlikeText}>💔</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Caricamento preferiti...</Text>
      </View>
    );
  }

  if (likedPosts.length === 0) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.emptyState}>
          <Image source={logoLike} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle}>I tuoi "Mi piace"</Text>
          <Text style={styles.emptyDescription}>
            Qui vedrai tutti i post dei parrucchieri che hai messo "mi piace"
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>I tuoi preferiti</Text>
        <Text style={styles.headerCount}>{likedPosts.length} foto</Text>
      </View>
      
      <FlatList
        data={likedPosts}
        renderItem={renderLikedPost}
        keyExtractor={(item) => item.postId}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    fontSize: 16,
    color: '#666',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerCount: {
    fontSize: 14,
    color: '#666',
  },
  gridContainer: {
    padding: 16,
  },
  postContainer: {
    width: itemSize,
    marginRight: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: itemSize,
    backgroundColor: '#f0f0f0',
  },
  postInfo: {
    padding: 8,
    paddingBottom: 4,
  },
  barberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  likedDate: {
    fontSize: 12,
    color: '#666',
  },
  unlikeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlikeText: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyIcon: {
    width: 40,
    height: 40,
    marginBottom: 20,
    resizeMode: 'contain',
    tintColor: '#00BCD4',
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

export default LikeScreen;
