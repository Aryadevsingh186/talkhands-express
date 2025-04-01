
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Slot } from 'expo-router';

const App = () => {
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Load global CSS for web only
      require('./assets/global.css');
    }
  }, []);

  return <Slot />;
};

export default App;
