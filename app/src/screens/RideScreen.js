import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RideMap from '../components/RideMap';
import SheetEnter from '../components/SheetEnter';
import { CAPTAIN, DROP, PICKUP, RIDER, ROUTE } from '../data';
import SafetyLayer from '../features/safety/SafetyLayer';
import SafetyToolkitSheet from '../features/safety/SafetyToolkitSheet';
import { C, shadow } from '../theme';

const REGION = { latitude: 17.4418, longitude: 78.3678, latitudeDelta: 0.035, longitudeDelta: 0.035 };
const ARRIVE_MS = 6000;
const STEP_MS = 1200;

// Densify route so the bike glides instead of jumping
const PATH = ROUTE.flatMap((p, i) => {
  const n = ROUTE[i + 1];
  if (!n) return [p];
  return [0, 0.25, 0.5, 0.75].map((f) => ({
    latitude: p.latitude + (n.latitude - p.latitude) * f,
    longitude: p.longitude + (n.longitude - p.longitude) * f,
  }));
});
const START = { latitude: PICKUP.lat - 0.004, longitude: PICKUP.lng + 0.004 };

export default function RideScreen({ option, onDone }) {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState('arriving'); // arriving | onride | done
  const [idx, setIdx] = useState(0);
  const [toolkit, setToolkit] = useState(false);
  const [crashOn, setCrashOn] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setPhase('onride'), ARRIVE_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== 'onride') return undefined;
    const t = setInterval(() => setIdx((i) => Math.min(i + 1, PATH.length - 1)), STEP_MS);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (idx === PATH.length - 1) setPhase('done');
  }, [idx]);

  const vehicle = phase === 'arriving' ? START : PATH[idx];
  const minsLeft = Math.max(1, Math.round(((PATH.length - 1 - idx) * 14) / PATH.length));
  const ride = useMemo(() => ({
    id: 'RIDE-88213', rider: RIDER, captain: CAPTAIN,
    location: { lat: vehicle.latitude, lng: vehicle.longitude },
  }), [vehicle]);

  return (
    <SafetyLayer ride={ride} crashDetection={crashOn}>
      {({ triggerSos, simulateCrash }) => (
        <View style={{ flex: 1 }}>
          <RideMap region={REGION} route={ROUTE} pickup={PICKUP} drop={DROP} vehicle={vehicle} bottomInset={400} />

          <View style={[styles.top, { top: insets.top + 8 }]}>
            <View style={styles.status}>
              <Text style={styles.statusText}>
                {phase === 'arriving' ? 'Captain arriving in 2 min' : phase === 'onride' ? `On ride · ${minsLeft} min to drop` : 'You have arrived'}
              </Text>
            </View>
            <Pressable style={styles.shield} onPress={() => setToolkit(true)}>
              <Text style={{ fontSize: 16 }}>🛡️</Text>
              <Text style={styles.shieldText}>Safety</Text>
            </Pressable>
          </View>

          <Pressable style={[styles.sosFab, { bottom: 420 }]} onLongPress={() => triggerSos('manual')} delayLongPress={1200} onPress={() => setToolkit(true)}>
            <Text style={styles.sosFabText}>SOS</Text>
          </Pressable>

          <SheetEnter style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
            {phase === 'arriving' ? (
              <View style={styles.pinRow}>
                <Text style={styles.pinLabel}>Share PIN with Captain</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {CAPTAIN.pin.split('').map((d, i) => <Text key={i} style={styles.pinBox}>{d}</Text>)}
                </View>
              </View>
            ) : (
              <View style={styles.trip}>
                <Text style={styles.tripText}>Drop at <Text style={{ fontWeight: '800' }}>{DROP.title}</Text></Text>
                <Text style={styles.tripSub}>{phase === 'done' ? 'Ride complete' : `ETA ${minsLeft} min`}</Text>
              </View>
            )}

            <View style={styles.captain}>
              <View style={styles.avatar}><Text style={{ fontSize: 26 }}>👨🏽</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.plate}>{CAPTAIN.vehicle}</Text>
                <Text style={styles.bike}>{CAPTAIN.bike}</Text>
                <Text style={styles.name}>{CAPTAIN.name} · ★ {CAPTAIN.rating} · {CAPTAIN.rides} rides</Text>
              </View>
              <View style={styles.score}>
                <Text style={styles.scoreNum}>{CAPTAIN.safetyScore}</Text>
                <Text style={styles.scoreLbl}>Safety</Text>
              </View>
            </View>

            <View style={styles.actions}>
              {[['📞', 'Call'], ['💬', 'Chat'], ['📍', 'Share ride'], ['🛡️', 'Safety']].map(([i, l]) => (
                <Pressable key={l} style={styles.action} onPress={l === 'Safety' ? () => setToolkit(true) : undefined}>
                  <View style={styles.actionIcon}><Text style={{ fontSize: 18 }}>{i}</Text></View>
                  <Text style={styles.actionText}>{l}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.footer}>
              <Text style={styles.fare}>{option.icon} {option.name} · ₹{option.price} · Cash</Text>
              {phase === 'done' && <Pressable onPress={onDone}><Text style={styles.done}>Done</Text></Pressable>}
            </View>
          </SheetEnter>

          <SafetyToolkitSheet
            visible={toolkit} onClose={() => setToolkit(false)}
            onSos={triggerSos} onSimulateCrash={simulateCrash}
            crashOn={crashOn} setCrashOn={setCrashOn} contacts={RIDER.emergencyContacts}
          />
        </View>
      )}
    </SafetyLayer>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  status: { flex: 1, backgroundColor: C.navy, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, ...shadow },
  statusText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  shield: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 9, ...shadow },
  shieldText: { fontWeight: '800', color: C.blue },
  sosFab: { position: 'absolute', right: 16, width: 56, height: 56, borderRadius: 28, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff', ...shadow },
  sosFabText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 16, gap: 14, ...shadow },
  pinRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pinLabel: { fontWeight: '700', fontSize: 15, color: C.text },
  pinBox: { width: 32, height: 38, lineHeight: 38, textAlign: 'center', fontWeight: '800', fontSize: 18, backgroundColor: C.yellowSoft, borderRadius: 8, overflow: 'hidden' },
  trip: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tripText: { fontSize: 15, color: C.text },
  tripSub: { color: C.green, fontWeight: '700' },
  captain: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: C.yellowSoft, alignItems: 'center', justifyContent: 'center' },
  plate: { alignSelf: 'flex-start', fontWeight: '800', fontSize: 15, borderWidth: 1.5, borderColor: C.text, borderRadius: 5, paddingHorizontal: 6, letterSpacing: 0.5 },
  bike: { color: C.sub, fontSize: 13, marginTop: 3 },
  name: { color: C.text, fontSize: 13, fontWeight: '600', marginTop: 1 },
  score: { alignItems: 'center', backgroundColor: C.greenSoft, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  scoreNum: { fontWeight: '900', fontSize: 18, color: C.green },
  scoreLbl: { fontSize: 10, color: C.green, fontWeight: '700' },
  actions: { flexDirection: 'row', justifyContent: 'space-around' },
  action: { alignItems: 'center', gap: 4 },
  actionIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.chip, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 12, fontWeight: '600', color: C.text },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: C.line, paddingTop: 12 },
  fare: { fontWeight: '700', color: C.text },
  done: { fontWeight: '800', color: C.blue, fontSize: 15 },
});
