import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EditWarehouseModal from "../components/EditWarehouse/EditWarehouseModal";

import WarehouseView from "../components/EditWarehouse/WarehouseView";

import {
  setCurrentWarehouse,
  editWarehouseDimensionsThunk, // <-- import the correct thunk
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
  const [successMsg, setSuccessMsg] = useState(""); // Add state for success message

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
    setModalProps({ dir, operation, warehouseId: warehouse?.id });
    setIsModalOpen(true);
  };

  const handleSubmit = async ({ fieldCapacity, length, width }) => {
    if (!warehouse) return;
    const prev = {
      fieldCapacity: warehouse.field_capacity ?? warehouse.fieldCapacity,
      length: warehouse.length,
      width: warehouse.width,
    };
    const res = await dispatch(editWarehouseDimensionsThunk(warehouse.id, { fieldCapacity, length, width }));
    if (res && res.warehouse) {
      let changed = [];
      if (String(prev.fieldCapacity) !== String(fieldCapacity)) changed.push("Capacity");
      if (String(prev.length) !== String(length)) changed.push("Length");
      if (String(prev.width) !== String(width)) changed.push("Width");
      if (changed.length) {
        setSuccessMsg(`${changed.join(", ")} updated successfully!`);
        setTimeout(() => setSuccessMsg(""), 2500);
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!warehouse) {
    return (
      <div className="flex flex-col items-center h-full mt-3">
        <h2 className="mb-4 text-2xl font-bold">Warehouse Not Found</h2>
        <p>The warehouse you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-full mt-3 mb-8">
      <h2 className="mb-4 text-2xl font-bold">{warehouse.name}</h2>
      <hr className="w-full h-px my-6 bg-black" />

      <h2 className="mb-4 text-2xl font-bold">Edit Warehouse Fields</h2>
      {successMsg && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-green-100 border border-green-400 text-green-800 px-6 py-3 rounded shadow transition-all">
          {successMsg}
        </div>
      )}
      <WarehouseView
        warehouse={warehouse}
        openModal={openModal}
        handleSubmit={handleSubmit}
      />
      {warehouse.width && warehouse.length && (
        <>
          <hr className="w-full h-px my-10 bg-black" />
          <EditWarehouseLayout
            warehouse={warehouse}
            fieldGridPosition={fieldGridPosition}
            setFieldGridPosition={setFieldGridPosition}
            openModal={openModal}
          />
        </>
      )}
      <br />
      <hr className="w-full h-px my-8 bg-black" />
      {isModalOpen && (
        <EditWarehouseModal
          {...modalProps}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
