import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EditWarehouseFieldGrid from "../components/EditWarehouse/EditWarehouseFieldGrid";
import { setCurrentWarehouse } from "../store/warehouse";
import LoadingSpinner from "../components/LoadingSpinner";
import ActionButton from "../components/EditWarehouse/ActionButton";
import EditWarehouseModal from "../components/EditWarehouse/EditWarehouseModal";

export default function EditWarehousePage() {
  const dispatch = useDispatch();
  const { warehouseName } = useParams();
  const warehouses = useSelector((state) => state.warehouse.warehouses);
  const warehouse = useSelector((state) => state.warehouse.currentWarehouse);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundWarehouse = Object.values(warehouses).find(
      (w) =>
        w.name.toLowerCase().split(" ").join("-") ===
        warehouseName.toLowerCase()
    );
    if (foundWarehouse) {
      dispatch(setCurrentWarehouse(foundWarehouse));
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [dispatch, warehouseName, warehouses]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const openModal = (dir, operation) => {
    setModalProps({ dir, operation, warehouseId: warehouse.id });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    console.log("Field capacity submitted");
    // Add your submit logic here
  };

  return (
    <div className="flex flex-col items-center h-full mt-6">
      <h2 className="mb-1 text-xl font-semibold">{warehouse.name}</h2>
      <div className="mb-5 w-1/2 flex items-center">
        <div className="flex-grow">
          <label
            htmlFor="field_capacity"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Field Capacity
          </label>
          <input
            type="number"
            id="field_capacity"
            // value={formData.vault_id}
            // onChange={handleChange}
            className="border border-gray-300 text-sm rounded-lg w-full p-2.5"
            placeholder="Field Capacity"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="ml-4 mt-6 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600"
        >
          Submit
        </button>
      </div>
      <div className="flex w-full mt-4 justify-center">
        <div className="flex flex-col items-center mx-1 justify-center">
          <ActionButton onClick={() => openModal("left", "plus")} icon="add" />
          <ActionButton
            onClick={() => openModal("left", "minus")}
            icon="remove"
          />
        </div>
        <div className="flex-grow flex justify-center">
          <EditWarehouseFieldGrid warehouse={warehouse} />
        </div>
        <div className="flex flex-col items-center mx-1 justify-center">
          <ActionButton onClick={() => openModal("right", "plus")} icon="add" />
          <ActionButton
            onClick={() => openModal("right", "minus")}
            icon="remove"
          />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-4 justify-center">
        <ActionButton onClick={() => openModal("bottom", "plus")} icon="add" />
        <ActionButton
          onClick={() => openModal("bottom", "minus")}
          icon="remove"
        />
      </div>

      {isModalOpen && (
        <EditWarehouseModal
          {...modalProps}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
