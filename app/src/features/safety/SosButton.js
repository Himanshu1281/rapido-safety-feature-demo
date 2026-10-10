import { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, Vibration, View } from 'react-native';

const HOLD_MS = 1500; // hold-to-trigger avoids accidental pocket presses

export default function SosButton({ onTrigger }) {
  const progress = useRef(new Animated.Value(0)).current;
  const [holding, setHolding] = useState(false);

  const start = () => {
    setHolding(true);
    Vibration.vibrate(50);
    Animated.timing(progress, { toValue: 1, duration: HOLD_MS, useNativeDriver: false }).start(({ finished }) => {
      if (finished) {
        Vibration.vibrate([0, 200, 100, 200]);
        onTrigger();
      }
      progress.setValue(0);
      setHolding(false);
    });
  };
  const stop = () => {
    progress.stopAnimation();
    progress.setValue(0);
    setHolding(false);
  };

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Pressable onPressIn={start} onPressOut={stop} style={styles.btn} accessibilityRole="button" accessibilityLabel="Emergency SOS. Press and hold.">
      <Animated.View style={[styles.fill, { width }]} />
      <View style={styles.row}>
        <Text style={styles.icon}>SOS</Text>
        <Text style={styles.label}>{holding ? 'Keep holding…' : 'Hold for emergency help'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { height: 56, borderRadius: 28, backgroundColor: '#d9363e', overflow: 'hidden', justifyContent: 'center' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#8c0e14' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  icon: { color: '#fff', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
  label: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
