import EditWarehouseFieldGrid from "../EditWarehouseFieldGrid";
import { useState, useEffect } from "react";
import axios from "axios";

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
          bottom: "bottom", // Ensure all bottom racks are mapped correctly
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

        console.log("Mapped racks:", initialRacks); // Debugging
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

      setRacks((prev) => {
        const updatedRacks = {
          ...prev,
          [location]: [...(prev[location] || []), newRack],
        };
        console.log("Updated racks after adding:", updatedRacks); // Debugging
        return updatedRacks;
      });
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
    console.log(`Rendering racks for location ${location}:`, rackList); // Debugging

    // Reverse the rack list for topRight location
    const processedRackList = location === "topRight" ? [...rackList].reverse() : rackList;

    // Determine the number of potential spots
    const totalSpots = location === "leftVertical" || location === "rightVertical" ? 10 : 10; // Adjust for vertical walls and bottom
    const filledSpots = processedRackList.length;
    const emptySpots = totalSpots - filledSpots;

    return (
      <div
        className={`flex ${
          orientation === "horizontal" ? "flex-row" : "flex-col"
        }`}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          overflow: "hidden",
          justifyContent:
            location === "topRight" ? "flex-end" : "flex-start", // Align topRight to the right
          alignItems:
            location === "rightVertical" ? "flex-end" : "flex-start", // Align rightVertical to the right wall
          flexWrap: "nowrap", // Prevent wrapping
        }}
      >
        {processedRackList.map((rack) => {
          const isHorizontalRack =
            rack.location === "topLeft" ||
            rack.location === "topRight" ||
            rack.location === "bottom";
          const isVerticalRack =
            rack.location === "leftVertical" ||
            rack.location === "rightVertical";

          return (
            <div
              key={rack.id}
              className="flex items-center justify-center border border-black text-black text-sm font-bold bg-yellow-200"
              style={{
                flexShrink: 0,
                flexGrow: 0,
                flexBasis: "auto",
                width: isHorizontalRack ? "6em" : "4em",
                height: isVerticalRack ? "10%" : "4em", // Adjust height for vertical racks
                fontSize: "0.5em",
                flexDirection: isHorizontalRack ? "row" : "column",
              }}
            >
              {rack.name}
            </div>
          );
        })}
        {/* Render empty spots */}
        {Array.from({ length: emptySpots }).map((_, index) => {
          const isHorizontalRack =
            location === "topLeft" ||
            location === "topRight" ||
            location === "bottom";
          const isVerticalRack =
            location === "leftVertical" ||
            location === "rightVertical";

          return (
            <div
              key={`empty-${index}`}
              className="flex items-center justify-center border border-gray-400 bg-gray-200"
              style={{
                flexShrink: 0,
                flexGrow: 0,
                flexBasis: "auto",
                width: isHorizontalRack ? "6em" : "4em",
                height: isVerticalRack ? "10%" : "4em", // Adjust height for vertical racks
                fontSize: "0.5em",
                flexDirection: isHorizontalRack ? "row" : "column",
              }}
            />
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
        className="border border-black"
      >
        {renderRacks(racks.topLeft, "horizontal", "topLeft")}
      </div>
      <div
        style={{
          gridColumn: "1 / 2",
          gridRow: "2 / 3",
        }}
        className="border border-black"
      >
        {renderRacks(racks.leftVertical, "vertical", "leftVertical")}
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
        className="border border-black"
      >
        {renderRacks(racks.topRight, "horizontal", "topRight")}
      </div>
      <div
        style={{
          gridColumn: "3 / 4",
          gridRow: "2 / 3",
        }}
        className="border border-black"
      >
        {renderRacks(racks.rightVertical, "vertical", "rightVertical")}
      </div>
      <div
        style={{
          gridColumn: "1 / 4",
          gridRow: "3 / 4",
        }}
        className="border border-black"
      >
        {renderRacks(racks.bottom, "horizontal", "bottom")}
      </div>
    </div>
  );
}
