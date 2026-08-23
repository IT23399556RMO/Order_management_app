import {
    useCallback,
    useMemo,
    useState
} from 'react';

import {
    router,
    Stack,
    useFocusEffect,
    useLocalSearchParams,
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

import { useAuth } from '@/context/AuthContext';

import {
    createOrder,
    getOrders,
    updateOrder
} from '@/database/orders';

import {
    Card,
    getCards,
    getMobiles,
    Mobile,
} from '@/database/resources';

import {
    DateTimeField,
} from '@/components/DateTimeField';

import {
    SelectField,
} from '@/components/SelectField';

export default function OrderFormScreen() {
  const { user } = useAuth();

  const params =
    useLocalSearchParams<{
      id?: string;
    }>();

  const editingId = params.id
    ? Number(params.id)
    : null;

  const [cards, setCards] =
    useState<Card[]>([]);

  const [mobiles, setMobiles] =
    useState<Mobile[]>([]);

  const [name, setName] =
    useState('');

  const [emailType, setEmailType] =
    useState<'gmail' | 'outlook'>(
      'gmail'
    );

  const [amount, setAmount] =
    useState('');

  const [cardId, setCardId] =
    useState<number | null>(null);

  const [mobileId, setMobileId] =
    useState<number | null>(null);

  const [datetime, setDatetime] =
    useState(
      new Date().toISOString()
    );

  const loadForm = async () => {
    if (!user) return;

    try {
      const [
        cardRows,
        mobileRows,
      ] = await Promise.all([
        getCards(user.id),
        getMobiles(user.id),
      ]);

      setCards(cardRows);
      setMobiles(mobileRows);

      if (editingId !== null) {
        const orderRows =
          await getOrders(user.id);

        const order =
          orderRows.find(
            item =>
              item.id === editingId
          );

        if (!order) {
          Alert.alert(
            'Order',
            'Order was not found.'
          );

          router.back();
          return;
        }

        setName(order.customer_name);

        const oldEmail =
          order.email
            .trim()
            .toLowerCase();

        setEmailType(
          oldEmail === 'outlook' ||
            oldEmail.includes(
              '@outlook.'
            ) ||
            oldEmail.includes(
              '@hotmail.'
            ) ||
            oldEmail.includes(
              '@live.'
            )
            ? 'outlook'
            : 'gmail'
        );

        setAmount(
          String(order.amount)
        );

        setCardId(order.card_id);
        setMobileId(
          order.mobile_id
        );

        setDatetime(
          order.order_datetime
        );
      }
    } catch {
      Alert.alert(
        'Order',
        'Could not load the order.'
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      void loadForm();
    }, [user?.id, editingId])
  );

  const cardOptions = useMemo(
    () =>
      cards.map(item => ({
        id: item.id,
        label: item.card_name,
      })),
    [cards]
  );

  const mobileOptions = useMemo(
    () =>
      mobiles.map(item => ({
        id: item.id,
        label: item.mobile_number,
      })),
    [mobiles]
  );

  const save = async () => {
    if (!user) return;

    const numericAmount =
      Number(amount);

    if (!name.trim()) {
      Alert.alert(
        'Order',
        'Enter the name.'
      );
      return;
    }

    if (
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <= 0
    ) {
      Alert.alert(
        'Order',
        'Amount must be greater than 0.'
      );
      return;
    }

    if (!cardId) {
      Alert.alert(
        'Order',
        'Select a card name.'
      );
      return;
    }

    if (!mobileId) {
      Alert.alert(
        'Order',
        'Select a mobile number.'
      );
      return;
    }

    try {
      if (editingId === null) {
        await createOrder(
          user.id,
          name,
          emailType,
          numericAmount,
          cardId,
          mobileId,
          datetime
        );

        Alert.alert(
          'Order saved',
          'The order and its automatic payment were created.',
          [
            {
              text: 'OK',
              onPress: () =>
                router.back(),
            },
          ]
        );
      } else {
        await updateOrder(
          user.id,
          editingId,
          name,
          emailType,
          numericAmount,
          cardId,
          mobileId,
          datetime
        );

        Alert.alert(
          'Order updated',
          'The order and its related automatic payment were updated.',
          [
            {
              text: 'OK',
              onPress: () =>
                router.back(),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Order',
        error instanceof Error
          ? error.message
          : 'Could not save the order.'
      );
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title:
            editingId === null
              ? 'ADD ORDER'
              : 'EDIT ORDER',
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>
          Name
        </Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Order/customer name"
          placeholderTextColor="#8a8f98"
        />

        <Text style={styles.label}>
          Email type
        </Text>

        <View
          style={styles.emailRow}
        >
          <Pressable
            style={[
              styles.emailButton,
              emailType === 'gmail' &&
                styles.emailSelected,
            ]}
            onPress={() =>
              setEmailType('gmail')
            }
          >
            <Text
              style={[
                styles.emailText,
                emailType === 'gmail' &&
                  styles.emailTextSelected,
              ]}
            >
              Gmail
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.emailButton,
              emailType === 'outlook' &&
                styles.emailSelected,
            ]}
            onPress={() =>
              setEmailType('outlook')
            }
          >
            <Text
              style={[
                styles.emailText,
                emailType === 'outlook' &&
                  styles.emailTextSelected,
              ]}
            >
              Outlook
            </Text>
          </Pressable>
        </View>

        <Text style={styles.label}>
          Amount
        </Text>

        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={text =>
            setAmount(
              text.replace(
                /[^0-9.]/g,
                ''
              )
            )
          }
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#8a8f98"
        />

        <SelectField
          label="Card"
          value={cardId}
          placeholder="Select a saved card name"
          options={cardOptions}
          onChange={setCardId}
        />

        <SelectField
          label="Mobile"
          value={mobileId}
          placeholder="Select a saved mobile number"
          options={mobileOptions}
          onChange={setMobileId}
        />

        <DateTimeField
          label="Order date and time"
          value={datetime}
          onChange={setDatetime}
        />

        <Pressable
          style={styles.primary}
          onPress={save}
        >
          <Text
            style={styles.primaryText}
          >
            {editingId === null
              ? 'SAVE ORDER'
              : 'UPDATE ORDER'}
          </Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 7,
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
    marginBottom: 12,
  },

  emailRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },

  emailButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emailSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },

  emailText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },

  emailTextSelected: {
    color: '#2563eb',
  },

  primary: {
    height: 52,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  primaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
