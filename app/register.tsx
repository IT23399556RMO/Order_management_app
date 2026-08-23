import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function RegisterScreen() {
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername || !password || !confirmPassword) {
      Alert.alert('Register', 'Please complete all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Register', 'Passwords do not match.');
      return;
    }

    const error = await register(cleanUsername, password);

    if (error) {
      Alert.alert('Register', error);
      return;
    }

    Alert.alert(
      'Account created',
      'Your account was created. Please log in.',
      [{ text: 'OK', onPress: () => router.replace('/login') }]
    );
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value.toLowerCase().replace(/[^a-z]/g, ''));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>This account stays on this device.</Text>

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={handleUsernameChange}
            placeholder="Enter username"
            placeholderTextColor="#8a8f98"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor="#8a8f98"
            secureTextEntry
            keyboardType="number-pad"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Re-enter password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Enter password again"
            placeholderTextColor="#8a8f98"
            secureTextEntry
            keyboardType="number-pad"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Pressable style={styles.primaryButton} onPress={handleRegister}>
            <Text style={styles.primaryText}>Create Account</Text>
          </Pressable>

          <Pressable style={styles.backButton} onPress={() => router.replace('/login')}>
            <Text style={styles.backText}>Back to Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  scroll: { flexGrow: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: '800', color: '#111827', textAlign: 'center' },
  subtitle: { color: '#6b7280', textAlign: 'center', marginTop: 6, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginTop: 12, marginBottom: 7 },
  input: {
    minHeight: 52, borderRadius: 10, borderWidth: 1, borderColor: '#d1d5db',
    backgroundColor: '#fff', paddingHorizontal: 15, fontSize: 16, color: '#111827',
  },
  primaryButton: {
    marginTop: 24, height: 52, borderRadius: 10, backgroundColor: '#2563eb',
    alignItems: 'center', justifyContent: 'center',
  },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  backButton: { alignItems: 'center', paddingVertical: 16 },
  backText: { color: '#2563eb', fontWeight: '700', fontSize: 16 },
});
