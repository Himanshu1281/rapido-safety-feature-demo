import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, Vibration, View } from 'react-native';

const COUNTDOWN = 30;

/**
 * "Are you okay?" check after a detected crash. No answer => auto SOS.
 * Rendered as an in-tree overlay (not a native Modal) so it can never be
 * blocked by another sheet that is still dismissing.
 */
export default function CrashCheckModal({ visible, onOkay, onNeedHelp }) {
  const [left, setLeft] = useState(COUNTDOWN);
  const anim = useRef(new Animated.Value(0)).current;
  const fired = useRef(false);

  useEffect(() => {
    if (!visible) return undefined;
    fired.current = false;
    setLeft(COUNTDOWN);
    anim.setValue(0);
    Animated.spring(anim, { toValue: 1, damping: 18, stiffness: 220, useNativeDriver: true }).start();
    Vibration.vibrate([0, 500, 300], true);
    const id = setInterval(() => setLeft((s) => s - 1), 1000);
    return () => { clearInterval(id); Vibration.cancel(); };
  }, [visible, anim]);

  useEffect(() => {
    if (visible && left <= 0 && !fired.current) {
      fired.current = true;
      onNeedHelp('crash_auto');
    }
  }, [left, visible, onNeedHelp]);

  if (!visible) return null;
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: anim }]}>
      <Animated.View style={[styles.sheet, { transform: [{ scale }] }]}>
        <Text style={styles.title}>Possible accident detected</Text>
        <Text style={styles.sub}>Are you okay? We’ll alert the Safety Desk, your emergency contacts and an ambulance automatically in</Text>
        <Text style={styles.count}>{Math.max(left, 0)}s</Text>
        <Pressable style={[styles.btn, styles.help]} onPress={() => { fired.current = true; onNeedHelp('crash_confirmed'); }}>
          <Text style={styles.btnText}>I need help now</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.ok]} onPress={onOkay}>
          <Text style={[styles.btnText, { color: '#111' }]}>I’m okay</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20, zIndex: 50, elevation: 50 },
  sheet: { backgroundColor: '#fff', borderRadius: 20, padding: 24, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#d9363e', textAlign: 'center' },
  sub: { fontSize: 15, color: '#444', textAlign: 'center', marginTop: 8 },
  count: { fontSize: 64, fontWeight: '900', color: '#111', marginVertical: 12 },
  btn: { alignSelf: 'stretch', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 10 },
  help: { backgroundColor: '#d9363e' },
  ok: { backgroundColor: '#eee' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
});
