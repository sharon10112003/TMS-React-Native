import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.name}</Text>
      <Text>Role: {user?.role}</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Raise a Ticket" onPress={() => navigation.navigate('RaiseComplaint')} />
      </View>

      <View style={[styles.buttonContainer, { marginTop: 10 }]}>
        <Button title="Logout" onPress={logout} color="red" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  buttonContainer: { marginTop: 20, width: '100%' }
});

export default DashboardScreen;
