import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import NetInfo from '@react-native-community/netinfo';
import SHA256 from 'crypto-js/sha256';
import Hex from 'crypto-js/enc-hex';
import {EventRegister} from 'react-native-event-listeners';
import axios from 'axios';

const DRAFTS_STORAGE_KEY = 'uploadsDB:drafts';
const RANDOM_ID_KEY = 'authDB:randomId';
const AUTH_TOKEN_KEY = '__users__isLoggedIn';

export const saveDraft = async fileData => {
  try {
    const existingDraftsJson = await AsyncStorage.getItem(DRAFTS_STORAGE_KEY);
    const existingDrafts = existingDraftsJson
      ? JSON.parse(existingDraftsJson)
      : [];

    const draftWithTimestamp = {
      ...fileData,
      createdAt: new Date().toISOString(),
    };

    const updatedDrafts = [...existingDrafts, draftWithTimestamp];

    await AsyncStorage.setItem(
      DRAFTS_STORAGE_KEY,
      JSON.stringify(updatedDrafts),
    );
    return draftWithTimestamp.id;
  } catch (error) {
    console.error('Error saving draft:', error);
    throw error;
  }
};

export const getDrafts = async () => {
  try {
    const draftsJson = await AsyncStorage.getItem(DRAFTS_STORAGE_KEY);
    return draftsJson ? JSON.parse(draftsJson) : [];
  } catch (error) {
    console.error('Error getting drafts:', error);
    return [];
  }
};

export const removeDraft = async id => {
  try {
    const draftsJson = await AsyncStorage.getItem(DRAFTS_STORAGE_KEY);
    const drafts = draftsJson ? JSON.parse(draftsJson) : [];

    const updatedDrafts = drafts.filter(draft => draft.id !== id);
    await AsyncStorage.setItem(
      DRAFTS_STORAGE_KEY,
      JSON.stringify(updatedDrafts),
    );
    return true;
  } catch (error) {
    console.error('Error removing draft:', error);
    return false;
  }
};

export const updateDraftStatus = async (draftId, newStatus) => {
  try {
    const draftsJson = await AsyncStorage.getItem(DRAFTS_STORAGE_KEY);
    const drafts = draftsJson ? JSON.parse(draftsJson) : [];

    const updatedDrafts = drafts.map(draft => {
      if (draft.id === draftId) {
        return {...draft, status: newStatus};
      }
      return draft;
    });

    await AsyncStorage.setItem(
      DRAFTS_STORAGE_KEY,
      JSON.stringify(updatedDrafts),
    );
    return true;
  } catch (error) {
    console.error('Error updating draft status:', error);
    return false;
  }
};

