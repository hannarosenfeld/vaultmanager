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

  const renderRacks = (count, orientation, alignRight = false, alignBottom = false) => {
    return (
      <div
        className={`flex ${
          orientation === "horizontal"
            ? alignRight
              ? "justify-end"
              : "justify-start"
            : alignBottom
            ? "items-end"
            : "items-start"
        } ${orientation === "horizontal" ? "flex-row" : "flex-col"} gap-2`}
      >
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="w-6 h-6 bg-gray-500"></div>
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
        {renderRacks(racks.topLeft, "horizontal")}
        <div className="flex gap-1">
          <button onClick={() => handleAddRack("topLeft")}>+</button>
          <button onClick={() => handleRemoveRack("topLeft")}>-</button>
        </div>
      </div>
      <div
        style={{
          gridColumn: "1 / 2",
          gridRow: "2 / 3",
        }}
        className="border-1"
      >
        {renderRacks(racks.leftVertical, "vertical")}
        <div className="flex gap-1">
          <button onClick={() => handleAddRack("leftVertical")}>+</button>
          <button onClick={() => handleRemoveRack("leftVertical")}>-</button>
        </div>
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
          position: "relative",
        }}
        className="border-1"
      >
        {renderRacks(racks.topRight, "horizontal", true)}
        <div className="absolute bottom-1 right-1 flex gap-1">
          <button onClick={() => handleAddRack("topRight")}>+</button>
          <button onClick={() => handleRemoveRack("topRight")}>-</button>
        </div>
      </div>
      <div
        style={{
          gridColumn: "3 / 4",
          gridRow: "2 / 3",
        }}
        className="border-1"
      >
        {renderRacks(racks.rightVertical, "vertical", false, true)}
        <div className="flex gap-1">
          <button onClick={() => handleAddRack("rightVertical")}>+</button>
          <button onClick={() => handleRemoveRack("rightVertical")}>-</button>
        </div>
      </div>
      <div
        style={{
          gridColumn: "1 / 4",
          gridRow: "3 / 4",
        }}
        className="border-1"
      >
        {renderRacks(racks.bottom, "horizontal")}
        <div className="flex gap-1">
          <button onClick={() => handleAddRack("bottom")}>+</button>
          <button onClick={() => handleRemoveRack("bottom")}>-</button>
        </div>
      </div>
    </div>
  );
}
