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

  return (
    <div className="flex flex-col items-center h-full mt-6">
      <h2 className="mb-1 text-xl font-semibold">{warehouse.name}</h2>

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
