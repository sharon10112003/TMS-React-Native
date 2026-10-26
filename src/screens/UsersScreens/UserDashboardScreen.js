import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  ActivityIndicator, RefreshControl, SafeAreaView 
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function UserDashboardScreen({ navigation }) {
  const { user, token } = useContext(AuthContext);
  const [stats, setStats] = useState({ total: 0, pending: 0, assigned: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/complaints/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} />}
      >
        <View style={styles.welcomeBanner}>
          <Text style={styles.greeting}>Hello, {user?.name}!</Text>
          <Text style={styles.subGreeting}>{user?.department} • {user?.programme}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4839DC" style={{ marginTop: 40 }} />
        ) : (
          <>
            <Text style={styles.sectionTitle}>My Ticket Summary</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { borderLeftColor: '#4839DC' }]}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total Filed</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#EF4444' }]}>
                <Text style={[styles.statNumber, { color: '#EF4444' }]}>{stats.pending}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#2563EB' }]}>
                <Text style={[styles.statNumber, { color: '#2563EB' }]}>{stats.inProgress + stats.assigned}</Text>
                <Text style={styles.statLabel}>In Action</Text>
              </View>
              <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
                <Text style={[styles.statNumber, { color: '#10B981' }]}>{stats.completed}</Text>
                <Text style={styles.statLabel}>Resolved</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.actionBanner}
              onPress={() => navigation.navigate('Complaints')}
              activeOpacity={0.8}
            >
              <View style={styles.actionBannerLeft}>
                <Ionicons name="add-circle" size={32} color="#4839DC" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.actionBannerTitle}>Need Something Fixed?</Text>
                  <Text style={styles.actionBannerSubtitle}>Submit a new support ticket now</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
            </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 }
  },
  greeting: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  subGreeting: { fontSize: 13, color: '#64748B', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
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
  actionBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 }
  },
  actionBannerLeft: { flexDirection: 'row', alignItems: 'center' },
  actionBannerTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  actionBannerSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 }
});
