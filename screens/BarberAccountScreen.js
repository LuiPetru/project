import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  FlatList,
  TextInput,
  Modal
} from 'react-native';
import { logoutUser, getCurrentUserData, updateBarberPortfolio } from '../services/authService';
import { auth } from '../config/firebase';
import { pickImages, pickVideos, uploadMultipleFiles } from '../services/mediaService';

export default function BarberAccountScreen({ userData: propUserData, onLogout, navigate }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [newService, setNewService] = useState({ name: '', price: '' });
  const [editingService, setEditingService] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    console.log('BarberAccountScreen received userData:', propUserData);
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
      if (data && data.role === 'barber') {
        setUserData(data.userData);
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Errore nel caricamento dati:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddImages = async () => {
    try {
      const images = await pickImages(true);
      if (images && currentUser) {
        setUploading(true);
        
        const uploadedImages = await uploadMultipleFiles(
          images, 
          currentUser.uid, 
          'portfolio/images',
          (current, total) => {
            // Progresso upload
            console.log(`Upload ${current}/${total}`);
          }
        );

        if (uploadedImages.length > 0) {
          // Estrai solo gli URL dalle immagini caricate
          const imageUrls = uploadedImages.map(img => img.url);
          
          const updatedImages = [
            ...(userData.portfolioImages || []),
            ...imageUrls
          ];
          
          await updateBarberPortfolio(currentUser.uid, {
            portfolioImages: updatedImages
          });
          
          setUserData(prev => ({
            ...prev,
            portfolioImages: updatedImages
          }));
          
          Alert.alert('Successo', `${uploadedImages.length} foto caricate!`);
        }
      }
    } catch (error) {
      Alert.alert('Errore', 'Impossibile caricare le foto');
    } finally {
      setUploading(false);
    }
  };

  const handleAddVideos = async () => {
    try {
      const videos = await pickVideos(true);
      if (videos && currentUser) {
        setUploading(true);
        
        const uploadedVideos = await uploadMultipleFiles(
          videos, 
          currentUser.uid, 
          'portfolio/videos',
          (current, total) => {
            console.log(`Upload ${current}/${total}`);
          }
        );

        if (uploadedVideos.length > 0) {
          // Estrai solo gli URL dai video caricati
          const videoUrls = uploadedVideos.map(vid => vid.url);
          
          const updatedVideos = [
            ...(userData.portfolioVideos || []),
            ...videoUrls
          ];
          
          await updateBarberPortfolio(currentUser.uid, {
            portfolioVideos: updatedVideos
          });
          
          setUserData(prev => ({
            ...prev,
            portfolioVideos: updatedVideos
          }));
          
          Alert.alert('Successo', `${uploadedVideos.length} video caricati!`);
        }
      }
    } catch (error) {
      Alert.alert('Errore', 'Impossibile caricare i video');
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = async (index, type) => {
    try {
      const isImage = type === 'image';
      const mediaArray = isImage ? userData.portfolioImages : userData.portfolioVideos;
      const updatedArray = mediaArray.filter((_, i) => i !== index);
      
      const updateData = isImage 
        ? { portfolioImages: updatedArray }
        : { portfolioVideos: updatedArray };
      
      await updateBarberPortfolio(currentUser.uid, updateData);
      
      setUserData(prev => ({
        ...prev,
        ...updateData
      }));
      
      Alert.alert('Successo', `${isImage ? 'Foto' : 'Video'} rimosso!`);
    } catch (error) {
      Alert.alert('Errore', 'Impossibile rimuovere il file');
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

  const addServiceToPrice = async () => {
    if (!newService.name.trim() || !newService.price.trim()) {
      Alert.alert('Errore', 'Inserisci nome del servizio e prezzo');
      return;
    }

    try {
      console.log('addServiceToPrice: Adding service:', newService);
      
      const currentPriceList = userData.listinoPrezzo || [];
      console.log('addServiceToPrice: Current price list:', currentPriceList);
      
      const newServiceItem = {
        id: Date.now().toString(),
        name: newService.name.trim(),
        price: parseFloat(newService.price).toFixed(2),
        addedAt: new Date().toISOString()
      };
      
      const updatedPriceList = [
        ...currentPriceList,
        newServiceItem
      ];
      
      console.log('addServiceToPrice: Updated price list:', updatedPriceList);

      await updateBarberPortfolio(currentUser.uid, {
        listinoPrezzo: updatedPriceList
      });

      setUserData(prev => ({
        ...prev,
        listinoPrezzo: updatedPriceList
      }));

      setNewService({ name: '', price: '' });
      setShowPriceModal(false);
      Alert.alert('Successo', 'Servizio aggiunto al listino!');
    } catch (error) {
      console.error('addServiceToPrice: Error:', error);
      Alert.alert('Errore', 'Impossibile aggiungere il servizio: ' + error.message);
    }
  };

  const removeServiceFromPrice = async (serviceId) => {
    Alert.alert(
      'Rimuovi servizio',
      'Vuoi rimuovere questo servizio dal listino?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Rimuovi',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('removeServiceFromPrice: Removing service:', serviceId);
              
              const updatedPriceList = userData.listinoPrezzo.filter(service => service.id !== serviceId);
              console.log('removeServiceFromPrice: Updated list:', updatedPriceList);
              
              await updateBarberPortfolio(currentUser.uid, {
                listinoPrezzo: updatedPriceList
              });

              setUserData(prev => ({
                ...prev,
                listinoPrezzo: updatedPriceList
              }));

              Alert.alert('Successo', 'Servizio rimosso dal listino');
            } catch (error) {
              console.error('removeServiceFromPrice: Error:', error);
              Alert.alert('Errore', 'Impossibile rimuovere il servizio: ' + error.message);
            }
          }
        }
      ]
    );
  };

  const editService = (service) => {
    setEditingService(service);
    setNewService({ name: service.name, price: service.price });
    setIsEditing(true);
    setShowPriceModal(true);
  };

  const updateService = async () => {
    if (!newService.name.trim() || !newService.price.trim()) {
      Alert.alert('Errore', 'Inserisci nome del servizio e prezzo');
      return;
    }

    try {
      console.log('updateService: Updating service:', editingService.id);
      
      const updatedPriceList = userData.listinoPrezzo.map(service => 
        service.id === editingService.id 
          ? {
              ...service,
              name: newService.name.trim(),
              price: parseFloat(newService.price).toFixed(2),
              updatedAt: new Date().toISOString()
            }
          : service
      );
      
      console.log('updateService: Updated list:', updatedPriceList);

      await updateBarberPortfolio(currentUser.uid, {
        listinoPrezzo: updatedPriceList
      });

      setUserData(prev => ({
        ...prev,
        listinoPrezzo: updatedPriceList
      }));

      setNewService({ name: '', price: '' });
      setEditingService(null);
      setIsEditing(false);
      setShowPriceModal(false);
      Alert.alert('Successo', 'Servizio aggiornato!');
    } catch (error) {
      console.error('updateService: Error:', error);
      Alert.alert('Errore', 'Impossibile aggiornare il servizio: ' + error.message);
    }
  };

  const cancelEdit = () => {
    setNewService({ name: '', price: '' });
    setEditingService(null);
    setIsEditing(false);
    setShowPriceModal(false);
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
            <Text style={styles.welcomeText}>Benvenuto! 💼</Text>
            <Text style={styles.salonName}>{userData?.nomeSalone}</Text>
            <Text style={styles.roleText}>Account Parrucchiere</Text>
          </View>

          {/* Dati Salone */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Il tuo salone</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nome:</Text>
              <Text style={styles.infoValue}>{userData?.nomeSalone}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Indirizzo:</Text>
              <Text style={styles.infoValue}>{userData?.via}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Telefono:</Text>
              <Text style={styles.infoValue}>{userData?.telefono}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email contatti:</Text>
              <Text style={styles.infoValue}>{userData?.emailContatto}</Text>
            </View>
            
            {userData?.sitoWeb && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Sito web:</Text>
                <Text style={styles.infoValue}>{userData.sitoWeb}</Text>
              </View>
            )}
          </View>

          {/* Staff */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Il tuo team</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dipendenti:</Text>
            </View>
            <Text style={styles.staffText}>{userData?.nomiDipendenti || 'Nessun dipendente inserito'}</Text>
          </View>

          {/* Specializzazioni */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Le tue specializzazioni</Text>
            
            <View style={styles.tagsContainer}>
              {userData?.tipiTaglio?.map((taglio, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{taglio}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Gestione Business */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gestione business</Text>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>📅 Gestisci prenotazioni</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>👥 Clienti del salone</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>📊 Statistiche</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>💰 Gestisci prezzi</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigate('EditBarberProfile', { 
                userId: userData?.id || auth.currentUser?.uid,
                currentUserData: userData 
              })}
            >
              <Text style={styles.actionButtonText}>⚙️ Modifica profilo salone</Text>
            </TouchableOpacity>
          </View>

          {/* Promozione */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Il tuo portfolio</Text>
            
            {/* Foto Portfolio */}
            <View style={styles.portfolioSection}>
              <View style={styles.portfolioHeader}>
                <Text style={styles.portfolioTitle}>📸 Foto dei tuoi lavori ({userData?.portfolioImages?.length || 0})</Text>
                <TouchableOpacity 
                  style={[styles.addButton, uploading && styles.addButtonDisabled]} 
                  onPress={handleAddImages}
                  disabled={uploading}
                >
                  <Text style={styles.addButtonText}>
                    {uploading ? 'Caricando...' : '+ Aggiungi'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {userData?.portfolioImages?.length > 0 ? (
                <FlatList
                  data={userData.portfolioImages}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item, index }) => (
                    <View style={styles.mediaItem}>
                      <Image source={{ uri: item.url }} style={styles.mediaPreview} />
                      <TouchableOpacity 
                        style={styles.removeButton} 
                        onPress={() => removeMedia(index, 'image')}
                      >
                        <Text style={styles.removeButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              ) : (
                <Text style={styles.emptyPortfolioText}>
                  Nessuna foto nel portfolio. Aggiungi foto dei tuoi lavori per attirare più clienti!
                </Text>
              )}
            </View>

            {/* Video Portfolio */}
            <View style={styles.portfolioSection}>
              <View style={styles.portfolioHeader}>
                <Text style={styles.portfolioTitle}>🎥 Video dei tuoi lavori ({userData?.portfolioVideos?.length || 0})</Text>
                <TouchableOpacity 
                  style={[styles.addButton, uploading && styles.addButtonDisabled]} 
                  onPress={handleAddVideos}
                  disabled={uploading}
                >
                  <Text style={styles.addButtonText}>
                    {uploading ? 'Caricando...' : '+ Aggiungi'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {userData?.portfolioVideos?.length > 0 ? (
                <FlatList
                  data={userData.portfolioVideos}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item, index }) => (
                    <View style={styles.mediaItem}>
                      <View style={styles.videoPreview}>
                        <Text style={styles.videoIcon}>🎥</Text>
                        <Text style={styles.videoText}>Video {index + 1}</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.removeButton} 
                        onPress={() => removeMedia(index, 'video')}
                      >
                        <Text style={styles.removeButtonText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              ) : (
                <Text style={styles.emptyPortfolioText}>
                  Nessun video nel portfolio. Aggiungi video dei tuoi lavori per mostrare le tue skill!
                </Text>
              )}
            </View>
          </View>

          {/* Listino Prezzi */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>💰 Listino Prezzi ({userData?.listinoPrezzo?.length || 0})</Text>
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={() => setShowPriceModal(true)}
              >
                <Text style={styles.addButtonText}>+ Aggiungi</Text>
              </TouchableOpacity>
            </View>
            
            {userData?.listinoPrezzo?.length > 0 ? (
              <View style={styles.priceList}>
                {userData.listinoPrezzo.map((service) => (
                  <View key={service.id} style={styles.priceItem}>
                    <View style={styles.priceInfo}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.servicePrice}>€{service.price}</Text>
                    </View>
                    <View style={styles.serviceButtons}>
                      <TouchableOpacity 
                        style={styles.editServiceButton}
                        onPress={() => editService(service)}
                      >
                        <Text style={styles.editServiceText}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.removeServiceButton}
                        onPress={() => removeServiceFromPrice(service.id)}
                      >
                        <Text style={styles.removeServiceText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyPortfolioText}>
                Nessun servizio nel listino. Aggiungi i tuoi servizi con i prezzi!
              </Text>
            )}
          </View>

          {/* Promozione */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Promuovi il tuo salone</Text>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>📸 Carica foto lavori</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>⭐ Gestisci recensioni</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>🎯 Crea offerte speciali</Text>
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>🚪 Disconnetti</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* Modal per aggiungere servizio al listino */}
      <Modal
        visible={showPriceModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPriceModal(false)}
      >
        <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {isEditing ? 'Modifica Servizio' : 'Aggiungi Servizio'}
          </Text>            <Text style={styles.inputLabel}>Nome del servizio</Text>
            <TextInput
              style={styles.textInput}
              value={newService.name}
              onChangeText={(text) => setNewService(prev => ({ ...prev, name: text }))}
              placeholder="es. Taglio uomo"
              placeholderTextColor="#999"
            />
            
            <Text style={styles.inputLabel}>Prezzo (€)</Text>
            <TextInput
              style={styles.textInput}
              value={newService.price}
              onChangeText={(text) => setNewService(prev => ({ ...prev, price: text }))}
              placeholder="es. 15.00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={cancelEdit}
              >
                <Text style={styles.cancelButtonText}>Annulla</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={isEditing ? updateService : addServiceToPrice}
              >
                <Text style={styles.confirmButtonText}>
                  {isEditing ? 'Aggiorna' : 'Aggiungi'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  salonName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#00BCD4',
    marginBottom: 5,
  },
  roleText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
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
    flex: 2,
    textAlign: 'right',
  },
  staffText: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 22,
    marginTop: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  portfolioSection: {
    marginBottom: 20,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  portfolioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  addButton: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  mediaItem: {
    marginRight: 15,
    position: 'relative',
  },
  mediaPreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
  },
  videoPreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#E8F8F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00BCD4',
    borderStyle: 'dashed',
  },
  videoIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  videoText: {
    fontSize: 12,
    color: '#00BCD4',
    fontWeight: '600',
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyPortfolioText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
  },
  // Stili Listino Prezzi
  priceList: {
    marginTop: 10,
  },
  priceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  priceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00BCD4',
  },
  serviceButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editServiceButton: {
    backgroundColor: '#2196F3',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editServiceText: {
    fontSize: 14,
  },
  removeServiceButton: {
    backgroundColor: '#FF5252',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  removeServiceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Stili Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 5,
    marginTop: 15,
  },
  textInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    gap: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#00BCD4',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
