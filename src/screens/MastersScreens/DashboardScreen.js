import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl, SafeAreaView 
} from 'react-native';
import axios from 'axios';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function DashboardScreen({ navigation }) {
  const { user, token } = useContext(AuthContext);
  const [stats, setStats] = useState({ total: 0, pending: 0, assigned: 0, inProgress: 0, completed: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, compRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/complaints/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/complaints`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setStats(statsRes.data);
      setRecentComplaints(compRes.data.slice(0, 3));
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.welcomeBanner}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Administrator'}</Text>
          </View>
          <View style={styles.roleTag}>
            <Text style={styles.roleText}>{user?.role}</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4839DC" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Stat Cards */}
            <Text style={styles.sectionTitle}>Overview Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { borderLeftColor: '#4839DC' }]}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total Tickets</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#EF4444' }]}>
                <Text style={[styles.statNumber, { color: '#EF4444' }]}>{stats.pending}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
                <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{stats.assigned}</Text>
                <Text style={styles.statLabel}>Assigned</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
                <Text style={[styles.statNumber, { color: '#10B981' }]}>{stats.completed}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>

            {/* Quick Action Masters */}
            <Text style={styles.sectionTitle}>Master Setup Shortcuts</Text>
            <View style={styles.shortcutRow}>
              <TouchableOpacity 
                style={styles.shortcutItem}
                onPress={() => navigation.navigate('Department')}
              >
                <MaterialIcons name="apartment" size={24} color="#4839DC" />
                <Text style={styles.shortcutText}>Departments</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.shortcutItem}
                onPress={() => navigation.navigate('Block')}
              >
                <FontAwesome5 name="building" size={20} color="#4839DC" />
                <Text style={styles.shortcutText}>Blocks</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.shortcutItem}
                onPress={() => navigation.navigate('Room No')}
              >
                <Ionicons name="home-outline" size={22} color="#4839DC" />
                <Text style={styles.shortcutText}>Rooms</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.shortcutItem}
                onPress={() => navigation.navigate('User')}
              >
                <Ionicons name="people-outline" size={22} color="#4839DC" />
                <Text style={styles.shortcutText}>Users</Text>
              </TouchableOpacity>
            </View>

            {/* Recent Complaints */}
            <View style={styles.recentHeader}>
              <Text style={styles.sectionTitle}>Recent Tickets</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Complaints')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {recentComplaints.map((item) => (
              <View key={item._id} style={styles.recentCard}>
                <View style={styles.recentTop}>
                  <Text style={styles.recentType}>{item.complaintType}</Text>
                  <Text style={styles.recentStatus}>{item.status}</Text>
                </View>
                <Text style={styles.recentLocation}>{item.blockName} • {item.roomNumber}</Text>
                {item.remarks ? (
                  <Text style={styles.recentRemarks} numberOfLines={1}>{item.remarks}</Text>
                ) : null}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 18 },
  welcomeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 14,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 }
  },
  greeting: { fontSize: 13, color: '#64748B' },
  userName: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  roleTag: { backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  roleText: { color: '#4839DC', fontSize: 11, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 }
  },
  statNumber: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 4, fontWeight: '500' },
  shortcutRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  shortcutItem: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 }
  },
  shortcutText: { fontSize: 11, fontWeight: '600', color: '#334155', marginTop: 6 },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  viewAllText: { fontSize: 13, color: '#4839DC', fontWeight: '600' },
  recentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 }
  },
  recentTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  recentType: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  recentStatus: { fontSize: 12, fontWeight: '600', color: '#4839DC' },
  recentLocation: { fontSize: 12, color: '#64748B' },
  recentRemarks: { fontSize: 12, color: '#94A3B8', marginTop: 4 }
});
