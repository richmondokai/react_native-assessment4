# Notes App

A comprehensive note-taking application built with React Native and Expo. This app allows users to create, organize, and manage notes with features like categories, favorites, reminders, offline support, and sync capabilities.

## Features

- **Notes Management**: Create, edit, and delete notes with rich content
- **Categories**: Organize notes by categories (Work, Personal, Ideas, To-Do)
- **Favorites**: Mark important notes as favorites for quick access
- **Reminders**: Set reminders for important tasks and deadlines
- **Dark Mode**: Toggle between light and dark themes
- **User Authentication**: Secure login/signup system with JWT tokens
- **Search**: Advanced search through notes by title and content
- **Offline Support**: Full offline functionality with local storage
- **Sync**: Automatic data synchronization when online
- **Network Status**: Real-time network connectivity monitoring

## Setup Instructions

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- For physical device testing: Expo Go app

### Installation

1. Clone the repository:

```bash
git clone https://github.com/richmondokai/react_native-assessment4.git
cd react_native-assessment4
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm start
# or
expo start
```

4. Run on your preferred platform:
   - Press `a` for Android
   - Press `i` for iOS (requires macOS and Xcode)
   - Press `w` for web
   - Scan the QR code with Expo Go app on your physical device

### Platform-Specific Commands

```bash
# Android (emulator or physical device)
npm run android

# iOS (simulator - macOS only)
npm run ios

# Web browser
npm run web

# Lint code
npm run lint
```

### Connecting to a Physical Android Device

1. Enable USB debugging on your Android device:
   - Go to Settings > About phone
   - Tap "Build number" 7 times to enable Developer options
   - Go to Settings > Developer options
   - Enable "USB debugging"

2. Connect your device via USB cable

3. Verify the connection:
```bash
adb devices
```

4. Start the app:
```bash
npm run android
# or
expo start --android
```

## Navigation Structure

The app uses a combination of drawer navigation, tab navigation, and stack navigation to provide a seamless user experience.

### Main Navigation Flow

```
DrawerNavigator
├── TabNavigator
│   ├── NotesStackNavigator
│   │   ├── NotesList
│   │   ├── NoteDetail
│   │   └── Search
│   ├── FavoritesStackNavigator
│   │   ├── FavoritesList
│   │   └── NoteDetail
│   ├── CategoriesStackNavigator
│   │   ├── CategoriesList
│   │   └── NoteDetail
│   └── RemindersStackNavigator
│       └── RemindersList
├── Profile
├── Statistics
├── Help
└── Settings
```

### Authentication Flow

```
AppNavigator
├── AuthNavigator (when not authenticated)
│   ├── Login
│   ├── Signup
│   └── ForgotPassword
└── DrawerNavigator (when authenticated)
```

## Screen Descriptions

- **Notes**: Main screen for viewing and managing all notes
- **Favorites**: Quick access to favorite notes
- **Categories**: Organize and view notes by categories
- **Reminders**: Set and manage reminders for important tasks
- **Profile**: User profile information and settings
- **Statistics**: View usage statistics and analytics
- **Help**: Help and support information
- **Settings**: App settings including dark mode toggle

## Dark Mode

The app supports system-wide dark mode that can be toggled from the Settings screen. The theme context manages the dark mode state and persists the user's preference.

## Technology Stack

- **Frontend**: React Native 0.79.5
- **Navigation**: React Navigation 7.x (Drawer, Tab, Stack)
- **State Management**: React Context API
- **Local Storage**: AsyncStorage
- **HTTP Client**: Axios
- **UI Framework**: Expo 53.x
- **Network Detection**: @react-native-community/netinfo

## Architecture

The app follows a modular architecture with clear separation of concerns:

- **Services Layer**: Handles API calls, local storage, and sync operations
- **Context Layer**: Manages global state (Auth, Notes, Theme, Network)
- **Components Layer**: Reusable UI components
- **Navigation Layer**: Screen navigation and routing
- **Utils Layer**: Helper functions and type definitions

## Data Storage & Sync

- **Local Storage**: AsyncStorage for offline data persistence
- **Remote Storage**: RESTful API with JWT authentication
- **Sync Strategy**: Optimistic updates with conflict resolution
- **Offline Queue**: Stores operations when offline for later sync

## Development Notes

### Project Structure

```
notes-app/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── NetworkStatusBar.js
│   │   ├── OfflineStatusIndicator.js
│   │   └── ProfileImage.js
│   ├── context/          # Global state management
│   │   ├── AuthContext.js
│   │   ├── NetworkContext.js
│   │   ├── NotesContext.js
│   │   └── ThemeContext.js
│   ├── hooks/            # Custom React hooks
│   │   └── useDarkMode.js
│   ├── navigation/       # Navigation configuration
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   ├── DrawerNavigator.js
│   │   └── TabNavigator.js
│   ├── screens/          # Screen components
│   │   ├── auth/         # Authentication screens
│   │   ├── notes/        # Note management screens
│   │   ├── reminders/    # Reminder screens
│   │   └── settings/     # Settings and profile screens
│   ├── services/         # API and data services
│   │   ├── auth_remote_services.js
│   │   ├── notes_local_services.js
│   │   ├── notes_remote_services.js
│   │   ├── offline_queue_service.js
│   │   └── sync_service.js
│   └── utils/            # Utility functions and types
│       ├── auth_types.js
│       ├── note_types.js
│       ├── networkUtils.js
│       └── errorHandler.js
├── assets/               # Images, fonts, icons
├── app/                  # Expo Router files (if used)
└── App.js                # Entry point
```

### Development Workflow

1. **Setup Development Environment**:
   ```bash
   npm install
   npm start
   ```

2. **Code Quality**:
   ```bash
   npm run lint          # Check code style
   ```

3. **Testing on Different Platforms**:
   ```bash
   npm run android       # Test on Android
   npm run ios          # Test on iOS (macOS only)
   npm run web          # Test on web browser
   ```

### Environment Configuration

The app supports different environments through configuration:

- **Development**: Local development with hot reloading
- **Production**: Optimized build for app stores

### Key Dependencies

- `@react-navigation/*`: Navigation libraries
- `@react-native-async-storage/async-storage`: Local storage
- `@react-native-community/netinfo`: Network state monitoring
- `axios`: HTTP client for API calls
- `expo-*`: Expo SDK modules

### Troubleshooting

**Common Issues:**

1. **Metro bundler cache issues**:
   ```bash
   npx expo start --clear
   ```

2. **Node modules issues**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Android device not detected**:
   ```bash
   adb kill-server
   adb start-server
   adb devices
   ```

4. **iOS simulator issues** (macOS only):
   ```bash
   npx expo install --ios
   ```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Submit a pull request

### Version History

- **v1.0.0**: Initial release with core note-taking features
- **v1.1.0**: Added offline support and sync capabilities
- **v1.2.0**: Enhanced UI/UX with dark mode and improved navigation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please create an issue in the GitHub repository or contact the development team.