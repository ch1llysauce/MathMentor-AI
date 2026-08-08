import { TouchableOpacity, View, Text, Image, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// expo-image-picker requires a native build (npx expo run:android).
// We lazy-require it so the app doesn't crash in Expo Go — the picker
// button simply shows a friendly message instead.
let ImagePicker: typeof import('expo-image-picker') | null = null;
try {
  ImagePicker = require('expo-image-picker');
} catch {
  // Not available in this build (e.g. Expo Go)
}

interface AvatarPickerProps {
  /** Current image URI or base64 data URI. Pass null/empty string for initials fallback. */
  imageUri?: string | null;
  /** Initials shown when no image is set */
  initials?: string;
  /** Called with a base64 data URI (e.g. "data:image/jpeg;base64,...") when a new image is picked */
  onChange: (dataUri: string) => void;
  /** Size of the avatar circle in px. Defaults to 100. */
  size?: number;
  disabled?: boolean;
}

export default function AvatarPicker({
  imageUri,
  initials = '?',
  onChange,
  size = 100,
  disabled = false,
}: AvatarPickerProps) {
  const handlePick = async () => {
    if (!ImagePicker) {
      Alert.alert(
        'Native Build Required',
        'Photo upload requires a native build. Run "npx expo run:android" to enable this feature.'
      );
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Please allow access to your photo library to change your profile picture.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsEditing: true,
      aspect: [1, 1] as [number, number],
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (!asset.base64) return;
      const mimeType = asset.mimeType ?? 'image/jpeg';
      onChange(`data:${mimeType};base64,${asset.base64}`);
    }
  };

  const badgeSize = Math.round(size * 0.36);

  return (
    <View style={styles.wrapper}>
      {/* Outer container holds the circle + badge together so the badge can overflow */}
      <View style={{ position: 'relative', width: size, height: size }}>
        <TouchableOpacity
          onPress={disabled ? undefined : handlePick}
          activeOpacity={disabled ? 1 : 0.8}
          style={[
            styles.avatar,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: size, height: size, borderRadius: size / 2 }}
              resizeMode="cover"
            />
          ) : (
            <Text style={[styles.initials, { fontSize: size * 0.38 }]}>
              {initials.charAt(0).toUpperCase()}
            </Text>
          )}
        </TouchableOpacity>

        {/* Camera badge — outside the clipped circle so it renders on top */}
        {!disabled && (
          <View
            pointerEvents="none"
            style={[
              styles.badge,
              {
                width: badgeSize,
                height: badgeSize,
                borderRadius: badgeSize / 2,
                bottom: 2,
                right: 2,
              },
            ]}
          >
            <Ionicons name="camera" size={badgeSize * 0.52} color="#ffffff" />
          </View>
        )}
      </View>

      {!disabled && (
        <TouchableOpacity onPress={handlePick} style={styles.labelButton}>
          <Text style={styles.labelText}>
            {imageUri ? 'Change Photo' : 'Add Photo'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: 10 },
  avatar: {
    backgroundColor: '#4b41e1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#e2dfff',
    overflow: 'hidden',
  },
  initials: {
    fontWeight: '700',
    color: '#ffffff',
  },
  badge: {
    position: 'absolute',
    backgroundColor: '#4b41e1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#ffffff',
  },
  labelButton: { paddingVertical: 2 },
  labelText: { fontSize: 14, fontWeight: '600', color: '#4b41e1' },
});
