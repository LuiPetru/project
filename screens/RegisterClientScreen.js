import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  ScrollView,
  Image,
  Alert
} from 'react-native';
import { registerClient } from '../services/authService';

export default function RegisterClientScreen({ onGoToLogin }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1 - Credenziali
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 2 - Dati personali
    sesso: '',
    eta: '',
    via: '',
    nomeUtente: '',
    
    // Step 3 - Preferenze taglio
    preferenzaTaglio: [], // Array per selezione multipla
    
    // Step 4 - Raggio
    raggio: 5, // Default 5km
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleTaglio = (taglioId) => {
    setFormData(prev => ({
      ...prev,
      preferenzaTaglio: prev.preferenzaTaglio.includes(taglioId)
        ? prev.preferenzaTaglio.filter(id => id !== taglioId)
        : [...prev.preferenzaTaglio, taglioId]
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.email && formData.password && formData.confirmPassword;
      case 2:
        return formData.sesso && formData.eta && formData.via && formData.nomeUtente;
      case 3:
        return formData.preferenzaTaglio.length > 0;
      case 4:
        return formData.raggio;
      default:
        return false;
    }
  };

  const canProceed = validateStep(currentStep);

  const nextStep = () => {
    if (currentStep < 4 && validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRegister = async () => {
    if (!validateStep(4)) {
      Alert.alert('Errore', 'Completa tutti i campi per continuare');
      return;
    }
    
    // Validazione password
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Errore', 'Le password non coincidono');
      return;
    }
    
    try {
      await registerClient(formData);
      Alert.alert('Successo', 'Registrazione completata!');
      // Firebase observer gestirà automaticamente lo stato
    } catch (error) {
      Alert.alert('Errore', error.message);
    }
  };

  const tagliOptions = [
    { 
      id: 'classico', 
      name: 'Classico', 
      image: '👔',
      description: 'Taglio tradizionale e ordinato'
    },
    { 
      id: 'fade', 
      name: 'Fade', 
      image: '🌅',
      description: 'Sfumatura graduale'
    },
    { 
      id: 'rasati', 
      name: 'Rasati', 
      image: '⚡',
      description: 'Taglio molto corto'
    },
    { 
      id: 'moderni', 
      name: 'Moderni', 
      image: '✨',
      description: 'Stili attuali e trendy'
    }
  ];

  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>Credenziali di accesso</Text>
      
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
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>Dati personali</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Sesso</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity 
            style={[styles.genderButton, formData.sesso === 'M' && styles.genderButtonActive]}
            onPress={() => updateField('sesso', 'M')}
          >
            <Text style={[styles.genderText, formData.sesso === 'M' && styles.genderTextActive]}>Maschio</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.genderButton, formData.sesso === 'F' && styles.genderButtonActive]}
            onPress={() => updateField('sesso', 'F')}
          >
            <Text style={[styles.genderText, formData.sesso === 'F' && styles.genderTextActive]}>Femmina</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Età"
          value={formData.eta}
          onChangeText={(value) => updateField('eta', value)}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Via (indirizzo)"
          value={formData.via}
          onChangeText={(value) => updateField('via', value)}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome utente"
          value={formData.nomeUtente}
          onChangeText={(value) => updateField('nomeUtente', value)}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <Text style={styles.stepTitle}>Preferenze taglio</Text>
      <Text style={styles.subtitle}>Scegli i tuoi stili preferiti (selezione multipla)</Text>
      
      <View style={styles.taglioGrid}>
        {tagliOptions.map((taglio) => (
          <TouchableOpacity
            key={taglio.id}
            style={[
              styles.taglioCard,
              formData.preferenzaTaglio.includes(taglio.id) && styles.taglioCardActive
            ]}
            onPress={() => toggleTaglio(taglio.id)}
          >
            <Text style={styles.taglioEmoji}>{taglio.image}</Text>
            <Text style={styles.taglioName}>{taglio.name}</Text>
            <Text style={styles.taglioDescription}>{taglio.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View>
      <Text style={styles.stepTitle}>Raggio di ricerca</Text>
      <Text style={styles.subtitle}>Fino a che distanza cercare parrucchieri?</Text>
      
      <View style={styles.raggioContainer}>
        <Text style={styles.raggioLabel}>Raggio: {formData.raggio} km</Text>
        <View style={styles.raggioButtons}>
          {[1, 3, 5, 7, 10].map((km) => (
            <TouchableOpacity
              key={km}
              style={[
                styles.raggioButton,
                formData.raggio === km && styles.raggioButtonActive
              ]}
              onPress={() => updateField('raggio', km)}
            >
              <Text style={[
                styles.raggioButtonText,
                formData.raggio === km && styles.raggioButtonTextActive
              ]}>
                {km} km
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>aircut</Text>

          {/* Render current step */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation buttons */}
          <View style={styles.buttonContainer}>
            {currentStep > 1 && (
              <TouchableOpacity style={styles.backButton} onPress={prevStep}>
                <Text style={styles.backButtonText}>Indietro</Text>
              </TouchableOpacity>
            )}
            
            {currentStep < 4 ? (
              <TouchableOpacity 
                style={[
                  styles.nextButton, 
                  !canProceed && styles.nextButtonDisabled
                ]} 
                onPress={nextStep}
                disabled={!canProceed}
              >
                <Text style={[
                  styles.nextButtonText,
                  !canProceed && styles.nextButtonTextDisabled
                ]}>
                  Avanti
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[
                  styles.registerButton,
                  !canProceed && styles.registerButtonDisabled
                ]} 
                onPress={handleRegister}
                disabled={!canProceed}
              >
                <Text style={[
                  styles.registerButtonText,
                  !canProceed && styles.registerButtonTextDisabled
                ]}>
                  Completa Registrazione
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {currentStep === 1 && (
            <View style={styles.loginSection}>
              <Text style={styles.loginText}>Hai già un account?</Text>
              <TouchableOpacity onPress={onGoToLogin}>
                <Text style={styles.loginLink}>Accedi</Text>
              </TouchableOpacity>
            </View>
          )}
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
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
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
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  genderButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#F8F8F8',
  },
  genderButtonActive: {
    backgroundColor: '#00BCD4',
    borderColor: '#00BCD4',
  },
  genderText: {
    fontSize: 16,
    color: '#666',
  },
  genderTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  taglioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    fontSize: 40,
    marginBottom: 10,
  },
  taglioName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  taglioDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  raggioContainer: {
    alignItems: 'center',
  },
  raggioLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00BCD4',
    marginBottom: 20,
  },
  raggioButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  raggioButton: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    margin: 5,
  },
  raggioButtonActive: {
    backgroundColor: '#00BCD4',
    borderColor: '#00BCD4',
  },
  raggioButtonText: {
    fontSize: 16,
    color: '#666',
  },
  raggioButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  backButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  nextButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButtonTextDisabled: {
    color: '#999999',
  },
  registerButton: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
  },
  registerButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButtonTextDisabled: {
    color: '#999999',
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
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
