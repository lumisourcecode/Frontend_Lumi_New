import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  PanResponder,
  type PanResponderInstance,
  type ViewStyle,
  useWindowDimensions,
  View,
} from "react-native";

import { cn } from "@/lib/cn";

type Props = {
  snapPoints?: number[]; // 0..1 (fraction of screen height), last is most expanded
  initialSnapIndex?: number;
  children: React.ReactNode;
};

export function BottomSheet({ snapPoints = [0.28, 0.6, 0.88], initialSnapIndex = 1, children }: Props) {
  const { height } = useWindowDimensions();
  const snapsPx = useMemo(() => snapPoints.map((p) => Math.round(height * p)), [height, snapPoints]);
  const maxSnap = snapsPx[snapsPx.length - 1] ?? Math.round(height * 0.8);
  const minSnap = snapsPx[0] ?? Math.round(height * 0.25);

  // translateY = how far DOWN from fully expanded (0..maxSnap-minSnap)
  const expandedTop = height - maxSnap;
  const collapsedTop = height - minSnap;
  const travel = collapsedTop - expandedTop;

  const translateY = useRef(new Animated.Value(travel * (1 - (snapsPx[initialSnapIndex] ?? maxSnap) / maxSnap))).current;
  const last = useRef<number>(0);

  useEffect(() => {
    translateY.setValue(collapsedTop - (height - (snapsPx[initialSnapIndex] ?? maxSnap)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  const panResponder: PanResponderInstance = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gesture) => Math.abs(gesture.dy) > 6,
        onPanResponderGrant: () => {
          translateY.stopAnimation((value) => {
            last.current = value;
          });
        },
        onPanResponderMove: (_evt, gesture) => {
          const next = clamp(last.current + gesture.dy, 0, travel);
          translateY.setValue(next);
        },
        onPanResponderRelease: (_evt, gesture) => {
          const velocity = gesture.vy;
          translateY.stopAnimation((value) => {
            const next = nearestSnap(value, snapsToTravel(snapsPx, height));
            // velocity bias
            const biased = velocity > 0.75 ? Math.min(travel, next + travel * 0.22) : velocity < -0.75 ? Math.max(0, next - travel * 0.22) : next;
            const finalSnap = nearestSnap(biased, snapsToTravel(snapsPx, height));
            Animated.spring(translateY, {
              toValue: finalSnap,
              useNativeDriver: true,
              tension: 70,
              friction: 14,
            }).start(() => {
              last.current = finalSnap;
            });
          });
        },
      }),
    [height, snapsPx, translateY, travel],
  );

  const sheetStyle = useMemo<ViewStyle>(
    () => ({
      transform: [
        {
          translateY: translateY.interpolate({
            inputRange: [0, travel],
            outputRange: [0, travel],
            extrapolate: "clamp",
          }),
        },
      ],
    }),
    [translateY, travel],
  );

  return (
    <Animated.View
      style={[{ position: "absolute", left: 0, right: 0, top: expandedTop, bottom: 0 }, sheetStyle]}
      className={cn("rounded-t-3xl bg-white shadow-2xl")}
    >
      <View
        className="items-center pb-2 pt-3"
        {...panResponder.panHandlers}
        accessibilityRole="adjustable"
        accessibilityLabel="Bottom sheet"
      >
        <View className="h-1.5 w-12 rounded-full bg-slate-200" />
      </View>
      <View className="flex-1 px-4 pb-6">{children}</View>
    </Animated.View>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function nearestSnap(value: number, snaps: number[]) {
  let best = snaps[0] ?? 0;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const s of snaps) {
    const d = Math.abs(value - s);
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }
  return best;
}

function snapsToTravel(snapsPx: number[], height: number) {
  const maxSnap = snapsPx[snapsPx.length - 1] ?? Math.round(height * 0.8);
  const minSnap = snapsPx[0] ?? Math.round(height * 0.25);
  const expandedTop = height - maxSnap;
  const collapsedTop = height - minSnap;
  const travel = collapsedTop - expandedTop;
  // travel value = collapsedTop - (height - snapPx)
  return snapsPx.map((snap) => clamp(collapsedTop - (height - snap), 0, travel));
}

