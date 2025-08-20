import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNotes } from '../../context/NotesContext';
import { useNetwork } from '../../context/NetworkContext';
import { useDarkMode } from '../../hooks/useDarkMode';
import { NOTES_KEY } from '../../constants';

const NoteDetailScreen = ({ route, navigation }) => {
  const { noteId, isNew } = route.params || {};
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Personal');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isNoteLoading, setIsNoteLoading] = useState(false);
  const [hasUserInput, setHasUserInput] = useState(false);
  const [hasUserModifiedCategory, setHasUserModifiedCategory] = useState(false);
  const [hasUserModifiedFavorite, setHasUserModifiedFavorite] = useState(false);
  const { isDarkMode, styles: darkModeStyles } = useDarkMode();
  const { getNoteById, createNote, updateNote, deleteNote, refreshNotes, notes } = useNotes();
  const { isConnected } = useNetwork();
  
  // Store loadNote function in ref to prevent recreation
  const loadNoteRef = useRef();
  
  // Store the current title in a ref to prevent it from being lost
  const titleRef = useRef('');
  const contentRef = useRef('');
  const categoryRef = useRef('Personal');
  const favoriteRef = useRef(false);
  const skipLoadNoteRef = useRef(false);
  
  // Memoized callbacks for better performance
  const handleTitleChange = useCallback((text) => {
    // Ensure text is a string and handle null/undefined cases
    const safeText = text || '';
    console.log('Title changed to:', safeText, 'Length:', safeText.length);
    setTitle(safeText);
    titleRef.current = safeText; // Store in ref as backup
    setHasUserInput(safeText.trim().length > 0); // Set flag if user has input
    skipLoadNoteRef.current = safeText.trim().length > 0; // Set skip flag
    console.log('Title stored in ref:', titleRef.current);
    console.log('User input flag set to:', safeText.trim().length > 0);
    console.log('Skip loadNote flag set to:', skipLoadNoteRef.current);
  }, []);
  
  const handleContentChange = useCallback((text) => {
    // Ensure text is a string and handle null/undefined cases
    const safeText = text || '';
    console.log('Content changed to:', safeText);
    setContent(safeText);
    contentRef.current = safeText; // Store in ref as backup
    skipLoadNoteRef.current = true; // Set skip flag
    console.log('Content stored in ref:', contentRef.current);
    console.log('Skip loadNote flag set to:', skipLoadNoteRef.current);
  }, []);

  const categories = ['Personal', 'Work', 'Ideas', 'To-Do'];

  // Clear state when navigating to a different note or when component unmounts
  useEffect(() => {
    return () => {
      // Clear state when component unmounts
      setTitle('');
      setContent('');
      setCategory('Personal');
      setIsFavorite(false);
      // Also clear refs and flags
      titleRef.current = '';
      contentRef.current = '';
      categoryRef.current = 'Personal';
      favoriteRef.current = false;
      skipLoadNoteRef.current = false;
      setHasUserInput(false);
      setHasUserModifiedCategory(false);
      setHasUserModifiedFavorite(false);
    };
  }, []);

  // Clear state when noteId changes (navigating to a different note)
  useEffect(() => {
    if (route.params?.noteId) {
      // Only clear state if we're navigating to a different note
      // Don't clear if we're just editing the same note
      const currentNoteId = route.params?.noteId;
      if (currentNoteId !== noteId) {
        console.log('Navigating to different note, clearing state');
        setTitle('');
        setContent('');
        setCategory('Personal');
        setIsFavorite(false);
        // Also clear refs and flags
        titleRef.current = '';
        contentRef.current = '';
        categoryRef.current = 'Personal';
        favoriteRef.current = false;
        skipLoadNoteRef.current = false;
        setHasUserInput(false);
        setHasUserModifiedCategory(false);
        setHasUserModifiedFavorite(false);
      } else {
        console.log('Same note, preserving state');
      }
    }
  }, [route.params?.noteId, noteId]);

  useEffect(() => {
    console.log('NoteDetailScreen useEffect triggered');
    console.log('Dependencies changed:', { navigation, isSaving, routeParams: route.params, isDarkMode });
    
    // Extract the noteId from route params every time to ensure it's up to date
    const currentNoteId = route.params?.noteId;
    const isNewNote = route.params?.isNew;
    
    console.log('NoteDetailScreen useEffect - route params:', route.params);
    console.log('NoteDetailScreen useEffect - isNew:', isNewNote, 'noteId:', currentNoteId);
    
    // Only load note if we're not currently saving, we have a noteId, and user hasn't made changes
    if (!isNewNote && currentNoteId && !isSaving && !skipLoadNoteRef.current) {
      console.log('Calling loadNote for existing note');
      
      // Clear refs and modification flags before loading existing note
      // This prevents old ref values from interfering with the loaded note data
      titleRef.current = '';
      contentRef.current = '';
      categoryRef.current = 'Personal';
      favoriteRef.current = false;
      setHasUserInput(false);
      setHasUserModifiedCategory(false);
      setHasUserModifiedFavorite(false);
      
      loadNoteRef.current();
    } else if (isNewNote) {
      console.log('Setting up for new note - clearing state');
      setTitle('');
      setContent('');
      setCategory('Personal');
      setIsFavorite(false);
      
      // Initialize refs for new notes
      titleRef.current = '';
      contentRef.current = '';
      categoryRef.current = 'Personal';
      favoriteRef.current = false;
      skipLoadNoteRef.current = false;
      setHasUserInput(false);
      // Don't clear modification flags for new notes - user might make changes
      // setHasUserModifiedCategory(false);
      // setHasUserModifiedFavorite(false);
    }
    
    // Set up header right button for saving
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          style={[
            styles.headerButton,
            isSaving && styles.headerButtonSaving,
            saveSuccess && styles.headerButtonSuccess
          ]} 
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={isSaving ? 1 : 0.7}
        >
          {isSaving ? (
            <View style={styles.savingContainer}>
              <ActivityIndicator size="small" color={isDarkMode ? "#4a9eff" : "#007AFF"} />
              <Text style={[styles.savingText, isDarkMode && { color: "#4a9eff" }]}>Saving...</Text>
            </View>
          ) : saveSuccess ? (
            <View style={styles.successContainer}>
              <Ionicons 
                name="checkmark-circle" 
                size={16} 
                color={isDarkMode ? "#4CAF50" : "#4CAF50"} 
              />
              <Text style={[styles.successText, { color: isDarkMode ? "#4CAF50" : "#4CAF50" }]}>Saved</Text>
            </View>
          ) : (
            <Text style={[styles.headerButtonText, isDarkMode && { color: "#4a9eff" }]}>Save</Text>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, route.params, isDarkMode, isSaving, saveSuccess]);

  const loadNote = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isNoteLoading) {
      console.log('loadNote already in progress, skipping...');
      return;
    }
    
    // Don't load if user is actively editing (has typed something)
    if (hasUserInput || 
        (title && title.trim().length > 0 && title !== 'Untitled Note') || 
        (titleRef.current && titleRef.current.trim().length > 0 && titleRef.current !== 'Untitled Note')) {
      console.log('User is actively editing, skipping loadNote to preserve changes');
      console.log('User input flag:', hasUserInput);
      console.log('Current title state:', title);
      console.log('Current title ref:', titleRef.current);
      return;
    }
    
    setIsNoteLoading(true);
    
    try {
      // Get the current noteId directly from route.params
      const currentNoteId = route.params?.noteId;
      
      if (!currentNoteId) {
        console.error('Error: noteId is missing in route.params');
        Alert.alert('Error', 'Cannot load note: Note ID is missing');
        navigation.goBack();
        return;
      }
      
      // Always load fresh data when editing existing notes
      // This ensures we don't show stale data
      console.log('Loading note with ID:', currentNoteId);
      console.log('Current notes state length:', notes?.length || 0);
      console.log('Available notes in state:', notes?.map(n => ({ id: n.id, title: n.title, type: typeof n.id })) || []);
      
      // Wait for notes to be available if they're not loaded yet
      if (!notes || notes.length === 0) {
        console.log('Notes not loaded yet, waiting...');
        // Wait a bit for notes to load
        await new Promise(resolve => setTimeout(resolve, 100));
        // Try to refresh notes if they're still not available
        if (!notes || notes.length === 0) {
          console.log('Still no notes, triggering refresh...');
          await refreshNotes();
        }
      }
      
      const note = getNoteById(currentNoteId);
      console.log('Note found:', note);
      
      if (note) {
        // Force a string for title and content
        const noteTitle = note.title ? String(note.title) : 'Untitled Note';
        const noteContent = note.content ? String(note.content) : '';
        
        console.log('Setting title to:', noteTitle, 'Type:', typeof noteTitle);
        console.log('Setting content to:', noteContent?.substring(0, 30) + (noteContent?.length > 30 ? '...' : ''), 'Type:', typeof noteContent);
        
        // Only set title if user hasn't typed anything or if it's different from current
        if (!hasUserInput && 
            (!title || typeof title !== 'string' || title.trim().length === 0 || title === 'Untitled Note') && 
            (!titleRef.current || typeof titleRef.current !== 'string' || titleRef.current.trim().length === 0 || titleRef.current === 'Untitled Note')) {
          console.log('Setting title from note data');
          setTitle(noteTitle);
          titleRef.current = noteTitle; // Update ref to match loaded data
        } else {
          console.log('Preserving user input title:', title || titleRef.current);
          console.log('User input flag:', hasUserInput);
          // Ensure the title state is not empty if we have a ref value
          if ((!title || typeof title !== 'string' || title.trim().length === 0) && titleRef.current && typeof titleRef.current === 'string' && titleRef.current.trim().length > 0) {
            console.log('Restoring title from ref:', titleRef.current);
            setTitle(titleRef.current);
          }
        }
        
        // Only set content if user hasn't typed anything
        if (!contentRef.current || typeof contentRef.current !== 'string' || contentRef.current.trim().length === 0) {
          console.log('Setting content from note data');
          setContent(noteContent);
          contentRef.current = noteContent; // Update ref to match loaded data
        } else {
          console.log('Preserving user input content:', contentRef.current);
          // Ensure the content state matches the ref
          if (content !== contentRef.current) {
            console.log('Restoring content from ref:', contentRef.current);
            setContent(contentRef.current);
          }
        }
        
        // Only set category if user hasn't modified it
        if (!hasUserModifiedCategory) {
          console.log('Setting category from note data');
          setCategory(note.category || 'Personal');
          categoryRef.current = note.category || 'Personal'; // Update ref to match loaded data
        } else {
          console.log('Preserving user input category:', categoryRef.current);
          console.log('User modified category flag:', hasUserModifiedCategory);
          // Ensure the category state matches the ref
          if (category !== categoryRef.current) {
            console.log('Restoring category from ref:', categoryRef.current);
            setCategory(categoryRef.current);
          }
        }
        
        console.log('=== CATEGORY DEBUG ===');
        console.log('hasUserModifiedCategory:', hasUserModifiedCategory);
        console.log('categoryRef.current:', categoryRef.current);
        console.log('note.category:', note.category);
        console.log('Final category state:', category);
        console.log('=== END CATEGORY DEBUG ===');
        
        // Only set favorite if user hasn't modified it
        if (!hasUserModifiedFavorite) {
          console.log('Setting favorite from note data');
          setIsFavorite(note.isFavorite || false);
          favoriteRef.current = note.isFavorite || false; // Update ref to match loaded data
        } else {
          console.log('Preserving user input favorite:', favoriteRef.current);
          console.log('User modified favorite flag:', hasUserModifiedFavorite);
          // Ensure the favorite state matches the ref
          if (isFavorite !== favoriteRef.current) {
            console.log('Restoring favorite from ref:', favoriteRef.current);
            setIsFavorite(favoriteRef.current);
          }
        }
        
        console.log('=== FAVORITE DEBUG ===');
        console.log('hasUserModifiedFavorite:', hasUserModifiedFavorite);
        console.log('favoriteRef.current:', favoriteRef.current);
        console.log('note.isFavorite:', note.isFavorite);
        console.log('Final favorite state:', isFavorite);
        console.log('=== END FAVORITE DEBUG ===');
        
        // Verify the state was set correctly after a small delay
        setTimeout(() => {
          console.log('VERIFICATION - Current title state after setting:', title);
          console.log('VERIFICATION - Current content state after setting:', content && typeof content === 'string' ? content.substring(0, 30) + (content.length > 30 ? '...' : '') : 'empty');
          console.log('VERIFICATION - Current category state after setting:', category);
          console.log('VERIFICATION - Current favorite state after setting:', isFavorite);
          console.log('VERIFICATION - User modified flags - Category:', hasUserModifiedCategory, 'Favorite:', hasUserModifiedFavorite);
        }, 100);
      } else {
        console.log('Note not found in state with ID:', currentNoteId);
        Alert.alert('Error', 'Note not found');
        navigation.goBack();
      }
    } catch (error) {
      console.log('Error loading note:', error);
      Alert.alert('Error', 'Failed to load note details');
    } finally {
      setIsLoading(false);
      setIsNoteLoading(false);
    }
  }, [route.params, getNoteById, navigation, notes, refreshNotes, isNoteLoading]);

  // Assign the function to the ref
  loadNoteRef.current = loadNote;

  const handleSave = async () => {
    console.log('handleSave called with title:', title, 'Length:', title ? title.length : 0);
    console.log('Title type:', typeof title, 'Title value:', JSON.stringify(title));
    console.log('Title from ref:', titleRef.current, 'Length:', titleRef.current ? titleRef.current.length : 0);
    
    // Debug: Notes are now managed by NotesContext with user-specific keys
    console.log('Note loading handled by NotesContext with user-specific storage');
    
    // Always prioritize ref values over state values when they exist
    let currentTitle = titleRef.current || title || '';
    let currentContent = contentRef.current || content || '';
    let currentCategory = categoryRef.current || category || 'Personal';
    let currentFavorite = favoriteRef.current !== undefined ? favoriteRef.current : isFavorite;
    
    // Debug: Log the exact values being used
    console.log('=== SAVE FUNCTION DEBUG ===');
    console.log('titleRef.current:', titleRef.current);
    console.log('contentRef.current:', contentRef.current);
    console.log('categoryRef.current:', categoryRef.current);
    console.log('favoriteRef.current:', favoriteRef.current);
    console.log('title state:', title);
    console.log('content state:', content);
    console.log('category state:', category);
    console.log('isFavorite state:', isFavorite);
    console.log('Final values being used:');
    console.log('- Title:', currentTitle);
    console.log('- Content:', currentContent);
    console.log('- Category:', currentCategory);
    console.log('- Favorite:', currentFavorite);
    console.log('=== END DEBUG ===');
    
    console.log('Current values - Title:', currentTitle, 'Content:', currentContent?.substring(0, 30), 'Category:', currentCategory, 'Favorite:', currentFavorite);
    console.log('State values - Title:', title, 'Content:', content, 'Category:', category, 'Favorite:', isFavorite);
    console.log('Ref values - Title:', titleRef.current, 'Content:', contentRef.current, 'Category:', categoryRef.current, 'Favorite:', favoriteRef.current);
    console.log('User modification flags - Category:', hasUserModifiedCategory, 'Favorite:', hasUserModifiedFavorite);
    
    // If title is empty, use a default title instead of showing an error
    if (!currentTitle || currentTitle.length === 0) {
      console.log('WARNING: Title is empty when saving, using default');
      console.log('Original title state:', JSON.stringify(title));
      console.log('Title from ref:', JSON.stringify(titleRef.current));
      console.log('Current title variable:', JSON.stringify(currentTitle));
      currentTitle = 'Untitled Note';
      console.log('Using default title:', currentTitle);
    }
    
    // Always prioritize ref values over state values when they exist
    if (categoryRef.current) {
      currentCategory = categoryRef.current;
      console.log('Using category from ref:', currentCategory);
    } else {
      // For new notes, use the current state value if ref is not set
      currentCategory = category;
      console.log('Using category from state (new note):', currentCategory);
    }
    
    if (favoriteRef.current !== undefined) {
      currentFavorite = favoriteRef.current;
      console.log('Using favorite from ref:', currentFavorite);
    } else {
      // For new notes, use the current state value if ref is not set
      currentFavorite = isFavorite;
      console.log('Using favorite from state (new note):', currentFavorite);
    }
    
    // Always prioritize ref values over state values when they exist
    if (contentRef.current && typeof contentRef.current === 'string' && contentRef.current.trim().length > 0) {
      currentContent = contentRef.current;
      console.log('Using content from ref:', currentContent);
    } else if (content && typeof content === 'string' && content.trim().length > 0) {
      // Fallback to state content if ref is empty
      currentContent = content;
      console.log('Using content from state:', currentContent);
    }

    setIsSaving(true);
    setSaveSuccess(false); // Clear any previous success state
    // Get the current values from route.params
    const isNewNote = route.params?.isNew;
    const currentNoteId = route.params?.noteId;
    
    console.log('Saving note. Is new?', isNewNote, 'Note ID:', currentNoteId);
    console.log('Current state - title:', currentTitle, 'content:', currentContent);

    try {
      // Make sure we have all the required fields
      const noteData = {
        title: currentTitle.trim(),
        content: currentContent, // Use the current content value
        category: currentCategory,
        isFavorite: currentFavorite,
        // Make sure we preserve the date from the original note if editing
        date: new Date().toISOString()
      };
      
      // Log the content being saved
      console.log('Content being saved:', {
        contentLength: currentContent && typeof currentContent === 'string' ? currentContent.length : 0,
        contentPreview: currentContent && typeof currentContent === 'string' ? currentContent.substring(0, 30) + (currentContent.length > 30 ? '...' : '') : 'empty'
      });
      
      console.log('Note data to save:', noteData);
      let result;
      
      if (isNewNote) {
        // Create new note
        console.log('Creating new note');
        result = await createNote(noteData);
      } else {
        // Update existing note
        console.log('Updating existing note with ID:', currentNoteId);
        
        if (!currentNoteId) {
          console.error('Error: noteId is undefined or null in route.params');
          Alert.alert('Error', 'Cannot update note: Note ID is missing');
          return;
        }
        
        // Get the note again to make sure it exists
        const existingNote = getNoteById(currentNoteId);
        if (!existingNote) {
          console.error('Error: Note not found in state with ID:', currentNoteId);
          Alert.alert('Error', 'Cannot update note: Note not found');
          return;
        }
        
        console.log('Existing note confirmed:', existingNote.id);
        
        // Use the ID directly from the existing note to ensure it matches exactly
        result = await updateNote(existingNote.id, noteData);
      }
      
      console.log('Save result:', result);
      
      if (result && result.success) {
        console.log('Save successful');
        console.log('Saved note data:', result.note);
        
        // Debug: Notes save verification handled by NotesContext with user-specific storage
        console.log('Note save handled by NotesContext with user-specific storage');
        
        // Force a refresh to ensure changes are visible
        try {
          // Set flag to indicate an edit was completed
          await AsyncStorage.setItem('EDIT_COMPLETED', 'true');
          console.log('Set EDIT_COMPLETED flag to true');
          
          // Wait longer for the local storage update to complete
          console.log('Waiting for local storage update to complete...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Now refresh the notes
          try {
            await refreshNotes();
            console.log('Notes refresh completed after save');
          } catch (err) {
            console.log('Caught refresh error in background:', err);
            // No need to rethrow - we're handling it here
          }
          
          console.log('Notes refresh completed');
        } catch (refreshError) {
          console.error('Error during refresh process:', refreshError);
        } finally {
          // Make sure we're not in a loading state, regardless of refresh result
          setIsSaving(false);
          
          // Show success feedback
          setSaveSuccess(true);
          // Provide haptic feedback for successful save
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (hapticError) {
            console.log('Haptic feedback not available:', hapticError);
          }
          // Clear success feedback after 2 seconds
          setTimeout(() => {
            setSaveSuccess(false);
          }, 2000);
        }
        
        // Clear user input flags after successful save
        setHasUserInput(false);
        // Don't clear modification flags here - they should persist for the current note session
        // setHasUserModifiedCategory(false);
        // setHasUserModifiedFavorite(false);
        skipLoadNoteRef.current = false;
        // Don't clear refs here - they should persist for the current note session
        console.log('User input flags cleared after save, modification flags and refs preserved');
        
        // Show success message and navigate back immediately
        Alert.alert(
          isNew ? 'Note Created' : 'Note Updated', 
          isNew ? 'Your note has been created successfully.' : 'Your note has been updated successfully.',
          [{ 
            text: 'OK', 
            onPress: () => {
              // Add a small delay before navigation to ensure state updates complete
              setTimeout(() => {
                navigation.goBack();
              }, 300);
            }
          }]
        );
      } else {
        Alert.alert('Error', (result && result.error) || 'Failed to save note');
      }
    } catch (error) {
      console.log('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note');
      setSaveSuccess(false); // Clear success state on error
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
              const result = await deleteNote(noteId);
              
              if (result.success) {
                navigation.goBack();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete note');
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
    console.log('=== TOGGLE FAVORITE DEBUG ===');
    console.log('Before toggle - isFavorite state:', isFavorite);
    console.log('Before toggle - favoriteRef.current:', favoriteRef.current);
    
    setIsFavorite(prevFavorite => {
      const newFavorite = !prevFavorite;
      favoriteRef.current = newFavorite; // Store in ref as backup
      setHasUserModifiedFavorite(true); // Mark as user modified
      setHasUserInput(true); // Mark that user has made changes
      skipLoadNoteRef.current = true; // Set skip flag
      
      console.log('After toggle - newFavorite:', newFavorite);
      console.log('After toggle - favoriteRef.current:', favoriteRef.current);
      console.log('User modified favorite flag set to:', true);
      console.log('User input flag set to:', true);
      console.log('Skip loadNote flag set to:', skipLoadNoteRef.current);
      console.log('=== END TOGGLE DEBUG ===');
      
      return newFavorite;
    });
  };

  const selectCategory = (selectedCategory) => {
    setCategory(selectedCategory);
    categoryRef.current = selectedCategory; // Store in ref as backup
    setHasUserModifiedCategory(true); // Mark as user modified
    setHasUserInput(true); // Mark that user has made changes
    setShowCategoryPicker(false);
    skipLoadNoteRef.current = true; // Set skip flag
    console.log('Category selected:', selectedCategory, 'Stored in ref:', categoryRef.current);
    console.log('User modified category flag set to:', true);
    console.log('User input flag set to:', true);
    console.log('Skip loadNote flag set to:', skipLoadNoteRef.current);
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
            value={title || ''}
            onChangeText={text => {
              // Ensure text is a string and handle null/undefined cases
              const safeText = text || '';
              console.log('Setting title directly in TextInput:', safeText, 'Length:', safeText.length, 'Type:', typeof safeText);
              setTitle(safeText);
              titleRef.current = safeText; // Store in ref as backup
              setHasUserInput(safeText.trim().length > 0); // Set flag if user has input
              skipLoadNoteRef.current = safeText.trim().length > 0; // Set skip flag
              // Verify it was set immediately
              console.log('Title state immediately after setTitle:', safeText, 'Length:', safeText.length);
              console.log('Title stored in ref:', titleRef.current);
              console.log('User input flag set to:', safeText.trim().length > 0);
              console.log('Skip loadNote flag set to:', skipLoadNoteRef.current);
            }}
            onBlur={() => console.log('Title on blur:', title)}
            maxLength={100}
          />
          
          <View style={styles.noteOptions}>
            <View style={styles.categoryContainer}>
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
              
              {!isConnected && (
                <View style={styles.offlineIndicator}>
                  <Ionicons name="cloud-offline-outline" size={14} color="#FF3B30" />
                  <Text style={styles.offlineText}>Offline</Text>
                </View>
              )}
            </View>
            
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
            value={content || ''}
            onChangeText={handleContentChange}
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
    borderRadius: 6,
  },
  headerButtonSaving: {
    backgroundColor: 'rgba(74, 158, 255, 0.1)',
  },
  headerButtonSuccess: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  headerButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
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
  categoryContainer: {
    flexDirection: 'column',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  offlineText: {
    color: '#FF3B30',
    fontSize: 12,
    marginLeft: 4,
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