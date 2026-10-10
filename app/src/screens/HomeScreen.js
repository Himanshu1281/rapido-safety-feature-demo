import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RideMap from '../components/RideMap';
import SheetEnter from '../components/SheetEnter';
import { PICKUP, RECENTS, SERVICES } from '../data';
import { C, shadow } from '../theme';

const REGION = { latitude: PICKUP.lat, longitude: PICKUP.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 };

export default function HomeScreen({ onSearch }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
      <RideMap region={REGION} pickup={PICKUP} bottomInset={420} />

      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <View style={styles.menu}><Text style={{ fontSize: 18 }}>☰</Text></View>
        <View style={styles.brand}><Text style={styles.brandText}>rapido</Text></View>
        <View style={styles.menu}><Text style={{ fontSize: 16 }}>🛡️</Text></View>
      </View>

      <SheetEnter style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable style={styles.search} onPress={onSearch}>
          <View style={styles.dot} />
          <Text style={styles.searchText}>Where are you going?</Text>
        </Pressable>

        <ScrollView showsVerticalScrollIndicator={false}>
          {RECENTS.map((r) => (
            <Pressable key={r.title} style={styles.recent} onPress={onSearch}>
              <View style={styles.clock}><Text>🕘</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.recentTitle}>{r.title}</Text>
                <Text style={styles.recentSub}>{r.sub}</Text>
              </View>
              <Text style={styles.heart}>♡</Text>
            </Pressable>
          ))}

          <Text style={styles.h}>Explore</Text>
          <View style={styles.services}>
            {SERVICES.map((s) => (
              <Pressable key={s.id} style={styles.service} onPress={onSearch}>
                <Text style={{ fontSize: 30 }}>{s.icon}</Text>
                <Text style={styles.serviceText}>{s.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.banner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>New: Crash Protection</Text>
              <Text style={styles.bannerSub}>Auto crash detection, 2-min safety callback and ambulance on every ride.</Text>
            </View>
            <Text style={{ fontSize: 36 }}>🚑</Text>
          </View>
        </ScrollView>
      </SheetEnter>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16 },
  menu: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...shadow },
  brand: { backgroundColor: C.yellow, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, ...shadow },
  brandText: { fontWeight: '900', fontSize: 18, color: C.text, letterSpacing: -0.5 },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 440, backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 16, ...shadow },
  search: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.chip, borderRadius: 12, padding: 16, marginBottom: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.red },
  searchText: { fontSize: 17, fontWeight: '600', color: C.text },
  recent: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line },
  clock: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.chip, alignItems: 'center', justifyContent: 'center' },
  recentTitle: { fontWeight: '700', fontSize: 15, color: C.text },
  recentSub: { color: C.sub, fontSize: 13 },
  heart: { fontSize: 20, color: C.sub },
  h: { fontWeight: '800', fontSize: 17, marginTop: 18, marginBottom: 10, color: C.text },
  services: { flexDirection: 'row', justifyContent: 'space-between' },
  service: { width: '23%', aspectRatio: 1, backgroundColor: C.chip, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 4 },
  serviceText: { fontWeight: '600', fontSize: 13 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, backgroundColor: C.navy, borderRadius: 16, padding: 16 },
  bannerTitle: { color: C.yellow, fontWeight: '800', fontSize: 16 },
  bannerSub: { color: '#fff', marginTop: 4, fontSize: 13 },
});
