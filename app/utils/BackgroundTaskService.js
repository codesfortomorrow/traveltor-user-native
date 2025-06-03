// BackgroundService.js
import BackgroundActions from 'react-native-background-actions';
import NetInfo from '@react-native-community/netinfo';
import {syncDrafts} from './draftManager';

// Configuration for background tasks
const backgroundTaskOptions = {
  taskName: 'TraveltorSync',
  taskTitle: 'Background Sync',
  taskDesc: 'Syncing your travel data',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ffffff',
  linkingURI: 'traveltor://', // Optional deep linking URI
  parameters: {
    delay: 15 * 60 * 1000, // 15 minutes in milliseconds
  },
};

// The task that will be executed in the background
const backgroundTask = async taskDataArguments => {
  const {delay} = taskDataArguments;

  // This is how you'd implement a periodic task with react-native-background-actions
  const checkAndSync = async () => {
    // Check if we're online before attempting to sync
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      console.log('[BackgroundActions] Running sync task');
      await syncDrafts();
    } else {
      console.log('[BackgroundActions] No internet connection, skipping sync');
    }
  };

  await new Promise(async resolve => {
    // Run once immediately
    await checkAndSync();

    // Then set up periodic execution
    const interval = setInterval(async () => {
      await checkAndSync();

      // Check if the background service is still running
      if (!(await BackgroundActions.isRunning())) {
        clearInterval(interval);
        resolve();
      }
    }, delay);
  });
};

// Initialize background task
export const initBackgroundTask = async () => {
  try {
    // Register for network events
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        retryDrafts();
      }
    });

    // Start the background service if it's not already running
    if (!(await BackgroundActions.isRunning())) {
      await BackgroundActions.start(backgroundTask, backgroundTaskOptions);
      console.log(
        '[BackgroundActions] Successfully started background service',
      );
    }
  } catch (error) {
    console.log(
      '[BackgroundActions] Failed to start background service:',
      error,
    );
  }
};

// Function to stop the background service
export const stopBackgroundTask = async () => {
  try {
    await BackgroundActions.stop();
    console.log('[BackgroundActions] Background service stopped');
  } catch (error) {
    console.log(
      '[BackgroundActions] Failed to stop background service:',
      error,
    );
  }
};

// Retry function
export const retryDrafts = async () => {
  const netInfo = await NetInfo.fetch();
  if (netInfo.isConnected) {
    await syncDrafts();
  }
};

// Function to publish drafts (to be called from your components)
export const publishDraft = async () => {
  try {
    // Check if we're online
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);

    if (isConnected) {
      // Try immediately if we're online
      setTimeout(() => retryDrafts(), 1000);
    } else {
      // If offline, make sure background service is running
      if (!(await BackgroundActions.isRunning())) {
        await BackgroundActions.start(backgroundTask, backgroundTaskOptions);
      }
    }

    return {status: true};
  } catch (error) {
    console.error('Failed to schedule background task:', error);
    return {status: false};
  }
};
