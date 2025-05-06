import type { ModelData } from "@/hooks/useModelData";

declare global {
  interface Window {
    __INITIAL_DATA__: {
      models: ModelData[];
      selected: string[];
    };
  }
}