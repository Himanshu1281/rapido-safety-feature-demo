import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/** Persistent screen sheet that springs up from below on mount. */
export default function SheetEnter({ style, children }) {
  const y = useRef(new Animated.Value(400)).current;
  useEffect(() => {
    Animated.spring(y, { toValue: 0, damping: 24, stiffness: 200, useNativeDriver: true }).start();
  }, [y]);
  return <Animated.View style={[style, { transform: [{ translateY: y }] }]}>{children}</Animated.View>;
}