export const getAuthToken = async () => {
  try {
    const tokenn = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    const {token} = JSON.parse(tokenn);
    return token;
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

export const generateRandomString = (length = 10) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const storeRandomId = async randomId => {
  try {
    await AsyncStorage.setItem(RANDOM_ID_KEY, randomId);
  } catch (error) {
    console.error('Error storing random ID:', error);
  }
};

export const getRandomId = async () => {
  try {
    return await AsyncStorage.getItem(RANDOM_ID_KEY);
  } catch (error) {
    console.error('Error retrieving random ID:', error);
    return null;
  }
};

export const deleteRandomId = async () => {
  try {
    await AsyncStorage.removeItem(RANDOM_ID_KEY);
  } catch (error) {
    console.error('Error deleting random ID:', error);
  }
};

export const publishDrafts = async (token, finalPayload, type, apiUrl) => {
  try {
    const response = await axios({
      method: 'POST',
      url: `${apiUrl}/check-ins/${type === 'general' ? 'general' : ''}`,
      data: finalPayload,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      return true;
    } else {
      console.error(
        'Failed to publish drafts:',
        response.status,
        response.statusText,
      );
      return false;
    }
  } catch (error) {
    if (error.response) {
      console.error('Publish error response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }

    return false;
  }
};

export const updateProgressStatus = (progress, status, isPending, imgUrl) => {
  EventRegister.emit('uploadProgress', {
    progress,
    status,
    isPending,
    imgUrl,
  });
};

export const syncDrafts = async () => {
  const randomId = generateRandomString(12);

  const token = await getAuthToken();
  const apiUrl = process.env.API_URL;

  if (!token || !apiUrl) {
    console.log('Missing token or API URL, skipping sync');
    return;
  }

  const drafts = await getDrafts();

  if (!drafts || drafts.length === 0) {
    return;
  }

  for (const draft of drafts) {
    let uploadedMediaFiles = [];

    const {id, files, payload, type, status} = draft;

    if (status === 'readyforPublish') {
      // await updateDraftStatus(id, 'Publishing');
      updateProgressStatus(20, 'Uploading...', true, files[0]);
      await storeRandomId(randomId);

      let uploadedFiles = 0;

      try {
        const filesToUpload = files.map(file => {
          if (typeof file === 'string') {
            return {
              uri: file,
              name:
                file.name ||
                file.uri.split('/').pop() ||
                `image_${Date.now()}.jpg`,
              type: 'image/jpeg',
            };
          } else {
            return file;
          }
        });

        const uploadResponses = await Promise.all(
          filesToUpload?.map(file => {
            return new Promise(async resolve => {
              try {
                const formData = new FormData();
                formData.append('file', {
                  uri: file.uri,
                  name: file.name || 'upload.jpg',
                  type: file.type || 'image/jpeg',
                });

                const response = await axios({
                  method: 'POST',
                  url: `${apiUrl}/upload`,
                  data: formData,
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                  },
                  timeout: 30000,
                  onUploadProgress: progressEvent => {
                    if (progressEvent.total) {
                      const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total,
                      );
                      console.log(`File upload progress: ${percentCompleted}%`);
                    }
                  },
                });

                if (response?.data) {
                  const responseData = response.data;

                  uploadedFiles += 1;
                  const progress =
                    Math.ceil((uploadedFiles / files.length) * 50) + 20;

                  updateProgressStatus(
                    progress,
                    'Uploading...',
                    true,
                    files[0],
                  );

                  resolve(responseData?.meta?.filename || null);
                }
              } catch (error) {
                if (error.response) {
                  console.error('Upload failed with response:', {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers,
                  });
                } else if (error.request) {
                  console.error('No response received:', error.request);
                } else {
                  console.error('Error setting up request:', error.message);
                }

                console.error('Upload error:', error);
                await deleteRandomId();
                resolve(null);
              }
            });
          }),
        );

        uploadedMediaFiles = uploadResponses.filter(fileName => fileName);

        if (uploadedMediaFiles.length === files.length) {
          let finalPayload = {
            ...payload,
            media: uploadedMediaFiles,
          };

          updateProgressStatus(80, 'Publishing...', true, files[0]);
          const dbRandomId = await getRandomId();

          if (dbRandomId === randomId) {
            const publishSuccess = await publishDrafts(
              token,
              finalPayload,
              type,
              apiUrl,
            );

            if (publishSuccess) {
              updateProgressStatus(100, 'Published', true, files[0]);
              await deleteRandomId();

              EventRegister.emit('uploadComplete');

              await removeDraft(draft?.id);
            } else {
              await deleteRandomId();
              await removeDraft(draft?.id);
              updateProgressStatus(0, 'Failed', false, files[0]);
            }
          } else {
            await deleteRandomId();
          }
        } else {
          console.error('Some files failed to upload. Aborting publish.');
          updateProgressStatus(0, 'Upload Failed', false, files[0]);
        }
      } catch (error) {
        console.error('Error in parallel uploads:', error);
        updateProgressStatus(0, 'Error', false, files[0]);
      }
    }
  }
};

export const retryDrafts = async () => {
  const netInfo = await NetInfo.fetch();
  if (netInfo.isConnected) {
    syncDrafts();
  }
};

export async function generateDraftId(payload, files) {
  const text =
    JSON.stringify(payload) +
    files.map(f => (typeof f === 'string' ? f : f.name || f.uri)).join(',');

  const hash = SHA256(text);
  return hash.toString(Hex);
}

export async function getDraftById(draftId) {
  try {
    const draftsJson = await AsyncStorage.getItem(DRAFTS_STORAGE_KEY);
    const drafts = draftsJson ? JSON.parse(draftsJson) : [];
    return drafts.find(draft => draft.id === draftId) || null;
  } catch (error) {
    console.error('Error getting draft by ID:', error);
    return null;
  }
}

export const processFilesForDraft = async selectedFiles => {
  const processedFiles = [];

  for (const fileData of selectedFiles) {
    try {
      let fileInfo;

      if (fileData.file) {
        const file = fileData.file;

        if (file.uri) {
          fileInfo = {
            uri: file.uri,
            name: file.name || file.fileName || `image_${Date.now()}.jpg`,
            type: file.type || 'image/jpeg',
          };
        } else if (file.data) {
          const fileName = file.name || `image_${Date.now()}.jpg`;
          const filePath = `${RNFS.DocumentDirectoryPath}/uploads/${fileName}`;

          await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/uploads`);

          await RNFS.writeFile(filePath, file.data, 'base64');

          fileInfo = {
            uri: `file://${filePath}`,
            name: fileName,
            type: file.type || 'image/jpeg',
          };
        } else {
          console.warn('Unknown file format:', file);
          continue;
        }
      } else {
        fileInfo = {
          uri: fileData.uri,
          name: fileData.name || fileData.fileName || `image_${Date.now()}.jpg`,
          type: fileData.type || 'image/jpeg',
        };
      }

      processedFiles.push(fileInfo);
    } catch (error) {
      console.error('Error processing file:', error);
    }
  }

  return processedFiles;
};
