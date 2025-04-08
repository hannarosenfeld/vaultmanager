import EditWarehouseFieldGrid from "../EditWarehouse/EditWarehouseFieldGrid";
import { useState, useEffect } from "react";
import axios from "axios";

export default function RackView({ warehouse }) {
  const [racks, setRacks] = useState({});

  useEffect(() => {
    const fetchRacks = async () => {
      try {
        const response = await axios.get(`/api/racks/warehouse/${warehouse.id}`);
        const fetchedRacks = response.data;

        console.log("Fetched Racks:", fetchedRacks);

        // Map fetched locations to expected keys
        const locationMapping = {
          topLeft: "topLeft",
          topRight: "topRight",
          bottomLeft: "bottom",
          bottomRight: "bottom",
          center: "bottom", // Adjust this if "center" should map elsewhere
        };

        // Map racks to their locations
        const initialRacks = {};
        fetchedRacks.forEach((rack) => {
          const mappedLocation = locationMapping[rack.location];
          if (mappedLocation) {
            if (!initialRacks[mappedLocation]) {
              initialRacks[mappedLocation] = [];
            }
            initialRacks[mappedLocation].push(rack);
          }
        });
        setRacks(initialRacks);
      } catch (error) {
        console.error("Error fetching racks:", error);
      }
    };

    fetchRacks();
  }, [warehouse.id]);

  const renderRacks = (rackList = [], orientation, alignRight = false, alignBottom = false) => {
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
        } ${orientation === "horizontal" ? "flex-row" : "flex-col"} gap-4`}
      >
        {rackList.map((rack) => (
          <div
            key={rack.id}
            className="flex flex-col items-center justify-center w-16 h-16 bg-gray-500 text-white text-sm font-bold rounded"
          >
            {rack.name}
          </div>
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
          <button onClick={() => console.log("Add rack to topLeft")}>+</button>
          <button onClick={() => console.log("Remove rack from topLeft")}>-</button>
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
          <button onClick={() => console.log("Add rack to leftVertical")}>+</button>
          <button onClick={() => console.log("Remove rack from leftVertical")}>-</button>
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
          <button onClick={() => console.log("Add rack to topRight")}>+</button>
          <button onClick={() => console.log("Remove rack from topRight")}>-</button>
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
          <button onClick={() => console.log("Add rack to rightVertical")}>+</button>
          <button onClick={() => console.log("Remove rack from rightVertical")}>-</button>
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
          <button onClick={() => console.log("Add rack to bottom")}>+</button>
          <button onClick={() => console.log("Remove rack from bottom")}>-</button>
        </div>
      </div>
    </div>
  );
}