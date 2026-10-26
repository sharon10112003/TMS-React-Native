import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async (customEmail, customPass) => {
    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    if (!loginEmail || !loginPass) {
      Alert.alert('Validation Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: loginEmail.trim().toLowerCase(),
        password: loginPass
      });

      const { token, user } = response.data;
      await login(token, user);

      // Route by role matching Annexure-B
      if (user.role === 'Superadmin') {
        navigation.replace('SuperAdminScreen');
      } else if (['Networking Staff', 'Plumber', 'Electrician', 'Software Developer'].includes(user.role)) {
        navigation.replace('StaffScreen');
      } else {
        navigation.replace('UserScreen');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Unable to connect to server. Check network connection.';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@system.com');
      setPassword('admin123');
    } else if (role === 'staff') {
      setEmail('network@system.com');
      setPassword('staff123');
    } else {
      setEmail('user@system.com');
      setPassword('user123');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => navigation.navigate('Home')}
          >
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>

          <View style={styles.brandHeader}>
            <View style={styles.iconCircle}>
              <Ionicons name="lock-closed" size={32} color="#4839DC" />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subTitle}>Sign in to your Ticket Management account</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. user@system.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="key-outline" size={20} color="#94A3B8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#94A3B8" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, loading && { opacity: 0.7 }]}
              onPress={() => handleLogin()}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Log In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Quick Demo Fill Buttons */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Quick Demo Logins (Click to autofill):</Text>
            <View style={styles.demoChipsRow}>
              <TouchableOpacity 
                style={styles.demoChip} 
                onPress={() => setDemoCredentials('admin')}
              >
                <Text style={styles.demoChipText}>Super Admin</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.demoChip} 
                onPress={() => setDemoCredentials('staff')}
              >
                <Text style={styles.demoChipText}>Network Staff</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.demoChip} 
                onPress={() => setDemoCredentials('user')}
              >
                <Text style={styles.demoChipText}>Student User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { padding: 24, justifyContent: 'center', minHeight: '100%' },
  backBtn: { marginBottom: 12, width: 40 },
  brandHeader: { alignItems: 'center', marginBottom: 28 },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  title: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  subTitle: { fontSize: 13, color: '#64748B', marginTop: 4 },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 24
  },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 46, fontSize: 14, color: '#1E293B' },
  submitButton: {
    backgroundColor: '#4839DC',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6
  },
  submitButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  demoSection: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 14 },
  demoTitle: { fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 10, textAlign: 'center' },
  demoChipsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  demoChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1'
  },
  demoChipText: { fontSize: 11, fontWeight: '600', color: '#4839DC' }
});
