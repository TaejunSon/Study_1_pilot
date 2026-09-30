"use client";
import { GatedPage } from "@/components/study/StudyShell";
import { useT } from "@/lib/i18n/client";
import { ConsentForm } from "@/components/study/OnboardingForms";

export default function ConsentPage() {
  const t = useT();
  return (
    <GatedPage stage="consent">
      {() => (
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-semibold">{t.consent.title}</h1>
          <div className="card mt-5 space-y-4 p-6 text-[15px] leading-relaxed">
            {t.consent.sections.map((s) => (
              <section key={s.heading}>
                <h2 className="font-semibold">{s.heading}</h2>
                <p className="mt-1">{s.body}</p>
              </section>
            ))}
          </div>
          <div className="card mt-5 p-6"><ConsentForm /></div>
        </div>
      )}
    </GatedPage>
  );
}
