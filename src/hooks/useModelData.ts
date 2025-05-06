import { useState, useEffect, useMemo, useCallback } from "react";
import { parseCsv, formatDollar, calculateCombinedPrice } from "@/lib/utils";
import type { SortingState, Updater } from "@tanstack/react-table"; // Import Updater

// Define the shape of a model item
export interface ModelData {
  Name: string;
  Input: string;
  Output: string;
  Lab: string;
  Slug?: string;
  'Release Date'?: string;
  Selected?: string; // Optional as it might not be present or 'no'
  
  // Server-side calculated fields
  releaseDate?: string;
  formattedReleaseDate?: string;
  inputPrice?: number;
  outputPrice?: number;
  combinedPrice?: number;
  formattedCombinedPrice?: string;
  intelligence?: number;
  value?: number;
  formattedValue?: string;
  labFullName?: string;
  
  // Allow for dynamic properties from CSV
  [key: string]: string | number | undefined;
}

// Define the return type of the hook
interface UseModelDataReturn {
  allModels: ModelData[];
  selectedModels: Set<string>; // Using Set for efficient lookups and updates
  filteredData: ModelData[];
  chartData: any[]; // Define a more specific type later if possible
  activePriceTab: string;
  displayMode: string;
  sorting: SortingState; // Use SortingState type
  isLoading: boolean;
  error: Error | null;
  toggleModelSelection: (modelName: string) => void;
  selectAllModels: () => void;
  deselectAllModels: () => void;
  setActivePriceTab: (tab: string) => void;
  setDisplayMode: (mode: string) => void;
  setSorting: (updater: Updater<SortingState>) => void; // Use Updater type
}

const CSV_PATH = "/model-prices.csv"; // Path relative to the public folder

export function useModelData(): UseModelDataReturn {
  const [allModels, setAllModels] = useState<ModelData[]>([]);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [activePriceTab, setActivePriceTab] = useState<string>("all");
  const [displayMode, setDisplayMode] = useState<string>("both");
  // Initialize sorting state according to SortingState type
  const [sorting, setSorting] = useState<SortingState>([{ id: 'Combined', desc: false }]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(CSV_PATH);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        const parsedData = parseCsv(csvText) as ModelData[]; // Type assertion
        
        // Map release date to a consistent key
        const processedData = parsedData.map(item => ({
          ...item,
          releaseDate: item['Release Date'] || '-'
        }));
        
        setAllModels(processedData);

        // Initialize selected models based on 'Selected' column or default logic
        const initialSelected = new Set(
          processedData
            .filter((item) => !item.Selected || item.Selected !== 'no')
            .map((item) => item.Name)
        );
        setSelectedModels(initialSelected);

      } catch (e) {
        console.error("Failed to fetch or parse model data:", e);
        setError(e instanceof Error ? e : new Error("An unknown error occurred"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Fetch only on mount

  // --- Memoized Price Ranges ---
  const priceRanges = useMemo(() => {
    const low = new Set<string>();
    const mid = new Set<string>();
    const high = new Set<string>();
    allModels.forEach(item => {
        const inputPrice = formatDollar(item.Input);
        if (inputPrice < 1) low.add(item.Name);
        else if (inputPrice >= 1 && inputPrice < 10) mid.add(item.Name);
        else if (inputPrice >= 10) high.add(item.Name);
    });
    return { low, mid, high };
  }, [allModels]);

  // --- State Update Callbacks ---
  const toggleModelSelection = useCallback((modelName: string) => {
    setSelectedModels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modelName)) {
        newSet.delete(modelName);
      } else {
        newSet.add(modelName);
      }
      // Reset active tab if manual selection changes it
      setActivePriceTab("custom"); // Indicate manual/mixed selection state
      return newSet;
    });
  }, []);

  const selectAllModels = useCallback(() => {
    setSelectedModels(new Set(allModels.map(item => item.Name)));
    setActivePriceTab("all");
  }, [allModels]);

  const deselectAllModels = useCallback(() => {
    setSelectedModels(new Set());
    setActivePriceTab("none"); // Indicate no selection
  }, []);

  const updateSelectedByPriceTab = useCallback((tab: string) => {
    setActivePriceTab(tab);
    switch (tab) {
      case "low":
        setSelectedModels(priceRanges.low);
        break;
      case "mid":
        setSelectedModels(priceRanges.mid);
        break;
      case "high":
        setSelectedModels(priceRanges.high);
        break;
      case "all":
      default:
        setSelectedModels(new Set(allModels.map(item => item.Name)));
        break;
    }
  }, [allModels, priceRanges]);

  // Removed handleSetSorting - useState setter matches required type


  // --- Memoized Derived Data ---
  const sortedAllModels = useMemo(() => {
    // If no sorting is applied, return data as is
    if (!sorting || sorting.length === 0) {
      return allModels;
    }

    // Get the current sort column and direction
    const sortRule = sorting[0]; // Assuming single column sorting for now
    const column = sortRule.id;
    const direction = sortRule.desc ? 'desc' : 'asc';

    return [...allModels].sort((a, b) => {
      let comparison = 0;

      switch(column) {
        case 'Name':
          comparison = a.Name.localeCompare(b.Name);
          break;
        case 'Input':
          comparison = formatDollar(a.Input) - formatDollar(b.Input);
          break;
        case 'Output':
          comparison = formatDollar(a.Output) - formatDollar(b.Output);
          break;
        case 'Lab':
           // Handle potential undefined Lab values
           comparison = (a.Lab ?? '').localeCompare(b.Lab ?? '');
           break;
        case 'Combined':
          comparison = calculateCombinedPrice(a.Input, a.Output) - calculateCombinedPrice(b.Input, b.Output);
          break;
        default:
          // Attempt to compare dynamically if column exists, otherwise no sort
          if (a[column] && b[column]) {
              comparison = String(a[column]).localeCompare(String(b[column]));
          } else {
              comparison = 0;
          }
      }
      return direction === 'asc' ? comparison : -comparison;
    });
  }, [allModels, sorting]);

  const chartData = useMemo(() => {
    // Filter data for the chart based on selected models
    return sortedAllModels
      .filter(item => selectedModels.has(item.Name))
      .map(item => {
        const input = formatDollar(item.Input);
        const output = formatDollar(item.Output);
        const combined = calculateCombinedPrice(item.Input, item.Output);
        const intelligence = Number(item['Artificial Analysis Intelligence Index'] || 0);
        const value = combined > 0 ? Number((intelligence / combined).toFixed(2)) : 0;
        
        return {
          name: item.Name,
          Input: input,
          Output: output,
          Combined: combined,
          Value: value,
          // Add other data points for the chart if needed
        };
      });
  }, [sortedAllModels, selectedModels]);


  // --- Return Hook Values ---
  return {
    allModels,
    selectedModels,
    filteredData: sortedAllModels, // Return sorted allModels for the table
    chartData,
    activePriceTab,
    displayMode,
    sorting,
    isLoading,
    error,
    toggleModelSelection,
    selectAllModels,
    deselectAllModels,
    setActivePriceTab: updateSelectedByPriceTab, // Use the combined handler
    setDisplayMode, // Pass through the state setter
    setSorting, // Pass the state setter directly
  };
}