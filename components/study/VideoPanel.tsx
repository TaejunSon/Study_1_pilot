"use client";
import { useRef } from "react";
import { studyConfig } from "@/data/studyConfig";
import { useT } from "@/lib/i18n/client";

/** Large video panel with a replay control. The video loops so the situation stays visible during the whole trial. */
export function VideoPanel({ src, targetObject }: { src: string; targetObject: string }) {
  const t = useT();
  const ref = useRef<HTMLVideoElement>(null);
  const replay = () => { const v = ref.current; if (!v) return; v.currentTime = 0; void v.play(); };
  return (
    <div className="card overflow-hidden">
      <video
        ref={ref}
        src={src}
        className="aspect-[4/3] w-full bg-black"
        controls
        loop={studyConfig.video.loop}
        muted={studyConfig.video.muted}
        autoPlay={studyConfig.video.autoplay}
        playsInline
        preload="auto"
        aria-label={t.trial.videoAria(t.objects[targetObject] ?? targetObject)}
      />
      <div className="flex items-center justify-between px-4 py-2 text-sm">
        <span className="text-muted">{t.trial.imagine}</span>
        <button type="button" className="btn-secondary !py-1" onClick={replay}>{t.trial.replayVideo}</button>
      </div>
    </div>
  );
}
