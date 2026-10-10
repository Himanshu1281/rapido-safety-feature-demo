import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RideMap from '../components/RideMap';
import SheetEnter from '../components/SheetEnter';
import { PICKUP } from '../data';
import { C, shadow } from '../theme';

const REGION = { latitude: PICKUP.lat, longitude: PICKUP.lng, latitudeDelta: 0.012, longitudeDelta: 0.012 };

export default function SearchingScreen({ option, onFound, onCancel }) {
  const insets = useSafeAreaInsets();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.out(Easing.ease), useNativeDriver: true }));
    loop.start();
    const t = setTimeout(onFound, 3500);
    return () => { loop.stop(); clearTimeout(t); };
  }, [pulse, onFound]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 2.4] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  return (
    <View style={{ flex: 1 }}>
      <RideMap region={REGION} pickup={PICKUP} bottomInset={260} />
      <View pointerEvents="none" style={styles.center}>
        <Animated.View style={[styles.pulse, { transform: [{ scale }], opacity }]} />
      </View>
      <SheetEnter style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={styles.title}>Looking for your {option.name} ride</Text>
        <Text style={styles.sub}>Matching you with Captains rated 4.5+ with a safety score of 80+</Text>
        <View style={styles.bar}><Animated.View style={[styles.barFill, { transform: [{ scaleX: pulse }] }]} /></View>
        <View style={styles.row}>
          <Text style={{ fontSize: 30 }}>{option.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.opt}>{option.name}</Text>
            <Text style={styles.sub}>₹{option.price} · Cash</Text>
          </View>
        </View>
        <Pressable style={styles.cancel} onPress={onCancel}><Text style={styles.cancelText}>Cancel ride</Text></Pressable>
      </SheetEnter>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', paddingBottom: 260 },
  pulse: { width: 160, height: 160, borderRadius: 80, backgroundColor: C.yellow },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 20, ...shadow },
  title: { fontWeight: '800', fontSize: 19, color: C.text },
  sub: { color: C.sub, fontSize: 13, marginTop: 4 },
  bar: { height: 4, backgroundColor: C.chip, borderRadius: 2, overflow: 'hidden', marginVertical: 16 },
  barFill: { height: 4, backgroundColor: C.yellow, width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  opt: { fontWeight: '700', fontSize: 16 },
  cancel: { marginTop: 16, borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  cancelText: { fontWeight: '700', color: C.red },
});
