import { Theme } from '../stores/themeStore';

export const colors: Record<Theme, {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderLight: string;
  primary: string;
  success: string;
  error: string;
  errorLight: string;
  warning: string;
  info: string;
  inputBackground: string;
  inputBorder: string;
  disabled: string;
  placeholder: string;
}> = {
  light: {
    background: '#f5f5f5',
    surface: '#fff',
    card: '#fff',
    text: '#333',
    textSecondary: '#666',
    textTertiary: '#999',
    border: '#ddd',
    borderLight: '#eee',
    primary: '#007AFF',
    success: '#27ae60',
    error: '#e74c3c',
    errorLight: '#fee',
    warning: '#f39c12',
    info: '#3498db',
    inputBackground: '#f9f9f9',
    inputBorder: '#ddd',
    disabled: '#ccc',
    placeholder: '#999',
  },
  dark: {
    background: '#1a1a1a',
    surface: '#2d2d2d',
    card: '#3a3a3a',
    text: '#f0f0f0',
    textSecondary: '#b0b0b0',
    textTertiary: '#808080',
    border: '#4a4a4a',
    borderLight: '#555',
    primary: '#0a84ff',
    success: '#34c759',
    error: '#ff453a',
    errorLight: '#5c2a2a',
    warning: '#ff9500',
    info: '#30b0c0',
    inputBackground: '#2a2a2a',
    inputBorder: '#4a4a4a',
    disabled: '#555',
    placeholder: '#808080',
  },
};

export const getColors = (theme: Theme) => colors[theme];
