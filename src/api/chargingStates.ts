import { ChargingState } from "../types/chargingState";

// Fetcher function for SWR
export const fetchChargingStates = async (): Promise<ChargingState[]> => {
  // In a real-world scenario, this would be an actual API call
  // For this example, we're using a local JSON file
  const response = await fetch("./backend-response.json");
  if (!response.ok) {
    throw new Error("Failed to fetch charging states");
  }
  const data = await response.json();
  return data.chargingStates;
};
