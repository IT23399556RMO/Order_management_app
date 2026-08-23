import {
  useEffect,
  useState,
} from 'react';

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';
import {
  SessionMode,
} from '@/database/users';

const SESSION_OPTIONS: Array<{
  value: SessionMode;
  label: string;
  description: string;
}> = [
  {
    value: 'close',
    label: 'End when app is closed',
    description:
      'Opening the app again will require login.',
  },
  {
    value: '12h',
    label: '12 hours',
    description:
      'The login can be restored for 12 hours after login.',
  },
  {
    value: '1d',
    label: '1 day',
    description:
      'The login can be restored for 24 hours after login.',
  },
];

type CardKey =
  | 'username'
  | 'password'
  | 'session';

export default function SettingsScreen() {
  const {
    user,
    sessionMode,
    changeUsername,
    changePassword,
    changeSessionMode,
  } = useAuth();

  const [username, setUsername] =
    useState(
      user?.username ?? ''
    );

  const [password, setPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [openCards, setOpenCards] =
    useState<
      Record<CardKey, boolean>
    >({
      username: false,
      password: false,
      session: false,
    });

  useEffect(() => {
    setUsername(
      user?.username ?? ''
    );
  }, [user?.username]);

  const toggleCard = (
    key: CardKey
  ) => {
    setOpenCards(current => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const closeCard = (
    key: CardKey
  ) => {
    setOpenCards(current => ({
      ...current,
      [key]: false,
    }));
  };

  const saveUsername = async () => {
    const clean =
      username
        .trim()
        .toLowerCase()
        .replace(
          /[^a-z]/g,
          ''
        );

    if (!clean) {
      Alert.alert(
        'Username',
        'Enter a username using lowercase letters only.'
      );
      return;
    }

    const error =
      await changeUsername(clean);

    if (error) {
      Alert.alert(
        'Username',
        error
      );
      return;
    }

    Alert.alert(
      'Username updated',
      'Your username was updated successfully.'
    );
  };

  const savePassword = async () => {
    if (
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        'Password',
        'Enter the new password twice.'
      );
      return;
    }

    if (
      password !==
      confirmPassword
    ) {
      Alert.alert(
        'Password',
        'Passwords do not match.'
      );
      return;
    }

    const error =
      await changePassword(
        password
      );

    if (error) {
      Alert.alert(
        'Password',
        error
      );
      return;
    }

    setPassword('');
    setConfirmPassword('');

    Alert.alert(
      'Password updated',
      'Your password was updated successfully.'
    );
  };

  const chooseSession =
    async (
      mode: SessionMode
    ) => {
      if (
        mode === sessionMode
      ) {
        return;
      }

      const error =
        await changeSessionMode(
          mode
        );

      if (error) {
        Alert.alert(
          'Session',
          error
        );
        return;
      }

      Alert.alert(
        'Session updated',
        mode === 'close'
          ? 'The session will end when you close the app.'
          : 'The new session duration is active from now.'
      );
    };

  const renderCard = (
    key: CardKey,
    title: string,
    body: React.ReactNode
  ) => {
    const open =
      openCards[key];

    return (
      <View style={styles.card}>
        <Pressable
          style={styles.cardHeader}
          onPress={() =>
            toggleCard(key)
          }
        >
          <Text
            style={styles.cardTitle}
          >
            {title}
          </Text>

          <Text
            style={styles.arrow}
          >
            {open ? '−' : '+'}
          </Text>
        </Pressable>

        {open && (
          <View
            style={styles.expandedBody}
          >
            <Pressable
              style={styles.closeLayer}
              onPress={() =>
                closeCard(key)
              }
            />

            <View
              style={styles.controls}
              onStartShouldSetResponder={() =>
                true
              }
            >
              {body}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
    >
      {renderCard(
        'username',
        'UPDATE USERNAME',
        <>
          <Text
            style={styles.helper}
          >
            Only lowercase letters are allowed.
          </Text>

          <TextInput
            style={styles.input}
            value={username}
            onChangeText={value =>
              setUsername(
                value
                  .toLowerCase()
                  .replace(
                    /[^a-z]/g,
                    ''
                  )
              )
            }
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="new username"
            placeholderTextColor="#8a8f98"
          />

          <Pressable
            style={styles.primary}
            onPress={
              saveUsername
            }
          >
            <Text
              style={
                styles.primaryText
              }
            >
              UPDATE USERNAME
            </Text>
          </Pressable>
        </>
      )}

      {renderCard(
        'password',
        'UPDATE PASSWORD',
        <>
          <Text
            style={styles.helper}
          >
            There is no artificial character-length limit.
          </Text>

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={
              setPassword
            }
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="new password"
            placeholderTextColor="#8a8f98"
          />

          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={
              setConfirmPassword
            }
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="re-enter new password"
            placeholderTextColor="#8a8f98"
          />

          <Pressable
            style={styles.primary}
            onPress={
              savePassword
            }
          >
            <Text
              style={
                styles.primaryText
              }
            >
              UPDATE PASSWORD
            </Text>
          </Pressable>
        </>
      )}

      {renderCard(
        'session',
        'LOGIN SESSION',
        <>
          <Text
            style={styles.helper}
          >
            Choose whether a login should remain available after the app is closed.
          </Text>

          {SESSION_OPTIONS.map(
            option => {
              const selected =
                option.value ===
                sessionMode;

              return (
                <Pressable
                  key={
                    option.value
                  }
                  style={[
                    styles.option,
                    selected &&
                      styles.optionSelected,
                  ]}
                  onPress={() =>
                    void chooseSession(
                      option.value
                    )
                  }
                >
                  <View
                    style={[
                      styles.radio,
                      selected &&
                        styles.radioSelected,
                    ]}
                  >
                    {selected && (
                      <View
                        style={
                          styles.radioDot
                        }
                      />
                    )}
                  </View>

                  <View
                    style={
                      styles.optionTextWrap
                    }
                  >
                    <Text
                      style={
                        styles.optionTitle
                      }
                    >
                      {
                        option.label
                      }
                    </Text>

                    <Text
                      style={
                        styles.optionDescription
                      }
                    >
                      {
                        option.description
                      }
                    </Text>
                  </View>
                </Pressable>
              );
            }
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },

  content: {
    padding: 14,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 10,
    overflow: 'hidden',
  },

  cardHeader: {
    minHeight: 58,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  arrow: {
    fontSize: 26,
    color: '#2563eb',
    fontWeight: '400',
  },

  expandedBody: {
    position: 'relative',
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },

  closeLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },

  controls: {
    zIndex: 1,
  },

  helper: {
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12,
    marginBottom: 12,
  },

  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#111827',
    marginBottom: 10,
  },

  primary: {
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },

  optionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },

  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  radioSelected: {
    borderColor: '#2563eb',
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563eb',
  },

  optionTextWrap: {
    flex: 1,
  },

  optionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },

  optionDescription: {
    color: '#6b7280',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
});