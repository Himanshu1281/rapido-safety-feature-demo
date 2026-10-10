import { Linking, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import BottomSheet from '../../components/BottomSheet';
import { C } from '../../theme';
import SosButton from './SosButton';

function Tile({ icon, title, sub, onPress, tone = 'default', badge }) {
  const red = tone === 'red';
  return (
    <Pressable onPress={onPress} style={[styles.tile, red && { backgroundColor: '#FDECEC' }]}>
      {badge && <Text style={styles.badge}>{badge}</Text>}
      <Text style={{ fontSize: 26 }}>{icon}</Text>
      <Text style={[styles.tileTitle, red && { color: C.red }]}>{title}</Text>
      <Text style={styles.tileSub}>{sub}</Text>
    </Pressable>
  );
}

export default function SafetyToolkitSheet({ visible, onClose, onSos, onSimulateCrash, crashOn, setCrashOn, contacts }) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12}><Text style={styles.backArrow}>←</Text></Pressable>
          <Text style={styles.title}>Safety toolkit</Text>
        </View>
        <Text style={styles.intro}>At Rapido, your safety comes first. Here are some measures and provisions to ensure your safety.</Text>

        <SosButton onTrigger={() => { onSos('manual'); onClose(); }} />
        <Text style={styles.hint}>Alerts the 24x7 Safety Desk, your emergency contacts and the nearest ambulance with your live location.</Text>

        <View style={styles.crash}>
          <Text style={{ fontSize: 24 }}>💥</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.crashTitle}>Crash detection</Text>
              <Text style={styles.newTag}>NEW</Text>
            </View>
            <Text style={styles.tileSub}>If your phone detects an impact, we check on you and send help if you don’t respond in 30s.</Text>
          </View>
          <Switch value={crashOn} onValueChange={setCrashOn} trackColor={{ true: C.green }} />
        </View>

        <View style={styles.grid}>
          <Tile icon="📍" title="Share live location" sub="Send ride tracking link" onPress={() => {}} />
          <Tile icon="👥" title="Emergency contacts" sub={`${contacts.length} added · auto-alerted on SOS`} onPress={() => {}} />
          <Tile icon="🎧" title="Safety Desk 24x7" sub="Human callback < 2 min" onPress={() => {}} />
          <Tile icon="📞" title="Call 112" sub="Police · Ambulance" tone="red" onPress={() => Linking.openURL('tel:112')} />
        </View>

        <Pressable onPress={() => { onSimulateCrash(); onClose(); }} style={styles.demo}>
          <Text style={styles.demoText}>Demo · simulate a crash on this ride</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#0006' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 18, paddingTop: 8 },
  grab: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: C.line, marginBottom: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 6 },
  backArrow: { fontSize: 22, color: C.text },
  title: { fontSize: 20, fontWeight: '800', color: C.text },
  intro: { color: '#374151', fontSize: 14, marginBottom: 14 },
  hint: { color: C.sub, fontSize: 12, marginTop: 6, marginBottom: 12, textAlign: 'center' },
  crash: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.yellowSoft, borderRadius: 14, padding: 12, marginBottom: 12 },
  crashTitle: { fontWeight: '800', fontSize: 15, color: C.text },
  newTag: { fontSize: 10, fontWeight: '800', color: '#fff', backgroundColor: C.blue, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '48%', flexGrow: 1, backgroundColor: C.chip, borderRadius: 14, padding: 12, gap: 4 },
  tileTitle: { fontWeight: '700', fontSize: 14, color: C.navy },
  tileSub: { color: C.sub, fontSize: 12 },
  badge: { position: 'absolute', right: 8, top: 8, fontSize: 10, fontWeight: '800', color: '#fff', backgroundColor: C.blue, paddingHorizontal: 6, borderRadius: 4 },
  demo: { alignItems: 'center', paddingTop: 14 },
  demoText: { color: C.blue, fontWeight: '600', fontSize: 13 },
});
