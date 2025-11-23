import { Theme } from '../stores/themeStore';

export const colors: Record<Theme, {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}> = {
  light: {
    background: '#f5f5f5',
    surface: '#fff',
    card: '#fff',
    text: '#333',
    textSecondary: '#666',
    border: '#eee',
    primary: '#007AFF',
    success: '#27ae60',
    error: '#e74c3c',
    warning: '#f39c12',
    info: '#3498db',
  },
  dark: {
    background: '#1a1a1a',
    surface: '#2d2d2d',
    card: '#3a3a3a',
    text: '#f0f0f0',
    textSecondary: '#b0b0b0',
    border: '#4a4a4a',
    primary: '#0a84ff',
    success: '#34c759',
    error: '#ff453a',
    warning: '#ff9500',
    info: '#30b0c0',
  },
};

export const getColors = (theme: Theme) => colors[theme];
