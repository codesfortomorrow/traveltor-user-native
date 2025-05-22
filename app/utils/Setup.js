// setup.js
import {initBackgroundTask} from '../utils/BackgroundTaskService';
import {Platform} from 'react-native';

export const setupBackgroundTasks = async () => {
  // Only run this setup once when the app starts
  if (Platform.OS === 'android') {
    // Android-specific setup if needed
    // Note: For react-native-background-actions, most Android setup is handled
    // in the BackgroundService.js configuration
  }

  // Initialize background actions for both platforms
  await initBackgroundTask();

  console.log('Background tasks initialized');
};

// Export other necessary functions from our new implementation
export {stopBackgroundTask} from '../utils/BackgroundTaskService';
