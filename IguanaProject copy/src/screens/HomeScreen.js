import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LiveFeed from '../components/LiveFeed';
import EventBadge from '../components/EventBadge';
import useIguanaEvents from '../hooks/useIguanaEvents';

export default function HomeScreen() {
  const { lastEvent, events, refreshEvents } = useIguanaEvents();
  const [connectionState, setConnectionState] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [feedKey, setFeedKey] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [settingTrap, setSettingTrap] = useState(false);
  const [resettingTrap, setResettingTrap] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [trapClosed, setTrapClosed] = useState(false);
  const [recentEventIds, setRecentEventIds] = useState([]);
  const [popupMsg, setPopupMsg] = useState(null);
  const popupAnim = useState(new Animated.Value(-100))[0];

  // === Refresh handler ===
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (refreshEvents) await refreshEvents();
    setFeedKey(prev => prev + 1);
    setRefreshing(false);
  }, [refreshEvents]);

  // === Polling recent events ===
  useEffect(() => {
    const interval = setInterval(async () => {
      if (refreshEvents) {
        const previousIds = events.map(e => e.id);
        await refreshEvents();
        setFeedKey(prev => prev + 1);
        const newEvents = events.filter(e => !previousIds.includes(e.id));
        setRecentEventIds(newEvents.map(e => e.id));
        setTimeout(() => setRecentEventIds([]), 5000);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [events, refreshEvents]);

  // === Show pop-up message ===
  const showPopup = (msg) => {
    setPopupMsg(msg);
    Animated.timing(popupAnim, {
      toValue: 20,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      Animated.timing(popupAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setPopupMsg(null));
    }, 3000);
  };

  // === Manual trap close ===
  const handleSetTrap = async () => {
    Alert.alert(
      'Manual Trap Override',
      'This will close the trap (for cat or iguana). Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            try {
              setSettingTrap(true);
              setStatusMsg('');
              const res = await fetch('http://10.12.216.223:5000/trigger_trap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'trigger' }),
              });
              if (res.ok) {
                setStatusMsg('🪤 Trap closed.');
                setTrapClosed(true);
                showPopup('Trap closed successfully!');
              } else {
                const data = await res.json().catch(() => ({ message: 'Failed' }));
                setStatusMsg('Error: ' + data.message);
                showPopup('Error closing trap: ' + data.message);
              }
            } catch (e) {
              console.error('Set trap error:', e);
              setStatusMsg('Network error connecting to trap');
              showPopup('Network error closing trap');
            } finally {
              setSettingTrap(false);
              setTimeout(() => setStatusMsg(''), 4000);
            }
          },
        },
      ]
    );
  };

  // === Manual trap reset ===
  const handleResetTrap = async () => {
    Alert.alert('Reset Trap', 'Reopen and re-arm the trap?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            setResettingTrap(true);
            setStatusMsg('');
            const res = await fetch('http://10.12.216.223:5000/reset_trap', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'reset' }),
            });
            if (res.ok) {
              setStatusMsg('✅ Trap reset and ready.');
              setTrapClosed(false);
              showPopup('Trap reset successfully!');
            } else {
              const data = await res.json().catch(() => ({ message: 'Failed' }));
              setStatusMsg('Error: ' + data.message);
              showPopup('Error resetting trap: ' + data.message);
            }
          } catch (e) {
            console.error('Reset trap error:', e);
            setStatusMsg('Network error resetting trap');
            showPopup('Network error resetting trap');
          } finally {
            setResettingTrap(false);
            setTimeout(() => setStatusMsg(''), 4000);
          }
        },
      },
    ]);
  };

  return (
    <LinearGradient colors={['#4DB066', '#2E9B51']} style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1, paddingTop: 40 }}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      >
        <Text style={styles.header}>Iguana Trap Monitor</Text>
        <Text style={styles.connection}>
          Connection: {connectionState ? 'CONNECTED' : 'DISCONNECTED'}
        </Text>

        {/* --- Live Feed --- */}
        <Pressable onPress={() => setModalVisible(true)} style={styles.feedContainer}>
          <LiveFeed key={feedKey} style={{ flex: 1 }} onConnectionChange={setConnectionState} />
        </Pressable>

        {/* --- Trap Control --- */}
        <View style={styles.overrideContainer}>
          {!trapClosed ? (
            <Pressable
              style={({ pressed }) => [
                styles.overrideButton,
                pressed && { opacity: 0.7 },
                settingTrap && { backgroundColor: '#2E7D32' },
              ]}
              onPress={handleSetTrap}
              disabled={settingTrap}
            >
              {settingTrap ? <ActivityIndicator color="#fff" /> : <Text style={styles.overrideText}>Set Trap (Manual)</Text>}
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.resetButton,
                pressed && { opacity: 0.7 },
                resettingTrap && { backgroundColor: '#BF360C' },
              ]}
              onPress={handleResetTrap}
              disabled={resettingTrap}
            >
              {resettingTrap ? <ActivityIndicator color="#fff" /> : <Text style={styles.overrideText}>Reset Trap</Text>}
            </Pressable>
          )}
          {statusMsg ? <Text style={styles.statusMsg}>{statusMsg}</Text> : null}
        </View>

        {/* --- Latest Event --- */}
        {lastEvent && (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.subHeader}>Latest Event</Text>
            <EventBadge event={lastEvent} large highlight={recentEventIds.includes(lastEvent.id)} />
          </View>
        )}

        {/* --- Recent Activity --- */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.subHeader}>Recent Activity</Text>
          {events.slice().reverse().slice(0, 10).map((e, idx) => (
            <EventBadge key={idx} event={e} highlight={recentEventIds.includes(e.id)} />
          ))}
          {events.length === 0 && (
            <Text style={{ color: '#E8F5E9' }}>No events yet. Detections and trap closures will appear here.</Text>
          )}
        </View>
      </ScrollView>

      {/* --- Live Feed Modal --- */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
          <LiveFeed key={feedKey} style={{ flex: 1 }} onConnectionChange={setConnectionState} />
        </View>
      </Modal>

      {/* --- Popup for trap actions --- */}
      {popupMsg && (
        <Animated.View style={[styles.popupCard, { transform: [{ translateY: popupAnim }] }]}>
          <Text style={styles.popupText}>{popupMsg}</Text>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { color: 'white', fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subHeader: { color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  connection: { color: '#E8F5E9', marginBottom: 16 },
  feedContainer: { width: '100%', aspectRatio: 4 / 3, borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  overrideContainer: { alignItems: 'center', marginBottom: 16 },
  overrideButton: { backgroundColor: '#43A047', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  resetButton: { backgroundColor: '#E64A19', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  overrideText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  statusMsg: { color: '#E8F5E9', marginTop: 8, fontSize: 14 },
  modalContainer: { flex: 1, backgroundColor: '#101826' },
  closeButton: { position: 'absolute', top: 40, right: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 8 },
  closeText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  popupCard: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  popupText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
});
 