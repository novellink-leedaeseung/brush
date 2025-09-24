// global.d.ts
export {};

declare global {
  interface Window {
    electronAPI?: {
      appQuit: () => Promise<any> | void;
      send?: (channel: string, ...args: any[]) => void;
      on?: (channel: string, listener: (...args: any[]) => void) => void;
    };
  }
}
