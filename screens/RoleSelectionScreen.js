import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Animated,
  Dimensions
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function RoleSelectionScreen({ onRoleSelected }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const scaleAnim = new Animated.Value(1);

  const handlePress = (role) => {
    setSelectedRole(role);
    
    // Animazione di feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Ritardo per mostrare la selezione
    setTimeout(() => {
      onRoleSelected(role);
    }, 200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        {/* Logo/Brand */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandText}>aircut</Text>
          <Text style={styles.subtitle}>Scegli come vuoi utilizzare l'app</Text>
        </View>

        {/* Role Cards */}
        <View style={styles.cardsContainer}>
          
          {/* Cliente Card */}
          <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
              style={[
                styles.cardButton,
                selectedRole === 'client' && styles.cardButtonSelected
              ]}
              onPress={() => handlePress('client')}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardEmoji}>✂️</Text>
                <Text style={styles.cardTitle}>Cliente</Text>
                <Text style={styles.cardDescription}>
                  Prenota il tuo taglio{'\n'}
                  Scopri i migliori parrucchieri
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Parrucchiere Card */}
          <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
              style={[
                styles.cardButton,
                selectedRole === 'barber' && styles.cardButtonSelected
              ]}
              onPress={() => handlePress('barber')}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardEmoji}>💼</Text>
                <Text style={styles.cardTitle}>Parrucchiere</Text>
                <Text style={styles.cardDescription}>
                  Gestisci il tuo salone{'\n'}
                  Trova nuovi clienti
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Potrai sempre cambiare questa impostazione
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'space-between',
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  brandText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#00BCD4',
    letterSpacing: 2,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '300',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 50,
  },
  card: {
    marginVertical: 15,
  },
  cardButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardButtonSelected: {
    borderColor: '#00BCD4',
    backgroundColor: '#F0FDFF',
  },
  cardContent: {
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '300',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontWeight: '300',
  },
});