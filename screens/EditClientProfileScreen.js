import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { 
  updateUserProfile, 
  updateUserEmail, 
  updateUserPassword, 
  sendPasswordResetEmailToUser,
  getUserProfileData 
} from '../services/authService';
import { auth } from '../config/firebase';

export default function EditClientProfileScreen({ userData, onGoBack }) {
  const userId = userData?.id || auth.currentUser?.uid;
  const currentUserData = userData;
  
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    username: '',
    citta: '',
    provincia: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showEmailSection, setShowEmailSection] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await getUserProfileData(userId);
      setFormData({
        nome: userData.nome || '',
        cognome: userData.cognome || '',
        email: userData.email || '',
        telefono: userData.telefono || '',
        username: userData.username || '',
        citta: userData.citta || '',
        provincia: userData.provincia || ''
      });
    } catch (error) {
      Alert.alert('Errore', 'Impossibile caricare i dati del profilo');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Validazione base
      if (!formData.nome.trim() || !formData.cognome.trim() || !formData.username.trim()) {
        Alert.alert('Errore', 'Nome, cognome e username sono obbligatori');
        return;
      }

      await updateUserProfile(userId, formData);
      Alert.alert('Successo', 'Profilo aggiornato con successo', [
        { text: 'OK', onPress: () => onGoBack() }
      ]);
    } catch (error) {
      Alert.alert('Errore', error.message || 'Errore durante l\'aggiornamento del profilo');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    try {
      if (!passwordData.currentPassword) {
        Alert.alert('Errore', 'Inserisci la password attuale per cambiare email');
        return;
      }

      setLoading(true);
      await updateUserEmail(passwordData.currentPassword, formData.email);
      
      Alert.alert('Successo', 'Email aggiornata con successo');
      setShowEmailSection(false);
      setPasswordData({ ...passwordData, currentPassword: '' });
    } catch (error) {
      Alert.alert('Errore', error.message || 'Errore durante l\'aggiornamento dell\'email');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        Alert.alert('Errore', 'Compila tutti i campi password');
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        Alert.alert('Errore', 'Le nuove password non corrispondono');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        Alert.alert('Errore', 'La password deve essere di almeno 6 caratteri');
        return;
      }

      setLoading(true);
      await updateUserPassword(passwordData.currentPassword, passwordData.newPassword);
      
      Alert.alert('Successo', 'Password aggiornata con successo');
      setShowPasswordSection(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      Alert.alert('Errore', error.message || 'Errore durante l\'aggiornamento della password');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    Alert.alert(
      'Reset Password',
      'Vuoi ricevere un\'email per resettare la password?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Invia Email',
          onPress: async () => {
            try {
              setLoading(true);
              await sendPasswordResetEmailToUser(formData.email);
              Alert.alert('Successo', 'Email di reset inviata. Controlla la tua casella di posta.');
            } catch (error) {
              Alert.alert('Errore', error.message || 'Errore durante l\'invio dell\'email');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updatePasswordField = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BCD4" />
        <Text style={styles.loadingText}>Caricamento...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => onGoBack()}>
          <Text style={styles.backText}>← Indietro</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifica Profilo</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Dati Personali */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dati Personali</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome *</Text>
            <TextInput
              style={styles.input}
              value={formData.nome}
              onChangeText={(value) => updateField('nome', value)}
              placeholder="Il tuo nome"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cognome *</Text>
            <TextInput
              style={styles.input}
              value={formData.cognome}
              onChangeText={(value) => updateField('cognome', value)}
              placeholder="Il tuo cognome"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={styles.input}
              value={formData.username}
              onChangeText={(value) => updateField('username', value)}
              placeholder="Nome utente"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Telefono</Text>
            <TextInput
              style={styles.input}
              value={formData.telefono}
              onChangeText={(value) => updateField('telefono', value)}
              placeholder="Numero di telefono"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Città</Text>
            <TextInput
              style={styles.input}
              value={formData.citta}
              onChangeText={(value) => updateField('citta', value)}
              placeholder="La tua città"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Provincia</Text>
            <TextInput
              style={styles.input}
              value={formData.provincia}
              onChangeText={(value) => updateField('provincia', value)}
              placeholder="La tua provincia"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
            <Text style={styles.saveButtonText}>💾 Salva Modifiche</Text>
          </TouchableOpacity>
        </View>

        {/* Gestione Email */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Attuale</Text>
            <View style={styles.emailRow}>
              <TextInput
                style={[styles.input, styles.emailInput]}
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                placeholder="La tua email"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={showEmailSection}
              />
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setShowEmailSection(!showEmailSection)}
              >
                <Text style={styles.editButtonText}>
                  {showEmailSection ? '✖️' : '✏️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showEmailSection && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password Attuale (per conferma) *</Text>
                <TextInput
                  style={styles.input}
                  value={passwordData.currentPassword}
                  onChangeText={(value) => updatePasswordField('currentPassword', value)}
                  placeholder="Password attuale"
                  secureTextEntry
                />
              </View>

              <TouchableOpacity style={styles.updateButton} onPress={handleUpdateEmail}>
                <Text style={styles.updateButtonText}>📧 Aggiorna Email</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Gestione Password */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sicurezza</Text>
          
          <TouchableOpacity 
            style={styles.toggleButton}
            onPress={() => setShowPasswordSection(!showPasswordSection)}
          >
            <Text style={styles.toggleButtonText}>
              🔑 {showPasswordSection ? 'Nascondi' : 'Cambia Password'}
            </Text>
          </TouchableOpacity>

          {showPasswordSection && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password Attuale *</Text>
                <TextInput
                  style={styles.input}
                  value={passwordData.currentPassword}
                  onChangeText={(value) => updatePasswordField('currentPassword', value)}
                  placeholder="Password attuale"
                  secureTextEntry
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nuova Password *</Text>
                <TextInput
                  style={styles.input}
                  value={passwordData.newPassword}
                  onChangeText={(value) => updatePasswordField('newPassword', value)}
                  placeholder="Nuova password (min. 6 caratteri)"
                  secureTextEntry
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Conferma Nuova Password *</Text>
                <TextInput
                  style={styles.input}
                  value={passwordData.confirmPassword}
                  onChangeText={(value) => updatePasswordField('confirmPassword', value)}
                  placeholder="Conferma nuova password"
                  secureTextEntry
                />
              </View>

              <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePassword}>
                <Text style={styles.updateButtonText}>🔐 Cambia Password</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.resetButton} onPress={handlePasswordReset}>
            <Text style={styles.resetButtonText}>📩 Invia Email Reset Password</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#00BCD4',
    paddingTop: 50,
  },
  backButton: {
    padding: 5,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#00BCD4',
    paddingBottom: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailInput: {
    flex: 1,
    marginRight: 12,
  },
  editButton: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#00BCD4',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  toggleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 30,
  },
});
