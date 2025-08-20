import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../../hooks/useDarkMode';
import { NOTES_KEY } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { getLocalNotes } from '../../services/notes_local_services';

const StatisticsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalNotes: 0,
    favoriteNotes: 0,
    categories: {},
    wordCount: 0,
    averageLength: 0,
    createdThisWeek: 0,
    createdThisMonth: 0,
    editedThisWeek: 0
  });
  
  const { isDarkMode, styles: darkModeStyles } = useDarkMode();
  const { user } = useAuth();

  useEffect(() => {
    calculateStats();
    
    // Set up a listener for when we return to this screen to refresh stats
    const unsubscribe = navigation.addListener('focus', () => {
      calculateStats();
    });

    return unsubscribe;
  }, [navigation]);

  const calculateStats = async () => {
    try {
      console.log('=== STATISTICS SCREEN DEBUG ===');
      const userId = user?.email || user?.id;
      
      if (!userId) {
        console.log('No user ID available for statistics');
        setStats({
          totalNotes: 0, favoriteNotes: 0, categories: 0,
          avgWordsPerNote: 0, createdThisWeek: 0, createdThisMonth: 0, editedThisWeek: 0
        });
        setLoading(false);
        return;
      }
      
      console.log('Loading statistics for user:', userId);
      const notesArray = await getLocalNotes(userId);
      
      if (notesArray && notesArray.length > 0) {
        console.log('Found notes for statistics:', notesArray.length);
        console.log('Notes data sample:', notesArray.slice(0, 2).map(n => ({
          id: n.id,
          title: n.title,
          category: n.category,
          isFavorite: n.isFavorite,
          contentLength: n.content?.length || 0
        })));
        
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        // Calculate total notes
        const totalNotes = notesArray.length;
        
        // Calculate favorite notes
        const favoriteNotes = notesArray.filter(note => note.isFavorite).length;
        console.log('Favorite notes count:', favoriteNotes);
        
        // Calculate categories
        const categories = {};
        notesArray.forEach(note => {
          const category = note.category || 'Personal'; // Default to Personal if no category
          if (categories[category]) {
            categories[category]++;
          } else {
            categories[category] = 1;
          }
        });
        console.log('Categories breakdown:', categories);
        
        // Calculate word count
        let totalWords = 0;
        notesArray.forEach(note => {
          const words = (note.content || '').trim().split(/\s+/).filter(word => word.length > 0);
          totalWords += words.length;
        });
        
        // Calculate average note length
        const averageLength = totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0;
        console.log('Total words:', totalWords, 'Average length:', averageLength);
        
        // Calculate notes created this week and month
        const createdThisWeek = notesArray.filter(note => {
          const noteDate = new Date(note.date);
          return noteDate >= oneWeekAgo;
        }).length;
        
        const createdThisMonth = notesArray.filter(note => {
          const noteDate = new Date(note.date);
          return noteDate >= oneMonthAgo;
        }).length;
        
        // Calculate notes edited this week (in a real app, you'd track edit dates)
        // For this demo, we'll just use the same date
        const editedThisWeek = notesArray.filter(note => {
          const noteDate = new Date(note.date);
          return noteDate >= oneWeekAgo;
        }).length;
        
        const finalStats = {
          totalNotes,
          favoriteNotes,
          categories,
          wordCount: totalWords,
          averageLength,
          createdThisWeek,
          createdThisMonth,
          editedThisWeek
        };
        
        console.log('Final statistics:', finalStats);
        console.log('=== END STATISTICS SCREEN DEBUG ===');
        setStats(finalStats);
      } else {
        console.log('No notes found in storage for statistics');
        console.log('=== END STATISTICS SCREEN DEBUG ===');
      }
    } catch (error) {
      console.log('Error calculating stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get the category with the most notes
  const getMostUsedCategory = () => {
    let maxCount = 0;
    let maxCategory = 'None';
    
    Object.entries(stats.categories).forEach(([category, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxCategory = category;
      }
    });
    
    return maxCategory;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, darkModeStyles.container]}>
        <ActivityIndicator size="large" color={isDarkMode ? "#4a9eff" : "#007AFF"} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, darkModeStyles.container]}>
      <View style={[styles.header, isDarkMode && { 
        backgroundColor: darkModeStyles.card.backgroundColor,
        borderBottomColor: darkModeStyles.separator.backgroundColor 
      }]}>
        <Text style={[styles.headerTitle, isDarkMode && { color: darkModeStyles.text.color }]}>Your Notes Statistics</Text>
        <Text style={[styles.headerSubtitle, isDarkMode && { color: darkModeStyles.subText.color }]}>
          Track your productivity and note-taking habits
        </Text>
      </View>
      
      <View style={styles.statsOverview}>
        <View style={[styles.statCard, isDarkMode && { 
          backgroundColor: darkModeStyles.card.backgroundColor,
          borderColor: darkModeStyles.card.borderColor
        }]}>
          <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#007AFF30' : '#007AFF20' }]}>
            <Ionicons name="document-text" size={24} color={isDarkMode ? "#4a9eff" : "#007AFF"} />
          </View>
          <Text style={[styles.statValue, isDarkMode && { color: darkModeStyles.text.color }]}>{stats.totalNotes}</Text>
          <Text style={[styles.statLabel, isDarkMode && { color: darkModeStyles.subText.color }]}>Total Notes</Text>
        </View>
        
        <View style={[styles.statCard, isDarkMode && { 
          backgroundColor: darkModeStyles.card.backgroundColor,
          borderColor: darkModeStyles.card.borderColor
        }]}>
          <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#FFD70030' : '#FFD70020' }]}>
            <Ionicons name="star" size={24} color="#FFD700" />
          </View>
          <Text style={[styles.statValue, isDarkMode && { color: darkModeStyles.text.color }]}>{stats.favoriteNotes}</Text>
          <Text style={[styles.statLabel, isDarkMode && { color: darkModeStyles.subText.color }]}>Favorites</Text>
        </View>
        
        <View style={[styles.statCard, isDarkMode && { 
          backgroundColor: darkModeStyles.card.backgroundColor,
          borderColor: darkModeStyles.card.borderColor
        }]}>
          <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#4CAF5030' : '#4CAF5020' }]}>
            <Ionicons name="create" size={24} color="#4CAF50" />
          </View>
          <Text style={[styles.statValue, isDarkMode && { color: darkModeStyles.text.color }]}>{stats.wordCount}</Text>
          <Text style={[styles.statLabel, isDarkMode && { color: darkModeStyles.subText.color }]}>Total Words</Text>
        </View>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, isDarkMode && { color: darkModeStyles.text.color }]}>Activity</Text>
        
        <View style={[styles.activityCard, isDarkMode && { 
          backgroundColor: darkModeStyles.card.backgroundColor,
          borderColor: darkModeStyles.card.borderColor
        }]}>
          <View style={[styles.activityItem, isDarkMode && { 
            borderBottomColor: darkModeStyles.separator.backgroundColor 
          }]}>
            <Text style={[styles.activityLabel, isDarkMode && { color: darkModeStyles.text.color }]}>Created this week</Text>
            <Text style={[styles.activityValue, isDarkMode && { color: "#4a9eff" }]}>{stats.createdThisWeek}</Text>
          </View>
          
          <View style={[styles.activityItem, isDarkMode && { 
            borderBottomColor: darkModeStyles.separator.backgroundColor 
          }]}>
            <Text style={[styles.activityLabel, isDarkMode && { color: darkModeStyles.text.color }]}>Created this month</Text>
            <Text style={[styles.activityValue, isDarkMode && { color: "#4a9eff" }]}>{stats.createdThisMonth}</Text>
          </View>
          
          <View style={[styles.activityItem, isDarkMode && { 
            borderBottomColor: darkModeStyles.separator.backgroundColor 
          }]}>
            <Text style={[styles.activityLabel, isDarkMode && { color: darkModeStyles.text.color }]}>Edited this week</Text>
            <Text style={[styles.activityValue, isDarkMode && { color: "#4a9eff" }]}>{stats.editedThisWeek}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, isDarkMode && { color: darkModeStyles.text.color }]}>Categories</Text>
        
        <View style={[styles.categoriesCard, isDarkMode && { 
          backgroundColor: darkModeStyles.card.backgroundColor,
          borderColor: darkModeStyles.card.borderColor
        }]}>
          {Object.entries(stats.categories).length > 0 ? (
            Object.entries(stats.categories).map(([category, count]) => (
              <View key={category} style={[styles.categoryItem, isDarkMode && { 
                borderBottomColor: darkModeStyles.separator.backgroundColor 
              }]}>
                <View style={styles.categoryNameContainer}>
                  <View 
                    style={[
                      styles.categoryDot, 
                      { backgroundColor: getCategoryColor(category) }
                    ]} 
                  />
                  <Text style={[styles.categoryName, isDarkMode && { color: darkModeStyles.text.color }]}>{category}</Text>
                </View>
                <Text style={[styles.categoryCount, isDarkMode && { color: darkModeStyles.subText.color }]}>{count} notes</Text>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, isDarkMode && { color: darkModeStyles.subText.color }]}>No categories yet</Text>
          )}
        </View>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, isDarkMode && { color: darkModeStyles.text.color }]}>Insights</Text>
        
        <View style={[styles.insightsCard, isDarkMode && { 
          backgroundColor: darkModeStyles.card.backgroundColor,
          borderColor: darkModeStyles.card.borderColor
        }]}>
          <View style={[styles.insightItem, isDarkMode && { 
            borderBottomColor: darkModeStyles.separator.backgroundColor 
          }]}>
            <Ionicons name="analytics-outline" size={20} color={isDarkMode ? "#4a9eff" : "#007AFF"} style={styles.insightIcon} />
            <Text style={[styles.insightText, isDarkMode && { color: darkModeStyles.text.color }]}>
              Average note length: <Text style={[styles.insightHighlight, isDarkMode && { color: "#4a9eff" }]}>{stats.averageLength} words</Text>
            </Text>
          </View>
          
          <View style={[styles.insightItem, isDarkMode && { 
            borderBottomColor: darkModeStyles.separator.backgroundColor 
          }]}>
            <Ionicons name="ribbon-outline" size={20} color={isDarkMode ? "#4a9eff" : "#007AFF"} style={styles.insightIcon} />
            <Text style={[styles.insightText, isDarkMode && { color: darkModeStyles.text.color }]}>
              Most used category: <Text style={[styles.insightHighlight, isDarkMode && { color: "#4a9eff" }]}>{getMostUsedCategory()}</Text>
            </Text>
          </View>
          
          <View style={[styles.insightItem, isDarkMode && { 
            borderBottomColor: darkModeStyles.separator.backgroundColor 
          }]}>
            <Ionicons name="trending-up-outline" size={20} color={isDarkMode ? "#4a9eff" : "#007AFF"} style={styles.insightIcon} />
            <Text style={[styles.insightText, isDarkMode && { color: darkModeStyles.text.color }]}>
              {stats.createdThisWeek > 0 ? 
                `You've been ${stats.createdThisWeek > 2 ? 'very ' : ''}productive this week!` : 
                'Try creating more notes this week!'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  statsOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityLabel: {
    fontSize: 16,
    color: '#333',
  },
  activityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  categoriesCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
  },
  categoryCount: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  insightsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 30,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  insightIcon: {
    marginRight: 12,
  },
  insightText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  insightHighlight: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default StatisticsScreen;
