# Notes App

A comprehensive note-taking application built with React Native and Expo. This app allows users to create, organize, and manage notes with features like categories, favorites, and reminders.

## Features

- **Notes Management**: Create, edit, and delete notes
- **Categories**: Organize notes by categories (Work, Personal, Ideas, To-Do)
- **Favorites**: Mark important notes as favorites for quick access
- **Reminders**: Set reminders for important tasks and deadlines
- **Dark Mode**: Toggle between light and dark themes
- **User Authentication**: Simple login/signup system
- **Search**: Search through notes by title and content

## Setup Instructions

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd notes-app
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npx expo start
# or
yarn expo start
```

4. Run on your preferred platform:
   - Press `a` for Android
   - Press `i` for iOS (requires macOS)
   - Press `w` for web
   - Scan the QR code with Expo Go app on your physical device

### Connecting to a Physical Android Device

1. Enable USB debugging on your Android device
2. Connect your device via USB
3. Run `adb devices` to verify the connection
4. Start the app with `npx expo start --android`

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

## Data Storage

The app uses AsyncStorage for local data persistence. In a production environment, this could be replaced with a backend API or a more robust local storage solution.

## Development Notes

### Project Structure

```
notes-app/
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # Context providers (ThemeContext)
│   ├── hooks/            # Custom hooks
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # Screen components
│   │   ├── auth/         # Authentication screens
│   │   ├── notes/        # Note management screens
│   │   ├── reminders/    # Reminder screens
│   │   └── settings/     # Settings and profile screens
│   └── utils/            # Utility functions
├── assets/               # Images, fonts, etc.
└── App.js                # Entry point
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.