import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_BASE_URL } from '@/constants/api';

export default function DebugAPIScreen() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('TestPass123');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResponse('Testing...\n');

    try {
      const url = `${API_BASE_URL}/auth/login`;
      const payload = { email, password };

      setResponse(prev => prev + `URL: ${url}\n`);
      setResponse(prev => prev + `Payload: ${JSON.stringify(payload, null, 2)}\n\n`);

      const result = await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      setResponse(prev => prev + `✅ SUCCESS (${result.status})\n`);
      setResponse(prev => prev + `Response: ${JSON.stringify(result.data, null, 2)}\n`);
    } catch (error: any) {
      if (error.response) {
        setResponse(prev => prev + `❌ ERROR (${error.response.status})\n`);
        setResponse(prev => prev + `Response: ${JSON.stringify(error.response.data, null, 2)}\n`);
        setResponse(prev => prev + `Headers: ${JSON.stringify(error.response.headers, null, 2)}\n`);
      } else if (error.request) {
        setResponse(prev => prev + `❌ NETWORK ERROR\n`);
        setResponse(prev => prev + `No response received\n`);
        setResponse(prev => prev + `Message: ${error.message}\n`);
      } else {
        setResponse(prev => prev + `❌ ERROR\n`);
        setResponse(prev => prev + `Message: ${error.message}\n`);
      }
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setResponse('Testing server connection...\n');

    try {
      const url = `${API_BASE_URL.replace('/api', '')}/health`;
      setResponse(prev => prev + `URL: ${url}\n\n`);

      const result = await axios.get(url, { timeout: 5000 });
      setResponse(prev => prev + `✅ Server is reachable\n`);
      setResponse(prev => prev + `Response: ${JSON.stringify(result.data, null, 2)}\n`);
    } catch (error: any) {
      setResponse(prev => prev + `❌ Server unreachable\n`);
      setResponse(prev => prev + `Error: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>API Debug Tool</Text>
        <Text style={styles.subtitle}>API: {API_BASE_URL}</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={testLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Testing...' : 'Test Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={testConnection}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Test Connection</Text>
          </TouchableOpacity>
        </View>

        {response ? (
          <View style={styles.responseContainer}>
            <Text style={styles.responseTitle}>Response:</Text>
            <ScrollView style={styles.responseScroll}>
              <Text style={styles.responseText}>{response}</Text>
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 24,
  },
  form: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  responseContainer: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 8,
    maxHeight: 400,
  },
  responseTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  responseScroll: {
    maxHeight: 350,
  },
  responseText: {
    color: '#0f0',
    fontFamily: 'monospace',
    fontSize: 12,
  },
});
