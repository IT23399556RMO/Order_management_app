import {
  router,
  useFocusEffect,
} from 'expo-router';
import { useCallback, useState } from 'react';

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  useAuth,
} from '@/context/AuthContext';

import {
  Order,
  deleteOrder,
  getOrders,
} from '@/database/orders';

import { formatDateTime } from '@/components/DateTimeField';

function money(value: number) {
  return `LKR ${value.toLocaleString(
    'en-LK',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

function emailType(value: string) {
  const clean =
    value.trim().toLowerCase();

  return clean === 'outlook' ||
    clean.includes('@outlook.') ||
    clean.includes('@hotmail.') ||
    clean.includes('@live.')
    ? 'outlook'
    : 'gmail';
}

export default function OrdersScreen() {
  const { user } = useAuth();

  const [orders, setOrders] =
    useState<Order[]>([]);

  const load = async () => {
    if (!user) return;

    try {
      setOrders(
        await getOrders(user.id)
      );
    } catch {
      Alert.alert(
        'Error',
        'Could not load orders.'
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [user?.id])
  );

  const edit = (order: Order) => {
    router.push({
      pathname: '/order-form',
      params: {
        id: String(order.id),
      },
    });
  };

  const remove = (order: Order) => {
    Alert.alert(
      'Delete order',
      `Delete the order for "${order.customer_name}"? Its automatic payment will also be deleted.`,
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
              await deleteOrder(
                user.id,
                order.id
              );

              await load();
            } catch (error) {
              Alert.alert(
                'Order',
                error instanceof Error
                  ? error.message
                  : 'Could not delete order.'
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
      {orders.length === 0 ? (
        <Text style={styles.empty}>
          No orders for this account.
        </Text>
      ) : (
        orders.map(
          (item, index) => {
            const type =
              emailType(item.email);

            return (
              <View
                key={item.id}
                style={[
                  styles.card,
                  type === 'gmail'
                    ? styles.gmailBorder
                    : styles.outlookBorder,
                ]}
              >
                <View
                  style={styles.lineOne}
                >
                  <View
                    style={styles.nameWrap}
                  >
                    <Text
                      style={styles.index}
                    >
                      {index + 1}.
                    </Text>

                    <Text
                      style={styles.name}
                      numberOfLines={1}
                    >
                      {item.customer_name}
                    </Text>
                  </View>

                  <Text
                    style={styles.date}
                    numberOfLines={1}
                  >
                    {formatDateTime(
                      item.order_datetime,
                      false
                    )}
                  </Text>

                  <View
                    style={styles.actions}
                  >
                    <Pressable
                      style={styles.iconButton}
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
                      style={styles.iconButton}
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
                </View>

                <View
                  style={styles.lineTwo}
                >
                  <Text
                    style={[
                      styles.secondText,
                      styles.amount,
                    ]}
                    numberOfLines={1}
                  >
                    {money(item.amount)}
                  </Text>

                  <Text
                    style={
                      styles.secondText
                    }
                    numberOfLines={1}
                  >
                    {item.card_name ??
                      'Deleted card'}
                  </Text>

                  <Text
                    style={
                      styles.secondText
                    }
                    numberOfLines={1}
                  >
                    {item.mobile_number ??
                      'Deleted mobile'}
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
    borderWidth: 2,
    borderRadius: 12,
    padding: 11,
    marginBottom: 8,
  },

  gmailBorder: {
    borderTopColor: '#ea4335',
    borderRightColor: '#34a853',
    borderBottomColor: '#fbbc05',
    borderLeftColor: '#4285f4',
  },

  outlookBorder: {
    borderTopColor: '#0078d4',
    borderRightColor: '#004578',
    borderBottomColor: '#0078d4',
    borderLeftColor: '#004578',
  },

  lineOne: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  nameWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  index: {
    width: 25,
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },

  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  date: {
    width: 88,
    marginHorizontal: 5,
    textAlign: 'right',
    fontSize: 11,
    color: '#6b7280',
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

  secondText: {
    flex: 1,
    fontSize: 12,
    color: '#6b7280',
    paddingRight: 6,
  },

  amount: {
    fontWeight: '800',
    color: '#111827',
  },
});
