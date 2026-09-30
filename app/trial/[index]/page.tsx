import { TrialScreen } from "@/components/study/TrialScreen";
import { sceneIds } from "@/data/scenes";

/**
 * Static export needs every trial URL up front. A participant runs one trial per scene, so /trial/1 .. /trial/18
 * covers the whole study; the page itself is a shell and the trial is loaded client-side.
 */
export function generateStaticParams() {
  return sceneIds.map((_, i) => ({ index: String(i + 1) }));
}

export default async function TrialPage({ params }: { params: Promise<{ index: string }> }) {
  const { index } = await params;
  return <TrialScreen stage="trials" order={Number(index)} />;
}
