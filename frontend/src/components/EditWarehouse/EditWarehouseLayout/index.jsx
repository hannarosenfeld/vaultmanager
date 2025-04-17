import { useState, useEffect, useCallback } from "react";
import { throttle } from "lodash";
import RackCreator from "./RackCreator";
import { useDispatch, useSelector } from 'react-redux';
import { fetchRacksThunk, addRackThunk, moveRackThunk, updateRackPositionThunk } from '../../../store/rack';
import { updateFieldGridThunk } from '../../../store/warehouse'; // Import the thunk

export default function EditWarehouseLayout({
  warehouse,
  fieldGridPosition,
  setFieldGridPosition,
}) {
  const FIELD_SIZE_FT = 1;
  const VAULT_SIZE_FT = 5;

  const [isDragging, setIsDragging] = useState(false);
  const [dragPreviewPosition, setDragPreviewPosition] = useState(null);
  const [invalidDrop, setInvalidDrop] = useState(false); // Define invalidDrop with a default value
  const aspectRatio = warehouse.width / warehouse.length;

  const dispatch = useDispatch();
  const racks = useSelector((state) => state.rack.racks);

  // Fetch racks when the component mounts
  useEffect(() => {
    if (warehouse.id) {
      dispatch(fetchRacksThunk(warehouse.id));
    }
  }, [warehouse.id, dispatch]);

  // Utility function to clamp coordinates
  const clampPosition = (x, y, width, height, maxWidth, maxHeight) => {
    // Ensure all values are valid numbers
    const validX = isNaN(x) || x === null ? 0 : x;
    const validY = isNaN(y) || y === null ? 0 : y;
    const validWidth = isNaN(width) || width === null ? 0 : width;
    const validHeight = isNaN(height) || height === null ? 0 : height;

    // Debugging: Log the validated input values
    console.log("🔍 Validating clampPosition inputs:", { validX, validY, validWidth, validHeight });

    return {
      x: Math.max(0, Math.min(validX, maxWidth - validWidth)),
      y: Math.max(0, Math.min(validY, maxHeight - validHeight)),
    };
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
      await dispatch(updateFieldGridThunk(warehouse.id, newPosition));
      console.log("Field grid position saved:", newPosition);
    } catch (error) {
      console.error("Error saving field grid position:", error);
    }
  };

  const handleRackDrop = async (e) => {
    const warehouseEl = e.target.closest(".warehouse-grid");
    const rect = warehouseEl.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * warehouse.width;
    const y = ((e.clientY - rect.top) / rect.height) * warehouse.length;

    let rackData;
    try {
      rackData = JSON.parse(e.dataTransfer.getData("rack"));
    } catch (error) {
      console.error("Error parsing rack data:", error);
      return; // Exit if rack data is invalid
    }

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
      dispatch(moveRackThunk(warehouse.id, rackData.id, updatedPosition));
    } else {
      const newRack = {
        name: rackData.name || "Unnamed Rack",
        capacity: 100,
        position: updatedPosition,
      };
      dispatch(addRackThunk(warehouse.id, newRack));
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
  };

  const handleRackDragEnd = async (e, rack) => {
    const warehouseEl = e.target.closest(".warehouse-grid");
    const rect = warehouseEl.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * warehouse.width;
    const y = ((e.clientY - rect.top) / rect.height) * warehouse.length;

    // Debugging: Log the raw input values
    console.log("🔍 Raw input values for rack position:", { x, y });

    const updatedPosition = clampPosition(
      x,
      y,
      rack.position.width,
      rack.position.height,
      warehouse.width,
      warehouse.length
    );

    // Debugging: Log the calculated position
    console.log("🔍 Calculated rack position:", updatedPosition);

    // Validate position before sending to the backend
    if (isNaN(updatedPosition.x) || isNaN(updatedPosition.y)) {
      console.error("❌ Invalid rack position:", updatedPosition);
      return;
    }

    try {
      await dispatch(updateRackPositionThunk(warehouse.id, rack.id, updatedPosition));
      console.log("✅ Rack position saved:", updatedPosition);
    } catch (error) {
      console.error("❌ Error saving rack position:", error);
    }
  };

  if (!warehouse.width || !warehouse.length) {
    return null; // Do not render if width or length is undefined
  }

  return (
    <>
      <h2 className="text-lg font-bold">Edit Warehouse Layout</h2>
      <RackCreator />
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
              onDragStart={(e) => handleRackDragStart(e, rack)}
              onDragEnd={(e) => handleRackDragEnd(e, rack)}
              style={{
                position: "absolute",
                top: `${(rack.position.y / warehouse.length) * 100}%`,
                left: `${(rack.position.x / warehouse.width) * 100}%`,
                width: `${(rack.position.width / warehouse.width) * 100}%`,
                height: `${(rack.position.height / warehouse.length) * 100}%`,
                backgroundColor: "rgba(0, 0, 255, 0.2)",
                border: "1px solid blue",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden", // Hide overflow
              }}
            >
              <span
                className="text-xs text-center"
                style={{
                  whiteSpace: "nowrap", // Prevent text wrapping
                  overflow: "hidden", // Hide overflow
                  textOverflow: "ellipsis", // Add ellipsis for overflowed text
                }}
              >
                {rack.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
