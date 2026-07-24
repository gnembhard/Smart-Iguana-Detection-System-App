import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import useAuthStore from "../store/authStore";

const { width } = Dimensions.get("window");

const SignUpScreen = ({ navigation }) => {
  const { signUp } = useAuthStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!name.trim()) newErrors.name = "Name is required";

    // Email validation
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Enter a valid email";

    // Date of Birth validation
    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
      newErrors.dateOfBirth = "Please use YYYY-MM-DD format";
    } else {
      // Validate it's a real date and in the past
      const dob = new Date(dateOfBirth);
      const today = new Date();
      if (isNaN(dob.getTime())) {
        newErrors.dateOfBirth = "Please enter a valid date";
      } else if (dob >= today) {
        newErrors.dateOfBirth = "Date of birth must be in the past";
      }
    }

    // Password validation
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    // Confirm password validation
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (confirmPassword !== password)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signUp({ 
        email, 
        password, 
        displayName: name.trim(),
        dateOfBirth 
      });
      
      // SUCCESS - Redirect user immediately to Login screen
      Alert.alert("Success", "Account created successfully! Please log in.", [
        {
          text: "OK",
          onPress: () => {
            navigation.replace("Login");
          }
        }
      ]);
      
    } catch (error) {
      console.error("Sign up error:", error.message);
      
      // Handle specific Firebase errors
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Sign Up Error", "This email is already registered.");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Sign Up Error", "Invalid email format.");
      } else if (error.code === "auth/weak-password") {
        Alert.alert("Sign Up Error", "Password is too weak.");
      } else {
        Alert.alert("Sign Up Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Clear error when user starts typing
  const handlePasswordChange = (text) => {
    setPassword(text);
    if (errors.password) {
      setErrors(prev => ({...prev, password: ''}));
    }
    if (errors.confirmPassword && text === confirmPassword) {
      setErrors(prev => ({...prev, confirmPassword: ''}));
    }
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    if (errors.confirmPassword && text === password) {
      setErrors(prev => ({...prev, confirmPassword: ''}));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <LinearGradient colors={["#4DB066", "#2E9B51"]} style={styles.container}>
        {/* Decorative Circles */}
        <LinearGradient
          colors={["#78C6F2", "#C2E5FE"]}
          style={[styles.circle, styles.topCircle]}
        />
        <LinearGradient
          colors={["#78C6F2", "#C2E5FE"]}
          style={[styles.circle, styles.bottomCircle]}
        />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrapper}>
            <View style={styles.content}>
              <Image source={require("../img/Logo.png")} style={styles.logo} />
              <Text style={styles.subtitle}>Create your account</Text>

              {/* Name */}
              <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Full Name"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                  value={name}
                  onChangeText={setName}
                  editable={!loading}
                />
              </View>
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}

              {/* Email */}
              <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Email address"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              {/* Date of Birth */}
              <View style={[styles.inputWrapper, errors.dateOfBirth && styles.inputError]}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Date of Birth (YYYY-MM-DD)"
                  placeholderTextColor="#999"
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                  editable={!loading}
                />
              </View>
              {errors.dateOfBirth && (
                <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
              )}

              {/* Password */}
              <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={password}
                  onChangeText={handlePasswordChange}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.iconWrapper}
                  onPress={() => setShowPassword((s) => !s)}
                  disabled={loading}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={22}
                    color="#555"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              {/* Confirm Password */}
              <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Confirm password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.iconWrapper}
                  onPress={() => setShowConfirmPassword((s) => !s)}
                  disabled={loading}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={22}
                    color="#555"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}

              {/* Sign Up Button */}
              <TouchableOpacity
                style={[
                  styles.signUpButton,
                  (!name || !email || !password || !confirmPassword || !dateOfBirth || loading) && 
                  styles.signUpButtonDisabled
                ]}
                onPress={handleSignUp}
                disabled={!name || !email || !password || !confirmPassword || !dateOfBirth || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.signUpButtonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              {/* Back to Login */}
              <TouchableOpacity onPress={() => navigation.navigate("Login")} disabled={loading}>
                <Text style={[styles.bottomLink, loading && styles.disabledLink]}>
                  Already have an account? Log In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

// ... (styles remain the same) ...
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  contentWrapper: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  content: { width: "100%", maxWidth: 640, alignItems: "center" },
  logo: {
    width: width * 0.6,
    height: width * 0.4,
    resizeMode: "contain",
    marginBottom: 15,
  },
  subtitle: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#fff",
    width: "100%",
  },
  inputError: {
    borderColor: "#e74c3c",
  },
  input: { 
    height: 50, 
    paddingHorizontal: 10, 
    fontSize: 16,
  },
  iconWrapper: { paddingHorizontal: 10 },
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
    marginBottom: 10,
    alignSelf: "flex-start",
    width: "100%",
  },
  signUpButton: {
    backgroundColor: "#2E86AB",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  signUpButtonDisabled: {
    backgroundColor: "#6c757d",
  },
  signUpButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  bottomLink: { 
    marginTop: 20, 
    color: "#fff", 
    fontSize: 16,
    textDecorationLine: "underline",
  },
  disabledLink: {
    opacity: 0.5,
  },
  circle: {
    position: "absolute",
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width,
    opacity: 0.3,
  },
  topCircle: { top: -width * 0.8, left: -width * 0.4 },
  bottomCircle: { bottom: -width * 0.8, right: -width * 0.4 },
});

export default SignUpScreen;