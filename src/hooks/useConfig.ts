// useConfig.ts
import { useEffect, useState } from "react";

export interface AppConfig {
  apiBaseUrl: string;
  pageSize: number;
  kioskId: string;
}

export function useConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    fetch("/config.json")
      .then((res) => res.json())
      .then(setConfig);
  }, []);

  return config;
}
