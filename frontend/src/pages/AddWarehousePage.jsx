import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addWarehouseThunk } from "../store/warehouse";

export default function AddWarehouse() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [rows, setRows] = useState("");
  const [cols, setCols] = useState("");
  const [capacity, setCapacity] = useState("");
  const [length, setLength] = useState(""); // Length in feet
  const [width, setWidth] = useState(""); // Width in feet
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const warehouseData = {
      name,
      rows: parseInt(rows, 10),
      cols: parseInt(cols, 10),
      field_capacity: parseInt(capacity, 10),
      length: parseFloat(length), // Include length in feet
      width: parseFloat(width), // Include width in feet
    };
    const result = await dispatch(addWarehouseThunk(warehouseData));
    setIsLoading(false);
    if (!result.error) {
      navigate("/"); // Redirect to the home page or warehouse list page after adding
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-4 rounded-lg">
      <h1 className="text-2xl font-semibold mb-4">Add Warehouse</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
            placeholder="Warehouse Name"
            required
          />
        </div>
        <div className="mb-5">
          <label htmlFor="rows" className="block mb-2 text-sm font-medium text-gray-900 ">
            Field Grid: Number of Rows
          </label>
          <input
            type="number"
            id="rows"
            value={rows}
            onChange={(e) => setRows(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
            placeholder="Number of Rows"
            required
          />
        </div>
        <div className="mb-5">
          <label htmlFor="cols" className="block mb-2 text-sm font-medium text-gray-900 ">
            Field Grid: Number of Columns
          </label>
          <input
            type="number"
            id="cols"
            value={cols}
            onChange={(e) => setCols(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  "
            placeholder="Number of Columns"
            required
          />
        </div>
        <div className="mb-5">
          <label htmlFor="capacity" className="block mb-2 text-sm font-medium text-gray-900 ">
            Field Capacity
          </label>
          <input
            type="number"
            id="capacity"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Field Capacity"
            required
          />
        </div>
        <div className="mb-5">
          <label htmlFor="length" className="block mb-2 text-sm font-medium text-gray-900 ">
            Length (feet)
          </label>
          <input
            type="number"
            id="length"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Length of the Warehouse (in feet)"
            required
          />
        </div>
        <div className="mb-5">
          <label htmlFor="width" className="block mb-2 text-sm font-medium text-gray-900 ">
            Width (feet)
          </label>
          <input
            type="number"
            id="width"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Width of the Warehouse (in feet)"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Adding..." : "Add Warehouse"}
        </button>
      </form>

      {/* Warehouse Preview */}
      <div className="mt-10 flex justify-center items-center">
        <h2 className="text-xl font-semibold mb-4">Warehouse Preview</h2>
        <div
          style={{
            width: `${width * 2}px`, // Scale up the width for better visibility
            height: `${length * 2}px`, // Scale up the length for better visibility
            border: "2px solid black",
            backgroundColor: "#f0f0f0",
            position: "relative",
            margin: "0 auto", // Center horizontally
          }}
        >
          <p
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: "14px",
              color: "#333",
            }}
          >
            {width && length ? `${width} ft x ${length} ft` : "Enter dimensions"}
          </p>
        </div>
      </div>
    </div>
  );
}