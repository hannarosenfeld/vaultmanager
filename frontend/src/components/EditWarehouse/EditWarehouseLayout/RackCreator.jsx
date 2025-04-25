import { useState } from "react";

export default function RackCreator() {
  const rackDimensions = [
    { id: "12x4", label: "12ft x 4ft", width: 12, length: 4 },
    { id: "8x4", label: "8ft x 4ft", width: 8, length: 4 },
  ];

  const rackDirections = [
    { id: "horizontal", label: "Horizontal", icon: "↔️" },
    { id: "vertical", label: "Vertical", icon: "↕️" },
  ];

  const [selectedDimension, setSelectedDimension] = useState(rackDimensions[0]);
  const [selectedOrientation, setSelectedOrientation] = useState(rackDirections[0]);
  const [previewPosition, setPreviewPosition] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPreviewPosition({ x, y });
  };

  const handleDragEnd = () => {
    setPreviewPosition(null); // Clear preview position after drag ends
  };

  const getRackStyle = () => {
    const isHorizontal = selectedOrientation.id === "horizontal";
    const rackWidthFt = isHorizontal
      ? selectedDimension.width
      : selectedDimension.length;
    const rackHeightFt = isHorizontal
      ? selectedDimension.length
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
    <div
      className="w-full p-2 mb-4 mt-2"
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <h3 className="text-md font-semibold mb-2 text-center">Add a Rack</h3>

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
                <label className="block text-sm font-medium">Length (ft)</label>
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
                <label className="block text-sm font-medium">Width (ft)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={selectedDimension.length}
                  onChange={(e) =>
                    setSelectedDimension((prev) => ({
                      ...prev,
                      length: parseFloat(e.target.value),
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
                value={selectedOrientation.id}
                onChange={(e) =>
                  setSelectedOrientation(
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
            className="w-1/3 bg-blue-50 rounded shadow flex items-center justify-center p-4 relative"
            style={{ width: "200px", height: "200px" }}
          >
            {/* Green preview */}
            {previewPosition && (
              <div
                style={{
                  position: "absolute",
                  top: `${previewPosition.y}px`,
                  left: `${previewPosition.x}px`,
                  width: `${selectedDimension.width * 10}px`,
                  height: `${selectedDimension.length * 10}px`,
                  backgroundColor: "rgba(0, 255, 0, 0.3)",
                  border: "1px dashed green",
                  pointerEvents: "none",
                }}
              />
            )}

            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  "rack",
                  JSON.stringify({
                    name: selectedDimension.name || "Unnamed Rack",
                    width: selectedDimension.width,
                    length: selectedDimension.length,
                    orientation: selectedOrientation.id,
                  })
                );
              }}
              style={getRackStyle()}
            >
              {selectedDimension.name || "Rack"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
