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
  linkingURI: 'traveltor://',
  parameters: {
    delay: 15 * 60 * 1000,
  },
};

const backgroundTask = async taskDataArguments => {
  const {delay} = taskDataArguments;

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

export const initBackgroundTask = async () => {
  try {
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        retryDrafts();
      }
    });

    // Start the background service if it's not already running
    if (!(await BackgroundActions.isRunning())) {
      await BackgroundActions.start(backgroundTask, backgroundTaskOptions);
    }
  } catch (error) {
    console.log(
      '[BackgroundActions] Failed to start background service:',
      error,
    );
  }
};

export const stopBackgroundTask = async () => {
  try {
    await BackgroundActions.stop();
  } catch (error) {
    console.log(
      '[BackgroundActions] Failed to stop background service:',
      error,
    );
  }
};

export const retryDrafts = async () => {
  const netInfo = await NetInfo.fetch();
  if (netInfo.isConnected) {
    await syncDrafts();
  }
};

export const publishDraft = async () => {
  try {
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
