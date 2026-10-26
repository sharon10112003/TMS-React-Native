import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { AuthProvider } from './src/context/AuthContext';

// MastersScreens (Super Admin)
import HomeScreen from './src/screens/MastersScreens/HomeScreen';
import ProfileScreen from './src/screens/MastersScreens/ProfileScreen';
import ComplaintsScreen from './src/screens/MastersScreens/ComplaintScreen';
import LoginScreen from './src/screens/MastersScreens/LoginScreen';
import DepartmentScreen from './src/screens/MastersScreens/DepartmentScreen';
import ProgrammeScreen from './src/screens/MastersScreens/ProgrammeScreen';
import BlockScreen from './src/screens/MastersScreens/BlockScreen';
import RoomNumberScreen from './src/screens/MastersScreens/RoomNumberScreen';
import UserScreen from './src/screens/MastersScreens/UserScreen';
import DashboardScreen from './src/screens/MastersScreens/DashboardScreen';

// UsersScreens (Student / User)
import UserProfileScreen from './src/screens/UsersScreens/UserProfileScreen';
import UserComplaintsScreen from './src/screens/UsersScreens/UserComplaintScreen';
import UserDashboardScreen from './src/screens/UsersScreens/UserDashboardScreen';

// StaffScreens (Technician / Support Staff)
import StaffProfileScreen from './src/screens/StaffScreens/StaffProfileScreen';
import StaffComplaintsScreen from './src/screens/StaffScreens/StaffComplaintScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const drawerScreenOptions = {
  headerStyle: { backgroundColor: '#4839DC', elevation: 0, shadowOpacity: 0 },
  headerTintColor: '#F9FAFB',
  headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
  drawerActiveTintColor: '#FFFFFF',
  drawerActiveBackgroundColor: 'rgba(255, 255, 255, 0.15)',
  drawerInactiveTintColor: '#E0E7FF',
  drawerStyle: { backgroundColor: '#4839DC', width: 270 },
  drawerLabelStyle: { fontSize: 14, fontWeight: '600' }
};

// ----------------- Super Admin Sidebar -----------------
function SuperAdminDrawer() {
  return (
    <Drawer.Navigator initialRouteName="Dashboard" screenOptions={drawerScreenOptions}>
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen
        name="Complaints"
        component={ComplaintsScreen}
        options={{
          title: 'Tickets',
          drawerLabel: 'Tickets',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="confirmation-number" size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen
        name="Department"
        component={DepartmentScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="apartment" size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen
        name="Programme"
        component={ProgrammeScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen
        name="Block"
        component={BlockScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <FontAwesome5 name="building" size={size - 2} color={color} />
          )
        }}
      />
      <Drawer.Screen
        name="Room No"
        component={RoomNumberScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen
        name="User"
        component={UserScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          )
        }}
      />
    </Drawer.Navigator>
  );
}

// ----------------- Staff Sidebar -----------------
function StaffDrawer() {
  return (
    <Drawer.Navigator initialRouteName="Complaints" screenOptions={drawerScreenOptions}>
      <Drawer.Screen
        name="Complaints"
        component={StaffComplaintsScreen}
        options={{
          title: 'Work Tickets',
          drawerLabel: 'Work Tickets',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="assignment" size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={StaffProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          )
        }}
      />
    </Drawer.Navigator>
  );
}

// ----------------- Users Sidebar -----------------
function UsersDrawer() {
  return (
    <Drawer.Navigator initialRouteName="Dashboard" screenOptions={drawerScreenOptions}>
      <Drawer.Screen
        name="Dashboard"
        component={UserDashboardScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen
        name="Complaints"
        component={UserComplaintsScreen}
        options={{
          title: 'My Tickets',
          drawerLabel: 'My Tickets',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="confirmation-number" size={size} color={color} />
          )
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={UserProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          )
        }}
      />
    </Drawer.Navigator>
  );
}

// ----------------- Main App Navigation -----------------
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SuperAdminScreen" component={SuperAdminDrawer} />
          <Stack.Screen name="StaffScreen" component={StaffDrawer} />
          <Stack.Screen name="UserScreen" component={UsersDrawer} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
