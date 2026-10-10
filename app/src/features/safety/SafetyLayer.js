import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Vibration } from 'react-native';
import * as Location from 'expo-location';
import { raiseSos, updateLocation } from './api';
import { useCrashDetection } from './useCrashDetection';
import CrashCheckModal from './CrashCheckModal';
import SosActiveScreen from './SosActiveScreen';

const H = Dimensions.get('window').height;

/**
 * Drop-in safety feature for any in-ride screen.
 * Usage: <SafetyLayer ride={ride}>{({ triggerSos, simulateCrash }) => <RideScreen ... />}</SafetyLayer>
 *
 * SOS is optimistic: the help screen appears instantly; the API call and a
 * precise GPS fix run in the background and stream into the screen.
 */
export default function SafetyLayer({ ride, crashDetection = true, children }) {
  const [checking, setChecking] = useState(false);
  const [incident, setIncident] = useState(null); // local draft until server responds
  const [sendError, setSendError] = useState(false);
  const rideRef = useRef(ride);
  rideRef.current = ride;
  const active = useRef(false);
  const slide = useRef(new Animated.Value(H)).current;

  // Ask for location when the ride starts, never in the middle of an emergency
  useEffect(() => { Location.requestForegroundPermissionsAsync().catch(() => {}); }, []);

  const send = useCallback(async (draft) => {
    setSendError(false);
    try {
      const created = await raiseSos(draft.payload);
      setIncident(created);
      // Refine with a precise fix in the background
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
        .then((pos) => updateLocation(created.id, { lat: pos.coords.latitude, lng: pos.coords.longitude }))
        .catch(() => {});
    } catch {
      setSendError(true);
    }
  }, []);

  const triggerSos = useCallback((trigger = 'manual') => {
    if (active.current) return;
    active.current = true;
    setChecking(false);
    Vibration.vibrate([0, 200, 100, 200]);

    const r = rideRef.current;
    const payload = {
      trigger, location: r.location,
      rider: r.rider, captain: r.captain, ride: { id: r.id },
      emergencyContacts: r.rider.emergencyContacts,
    };
    const draft = {
      id: null, payload, status: 'OPEN', escalation: 'SAFETY_DESK', createdAt: Date.now(),
      ackAt: null, agent: null, captain: r.captain, contactsNotified: [],
      ambulance: { status: 'REQUESTING', attempts: [] },
    };
    setIncident(draft);
    slide.setValue(H);
    Animated.timing(slide, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    send(draft);
  }, [send, slide]);

  const close = useCallback(() => {
    Animated.timing(slide, { toValue: H, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => {
      setIncident(null);
      active.current = false;
    });
  }, [slide]);

  useCrashDetection({ enabled: crashDetection && !incident && !checking, onCrash: () => setChecking(true) });

  return (
    <>
      {children({ triggerSos, simulateCrash: () => setChecking(true) })}
      <CrashCheckModal visible={checking} onOkay={() => setChecking(false)} onNeedHelp={triggerSos} />
      {incident && (
        <Animated.View style={[StyleSheet.absoluteFill, { zIndex: 60, elevation: 60, transform: [{ translateY: slide }] }]}>
          <SosActiveScreen incident={incident} sendError={sendError} onRetry={() => send(incident)} onClose={close} />
        </Animated.View>
      )}
    </>
  );
}
