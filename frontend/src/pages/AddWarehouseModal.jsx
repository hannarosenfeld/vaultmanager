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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const warehouseData = {
      name,
      rows: parseInt(rows, 10),
      cols: parseInt(cols, 10),
    };
    const result = await dispatch(addWarehouseThunk(warehouseData));
    setIsLoading(false);
    if (!result.error) {
      navigate("/"); // Redirect to the home page or warehouse list page after adding
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-4 rounded-lg">
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
            Number of Rows
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
            Number of Cols
          </label>
          <input
            type="number"
            id="cols"
            value={cols}
            onChange={(e) => setCols(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5  "
            placeholder="Number of Cols"
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
    </div>
  );
}