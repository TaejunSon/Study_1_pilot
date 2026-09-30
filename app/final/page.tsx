"use client";
import { GatedPage } from "@/components/study/StudyShell";
import { useT } from "@/lib/i18n/client";
import { FinalForm } from "@/components/study/OnboardingForms";

export default function FinalPage() {
  const t = useT();
  return (
    <GatedPage stage="final">
      {(db) => (
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-semibold">{t.final.title}</h1>
          <p className="mt-1 text-sm text-muted">{t.final.body}</p>
          <div className="card mt-5 p-6"><FinalForm initial={db.participant.final_questionnaire} /></div>
        </div>
      )}
    </GatedPage>
  );
}
