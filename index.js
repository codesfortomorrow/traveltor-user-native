/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
// import messaging from '@react-native-firebase/messaging';
import {Provider} from 'react-redux';
import {store} from './app/redux/store';

// Background handler
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('Background (index.js):', remoteMessage);
// });

import {setBackgroundHandler} from './app/notifications/BackgroundHandler'; // adjust path

// ✅ Register background message handler immediately
setBackgroundHandler();

const ReduxWrappedApp = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

AppRegistry.registerComponent(appName, () => ReduxWrappedApp);
