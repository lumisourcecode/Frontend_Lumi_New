import { useMemo, useState } from "react";
import { Alert, View } from "react-native";
import * as Haptics from "expo-haptics";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { useAuth } from "@/providers/AuthProvider";
import { applyMptpFareRules } from "@/lib/mptp";
import { getSupabase } from "@/lib/supabase";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Divider } from "@/components/ui/Divider";
import { MapBackdrop } from "@/components/ui/MapBackdrop";
import { Pill } from "@/components/ui/Pill";

export default function RiderHomeScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [scheduledAtText, setScheduledAtText] = useState("");

  const [wheelchair, setWheelchair] = useState(false);
  const [serviceAnimal, setServiceAnimal] = useState(false);
  const [doorAssist, setDoorAssist] = useState(false);
  const [recurring, setRecurring] = useState(false);

  const [planManagerEmail, setPlanManagerEmail] = useState("");
  const [supportCategory, setSupportCategory] = useState("Transport");
  const [liftingFee, setLiftingFee] = useState("0");
  const [baseFare, setBaseFare] = useState("75");
  const [mptpEligible, setMptpEligible] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const pricing = useMemo(() => {
    const numericFare = Number(baseFare || "0");
    return applyMptpFareRules({ baseFare: Number.isFinite(numericFare) ? numericFare : 0, cardEligible: mptpEligible });
  }, [baseFare, mptpEligible]);

  async function createBooking() {
    if (!user) return;
    if (!pickup.trim() || !dropoff.trim()) {
      Alert.alert("Missing details", "Add pickup and drop-off to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const scheduledAt =
        scheduledAtText.trim().length > 0 ? new Date(scheduledAtText).toISOString() : new Date().toISOString();

      const supabase = getSupabase();
      const { error } = await supabase.from("bookings").insert({
        rider_id: user.id,
        pickup,
        dropoff,
        scheduled_at: scheduledAt,
        recurring,
        mobility: { wheelchair, serviceAnimal, doorAssist },
        plan_manager_email: planManagerEmail.trim() || null,
        support_category: supportCategory,
        lifting_fee: Number(liftingFee || "0") || 0,
        mptp_eligible: mptpEligible,
        base_fare: Number(baseFare || "0") || 0,
        status: "pending_matching",
      });

      if (error) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Booking failed", error.message);
        return;
      }

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Booking created", "Status: pending matching. You can view it in Trips.");
      setStep(1);
      setPickup("");
      setDropoff("");
      setScheduledAtText("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View className="flex-1 bg-slate-950">
      <MapBackdrop subtitle="Where are you going today?" />

      <BottomSheet>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-[18px] font-bold text-slate-900">Book a ride</Text>
            <Text tone="muted" className="mt-1">
              Step {step} of 3
            </Text>
          </View>
          <View className="rounded-2xl bg-slate-50 px-3 py-2">
            <Text className="text-[12px] font-semibold text-slate-700">NDIS $8,900 left</Text>
          </View>
        </View>

        <Divider className="my-4" />

        {step === 1 ? (
          <View className="gap-3">
            <Input value={pickup} onChangeText={setPickup} placeholder="Pickup" />
            <Input value={dropoff} onChangeText={setDropoff} placeholder="Destination" />
            <Input
              value={scheduledAtText}
              onChangeText={setScheduledAtText}
              placeholder="When (optional, e.g. 2026-02-20 14:30)"
              autoCapitalize="none"
            />
            <Text tone="muted">
              Tip: In Phase 2 this becomes one-tap recent locations + Google Places.
            </Text>
          </View>
        ) : null}

        {step === 2 ? (
          <View className="gap-3">
            <View className="flex-row flex-wrap gap-2">
              <Pill on={recurring} label="Recurring" onPress={() => setRecurring((v) => !v)} />
              <Pill on={wheelchair} label="Wheelchair" onPress={() => setWheelchair((v) => !v)} />
              <Pill on={serviceAnimal} label="Service animal" onPress={() => setServiceAnimal((v) => !v)} />
              <Pill on={doorAssist} label="Door-to-door" onPress={() => setDoorAssist((v) => !v)} />
            </View>
            <Card tone="muted">
              <Text className="font-semibold">Mobility notes</Text>
              <Text tone="muted" className="mt-1">
                These tags flow to the driver manifest and compliance logs.
              </Text>
            </Card>
          </View>
        ) : null}

        {step === 3 ? (
          <View className="gap-3">
            <Input
              value={planManagerEmail}
              onChangeText={setPlanManagerEmail}
              placeholder="Plan Manager Email"
              autoCapitalize="none"
            />
            <Input
              value={supportCategory}
              onChangeText={setSupportCategory}
              placeholder="Support Category (e.g. Transport)"
            />
            <Input value={liftingFee} onChangeText={setLiftingFee} placeholder="Lifting Fee ($)" keyboardType="numeric" />

            <Divider className="my-1" />

            <Input value={baseFare} onChangeText={setBaseFare} placeholder="Base fare ($)" keyboardType="numeric" />
            <Pill on={mptpEligible} label="MPTP eligible (VIC)" onPress={() => setMptpEligible((v) => !v)} />

            <Card tone="muted">
              <Text>Subsidy applied: ${pricing.subsidy.toFixed(2)}</Text>
              <Text className="mt-1 text-[18px] font-bold text-slate-900">
                Rider pays: ${pricing.riderPayable.toFixed(2)}
              </Text>
            </Card>
          </View>
        ) : null}

        <View className="mt-4 flex-row gap-2">
          <View className="flex-1">
            <Button
              variant="outline"
              title={step === 1 ? "Cancel" : "Back"}
              onPress={() => setStep((s) => (s === 1 ? 1 : ((s - 1) as 1 | 2 | 3)))}
            />
          </View>
          <View className="flex-1">
            {step < 3 ? (
              <Button
                title="Continue"
                onPress={() => {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setStep((s) => ((s + 1) as 1 | 2 | 3));
                }}
              />
            ) : (
              <Button title={submitting ? "Creating…" : "Confirm ride"} disabled={submitting} onPress={createBooking} />
            )}
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}

