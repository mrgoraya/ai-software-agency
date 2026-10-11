import type Lenis from "lenis";

/**
 * Shared, mutable scroll state. Written by the page's scroll handler and read
 * every frame by the 3D scene, so scrolling never causes React re-renders.
 */
export const scrollState = {
  /** 0..1 progress through the whole page */
  p: 0,
  /** fractional section index: 2.5 is halfway between section 2 and 3 */
  idx: 0,
  /** recent scroll velocity in px per event, decays over time */
  vel: 0,
  lenis: null as Lenis | null,
};
