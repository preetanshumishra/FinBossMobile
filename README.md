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
- **State Management**: Zustand
- **HTTP Client**: Axios
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

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:5000
```

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
├── stores/            # Zustand state management (authStore)
├── types/             # TypeScript interfaces (User, Transaction, Budget, etc.)
├── utils/             # Utility functions (exportUtils)
├── screens/           # App screens (Login, Dashboard, etc.)
├── components/        # Reusable components
├── navigation/        # Navigation configuration
└── assets/            # Images, fonts, icons

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

### Types
Complete TypeScript interfaces for all domain models

### Utilities
- `exportUtils` - Data export functionality

## API Integration

The app communicates with FinBossAPI backend:
- **Base URL**: `http://localhost:5000/api/v1` (development)
- **Production**: https://finbossapi-production.up.railway.app
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
