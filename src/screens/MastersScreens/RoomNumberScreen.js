import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  TextInput, Modal, ActivityIndicator, Alert, SafeAreaView 
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { API_BASE_URL } from '../../config';

export default function RoomNumberScreen() {
  const [rooms, setRooms] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  const [roomNumber, setRoomNumber] = useState('');
  const [blockName, setBlockName] = useState('');
  const [floor, setFloor] = useState('Ground Floor');
  const [type, setType] = useState('Classroom');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomRes, blockRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/masters/rooms`),
        axios.get(`${API_BASE_URL}/masters/blocks`)
      ]);
      setRooms(roomRes.data);
      setBlocks(blockRes.data);
      if (blockRes.data.length > 0) {
        setBlockName(blockRes.data[0].name);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!roomNumber || !blockName) {
      Alert.alert('Validation Error', 'Room Number and Block are required.');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`${API_BASE_URL}/masters/rooms`, {
        roomNumber,
        blockName,
        floor,
        type
      });
      Alert.alert('Success', 'Room created successfully!');
      setRoomNumber('');
      setModalVisible(false);
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id, rNum) => {
    Alert.alert('Confirm Delete', `Delete Room ${rNum}?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${API_BASE_URL}/masters/rooms/${id}`);
            fetchData();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete room');
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.heading}>Room Numbers ({rooms.length})</Text>
          <TouchableOpacity 
            style={styles.addBtn} 
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#FFF" />
            <Text style={styles.addBtnText}>Create</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4839DC" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={styles.roomBadge}>
                    <Text style={styles.roomText}>{item.roomNumber}</Text>
                  </View>
                  <View style={styles.infoCol}>
                    <Text style={styles.blockText}>{item.blockName}</Text>
                    <Text style={styles.subText}>{item.floor} • {item.type}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item._id, item.roomNumber)}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No rooms found. Click "Create" to add one.</Text>
            }
          />
        )}

        {/* Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Room</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Room Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 101, Lab 2, Seminar Hall"
                value={roomNumber}
                onChangeText={setRoomNumber}
              />

              <Text style={styles.label}>Campus Block *</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={blockName}
                  onValueChange={(v) => setBlockName(v)}
                >
                  {blocks.map((b) => (
                    <Picker.Item key={b._id} label={b.name} value={b.name} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Floor</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 1st Floor, Ground Floor"
                value={floor}
                onChangeText={setFloor}
              />

              <Text style={styles.label}>Room Type</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={type}
                  onValueChange={(v) => setType(v)}
                >
                  <Picker.Item label="Classroom" value="Classroom" />
                  <Picker.Item label="Lab" value="Lab" />
                  <Picker.Item label="Faculty Office" value="Office" />
                  <Picker.Item label="Washroom / Utility" value="Washroom" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>

              <TouchableOpacity 
                style={styles.submitBtn} 
                onPress={handleCreate}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Save Room</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, padding: 18 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  heading: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4839DC',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8
  },
  addBtnText: { color: '#FFF', fontWeight: '600', marginLeft: 4, fontSize: 13 },
  listContainer: { paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 }
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  roomBadge: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 12
  },
  roomText: { color: '#4839DC', fontWeight: '700', fontSize: 14 },
  infoCol: { flex: 1 },
  blockText: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  subText: { fontSize: 12, color: '#64748B', marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#94A3B8', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 22 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#F8FAFC',
    marginBottom: 14
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    marginBottom: 14,
    overflow: 'hidden'
  },
  submitBtn: {
    backgroundColor: '#4839DC',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6
  },
  submitBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 }
});
