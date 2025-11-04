import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import * as ImagePicker from 'expo-image-picker';

// Richiedi permessi per la galleria
export const requestGalleryPermissions = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    alert('Scusa, abbiamo bisogno dei permessi per accedere alla galleria!');
    return false;
  }
  return true;
};

// Seleziona immagini dalla galleria
export const pickImages = async (allowsMultipleSelection = true) => {
  const hasPermission = await requestGalleryPermissions();
  if (!hasPermission) return null;

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
      allowsMultipleSelection,
    });

    if (!result.canceled) {
      return allowsMultipleSelection ? result.assets : result.assets[0];
    }
    return null;
  } catch (error) {
    console.error('Errore nella selezione immagini:', error);
    return null;
  }
};

// Seleziona video dalla galleria
export const pickVideos = async (allowsMultipleSelection = true) => {
  const hasPermission = await requestGalleryPermissions();
  if (!hasPermission) return null;

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 0.8,
      allowsMultipleSelection,
    });

    if (!result.canceled) {
      return allowsMultipleSelection ? result.assets : result.assets[0];
    }
    return null;
  } catch (error) {
    console.error('Errore nella selezione video:', error);
    return null;
  }
};

// Upload singolo file
export const uploadFile = async (uri, fileName, userId, folder = 'portfolio') => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const storageRef = ref(storage, `${folder}/${userId}/${fileName}`);
    await uploadBytes(storageRef, blob);
    
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Errore upload file:', error);
    throw error;
  }
};

// Upload multipli file
export const uploadMultipleFiles = async (files, userId, folder = 'portfolio', onProgress = () => {}) => {
  const uploadPromises = files.map(async (file, index) => {
    try {
      const fileName = `${Date.now()}_${index}.${file.uri.split('.').pop()}`;
      const url = await uploadFile(file.uri, fileName, userId, folder);
      onProgress(index + 1, files.length);
      return {
        url,
        type: file.type,
        fileName,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Errore upload file ${index}:`, error);
      return null;
    }
  });

  const results = await Promise.all(uploadPromises);
  return results.filter(result => result !== null);
};
