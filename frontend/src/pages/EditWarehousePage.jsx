import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EditWarehouseModal from "../components/EditWarehouse/EditWarehouseModal";
import ToggleBox from "../components/EditWarehouse/ToggleBox";
import WarehouseView from "../components/EditWarehouse/WarehouseView";
import RackView from "../components/EditWarehouse/RackView";
import {
  setCurrentWarehouse,
  editFieldCapacityThunk,
} from "../store/warehouse";
import LoadingSpinner from "../components/LoadingSpinner";
import EditWarehouseLayout from "../components/EditWarehouse/EditWarehouseLayout";

export default function EditWarehousePage() {
  const dispatch = useDispatch();
  const { warehouseName } = useParams();
  const warehouses = useSelector(
    (state) => state.warehouse.warehouses,
    shallowEqual
  );
  const warehouse = useSelector(
    (state) => state.warehouse.currentWarehouse,
    shallowEqual
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("Warehouse");
  const [fieldGridPosition, setFieldGridPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const foundWarehouse = Object.values(warehouses).find(
      (w) =>
        w.name.toLowerCase().split(" ").join("-") ===
        warehouseName.toLowerCase()
    );
    if (foundWarehouse) {
      dispatch(setCurrentWarehouse(foundWarehouse));
      setFieldGridPosition({
        x: foundWarehouse.fieldgridLocation?.x || 0,
        y: foundWarehouse.fieldgridLocation?.y || 0,
      });
    }
    setLoading(false);
  }, [dispatch, warehouseName, warehouses]);

  const openModal = (dir, operation) => {
    setModalProps({ dir, operation, warehouseId: warehouse.id });
    setIsModalOpen(true);
  };

  const handleSubmit = (fieldCapacity) => {
    dispatch(editFieldCapacityThunk(warehouse.id, fieldCapacity)).then(
      (response) => {
        if (response.error) {
          alert("Error updating field capacity: " + response.error);
        } else {
          alert("Field capacity updated successfully!");
        }
      }
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col items-center h-full mt-3">
      <h2 className="mb-4 text-2xl font-bold">{warehouse.name}</h2>
      <hr class="w-full h-px my-4 bg-black"/>
      <EditWarehouseLayout
        warehouse={warehouse}
        fieldGridPosition={fieldGridPosition}
        setFieldGridPosition={setFieldGridPosition}
        openModal={openModal}
      />
      <br/>

      {/* insert a dividing line here */}
      <hr class="w-full h-px my-8 bg-black"/>


      <ToggleBox viewMode={viewMode} setViewMode={setViewMode} />

      {viewMode === "Warehouse" ? (
        <WarehouseView
          warehouse={warehouse}
          openModal={openModal}
          handleSubmit={handleSubmit}
        />
      ) : (
        <RackView warehouse={warehouse} />
      )}

      {isModalOpen && (
        <EditWarehouseModal
          {...modalProps}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
