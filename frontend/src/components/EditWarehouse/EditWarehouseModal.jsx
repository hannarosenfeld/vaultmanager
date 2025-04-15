import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { addFieldsThunk, deleteFieldsThunk } from "../../store/warehouse";

export function EditWarehouseModal({ dir, operation, warehouseId, onClose }) {
  const dispatch = useDispatch();
  const warehouse = useSelector((state) => state.warehouse.warehouses[warehouseId]);
  const [count, setCount] = useState(1);

  const onSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("warehouse_id", warehouseId);
    formData.append("direction", dir);
    formData.append("operation", operation);
    formData.append("warehouse_cols", warehouse?.cols);
    formData.append("warehouse_rows", warehouse?.rows);
    formData.append("count", count);

    if (operation === "plus") dispatch(addFieldsThunk(formData));
    if (operation === "minus") dispatch(deleteFieldsThunk(formData));

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <form onSubmit={onSubmit}>
          <div className="mb-4 text-center">
            <h2 className="text-xl font-semibold mb-2">
              {operation === "plus" ? "Add" : "Subtract"} Rows
            </h2>
            <p className="text-gray-600">
              {operation === "plus" ? "Add" : "Subtract"}{" "}
              <span className="font-bold">{count}</span> row
              {count === 1 ? "" : "s"} {operation === "plus" ? "to" : "from"}{" "}
              warehouse <b>{dir}</b>
            </p>
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center border rounded w-32 justify-between">
              <button
                className="px-4 py-2 border-r"
                disabled={count === 1}
                onClick={(e) => {
                  e.preventDefault();
                  setCount(count - 1);
                }}
              >
                -
              </button>
              <span className="text-lg px-4">{count}</span>
              <button
                className="px-4 py-2 border-l"
                onClick={(e) => {
                  e.preventDefault();
                  setCount(count + 1);
                }}
              >
                +
              </button>
            </div>
          </div>
          <div className="flex justify-end mt-10">
            <button
              type="submit"
              className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800"
            >
              Submit
            </button>
            <button
              type="button"
              className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditWarehouseModal;