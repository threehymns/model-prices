import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseCsv(csvString: string) {
  // Split the CSV string into lines
  const lines = csvString.trim().split("\n")

  // Extract original headers
  const originalHeaders = lines[0].split(",")

  // Process data rows
  const data = lines.slice(1).map((line) => {
    const values = line.split(",")
    const row: Record<string, string> = {}

    // Preserve original headers
    originalHeaders.forEach((header, index) => {
      row[header] = values[index]
    })

    return row
  })

  return data
}

export function formatDollar(value: string): number {
  // Remove $ and convert to number
  // Handle potential empty strings or non-numeric values gracefully
  const cleanedValue = value?.replace("$", "") || "0";
  const number = Number.parseFloat(cleanedValue);
  return Number.isNaN(number) ? 0 : number;
}

export function calculateCombinedPrice(input: string, output: string): number {
  const inputPrice = formatDollar(input);
  const outputPrice = formatDollar(output);
  // Weighted average with 3:1 ratio of input to output
  // Avoid division by zero if both prices are zero or invalid
  if (inputPrice === 0 && outputPrice === 0) {
      return 0;
  }
  // Ensure the calculation handles potential NaN from formatDollar, though the updated formatDollar should prevent this.
  return ((inputPrice * 3) + outputPrice) / 4;
}

// Global variable to store lab mappings
let labNameMap: Record<string, { name: string, slug: string }> = {};

// Fetch and parse labs CSV
export async function loadLabData() {
  try {
    const response = await fetch('/labs.csv');
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');

    labNameMap = lines.slice(1).reduce((acc, line) => {
      const values = line.split(',');
      const slug = values[headers.indexOf('Slug')];
      const name = values[headers.indexOf('Name')];

      if (slug) {
        acc[slug.toLowerCase()] = { name, slug };
      }
      return acc;
    }, {} as Record<string, { name: string, slug: string }>);
  } catch (error) {
    console.error('Failed to load lab data:', error);
  }
}

// Map lab slugs to their full names
export function getFullLabName(labSlug: string): string {
  const labInfo = labNameMap[labSlug.toLowerCase()];
  return labInfo?.name || labSlug;
}

// Get Open Router lab slug
export function getOpenRouterLabSlug(labSlug: string): string {
  const labInfo = labNameMap[labSlug.toLowerCase()];
  return labInfo?.slug || labSlug;
}
