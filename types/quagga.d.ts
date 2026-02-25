declare module "quagga" {
  interface QuaggaConfig {
    inputStream?: {
      name?: string;
      type?: string;
      target?: Element | null;
      constraints?: {
        width?: { min?: number };
        height?: { min?: number };
        facingMode?: string;
        frameRate?: number;
        aspectRatio?: { min?: number; max?: number };
      };
    };
    locator?: {
      patchSize?: string;
      halfSample?: boolean;
    };
    numOfWorkers?: number;
    locate?: boolean;
    frequency?: number;
    decoder?: {
      readers?: string[];
    };
  }

  interface QuaggaResult {
    codeResult: {
      code: string;
    };
  }

  function init(config: QuaggaConfig, callback: (err: Error | null) => void): void;
  function start(): void;
  function stop(): void;
  function onDetected(callback: (result: QuaggaResult) => void): void;
  function offDetected(callback: (result: QuaggaResult) => void): void;

  export = {
    init,
    start,
    stop,
    onDetected,
    offDetected,
  };
}
