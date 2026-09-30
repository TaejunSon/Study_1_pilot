# Clips are not stored here

The 18 study clips (and `practice_mug.mp4`) come from **Ego4D**, **EPIC-KITCHENS** and **HOT3D**. Their licenses do
not permit redistribution, so they are git-ignored and are never published with the site.

**For the deployed study**, host them somewhere you control and set the repository variable
`NEXT_PUBLIC_VIDEO_BASE_URL` to that location. Each scene is loaded from `<base>/<scene id>.mp4`, with the ids
listed in [`data/scenes.ts`](../../data/scenes.ts).

**For a local run**, drop the files into this folder as `<scene id>.mp4` and build without
`NEXT_PUBLIC_VIDEO_BASE_URL`; they will be served from the site itself. This folder stays out of git either way.
