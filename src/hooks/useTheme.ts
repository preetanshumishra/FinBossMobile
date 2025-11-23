import { useMemo } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { getColors } from '../styles/colors';

export const useTheme = () => {
  const { theme } = useThemeStore();
  const colors = useMemo(() => getColors(theme), [theme]);

  return {
    theme,
    colors,
  };
};
