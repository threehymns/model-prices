import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@nanostores/react";
import { modelStore, setActivePriceTab, setDisplayMode } from "../stores/modelStore";

export function ModelSettings() {
  const { activePriceTab, displayMode } = useStore(modelStore);

  return (
    <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
      {/* Price Range Filter */}
      <div>
        <h3 className="text-sm font-medium mb-2 text-muted-foreground">Price Range</h3>
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