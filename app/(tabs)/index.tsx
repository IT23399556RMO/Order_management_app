import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { PaymentSuccessCircle } from '@/components/PaymentSuccessCircle';
import { useAuth } from '@/context/AuthContext';
import { getOrders } from '@/database/orders';
import { getPayments } from '@/database/payments';
import { MaterialCommunityIcons } from '@expo/vector-icons';

function CardIcon({
  name,
  color,
  shape = 'square',
  borderColor = '#111827',
}: {
  name:
    | 'arrow-down-bold'
    | 'cash'
    | 'credit-card'
  color: string;
  shape?: 'square' | 'circle';
  borderColor?: string;
}) {
  return (
    <View
      style={[
        styles.cardIconFrame,
        shape === 'circle'
          ? styles.circleFrame
          : styles.squareFrame,
        { borderColor },
      ]}
    >
      <MaterialCommunityIcons
        name={name}
        size={20}
        color={color}
      />
    </View>
  );
}


export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [orderCount, setOrderCount] = useState(0);
  const [paymentCount, setPaymentCount] = useState(0);
  const [automaticCount, setAutomaticCount] = useState(0);
  const [manualCount, setManualCount] = useState(0);

  const loadSummary = async () => {
    if (!user) return;

    try {
      const [orders, payments] =
        await Promise.all([
          getOrders(user.id),
          getPayments(user.id),
        ]);

      setOrderCount(orders.length);
      setPaymentCount(payments.length);

      setAutomaticCount(
        payments.filter(
          payment =>
            payment.order_id !== null
        ).length
      );

      setManualCount(
        payments.filter(
          payment =>
            payment.order_id === null
        ).length
      );
    } catch {
      Alert.alert(
        'Error',
        'Could not load home information.'
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      void loadSummary();
    }, [user?.id])
  );

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>

        <View style={styles.area1}>
          <Pressable style={styles.statCard} onPress={() =>router.push('/orders')}>
            <Text style={styles.statLabel}>ORDERS</Text>
            <View style={styles.iconNumber}>
              <CardIcon name="arrow-down-bold" color="#16a34a" borderColor="#16a34a" shape="circle"/>
              <Text style={styles.statValue1}>{orderCount}</Text>
            </View>
          </Pressable>

          <Pressable style={styles.statCard} onPress={() =>router.push('/payments')}>
            <Text style={styles.statLabel}>PAYMENTS</Text>
            <View style={styles.iconNumber}>
              <CardIcon name="credit-card" color="#fc8f00" borderColor="#fc8f00"/>
              <Text style={styles.statValue}>{paymentCount}</Text>
            </View>
          </Pressable>

          <Pressable style={styles.statCard} onPress={() =>router.push('/payments')}>
            <Text style={styles.statLabel}>FAILED</Text>
            <View style={styles.iconNumber}>
              <CardIcon name="cash" color="#e5529b" borderColor="#e5529b" shape="circle"/>
              <Text style={styles.statValue2}>{paymentCount-orderCount}</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.chartArea}>
          <PaymentSuccessCircle automaticCount={automaticCount} manualCount={manualCount}/>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.greenDot]}/>
              <Text style={styles.legendText}>AUTOMATIC</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.redDot]}/>
              <Text style={styles.legendText}>MANUAL</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.logout} onPress={handleLogout}>
          <Text style={styles.logoutText}>LOG OUT</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },

  cardIconFrame: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.4,
  },

  squareFrame: {
    borderRadius: 7,
  },

  circleFrame: {
    borderRadius: 14,
  },
  container2: {
    alignItems: 'center',
    width: '100%',
  },

  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },

  content: {
    flex: 1,
    padding: 20,
  },

  area1: {
    flexDirection: 'row',
    gap: 10,
  },

  statCard: {
    flex: 1,
    minHeight: 92,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 15,
    justifyContent: 'center',
  },

  statLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6b7280',
    letterSpacing: 0.5,
  },

  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#63a0eb',
    marginTop: 4,
  },
  statValue1: {
    fontSize: 28,
    fontWeight: '900',    
    color: '#16a34a',
    marginTop: 4,
  },
  statValue2: {
    fontSize: 28,
    fontWeight: '900',    
    color: '#db5656',
    marginTop: 4,
  },

  iconNumber: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',    
  },

  chartArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  legend: {
    flexDirection: 'row',
    gap: 20,
    marginTop: -8,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 5,
  },

  greenDot: {
    backgroundColor: '#45df7d',
  },

  redDot: {
    backgroundColor: '#db5656',
  },

  legendText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6b7280',
  },

  logout: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '800',
  },
});