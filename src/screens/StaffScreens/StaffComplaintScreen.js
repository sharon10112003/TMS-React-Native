import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, Alert, SafeAreaView, RefreshControl 
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function StaffComplaintsScreen() {
  const { token } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAssigned = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load assigned tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, []);

  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      await axios.put(
        `${API_BASE_URL}/complaints/${complaintId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Status Updated', `Ticket marked as ${newStatus}`);
      fetchAssigned();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update status');
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topHeader}>
          <Text style={styles.headerTitle}>Assigned Tickets ({complaints.length})</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4839DC" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={complaints}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAssigned(); }} />
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

                  <Text style={styles.reportedBy}>
                    Reported by: {item.raisedBy?.name || 'User'} ({item.department})
                  </Text>

                  {/* Actions for technician */}
                  <View style={styles.actionRow}>
                    {item.status !== 'In-Progress' && item.status !== 'Completed' && (
                      <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: '#2563EB' }]}
                        onPress={() => handleUpdateStatus(item._id, 'In-Progress')}
                      >
                        <Ionicons name="play" size={14} color="#FFF" />
                        <Text style={styles.actionBtnText}>Start Work</Text>
                      </TouchableOpacity>
                    )}

                    {item.status !== 'Completed' && (
                      <TouchableOpacity 
                        style={[styles.actionBtn, { backgroundColor: '#059669' }]}
                        onPress={() => handleUpdateStatus(item._id, 'Completed')}
                      >
                        <Ionicons name="checkmark-done" size={14} color="#FFF" />
                        <Text style={styles.actionBtnText}>Mark Resolved</Text>
                      </TouchableOpacity>
                    )}

                    {item.status === 'Completed' && (
                      <View style={styles.resolvedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#059669" />
                        <Text style={styles.resolvedText}>Work Completed</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No tickets currently assigned to you.</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1, padding: 16 },
  topHeader: { marginBottom: 14 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
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
  remarksText: { fontSize: 13, color: '#475569', lineHeight: 19, marginBottom: 8 },
  reportedBy: { fontSize: 11, color: '#94A3B8', marginBottom: 12 },
  actionRow: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8
  },
  actionBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  resolvedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  resolvedText: { color: '#059669', fontSize: 13, fontWeight: '700' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#94A3B8', fontSize: 14 }
});
