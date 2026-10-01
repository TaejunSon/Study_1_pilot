import type { GestureDef, GestureFamily } from "@/types/study";

/**
 * The 14-gesture catalog. The ORDER OF THIS ARRAY is the fixed card order used everywhere in the study: each family
 * runs tap, double tap, the four directions, circle, so the two read as counterparts.
 *
 * `number` is the card's position here and nothing else. The decision contract has its own numbering, which these
 * deliberately no longer match - recommendations are stored by gesture ID, so the two can differ safely, and
 * renumbering the contract would change the adopted prompt and invalidate every stored recommendation.
 * To add a demonstration asset, drop a file in public/gestures/ and set demoAsset: "/gestures/<file>".
 * Supported: .gif, .png, .jpg, .webp (image) and .mp4, .webm (video, looped and muted).
 */
export const GESTURE_FAMILIES: Record<GestureFamily, { label: string; definition: string }> = {
  OPS: {
    label: "On-object thumb gesture (OPS)",
    definition: "The thumb moves on the surface of the held object while the object stays still.",
  },
  OC: {
    label: "Object-motion gesture (OC)",
    definition: "The whole held object moves slightly and returns while the grasp does not change.",
  },
};

export const gestures: GestureDef[] = [
  { id: "OPS_TAP",         family: "OPS", number: 1,  label: "Thumb tap",         description: "Tap the object's surface once with the thumb." },
  { id: "OPS_DOUBLE_TAP",  family: "OPS", number: 2,  label: "Thumb double tap",  description: "Tap the object's surface twice quickly with the thumb." },
  { id: "OPS_SWIPE_UP",    family: "OPS", number: 3,  label: "Thumb swipe up",    description: "Slide the thumb upward along the object's surface." },
  { id: "OPS_SWIPE_DOWN",  family: "OPS", number: 4,  label: "Thumb swipe down",  description: "Slide the thumb downward along the object's surface." },
  { id: "OPS_SWIPE_LEFT",  family: "OPS", number: 5,  label: "Thumb swipe left",  description: "Slide the thumb to the left along the object's surface." },
  { id: "OPS_SWIPE_RIGHT", family: "OPS", number: 6,  label: "Thumb swipe right", description: "Slide the thumb to the right along the object's surface." },
  { id: "OPS_CIRCLE",      family: "OPS", number: 7,  label: "Thumb circle",      description: "Draw a small circle with the thumb on the object's surface." },
  { id: "OC_TAP",          family: "OC",  number: 8,  label: "Object tap",        description: "Make one short tap-like movement with the whole object, then return." },
  { id: "OC_DOUBLE_TAP",   family: "OC",  number: 9,  label: "Object double tap", description: "Make two quick tap-like movements with the whole object, then return." },
  { id: "OC_TILT_UP",      family: "OC",  number: 10, label: "Tilt object up",    description: "Tilt the held object slightly upward, then return." },
  { id: "OC_TILT_DOWN",    family: "OC",  number: 11, label: "Tilt object down",  description: "Tilt the held object slightly downward, then return." },
  { id: "OC_TILT_LEFT",    family: "OC",  number: 12, label: "Tilt object left",  description: "Tilt the held object slightly to the left, then return." },
  { id: "OC_TILT_RIGHT",   family: "OC",  number: 13, label: "Tilt object right", description: "Tilt the held object slightly to the right, then return." },
  { id: "OC_CIRCLE",       family: "OC",  number: 14, label: "Object circle",     description: "Move the whole object in a small circle, then return." },
];

export const gestureById = Object.fromEntries(gestures.map((g) => [g.id, g])) as Record<GestureDef["id"], GestureDef>;
