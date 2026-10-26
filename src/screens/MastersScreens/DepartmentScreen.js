import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  TextInput, Modal, ActivityIndicator, Alert, SafeAreaView 
} from 'react-native';
import axios from 'axios';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../config';

export default function DepartmentScreen() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/masters/departments`);
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async () => {
    if (!name || !code) {
      Alert.alert('Validation Error', 'Department Name and Code are required.');
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`${API_BASE_URL}/masters/departments`, { name, code, description });
      Alert.alert('Success', 'Department created successfully!');
      setName('');
      setCode('');
      setDescription('');
      setModalVisible(false);
      fetchDepartments();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id, deptName) => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete ${deptName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE_URL}/masters/departments/${id}`);
              fetchDepartments();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete department');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Text style={styles.heading}>Departments ({departments.length})</Text>
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
            data={departments}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{item.code}</Text>
                  </View>
                  <View style={styles.infoCol}>
                    <Text style={styles.deptName}>{item.name}</Text>
                    {item.description ? (
                      <Text style={styles.deptDesc}>{item.description}</Text>
                    ) : null}
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item._id, item.name)}>
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No departments found. Click "Create" to add one.</Text>
            }
          />
        )}

        {/* Create Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Department</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Department Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Information Technology"
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Department Code *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. IT"
                value={code}
                onChangeText={setCode}
                autoCapitalize="characters"
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, { height: 70 }]}
                placeholder="Optional description"
                value={description}
                onChangeText={setDescription}
                multiline
              />

              <TouchableOpacity 
                style={styles.submitBtn} 
                onPress={handleCreate}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Save Department</Text>
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
  codeBadge: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 12
  },
  codeText: { color: '#4839DC', fontWeight: '700', fontSize: 13 },
  infoCol: { flex: 1 },
  deptName: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  deptDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
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
  submitBtn: {
    backgroundColor: '#4839DC',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6
  },
  submitBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 }
});
