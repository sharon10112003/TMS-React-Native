import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="confirmation-number" size={48} color="#4839DC" />
          </View>
          <Text style={styles.title}>Ticket Management System</Text>
          <Text style={styles.subTitle}>Campus Support & Ticket Resolution Portal</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Fast & Transparent Support</Text>
          <Text style={styles.cardBody}>
            Submit hardware, software, network, plumbing, and electrical issues effortlessly. Track resolution progress in real-time.
          </Text>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.featureText}>Instant Ticket Creation & Tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.featureText}>Role-Based Access for Staff & Students</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.featureText}>Campus Block & Room Specific Tracking</Text>
            </View>
          </View>
        </View>

        <View style={styles.rolesRow}>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={22} color="#4839DC" />
            <Text style={styles.roleText}>Super Admin</Text>
          </View>
          <View style={styles.roleBadge}>
            <Ionicons name="construct" size={22} color="#F59E0B" />
            <Text style={styles.roleText}>Staff</Text>
          </View>
          <View style={styles.roleBadge}>
            <Ionicons name="person" size={22} color="#10B981" />
            <Text style={styles.roleText}>Students</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Sign In to Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 24, alignItems: 'center', justifyContent: 'center', minHeight: '100%' },
  header: { alignItems: 'center', marginBottom: 28 },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#C7D2FE'
  },
  title: { fontSize: 26, fontWeight: '800', color: '#1E293B', textAlign: 'center' },
  subTitle: { fontSize: 14, color: '#64748B', marginTop: 6, textAlign: 'center' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20
  },
  cardHeader: { fontSize: 17, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  cardBody: { fontSize: 14, color: '#64748B', lineHeight: 21, marginBottom: 16 },
  featureList: { gap: 10 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 13, color: '#334155', fontWeight: '500' },
  rolesRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 30 },
  roleBadge: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 95
  },
  roleText: { fontSize: 12, fontWeight: '600', color: '#334155', marginTop: 4 },
  primaryButton: {
    backgroundColor: '#4839DC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#4839DC',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});
