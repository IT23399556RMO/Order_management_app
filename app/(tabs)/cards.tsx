import {
  useCallback,
  useState,
} from 'react';

import {
  useFocusEffect,
} from 'expo-router';

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/context/AuthContext';

import {
  Card,
  createCard,
  deleteCard,
  getCards,
} from '@/database/resources';

export default function CardsScreen() {
  const { user } = useAuth();

  const [name, setName] =
    useState('');

  const [cards, setCards] =
    useState<Card[]>([]);

  const load = async () => {
    if (!user) return;

    try {
      setCards(
        await getCards(user.id)
      );
    } catch {
      Alert.alert(
        'Error',
        'Could not load card names.'
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

    if (!name.trim()) {
      Alert.alert(
        'Card name',
        'Enter a card name.'
      );
      return;
    }

    try {
      await createCard(
        user.id,
        name
      );

      setName('');
      await load();
    } catch (error) {
      Alert.alert(
        'Card name',
        error instanceof Error
          ? error.message
          : 'Could not add card name.'
      );
    }
  };

  const confirmDelete = (
    item: Card
  ) => {
    Alert.alert(
      'Delete card name',
      `Delete "${item.card_name}"? Historical orders and payments will remain.`,
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
              await deleteCard(
                user.id,
                item.id
              );

              await load();
            } catch (error) {
              Alert.alert(
                'Card name',
                error instanceof Error
                  ? error.message
                  : 'Could not delete card name.'
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
        value={name}
        onChangeText={setName}
        placeholder="e.g. Sampath Visa"
        placeholderTextColor="#8a8f98"
      />

      <Pressable
        style={styles.primary}
        onPress={add}
      >
        <Text
          style={styles.primaryText}
        >
          ADD CARD NAME
        </Text>
      </Pressable>

      {cards.length === 0 ? (
        <Text style={styles.empty}>
          No card names added.
        </Text>
      ) : (
        cards.map(
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
                  {item.card_name}
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
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    fontSize: 16,
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
    flex: 1,
    fontSize: 16,
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