import { useColorScheme } from 'react-native';
import { Colors, ColorScheme } from './tokens';
import { useSettingsStore } from '../store/settingsStore';

export function useTheme(): ColorScheme {
  const systemScheme = useColorScheme();
  const darkMode = useSettingsStore((s) => s.darkMode);

  const isDark =
    darkMode === 'dark' || (darkMode === 'auto' && systemScheme === 'dark');

  return isDark ? Colors.dark : Colors.light;
}

export { Colors, ColorScheme };
