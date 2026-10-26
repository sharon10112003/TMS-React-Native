import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const ComplaintRaisingScreen = ({ navigation }) => {
  const { user, token } = useContext(AuthContext);
  
  const [blockName, setBlockName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [complaintType, setComplaintType] = useState('PC Hardware');
  const [remarks, setRemarks] = useState('');

  // If user is staff (Technician), they have no access according to the spec
  if (user?.role !== 'Superadmin' && user?.role !== 'User') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Access Denied. Technicians/Staff cannot raise complaints.</Text>
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!blockName || !roomNumber || !complaintType) {
      Alert.alert('Error', 'Please fill in Block, Room, and Type.');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/complaints`, {
        blockName,
        roomNumber,
        complaintType,
        remarks,
        attachment: '' // Placeholder for file upload
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Alert.alert('Success', 'Ticket raised successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to raise ticket');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Raise a Ticket</Text>
      
      <Text style={styles.label}>Block Name</Text>
      <TextInput style={styles.input} value={blockName} onChangeText={setBlockName} placeholder="e.g. Block A" />

      <Text style={styles.label}>Room Number</Text>
      <TextInput style={styles.input} value={roomNumber} onChangeText={setRoomNumber} placeholder="e.g. 101" />

      <Text style={styles.label}>Ticket Category</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={complaintType}
          onValueChange={(itemValue) => setComplaintType(itemValue)}
        >
          <Picker.Item label="PC Hardware" value="PC Hardware" />
          <Picker.Item label="PC Software" value="PC Software" />
          <Picker.Item label="Application Issues" value="Application Issues" />
          <Picker.Item label="Network" value="Network" />
          <Picker.Item label="Electronics" value="Electronics" />
          <Picker.Item label="Plumbing" value="Plumbing" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>

      <Text style={styles.label}>Remarks</Text>
      <TextInput 
        style={[styles.input, styles.textArea]} 
        value={remarks} 
        onChangeText={setRemarks} 
        multiline 
        numberOfLines={4} 
        placeholder="Detailed description..." 
      />

      <Button title="Submit Ticket" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, marginBottom: 5, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', marginBottom: 15, borderRadius: 5, overflow: 'hidden' },
  textArea: { height: 100, textAlignVertical: 'top' },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center', marginTop: 50 }
});

export default ComplaintRaisingScreen;
