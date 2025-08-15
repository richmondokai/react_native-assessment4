import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Linking,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDarkMode } from '../../hooks/useDarkMode';

const HelpScreen = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const { isDarkMode, styles: darkModeStyles } = useDarkMode();

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const handleSendFeedback = () => {
    if (!feedbackMessage.trim()) {
      Alert.alert('Error', 'Please enter your feedback message');
      return;
    }

    // In a real app, this would send the feedback to a server
    Alert.alert(
      'Thank You',
      'Your feedback has been submitted successfully. We appreciate your input!',
      [{ text: 'OK', onPress: () => setFeedbackMessage('') }]
    );
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@notesapp.com');
  };

  const handleVisitWebsite = () => {
    Linking.openURL('https://www.notesapp.com');
  };

  const faqData = [
    {
      id: 'create',
      question: 'How do I create a new note?',
      answer: 'To create a new note, tap the + button in the bottom right corner of the All Notes screen. This will open the note editor where you can enter a title and content for your note.'
    },
    {
      id: 'favorite',
      question: 'How do I mark a note as favorite?',
      answer: 'Open the note you want to favorite, then tap the star icon in the top right corner of the note editor. The star will turn yellow to indicate that the note is now a favorite.'
    },
    {
      id: 'category',
      question: 'How do I change a note\'s category?',
      answer: 'When editing a note, tap on the category badge below the title. This will open a dropdown menu where you can select a different category for your note.'
    },
    {
      id: 'search',
      question: 'How do I search for notes?',
      answer: 'Tap the search bar at the top of the All Notes screen. Enter your search query and the app will find notes that contain the text in either the title or content.'
    },
    {
      id: 'delete',
      question: 'How do I delete a note?',
      answer: 'Open the note you want to delete, then scroll to the bottom of the editor and tap the "Delete Note" button. You will be asked to confirm the deletion.'
    },
    {
      id: 'backup',
      question: 'How do I backup my notes?',
      answer: 'Go to Settings > Data Management > Backup Data. This will create a backup of all your notes that you can later restore if needed.'
    }
  ];

  return (
    <ScrollView style={[styles.container, darkModeStyles.container]}>
      <View style={[styles.header, isDarkMode && { 
        backgroundColor: darkModeStyles.card.backgroundColor,
        borderBottomColor: darkModeStyles.separator.backgroundColor 
      }]}>
        <Text style={[styles.headerTitle, isDarkMode && { color: darkModeStyles.text.color }]}>Help & Support</Text>
        <Text style={[styles.headerSubtitle, isDarkMode && { color: darkModeStyles.subText.color }]}>
          Find answers to common questions and get support
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && { color: darkModeStyles.text.color }]}>Frequently Asked Questions</Text>
        
        <View style={[styles.faqContainer, isDarkMode && { 
          backgroundColor: darkModeStyles.card.backgroundColor,
          borderColor: darkModeStyles.card.borderColor
        }]}>
          {faqData.map((item) => (
            <View key={item.id} style={[styles.faqItem, isDarkMode && { 
              borderBottomColor: darkModeStyles.separator.backgroundColor 
            }]}>
              <TouchableOpacity 
                style={styles.faqQuestion}
                onPress={() => toggleSection(item.id)}
              >
                <Text style={[styles.questionText, isDarkMode && { color: darkModeStyles.text.color }]}>{item.question}</Text>
                <Ionicons 
                  name={expandedSection === item.id ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={isDarkMode ? "#b0b0b0" : "#666"} 
                />
              </TouchableOpacity>
              
              {expandedSection === item.id && (
                <View style={[styles.faqAnswer, isDarkMode && { 
                  backgroundColor: '#1e1e1e',
                  borderTopColor: darkModeStyles.separator.backgroundColor
                }]}>
                  <Text style={[styles.answerText, isDarkMode && { color: darkModeStyles.subText.color }]}>{item.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && { color: darkModeStyles.text.color }]}>Contact Support</Text>
        
        <View style={[styles.contactCard, isDarkMode && { 
          backgroundColor: darkModeStyles.card.backgroundColor,
          borderColor: darkModeStyles.card.borderColor
        }]}>
          <TouchableOpacity 
            style={[styles.contactOption, isDarkMode && { 
              borderBottomColor: darkModeStyles.separator.backgroundColor 
            }]}
            onPress={handleContactSupport}
          >
            <View style={[styles.contactIconContainer, isDarkMode && { backgroundColor: '#1a3d5a' }]}>
              <Ionicons name="mail-outline" size={24} color={isDarkMode ? "#4a9eff" : "#007AFF"} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactTitle, isDarkMode && { color: darkModeStyles.text.color }]}>Email Support</Text>
              <Text style={[styles.contactDescription, isDarkMode && { color: darkModeStyles.subText.color }]}>
                Send us an email and we'll respond within 24 hours
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#b0b0b0" : "#999"} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.contactOption, isDarkMode && { 
              borderBottomColor: darkModeStyles.separator.backgroundColor 
            }]}
            onPress={handleVisitWebsite}
          >
            <View style={[styles.contactIconContainer, isDarkMode && { backgroundColor: '#1a3d5a' }]}>
              <Ionicons name="globe-outline" size={24} color={isDarkMode ? "#4a9eff" : "#007AFF"} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactTitle, isDarkMode && { color: darkModeStyles.text.color }]}>Visit Our Website</Text>
              <Text style={[styles.contactDescription, isDarkMode && { color: darkModeStyles.subText.color }]}>
                Find tutorials, guides, and more resources
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#b0b0b0" : "#999"} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && { color: darkModeStyles.text.color }]}>Send Feedback</Text>
        
        <View style={[styles.feedbackCard, isDarkMode && { 
          backgroundColor: darkModeStyles.card.backgroundColor,
          borderColor: darkModeStyles.card.borderColor
        }]}>
          <Text style={[styles.feedbackDescription, isDarkMode && { color: darkModeStyles.subText.color }]}>
            We value your feedback! Let us know how we can improve the app.
          </Text>
          
          <TextInput
            style={[styles.feedbackInput, isDarkMode && { 
              backgroundColor: '#2c2c2c',
              borderColor: darkModeStyles.separator.backgroundColor,
              color: darkModeStyles.text.color
            }]}
            placeholder="Type your feedback here..."
            placeholderTextColor={isDarkMode ? '#888' : '#999'}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={feedbackMessage}
            onChangeText={setFeedbackMessage}
          />
          
          <TouchableOpacity 
            style={[styles.feedbackButton, isDarkMode && darkModeStyles.button]}
            onPress={handleSendFeedback}
          >
            <Text style={styles.feedbackButtonText}>Send Feedback</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isDarkMode && { color: darkModeStyles.text.color }]}>App Information</Text>
        
        <View style={[styles.infoCard, isDarkMode && { 
          backgroundColor: darkModeStyles.card.backgroundColor,
          borderColor: darkModeStyles.card.borderColor
        }]}>
          <View style={[styles.infoItem, isDarkMode && { 
            borderBottomColor: darkModeStyles.separator.backgroundColor 
          }]}>
            <Text style={[styles.infoLabel, isDarkMode && { color: darkModeStyles.text.color }]}>Version</Text>
            <Text style={[styles.infoValue, isDarkMode && { color: darkModeStyles.subText.color }]}>1.0.0</Text>
          </View>
          
          <View style={[styles.infoItem, isDarkMode && { 
            borderBottomColor: darkModeStyles.separator.backgroundColor 
          }]}>
            <Text style={[styles.infoLabel, isDarkMode && { color: darkModeStyles.text.color }]}>Build</Text>
            <Text style={[styles.infoValue, isDarkMode && { color: darkModeStyles.subText.color }]}>2023.10.15</Text>
          </View>
          
          <View style={[styles.infoItem, isDarkMode && { 
            borderBottomColor: darkModeStyles.separator.backgroundColor 
          }]}>
            <Text style={[styles.infoLabel, isDarkMode && { color: darkModeStyles.text.color }]}>Terms of Service</Text>
            <TouchableOpacity>
              <Text style={[styles.infoLink, isDarkMode && { color: "#4a9eff" }]}>View</Text>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.infoItem, isDarkMode && { 
            borderBottomColor: darkModeStyles.separator.backgroundColor 
          }]}>
            <Text style={[styles.infoLabel, isDarkMode && { color: darkModeStyles.text.color }]}>Privacy Policy</Text>
            <TouchableOpacity>
              <Text style={[styles.infoLink, isDarkMode && { color: "#4a9eff" }]}>View</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
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
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  faqContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  faqAnswer: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  answerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    color: '#666',
  },
  feedbackCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  feedbackDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    height: 120,
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  feedbackButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  feedbackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
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
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
  },
  infoLink: {
    fontSize: 14,
    color: '#007AFF',
  },
});

export default HelpScreen;
