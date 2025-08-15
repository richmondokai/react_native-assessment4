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

const CategoriesScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryNotes, setCategoryNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode, styles: darkModeStyles } = useDarkMode();

  const defaultCategories = [
    { name: 'Personal', color: '#2196F3', icon: 'person-outline' },
    { name: 'Work', color: '#4CAF50', icon: 'briefcase-outline' },
    { name: 'Ideas', color: '#FF9800', icon: 'bulb-outline' },
    { name: 'To-Do', color: '#9C27B0', icon: 'checkbox-outline' }
  ];

  useEffect(() => {
    loadCategories();
    
    // Set up a listener for when we return to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      loadCategories();
      if (selectedCategory) {
        loadCategoryNotes(selectedCategory);
      }
    });

    return unsubscribe;
  }, [navigation]);
  
  // Set navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true
    });
  }, [navigation]);

  const loadCategories = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem('notes');
      if (storedNotes) {
        const notesArray = JSON.parse(storedNotes);
        
        // Get unique categories and count notes in each
        const categoryCounts = {};
        notesArray.forEach(note => {
          if (categoryCounts[note.category]) {
            categoryCounts[note.category]++;
          } else {
            categoryCounts[note.category] = 1;
          }
        });
        
        // Map to our category format
        const categoryList = defaultCategories.map(cat => ({
          ...cat,
          count: categoryCounts[cat.name] || 0
        }));
        
        setCategories(categoryList);
      } else {
        // No notes yet, show empty categories
        setCategories(defaultCategories.map(cat => ({
          ...cat,
          count: 0
        })));
      }
    } catch (error) {
      console.log('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryNotes = async (category) => {
    setLoading(true);
    try {
      const storedNotes = await AsyncStorage.getItem('notes');
      if (storedNotes) {
        const notesArray = JSON.parse(storedNotes);
        const filteredNotes = notesArray.filter(note => note.category === category);
        setCategoryNotes(filteredNotes);
      } else {
        setCategoryNotes([]);
      }
    } catch (error) {
      console.log('Error loading category notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category) => {
    if (selectedCategory === category.name) {
      // If already selected, deselect it
      setSelectedCategory(null);
      setCategoryNotes([]);
    } else {
      setSelectedCategory(category.name);
      loadCategoryNotes(category.name);
    }
  };

  const renderCategoryItem = ({ item }) => {
    const isSelected = selectedCategory === item.name;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          isDarkMode && { 
            backgroundColor: isSelected ? `${item.color}30` : darkModeStyles.card.backgroundColor,
            borderColor: darkModeStyles.card.borderColor
          },
          !isDarkMode && isSelected && { backgroundColor: `${item.color}20` }
        ]}
        onPress={() => handleCategoryPress(item)}
      >
        <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={24} color="#fff" />
        </View>
        <View style={styles.categoryInfo}>
          <Text style={[styles.categoryName, isDarkMode && { color: darkModeStyles.text.color }]}>{item.name}</Text>
          <Text style={[styles.categoryCount, isDarkMode && { color: darkModeStyles.subText.color }]}>{item.count} notes</Text>
        </View>
        <Ionicons 
          name={isSelected ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={isDarkMode ? "#b0b0b0" : "#999"} 
        />
      </TouchableOpacity>
    );
  };

  const renderNoteItem = ({ item }) => {
    const date = new Date(item.date);
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    return (
      <TouchableOpacity
        style={[
          styles.noteItem, 
          isDarkMode && { 
            backgroundColor: '#2c2c2c',
            borderColor: darkModeStyles.card.borderColor 
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
            {item.isFavorite && (
              <Ionicons name="star" size={16} color="#FFD700" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !selectedCategory) {
    return (
      <View style={[styles.loadingContainer, darkModeStyles.container]}>
        <ActivityIndicator size="large" color={isDarkMode ? "#4a9eff" : "#007AFF"} />
      </View>
    );
  }

  return (
    <View style={[styles.container, darkModeStyles.container]}>
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={item => item.name}
        contentContainerStyle={styles.categoriesList}
      />

      {selectedCategory && (
        <View style={[styles.notesContainer, isDarkMode && { 
          backgroundColor: darkModeStyles.card.backgroundColor,
          borderTopColor: darkModeStyles.separator.backgroundColor
        }]}>
          <Text style={[styles.notesTitle, isDarkMode && { color: darkModeStyles.text.color }]}>
            {selectedCategory} Notes ({categoryNotes.length})
          </Text>
          
          {loading ? (
            <ActivityIndicator size="small" color={isDarkMode ? "#4a9eff" : "#007AFF"} style={styles.notesLoading} />
          ) : categoryNotes.length > 0 ? (
            <FlatList
              data={categoryNotes}
              renderItem={renderNoteItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.notesList}
            />
          ) : (
            <View style={[styles.emptyNotesContainer, isDarkMode && { backgroundColor: 'transparent' }]}>
              <Text style={[styles.emptyNotesText, isDarkMode && { color: darkModeStyles.subText.color }]}>
                No notes in this category yet
              </Text>
            </View>
          )}
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    color: '#333',
  },
  categoriesList: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  notesContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 16,
    color: '#333',
  },
  notesLoading: {
    marginTop: 20,
  },
  notesList: {
    padding: 16,
  },
  noteItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
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
  emptyNotesContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyNotesText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default CategoriesScreen;
