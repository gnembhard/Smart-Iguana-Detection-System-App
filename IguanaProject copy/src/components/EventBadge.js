// src/components/EventBadge.js
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EventBadge({ event, large = false }) {
  // Map labels to icons
  const icons = {
    cat: 'paw-outline',
    iguana: 'leaf-outline',
    trap_closed: 'lock-closed-outline',
    trap_opened: 'lock-open-outline',
  };

  // Use event.label if available, otherwise fallback
  const labelKey = event.label?.toLowerCase() || 'heartbeat';

  // Pick icon
  const iconName = icons[labelKey] || 'alert-circle-outline';

  // Determine display text
  const labelText =
    labelKey === 'cat' || labelKey === 'iguana'
      ? `${event.label}${event.confidence != null ? ` (${Math.round(event.confidence * 100)}%)` : ''}`
      : event.label || 'Heartbeat';

  // Format timestamp
  const timeString = event.at ? new Date(event.at).toLocaleString() : '';

  return (
    <View
      style={{
        backgroundColor: '#111827',
        borderWidth: 1,
        borderColor: '#1F2937',
        padding: large ? 16 : 12,
        borderRadius: 14,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Ionicons
        name={iconName}
        size={large ? 24 : 18}
        color="#93C5FD"
        style={{ marginRight: 10 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ color: 'white', fontSize: large ? 16 : 14, fontWeight: '600' }}>
          {labelText}
        </Text>
        {timeString ? (
          <Text style={{ color: '#9AA4B2', marginTop: 2 }}>
            {timeString}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
