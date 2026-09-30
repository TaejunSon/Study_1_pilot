# -*- coding: utf-8 -*-
"""Build the study's stored recommendations from the base-task records.

The web study never calls a model: every recommendation it reveals was precomputed with the adopted v4 contract
(single red-boxed target, 5-rung ladder, code rules A-D) and is baked into the site. This script turns the k-repeat
distribution records into the two files the app ships:

  data/seed/recommendations.json      compact, imported by the app  (scene x command -> gesture)
  provenance/recommendations.full.json   full per-scene evidence; committed for the record but NOT under public/,
                                      so it is never served with the site where a participant could read it

Each command block is one record, because the v4 map is keyed by the command names sent in the call:
  NAV   next_step / previous_step / replay_instruction
  CTRL  confirm_done / undo_cancel / pause_resume
The gesture taken for a command is the MODAL map of the k runs (the same rule the earlier NAV seed used).

    python scripts/build_seed.py                       # uses the records named below
    python scripts/build_seed.py --nav X_dist.json --ctrl Y_dist.json

The records live in the private research repository (vlm_experiments/base_setting/outputs_bench_set) and are not
part of this repository; only their distilled output is committed here.
"""
import argparse, json, os, sys

if hasattr(sys.stdout, "reconfigure"): sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.dirname(HERE)
# the research repo this app was distilled from (…/Scene-aware_grasp_microgesture)
REPO = os.path.dirname(APP)
BS = os.path.join(REPO, "vlm_experiments", "base_setting", "outputs_bench_set")

BLOCKS = {
    "NAV":  ["NEXT_STEP", "PREVIOUS_STEP", "REPLAY_INSTRUCTION"],
    "CTRL": ["CONFIRM_DONE", "UNDO_CANCEL", "PAUSE_RESUME"],
}
DEFAULT_RECORDS = {
    "NAV":  "v4__20260922_214330_dist.json",
    "CTRL": "v4__20260930_162244_dist.json",
}
EXPECTED_SCENES = 18


def load(path):
    if not os.path.exists(path):
        sys.exit("record not found: %s\nRun bench_dist.py on the matching bench_set record first." % path)
    return json.load(open(path, encoding="utf-8"))


def main():
    ap = argparse.ArgumentParser()
    for b in BLOCKS: ap.add_argument("--" + b.lower(), default=os.path.join(BS, DEFAULT_RECORDS[b]))
    ap.add_argument("--model", default="gpt-5.4-mini")
    a = ap.parse_args()

    compact, full = [], {"built_at": None, "contract": "v4", "model": a.model, "blocks": {}}
    settings_path = os.path.join(REPO, "vlm_experiments", "base_setting", "settings.json")
    prompt_sha = json.load(open(settings_path, encoding="utf-8")).get("prompt_sha256", "") if os.path.exists(settings_path) else ""
    prompt_version = "v4-" + prompt_sha[:12] if prompt_sha else "v4"

    for block, commands in BLOCKS.items():
        dist = load(getattr(a, block.lower()))
        rows = dist["target"]
        if len(rows) != EXPECTED_SCENES:
            sys.exit("%s: expected %d target rows, got %d (%s)" % (block, EXPECTED_SCENES, len(rows), dist["record"]))
        k = dist["k"]
        full["blocks"][block] = {"record": dist["record"], "k": k, "commands": commands, "scenes": []}
        for r in rows:
            modal = r["modal_map"]
            if len(modal) != len(commands):
                sys.exit("%s/%s: modal map has %d entries for %d commands" % (block, r["stem"], len(modal), len(commands)))
            for cid, gesture in zip(commands, modal):
                compact.append({
                    "scene_id": r["stem"], "command_id": cid, "block_id": block, "gesture": gesture,
                    "model": a.model, "prompt_version": prompt_version,
                    "modal_map_freq": round(r["modal_map_freq"], 3), "k": k,
                })
            full["blocks"][block]["scenes"].append({
                "scene_id": r["stem"], "grasp_gt": r.get("gt"), "modal_map": modal,
                "modal_map_freq": r["modal_map_freq"], "modal_pair_freq": r.get("modal_pair_freq"),
                "p_survive": r.get("p_survive"), "stable": r.get("stable"), "contested": r.get("contested"),
            })
        print("%-5s %s  k=%d  %d scenes x %d commands" % (block, dist["record"], k, len(rows), len(commands)))

    scenes = {r["scene_id"] for r in compact}
    dupes = len(compact) - len({(r["scene_id"], r["command_id"]) for r in compact})
    if dupes: sys.exit("%d duplicate (scene, command) rows" % dupes)

    seed_dir = os.path.join(APP, "data", "seed"); os.makedirs(seed_dir, exist_ok=True)
    prov_dir = os.path.join(APP, "provenance"); os.makedirs(prov_dir, exist_ok=True)
    json.dump(compact, open(os.path.join(seed_dir, "recommendations.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    json.dump(full, open(os.path.join(prov_dir, "recommendations.full.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print("\n%d rows over %d scenes -> data/seed/recommendations.json" % (len(compact), len(scenes)))
    print("provenance -> provenance/recommendations.full.json (not served with the site)")


if __name__ == "__main__":
    main()
