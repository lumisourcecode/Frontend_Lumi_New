import { Card } from "@/components/ui/primitives";

export default function AccessibilityPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Card>
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Accessibility Statement</h1>
        <p className="mt-3 text-sm text-slate-700">
          Lumi follows WCAG 2.1 AA principles with high-contrast visuals, large-text controls,
          clear interaction targets, and keyboard-friendly navigation.
        </p>
      </Card>
    </div>
  );
}
