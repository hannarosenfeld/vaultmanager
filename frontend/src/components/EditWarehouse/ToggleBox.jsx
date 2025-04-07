import { useState } from "react";

export default function ToggleBox({ viewMode, setViewMode }) {
  return (
    <div className="mb-6 w-full max-w-md p-4 border border-gray-300 rounded-lg flex flex-col items-center">
      <div className="flex items-center gap-4">
        <label className="flex items-center">
          <span className="mr-2">Warehouse</span>
          <div
            className={`relative inline-block w-12 h-6 ${
              viewMode === "Rack" ? "bg-blue-600" : "bg-gray-300"
            } rounded-full cursor-pointer`}
            onClick={() =>
              setViewMode(viewMode === "Warehouse" ? "Rack" : "Warehouse")
            }
          >
            <div
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                viewMode === "Rack" ? "transform translate-x-6" : ""
              }`}
            ></div>
          </div>
          <span className="ml-2">Rack</span>
        </label>
      </div>
    </div>
  );
}
