import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import {
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import useAuthStore from "../store/authStore";

// ✅ Cloudinary configuration
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/degdgxeef/image/upload";
const UPLOAD_PRESET = "IguanaCatcher";

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { user, setUser, logout } = useAuthStore();

  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔄 Initialize from authStore user data - this is the key fix
  useEffect(() => {
    console.log("User data in EditProfileScreen:", user);
    if (user) {
      setName(user.displayName || "");
      setDateOfBirth(user.dateOfBirth || "");
      setProfileImage(user.photoURL || null);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      if (auth.currentUser) {
        // Update Firebase Auth
        await updateProfile(auth.currentUser, {
          displayName: name,
          photoURL: profileImage,
        });

        // Update Firestore with ALL user data
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, {
          displayName: name,
          profileImage: profileImage,
          dateOfBirth: dateOfBirth,
          updatedAt: new Date(),
        });

        // Update Zustand with ALL user data
        const updatedUser = {
          ...user,
          displayName: name,
          photoURL: profileImage,
          dateOfBirth: dateOfBirth,
        };
        setUser(updatedUser);

        setIsEditing(false);
        Alert.alert("✅ Success", "Profile updated successfully!");
      }
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("❌ Error", error.message);
    }
  };

  const handleCancel = () => {
    // Reset to current user data from authStore
    setName(user?.displayName || "");
    setProfileImage(user?.photoURL || null);
    setDateOfBirth(user?.dateOfBirth || "");
    setIsEditing(false);
  };

  // 📸 Pick & upload to Cloudinary
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setLoading(true);
        const uri = result.assets[0].uri;

        const formData = new FormData();
        formData.append("file", {
          uri,
          type: "image/jpeg",
          name: "profile.jpg",
        });
        formData.append("upload_preset", UPLOAD_PRESET);

        const response = await axios.post(CLOUDINARY_URL, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const imageUrl = response.data.secure_url;

        // Update local state immediately
        setProfileImage(imageUrl);

        // Update Firebase Auth
        await updateProfile(auth.currentUser, { 
          photoURL: imageUrl 
        });

        // Update Firestore
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, { 
          profileImage: imageUrl,
          updatedAt: new Date()
        });

        // Update Zustand store
        const updatedUser = {
          ...user,
          photoURL: imageUrl
        };
        setUser(updatedUser);

        Alert.alert("✅ Success", "Profile picture updated!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("❌ Error", "Failed to pick/upload image.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) {
      Alert.alert("❌ Error", "No email found for this account.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert(
        "📩 Password Reset",
        "A password reset link has been sent to your email."
      );
    } catch (error) {
      Alert.alert("❌ Error", error.message);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            logout();
            navigation.navigate("Login");
          } catch (error) {
            Alert.alert("Logout Error", error.message);
          }
        },
      },
    ]);
  };

  return (
    <LinearGradient colors={["#4DB066", "#2E9B51"]} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: "transparent", paddingTop: 40 }}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Profile Picture */}
          <View style={styles.header}>
            <TouchableOpacity onPress={pickImage} disabled={loading}>
              <Image
                source={
                  profileImage
                    ? { uri: profileImage }
                    : { uri: "https://placehold.co/100x100/2E86AB/white?text=U" }
                }
                style={styles.profileImage}
              />
              <Text style={styles.changePhotoText}>
                {loading ? "Uploading..." : "Change Photo"}
              </Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                />
              ) : (
                <View style={styles.readOnlyField}>
                  <Text style={styles.readOnlyText}>{name || "No name set"}</Text>
                  <TouchableOpacity onPress={() => setIsEditing(true)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText}>{user?.email || "No email"}</Text>
              </View>
            </View>

            {/* Password Reset */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity
                style={styles.changePasswordButton}
                onPress={handlePasswordReset}
              >
                <Text style={styles.changePasswordText}>Change Password</Text>
              </TouchableOpacity>
            </View>

            {/* DOB */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                  placeholder="YYYY-MM-DD"
                />
              ) : (
                <View style={styles.readOnlyField}>
                  <Text style={styles.readOnlyText}>
                    {dateOfBirth || "Not set"}
                  </Text>
                  <TouchableOpacity onPress={() => setIsEditing(true)}>
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {isEditing && (
              <View style={styles.editButtons}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

// ... (styles remain the same) ...
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  header: { alignItems: "center", marginBottom: 30 },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "white",
  },
  changePhotoText: {
    textAlign: "center",
    color: "white",
    marginTop: 8,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginTop: 10,
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8, color: "#495057" },
  readOnlyField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f8f9fa",
  },
  readOnlyText: { fontSize: 16, color: "#495057" },
  input: {
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
  },
  changePasswordButton: { alignSelf: "flex-start", marginTop: 8 },
  changePasswordText: { color: "#2E86AB", fontSize: 14, fontWeight: "600" },
  editText: { color: "#2E86AB", fontWeight: "600" },
  editButtons: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  saveButton: {
    backgroundColor: "#2E86AB",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 10,
  },
  saveButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  cancelButton: {
    backgroundColor: "#6c757d",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 10,
  },
  cancelButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  logoutButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#c0392b",
  },
  logoutButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default EditProfileScreen;