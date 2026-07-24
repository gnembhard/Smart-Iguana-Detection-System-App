import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from "@expo/vector-icons"; // for eye icon
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig"; 
import useAuthStore from '../store/authStore';
import useLoginStore from '../store/formStore';

const { width } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  const { email, password, setEmail, setPassword, resetForm } = useLoginStore();
  const { login } = useAuthStore();

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
  if (!validateForm()) return;

  setLoading(true);
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save Firebase user in the Zustand store
    login({
      email: user.email,
      uid: user.uid,
    });

    resetForm();
    navigation.replace("MainTabs");
  } catch (error) {
    console.error("Login error:", error.message);

    if (error.code === "auth/user-not-found") {
      setErrors({ email: "No account found with this email" });
    } else if (error.code === "auth/wrong-password") {
      setErrors({ password: "Incorrect password" });
    } else if (error.code === "auth/invalid-email") {
      setErrors({ email: "Invalid email format" });
    } else {
      setErrors({ email: "Login failed. Please try again." });
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['#4DB066', '#2E9B51']} style={styles.container}>
        
        {/* Decorative Circles */}
        <LinearGradient colors={['#78C6F2', '#C2E5FE']} style={[styles.circle, styles.topCircle]} />
        <LinearGradient colors={['#78C6F2', '#C2E5FE']} style={[styles.circle, styles.bottomCircle]} />

        <View style={styles.content}>
          {/* Logo */}
          <Image source={require('../img/Logo.png')} style={styles.logo} />
          <Text style={styles.subtitle}>Manage your iguanas trap easily</Text>

          {/* Email Input */}
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email Address"
            placeholderTextColor="#ccc"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Password Input with Eye Icon */}
          <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#ccc"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              textContentType="none"
              autoCorrect={false}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="#555"
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          {/* Forgot Password */}
          <TouchableOpacity 
            style={styles.forgotPasswordButton}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
          
          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              (!email || !password || loading) && styles.loginButtonDisabled
            ]}
            onPress={handleLogin}
            disabled={!email || !password || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.bottomLink}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center', padding: 20 },
  logo: { width: width * 0.7, height: width * 0.5, resizeMode: 'contain', marginBottom: 15 },
  subtitle: { color: '#fff', fontSize: 16, marginBottom: 20, textAlign: 'center' },
  input: {
    height: 50,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  inputError: { borderColor: '#e74c3c' },
  errorText: { color: '#e74c3c', fontSize: 14, marginBottom: 10, alignSelf: 'flex-start' },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  passwordInput: { flex: 1, height: 50, paddingHorizontal: 10 },
  eyeIcon: { paddingHorizontal: 10 },
  forgotPasswordButton: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotPasswordText: { color: 'white', fontSize: 16, fontWeight: '600', textDecorationLine: 'underline' },
  loginButton: {
    backgroundColor: '#2E86AB',
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonDisabled: { backgroundColor: '#6c757d' },
  loginButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  bottomLink: { marginTop: 10, color: 'white', textAlign: 'center', fontSize: 16, fontWeight: '600', textDecorationLine: 'underline' },
  circle: { position: 'absolute', width: width * 1.2, height: width * 1.2, borderRadius: width, opacity: 0.3 },
  topCircle: { top: -width * 0.8, left: -width * 0.1 },
  bottomCircle: { bottom: -width * 0.8, right: -width * 0.1 },
});

export default LoginScreen;
