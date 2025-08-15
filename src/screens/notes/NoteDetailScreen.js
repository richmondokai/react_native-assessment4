import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDarkMode } from '../../hooks/useDarkMode';

const NoteDetailScreen = ({ route, navigation }) => {
  const { noteId, isNew } = route.params || {};
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Personal');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const { isDarkMode, styles: darkModeStyles } = useDarkMode();

  const categories = ['Personal', 'Work', 'Ideas', 'To-Do'];

  useEffect(() => {
    if (!isNew) {
      loadNote();
    }
    
    // Set up header right button for saving
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={isDarkMode ? "#4a9eff" : "#007AFF"} />
          ) : (
            <Text style={[styles.headerButtonText, isDarkMode && { color: "#4a9eff" }]}>Save</Text>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, title, content, category, isFavorite, isSaving]);

  const loadNote = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem('notes');
      if (storedNotes) {
        const notesArray = JSON.parse(storedNotes);
        const note = notesArray.find(note => note.id === noteId);
        
        if (note) {
          setTitle(note.title);
          setContent(note.content);
          setCategory(note.category);
          setIsFavorite(note.isFavorite);
        }
      }
    } catch (error) {
      console.log('Error loading note:', error);
      Alert.alert('Error', 'Failed to load note details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your note');
      return;
    }

    setIsSaving(true);

    try {
      const storedNotes = await AsyncStorage.getItem('notes');
      let notesArray = storedNotes ? JSON.parse(storedNotes) : [];
      
      if (isNew) {
        // Create new note
        const newNote = {
          id: Date.now().toString(),
          title: title.trim(),
          content,
          date: new Date().toISOString(),
          category,
          isFavorite
        };
        notesArray.unshift(newNote); // Add to beginning of array
      } else {
        // Update existing note
        notesArray = notesArray.map(note => {
          if (note.id === noteId) {
            return {
              ...note,
              title: title.trim(),
              content,
              category,
              isFavorite,
              date: new Date().toISOString() // Update modification date
            };
          }
          return note;
        });
      }
      
      await AsyncStorage.setItem('notes', JSON.stringify(notesArray));
      navigation.goBack();
    } catch (error) {
      console.log('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const storedNotes = await AsyncStorage.getItem('notes');
              if (storedNotes) {
                const notesArray = JSON.parse(storedNotes);
                const updatedNotes = notesArray.filter(note => note.id !== noteId);
                await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
                navigation.goBack();
              }
            } catch (error) {
              console.log('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note');
            }
          }
        }
      ]
    );
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const selectCategory = (selectedCategory) => {
    setCategory(selectedCategory);
    setShowCategoryPicker(false);
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, darkModeStyles.container]}>
        <ActivityIndicator size="large" color={isDarkMode ? "#4a9eff" : "#007AFF"} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, darkModeStyles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView style={[styles.scrollContainer, isDarkMode && { backgroundColor: 'transparent' }]}>
        <View style={styles.form}>
          <TextInput
            style={[styles.titleInput, isDarkMode && { 
              color: darkModeStyles.text.color,
              borderBottomColor: darkModeStyles.separator.backgroundColor
            }]}
            placeholder="Note Title"
            placeholderTextColor={isDarkMode ? '#888' : '#999'}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          
          <View style={styles.noteOptions}>
            <TouchableOpacity 
              style={styles.categoryButton}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text style={[styles.categoryLabel, isDarkMode && { color: darkModeStyles.subText.color }]}>Category:</Text>
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(category) }]}>
                <Text style={styles.categoryText}>{category}</Text>
                <Ionicons name="chevron-down" size={14} color="#fff" style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={toggleFavorite}
            >
              <Ionicons 
                name={isFavorite ? "star" : "star-outline"} 
                size={24} 
                color={isFavorite ? "#FFD700" : "#999"} 
              />
            </TouchableOpacity>
          </View>
          
          {showCategoryPicker && (
            <View style={[styles.categoryPicker, isDarkMode && { 
              backgroundColor: darkModeStyles.card.backgroundColor,
              borderColor: darkModeStyles.card.borderColor
            }]}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    category === cat && (isDarkMode ? { backgroundColor: '#333' } : styles.selectedCategory)
                  ]}
                  onPress={() => selectCategory(cat)}
                >
                  <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(cat) }]} />
                  <Text style={[styles.categoryOptionText, isDarkMode && { color: darkModeStyles.text.color }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          <TextInput
            style={[styles.contentInput, isDarkMode && { color: darkModeStyles.text.color }]}
            placeholder="Start writing your note here..."
            placeholderTextColor={isDarkMode ? '#888' : '#999'}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {!isNew && (
        <TouchableOpacity 
          style={[styles.deleteButton, isDarkMode && { borderTopColor: darkModeStyles.separator.backgroundColor }]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
          <Text style={styles.deleteButtonText}>Delete Note</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    padding: 16,
  },
  headerButton: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
  },
  headerButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  titleInput: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  noteOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 16,
    marginRight: 8,
    color: '#666',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  favoriteButton: {
    padding: 8,
  },
  categoryPicker: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  selectedCategory: {
    backgroundColor: '#e0e0e0',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryOptionText: {
    fontSize: 16,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 300,
    textAlignVertical: 'top',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default NoteDetailScreen;