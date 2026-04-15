let _splashComplete = false;
export const isSplashComplete = (): boolean => _splashComplete;
export const markSplashComplete = (): void => { _splashComplete = true; };
