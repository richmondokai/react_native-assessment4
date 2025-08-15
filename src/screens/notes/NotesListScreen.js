import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDarkMode } from '../../hooks/useDarkMode';

const NotesListScreen = ({ navigation }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { isDarkMode, styles: darkModeStyles } = useDarkMode();

  useEffect(() => {
    loadNotes();
    
    // Set up a listener for when we return to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      loadNotes();
    });

    return unsubscribe;
  }, [navigation]);

  const loadNotes = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem('notes');
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      } else {
        // Sample notes for first-time users
        const sampleNotes = [
          {
            id: '1',
            title: 'Welcome to Notes App',
            content: 'This is a sample note to help you get started. You can edit or delete this note.',
            date: new Date().toISOString(),
            isFavorite: false,
            category: 'Personal'
          },
          {
            id: '2',
            title: 'How to use this app',
            content: 'Tap the + button to create a new note. Tap on a note to view or edit it.',
            date: new Date().toISOString(),
            isFavorite: true,
            category: 'Work'
          }
        ];
        await AsyncStorage.setItem('notes', JSON.stringify(sampleNotes));
        setNotes(sampleNotes);
      }
    } catch (error) {
      console.log('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  const handleAddNote = () => {
    navigation.navigate('NoteDetail', { isNew: true });
  };

  const renderNoteItem = ({ item }) => {
    const date = new Date(item.date);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    return (
      <TouchableOpacity
        style={[
          styles.noteItem, 
          isDarkMode && { 
            backgroundColor: darkModeStyles.card.backgroundColor,
            borderColor: darkModeStyles.card.borderColor,
          }
        ]}
        onPress={() => navigation.navigate('NoteDetail', { noteId: item.id })}
      >
        <View style={styles.noteContent}>
          <Text style={[styles.noteTitle, isDarkMode && { color: darkModeStyles.text.color }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.notePreview, isDarkMode && { color: darkModeStyles.subText.color }]} numberOfLines={2}>
            {item.content}
          </Text>
          <View style={styles.noteFooter}>
            <Text style={[styles.noteDate, isDarkMode && { color: '#888' }]}>{formattedDate}</Text>
            <View style={styles.noteMetadata}>
              {item.isFavorite && (
                <Ionicons name="star" size={16} color="#FFD700" style={styles.noteIcon} />
              )}
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Work':
        return '#4CAF50';
      case 'Personal':
        return '#2196F3';
      case 'Ideas':
        return '#FF9800';
      case 'To-Do':
        return '#9C27B0';
      default:
        return '#607D8B';
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, darkModeStyles.container]}>
        <ActivityIndicator size="large" color={isDarkMode ? "#4a9eff" : "#007AFF"} />
      </View>
    );
  }

  return (
    <View style={[styles.container, darkModeStyles.container]}>
      <TouchableOpacity 
        style={[styles.searchBar, isDarkMode && { 
          backgroundColor: darkModeStyles.card.backgroundColor,
          borderColor: darkModeStyles.card.borderColor,
        }]}
        onPress={handleSearchPress}
      >
        <Ionicons name="search" size={20} color={isDarkMode ? "#b0b0b0" : "#666"} />
        <Text style={[styles.searchPlaceholder, isDarkMode && { color: "#888" }]}>Search notes...</Text>
      </TouchableOpacity>
      
      {notes.length > 0 ? (
        <FlatList
          data={notes}
          renderItem={renderNoteItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.notesList}
        />
      ) : (
        <View style={[styles.emptyContainer, isDarkMode && { backgroundColor: 'transparent' }]}>
          <Ionicons name="document-text-outline" size={80} color={isDarkMode ? "#444" : "#ccc"} />
          <Text style={[styles.emptyText, isDarkMode && { color: darkModeStyles.subText.color }]}>No notes yet</Text>
          <Text style={[styles.emptySubtext, isDarkMode && { color: darkModeStyles.subText.color }]}>Tap the + button to create your first note</Text>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.fab, isDarkMode && { backgroundColor: darkModeStyles.button.backgroundColor }]}
        onPress={handleAddNote}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchPlaceholder: {
    marginLeft: 10,
    fontSize: 16,
    color: '#999',
  },
  notesList: {
    padding: 16,
  },
  noteItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  notePreview: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
  },
  noteMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteIcon: {
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#999',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    right: 20,
    bottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default NotesListScreen;