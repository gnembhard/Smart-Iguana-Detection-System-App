import { create } from 'zustand';

// Create a Zustand store for managing login form state
const useLoginStore = create((set) => ({
  // State variables for email and password
  email: '',
  password: '',

  // Action to update the email field
  setEmail: (email) => set({ email }),
  
  // Action to update the password field
  setPassword: (password) => set({ password }),

  // Action to reset both email and password fields to empty strings
  resetForm: () => set({ email: '', password: '' }),
}));

export default useLoginStore;