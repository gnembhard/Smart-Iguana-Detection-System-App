// src/hooks/useNotifications.js
import { useState, useEffect, useRef } from "react";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from "firebase/firestore";

export function useNotifications() {
  const [currentNotifications, setCurrentNotifications] = useState([]);
  const [notificationHistory, setNotificationHistory] = useState([]);
  const alertedIds = useRef(new Set());

  // Firestore real-time listener for notifications
  useEffect(() => {
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Separate new (unalerted) notifications
      const newNotifs = allNotifs.filter(n => !alertedIds.current.has(n.id));
      newNotifs.forEach(n => alertedIds.current.add(n.id));

      if (newNotifs.length > 0) {
        setCurrentNotifications(prev => [...newNotifs, ...prev]);
      }

      // Store all read or seen notifications
      const readNotifs = allNotifs.filter(n => alertedIds.current.has(n.id));
      setNotificationHistory(readNotifs);
    });

    return () => unsubscribe();
  }, []);

  // Clear all notifications
  const clearNotifications = async () => {
    try {
      for (const n of currentNotifications) {
        const docRef = doc(db, "notifications", n.id);
        await deleteDoc(docRef);
      }
      setCurrentNotifications([]);
    } catch (err) {
      console.error("Error clearing notifications:", err);
    }
  };

  // Delete a single notification by ID
  const deleteNotification = async (id) => {
    try {
      const docRef = doc(db, "notifications", id);
      await deleteDoc(docRef);
      setCurrentNotifications(prev => prev.filter(n => n.id !== id));
      setNotificationHistory(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  return {
    currentNotifications,
    notificationHistory,
    clearNotifications,
    deleteNotification,
  };
}
