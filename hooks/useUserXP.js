import { useState, useEffect, useCallback } from 'react';
import { getCurrentUserData, getUserXP } from '../services/authService';

// Hook per gestire gli XP dell'utente con aggiornamenti in tempo reale
export const useUserXP = () => {
  const [userXP, setUserXP] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await getCurrentUserData();
      if (userData) {
        setCurrentUser(userData);
        const xp = await getUserXP(userData.user.uid);
        setUserXP(xp);
      }
    } catch (error) {
      console.error('useUserXP: Errore caricamento dati:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshXP = useCallback(async () => {
    if (currentUser) {
      try {
        const xp = await getUserXP(currentUser.user.uid);
        setUserXP(xp);
      } catch (error) {
        console.error('useUserXP: Errore refresh XP:', error);
      }
    }
  }, [currentUser]);

  const addXP = useCallback((amount) => {
    setUserXP(prev => Math.max(0, prev + amount));
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return {
    userXP,
    currentUser,
    loading,
    refreshXP,
    addXP,
    reload: loadUserData
  };
};
