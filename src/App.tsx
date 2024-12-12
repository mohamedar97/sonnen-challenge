import React from "react";
import { SWRConfig } from "swr";
import BatteryChargingVisualization from "./components/BatteryCharginVisualization";

const App: React.FC = () => {
  return (
    <SWRConfig
      value={{
        refreshInterval: 3000,
        fetcher: (resource, init) =>
          fetch(resource, init).then((res) => res.json()),
      }}
    >
      <div className="App">
        <BatteryChargingVisualization />
      </div>
    </SWRConfig>
  );
};

export default App;
