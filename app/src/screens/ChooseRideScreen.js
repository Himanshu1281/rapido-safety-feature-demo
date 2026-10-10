import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RideMap from '../components/RideMap';
import SheetEnter from '../components/SheetEnter';
import { DROP, PICKUP, RIDE_OPTIONS, ROUTE } from '../data';
import { C, shadow } from '../theme';

const REGION = { latitude: 17.4418, longitude: 78.3678, latitudeDelta: 0.035, longitudeDelta: 0.035 };

export default function ChooseRideScreen({ onBack, onBook }) {
  const insets = useSafeAreaInsets();
  const [sel, setSel] = useState('bike');
  const opt = RIDE_OPTIONS.find((o) => o.id === sel);

  return (
    <View style={{ flex: 1 }}>
      <RideMap region={REGION} route={ROUTE} pickup={PICKUP} drop={DROP} bottomInset={470} />

      <View style={[styles.top, { top: insets.top + 8 }]}>
        <Pressable style={styles.back} onPress={onBack}><Text style={{ fontSize: 20 }}>‹</Text></Pressable>
        <View style={styles.route}>
          <Text numberOfLines={1} style={styles.routeText}><Text style={{ color: C.green }}>● </Text>{PICKUP.title}</Text>
          <Text numberOfLines={1} style={styles.routeText}><Text style={{ color: C.red }}>● </Text>{DROP.title}</Text>
        </View>
      </View>

      <SheetEnter style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
        {RIDE_OPTIONS.map((o) => {
          const active = o.id === sel;
          return (
            <Pressable key={o.id} onPress={() => setSel(o.id)} style={[styles.opt, active && styles.optActive]}>
              <Text style={{ fontSize: active ? 34 : 28, width: 44 }}>{o.icon}</Text>
              <View style={{ flex: 1 }}>
                <View style={styles.row}>
                  <Text style={[styles.name, active && { fontSize: 18 }]}>{o.name}</Text>
                  <Text style={styles.seats}>👤{o.seats}</Text>
                  {o.tag && <Text style={styles.tag}>{o.tag}</Text>}
                </View>
                {active && o.desc && <Text style={styles.sub}>{o.desc}</Text>}
                <Text style={styles.sub}>{o.eta} min away • Drop {o.drop}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.price}>₹{o.price}</Text>
                {o.was && <Text style={styles.was}>₹{o.was}</Text>}
              </View>
            </Pressable>
          );
        })}

        <View style={styles.safety}>
          <Text style={{ fontSize: 14 }}>🛡️</Text>
          <Text style={styles.safetyText}>Crash Protection included · Insured ride</Text>
        </View>

        <View style={styles.payRow}>
          <View style={styles.pay}><Text>💵</Text><Text style={styles.payText}>Cash</Text><Text style={styles.chev}>›</Text></View>
          <View style={styles.divider} />
          <View style={styles.pay}><Text>🏷️</Text><Text style={styles.payText}>Offers</Text><Text style={styles.chev}>›</Text></View>
        </View>

        <Pressable style={styles.book} onPress={() => onBook(opt)}>
          <Text style={styles.bookText}>Book {opt.name}</Text>
        </Pressable>
      </SheetEnter>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', gap: 10, alignItems: 'center' },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow },
  route: { flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, gap: 2, ...shadow },
  routeText: { fontSize: 13, fontWeight: '600', color: C.text },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 10, paddingHorizontal: 12, ...shadow },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1.5, borderColor: 'transparent' },
  optActive: { borderColor: C.navy, paddingVertical: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontWeight: '700', fontSize: 16, color: C.text },
  seats: { fontSize: 12, color: C.sub },
  tag: { fontSize: 10, fontWeight: '800', color: C.green, backgroundColor: C.greenSoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sub: { color: C.sub, fontSize: 13, marginTop: 1 },
  price: { fontWeight: '800', fontSize: 17, color: C.text },
  was: { color: C.sub, fontSize: 12, textDecorationLine: 'line-through' },
  safety: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.greenSoft, borderRadius: 8, padding: 8, marginTop: 6 },
  safetyText: { color: C.green, fontWeight: '700', fontSize: 13 },
  payRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: C.line, marginTop: 10, paddingVertical: 12 },
  pay: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 6 },
  payText: { flex: 1, fontWeight: '600', fontSize: 15 },
  chev: { fontSize: 20, color: C.sub },
  divider: { width: 1, height: 24, backgroundColor: C.line },
  book: { backgroundColor: C.yellow, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  bookText: { fontWeight: '800', fontSize: 17, color: C.text },
});
