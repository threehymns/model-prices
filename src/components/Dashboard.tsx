import { useModelData } from "@/hooks/useModelData";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef } from "@tanstack/react-table";
import type { ModelData } from "@/hooks/useModelData";
import { calculateCombinedPrice, getFullLabName, getOpenRouterLabSlug, loadLabData } from "@/lib/utils";
import { ModelPriceChart } from "./ModelPriceChart";
import { ModelSettings } from "./ModelSettings";
import { ModelSelector } from "./ModelSelector";
import React from 'react';


export default function ModelsDashboard() {
  // Load lab data on component mount
  React.useEffect(() => {
    loadLabData();
  }, []);

  const {
    allModels,
    selectedModels,
    filteredData, // Use filteredData which is sorted by the hook
    chartData,
    activePriceTab,
    displayMode,
    sorting,
    isLoading,
    error,
    toggleModelSelection,
    selectAllModels,
    deselectAllModels,
    setActivePriceTab,
    setDisplayMode,
    setSorting,
  } = useModelData();

  const inputColor = "#818cf8";
  const outputColor = "#22d3ee";

  const columns: ColumnDef<ModelData>[] = [
    {
      id: "select",
      header: () => (
        <Checkbox
          id="select-all"
          checked={selectedModels.size === allModels.length}
          onCheckedChange={() => (selectedModels.size === allModels.length ? deselectAllModels() : selectAllModels())}
          aria-label="Select all models"
        />
      ),
      cell: ({ row }) => {
        const modelName = row.original.Name;
        return (
          <Checkbox
            id={modelName}
            checked={selectedModels.has(modelName)}
            onCheckedChange={() => toggleModelSelection(modelName)}
            aria-label={`Select ${modelName}`}
          />
        );
      },
      // Disable sorting/filtering on the select column
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "Name",
      header: "Name",
      cell: ({ row }) => {
        const slug = row.original.Slug;
        const labSlug = getOpenRouterLabSlug(row.original.Lab);
        const openRouterLink = slug ? `https://openrouter.ai/${labSlug}/${slug}` : '#';
        return (
          <a 
            href={openRouterLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="cursor-pointer select-none font-medium hover:underline"
          >
            {row.original.Name}
          </a>
        );
      },
    },
    {
      accessorKey: "Combined",
      header: "Combined",
      cell: ({ row }) => {
        const combined = calculateCombinedPrice(row.original.Input, row.original.Output);
        return (
          <span className="font-medium">${combined.toFixed(2)}</span>
        );
      },
      // Provide a sorting function hint for Tanstack Table if needed, though hook handles primary sort
      sortDescFirst: false, // Ensure initial sort is ascending
      sortingFn: (rowA, rowB) => {
        const priceA = calculateCombinedPrice(rowA.original.Input, rowA.original.Output);
        const priceB = calculateCombinedPrice(rowB.original.Input, rowB.original.Output);
        return priceA - priceB;
      },
    },
    {
      accessorKey: "Input",
      header: "Input",
      cell: ({ row }) => (
        <span style={{ color: inputColor }}>{row.original.Input}</span>
      ),
    },
    {
      accessorKey: "Output",
      header: "Output",
      cell: ({ row }) => (
        <span style={{ color: outputColor }}>{row.original.Output}</span>
      ),
    },
    {
      accessorKey: "Lab",
      header: "Lab",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{getFullLabName(row.original.Lab) || '-'}</span>
      ),
    },
    {
      accessorKey: "releaseDate",
      header: "Release Date",
      cell: ({ row }) => {
        const releaseDate = row.original.releaseDate;
        if (!releaseDate || releaseDate === '-') return <span className="text-muted-foreground">-</span>;
        
        const date = new Date(releaseDate);
        const formattedDate = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
        
        return <span className="text-muted-foreground">{formattedDate}</span>;
      },
    },
    {
      accessorKey: "Artificial Analysis Intelligence Index",
      header: "Intelligence",
      cell: ({ row }) => {
        const index = row.original['Artificial Analysis Intelligence Index'];
        return <span className="font-medium text-blue-500">{index || '-'}</span>;
      },
      sortDescFirst: true,
      sortingFn: (rowA, rowB) => {
        const indexA = Number(rowA.original['Artificial Analysis Intelligence Index'] || 0);
        const indexB = Number(rowB.original['Artificial Analysis Intelligence Index'] || 0);
        return indexA - indexB;
      },
    },
    {
      accessorKey: "Value",
      header: "Value",
      cell: ({ row }) => {
        const index = Number(row.original['Artificial Analysis Intelligence Index'] || 0);
        const combined = calculateCombinedPrice(row.original.Input, row.original.Output);
        const value = combined > 0 ? ((((index - 34)*10) / (combined*1))/10).toFixed(0) : '-';
        return <span className="font-medium text-green-600">{value}</span>;
      },
      sortDescFirst: true,
      sortingFn: (rowA, rowB) => {
        const indexA = Number(rowA.original['Artificial Analysis Intelligence Index'] || 0);
        const indexB = Number(rowB.original['Artificial Analysis Intelligence Index'] || 0);
        const combinedA = calculateCombinedPrice(rowA.original.Input, rowA.original.Output);
        const combinedB = calculateCombinedPrice(rowB.original.Input, rowB.original.Output);
        const valueA = combinedA > 0 ? ((((indexA - 34)*10) / (combinedA*1))/10) : 0;
        const valueB = combinedB > 0 ? ((((indexB - 34)*10) / (combinedB*1))/10) : 0;
        return valueA - valueB;
      },
    },
  ];


  if (isLoading) {
    return <div className="container mx-auto py-10 text-center">Loading model data...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-10 text-center text-red-500">Error loading data: {error.message}</div>;
  }

  return (
    <main className="container mx-auto py-10">
      <Card className="w-full mb-10">
        <CardContent className="px-10 py-6 space-y-8">
            {/* Chart Area */}
            <div className="h-[500px]">
              <ModelPriceChart
                chartData={chartData}
                displayMode={displayMode}
              />
            </div>
            {/* Settings Area */}
            <ModelSettings
              activePriceTab={activePriceTab}
              setActivePriceTab={setActivePriceTab}
              displayMode={displayMode}
              setDisplayMode={setDisplayMode}
            />
        </CardContent>
      </Card>

      {/* Model Selector Table Area */}
      {/* Pass necessary props to ModelSelector */}
      {/* toggleModelSelection is implicitly used by the columns definition */}
      <ModelSelector
        allModels={allModels}
        selectedModels={selectedModels}
        columns={columns}
        toggleModelSelection={toggleModelSelection}
        sorting={sorting}
        setSorting={setSorting}
      />

      {/* Footer remains the same */}
      <footer className="mt-8 text-center py-4 border-t border-accent">
        <div className="text-muted-foreground text-sm">
          Based on{" "}
          <a href="https://model-prices.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
            Theo's model prices app
          </a>{" "}
          • If you like this, check out{" "}
          <a
            href="https://t3.chat"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            T3 Chat
          </a>{" "}
          •{" "}
          <a
            href="https://v0.dev/chat/xWqctb5ZQhR"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Fork this on V0
          </a>
        </div>
      </footer>
    </main>
  );
}
