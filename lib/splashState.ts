let _splashComplete = false;
let _listeners: Array<() => void> = [];

export const isSplashComplete = (): boolean => _splashComplete;

export const markSplashComplete = (): void => {
  if (_splashComplete) return;
  _splashComplete = true;
  _listeners.forEach(fn => fn());
  _listeners = [];
};

export const onSplashComplete = (cb: () => void): (() => void) => {
  if (_splashComplete) {
    cb();
    return () => {};
  }
  _listeners.push(cb);
  return () => { _listeners = _listeners.filter(fn => fn !== cb); };
};

// Task #119 — fine-grained gate for the BIYIS PRIME STUDIOS intro phase so
// the AudioManager can defer the menu music start until the cinematic logo
// has begun fading out. This lets the boot stinger play in clean silence and
// then crossfades into the menu loop, instead of having menu music slam on
// top of the studio logo from the very first frame.
let _studioActive = false;
let _studioEndListeners: Array<() => void> = [];

export const isStudioPhaseActive = (): boolean => _studioActive;

export const markStudioPhaseStart = (): void => {
  _studioActive = true;
};

export const markStudioPhaseEnd = (): void => {
  if (!_studioActive) return;
  _studioActive = false;
  _studioEndListeners.forEach(fn => fn());
  _studioEndListeners = [];
};

export const onStudioPhaseEnd = (cb: () => void): (() => void) => {
  if (!_studioActive) {
    cb();
    return () => {};
  }
  _studioEndListeners.push(cb);
  return () => { _studioEndListeners = _studioEndListeners.filter(fn => fn !== cb); };
};
