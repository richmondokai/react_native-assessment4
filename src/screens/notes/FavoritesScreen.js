import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDarkMode } from '../../hooks/useDarkMode';

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode, styles: darkModeStyles } = useDarkMode();

  useEffect(() => {
    loadFavorites();
    
    // Set up a listener for when we return to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      loadFavorites();
    });

    return unsubscribe;
  }, [navigation]);
  
  // Set navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true
    });
  }, [navigation]);

  const loadFavorites = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem('notes');
      if (storedNotes) {
        const notesArray = JSON.parse(storedNotes);
        const favoriteNotes = notesArray.filter(note => note.isFavorite);
        setFavorites(favoriteNotes);
      }
    } catch (error) {
      console.log('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
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
              <Ionicons name="star" size={16} color="#FFD700" style={styles.noteIcon} />
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
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderNoteItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.notesList}
        />
      ) : (
        <View style={[styles.emptyContainer, isDarkMode && { backgroundColor: 'transparent' }]}>
          <Ionicons name="star-outline" size={80} color={isDarkMode ? "#444" : "#ccc"} />
          <Text style={[styles.emptyText, isDarkMode && { color: darkModeStyles.subText.color }]}>No favorites yet</Text>
          <Text style={[styles.emptySubtext, isDarkMode && { color: darkModeStyles.subText.color }]}>Star your important notes to see them here</Text>
        </View>
      )}
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
});

export default FavoritesScreen;