import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cancelIncident, getIncident } from './api';

function Step({ done, active, title, detail }) {
  return (
    <View style={styles.step}>
      <View style={[styles.dot, done && styles.dotDone, active && !done && styles.dotActive]}>
        {active && !done ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.dotText}>{done ? '✓' : ''}</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.stepTitle}>{title}</Text>
        {detail ? <Text style={styles.stepDetail}>{detail}</Text> : null}
      </View>
    </View>
  );
}

export default function SosActiveScreen({ incident: initial, sendError, onRetry, onClose }) {
  const insets = useSafeAreaInsets();
  const [inc, setInc] = useState(initial);
  useEffect(() => setInc(initial), [initial]);
  const sending = !inc.id;

  useEffect(() => {
    if (!initial.id) return undefined;
    const id = setInterval(() => getIncident(initial.id).then(setInc).catch(() => {}), 1000);
    return () => clearInterval(id);
  }, [initial.id]);

  const a = inc.ambulance;
  const acked = !!inc.ackAt;
  const closed = inc.status === 'RESOLVED' || inc.status === 'CANCELLED';
  const ambDetail = {
    REQUESTING: `Contacting partners (attempt ${a.attempts.length})…`,
    DISPATCHED: `${a.partner} · ${a.vehicle}\nETA ${a.eta} min → ${a.hospital}`,
    ARRIVED: `${a.partner} has arrived`,
    NOT_REQUESTED: 'Not requested',
    FAILED: 'Safety Desk is calling 112 for you',
  }[a.status];

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>{closed ? 'Help request closed' : 'Help is on the way'}</Text>
        <Text style={styles.headerSub}>{inc.id ?? 'Sending SOS…'} · Stay where you are if it’s safe</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {sendError && (
          <Pressable style={styles.err} onPress={onRetry}>
            <Text style={styles.errText}>Network issue. Tap to retry, or call 112 below.</Text>
          </Pressable>
        )}
        <Step done={!sending} active={sending} title={sending ? 'Sharing location & ride…' : 'Location & ride shared'} detail={`${inc.captain.name} · ${inc.captain.vehicle} (Captain on hold)`} />
        <Step done={inc.contactsNotified.length > 0} active={sending} title="Emergency contacts alerted" detail={inc.contactsNotified.map((c) => c.name).join(', ') || (sending ? 'Alerting…' : 'None saved')} />
        <Step done={acked} active={!acked} title={acked ? `${inc.agent} is calling you` : 'Connecting to Safety Desk'}
          detail={acked ? `Responded in ${Math.round((inc.ackAt - inc.createdAt) / 1000)}s` : `Escalation level: ${inc.escalation.replace('_', ' ')}`} />
        <Step done={a.status === 'DISPATCHED' || a.status === 'ARRIVED'} active={a.status === 'REQUESTING'} title="Ambulance" detail={ambDetail} />

        <Pressable style={[styles.btn, styles.call]} onPress={() => Linking.openURL('tel:112')}>
          <Text style={styles.btnText}>Call 112 directly</Text>
        </Pressable>
        {!closed && (
          <Pressable style={[styles.btn, styles.ok]} onPress={() => (sending ? onClose() : cancelIncident(inc.id).then(setInc).catch(() => {}))}>
            <Text style={[styles.btnText, { color: '#111' }]}>I’m okay, cancel ambulance</Text>
          </Pressable>
        )}
        {closed && (
          <Pressable style={[styles.btn, styles.ok]} onPress={onClose}>
            <Text style={[styles.btnText, { color: '#111' }]}>Back to ride</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  err: { backgroundColor: '#FDECEC', borderRadius: 10, padding: 12, marginBottom: 16 },
  errText: { color: '#9B1C1C', fontWeight: '700' },
  header: { backgroundColor: '#d9363e', paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '900' },
  headerSub: { color: '#ffe', marginTop: 4 },
  step: { flexDirection: 'row', gap: 14, marginBottom: 20, alignItems: 'flex-start' },
  dot: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: '#2e9e44' },
  dotActive: { backgroundColor: '#f0a020' },
  dotText: { color: '#fff', fontWeight: '900' },
  stepTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  stepDetail: { color: '#555', marginTop: 2 },
  btn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 12 },
  call: { backgroundColor: '#111' },
  ok: { backgroundColor: '#eee' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
