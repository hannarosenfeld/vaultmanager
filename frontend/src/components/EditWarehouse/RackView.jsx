import EditWarehouseFieldGrid from "../EditWarehouse/EditWarehouseFieldGrid";
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

  const renderRacks = (rackList = [], orientation) => {
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
        {rackList.map((rack) => (
          <div
            key={rack.id}
            className="flex flex-col items-center justify-center border border-black text-black text-sm font-bold bg-gray-200"
            style={{
              flexGrow: 1,
              flexShrink: 1,
              flexBasis: "0",
              minWidth: "50px",
              minHeight: "50px",
              maxWidth: "100%",
              maxHeight: "100%",
            }}
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
          <button
            onClick={() => handleAddRack("topLeft")}
            className="w-5 h-5 border border-black flex items-center justify-center"
          >
            +
          </button>
          <button
            onClick={() => handleRemoveRack("topLeft")}
            className="w-5 h-5 border border-black flex items-center justify-center"
          >
            -
          </button>
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
          <button
            onClick={() => handleAddRack("leftVertical")}
            className="w-5 h-5 border border-black flex items-center justify-center"
          >
            +
          </button>
          <button
            onClick={() => handleRemoveRack("leftVertical")}
            className="w-5 h-5 border border-black flex items-center justify-center"
          >
            -
          </button>
        </div>
        {renderRacks(racks.leftVertical, "vertical")}
      </div>
      <div
        style={{
          gridColumn: "2 / 3",
          gridRow: "1 / 3",
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
          <button
            onClick={() => handleAddRack("topRight")}
            className="w-5 h-5 border border-black flex items-center justify-center"
          >
            +
          </button>
          <button
            onClick={() => handleRemoveRack("topRight")}
            className="w-5 h-5 border border-black flex items-center justify-center"
          >
            -
          </button>
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
          <button
            onClick={() => handleAddRack("rightVertical")}
            className="w-5 h-5 border border-black flex items-center justify-center"
          >
            +
          </button>
          <button
            onClick={() => handleRemoveRack("rightVertical")}
            className="w-5 h-5 border border-black flex items-center justify-center"
          >
            -
          </button>
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
            <button
              onClick={() => handleAddRack("bottom")}
              className="px-1 py-0 border border-black"
            >
              +
            </button>
            <button
              onClick={() => handleRemoveRack("bottom")}
              className="px-1 py-0 border border-black"
            >
              -
            </button>
          </div>
        </div>
        {renderRacks(racks.bottom, "horizontal")}
      </div>
    </div>
  );
}
