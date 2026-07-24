import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import useAuthStore from '../store/authStore';
import useLoginStore from '../store/formStore';

const LoginScreen = ({ navigation }) => {
  const { email, password, setEmail, setPassword, resetForm } = useLoginStore();
  const { login } = useAuthStore();

  const handleLogin = () => {
    // In a real app, you would make an API call here
    console.log('Attempting login with:', email, password);
    
    // Simulate a successful login for demonstration
    const userData = { email: email, name: 'Iguana Catcher' };
    login(userData);
    
    // Reset form after successful login
    resetForm();
    
    // Navigate to the main app screen
    // navigation.navigate('MainApp'); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iguana Trap App</Text>

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Forgot Password Link */}
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.link}>Forgot Password?</Text>
      </TouchableOpacity>
      
      {/* Login Button */}
      <Button
        title="Log In"
        onPress={handleLogin}
        disabled={!email || !password}
      />

      {/* Sign Up Link */}
      <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
        <Text style={styles.bottomLink}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... your styles here (container, title, input, etc.)
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  link: {
    color: 'blue',
    textAlign: 'right',
    marginBottom: 20,
  },
  bottomLink: {
    marginTop: 30,
    color: 'blue',
    textAlign: 'center',
  },
});

export default LoginScreen;