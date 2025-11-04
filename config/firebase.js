// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configurazione Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCADFHu49TRAfrqfTasCFyDwwrfLgtXYGU",
  authDomain: "aircut-a3107.firebaseapp.com",
  projectId: "aircut-a3107",
  storageBucket: "aircut-a3107.appspot.com",
  messagingSenderId: "747155322651",
  appId: "1:747155322651:web:36b46c282240959b9585be"
};

// Inizializza Firebase app
let app;
let auth;
let db;
let storage;

try {
  console.log('Firebase: Initializing app...');
  app = initializeApp(firebaseConfig);
  
  // Inizializza Auth con persistenza su AsyncStorage
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    console.log('Firebase: Auth initialized successfully');
  } catch (e) {
    // Se Auth è già inizializzato, recuperalo
    console.log('Firebase: Auth already initialized, getting existing instance');
    auth = getAuth(app);
  }
  
  db = getFirestore(app);
  storage = getStorage(app);
  console.log('Firebase: All services initialized successfully');
  
} catch (error) {
  console.error('Firebase: Critical initialization error:', error);
  // Fallback per evitare crash completi
  throw new Error(`Firebase initialization failed: ${error.message}`);
}

// Esporta istanze
export { app, auth };
export { db };
export { storage };

// Funzioni per gestire la connessione di rete
export const enableFirestoreNetwork = async () => {
  try {
    await enableNetwork(db);
    console.log('Firebase: Network enabled');
  } catch (error) {
    console.error('Firebase: Error enabling network:', error);
  }
};

export const disableFirestoreNetwork = async () => {
  try {
    await disableNetwork(db);
    console.log('Firebase: Network disabled');
  } catch (error) {
    console.error('Firebase: Error disabling network:', error);
  }
};

// Funzione per verificare lo stato della connessione
export const checkFirestoreConnection = async () => {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.log('Firebase: Connection check timeout');
      resolve(false);
    }, 5000);

    // Prova una semplice operazione per testare la connessione
    db._delegate._databaseId // Accesso interno per verificare la connessione
      .then(() => {
        clearTimeout(timeout);
        resolve(true);
      })
      .catch(() => {
        clearTimeout(timeout);
        resolve(false);
      });
  });
};