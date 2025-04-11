import EditWarehouseFieldGrid from "../EditWarehouseFieldGrid";
import { useState, useEffect } from "react";
import axios from "axios";
import RackButton from "./RackButton"; // Import the new RackButton component

export default function RackView({ warehouse }) {
  const [racks, setRacks] = useState({});

  useEffect(() => {
    const fetchRacks = async () => {
      try {
        const response = await axios.get(
          `/api/racks/warehouse/${warehouse.id}`
        );
        const fetchedRacks = response.data;

        console.log(
          `Fetched racks for warehouse ${warehouse.id}:`,
          fetchedRacks
        );

        // Map fetched locations to expected keys
        const locationMapping = {
          topLeft: "topLeft",
          topRight: "topRight",
          bottomLeft: "bottom",
          bottomRight: "bottom",
          center: "bottom",
          leftVertical: "leftVertical",
          rightVertical: "rightVertical",
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

  const handleAddRack = async (location) => {
    try {
      const response = await axios.post(
        `/api/racks/warehouse/${warehouse.id}/add`,
        {
          location,
          name: `Rack in ${location}`,
        }
      );
      const newRack = response.data;

      setRacks((prev) => ({
        ...prev,
        [location]: [...(prev[location] || []), newRack],
      }));
    } catch (error) {
      console.error("Error adding rack:", error);
    }
  };

  const handleRemoveRack = async (location) => {
    try {
      const rackList = racks[location];
      if (!rackList || rackList.length === 0) return;

      const rackToRemove = rackList[rackList.length - 1]; // Remove the last rack
      await axios.delete(
        `/api/racks/warehouse/${warehouse.id}/remove/${rackToRemove.id}`
      );

      setRacks((prev) => ({
        ...prev,
        [location]: prev[location].slice(0, -1),
      }));
    } catch (error) {
      console.error("Error removing rack:", error);
    }
  };

  const renderRacks = (rackList = [], orientation, location) => {
    return (
      <div
        className={`flex ${
          orientation === "horizontal" ? "flex-row" : "flex-col"
        } flex-wrap gap-2`}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          overflow: "hidden",
        }}
      >
        {rackList.map((rack) => {
          const isHorizontalRack = rack.location === "topLeft" || rack.location === "topRight" || rack.location === "bottom";
          const isVerticalRack = rack.location === "leftVertical" || rack.location === "rightVertical";

          console.log( rack.location === "topRight")
  
          return (
            <div
              key={rack.id}
              className="flex items-center justify-center border border-black text-black text-sm font-bold bg-yellow-200"
              style={{
                flexShrink: 0,
                flexGrow: 0,
                flexBasis: "auto",
                width: isHorizontalRack ? "6em" : "4em",
                height: isVerticalRack ? "6em" : "4em",
                fontSize: "0.5em",
                alignSelf: rack.location === "topRight" || rack.location === "rightVertical" ? "flex-end" : "",
                flexDirection: isHorizontalRack ? "row" : "column",
              }}
            >
              {rack.name}
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <div
      className="grid h-full w-full"
      style={{
        gridTemplateColumns: "30% 40% 30%",
        gridTemplateRows: "10% 90% 10%",
      }}
    >
      <div
        style={{
          gridColumn: "1 / 2",
          gridRow: "1 / 2",
        }}
        className="border border-black relative"
      >
        <div
          className="absolute top-0 right-0 flex flex-col gap-1 p-1 z-10 bg-white"
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "auto",
          }}
        >
          <RackButton
            onClick={() => handleAddRack("topLeft")}
            label="+"
            className="w-5 h-5"
          />
          <RackButton
            onClick={() => handleRemoveRack("topLeft")}
            label="-"
            className="w-5 h-5"
          />
        </div>
        {renderRacks(racks.topLeft, "horizontal")}
      </div>
      <div
        style={{
          gridColumn: "1 / 2",
          gridRow: "2 / 3",
        }}
        className="border border-black relative"
      >
        <div
          className="absolute top-0 right-0 flex flex-col gap-1 p-1 z-10 bg-white"
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "auto",
          }}
        >
          <RackButton
            onClick={() => handleAddRack("leftVertical")}
            label="+"
            className="w-5 h-5"
          />
          <RackButton
            onClick={() => handleRemoveRack("leftVertical")}
            label="-"
            className="w-5 h-5"
          />
        </div>
        {renderRacks(racks.leftVertical, "vertical")}
      </div>
      <div
        style={{
          gridColumn: "2 / 3",
          gridRow: "1 / 3",
          width: "100%",

          margin: "0 auto",          
        }}
        className="border border-black"
      >
        <EditWarehouseFieldGrid warehouse={warehouse} />
      </div>
      <div
        style={{
          gridColumn: "3 / 4",
          gridRow: "1 / 2",
        }}
        className="border border-black relative"
      >
        <div
          className="absolute top-0 left-0 flex flex-col gap-1 p-1 z-10 bg-white"
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "auto",
          }}
        >
          <RackButton
            onClick={() => handleAddRack("topRight")}
            label="+"
            className="w-5 h-5"
          />
          <RackButton
            onClick={() => handleRemoveRack("topRight")}
            label="-"
            className="w-5 h-5"
          />
        </div>
        {renderRacks(racks.topRight, "horizontal")}
      </div>
      <div
        style={{
          gridColumn: "3 / 4",
          gridRow: "2 / 3",
        }}
        className="border border-black relative"
      >
        <div
          className="absolute top-0 left-0 flex flex-col gap-1 p-1 z-10 bg-white"
          style={{
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "auto",
          }}
        >
          <RackButton
            onClick={() => handleAddRack("rightVertical")}
            label="+"
            className="w-5 h-5"
          />
          <RackButton
            onClick={() => handleRemoveRack("rightVertical")}
            label="-"
            className="w-5 h-5"
          />
        </div>
        {renderRacks(racks.rightVertical, "vertical")}
      </div>
      <div
        style={{
          gridColumn: "1 / 4",
          gridRow: "3 / 4",
        }}
        className="border border-black relative"
      >
        <div className="absolute w-[100%] flex items-center gap-1 p-1 z-10 bg-white">
          <div className="flex gap-1 m-auto">
            <RackButton
              onClick={() => handleAddRack("bottom")}
              label="+"
              className="px-1 py-0"
            />
            <RackButton
              onClick={() => handleRemoveRack("bottom")}
              label="-"
              className="px-1 py-0"
            />
          </div>
        </div>
        {renderRacks(racks.bottom, "horizontal")}
      </div>
    </div>
  );
}
