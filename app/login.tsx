import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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

export default function LoginScreen() {
  const {
    users,
    loading,
    selectedUsername,
    user,
    login,
    selectUsername,
  } = useAuth();

  const [username, setUsername] = useState(selectedUsername);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
      return;
    }
    setUsername(selectedUsername);
  }, [selectedUsername, user]);

  const handleLogin = async () => {
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername || !password) {
      Alert.alert('Login', 'Please enter your username and password.');
      return;
    }

    const error = await login(cleanUsername, password);

    if (error) {
      Alert.alert('Login failed', error);
      return;
    }

    setPassword('');
    router.replace('/(tabs)');
  };

  const handleUsernameChange = (value: string) => {
    const clean = value.toLowerCase().replace(/[^a-z]/g, '');
    setUsername(clean);
    selectUsername(clean);
  };

  const handleSelectAccount = (accountUsername: string) => {
    selectUsername(accountUsername);
    setUsername(accountUsername);
    setPassword('');
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>O O M A</Text>

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={handleUsernameChange}
            placeholder="lowercase letters only"
            placeholderTextColor="#8a8f98"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
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
            autoComplete="password"
          />

          <Pressable style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryText}>Login</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.secondaryText}>Create a new account</Text>
          </Pressable>

          {users.length > 0 && (
            <View style={styles.accounts}>
              <Text style={styles.accountTitle}>Accounts on this device</Text>
              <Text style={styles.accountHint}>
                Select an account to fill the username.
              </Text>

              {users.map(account => {
                const selected =
                  selectedUsername === account.username;

                return (
                  <Pressable
                    key={account.id}
                    style={[styles.account, selected && styles.accountSelected]}
                    onPress={() => handleSelectAccount(account.username)}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {account.username.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.accountName}>{account.username}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f7fa' },
  loadingText: { fontSize: 16, color: '#6b7280' },
  scroll: { flexGrow: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingVertical: 48, justifyContent: 'center' },
  title: { fontSize: 34, fontWeight: '800', textAlign: 'center', color: '#111827' },
  subtitle: { textAlign: 'center', color: '#6b7280', marginTop: 6, marginBottom: 24, fontSize: 16, fontWeight: 'bold' },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 7, marginTop: 12 },
  input: {
    minHeight: 52, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db',
    borderRadius: 10, paddingHorizontal: 15, fontSize: 16, color: '#111827',
  },
  primaryButton: {
    height: 52, backgroundColor: '#2563eb', borderRadius: 10, alignItems: 'center',
    justifyContent: 'center', marginTop: 22,
  },
  primaryText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  secondaryButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  secondaryText: { color: '#2563eb', fontSize: 16, fontWeight: '700' },
  accounts: { marginTop: 24, alignSelf: 'stretch' },
  accountTitle: { fontSize: 15, fontWeight: '800', color: '#374151' },
  accountHint: { fontSize: 12, color: '#6b7280', marginTop: 3, marginBottom: 8 },
  account: {
    flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fff',
    borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 8,
  },
  accountSelected: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  avatar: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#2563eb',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  accountName: { fontSize: 16, fontWeight: '600', color: '#111827' },
});
