// src/screens/NotificationScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Modal, Image, Alert, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../hooks/useNotifications';

const icons = {
  cat: 'paw-outline',
  iguana: 'leaf-outline',
  default: 'alert-circle-outline',
};

// Notification card component
const NotificationCard = ({ type, message, onDelete }) => {
  const iconName = icons[type] || icons.default;

  return (
    <View style={styles.card}>
      <Ionicons name={iconName} size={28} color="#333" style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{type?.toUpperCase() || 'EVENT'}</Text>
        <Text style={styles.cardMessage}>{message}</Text>
      </View>
      {onDelete && (
        <Pressable onPress={onDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={22} color="red" />
        </Pressable>
      )}
    </View>
  );
};

export default function NotificationScreen() {
  const { currentNotifications, notificationHistory, clearNotifications, deleteNotification } =
    useNotifications();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Pop-up notification state
  const [popupNotification, setPopupNotification] = useState(null);
  const popupAnim = useState(new Animated.Value(-100))[0]; // offscreen at top

  // Open image in modal
  const openImage = (imgBase64) => {
    if (!imgBase64) return;
    setSelectedImage(`data:image/jpeg;base64,${imgBase64}`);
    setModalVisible(true);
  };

  // Clear all notifications
  const handleClearAll = () => {
    Alert.alert(
      "Clear All Notifications",
      "Mark all notifications as read?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: () => clearNotifications() },
      ]
    );
  };

  // Delete individual notification
  const handleDelete = (id) => {
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => deleteNotification(id),
        },
      ]
    );
  };

  // Show pop-up when a new notification arrives
  useEffect(() => {
    if (currentNotifications.length > 0) {
      const latest = currentNotifications[0]; // newest notification
      setPopupNotification(latest);

      // Animate slide down
      Animated.timing(popupAnim, {
        toValue: 20,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto dismiss after 4s
      const timer = setTimeout(() => {
        Animated.timing(popupAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setPopupNotification(null));
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [currentNotifications]);

  const renderItem = ({ item }) => (
    <Pressable onPress={() => item.image && openImage(item.image)}>
      <NotificationCard
        type={item.type}
        message={item.message}
        onDelete={() => handleDelete(item.id)}
      />
    </Pressable>
  );

  return (
    <LinearGradient colors={['#4DB066', '#2E9B51']} style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Notifications</Text>
        <Pressable onPress={handleClearAll} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={28} color="#fff" />
        </Pressable>
      </View>

      {/* Current Notifications */}
      <Text style={styles.sectionTitle}>Current Notifications</Text>
      <FlatList
        data={currentNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No new detections</Text>}
      />

      {/* Notification History */}
      <Text style={styles.sectionTitle}>Notification History</Text>
      <FlatList
        data={notificationHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No history yet</Text>}
      />

      {/* Modal to view images */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable
          style={styles.modalBackground}
          onPress={() => {
            setModalVisible(false);
            setSelectedImage(null);
          }}
        >
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </Pressable>
      </Modal>

      {/* Pop-up notification */}
      {popupNotification && (
        <Animated.View style={[styles.popupCard, { transform: [{ translateY: popupAnim }] }]}>
          <Text style={styles.popupTitle}>{popupNotification.type?.toUpperCase() || 'EVENT'}</Text>
          <Text style={styles.popupMessage}>{popupNotification.message}</Text>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, marginTop: 20 },
  header: { fontSize: 22, fontWeight: 'bold', color: '#fff', lineHeight: 28 },
  clearButton: { padding: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 15, marginBottom: 10, color: '#fff' },
  card: { flexDirection: 'row', backgroundColor: '#E6E6E6', borderRadius: 12, padding: 15, marginBottom: 12, alignItems: 'center' },
  icon: { marginRight: 12 },
  textContainer: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4, color: '#000' },
  cardMessage: { fontSize: 14, color: '#333' },
  deleteButton: { marginLeft: 10 },
  emptyText: { fontSize: 14, color: '#fff', fontStyle: 'italic', textAlign: 'center', marginVertical: 10 },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalImage: { width: '90%', height: '70%', borderRadius: 12 },

  // Pop-up notification styles
  popupCard: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  popupTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  popupMessage: { fontSize: 14 },
});
