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

  const [rackDragPreview, setRackDragPreview] = useState(null); // Add state for rack drag preview
  const [initialRackPreview, setInitialRackPreview] = useState(null); // State for initial rack placement preview

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

    // Debugging: Log the input values
    console.log("🔍 clampPosition inputs:", { validX, validY, validWidth, validHeight, maxWidth, maxHeight });

    // Adjust clamping to ensure racks can be placed exactly at the top border
    const clampedX = Math.max(0, Math.min(validX, maxWidth - validWidth));
    const clampedY = Math.max(0, Math.min(validY, maxHeight - validHeight));

    // Debugging: Log the clamped values
    console.log("✅ Clamped position:", { clampedX, clampedY });

    return { x: clampedX, y: clampedY };
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
    if (!warehouseEl) {
      console.error("❌ Warehouse grid element not found during drop.");
      return;
    }
  
    const rect = warehouseEl.getBoundingClientRect();
  
    const x = ((e.clientX - rect.left) / rect.width) * warehouse.width;
    const y = ((e.clientY - rect.top) / rect.height) * warehouse.length;
  
    let rackData;
    try {
      rackData = JSON.parse(e.dataTransfer.getData("rack"));
    } catch (error) {
      console.error("❌ Error parsing rack data from drop event:", error);
      return; // Exit if rack data is invalid
    }
  
    console.log("📦 Rack data from drop event:", rackData);
  
    // Validate rack dimensions
    if (rackData.width === undefined || rackData.height === undefined) {
      console.error("❌ Rack width or height is undefined. Drop is not allowed.");
      alert("Rack dimensions are missing. Please try again.");
      return; // Prevent the drop
    }
  
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
  
    try {
      if (rackData.id) {
        // Update existing rack position
        await dispatch(
          moveRackThunk(warehouse.id, rackData.id, {
            ...updatedPosition,
            orientation: rackData.orientation, // Rename to orientation
          })
        );
        console.log("✅ Rack moved successfully:", updatedPosition);
      } else {
        // Add a new rack
        const newRack = {
          name: rackData.name || "Unnamed Rack",
          capacity: 100,
          position: updatedPosition,
          orientation: rackData.orientation, // Rename to orientation
        };
        await dispatch(addRackThunk(warehouse.id, newRack));
        console.log("✅ New rack added successfully:", newRack);
      }
    } catch (error) {
      console.error("❌ Error handling rack drop:", error);
    }
  
    setRackDragPreview(null); // Clear rack drag preview after drop
    setInitialRackPreview(null); // Clear initial rack preview
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
        orientation: rack.orientation, // Rename to orientation
      })
    );
    setInitialRackPreview(rack); // Set the initial rack preview
  };

  const handleRackDrag = useCallback(
    throttle((e, rack) => {
      const warehouseEl = e.target.closest(".warehouse-grid");
      if (!warehouseEl) return;
      const rect = warehouseEl.getBoundingClientRect();

      const x = ((e.clientX - rect.left) / rect.width) * warehouse.width;
      const y = ((e.clientY - rect.top) / rect.height) * warehouse.length;

      // Determine rack dimensions based on its orientation
      const isHorizontal = rack.orientation === "horizontal"; // Rename to orientation
      const rackWidth = isHorizontal ? rack.position.width : rack.position.height;
      const rackHeight = isHorizontal ? rack.position.height : rack.position.width;

      const { x: clampedX, y: clampedY } = clampPosition(
        x,
        y,
        rackWidth,
        rackHeight,
        warehouse.width,
        warehouse.length
      );

      setRackDragPreview({
        x: clampedX,
        y: clampedY,
        width: rackWidth,
        height: rackHeight,
      });
    }, 100),
    [warehouse]
  );

  const handleRackDragEnd = async (e, rack) => {
    const warehouseEl = e.target.closest(".warehouse-grid");
    const rect = warehouseEl.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * warehouse.width;
    const y = ((e.clientY - rect.top) / rect.height) * warehouse.length;

    console.log("🔍 Raw input values for rack position:", { x, y });

    const updatedPosition = clampPosition(
      x,
      y,
      rack.position.width,
      rack.position.height,
      warehouse.width,
      warehouse.length
    );

    console.log("🔍 Calculated rack position:", updatedPosition);

    if (isNaN(updatedPosition.x) || isNaN(updatedPosition.y)) {
      console.error("❌ Invalid rack position:", updatedPosition);
      return;
    }

    try {
      await dispatch(
        updateRackPositionThunk(warehouse.id, rack.id, {
          ...updatedPosition,
          width: rack.position.width,
          height: rack.position.height,
          orientation: rack.orientation, // Ensure orientation is included
        })
      );

      console.log("✅ Rack position saved:", updatedPosition);

      // Update the local Redux state to reflect the changes immediately
      const updatedRacks = racks.map((r) =>
        r.id === rack.id
          ? { ...r, position: updatedPosition, orientation: rack.orientation }
          : r
      );
      dispatch({ type: "rack/SET_RACKS", racks: updatedRacks });
    } catch (error) {
      console.error("❌ Error saving rack position:", error);
    }

    setRackDragPreview(null);
    setInitialRackPreview(null);
  };

  const handleRackClick = (rack) => {
    console.log("🛠 Rack Info:", rack);
    alert(`Rack Info:\nName: ${rack.name}\nOrientation: ${rack.orientation}\nPosition: (${rack.position.x}, ${rack.position.y})`);
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

          {rackDragPreview && (
            <div
              style={{
                position: "absolute",
                top: `${(rackDragPreview.y / warehouse.length) * 100}%`,
                left: `${(rackDragPreview.x / warehouse.width) * 100}%`,
                width: `${(rackDragPreview.width / warehouse.width) * 100}%`,
                height: `${(rackDragPreview.height / warehouse.length) * 100}%`,
                backgroundColor: "rgba(0, 255, 0, 0.2)",
                border: "2px dashed green",
                pointerEvents: "none",
              }}
            />
          )}

          {initialRackPreview && (
            <div
              style={{
                position: "absolute",
                top: "0%", // Default preview position
                left: "0%",
                width: `${(initialRackPreview.width / warehouse.width) * 100}%`,
                height: `${
                  (initialRackPreview.height / warehouse.length) * 100
                }%`,
                backgroundColor: "rgba(255, 165, 0, 0.2)",
                border: "2px dashed orange",
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

          {racks.map((rack, index) => {
            // Determine rack dimensions based on its orientation
            const isHorizontal = rack.orientation === "horizontal"; // Ensure orientation is used
            const rackWidth = isHorizontal ? rack.position.width : rack.position.height;
            const rackHeight = isHorizontal ? rack.position.height : rack.position.width;
          
            return (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleRackDragStart(e, rack)}
                onDrag={(e) => handleRackDrag(e, rack)}
                onDragEnd={(e) => handleRackDragEnd(e, rack)}
                onClick={() => handleRackClick(rack)} // Add onClick handler
                style={{
                  position: "absolute",
                  top: `${(rack.position.y / warehouse.length) * 100}%`,
                  left: `${(rack.position.x / warehouse.width) * 100}%`,
                  width: `${(rackWidth / warehouse.width) * 100}%`,
                  height: `${(rackHeight / warehouse.length) * 100}%`,
                  backgroundColor: "rgba(0, 0, 255, 0.2)",
                  border: "1px solid blue",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  cursor: "pointer", // Indicate clickable
                }}
              >
                <span
                  className="text-xs text-center"
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {rack.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
