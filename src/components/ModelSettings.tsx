import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define props for the component
interface ModelSettingsProps {
  activePriceTab: string; // e.g., 'all', 'low', 'mid', 'high', 'custom', 'none'
  setActivePriceTab: (tab: string) => void;
  displayMode: string; // e.g., 'both', 'input', 'output', 'combined'
  setDisplayMode: (mode: string) => void;
}

export function ModelSettings({
  activePriceTab,
  setActivePriceTab,
  displayMode,
  setDisplayMode,
}: ModelSettingsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
      {/* Price Range Filter */}
      <div>
        <h3 className="text-sm font-medium mb-2 text-muted-foreground">Price Range</h3>
        {/* Note: The hook now sets activePriceTab to 'custom' or 'none'
                for manual selections. The Tabs component might not visually reflect
                this unless we add specific triggers or handle it differently.
                For now, it controls setting the predefined ranges. */}
        <Tabs value={activePriceTab} onValueChange={setActivePriceTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="low">Low</TabsTrigger>
            <TabsTrigger value="mid">Mid</TabsTrigger>
            <TabsTrigger value="high">High</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Display Mode */}
      <div>
        <h3 className="text-sm font-medium mb-2 text-muted-foreground">Chart Display</h3>
        <Tabs value={displayMode} onValueChange={setDisplayMode}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="both">Both</TabsTrigger>
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
            <TabsTrigger value="combined">Combined</TabsTrigger>
            <TabsTrigger value="value">Value</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}