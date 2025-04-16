import { useState, useCallback } from "react";
import { throttle } from "lodash";
import axios from "axios";
import DragAndDropFieldGrid from "../DragAndDropFieldGrid";
import RackCreator from "./RackCreator";

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

      const clampedX = Math.max(
        0,
        Math.min(x, warehouse.width - warehouse.cols * FIELD_SIZE_FT)
      );
      const clampedY = Math.max(
        0,
        Math.min(y, warehouse.length - warehouse.rows * FIELD_SIZE_FT)
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

    const clampedX = Math.max(
      0,
      Math.min(x, warehouse.width - warehouse.cols * VAULT_SIZE_FT)
    );
    const clampedY = Math.max(
      0,
      Math.min(y, warehouse.length - warehouse.rows * VAULT_SIZE_FT)
    );

    const newPosition = { x: clampedX, y: clampedY };
    setFieldGridPosition(newPosition);
    setIsDragging(false);
    setDragPreviewPosition(null);

    try {
      await axios.put(`/api/warehouse/${warehouse.id}/field-grid`, {
        fieldgridLocation: newPosition,
      });
      console.log("Field grid position saved:", newPosition);
    } catch (error) {
      console.error("Error saving field grid position:", error);
    }
  };

  return (
    <>
      {/* Rack Selection */}
      <RackCreator />

      {/* Warehouse Visual */}
      <div
        className="relative w-full overflow-hidden bg-white"
        style={{ aspectRatio }}
      >
        <div
          className="warehouse-grid"
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
            }}
          >
            <DragAndDropFieldGrid warehouse={warehouse} />
          </div>
        </div>
      </div>
    </>
  );
}
