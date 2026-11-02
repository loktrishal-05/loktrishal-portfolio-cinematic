export function motionPolicy({ reducedMotion = false, saveData = false, width = 1280 } = {}) {
  const motion = !reducedMotion;
  return { webgl: motion && !saveData, smooth: motion && width > 800, pinned: motion && width > 800 };
}
