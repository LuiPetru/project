import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  Alert
} from 'react-native';
import { logoutUser, getCurrentUserData } from '../services/authService';
import { auth } from '../config/firebase';

export default function ClientAccountScreen({ userData: propUserData, onLogout, navigate }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ClientAccountScreen received userData:', propUserData);
    if (propUserData) {
      setUserData(propUserData);
      setLoading(false);
    } else {
      loadUserData();
    }
  }, [propUserData]);

  const loadUserData = async () => {
    try {
      const data = await getCurrentUserData();
      console.log('Loaded user data from service:', data);
      if (data && data.role === 'client') {
        setUserData(data.userData);
      }
    } catch (error) {
      console.error('Errore nel caricamento dati:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Disconnessione',
      'Sei sicuro di voler uscire?',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Esci', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutUser();
              onLogout();
            } catch (error) {
              Alert.alert('Errore', 'Impossibile disconnettersi');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Caricamento...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          
          {/* Header Account */}
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Ciao, {userData?.nomeUtente || 'Cliente'}! 👋</Text>
            <Text style={styles.roleText}>Account Cliente</Text>
          </View>

          {/* Dati Personali */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>I tuoi dati</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{userData?.email}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Età:</Text>
              <Text style={styles.infoValue}>{userData?.eta} anni</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Indirizzo:</Text>
              <Text style={styles.infoValue}>{userData?.via}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sesso:</Text>
              <Text style={styles.infoValue}>{userData?.sesso === 'M' ? 'Maschio' : 'Femmina'}</Text>
            </View>
          </View>

          {/* Preferenze */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Le tue preferenze</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipi di taglio preferiti:</Text>
            </View>
            <View style={styles.tagsContainer}>
              {userData?.preferenzaTaglio?.map((taglio, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{taglio}</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Raggio di ricerca:</Text>
              <Text style={styles.infoValue}>{userData?.raggio} km</Text>
            </View>
          </View>

          {/* Azioni rapide */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Azioni rapide</Text>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>✂️ Prenota un taglio</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>📍 Trova parrucchieri vicini</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>⭐ Le mie recensioni</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigate('EditClientProfile', { 
                userId: userData?.id || auth.currentUser?.uid,
                currentUserData: userData 
              })}
            >
              <Text style={styles.actionButtonText}>⚙️ Modifica profilo</Text>
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>🚪 Disconnetti</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  roleText: {
    fontSize: 16,
    color: '#00BCD4',
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    backgroundColor: '#E8F8F5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#00BCD4',
    fontSize: 14,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#00BCD4',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
