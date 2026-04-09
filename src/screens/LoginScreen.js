import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

import usersData from '../../data/account/users.json'; 

/**
 * Screen component for local user authentication.
 * @param {Object} props - Component props.
 * @param {Function} props.onLoginSuccess - Callback invoked after a successful login.
 * @returns {JSX.Element} The login screen UI.
 */
export const LoginScreen = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = () => {
    setErrorMsg('');
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    const foundUser = usersData.find(
      (user) => user.email.trim().toLowerCase() === normalizedEmail && user.password.trim() === normalizedPassword
    );

    if (foundUser) {
      // Clone to avoid accidental shared-reference mutations.
      onLoginSuccess(JSON.parse(JSON.stringify(foundUser)));
    } else {
      setErrorMsg('Invalid email or password.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Brawl Compare</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email (e.g., id@supercell.com)"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

      <View style={styles.buttonContainer}>
        <Button title="Login" onPress={handleLogin} color="#00ff00" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00ff00',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0B0',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  errorText: {
    color: '#FF4C4C',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 255, 0, 0.05)',
    borderWidth: 2,
    borderColor: '#00ff00',
    overflow: 'hidden',
  },
});