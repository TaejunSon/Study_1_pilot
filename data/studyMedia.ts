/**
 * Where the 18 scene clips are served from.
 *
 * The clips come from Ego4D, EPIC-KITCHENS and HOT3D, whose licenses do not allow redistribution, so they are NOT
 * committed to this repository and NOT published with the GitHub Pages site. Host them somewhere you control and
 * point this base URL at that host; only the URL lives in git.
 *
 * Set it at build time with NEXT_PUBLIC_VIDEO_BASE_URL (the deploy workflow forwards the repository variable of the
 * same name), e.g.
 *     NEXT_PUBLIC_VIDEO_BASE_URL=https://media.example.ac.kr/gesture-study/videos
 * Each scene is then loaded from <base>/<scene id>.mp4.
 *
 * Leave it empty to load /videos/<id>.mp4 from the site itself — only useful for a local run where you have dropped
 * the clips into public/videos/ (which .gitignore keeps out of the repository).
 */
export const VIDEO_BASE_URL = (process.env.NEXT_PUBLIC_VIDEO_BASE_URL ?? "").replace(/\/+$/, "");

/**
 * A project site is served under /<repo>/, and a plain `src` string is not rewritten for us the way next/link and
 * next/image are, so the in-repo fallback has to carry the base path itself.
 */
const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

export function videoUrl(sceneId: string): string {
  return VIDEO_BASE_URL ? `${VIDEO_BASE_URL}/${sceneId}.mp4` : `${BASE_PATH}/videos/${sceneId}.mp4`;
}

/** True when the build has no external host configured, so the operator can be warned instead of seeing black boxes. */
export const usingLocalVideos = VIDEO_BASE_URL === "";
