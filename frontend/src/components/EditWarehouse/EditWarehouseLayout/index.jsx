import { useState, useCallback } from "react";
import { throttle } from "lodash";
import DragAndDropFieldGrid from "../DragAndDropFieldGrid";

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

  const handleDragEnd = (e) => {
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

    setFieldGridPosition({ x: clampedX, y: clampedY });
    setIsDragging(false);
    setDragPreviewPosition(null);

    // Simulate API call to update field grid position
    console.log("Updated field grid position:", { x: clampedX, y: clampedY });
  };

  const rackDimensions = [
    { id: "12x4", label: "12ft x 4ft", width: 12, height: 4 },
    { id: "8x4", label: "8ft x 4ft", width: 8, height: 4 },
  ];

  const rackDirections = [
    { id: "horizontal", label: "Horizontal", icon: "↔️" },
    { id: "vertical", label: "Vertical", icon: "↕️" },
  ];

  const [selectedDimension, setSelectedDimension] = useState(rackDimensions[0]);
  const [selectedDirection, setSelectedDirection] = useState(rackDirections[0]);

  const getRackStyle = () => {
    const isHorizontal = selectedDirection.id === "horizontal";
    const rackWidthFt = isHorizontal
      ? selectedDimension.width
      : selectedDimension.height;
    const rackHeightFt = isHorizontal
      ? selectedDimension.height
      : selectedDimension.width;

    const scale = 10; // 1 ft = 10px

    return {
      width: `${rackWidthFt * scale}px`,
      height: `${rackHeightFt * scale}px`,
      backgroundColor: "rgba(0, 0, 255, 0.1)",
      border: "1px solid blue",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.8rem",
      textAlign: "center",
    };
  };

  return (
    <>
      {/* Rack Selection */}
      <div className="w-full p-2 mb-4">
        <h3 className="text-lg font-semibold mb-2 text-center">Add a Rack</h3>

        <div className="flex flex-col md:flex-row w-full gap-4 items-start">
          <div className="flex w-full gap-4 items-stretch">
            <div className="flex-1 bg-gray-100 p-4 rounded shadow flex flex-col">
              <div className="mb-2">
                <label className="block text-sm font-medium">Rack Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={selectedDimension.name || ""}
                  onChange={(e) =>
                    setSelectedDimension((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium">
                    Width (ft)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={selectedDimension.width}
                    onChange={(e) =>
                      setSelectedDimension((prev) => ({
                        ...prev,
                        width: parseFloat(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium">
                    Height (ft)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={selectedDimension.height}
                    onChange={(e) =>
                      setSelectedDimension((prev) => ({
                        ...prev,
                        height: parseFloat(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium">Shelves</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  min="1"
                  value={selectedDimension.shelves || 1}
                  onChange={(e) =>
                    setSelectedDimension((prev) => ({
                      ...prev,
                      shelves: parseInt(e.target.value),
                    }))
                  }
                />
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium">Direction</label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedDirection.id}
                  onChange={(e) =>
                    setSelectedDirection(
                      rackDirections.find((dir) => dir.id === e.target.value)
                    )
                  }
                >
                  {rackDirections.map((dir) => (
                    <option key={dir.id} value={dir.id}>
                      {dir.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className="w-1/3 bg-blue-50 rounded shadow flex items-center justify-center p-4"
              style={{ width: "200px", height: "200px" }}
            >
              <div style={getRackStyle()}>
                {selectedDimension.name || "Rack"}
              </div>
            </div>
          </div>
        </div>
      </div>

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
