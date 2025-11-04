import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert
} from 'react-native';

const UserListItem = ({ user, onUserPress, onFollowPress }) => {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowPress = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Simula API call - implementa la logica di follow qui
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsFollowing(!isFollowing);
      
      if (onFollowPress) {
        onFollowPress(user, !isFollowing);
      }
    } catch (error) {
      console.error('Errore follow/unfollow:', error);
      Alert.alert('Errore', 'Impossibile aggiornare il follow');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserPress = () => {
    if (onUserPress) {
      onUserPress(user);
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleUserPress}>
      <View style={styles.content}>
        {/* Immagine Profilo */}
        <View style={styles.profileImageContainer}>
          <Image
            source={{ 
              uri: user.profileImage || 'https://via.placeholder.com/50x50?text=👤' 
            }}
            style={styles.profileImage}
            defaultSource={require('../assets/icon.png')}
          />
        </View>

        {/* Informazioni Utente */}
        <View style={styles.userInfo}>
          <Text style={styles.salonName} numberOfLines={1}>
            {user.nomeSalone || 'Salone'}
          </Text>
          
          {user.nomiDipendenti && (
            <Text style={styles.employeeName} numberOfLines={1}>
              {user.nomiDipendenti}
            </Text>
          )}
          
          <View style={styles.metaInfo}>
            {user.via && (
              <Text style={styles.location} numberOfLines={1}>
                📍 {user.via}
              </Text>
            )}
            
            <View style={styles.stats}>
              <Text style={styles.followers}>
                {user.followerCount || 0} follower
              </Text>
              
              {user.tipiTaglio && user.tipiTaglio.length > 0 && (
                <Text style={styles.specialties}>
                  • {user.tipiTaglio.slice(0, 2).join(', ')}
                  {user.tipiTaglio.length > 2 && '...'}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Pulsante Follow */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowing ? styles.followingButton : styles.followNotFollowingButton
            ]}
            onPress={handleFollowPress}
            disabled={isLoading}
          >
            <Text
              style={[
                styles.followButtonText,
                isFollowing ? styles.followingText : styles.followNotFollowingText
              ]}
            >
              {isLoading ? '...' : isFollowing ? 'Seguito' : 'Segui'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  salonName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 2,
  },
  employeeName: {
    fontSize: 14,
    color: '#8e8e8e',
    marginBottom: 4,
  },
  metaInfo: {
    gap: 2,
  },
  location: {
    fontSize: 13,
    color: '#8e8e8e',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  followers: {
    fontSize: 13,
    color: '#8e8e8e',
    marginRight: 8,
  },
  specialties: {
    fontSize: 13,
    color: '#00BCD4',
    fontWeight: '500',
  },
  actionContainer: {
    alignItems: 'center',
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
  },
  followNotFollowingButton: {
    backgroundColor: '#00BCD4',
    borderColor: '#00BCD4',
  },
  followingButton: {
    backgroundColor: '#fff',
    borderColor: '#d0d0d0',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  followNotFollowingText: {
    color: '#fff',
  },
  followingText: {
    color: '#262626',
  },
});

export default UserListItem;
