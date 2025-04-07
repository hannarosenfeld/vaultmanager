import ActionButton from "./ActionButton";
import EditWarehouseFieldGrid from "./EditWarehouseFieldGrid";

export default function WarehouseView({
  warehouse,
  openModal,
  handleSubmit,
}) {
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
      <div className="mt-6 w-full max-w-md p-4 border border-gray-300 rounded-lg">
        <label
          htmlFor="field_capacity"
          className="mb-2 text-sm font-medium text-gray-700"
        >
          Field Capacity
        </label>
        <div className="flex mt-2">
          <input
            type="number"
            id="field_capacity"
            max="10"
            min="0"
            className="border border-gray-300 text-sm rounded-lg w-full p-2.5"
            placeholder="Field Capacity"
          />
          <button
            onClick={() => {
              const fieldCapacity = document.getElementById("field_capacity").value;
              handleSubmit(fieldCapacity);
            }}
            className="ml-2 text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
}
