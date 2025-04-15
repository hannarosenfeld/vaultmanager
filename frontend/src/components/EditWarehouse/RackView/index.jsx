import EditWarehouseFieldGrid from "../EditWarehouseFieldGrid";
import { useState, useEffect } from "react";
import axios from "axios";
import RackModal from "./RackModal";

export default function RackView({ warehouse }) {
  const [racks, setRacks] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [potentialRackName, setPotentialRackName] = useState("");

  useEffect(() => {
    const fetchRacks = async () => {
      try {
        const response = await axios.get(
          `/api/racks/warehouse/${warehouse.id}`
        );
        const fetchedRacks = response.data;

        console.log(
          `🏓 Fetched racks for warehouse ${warehouse.id}:`,
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

        setRacks(initialRacks);
      } catch (error) {
        console.error("Error fetching racks:", error);
      }
    };

    fetchRacks();
  }, [warehouse.id]);

  // const handleAddRack = async (location) => {
  //   try {
  //     const response = await axios.post(
  //       `/api/racks/warehouse/${warehouse.id}/add`,
  //       {
  //         location,
  //         name: `Rack in ${location}`,
  //       }
  //     );
  //     const newRack = response.data;

  //     setRacks((prev) => {
  //       const updatedRacks = {
  //         ...prev,
  //         [location]: [...(prev[location] || []), newRack],
  //       };
  //       console.log("Updated racks after adding:", updatedRacks); // Debugging
  //       return updatedRacks;
  //     });
  //   } catch (error) {
  //     console.error("Error adding rack:", error);
  //   }
  // };

  // const handleRemoveRack = async (location) => {
  //   try {
  //     const rackList = racks[location];
  //     if (!rackList || rackList.length === 0) return;

  //     const rackToRemove = rackList[rackList.length - 1]; // Remove the last rack
  //     await axios.delete(
  //       `/api/racks/warehouse/${warehouse.id}/remove/${rackToRemove.id}`
  //     );

  //     setRacks((prev) => ({
  //       ...prev,
  //       [location]: prev[location].slice(0, -1),
  //     }));
  //   } catch (error) {
  //     console.error("Error removing rack:", error);
  //   }
  // };

  const handleOpenModal = (location, potentialRackName) => {
    setSelectedLocation(location);
    setIsModalOpen(true);
    setPotentialRackName(potentialRackName); // Set the potential rack name
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLocation("");
  };

  const handleModalSubmit = async (rackData) => {
    try {
      // Send the rack data to the backend
      const response = await axios.post(
        `/api/racks/warehouse/${warehouse.id}/add`,
        rackData
      );
      const newRack = response.data;
  
      // Update the racks state with the new rack
      setRacks((prev) => {
        const updatedRacks = {
          ...prev,
          [rackData.location]: [...(prev[rackData.location] || []), newRack],
        };
        return updatedRacks;
      });
    } catch (error) {
      console.error("Error adding rack:", error);
    }
  };

  const renderRacks = (rackList = [], orientation, location) => {
    // Reverse the rack list for topRight location
    const processedRackList = location === "topRight" ? [...rackList].reverse() : rackList;

    // Determine the number of potential spots
    const totalSpots = location === "bottom" ? 10 : location === "leftVertical" || location === "rightVertical" ? 10 : 5;
    const filledSpots = processedRackList.length;
    const emptySpots = totalSpots - filledSpots;

    // Define consistent rack dimensions
    const rackWidth =
      location === "bottom" ? `${100 / totalSpots}%` : location === "leftVertical" || location === "rightVertical" ? "4em" : "6em";
    const rackHeight =
      location === "leftVertical" || location === "rightVertical" ? `${100 / totalSpots}%` : "4em";

    // Determine prefix for potential field names
    const locationPrefix = {
      topLeft: "TL",
      topRight: "TR",
      leftVertical: "L",
      rightVertical: "R",
      bottom: "B",
    }[location];

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
            location === "rightVertical"
              ? "flex-end" // Align right racks to the right side
              : location === "bottom"
              ? "flex-start" // Align bottom racks to fill the wall
              : "flex-start", // Default for other locations
          alignItems: location === "rightVertical" || location === "bottom" ? "flex-end" : "auto",
          flexWrap: "nowrap",
        }}
      >
        {processedRackList.map((rack) => (
          <div
            key={rack.id}
            className="flex items-center justify-center text-black text-sm font-bold bg-yellow-200"
            style={{
              flexShrink: 0,
              flexGrow: 0,
              flexBasis: "auto",
              width: rackWidth, // Consistent width
              height: rackHeight, // Consistent height
              fontSize: "0.5em",
              flexDirection: "row",
            }}
          >
            {rack.name}
          </div>
        ))}
        {/* Render empty spots with potential field names */}
        {Array.from({ length: emptySpots }).map((_, index) => {
          const potentialRackName = `${locationPrefix}-${index + filledSpots + 1}`;
          return (
            <div
              key={`empty-${index}`}
              className="flex items-center justify-center border border-gray-400 bg-gray-200 cursor-pointer"
              style={{
                flexShrink: 0,
                flexGrow: 0,
                flexBasis: "auto",
                width: rackWidth, // Consistent width
                height: rackHeight, // Consistent height
                fontSize: "0.5em",
                flexDirection: "row",
              }}
              onClick={() => handleOpenModal(location, potentialRackName)}
            >
              {potentialRackName}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
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
          className=""
        >
          {renderRacks(racks.topLeft, "horizontal", "topLeft")}
        </div>
        <div
          style={{
            gridColumn: "1 / 2",
            gridRow: "2 / 3",
          }}
          className=""
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
          className="px-2"
        >
          <EditWarehouseFieldGrid warehouse={warehouse} />
        </div>
        <div
          style={{
            gridColumn: "3 / 4",
            gridRow: "1 / 2",
          }}
          className=""
        >
          {renderRacks(racks.topRight, "horizontal", "topRight")}
        </div>
        <div
          style={{
            gridColumn: "3 / 4",
            gridRow: "2 / 3",
          }}
          className=""
        >
          {renderRacks(racks.rightVertical, "vertical", "rightVertical")}
        </div>
        <div
          style={{
            gridColumn: "1 / 4",
            gridRow: "3 / 4",
          }}
          className=""
        >
          {renderRacks(racks.bottom, "horizontal", "bottom")}
        </div>
      </div>
      <RackModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        location={selectedLocation}
        defaultRackName={potentialRackName} // Pass the potential rack name to the modal
      />
    </>
  );
}
