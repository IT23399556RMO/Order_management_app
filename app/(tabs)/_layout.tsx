import { useAuth } from '@/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function UserHeader({ username }: { username: string }) {
  return (
    <View style={styles.userHeader}>
      <View style={styles.userWords}>
        <Text style={styles.welcomeText}>WELCOME</Text>
        <Text style={styles.usernameText}>{username}</Text>
      </View>

      <View style={styles.userIconFrame}>
        <MaterialCommunityIcons
          name="account"
          size={21}
          color="#7092dc"
        />
      </View>
    </View>
  );
}

function HeaderPlus({
  onPress,
}: {
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.plusButton}
      onPress={onPress}
      hitSlop={8}
    >
      <MaterialCommunityIcons
        name="plus"
        size={27}
        color="#16a34a"
        shape="circle"
      />
    </Pressable>
  );
}

function NavIcon({
  name,
  color,
  shape = 'square',
  borderColor = '#111827',
}: {
  name:
    | 'home'
    | 'arrow-down-bold'
    | 'cash'
    | 'cellphone'
    | 'credit-card'
    | 'cog';
  color: string;
  shape?: 'square' | 'circle';
  borderColor?: string;
}) {
  return (
    <View
      style={[
        styles.navIconFrame,
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

function HeaderTitle({
  title,
  name,
  color,
  shape = 'square',
  borderColor = '#ffffff',
}: {
  title: string;
  name:
    | 'home'
    | 'arrow-down-bold'
    | 'cash'
    | 'cellphone'
    | 'credit-card'
    | 'cog';
  color: string;
  shape?: 'square' | 'circle';
  borderColor?: string;
}) {
  return (
    <View
      style={styles.headerTitle}>
      <NavIcon
        name={name}
        color={color}
        borderColor={borderColor}
        shape={shape}
      />
      <Text style={styles.headerTitleText}>{title}</Text>
    </View>
  );
}

export default function TabLayout() {
  const { user, loading } = useAuth();
  const insets = useSafeAreaInsets();

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;

  return (
  <>
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'left',

        headerStyle: {
          backgroundColor: '#ffffff',
        },

        headerBackground: () => (
          <View style={styles.headerBackground}>
            <View
              style={[
                styles.headerStatusArea,
                { height: insets.top },
              ]}
            />
            <View style={styles.headerContentArea} />
          </View>
        ),

        headerShadowVisible: true,

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },

        tabBarActiveTintColor: '#272211',
        tabBarInactiveTintColor: '#6b7280',

        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingTop: 5,
          paddingBottom: insets.bottom,
          backgroundColor: 'transparent',
          borderTopColor: '#ffffff',
        },

        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            <View style={styles.tabAreaBackground} />

            <View
              pointerEvents="none"
              style={[
                styles.systemNavigationArea,
                { height: insets.bottom },
              ]}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: () => (
            <HeaderTitle 
              title="HOME"
              name="home"
              color="#4b7be2"
              />
          ),
          headerRight: () => (
            <UserHeader username={user.username} />
          ),            
          tabBarLabel: 'Home',
          tabBarIcon: () => (
            <NavIcon
              name="home"
              borderColor="#4b7be2"
              color="#4b7be2"
            />
          ),          
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          headerTitle: () => (
            <HeaderTitle 
              title="ORDERS INFORMATION"
              name="arrow-down-bold"
              color="#16a34a"
              />
          ),          
          headerRight: () => (
            <HeaderPlus
              onPress={() => {
                const { router } = require('expo-router');
                router.push('/order-form');
              }}
            />
          ),
          tabBarLabel: 'Orders',
          tabBarIcon: () => (
            <NavIcon
              name="arrow-down-bold"
              color="#16a34a"
              borderColor="#16a34a"
              shape="circle"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="payments"
        options={{
          headerTitle: () => (
            <HeaderTitle 
              title="PAYMENTS INFORMATION"
              name="cash"
              color="#52e5d6"
              />
          ),          
          headerRight: () => (
            <HeaderPlus
              onPress={() => {
                const { router } = require('expo-router');
                router.push('/payment-form');
              }}
            />
          ),
          tabBarLabel: 'Payments',
          tabBarIcon: () => (
            <NavIcon
              name="cash"
              color="#52e5d6"
              borderColor="#52e5d6"
              shape="circle"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="mobiles"
        options={{
          title: 'MOBILE NUMBERS',
          headerTitle: () => (
            <HeaderTitle 
              title="MOBILE NUMBERS"
              name="cellphone"
              color="#e5529b"
              />
          ),          
          tabBarLabel: 'Mobiles',
          tabBarIcon: () => (
            <NavIcon
              name="cellphone"
              color="#e5529b"
              borderColor="#e5529b"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="cards"
        options={{
          headerTitle: () => (
            <HeaderTitle 
              title="CARD NAMES"
              name="credit-card"
              color="#fc8f00"
              />
          ),          
          tabBarLabel: 'Cards',
          tabBarIcon: () => (
            <NavIcon
              name="credit-card"
              color="#fc8f00"
              borderColor="#fc8f00"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          headerTitle: () => (
            <HeaderTitle 
              title="SETTINGS"
              name="cog"
              color="#5d616b"
              />
          ),          
          headerRight: () => (
            <UserHeader username={user.username} />
          ),
          tabBarLabel: 'Settings',
          tabBarIcon: () => (
            <NavIcon
              name="cog"
              color="#5d616b"
              borderColor="#5d616b"
            />
          ),
        }}
      />
    </Tabs>
  </>
  );
}

const styles = StyleSheet.create({
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },

  userWords: {
    alignItems: 'flex-end',
    marginRight: 7,
  },

  welcomeText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#6b7280',
    lineHeight: 11,
  },

  usernameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 18,
  },

  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerTitleText: {
    marginLeft: 8,
    fontSize: 20,
    fontWeight: '800',
    color: '#111827'
  },

  userIconFrame: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: '#111827',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  plusButton: {
    width: 34,
    height: 34,
    borderWidth: 2,
    borderRadius: 17,
    borderColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },

  navIconFrame: {
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

headerBackground: {
  flex: 1,
  backgroundColor: '#ffffff',
},

headerStatusArea: {
  width: '100%',
  backgroundColor: '#122f5a',
},

headerContentArea: {
  flex: 1,
  backgroundColor: '#ffffff',
},

tabBarBackground: {
  flex: 1,
  backgroundColor: '#ffffff',
},

tabAreaBackground: {
  flex: 1,
  backgroundColor: '#ffffff',
},

systemNavigationArea: {
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#122f5a',
},
 
});