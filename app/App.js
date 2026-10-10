import { useCallback, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import ChooseRideScreen from './src/screens/ChooseRideScreen';
import SearchingScreen from './src/screens/SearchingScreen';
import RideScreen from './src/screens/RideScreen';

export default function App() {
  const [screen, setScreen] = useState('home'); // home | choose | searching | ride
  const [option, setOption] = useState(null);
  const onFound = useCallback(() => setScreen('ride'), []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {screen === 'home' && <HomeScreen onSearch={() => setScreen('choose')} />}
      {screen === 'choose' && <ChooseRideScreen onBack={() => setScreen('home')} onBook={(o) => { setOption(o); setScreen('searching'); }} />}
      {screen === 'searching' && <SearchingScreen option={option} onFound={onFound} onCancel={() => setScreen('choose')} />}
      {screen === 'ride' && <RideScreen option={option} onDone={() => setScreen('home')} />}
    </SafeAreaProvider>
  );
}
