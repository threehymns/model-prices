import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useStore } from "@nanostores/react";
import { modelStore } from "../stores/modelStore";
import React from "react";

// Define colors (could be passed as props or use CSS variables later)
const inputColor = "#818cf8"; // lighter indigo for dark mode
const outputColor = "#22d3ee"; // lighter cyan for dark mode
const combinedColor = "#facc15"; // lighter yellow for dark mode
const valueColor = "#10b981"; // green color for value

// Custom tooltip styles for dark mode
const CustomTooltip = React.memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 rounded-md shadow-md bg-accent/90 backdrop-blur backdrop-saturate-150 text-white border border-border">
        <p className="font-bold">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
});

export const ModelPriceChart = React.memo(function ModelPriceChart() {
  // Initialize with data on mount rather than waiting for effects
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false); // Start with false to avoid unnecessary loading state
  const initialLoadRef = React.useRef(true); // Track if this is the initial load
  const { allModels, selectedModels, displayMode, sorting } =
    useStore(modelStore);

  // Memoize sorted models to prevent recalculation when unrelated state changes
  // Show a loading overlay only on first mount
  React.useEffect(() => {
    if (initialLoadRef.current) setIsLoading(true);
  }, []);

  const sortedFilteredModels = React.useMemo(() => {
    // …rest of your memoized filtering/sorting logic…
    const sortedModels = [...allModels].sort((a, b) => {
      if (!sorting || sorting.length === 0) {
        return 0;
      }

      const sortRule = sorting[0];
      const column = sortRule.id;
      const direction = sortRule.desc ? "desc" : "asc";
      let comparison = 0;

      switch (column) {
        case "Name":
          comparison = a.Name.localeCompare(b.Name);
          break;
        case "Input":
          comparison = (a.inputPrice || 0) - (b.inputPrice || 0);
          break;
        case "Output":
          comparison = (a.outputPrice || 0) - (b.outputPrice || 0);
          break;
        case "Lab":
          comparison = (a.labFullName ?? "").localeCompare(b.labFullName ?? "");
          break;
        case "Combined":
          comparison = (a.combinedPrice || 0) - (b.combinedPrice || 0);
          break;
        default:
          if (a[column] && b[column]) {
            comparison = String(a[column]).localeCompare(String(b[column]));
          } else {
            comparison = 0;
          }
      }
      return direction === "asc" ? comparison : -comparison;
    });

    // Filter and return immediately
    return sortedModels.filter((item) => selectedModels.has(item.Name));
  }, [allModels, selectedModels, sorting]); // Only recalculate when these change

  // Memoize the final chart data
  const processedChartData = React.useMemo(() => {
    // Process chart data - simply extract pre-calculated values
    return sortedFilteredModels.map((item) => ({
      name: item.Name,
      Input: item.inputPrice || 0,
      Output: item.outputPrice || 0,
      Combined: item.combinedPrice || 0,
      Value: item.value || 0,
    }));
  }, [sortedFilteredModels]);

  // Update chart data without artificial delay
  React.useEffect(() => {
    setChartData(processedChartData);

    // Only turn off loading when we have actual data on initial load
    if (initialLoadRef.current) {
      if (processedChartData.length > 0) {
        setIsLoading(false);
        initialLoadRef.current = false; // Mark initial load as complete only when we have data
      }
    }
  }, [processedChartData]);

  return (
    <div className="h-[500px] w-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm z-10">
          <div className="h-16 w-16 border-6 border-primary/50 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}

      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        {!chartData || chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No data to display in chart.
          </div>
        ) : (
          <BarChart
            data={chartData}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fill: "#aaa" }}
              className="text-xs"
            />
            <YAxis
              tickFormatter={(value) => `$${value.toFixed(2)}`}
              tick={{ fill: "#aaa" }}
              className="text-sm"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: "40px",
                color: "#ffffff",
              }}
            />
            {(displayMode === "both" || displayMode === "input") && (
              <Bar
                dataKey="Input"
                fill={inputColor}
                name="Input Cost"
                isAnimationActive={!initialLoadRef.current}
              />
            )}
            {(displayMode === "both" || displayMode === "output") && (
              <Bar
                dataKey="Output"
                fill={outputColor}
                name="Output Cost"
                isAnimationActive={!initialLoadRef.current}
              />
            )}
            {displayMode === "combined" && (
              <Bar
                dataKey="Combined"
                fill={combinedColor}
                name="Combined Cost"
                isAnimationActive={!initialLoadRef.current}
              />
            )}
            {displayMode === "value" && (
              <Bar
                dataKey="Value"
                fill={valueColor}
                name="Value (Intelligence/Price)"
                isAnimationActive={!initialLoadRef.current}
              />
            )}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
});
