import { AuthProvider } from '@/context/AuthContext';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />

        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="order-form"
          options={{
            headerShown: true,
            title: 'ORDER',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '800',
            },
          }}
        />

        <Stack.Screen
          name="payment-form"
          options={{
            headerShown: true,
            title: 'PAYMENT',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '800',
            },
          }}
        />
      </Stack>
    </AuthProvider>
  );
}