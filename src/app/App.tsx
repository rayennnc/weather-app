import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { navigationTheme } from './navigation/navigationTheme';
import { RootNavigator } from './navigation/RootNavigator';
import { QueryProvider } from './providers/QueryProvider';

function App() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        {/* the screens are light only for now, so the status bar icons stay dark. dark mode is v1.1 */}
        <StatusBar barStyle="dark-content" />
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator />
        </NavigationContainer>
      </QueryProvider>
    </SafeAreaProvider>
  );
}

export default App;
