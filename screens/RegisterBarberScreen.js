import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  FlatList
} from 'react-native';
import { registerBarber } from '../services/authService';
import { pickImages, pickVideos } from '../services/mediaService';

export default function RegisterBarberScreen({ onGoToLogin }) {
  const [formData, setFormData] = useState({
    // 1) Email, password
    email: '',
    password: '',
    confirmPassword: '',
    
    // 2) Nome salone, nomi dipendenti, via, specializzazioni taglio
    nomeSalone: '',
    nomiDipendenti: '',
    via: '',
    tipiTaglio: [], // Array per selezione multipla specializzazioni
    
    // 3) Contatti e sito per prenotazione
    telefono: '',
    sitoWeb: '',
    emailContatto: '',
    
    // 4) Media portfolio (opzionale)
    portfolioImages: [],
    portfolioVideos: [],
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleTaglio = (taglioId) => {
    setFormData(prev => ({
      ...prev,
      tipiTaglio: prev.tipiTaglio.includes(taglioId)
        ? prev.tipiTaglio.filter(id => id !== taglioId)
        : [...prev.tipiTaglio, taglioId]
    }));
  };

  const handlePickImages = async () => {
    try {
      const images = await pickImages(true);
      if (images) {
        setFormData(prev => ({
          ...prev,
          portfolioImages: [...prev.portfolioImages, ...images]
        }));
      }
    } catch (error) {
      Alert.alert('Errore', 'Impossibile selezionare le immagini');
    }
  };

  const handlePickVideos = async () => {
    try {
      const videos = await pickVideos(true);
      if (videos) {
        setFormData(prev => ({
          ...prev,
          portfolioVideos: [...prev.portfolioVideos, ...videos]
        }));
      }
    } catch (error) {
      Alert.alert('Errore', 'Impossibile selezionare i video');
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      portfolioImages: prev.portfolioImages.filter((_, i) => i !== index)
    }));
  };

  const removeVideo = (index) => {
    setFormData(prev => ({
      ...prev,
      portfolioVideos: prev.portfolioVideos.filter((_, i) => i !== index)
    }));
  };

  const tagliOptions = [
    { 
      id: 'classico', 
      name: 'Classico', 
      emoji: '👔',
      description: 'Taglio tradizionale e ordinato'
    },
    { 
      id: 'fade', 
      name: 'Fade', 
      emoji: '🌅',
      description: 'Sfumatura graduale'
    },
    { 
      id: 'rasati', 
      name: 'Rasati', 
      emoji: '⚡',
      description: 'Taglio molto corto'
    },
    { 
      id: 'moderni', 
      name: 'Moderni', 
      emoji: '✨',
      description: 'Stili attuali e trendy'
    },
    { 
      id: 'barba', 
      name: 'Barba', 
      emoji: '🧔',
      description: 'Cura e styling barba'
    },
    { 
      id: 'baffi', 
      name: 'Baffi', 
      emoji: '👨',
      description: 'Styling baffi'
    }
  ];

  const handleRegister = async () => {
    // Validazione campi obbligatori
    if (!formData.email || !formData.password || !formData.confirmPassword || 
        !formData.nomeSalone || !formData.via || !formData.telefono || 
        !formData.emailContatto) {
      Alert.alert('Errore', 'Completa tutti i campi obbligatori');
      return;
    }
    
    // Validazione password
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Errore', 'Le password non coincidono');
      return;
    }
    
    try {
      await registerBarber(formData);
      Alert.alert('Successo', 'Registrazione completata!');
      // Firebase observer gestirà automaticamente lo stato
    } catch (error) {
      Alert.alert('Errore', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>aircut</Text>

          <Text style={styles.sectionTitle}>Credenziali</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              secureTextEntry
              autoCompleteType="off"
              textContentType="none"
              autoCorrect={false}
              autoCapitalize="none"
              keyboardType="default"
              passwordRules=""
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Conferma Password"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              secureTextEntry
              autoCompleteType="off"
              textContentType="none"
              autoCorrect={false}
              autoCapitalize="none"
              keyboardType="default"
              passwordRules=""
            />
          </View>

          <Text style={styles.sectionTitle}>Dati Salone</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nome del Salone"
              value={formData.nomeSalone}
              onChangeText={(value) => updateField('nomeSalone', value)}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nomi Dipendenti (separati da virgola)"
              value={formData.nomiDipendenti}
              onChangeText={(value) => updateField('nomiDipendenti', value)}
              multiline
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Via (Indirizzo del salone)"
              value={formData.via}
              onChangeText={(value) => updateField('via', value)}
            />
          </View>

          <Text style={styles.subtitle}>Specializzazioni taglio (selezione multipla)</Text>
          
          <View style={styles.taglioGrid}>
            {tagliOptions.map((taglio) => (
              <TouchableOpacity
                key={taglio.id}
                style={[
                  styles.taglioCard,
                  formData.tipiTaglio.includes(taglio.id) && styles.taglioCardActive
                ]}
                onPress={() => toggleTaglio(taglio.id)}
              >
                <Text style={styles.taglioEmoji}>{taglio.emoji}</Text>
                <Text style={styles.taglioName}>{taglio.name}</Text>
                <Text style={styles.taglioDescription}>{taglio.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Contatti e Prenotazione</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Numero di telefono"
              value={formData.telefono}
              onChangeText={(value) => updateField('telefono', value)}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Sito web (opzionale)"
              value={formData.sitoWeb}
              onChangeText={(value) => updateField('sitoWeb', value)}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email per contatti/prenotazioni"
              value={formData.emailContatto}
              onChangeText={(value) => updateField('emailContatto', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.sectionTitle}>Portfolio (Opzionale)</Text>
          <Text style={styles.subtitle}>Carica foto e video dei tuoi lavori per attirare più clienti</Text>
          
          {/* Sezione Foto */}
          <View style={styles.mediaSection}>
            <View style={styles.mediaSectionHeader}>
              <Text style={styles.mediaSectionTitle}>📸 Foto dei tuoi lavori</Text>
              <TouchableOpacity style={styles.addMediaButton} onPress={handlePickImages}>
                <Text style={styles.addMediaButtonText}>+ Aggiungi Foto</Text>
              </TouchableOpacity>
            </View>
            
            {formData.portfolioImages.length > 0 ? (
              <FlatList
                data={formData.portfolioImages}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View style={styles.mediaItem}>
                    <Image source={{ uri: item.uri }} style={styles.mediaPreview} />
                    <TouchableOpacity 
                      style={styles.removeMediaButton} 
                      onPress={() => removeImage(index)}
                    >
                      <Text style={styles.removeMediaText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            ) : (
              <Text style={styles.noMediaText}>Nessuna foto caricata. Potrai aggiungerle anche dopo la registrazione.</Text>
            )}
          </View>

          {/* Sezione Video */}
          <View style={styles.mediaSection}>
            <View style={styles.mediaSectionHeader}>
              <Text style={styles.mediaSectionTitle}>🎥 Video dei tuoi lavori</Text>
              <TouchableOpacity style={styles.addMediaButton} onPress={handlePickVideos}>
                <Text style={styles.addMediaButtonText}>+ Aggiungi Video</Text>
              </TouchableOpacity>
            </View>
            
            {formData.portfolioVideos.length > 0 ? (
              <FlatList
                data={formData.portfolioVideos}
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
                      style={styles.removeMediaButton} 
                      onPress={() => removeVideo(index)}
                    >
                      <Text style={styles.removeMediaText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            ) : (
              <Text style={styles.noMediaText}>Nessun video caricato. Potrai aggiungerli anche dopo la registrazione.</Text>
            )}
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Registrati</Text>
          </TouchableOpacity>

          <View style={styles.loginSection}>
            <Text style={styles.loginText}>Hai già un account?</Text>
            <TouchableOpacity onPress={onGoToLogin}>
              <Text style={styles.loginLink}>Accedi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00BCD4',
    textAlign: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  taglioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  taglioCard: {
    width: '48%',
    backgroundColor: '#F8F8F8',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  taglioCardActive: {
    backgroundColor: '#E8F8F5',
    borderColor: '#00BCD4',
  },
  taglioEmoji: {
    fontSize: 35,
    marginBottom: 8,
  },
  taglioName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  taglioDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  mediaSection: {
    marginBottom: 25,
  },
  mediaSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  mediaSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addMediaButton: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addMediaButtonText: {
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
  removeMediaButton: {
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
  removeMediaText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noMediaText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
  },
  registerButton: {
    backgroundColor: '#00BCD4',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    fontSize: 16,
    color: '#00BCD4',
    fontWeight: 'bold',
    marginLeft: 5,
  },
});
