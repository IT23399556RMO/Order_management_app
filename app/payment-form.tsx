import {
    useCallback,
    useMemo,
    useState,
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
} from 'react-native';

import { useAuth } from '@/context/AuthContext';

import {
    createPayment,
    getPayments,
    updateManualPayment,
} from '@/database/payments';

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

export default function PaymentFormScreen() {
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
        const payments =
          await getPayments(user.id);

        const payment =
          payments.find(
            item =>
              item.id === editingId
          );

        if (!payment) {
          Alert.alert(
            'Payment',
            'Payment was not found.'
          );

          router.back();
          return;
        }

        if (
          payment.order_id !== null
        ) {
          Alert.alert(
            'Payment',
            'Automatic payments cannot be edited.'
          );

          router.back();
          return;
        }

        setCardId(payment.card_id);
        setMobileId(
          payment.mobile_id
        );
        setDatetime(
          payment.payment_datetime
        );
      }
    } catch {
      Alert.alert(
        'Payment',
        'Could not load the payment.'
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

    if (!cardId) {
      Alert.alert(
        'Payment',
        'Select a card name.'
      );
      return;
    }

    if (!mobileId) {
      Alert.alert(
        'Payment',
        'Select a mobile number.'
      );
      return;
    }

    try {
      if (editingId === null) {
        await createPayment(
          user.id,
          cardId,
          mobileId,
          datetime
        );

        Alert.alert(
          'Payment saved',
          'The manual payment record was added.',
          [
            {
              text: 'OK',
              onPress: () =>
                router.back(),
            },
          ]
        );
      } else {
        await updateManualPayment(
          user.id,
          editingId,
          cardId,
          mobileId,
          datetime
        );

        Alert.alert(
          'Payment updated',
          'The manual payment record was updated.',
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
        'Payment',
        error instanceof Error
          ? error.message
          : 'Could not save the payment.'
      );
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title:
            editingId === null
              ? 'ADD PAYMENT'
              : 'EDIT PAYMENT',
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.content
        }
      >
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
          label="Payment date and time"
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
              ? 'SAVE PAYMENT'
              : 'UPDATE PAYMENT'}
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