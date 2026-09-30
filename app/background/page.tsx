"use client";
import { GatedPage } from "@/components/study/StudyShell";
import { useT } from "@/lib/i18n/client";
import { BackgroundForm } from "@/components/study/OnboardingForms";

export default function BackgroundPage() {
  const t = useT();
  return (
    <GatedPage stage="background">
      {(db) => (
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-semibold">{t.background.title}</h1>
          <p className="mt-1 text-sm text-muted">{t.background.intro} {t.background.participantId}: <span className="font-mono">{db.participant.id}</span></p>
          <div className="card mt-5 p-6"><BackgroundForm initial={db.participant.background} /></div>
        </div>
      )}
    </GatedPage>
  );
}
