import EditWarehouseFieldGrid from "../EditWarehouse/EditWarehouseFieldGrid";
import { useState } from "react";

export default function RackView({ warehouse }) {
  const [racks, setRacks] = useState({
    topLeft: 0,
    leftVertical: 0,
    topRight: 0,
    rightVertical: 0,
    bottom: 0,
  });

  const handleAddRack = (field) => {
    setRacks((prev) => ({ ...prev, [field]: prev[field] + 1 }));
  };

  const handleRemoveRack = (field) => {
    setRacks((prev) => ({ ...prev, [field]: Math.max(0, prev[field] - 1) }));
  };

  const renderRacks = (count, orientation) => {
    return (
      <div className={`flex ${orientation === "horizontal" ? "flex-row" : "flex-col"} gap-1`}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="w-4 h-4 bg-gray-500"></div>
        ))}
      </div>
    );
  };

  return (
    <div
      className="grid h-full w-full"
      style={{
        gridTemplateColumns: "25% 50% 25%",
        gridTemplateRows: "10% 90% 10%",
      }}
    >
      <div
        style={{
          gridColumn: "1 / 2",
          gridRow: "1 / 2",
        }}
        className="border-1"
      >
        <div>top left horizontal racks: {racks.topLeft}</div>
        {renderRacks(racks.topLeft, "horizontal")}
        <button onClick={() => handleAddRack("topLeft")}>+</button>
        <button onClick={() => handleRemoveRack("topLeft")}>-</button>
      </div>
      <div
        style={{
          gridColumn: "1 / 2",
          gridRow: "2 / 3",
        }}
        className="border-1"
      >
        <div>left vertical racks: {racks.leftVertical}</div>
        {renderRacks(racks.leftVertical, "vertical")}
        <button onClick={() => handleAddRack("leftVertical")}>+</button>
        <button onClick={() => handleRemoveRack("leftVertical")}>-</button>
      </div>
      <div
        style={{
          gridColumn: "2 / 3",
          gridRow: "1 / 3",
        }}
      >
        <EditWarehouseFieldGrid warehouse={warehouse} />
      </div>
      <div
        style={{
          gridColumn: "3 / 4",
          gridRow: "1 / 2",
        }}
        className="border-1"
      >
        <div>top right horizontal racks: {racks.topRight}</div>
        {renderRacks(racks.topRight, "horizontal")}
        <button onClick={() => handleAddRack("topRight")}>+</button>
        <button onClick={() => handleRemoveRack("topRight")}>-</button>
      </div>
      <div
        style={{
          gridColumn: "3 / 4",
          gridRow: "2 / 3",
        }}
        className="border-1"
      >
        <div>right vertical racks: {racks.rightVertical}</div>
        {renderRacks(racks.rightVertical, "vertical")}
        <button onClick={() => handleAddRack("rightVertical")}>+</button>
        <button onClick={() => handleRemoveRack("rightVertical")}>-</button>
      </div>
      <div
        style={{
          gridColumn: "1 / 4",
          gridRow: "3 / 4",
        }}
        className="border-1"
      >
        <div>bottom racks: {racks.bottom}</div>
        {renderRacks(racks.bottom, "horizontal")}
        <button onClick={() => handleAddRack("bottom")}>+</button>
        <button onClick={() => handleRemoveRack("bottom")}>-</button>
      </div>
    </div>
  );
}
