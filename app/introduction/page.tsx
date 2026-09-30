"use client";
import { GatedPage } from "@/components/study/StudyShell";
import { useT } from "@/lib/i18n/client";
import { ContinueButton } from "@/components/study/OnboardingForms";

export default function IntroductionPage() {
  const t = useT();
  return (
    <GatedPage stage="introduction">
      {() => (
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-semibold">{t.introduction.title}</h1>
          <div className="card mt-5 p-6">
            <ul className="list-disc space-y-3 pl-5 text-[15px] leading-relaxed">
              {t.introduction.bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>
          <div className="mt-5"><ContinueButton from="introduction" label={t.introduction.continue} /></div>
        </div>
      )}
    </GatedPage>
  );
}
