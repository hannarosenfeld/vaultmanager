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

  const [rackDragPreview, setRackDragPreview] = useState(null); // State for rack drag preview

  const dispatch = useDispatch();
  const racks = useSelector((state) => state.rack.racks);

  // Fetch racks when the component mounts
  useEffect(() => {
    if (warehouse.id) {
      dispatch(fetchRacksThunk(warehouse.id));
    }
  }, [warehouse.id, dispatch]);

  // Utility function to clamp coordinates
  const clampPosition = (x, y, width, length, maxWidth, maxHeight, orientation) => {
    const adjustedWidth = orientation === "horizontal" ? width : length;
    const adjustedLength = orientation === "horizontal" ? length : width;

    const clampedX = Math.max(0, Math.min(x, maxWidth - adjustedWidth));
    const clampedY = Math.max(0, Math.min(y, maxHeight - adjustedLength));

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

  const handleRackDrop = async (event) => {
    event.preventDefault();
    try {
      const rackData = JSON.parse(event.dataTransfer.getData("rack"));

      // Debugging: Log the entire rackData object
      console.log("📦 Rack data from drop event:", rackData);

      // Validate width and length
      if (!rackData.width || !rackData.length) {
        console.error("❌ Rack width or length is undefined. Drop is not allowed.");
        console.error("🔍 Full rack data:", rackData); // Log full rack data for debugging
        return;
      }

      const warehouseEl = event.target.closest(".warehouse-grid");
      if (!warehouseEl) {
        console.error("❌ Warehouse grid element not found during drop.");
        return;
      }

      const rect = warehouseEl.getBoundingClientRect();

      const x = ((event.clientX - rect.left) / rect.width) * warehouse.width;
      const y = ((event.clientY - rect.top) / rect.height) * warehouse.length;

      const { x: clampedX, y: clampedY } = clampPosition(
        x,
        y,
        rackData.width,
        rackData.length,
        warehouse.width,
        warehouse.length,
        rackData.orientation // Pass orientation here
      );

      const updatedPosition = {
        x: clampedX,
        y: clampedY,
        width: rackData.width,
        length: rackData.length,
      };

      if (rackData.id) {
        // Update existing rack position
        await dispatch(
          moveRackThunk(warehouse.id, rackData.id, {
            ...updatedPosition,
            orientation: rackData.orientation, // Ensure orientation is included
          })
        );
      } else {
        // Add a new rack
        const newRack = {
          name: rackData.name || "Unnamed Rack",
          capacity: 100,
          position: updatedPosition,
          orientation: rackData.orientation,
          num_shelves: rackData.num_shelves || 1, // Include the number of shelves
        };
        await dispatch(addRackThunk(warehouse.id, newRack));
      }
    } catch (error) {
      console.error("❌ Error handling rack drop:", error);
    }

    setRackDragPreview(null); // Clear rack drag preview after drop
  };

  const handleRackDragStart = (e, rack) => {
    e.dataTransfer.setData(
      "rack",
      JSON.stringify({
        id: rack.id,
        name: rack.name,
        width: rack.width, // Ensure width is included
        length: rack.length, // Ensure length is included
        x: rack.position.x,
        y: rack.position.y,
        orientation: rack.orientation,
      })
    );
  };

  const handleRackDrag = useCallback(
    throttle((e, rack) => {
      const warehouseEl = e.target.closest(".warehouse-grid");
      if (!warehouseEl) return;
      const rect = warehouseEl.getBoundingClientRect();

      const x = ((e.clientX - rect.left) / rect.width) * warehouse.width;
      const y = ((e.clientY - rect.top) / rect.height) * warehouse.length;

      // Pass the orientation to clampPosition
      const { x: clampedX, y: clampedY } = clampPosition(
        x,
        y,
        rack.width, // Use rack.width directly
        rack.length, // Use rack.length directly
        warehouse.width,
        warehouse.length,
        rack.orientation // Pass orientation here
      );

      setRackDragPreview({
        x: clampedX,
        y: clampedY,
        width: rack.orientation === "horizontal" ? rack.width : rack.length, // Correct width
        height: rack.orientation === "horizontal" ? rack.length : rack.width, // Correct height
      });
    }, 100),
    [warehouse]
  );

  const handleRackDragEnd = async (e, rack) => {
    const warehouseEl = e.target.closest(".warehouse-grid");
    const rect = warehouseEl.getBoundingClientRect();

    const x = ((e.clientX - rect.left) / rect.width) * warehouse.width;
    const y = ((e.clientY - rect.top) / rect.height) * warehouse.length;

    const updatedPosition = clampPosition(
      x,
      y,
      rack.width,
      rack.length,
      warehouse.width,
      warehouse.length,
      rack.orientation // Pass orientation here
    );

    try {
      await dispatch(
        updateRackPositionThunk(warehouse.id, rack.id, {
          x: updatedPosition.x,
          y: updatedPosition.y,
        })
      );
    } catch (error) {
      console.error("Error updating rack position:", error);
    }

    setRackDragPreview(null);
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
          class={`warehouse-grid ${invalidDrop ? "bg-red-200" : ""}`}
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
                backgroundColor: "rgba(0, 255, 0, 0.2)", // Green background
                border: "2px dashed green", // Green border
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
            const isHorizontal = rack.orientation === "horizontal";
            const rackWidth = isHorizontal ? rack.width : rack.length;
            const rackHeight = isHorizontal ? rack.length : rack.width;

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
                }}
              >
                <span className="text-xs text-center">{rack.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
