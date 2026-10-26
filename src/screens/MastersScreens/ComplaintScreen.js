import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, Alert, SafeAreaView, Modal, ScrollView, TextInput, RefreshControl 
} from 'react-native';
import axios from 'axios';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function ComplaintsScreen() {
  const { token } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Assign Modal
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [updating, setUpdating] = useState(false);

  // Create Complaint Modal
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newBlockName, setNewBlockName] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newComplaintType, setNewComplaintType] = useState('PC Hardware');
  const [newRemarks, setNewRemarks] = useState('');
  const [creating, setCreating] = useState(false);

  const complaintTypes = [
    'PC Hardware', 'PC Software', 'Application Issues', 
    'Network', 'Electronics', 'Plumbing', 'Other'
  ];

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const [compRes, staffRes, blockRes, roomRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/complaints`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/masters/staff`),
        axios.get(`${API_BASE_URL}/masters/blocks`),
        axios.get(`${API_BASE_URL}/masters/rooms`)
      ]);
      setComplaints(compRes.data);
      setStaffList(staffRes.data);
      setBlocks(blockRes.data);
      setRooms(roomRes.data);

      if (staffRes.data.length > 0) setSelectedStaffId(staffRes.data[0]._id);
      if (blockRes.data.length > 0) {
        setNewBlockName(blockRes.data[0].name);
        const matchingRooms = roomRes.data.filter(r => r.blockName === blockRes.data[0].name);
        if (matchingRooms.length > 0) setNewRoomNumber(matchingRooms[0].roomNumber);
        else if (roomRes.data.length > 0) setNewRoomNumber(roomRes.data[0].roomNumber);
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
    fetchComplaints();
  }, []);

  const handleAssign = async () => {
    if (!selectedComplaint || !selectedStaffId) return;

    try {
      setUpdating(true);
      await axios.put(
        `${API_BASE_URL}/complaints/${selectedComplaint._id}/assign`,
        { staffId: selectedStaffId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Ticket assigned successfully!');
      setAssignModalVisible(false);
      fetchComplaints();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to assign ticket');
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateComplaint = async () => {
    if (!newBlockName || !newRoomNumber || !newComplaintType) {
      Alert.alert('Validation Error', 'Please select Block, Room, and Ticket Category.');
      return;
    }

    try {
      setCreating(true);
      await axios.post(
        `${API_BASE_URL}/complaints`,
        { 
          blockName: newBlockName, 
          roomNumber: newRoomNumber, 
          complaintType: newComplaintType, 
          remarks: newRemarks, 
          attachment: '' 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Success', 'Ticket created successfully!');
      setNewRemarks('');
      setCreateModalVisible(false);
      fetchComplaints();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit ticket');
    } finally {
      setCreating(false);
    }
  };

  const filteredComplaints = statusFilter === 'ALL'
    ? complaints
    : complaints.filter(c => c.status === statusFilter);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return { bg: '#D1FAE5', text: '#059669' };
      case 'In-Progress': return { bg: '#DBEAFE', text: '#2563EB' };
      case 'Assigned': return { bg: '#FEF3C7', text: '#D97706' };
      case 'On Hold': return { bg: '#F3E8FF', text: '#7E22CE' };
      default: return { bg: '#FEE2E2', text: '#DC2626' }; // Pending
    }
  };

  const availableRooms = rooms.filter(r => r.blockName === newBlockName);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header with Create Button */}
        <View style={styles.topBar}>
          <Text style={styles.topHeading}>Tickets ({filteredComplaints.length})</Text>
          <TouchableOpacity 
            style={styles.createBtn}
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#FFF" />
            <Text style={styles.createBtnText}>Raise Ticket</Text>
          </TouchableOpacity>
        </View>

        {/* Status Filter Chips */}
        <View style={styles.filterScroll}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {['ALL', 'Pending', 'Assigned', 'In-Progress', 'Completed'].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.filterChip, statusFilter === s && styles.activeFilterChip]}
                onPress={() => setStatusFilter(s)}
              >
                <Text style={[styles.filterChipText, statusFilter === s && styles.activeFilterText]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4839DC" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredComplaints}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchComplaints(); }} />
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
                    <Text style={styles.metaText}>
                      By: {item.raisedBy?.name || 'User'} ({item.department})
                    </Text>
                    {item.assignedTo ? (
                      <Text style={styles.assignedText}>
                        Assigned: {item.assignedTo?.name}
                      </Text>
                    ) : (
                      <TouchableOpacity
                        style={styles.assignBtn}
                        onPress={() => {
                          setSelectedComplaint(item);
                          setAssignModalVisible(true);
                        }}
                      >
                        <MaterialIcons name="person-add" size={16} color="#FFF" />
                        <Text style={styles.assignBtnText}>Assign Staff</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No tickets found for this filter.</Text>
            }
          />
        )}

        {/* Create Complaint Modal */}
        <Modal visible={createModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Raise a New Ticket</Text>
                <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Campus Block *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={newBlockName}
                    onValueChange={(v) => {
                      setNewBlockName(v);
                      const matching = rooms.filter(r => r.blockName === v);
                      if (matching.length > 0) setNewRoomNumber(matching[0].roomNumber);
                    }}
                  >
                    {blocks.map((b) => (
                      <Picker.Item key={b._id} label={b.name} value={b.name} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.label}>Room Number *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={newRoomNumber}
                    onValueChange={(v) => setNewRoomNumber(v)}
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
                    selectedValue={newComplaintType}
                    onValueChange={(v) => setNewComplaintType(v)}
                  >
                    {complaintTypes.map((t) => (
                      <Picker.Item key={t} label={t} value={t} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.label}>Issue Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe the ticket issue in detail..."
                  value={newRemarks}
                  onChangeText={setNewRemarks}
                  multiline
                  numberOfLines={4}
                />

                <TouchableOpacity 
                  style={styles.submitBtn} 
                  onPress={handleCreateComplaint}
                  disabled={creating}
                >
                  {creating ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit Ticket</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Assign Modal */}
        <Modal visible={assignModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Assign Technician / Staff</Text>
                <TouchableOpacity onPress={() => setAssignModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Assign ticket at {selectedComplaint?.blockName} - Room {selectedComplaint?.roomNumber} ({selectedComplaint?.complaintType})
              </Text>

              <Text style={styles.label}>Select Available Staff Member:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedStaffId}
                  onValueChange={(v) => setSelectedStaffId(v)}
                >
                  {staffList.map((s) => (
                    <Picker.Item 
                      key={s._id} 
                      label={`${s.name} (${s.role})`} 
                      value={s._id} 
                    />
                  ))}
                </Picker>
              </View>

              <TouchableOpacity 
                style={styles.submitBtn} 
                onPress={handleAssign}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Confirm Assignment</Text>
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
  container: { flex: 1, padding: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  topHeading: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4839DC',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4
  },
  createBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  filterScroll: { marginBottom: 14 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  activeFilterChip: { backgroundColor: '#4839DC', borderColor: '#4839DC' },
  filterChipText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  activeFilterText: { color: '#FFFFFF' },
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
  remarksText: { fontSize: 13, color: '#475569', lineHeight: 19, marginBottom: 12 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10
  },
  metaText: { fontSize: 11, color: '#94A3B8' },
  assignedText: { fontSize: 12, fontWeight: '600', color: '#10B981' },
  assignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4839DC',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 4
  },
  assignBtnText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#94A3B8', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 22, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  modalSubtitle: { fontSize: 13, color: '#64748B', marginBottom: 14 },
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
    marginBottom: 14
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
