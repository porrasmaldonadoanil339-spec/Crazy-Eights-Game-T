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
