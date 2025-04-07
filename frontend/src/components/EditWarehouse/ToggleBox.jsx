import { useState } from "react";

export default function ToggleBox({ viewMode, setViewMode, onSubmit }) {
  const handleSubmit = () => {
    const fieldCapacity = document.getElementById("field_capacity").value;
    if (fieldCapacity > 10) {
      alert("Field capacity cannot exceed 10.");
      return;
    }
    if (fieldCapacity < 0) {
      alert("Field capacity cannot be less than 0.");
      return;
    }
    onSubmit(fieldCapacity);
  };

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
      <div className="mt-4 w-full flex">
        <div className="flex-grow">
          <input
            type="number"
            id="field_capacity"
            max="10"
            min="0"
            className="border border-gray-300 text-sm rounded-lg w-full p-2.5"
            placeholder="Field Capacity"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="ml-2 text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
