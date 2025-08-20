import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Debug utility to inspect all AsyncStorage contents
 */
export const debugAsyncStorage = async () => {
  try {
    console.log('🔍 === DEBUGGING ASYNC STORAGE ===');
    
    // Get all keys
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('📋 All AsyncStorage keys:', allKeys);
    
    // Get all key-value pairs
    const allData = await AsyncStorage.multiGet(allKeys);
    
    console.log('📊 All AsyncStorage data:');
    allData.forEach(([key, value]) => {
      try {
        console.log(`  ${key}:`, value ? JSON.parse(value) : null);
      } catch (parseError) {
        console.log(`  ${key}: [Invalid JSON] ${value}`);
      }
    });
    
    // Filter notes-related keys
    const notesKeys = allKeys.filter(key => 
      key.includes('NOTES') || 
      key.includes('notes') || 
      key.includes('USER')
    );
    
    console.log('📝 Notes-related keys:', notesKeys);
    
    if (notesKeys.length > 0) {
      const notesData = await AsyncStorage.multiGet(notesKeys);
      console.log('📚 Notes data:');
      notesData.forEach(([key, value]) => {
        try {
          const parsedValue = value ? JSON.parse(value) : null;
          if (Array.isArray(parsedValue)) {
            console.log(`  ${key}: ${parsedValue.length} notes`);
            parsedValue.forEach((note, index) => {
              console.log(`    ${index + 1}. "${note.title}" (${note.category || 'No category'})`);
            });
          } else {
            console.log(`  ${key}:`, parsedValue);
          }
        } catch (parseError) {
          console.log(`  ${key}: [Invalid JSON] ${value}`);
        }
      });
    }
    
    console.log('🔍 === END DEBUG ===');
    
    return {
      allKeys,
      allData: allData.reduce((acc, [key, value]) => {
        acc[key] = value ? JSON.parse(value) : null;
        return acc;
      }, {}),
      notesKeys
    };
  } catch (error) {
    console.error('❌ Error debugging AsyncStorage:', error);
    return null;
  }
};

/**
 * Clear ALL AsyncStorage data (nuclear option)
 */
export const clearAllAsyncStorage = async () => {
  try {
    console.log('💥 === NUCLEAR CLEAR: WIPING ALL ASYNC STORAGE ===');
    await AsyncStorage.clear();
    console.log('✅ All AsyncStorage data cleared');
  } catch (error) {
    console.error('❌ Error clearing AsyncStorage:', error);
  }
};

/**
 * Clear only user-specific data
 */
export const clearUserSpecificData = async () => {
  try {
    console.log('🧹 === CLEARING USER-SPECIFIC DATA ===');
    
    const allKeys = await AsyncStorage.getAllKeys();
    const userDataKeys = allKeys.filter(key => 
      key.includes('NOTES') || 
      key.includes('USER') ||
      key.includes('PENDING') ||
      key.includes('REMINDERS') ||
      key.includes('PROFILE') ||
      key.includes('SYNC')
    );
    
    console.log('🗑️ Removing keys:', userDataKeys);
    
    if (userDataKeys.length > 0) {
      await AsyncStorage.multiRemove(userDataKeys);
      console.log('✅ User-specific data cleared');
    } else {
      console.log('ℹ️ No user-specific data found');
    }
    
    return userDataKeys;
  } catch (error) {
    console.error('❌ Error clearing user-specific data:', error);
    return [];
  }
};
