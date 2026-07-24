// store/authStore.js
import { create } from "zustand";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const useAuthStore = create((set) => ({
  user: null,

  setUser: (user) => set({ user }),
  
  // Load additional user data from Firestore
  loadUserData: async (firebaseUser) => {
    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(userRef);

      let userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || "",
        photoURL: firebaseUser.photoURL || null,
        dateOfBirth: "",
      };

      if (docSnap.exists()) {
        const firestoreData = docSnap.data();
        console.log("Firestore data loaded:", firestoreData);
        
        userData = {
          ...userData,
          displayName: firestoreData.displayName || userData.displayName,
          photoURL: firestoreData.profileImage || userData.photoURL,
          dateOfBirth: firestoreData.dateOfBirth || userData.dateOfBirth,
        };
      }

      return userData;
    } catch (error) {
      console.log("Using basic user data:", error.message);
      // Return basic user data if Firestore fails
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || "",
        photoURL: firebaseUser.photoURL || null,
        dateOfBirth: "",
      };
    }
  },

  // Sign up with displayName and dateOfBirth 
  signUp: async ({ email, password, displayName, dateOfBirth }) => {
    try {
      // Create user in Firebase Auth 
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update Firebase profile with displayName 
      await updateProfile(userCredential.user, {
        displayName: displayName,
      });

      // Return immediately - Firestore operations happen in background
      const basicUserData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: displayName,
        photoURL: null,
        dateOfBirth: dateOfBirth,
      };

      // Update Zustand with basic data immediately
      set({ user: basicUserData });

      // Firestore operations in background (don't wait for these)
      setTimeout(async () => {
        try {
          const userRef = doc(db, "users", userCredential.user.uid);
          await setDoc(userRef, {
            displayName: displayName,
            email: email,
            profileImage: null,
            dateOfBirth: dateOfBirth,
            createdAt: new Date(),
          });
          console.log("User document created in Firestore (background)");
        } catch (firestoreError) {
          console.log("Background Firestore creation failed:", firestoreError.message);
          // This will be retried on next login via loadUserData
        }
      }, 0);

      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  // Login
  login: async ({ email, password }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Load complete user data from Firestore
      const userData = await useAuthStore.getState().loadUserData(userCredential.user);
      
      console.log("Login - setting user data:", userData);
      set({ user: userData });

      return userCredential.user;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null });
    } catch (error) {
      throw error;
    }
  },
}));

// Keep Zustand in sync with Firebase session and load Firestore data
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      console.log("Auth state changed - user logged in:", user.uid);
      const userData = await useAuthStore.getState().loadUserData(user);
      console.log("Auth state - setting user data:", userData);
      useAuthStore.setState({ user: userData });
    } catch (error) {
      console.log("Auth state - using basic data:", error.message);
      // Fallback to basic user data
      useAuthStore.setState({
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
          photoURL: user.photoURL || null,
          dateOfBirth: "",
        },
      });
    }
  } else {
    console.log("Auth state changed - user logged out");
    useAuthStore.setState({ user: null });
  }
});

export default useAuthStore;