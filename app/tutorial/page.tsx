"use client";
import { GatedPage } from "@/components/study/StudyShell";
import { useT } from "@/lib/i18n/client";
import { GestureGrid } from "@/components/study/GestureGrid";
import { ContinueButton } from "@/components/study/OnboardingForms";

export default function TutorialPage() {
  const t = useT();
  return (
    <GatedPage stage="tutorial">
      {() => (
        <div className="mx-auto max-w-[1200px]">
          <h1 className="text-2xl font-semibold">{t.tutorial.title}</h1>
          <div className="mt-2 space-y-1 text-[15px] text-muted">{t.tutorial.body.map((s, i) => <p key={i}>{s}</p>)}</div>
          <div className="card mt-5 p-5"><GestureGrid mode="display" large /></div>
          <div className="mt-5"><ContinueButton from="tutorial" label={t.tutorial.continue} requireAck={t.tutorial.acknowledge} /></div>
        </div>
      )}
    </GatedPage>
  );
}
