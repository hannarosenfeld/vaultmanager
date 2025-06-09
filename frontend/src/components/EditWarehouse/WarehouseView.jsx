import { useState } from "react";
import ActionButton from "./ActionButton";
import EditWarehouseFieldGrid from "./EditWarehouseFieldGrid";

export default function WarehouseView({
  warehouse,
  openModal,
  handleSubmit,
}) {
  const [fieldCapacity, setFieldCapacity] = useState(warehouse?.fieldCapacity || "");
  const [length, setLength] = useState(warehouse?.length || "");
  const [width, setWidth] = useState(warehouse?.width || "");

  return (
    <>
      <div className="flex w-full mt-4 justify-center">
        <div className="flex flex-col items-center mx-1 justify-center">
          <ActionButton onClick={() => openModal("left", "plus")} icon="add" />
          <ActionButton onClick={() => openModal("left", "minus")} icon="remove" />
        </div>
        <div className="flex-grow flex justify-center">
          <EditWarehouseFieldGrid warehouse={warehouse} />
        </div>
        <div className="flex flex-col items-center mx-1 justify-center">
          <ActionButton onClick={() => openModal("right", "plus")} icon="add" />
          <ActionButton onClick={() => openModal("right", "minus")} icon="remove" />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-4 justify-center">
        <ActionButton onClick={() => openModal("bottom", "plus")} icon="add" />
        <ActionButton onClick={() => openModal("bottom", "minus")} icon="remove" />
      </div>
      <div className="mt-6 w-full max-w-md p-6 border border-gray-300 rounded-lg bg-white shadow">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label
              htmlFor="field_capacity"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Field Capacity
            </label>
            <input
              type="number"
              id="field_capacity"
              max="10"
              min="0"
              className="border border-gray-300 text-sm rounded-lg w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Field Capacity"
              value={fieldCapacity}
              onChange={e => setFieldCapacity(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="warehouse_length" className="block mb-1 text-sm font-medium text-gray-700">
              Length
            </label>
            <input
              type="number"
              id="warehouse_length"
              min="0"
              className="border border-gray-300 text-sm rounded-lg w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Length"
              value={length}
              onChange={e => setLength(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="warehouse_width" className="block mb-1 text-sm font-medium text-gray-700">
              Width
            </label>
            <input
              type="number"
              id="warehouse_width"
              min="0"
              className="border border-gray-300 text-sm rounded-lg w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Width"
              value={width}
              onChange={e => setWidth(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                handleSubmit({
                  fieldCapacity,
                  length,
                  width,
                });
              }}
              className="mt-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-6 py-2.5 transition"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
