# FinBoss Mobile

A React Native mobile app for personal finance management built with Expo.

## Features

- User Authentication (Login/Register)
- Transaction Management (Track income and expenses)
- Budget Planning (Create and monitor budgets)
- Analytics & Insights (Spending trends and forecasts)
- Responsive Design (iOS & Android)
- Dark Mode Support

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Zustand with AsyncStorage for persistence
- **HTTP Client**: Axios
- **Storage**: React Native AsyncStorage for secure token and state storage
- **Shared Code**: Reuses services, stores, and types from FinBossShared

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator

## Getting Started

### Installation

```bash
git clone https://github.com/preetanshumishra/FinBossMobile.git
cd FinBossMobile
npm install
```

### Development

Start the Expo development server:

```bash
npm start
```

Then choose your platform:
- Press `i` - Open in iOS Simulator
- Press `a` - Open in Android Emulator
- Press `w` - Open in Web Browser
- Press `j` - Open Debugger
- Press `r` - Reload App

### Environment Variables

Create a `.env` file in the root directory (optional):

```env
VITE_API_BASE_URL=http://localhost:5000
REACT_APP_API_BASE_URL=http://localhost:5000
```

For production, use the Railway API:
```env
VITE_API_BASE_URL=https://finbossapi-production.up.railway.app
REACT_APP_API_BASE_URL=https://finbossapi-production.up.railway.app
```

If no API URL is provided, the app will default to the production API.

## Building

### iOS

```bash
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

### Web

```bash
expo export:web
```

## Project Structure

```
src/
├── services/          # API services (auth, transaction, budget, category, analytics)
├── stores/            # Zustand state management (authStore, themeStore)
├── types/             # TypeScript interfaces (User, Transaction, Budget, etc.)
├── utils/             # Utility functions (exportUtils)
├── hooks/             # Custom hooks (useTheme)
├── styles/            # Theme colors and styling
screens/              # App screens (Login, Dashboard, Transactions, Budgets, Analytics, Settings)
navigation/           # Navigation configuration (RootNavigator, AppNavigator)
├── assets/            # Images, fonts, icons

App.tsx               # Root component
app.json              # Expo configuration
```

## Shared Code

The following are shared with FinBossWeb to maintain a single source of truth:

### Services
- `authService` - Authentication (login, register, profile, preferences)
- `transactionService` - Transaction operations
- `budgetService` - Budget management
- `categoryService` - Category operations
- `analyticsService` - Analytics and insights
- `api` - Axios HTTP client with interceptors

### State Management
- `authStore` - Authentication state (user, tokens, loading, errors)
- `themeStore` - Theme state (light/dark mode, persistence)

### Types
Complete TypeScript interfaces for all domain models

### Utilities
- `exportUtils` - Data export functionality

### Hooks
- `useTheme` - Custom hook for accessing theme and colors throughout the app

### Styling
- `colors.ts` - Light and dark theme color palettes

## App Screens

The mobile app includes the following screens:

### Authentication Screens
- **Login** - User authentication with email and password
- **Register** - New user registration with validation

### Main App Screens
- **Dashboard** - Overview of financial summary, recent transactions, and budget status
- **Transactions** - View, add, and delete transactions with filtering and categorization
- **Budgets** - Create, view, and manage budgets with progress tracking
- **Analytics** - Detailed spending analysis with date range filtering and category breakdown
- **Settings** - User profile, password management, and dark mode toggle

### Navigation
- Bottom tab navigation for easy access to all screens
- Stack navigation within each tab for nested screens
- Authentication flow with conditional rendering based on login state

## Theme Support

The app includes full dark mode support:
- Toggle dark mode in Settings screen
- Theme preference persists across app sessions
- All screens and components adapt to the selected theme
- Light theme with bright colors and dark backgrounds for dark mode

## API Integration

The app communicates with FinBossAPI backend:
- **Development Base URL**: `http://localhost:5000/api/v1`
- **Production Base URL**: `https://finbossapi-production.up.railway.app/api/v1`
- **Authentication**: JWT tokens in Authorization header
- **API Docs**: Available on the backend server

## Testing

Run the app on iOS Simulator:

```bash
npm start
# Press 'i'
```

Run the app on Android Emulator:

```bash
npm start
# Press 'a'
```

## Debugging

- Use Expo DevTools (shake device or press `m` in terminal)
- React Native Debugger for advanced debugging
- Check logs with `npm start` output

## License

MIT

## Support

For issues and questions, refer to:
- FinBossAPI: https://github.com/preetanshumishra/FinBossAPI
- FinBossWeb: https://github.com/preetanshumishra/FinBossWeb
- FinBossShared: https://github.com/preetanshumishra/FinBossShared
