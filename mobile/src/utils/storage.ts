// Shared storage utility for the entire app
// This ensures authService and api.ts use the SAME storage instance

import AsyncStorage from '@react-native-async-storage/async-storage';

// Export the AsyncStorage instance directly
export const storage = AsyncStorage;

