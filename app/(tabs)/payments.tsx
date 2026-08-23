import {
  useCallback,
  useState,
} from 'react';

import {
  router,
  useFocusEffect,
} from 'expo-router';

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/context/AuthContext';

import {
  deleteManualPayment,
  getPayments,
  Payment,
} from '@/database/payments';

import { formatDateTime } from '@/components/DateTimeField';

export default function PaymentsScreen() {
  const { user } = useAuth();

  const [payments, setPayments] =
    useState<Payment[]>([]);

  const load = async () => {
    if (!user) return;

    try {
      setPayments(
        await getPayments(user.id)
      );
    } catch {
      Alert.alert(
        'Error',
        'Could not load payments.'
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [user?.id])
  );

  const edit = (payment: Payment) => {
    if (payment.order_id !== null) {
      return;
    }

    router.push({
      pathname: '/payment-form',
      params: {
        id: String(payment.id),
      },
    });
  };

  const remove = (payment: Payment) => {
    if (payment.order_id !== null) {
      return;
    }

    Alert.alert(
      'Delete payment',
      'Delete this manual payment record?',
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
              await deleteManualPayment(
                user.id,
                payment.id
              );

              await load();
            } catch (error) {
              Alert.alert(
                'Payment',
                error instanceof Error
                  ? error.message
                  : 'Could not delete payment.'
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
      {payments.length === 0 ? (
        <Text style={styles.empty}>
          No payments for this account.
        </Text>
      ) : (
        payments.map(
          (item, index) => {
            const isManual =
              item.order_id === null;

            return (
              <View
                key={item.id}
                style={styles.card}
              >
                <View
                  style={styles.lineOne}
                >
                  <Text
                    style={styles.index}
                  >
                    {item.order_id !== null
                      ? `${index + 1}. ORDER #${item.order_id}`
                      : `${index + 1}.`}
                  </Text>

                  {isManual && (
                    <View
                      style={styles.actions}
                    >
                      <Pressable
                        style={
                          styles.iconButton
                        }
                        onPress={() =>
                          edit(item)
                        }
                      >
                        <Ionicons
                          name="pencil"
                          size={21}
                          color="#2563eb"
                        />
                      </Pressable>

                      <Pressable
                        style={
                          styles.iconButton
                        }
                        onPress={() =>
                          remove(item)
                        }
                      >
                        <Ionicons
                          name="trash"
                          size={21}
                          color="#dc2626"
                        />
                      </Pressable>
                    </View>
                  )}
                </View>

                <View
                  style={styles.lineTwo}
                >
                  <Text
                    style={[
                      styles.info,
                      isManual &&
                        styles.manualText,
                    ]}
                    numberOfLines={1}
                  >
                    {item.card_name ??
                      'Deleted card'}
                  </Text>

                  <Text
                    style={[
                      styles.info,
                      isManual &&
                        styles.manualText,
                    ]}
                    numberOfLines={1}
                  >
                    {item.mobile_number ??
                      'Deleted mobile'}
                  </Text>

                  <Text
                    style={[
                      styles.info,
                      styles.date,
                      isManual &&
                        styles.manualText,
                    ]}
                    numberOfLines={1}
                  >
                    {formatDateTime(
                      item.payment_datetime,
                      false
                    )}
                  </Text>
                </View>
              </View>
            );
          }
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

  empty: {
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 25,
  },

  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 11,
    marginBottom: 8,
  },

  lineOne: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  index: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  lineTwo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  info: {
    flex: 1,
    fontSize: 12,
    color: '#6b7280',
    paddingRight: 6,
  },

  date: {
    textAlign: 'right',
  },

  /*
   * Manual payment:
   * every information text is red.
   *
   * The record number remains black.
   * The edit/delete icons keep their own
   * blue/red colors.
   */
  manualText: {
    color: '#dc2626',
  },
});