import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WeatherScreen } from '../features/weather/ui/WeatherScreen';
import { QueryProvider } from './providers/QueryProvider';

function App() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        {/* the screen is light only for now, so the status bar icons stay dark. dark mode is v1.1 */}
        <StatusBar barStyle="dark-content" />
        <WeatherScreen />
      </QueryProvider>
    </SafeAreaProvider>
  );
}

export default App;
