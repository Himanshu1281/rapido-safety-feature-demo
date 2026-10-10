import { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { C } from '../theme';

const Pin = ({ color }) => (
  <View style={[styles.pin, { borderColor: color }]}><View style={[styles.pinDot, { backgroundColor: color }]} /></View>
);

const RideMap = forwardRef(function RideMap({ region, route, pickup, drop, vehicle, style, bottomInset = 0 }, ref) {
  return (
    <MapView
      ref={ref}
      style={[StyleSheet.absoluteFill, style]}
      initialRegion={region}
      showsCompass={false}
      showsMyLocationButton={false}
      toolbarEnabled={false}
      mapPadding={{ top: 80, bottom: bottomInset, left: 20, right: 20 }}
    >
      {route && <Polyline coordinates={route} strokeColor={C.navy} strokeWidth={4} />}
      {pickup && <Marker coordinate={{ latitude: pickup.lat, longitude: pickup.lng }} anchor={{ x: 0.5, y: 0.5 }}><Pin color={C.green} /></Marker>}
      {drop && <Marker coordinate={{ latitude: drop.lat, longitude: drop.lng }} anchor={{ x: 0.5, y: 0.5 }}><Pin color={C.red} /></Marker>}
      {vehicle && (
        <Marker coordinate={vehicle} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <View style={styles.vehicle}><Text style={{ fontSize: 20 }}>🏍️</Text></View>
        </Marker>
      )}
    </MapView>
  );
});

export default RideMap;

const styles = StyleSheet.create({
  pin: { width: 18, height: 18, borderRadius: 9, borderWidth: 3, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  pinDot: { width: 6, height: 6, borderRadius: 3 },
  vehicle: { backgroundColor: C.yellow, borderRadius: 18, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
});
