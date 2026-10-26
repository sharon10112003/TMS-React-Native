import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  TextInput, Modal, ActivityIndicator, Alert, SafeAreaView, ScrollView, RefreshControl 
} from 'react-native';
import axios from 'axios';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function UserComplaintsScreen() {
  const { token } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Form states
  const [blockName, setBlockName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [complaintType, setComplaintType] = useState('PC Hardware');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const complaintTypes = [
    'PC Hardware', 'PC Software', 'Application Issues', 
    'Network', 'Electronics', 'Plumbing', 'Other'
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, blockRes, roomRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/complaints`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/masters/blocks`),
        axios.get(`${API_BASE_URL}/masters/rooms`)
      ]);
      setComplaints(compRes.data);
      setBlocks(blockRes.data);
      setRooms(roomRes.data);

      if (blockRes.data.length > 0) {
        const defaultBlock = blockRes.data[0].name;
        setBlockName(defaultBlock);
        const matching = roomRes.data.filter(r => r.blockName === defaultBlock);
        if (matching.length > 0) setRoomNumber(matching[0].roomNumber);
        else if (roomRes.data.length > 0) setRoomNumber(roomRes.data[0].roomNumber);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRaiseComplaint = async () => {
    const finalBlock = blockName || (blocks.length > 0 ? blocks[0].name : 'Block A (Main Academic)');
    const finalRoom = roomNumber || (availableRooms.length > 0 ? availableRooms[0].roomNumber : (rooms[0]?.roomNumber || '101'));
    const finalType = complaintType || 'PC Hardware';

    try {
      setSubmitting(true);
      await axios.post(
        `${API_BASE_URL}/complaints`,
        { blockName: finalBlock, roomNumber: finalRoom, complaintType: finalType, remarks, attachment: '' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Ticket registered successfully! An administrator or staff member will address it shortly.');
      setRemarks('');
      setModalVisible(false);
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return { bg: '#D1FAE5', text: '#059669' };
      case 'In-Progress': return { bg: '#DBEAFE', text: '#2563EB' };
      case 'Assigned': return { bg: '#FEF3C7', text: '#D97706' };
      default: return { bg: '#FEE2E2', text: '#DC2626' };
    }
  };

  // Filter rooms based on selected block
  const availableRooms = rooms.filter(r => r.blockName === blockName);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.heading}>My Tickets ({complaints.length})</Text>
          <TouchableOpacity 
            style={styles.raiseBtn} 
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#FFF" />
            <Text style={styles.raiseBtnText}>Raise Ticket</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4839DC" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={complaints}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} />
            }
            renderItem={({ item }) => {
              const badge = getStatusBadge(item.status);
              return (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeText}>{item.complaintType}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.statusText, { color: badge.text }]}>{item.status}</Text>
                    </View>
                  </View>

                  <Text style={styles.locationText}>
                    📍 {item.blockName} • Room {item.roomNumber}
                  </Text>

                  {item.remarks ? (
                    <Text style={styles.remarksText}>{item.remarks}</Text>
                  ) : null}

                  <View style={styles.cardFooter}>
                    <Text style={styles.dateText}>
                      Filed: {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                    {item.assignedTo && (
                      <Text style={styles.assignedText}>Assigned to technician</Text>
                    )}
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>You haven't filed any tickets yet. Click "Raise Ticket" above.</Text>
            }
          />
        )}

        {/* Raise Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Raise a Ticket</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Select Campus Block *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={blockName}
                    onValueChange={(v) => {
                      setBlockName(v);
                      const matching = rooms.filter(r => r.blockName === v);
                      if (matching.length > 0) setRoomNumber(matching[0].roomNumber);
                    }}
                  >
                    {blocks.map((b) => (
                      <Picker.Item key={b._id} label={b.name} value={b.name} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.label}>Select Room Number *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={roomNumber}
                    onValueChange={(v) => setRoomNumber(v)}
                  >
                    {availableRooms.length > 0 ? (
                      availableRooms.map((r) => (
                        <Picker.Item key={r._id} label={`Room ${r.roomNumber} (${r.floor})`} value={r.roomNumber} />
                      ))
                    ) : (
                      rooms.map((r) => (
                        <Picker.Item key={r._id} label={`Room ${r.roomNumber}`} value={r.roomNumber} />
                      ))
                    )}
                  </Picker>
                </View>

                <Text style={styles.label}>Ticket Category *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={complaintType}
                    onValueChange={(v) => setComplaintType(v)}
                  >
                    {complaintTypes.map((t) => (
                      <Picker.Item key={t} label={t} value={t} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.label}>Issue Description / Remarks</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe the issue in detail..."
                  value={remarks}
                  onChangeText={setRemarks}
                  multiline
                  numberOfLines={4}
                />

                <TouchableOpacity 
                  style={styles.submitBtn} 
                  onPress={handleRaiseComplaint}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit Ticket</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, padding: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  heading: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  raiseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4839DC',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4
  },
  raiseBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  listContainer: { paddingBottom: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 }
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typeBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  typeText: { fontSize: 12, fontWeight: '700', color: '#334155' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  locationText: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 6 },
  remarksText: { fontSize: 13, color: '#475569', lineHeight: 19, marginBottom: 10 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10
  },
  dateText: { fontSize: 11, color: '#94A3B8' },
  assignedText: { fontSize: 11, color: '#059669', fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#94A3B8', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 22, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    marginBottom: 14,
    overflow: 'hidden'
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#F8FAFC',
    marginBottom: 16
  },
  textArea: { height: 90, textAlignVertical: 'top' },
  submitBtn: {
    backgroundColor: '#4839DC',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10
  },
  submitBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 }
});
