import React, { useMemo } from "react";
import useSWR from "swr";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChargingState } from "../types/chargingState";
import { formatTime } from "../utils/dateFormatter";
import "../styles/BatteryChargingStyles.css";

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

const BatteryChargingVisualization: React.FC = () => {
  // I'm using SWR to fetch the data and refresh it every minute because it simplifies fetching, error handling, and revalidation out of the box, reducing boilerplate code. In contrast, useEffect requires more manual effort to manage these features, which can lead to repetitive and error-prone code.
  const { data, error } = useSWR<{ chargingStates: ChargingState[] }>(
    "/backend-response.json",
    fetcher,
    {
      revalidateOnFocus: false, // Don't revalidate on window focus
    }
  );

  // The fetched data doesn't have an entry for 3 pm. I had two options:
  // 1. Add an entry for 3 pm with a charging level in the middle of the previous and next entry
  // 2. Not have an entry for 3 pm
  // I chose option 2 because it's more realistic and aligns with the data provided. Implementing option 1 would have required a lot more code and data to make it reliable, and not just work for the simple case of missing a single entry.

  // Memoize the sorted data to avoid unnecessary re-computations
  // The data in the file is already sorted, but it would be safer to sort it again to avoid any potential issues and cover any edge cases.
  const sortedData = useMemo(() => {
    if (!data?.chargingStates) return [];
    return [...data.chargingStates].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data]);

  // Function to determine the charging state
  const getChargingState = (
    current: ChargingState,
    previous: ChargingState
  ): string => {
    if (current.chargingLevel > previous.chargingLevel) {
      return "Charging";
    } else if (current.chargingLevel < previous.chargingLevel) {
      return "Discharging";
    } else {
      return "Stable";
    }
  };

  // Custom tooltip content
  const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const currentData = payload[0].payload;
      const dataIndex = sortedData.findIndex(
        (item) => item.date === currentData.date
      );
      const previousData = dataIndex > 0 ? sortedData[dataIndex - 1] : null;

      return (
        <div className="custom-tooltip">
          <p className="label">{`Time: ${formatTime(currentData.date)}`}</p>
          <p className="intro">{`Charging Level: ${currentData.chargingLevel}%`}</p>

          {/* Since I only have access to the previous data, I'm assuming the charging state is stable. I was a bit conflicted between "Stable" and "N/A", but I chose "Stable" because it's the most likely state and "NA" is not user friendly. */}
          <p className="desc">
            {previousData
              ? getChargingState(currentData, previousData)
              : "Stable"}
          </p>
        </div>
      );
    }
    return null;
  };

  // Show loading state

  if (!data) {
    return <div className="loading">Loading charging data...</div>;
  }

  // Show error state
  if (error) {
    return (
      <div className="error">
        Failed to load charging data. Please try again later.
      </div>
    );
  }

  // Check if chargingStates exists and is an array
  if (
    !data.chargingStates ||
    !Array.isArray(data.chargingStates) ||
    data.chargingStates.length === 0
  ) {
    return <div className="error">No charging data available.</div>;
  }

  return (
    <div className="battery-charging-visualization">
      <h1>Battery Charging Visualization</h1>
      <ResponsiveContainer width="100%" height={450}>
        <LineChart
          data={sortedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(tick) => formatTime(tick)}
            label={{ value: "Time", position: "insideBottom", offset: -10 }}
          />
          <YAxis
            label={{
              value: "Charging Level (%)",
              angle: -90,
              position: "insideLeft",
            }}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="chargingLevel"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ fill: "#8884d8", r: 4 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BatteryChargingVisualization;
