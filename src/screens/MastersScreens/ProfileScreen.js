import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function ProfileScreen({ navigation }) {
  const { user, token, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(user || {});

  useEffect(() => {
    const fetchFreshProfile = async () => {
      try {
        if (token) {
          const res = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProfile(res.data);
        }
      } catch (err) {
        // fallback to existing user context
        if (user) setProfile(user);
      }
    };
    fetchFreshProfile();
  }, [token, user]);

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }]
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={48} color="#4839DC" />
          </View>
          <Text style={styles.userName}>{profile?.name || user?.name || 'Administrator'}</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>{profile?.role || user?.role || 'Superadmin'}</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionHeader}>Account Details</Text>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color="#64748B" />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoVal}>{profile?.email || user?.email || 'admin@system.com'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color="#64748B" />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoVal}>{profile?.phoneNumber || user?.phoneNumber || '9876543210'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={20} color="#64748B" />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoVal}>{profile?.department || user?.department || 'Information Technology'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={20} color="#64748B" />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Programme</Text>
              <Text style={styles.infoVal}>{profile?.programme || user?.programme || 'Admin'}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 20 },
  avatarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 }
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  userName: { fontSize: 20, fontWeight: '700', color: '#1E293B' },
  roleTag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 6
  },
  roleTagText: { fontSize: 12, fontWeight: '600', color: '#4839DC' },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 }
  },
  sectionHeader: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  infoCol: { marginLeft: 14 },
  infoLabel: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  infoVal: { fontSize: 14, color: '#334155', fontWeight: '600' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12
  },
  logoutBtnText: { color: '#EF4444', fontSize: 15, fontWeight: '700' }
});
