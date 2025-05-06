import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Define props for the component
interface ModelPriceChartProps {
  chartData: { 
    name: string; 
    Input: number; 
    Output: number; 
    Combined: number; 
    Value?: number;
  }[];
  displayMode: 'both' | 'input' | 'output' | 'combined' | 'value' | string;
}

// Define colors (could be passed as props or use CSS variables later)
const inputColor = "#818cf8"; // lighter indigo for dark mode
const outputColor = "#22d3ee"; // lighter cyan for dark mode
const combinedColor = "#facc15"; // lighter yellow for dark mode
const valueColor = "#10b981"; // green color for value

// Custom tooltip styles for dark mode
const CustomTooltip = ({ active, payload, label }: any) => {
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
};

export function ModelPriceChart({ chartData, displayMode }: ModelPriceChartProps) {
  // Handle empty data case
  if (!chartData || chartData.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">No data to display in chart.</div>;
  }

  return (
    <div className="h-full w-full"> {/* Ensure container takes full height */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" /> {/* Use theme variable later */}
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0} // Show all labels
            tick={{ fill: "#aaa" }} // Use theme variable later
            // Consider adding tick formatter if names get too long
            className="text-xs"
          />
          <YAxis
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            tick={{ fill: "#aaa" }} // Use theme variable later
            // Allow recharts to determine the domain automatically or set explicitly if needed
            // domain={[0, 'auto']}
            className="text-sm"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: "40px", // Adjust spacing as needed
              color: "#ffffff", // Use theme variable later
            }}
          />
          {(displayMode === "both" || displayMode === "input") && (
            <Bar dataKey="Input" fill={inputColor} name="Input Cost" />
          )}
          {(displayMode === "both" || displayMode === "output") && (
            <Bar dataKey="Output" fill={outputColor} name="Output Cost" />
          )}
          {displayMode === "combined" && (
            <Bar dataKey="Combined" fill={combinedColor} name="Combined Cost" />
          )}
          {displayMode === "value" && (
            <Bar dataKey="Value" fill={valueColor} name="Value (Intelligence/Price)" />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}