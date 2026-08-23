import {
  useCallback,
  useState,
} from 'react';

import {
  useFocusEffect,
} from 'expo-router';

import { Ionicons } from '@expo/vector-icons';
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
  createMobile,
  deleteMobile,
  getMobiles,
  Mobile,
} from '@/database/resources';

export default function MobilesScreen() {
  const { user } = useAuth();

  const [mobile, setMobile] =
    useState('');

  const [mobiles, setMobiles] =
    useState<Mobile[]>([]);

  const load = async () => {
    if (!user) return;

    try {
      setMobiles(
        await getMobiles(user.id)
      );
    } catch {
      Alert.alert(
        'Error',
        'Could not load mobile numbers.'
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [user?.id])
  );

  const add = async () => {
    if (!user) return;

    const value =
      mobile.trim();

    if (!/^0\d{9}$/.test(value)) {
      Alert.alert(
        'Mobile number',
        'Enter exactly 10 digits starting with 0.'
      );
      return;
    }

    try {
      await createMobile(
        user.id,
        value
      );

      setMobile('');
      await load();
    } catch (error) {
      Alert.alert(
        'Mobile number',
        error instanceof Error
          ? error.message
          : 'Could not add mobile number.'
      );
    }
  };

  const confirmDelete = (
    item: Mobile
  ) => {
    Alert.alert(
      'Delete mobile number',
      `Delete ${item.mobile_number}? Historical orders and payments will remain.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;

            try {
              await deleteMobile(
                user.id,
                item.id
              );

              await load();
            } catch (error) {
              Alert.alert(
                'Mobile number',
                error instanceof Error
                  ? error.message
                  : 'Could not delete mobile number.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
    >
      <TextInput
        style={styles.input}
        value={mobile}
        onChangeText={text =>
          setMobile(
            text
              .replace(/\D/g, '')
              .slice(0, 10)
          )
        }
        keyboardType="number-pad"
        placeholder="e.g. 0712345678"
        placeholderTextColor="#8a8f98"
      />

      <Pressable
        style={styles.primary}
        onPress={add}
      >
        <Text
          style={styles.primaryText}
        >
          ADD MOBILE NUMBER
        </Text>
      </Pressable>

      {mobiles.length === 0 ? (
        <Text style={styles.empty}>
          No mobile numbers added.
        </Text>
      ) : (
        mobiles.map(
          (item, index) => (
            <View
              key={item.id}
              style={styles.row}
            >
              <View
                style={styles.valueWrap}
              >
                <Text
                  style={styles.index}
                >
                  {index + 1}.
                </Text>

                <Text
                  style={styles.value}
                >
                  {item.mobile_number}
                </Text>
              </View>

              <Pressable
                style={styles.deleteButton}
                onPress={() =>
                  confirmDelete(item)
                }
              >
                <Ionicons
                  name="trash"
                  size={20}
                  color="#dc2626"
                />
              </Pressable>
            </View>
          )
        )
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

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    fontSize: 17,
  },

  primary: {
    height: 52,
    marginTop: 10,
    marginBottom: 18,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
  },

  empty: {
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 22,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },

  valueWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  index: {
    width: 28,
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },

  value: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },

  deleteButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
});