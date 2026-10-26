import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  TextInput, Modal, ActivityIndicator, Alert, SafeAreaView, ScrollView 
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { API_BASE_URL } from '../../config';

export default function UserScreen() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const [department, setDepartment] = useState('');
  const [programme, setProgramme] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const roles = ['Superadmin', 'User', 'Networking Staff', 'Plumber', 'Electrician', 'Software Developer'];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, deptRes, progRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/masters/users`),
        axios.get(`${API_BASE_URL}/masters/departments`),
        axios.get(`${API_BASE_URL}/masters/programmes`)
      ]);
      setUsers(userRes.data);
      setDepartments(deptRes.data);
      setProgrammes(progRes.data);

      if (deptRes.data.length > 0) setDepartment(deptRes.data[0].name);
      if (progRes.data.length > 0) setProgramme(progRes.data[0].name);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!name || !email || !password || !role) {
      Alert.alert('Validation Error', 'Name, Email, Password, and Role are required.');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`${API_BASE_URL}/masters/users`, {
        name,
        phoneNumber,
        email: email.trim().toLowerCase(),
        password,
        role,
        department: department || 'General',
        programme: programme || 'General'
      });
      Alert.alert('Success', 'User created successfully!');
      setName('');
      setPhoneNumber('');
      setEmail('');
      setPassword('');
      setModalVisible(false);
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id, userName) => {
    Alert.alert('Confirm Delete', `Delete user ${userName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${API_BASE_URL}/masters/users/${id}`);
            fetchData();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete user');
          }
        }
      }
    ]);
  };

  const getRoleBadgeStyle = (r) => {
    if (r === 'Superadmin') return { bg: '#FEE2E2', text: '#DC2626' };
    if (r === 'User') return { bg: '#E0F2FE', text: '#0284C7' };
    return { bg: '#FEF3C7', text: '#D97706' }; // Staff
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.heading}>Users ({users.length})</Text>
          <TouchableOpacity 
            style={styles.addBtn} 
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add" size={18} color="#FFF" />
            <Text style={styles.addBtnText}>Create User</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4839DC" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => {
              const badge = getRoleBadgeStyle(item.role);
              return (
                <View style={styles.card}>
                  <View style={styles.cardLeft}>
                    <View style={styles.avatar}>
                      <Ionicons name="person" size={20} color="#4839DC" />
                    </View>
                    <View style={styles.infoCol}>
                      <View style={styles.nameRow}>
                        <Text style={styles.userName}>{item.name}</Text>
                        <View style={[styles.roleBadge, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.roleBadgeText, { color: badge.text }]}>{item.role}</Text>
                        </View>
                      </View>
                      <Text style={styles.userEmail}>{item.email}</Text>
                      <Text style={styles.userMeta}>{item.department} • {item.phoneNumber}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleDelete(item._id, item.name)}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No users found.</Text>
            }
          />
        )}

        {/* Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create New User</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. John Smith"
                  value={name}
                  onChangeText={setName}
                />

                <Text style={styles.label}>Email Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. jsmith@system.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <Text style={styles.label}>Password *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 9876543210"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />

                <Text style={styles.label}>Role *</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={role}
                    onValueChange={(v) => setRole(v)}
                  >
                    {roles.map((r) => (
                      <Picker.Item key={r} label={r} value={r} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.label}>Department</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={department}
                    onValueChange={(v) => setDepartment(v)}
                  >
                    {departments.map((d) => (
                      <Picker.Item key={d._id} label={d.name} value={d.name} />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.label}>Programme</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={programme}
                    onValueChange={(v) => setProgramme(v)}
                  >
                    {programmes.map((p) => (
                      <Picker.Item key={p._id} label={p.name} value={p.name} />
                    ))}
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
                    <Text style={styles.submitBtnText}>Create User Account</Text>
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
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  infoCol: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  userName: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  roleBadgeText: { fontSize: 11, fontWeight: '700' },
  userEmail: { fontSize: 12, color: '#64748B', marginTop: 2 },
  userMeta: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#94A3B8', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 22, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  label: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    backgroundColor: '#F8FAFC',
    marginBottom: 12
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
    overflow: 'hidden'
  },
  submitBtn: {
    backgroundColor: '#4839DC',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10
  },
  submitBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 }
});
