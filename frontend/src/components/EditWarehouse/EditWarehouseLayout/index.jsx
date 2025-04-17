import { useState, useEffect, useCallback } from "react";
import { throttle } from "lodash";
import RackCreator from "./RackCreator";
import { useDispatch } from 'react-redux';
import { moveRackThunk } from '../../../store/rack'; // Import moveRackThunk

export default function EditWarehouseLayout({
  warehouse,
  fieldGridPosition,
  setFieldGridPosition,
}) {
  const FIELD_SIZE_FT = 1;
  const VAULT_SIZE_FT = 5;

  const [isDragging, setIsDragging] = useState(false);
  const [dragPreviewPosition, setDragPreviewPosition] = useState(null);
  const aspectRatio = warehouse.width / warehouse.length;

  const [racks, setRacks] = useState([]);
  const [invalidDrop, setInvalidDrop] = useState(false);

  const dispatch = useDispatch();

  // Initialize racks state with existing racks from the warehouse
  useEffect(() => {
    if (warehouse.racks) {
      setRacks(warehouse.racks);
    }
  }, [warehouse.racks]);

  // Fetch racks from the database when the component mounts
  useEffect(() => {
    const fetchRacks = async () => {
      try {
        const response = await fetch(`/api/warehouse/${warehouse.id}/racks`);
        if (response.ok) {
          const data = await response.json();
          setRacks(data);
        } else {
          console.error("Error fetching racks:", await response.json());
        }
      } catch (error) {
        console.error("Error fetching racks:", error);
      }
    };

    if (warehouse.id) {
      fetchRacks();
    }
  }, [warehouse.id]);

  // Utility function to clamp coordinates
  const clampPosition = (x, y, width, height, maxWidth, maxHeight) => ({
    x: Math.max(0, Math.min(x, maxWidth - width)),
    y: Math.max(0, Math.min(y, maxHeight - height)),
  });

  // Utility function to update rack position in state
  const updateRackPositionInState = (rackId, updatedPosition, setRacks) => {
    setRacks((prev) =>
      prev.map((rack) =>
        rack.id === rackId ? { ...rack, position: updatedPosition } : rack
      )
    );
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setDragImage(new Image(), 0, 0);
    setIsDragging(true);
  };

  const handleDrag = useCallback(
    throttle((e) => {
      const warehouseEl = e.target.closest(".warehouse-grid");
      if (!warehouseEl) return;
      const rect = warehouseEl.getBoundingClientRect();

      const x = ((e.clientX - rect.left) / rect.width) * warehouse.width;
      const y = ((e.clientY - rect.top) / rect.height) * warehouse.length;

      const { x: clampedX, y: clampedY } = clampPosition(
        x,
        y,
        warehouse.cols * FIELD_SIZE_FT,
        warehouse.rows * FIELD_SIZE_FT,
        warehouse.width,
        warehouse.length
      );

      setDragPreviewPosition({ x: clampedX, y: clampedY });
    }, 100),
    [warehouse]
  );

  const handleDragEnd = async (e) => {
    const warehouseEl = e.target.closest(".warehouse-grid");
    const rect = warehouseEl.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * warehouse.width;
    const y = ((e.clientY - rect.top) / rect.height) * warehouse.length;

    const newPosition = clampPosition(
      x,
      y,
      warehouse.cols * VAULT_SIZE_FT,
      warehouse.rows * VAULT_SIZE_FT,
      warehouse.width,
      warehouse.length
    );

    setFieldGridPosition(newPosition);
    setIsDragging(false);
    setDragPreviewPosition(null);

    try {
      const response = await fetch(`/api/warehouse/${warehouse.id}/field-grid`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fieldgridLocation: newPosition }),
      });

      if (response.ok) {
        console.log("Field grid position saved:", newPosition);
      } else {
        console.error("Error saving field grid position:", await response.json());
      }
    } catch (error) {
      console.error("Error saving field grid position:", error);
    }
  };

  const handleRackDrop = async (e) => {
    const warehouseEl = e.target.closest(".warehouse-grid");
    const rect = warehouseEl.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * warehouse.width;
    const y = ((e.clientY - rect.top) / rect.height) * warehouse.length;

    const rackData = JSON.parse(e.dataTransfer.getData("rack"));
    console.log("📦 Rack data from drag event:", rackData);

    const { x: clampedX, y: clampedY } = clampPosition(
      x,
      y,
      rackData.width,
      rackData.height,
      warehouse.width,
      warehouse.length
    );

    const updatedPosition = {
      x: clampedX,
      y: clampedY,
      width: rackData.width,
      height: rackData.height,
    };

    if (rackData.id) {
      console.log("🔄 Moving existing rack:", { id: rackData.id, updatedPosition });

      try {
        const response = await fetch(
          `/api/warehouse/${warehouse.id}/rack/${rackData.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ position: updatedPosition }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Rack position updated successfully:", data);
          updateRackPositionInState(rackData.id, updatedPosition, setRacks);
        } else {
          console.error("❌ Error updating rack position:", await response.json());
        }
      } catch (error) {
        console.error("❌ Error updating rack position:", error);
      }
    } else {
      const newRack = {
        name: rackData.name || "Unnamed Rack",
        capacity: 100,
        position: updatedPosition,
      };

      console.log("📍 Creating new rack:", newRack);

      try {
        const response = await fetch(`/api/racks/warehouse/${warehouse.id}/add`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newRack),
        });

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Rack saved successfully:", data);
          setRacks((prev) => [...prev, data]);
        } else {
          console.error("❌ Error saving rack position:", await response.json());
        }
      } catch (error) {
        console.error("❌ Error saving rack position:", error);
      }
    }
  };

  const handleRackDragStart = (e, rack) => {
    e.dataTransfer.setData(
      "rack",
      JSON.stringify({
        id: rack.id,
        name: rack.name,
        width: rack.position.width,
        height: rack.position.height,
        x: rack.position.x,
        y: rack.position.y,
      })
    );
    console.log("📦 Dragging rack:", {
      id: rack.id,
      name: rack.name,
      width: rack.position.width,
      height: rack.position.height,
      x: rack.position.x,
      y: rack.position.y,
    });
  };

  const handleRackDragEnd = (e, rack) => {
    const warehouseEl = e.target.closest(".warehouse-grid");
    const rect = warehouseEl.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * warehouse.width;
    const y = ((e.clientY - rect.top) / rect.height) * warehouse.length;

    const updatedPosition = clampPosition(
      x,
      y,
      rack.position.width,
      rack.position.height,
      warehouse.width,
      warehouse.length
    );

    console.log("🔄 Moving rack:", { id: rack.id, updatedPosition });

    // Dispatch the thunk to update the rack position
    dispatch(moveRackThunk(warehouse.id, rack.id, updatedPosition));
  };

  if (!warehouse.width || !warehouse.length) {
    return null; // Do not render if width or length is undefined
  }

  return (
    <>
      <h2 className="text-lg font-bold">Edit Warehouse Layout</h2>
      {/* Rack Selection */}
      <RackCreator />

      {/* Warehouse Visual */}
      <div
        className="relative w-full overflow-hidden bg-white"
        style={{ aspectRatio }}
      >
        <div
          className={`warehouse-grid ${invalidDrop ? "bg-red-200" : ""}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleRackDrop}
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            backgroundImage:
              "linear-gradient(to right, #ddd 1px, transparent 1px), linear-gradient(to bottom, #ddd 1px, transparent 1px)",
            backgroundSize: `${(FIELD_SIZE_FT / warehouse.width) * 100}% ${
              (FIELD_SIZE_FT / warehouse.length) * 100
            }%`,
          }}
        >
          {isDragging && dragPreviewPosition && (
            <div
              style={{
                position: "absolute",
                top: `${(dragPreviewPosition.y / warehouse.length) * 100}%`,
                left: `${(dragPreviewPosition.x / warehouse.width) * 100}%`,
                width: `${
                  ((warehouse.cols * VAULT_SIZE_FT) / warehouse.width) * 100
                }%`,
                height: `${
                  ((warehouse.rows * VAULT_SIZE_FT) / warehouse.length) * 100
                }%`,
                backgroundColor: "rgba(0, 0, 255, 0.2)",
                border: "2px dashed blue",
                pointerEvents: "none",
              }}
            />
          )}

          <div
            draggable
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={{
              position: "absolute",
              top: `${(fieldGridPosition.y / warehouse.length) * 100}%`,
              left: `${(fieldGridPosition.x / warehouse.width) * 100}%`,
              width: `${
                ((warehouse.cols * VAULT_SIZE_FT) / warehouse.width) * 100 + 3.1
              }%`,
              height: `${
                ((warehouse.rows * VAULT_SIZE_FT) / warehouse.length) * 100 + 1.9
              }%`,
              cursor: "grab",
              backgroundColor: "rgba(0, 0, 255, 0.1)",
              display: "flex", // Added to center content
              alignItems: "center", // Center vertically
              justifyContent: "center", // Center horizontally
            }}
          >
            <span
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "black",
              }}
            >
              VAULTS
            </span>
          </div>

          {racks.map((rack, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => handleRackDragStart(e, rack)} // Set dataTransfer payload
              onDragEnd={(e) => handleRackDragEnd(e, rack)} // Call updated drag end handler
              style={{
                position: "absolute",
                top: `${(rack.position.y / warehouse.length) * 100}%`, // Use rack.position.y
                left: `${(rack.position.x / warehouse.width) * 100}%`, // Use rack.position.x
                width: `${(rack.position.width / warehouse.width) * 100}%`, // Use rack.position.width
                height: `${(rack.position.height / warehouse.length) * 100}%`, // Use rack.position.height
                backgroundColor: "rgba(0, 0, 255, 0.2)",
                border: "1px solid blue",
              }}
            >
              <span style={{ fontSize: "0.8rem", color: "black" }}>
                {rack.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
