import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Alert
} from 'react-native';
import { getBarberProfileData, getBarberPrices } from '../services/authService';

const { width } = Dimensions.get('window');
const imageSize = (width - 4) / 3; // 3 colonne con spazi

const BarberProfileScreen = ({ barberName, onGoBack }) => {
  const [barberData, setBarberData] = useState(null);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('portfolio'); // 'portfolio' o 'prices'

  useEffect(() => {
    loadBarberProfile();
  }, [barberName]);

  const loadBarberProfile = async () => {
    try {
      setLoading(true);
      console.log('BarberProfileScreen: Caricamento profilo per:', barberName);

      const profile = await getBarberProfileData(barberName);
      if (profile) {
        setBarberData(profile);
        
        // Carica anche i prezzi
        const barberPrices = await getBarberPrices(profile.id);
        setPrices(barberPrices);
      } else {
        Alert.alert('Errore', 'Profilo parrucchiere non trovato');
        onGoBack();
      }
    } catch (error) {
      console.error('Errore caricamento profilo:', error);
      Alert.alert('Errore', 'Impossibile caricare il profilo');
    } finally {
      setLoading(false);
    }
  };

  const renderPortfolioImage = ({ item, index }) => (
    <TouchableOpacity style={styles.imageItem}>
      <Image source={{ uri: item }} style={styles.portfolioImage} />
    </TouchableOpacity>
  );

  const renderPriceItem = ({ item }) => (
    <View style={styles.priceItem}>
      <View style={styles.priceContent}>
        <Text style={styles.serviceName}>{item.servizio}</Text>
        <Text style={styles.serviceDescription}>{item.descrizione}</Text>
      </View>
      <Text style={styles.servicePrice}>€{item.prezzo}</Text>
    </View>
  );

  const renderTabContent = () => {
    if (activeTab === 'portfolio') {
      return (
        <FlatList
          key="portfolio"
          data={barberData.portfolioImages || []}
          renderItem={renderPortfolioImage}
          numColumns={3}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.portfolioGrid}
          scrollEnabled={false}
        />
      );
    } else {
      return (
        <FlatList
          key="prices"
          data={prices}
          renderItem={renderPriceItem}
          numColumns={1}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.pricesList}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyPrices}>
              <Text style={styles.emptyPricesText}>Prezzi non disponibili</Text>
            </View>
          }
        />
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{barberName}</Text>
          <View style={styles.headerActions}>
            <Text style={styles.moreIcon}>⋯</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00BCD4" />
          <Text style={styles.loadingText}>Caricamento profilo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!barberData) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{barberData.nomeSalone}</Text>
          <View style={styles.headerActions}>
            <Text style={styles.moreIcon}>⋯</Text>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <Image 
              source={{ uri: barberData.portfolioImages?.[0] || 'https://via.placeholder.com/100' }} 
              style={styles.profileImage} 
            />
          </View>

          {/* Bio */}
          <View style={styles.bioSection}>
            <Text style={styles.bioName}>{barberData.nomeSalone}</Text>
            <Text style={styles.bioCategory}>Salone di bellezza • Parrucchiere</Text>
            <Text style={styles.bioDescription}>
              {barberData.nomiDipendenti && `👨‍💼 Staff: ${barberData.nomiDipendenti}`}
            </Text>
            {barberData.via && (
              <Text style={styles.bioLocation}>📍 {barberData.via}</Text>
            )}
            {barberData.telefono && (
              <Text style={styles.bioContact}>📞 {barberData.telefono}</Text>
            )}
            {barberData.sitoWeb && (
              <Text style={styles.bioWebsite}>{barberData.sitoWeb}</Text>
            )}
          </View>
        </View>

        {/* Highlights (placeholder) */}
        <View style={styles.highlightsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.highlightItem}>
              <View style={styles.highlightCircle}>
                <Text style={styles.highlightIcon}>✂️</Text>
              </View>
              <Text style={styles.highlightLabel}>Tagli</Text>
            </View>
            <View style={styles.highlightItem}>
              <View style={styles.highlightCircle}>
                <Text style={styles.highlightIcon}>💇</Text>
              </View>
              <Text style={styles.highlightLabel}>Colori</Text>
            </View>
            <View style={styles.highlightItem}>
              <View style={styles.highlightCircle}>
                <Text style={styles.highlightIcon}>💰</Text>
              </View>
              <Text style={styles.highlightLabel}>Prezzi</Text>
            </View>
          </ScrollView>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'portfolio' && styles.activeTab]}
            onPress={() => setActiveTab('portfolio')}
          >
            <Text style={styles.tabIcon}>▦</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'prices' && styles.activeTab]}
            onPress={() => setActiveTab('prices')}
          >
            <Text style={styles.tabIcon}>💰</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  headerActions: {
    padding: 8,
  },
  moreIcon: {
    fontSize: 24,
    color: '#000',
  },

  // Profile Section
  profileSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginRight: 20,
  },

  // Bio Section
  bioSection: {
    marginBottom: 16,
  },
  bioName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  bioCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bioDescription: {
    fontSize: 14,
    color: '#000',
    marginBottom: 2,
  },
  bioLocation: {
    fontSize: 14,
    color: '#000',
    marginBottom: 2,
  },
  bioContact: {
    fontSize: 14,
    color: '#000',
    marginBottom: 2,
  },
  bioWebsite: {
    fontSize: 14,
    color: '#00376b',
    marginBottom: 2,
  },

  // Highlights
  highlightsSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  highlightItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  highlightCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  highlightIcon: {
    fontSize: 24,
  },
  highlightLabel: {
    fontSize: 12,
    color: '#666',
  },

  // Tab Navigation
  tabNavigation: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#000',
  },
  tabIcon: {
    fontSize: 20,
    color: '#666',
  },

  // Portfolio Grid
  portfolioGrid: {
    paddingTop: 1,
  },
  imageItem: {
    width: imageSize,
    height: imageSize,
    marginRight: 2,
    marginBottom: 2,
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  // Prices List
  pricesList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  priceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  priceContent: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00BCD4',
  },
  emptyPrices: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyPricesText: {
    fontSize: 16,
    color: '#666',
  },
});

export default BarberProfileScreen;
