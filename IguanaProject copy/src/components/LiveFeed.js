import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const STREAM_URL = 'https://feed.iguanafeed.com/stream';

export default function LiveFeed({ style, onConnectionChange }) {
  const [connected, setConnected] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Periodically check if the MJPEG stream is reachable
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(STREAM_URL, { method: 'HEAD' });
        setConnected(res.ok);
        onConnectionChange?.(res.ok);

        // Reload WebView if connection was restored
        if (res.ok) setReloadKey(k => k + 1);
      } catch {
        setConnected(false);
        onConnectionChange?.(false);
      }
    };

    check(); // initial check
    const interval = setInterval(check, 5000); // every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, style]}>
      {connected ? (
        <WebView
          key={reloadKey}
          source={{ uri: STREAM_URL }}
          style={{ flex: 1 }}

          // Anti-lag WebView settings
          cacheEnabled={false}
          incognito={true}
          javaScriptEnabled={false}
          domStorageEnabled={false}
          mixedContentMode="always"
          setSupportMultipleWindows={false}
          overScrollMode="never"
          scalesPageToFit={false}

          onError={() => setConnected(false)}
          onHttpError={() => setConnected(false)}
        />
      ) : (
        <View style={styles.blackScreen} />
      )}

      {/* LIVE badge in corner */}
      <View style={styles.liveBadge}>
        <View
          style={[styles.redDot, { backgroundColor: connected ? 'red' : 'gray' }]}
        />
        <Text style={styles.liveText}>LIVE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative', backgroundColor: '#101826' },
  blackScreen: { flex: 1, backgroundColor: 'black' },
  liveBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  redDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  liveText: { color: 'white', fontWeight: '700', fontSize: 12 },
});
