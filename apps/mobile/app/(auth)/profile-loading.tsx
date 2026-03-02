import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";

export default function ProfileLoading() {
  return (
    <Screen>
      <Card>
        <Text tone="title">Setting up your account…</Text>
        <Text tone="muted" className="mt-2">
          If this page stays for long, your Supabase tables/policies may not be created yet.
          After you paste the `apps/mobile/supabase/schema.sql` into Supabase, restart the app.
        </Text>
      </Card>
    </Screen>
  );
}

