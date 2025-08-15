import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDarkMode } from '../../hooks/useDarkMode';

const RemindersScreen = ({ navigation }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDarkMode, styles: darkModeStyles } = useDarkMode();
  
  // Set navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true
    });
  }, [navigation]);

  useEffect(() => {
    loadReminders();
    
    // Set up a listener for when we return to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      loadReminders();
    });

    return unsubscribe;
  }, [navigation]);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const storedReminders = await AsyncStorage.getItem('reminders');
      
      if (storedReminders) {
        setReminders(JSON.parse(storedReminders));
      } else {
        // Sample reminders for first-time users
        const sampleReminders = [
          {
            id: '1',
            title: 'Complete project documentation',
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
            completed: false,
            priority: 'high'
          },
          {
            id: '2',
            title: 'Call team meeting',
            date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
            completed: false,
            priority: 'medium'
          },
          {
            id: '3',
            title: 'Review weekly goals',
            date: new Date().toISOString(), // Today
            completed: true,
            priority: 'low'
          }
        ];
        await AsyncStorage.setItem('reminders', JSON.stringify(sampleReminders));
        setReminders(sampleReminders);
      }
    } catch (error) {
      console.log('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleReminderStatus = async (id) => {
    try {
      const updatedReminders = reminders.map(reminder => {
        if (reminder.id === id) {
          return { ...reminder, completed: !reminder.completed };
        }
        return reminder;
      });
      
      setReminders(updatedReminders);
      await AsyncStorage.setItem('reminders', JSON.stringify(updatedReminders));
    } catch (error) {
      console.log('Error updating reminder:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#FF3B30';
      case 'medium':
        return '#FF9500';
      case 'low':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const renderReminderItem = ({ item }) => {
    const date = new Date(item.date);
    const isToday = new Date().toDateString() === date.toDateString();
    const isPast = date < new Date() && !isToday;
    const formattedDate = isToday 
      ? 'Today' 
      : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    
    return (
      <View 
        style={[
          styles.reminderItem, 
          isDarkMode && { 
            backgroundColor: darkModeStyles.card.backgroundColor,
            borderColor: darkModeStyles.card.borderColor
          },
          item.completed && styles.completedReminder,
          item.completed && isDarkMode && { backgroundColor: '#1a1a1a' }
        ]}
      >
        <TouchableOpacity 
          style={styles.reminderCheckbox}
          onPress={() => toggleReminderStatus(item.id)}
        >
          <Ionicons 
            name={item.completed ? "checkmark-circle" : "ellipse-outline"} 
            size={24} 
            color={item.completed ? "#4CD964" : (isDarkMode ? "#b0b0b0" : "#8E8E93")} 
          />
        </TouchableOpacity>
        
        <View style={styles.reminderContent}>
          <Text 
            style={[
              styles.reminderTitle, 
              isDarkMode && { color: darkModeStyles.text.color },
              item.completed && styles.completedText,
              item.completed && isDarkMode && { color: '#888' }
            ]}
          >
            {item.title}
          </Text>
          
          <View style={styles.reminderMeta}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '30' }]}>
              <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
              </Text>
            </View>
            
            <Text 
              style={[
                styles.reminderDate, 
                isDarkMode && { color: '#888' },
                isPast && { color: '#FF3B30' },
                isPast && isDarkMode && { color: '#FF6B6B' }
              ]}
            >
              {formattedDate}
            </Text>
          </View>
        </View>
      </View>
    );
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
      <FlatList
        data={reminders}
        renderItem={renderReminderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.remindersList}
        ListEmptyComponent={
          <View style={[styles.emptyContainer, isDarkMode && { backgroundColor: 'transparent' }]}>
            <Ionicons name="notifications-outline" size={80} color={isDarkMode ? "#444" : "#ccc"} />
            <Text style={[styles.emptyText, isDarkMode && { color: darkModeStyles.subText.color }]}>No reminders yet</Text>
            <Text style={[styles.emptySubtext, isDarkMode && { color: darkModeStyles.subText.color }]}>
              Create reminders to stay on top of your tasks
            </Text>
          </View>
        }
      />
      
      <TouchableOpacity 
        style={[styles.fab, isDarkMode && { backgroundColor: darkModeStyles.button.backgroundColor }]}
        onPress={() => {
          // In a real app, this would navigate to a reminder creation screen
          alert('Add reminder functionality would go here');
        }}
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
  remindersList: {
    padding: 16,
    paddingTop: 16,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedReminder: {
    backgroundColor: '#f9f9f9',
    opacity: 0.8,
  },
  reminderCheckbox: {
    marginRight: 12,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  reminderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  reminderDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 80,
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

export default RemindersScreen;
