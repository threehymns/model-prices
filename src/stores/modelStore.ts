import { atom } from "nanostores";
import type { ModelData } from "@/hooks/useModelData";
import type { SortingState } from "@tanstack/react-table";

interface ModelStore {
  allModels: ModelData[];
  selectedModels: Set<string>;
  activePriceTab: string;
  displayMode: string;
  sorting: SortingState;
}

export const modelStore = atom<ModelStore>({
  allModels: [],
  selectedModels: new Set(),
  activePriceTab: "all",
  displayMode: "both",
  sorting: [{ id: "Combined", desc: false }],
});

// Actions to update the store
export const setAllModels = (models: ModelData[]) => {
  modelStore.set({ ...modelStore.get(), allModels: models });
};

export const setSelectedModels = (models: string[] | Set<string>) => {
  const newSet = models instanceof Set ? models : new Set(models);
  modelStore.set({ ...modelStore.get(), selectedModels: newSet, activePriceTab: "custom" });
};

export const toggleModelSelection = (modelName: string) => {
  const current = modelStore.get();
  const newSet = new Set(current.selectedModels);
  if (newSet.has(modelName)) {
    newSet.delete(modelName);
  } else {
    newSet.add(modelName);
  }
  modelStore.set({
    ...current,
    selectedModels: newSet,
    activePriceTab: "custom",
  });
};

export const selectAllModels = () => {
  const current = modelStore.get();
  const allModelNames = new Set(
    current.allModels.map((item: ModelData) => item.Name),
  );
  modelStore.set({
    ...current,
    selectedModels: allModelNames,
    activePriceTab: "all",
  });
};

export const deselectAllModels = () => {
  modelStore.set({
    ...modelStore.get(),
    selectedModels: new Set(),
    activePriceTab: "none",
  });
};

export const setActivePriceTab = (tab: string) => {
  const current = modelStore.get();
  let newSelectedModels = new Set(current.selectedModels); // Keep current selection by default

  // Use pre-calculated values instead of recalculating
  const priceRanges = {
    low: new Set(
      current.allModels
        .filter((item: ModelData) => (item.inputPrice || 0) < 1)
        .map((item: ModelData) => item.Name),
    ),
    mid: new Set(
      current.allModels
        .filter(
          (item: ModelData) =>
            (item.inputPrice || 0) >= 1 && (item.inputPrice || 0) < 10,
        )
        .map((item: ModelData) => item.Name),
    ),
    high: new Set(
      current.allModels
        .filter((item: ModelData) => (item.inputPrice || 0) >= 10)
        .map((item: ModelData) => item.Name),
    ),
  };

  switch (tab) {
    case "low":
      newSelectedModels = priceRanges.low;
      break;
    case "mid":
      newSelectedModels = priceRanges.mid;
      break;
    case "high":
      newSelectedModels = priceRanges.high;
      break;
    case "all":
      newSelectedModels = new Set(
        current.allModels.map((item: ModelData) => item.Name),
      );
      break;
    case "custom": // Handle custom selection (from toggleModelSelection)
      // No change to newSelectedModels, it's already set by toggleModelSelection
      break;
    default:
      // Keep current selection
      break;
  }

  modelStore.set({
    ...current,
    activePriceTab: tab,
    selectedModels: newSelectedModels,
  });
};

export const setDisplayMode = (mode: string) => {
  modelStore.set({ ...modelStore.get(), displayMode: mode });
};

export const setSorting = (
  sorting: SortingState | ((prev: SortingState) => SortingState),
) => {
  if (typeof sorting === "function") {
    const current = modelStore.get();
    const newSorting = sorting(current.sorting);
    modelStore.set({
      ...current,
      sorting: newSorting,
    });
  } else {
    modelStore.set({ ...modelStore.get(), sorting });
  }
};
