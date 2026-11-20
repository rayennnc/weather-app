import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useStatusBarStyle } from '../shared/theme/useStatusBarStyle';
import { useNavigationTheme } from './navigation/navigationTheme';
import { RootNavigator } from './navigation/RootNavigator';
import { QueryProvider } from './providers/QueryProvider';

function App() {
  const statusBarStyle = useStatusBarStyle();
  const navigationTheme = useNavigationTheme();

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <StatusBar barStyle={statusBarStyle} />
        <NavigationContainer theme={navigationTheme}>
          <RootNavigator />
        </NavigationContainer>
      </QueryProvider>
    </SafeAreaProvider>
  );
}

export default App;
