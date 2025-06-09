import AddVaultButton from "./AddVaultButton";
import VaultInfo from "./VaultInfo";
import AddVaultModal from "./AddVaultModal";
import ConfirmAddVaultModal from "../Stage/ConfirmationAddVaultModal";
import { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { moveVaultToWarehouseThunk, updateFieldTypeThunk, setFieldFullThunk } from "../../store/warehouse";

export default function FieldInfo({ field, warehouse, isStage, vaultId, onMove }) {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [vaults, setVaults] = useState(field.vaults);
  const [fieldType, setFieldType] = useState(field.type || "vault");
  const [isFieldFull, setIsFieldFull] = useState(field.full);

  // Determine capacity and positionOrder
  let capacity = warehouse?.fieldCapacity || 3;
  let positionOrder = Array.from({ length: capacity }, (_, i) => (capacity - i).toString());
  // If couchbox, add an extra position at the top
  if (fieldType === "couchbox" || field.type === "couchbox-T") {
    positionOrder = Array.from({ length: capacity + 1 }, (_, i) => (capacity + 1 - i).toString());
    capacity = capacity + 1;
  }

  useEffect(() => {
    setVaults(field.vaults);
    if (field.type === "couchbox-T") {
      setFieldType("couchbox");
    } else {
      setFieldType(field.type || "vault");
    }
    setIsFieldFull(field.full);
  }, [field.vaults, field.type, field.full]);

  // Map vaults by their numeric position (assume vault.position is 1-based string/number)
  const sortedVaults = useMemo(() => {
    return vaults
      ? [...Object.values(vaults)].sort(
          (a, b) => Number(a.position) - Number(b.position)
        )
      : [];
  }, [vaults, positionOrder]);

  // Fix: vaultMap should map positionOrder (which is descending) to vaults, but vault.position may be ascending (1,2,3)
  // So, always map vault.position as string to vault, and use positionOrder as string keys
  const vaultMap = useMemo(() => {
    // vault.position may be number or string, always convert to string for lookup
    return Object.fromEntries(
      sortedVaults.map((vault) => [String(vault.position), vault])
    );
  }, [sortedVaults]);

  const topmostVaultPosition = useMemo(() => {
    return positionOrder.find((pos) => vaultMap[pos]);
  }, [positionOrder, vaultMap]);

  const lastEmptyPosition = useMemo(() => {
    return [...positionOrder]
      .reverse()
      .find((pos) => !vaultMap[pos]);
  }, [positionOrder, vaultMap]);

  const handleOpenModal = (position) => {
    if (position === lastEmptyPosition) {
      setSelectedPosition(position);
      if (!isStage) {
        setIsModalOpen(true);
      } else {
        setIsConfirmModalOpen(true);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPosition(null);
  };

  const handleConfirmAddStagedVaultToWarehouse = async () => {
    await dispatch(moveVaultToWarehouseThunk(vaultId, field.id, selectedPosition));
    onMove();
    setIsConfirmModalOpen(false);
    setIsModalOpen(false);
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setSelectedPosition(null);
  };

  const handleFieldTypeToggle = async () => {
    const newFieldType = fieldType === "vault" ? "couchbox" : "vault";
    setFieldType(newFieldType);    
    const letterPart = field.name.match(/[A-Za-z]+/)[0];
    const numberPart = parseInt(field.name.match(/\d+/)[0]);
    const field2 = letterPart + (numberPart + 1);
    await dispatch(updateFieldTypeThunk(field.id, newFieldType, field2, field.warehouse_id));
  };

  const handleFieldFullToggle = async () => {
    const newFieldFullStatus = !isFieldFull;
    setIsFieldFull(newFieldFullStatus);
    await dispatch(setFieldFullThunk(field.id, newFieldFullStatus));
  };

  // Calculate vault count for this field
  const vaultCount = vaults ? Object.keys(vaults).length : 0;
  const hideFullCheckbox = vaultCount === (warehouse?.fieldCapacity || 3);

  const hasVaults = vaults && Object.keys(vaults).length > 0;

  return (
    <div className="h-[90%] grid grid-cols-[65%_35%]">
      <div className={`grid grid-rows-${capacity} border-r border-gray-300`}>
        {positionOrder.map((pos, index) => (
          <div
            key={pos}
            className={`p-2 flex items-center justify-between ${
              index < capacity - 1 ? "border-b border-gray-300" : ""
            }`}
          >
            <div className="text-sm w-[10%] flex items-center mr-4 lg:mr-0">
              {pos}
            </div>
            <div className="flex-grow flex items-center">
              {vaultMap[pos] ? (
                <VaultInfo vault={vaultMap[pos]} isStage={isStage} isTopmost={pos === topmostVaultPosition} />
              ) : (
                pos === lastEmptyPosition && !isFieldFull && (
                  <AddVaultButton
                    type={fieldType}
                    onClick={() => handleOpenModal(pos)}
                    disabled={pos !== lastEmptyPosition}
                  />
                )
              )}
            </div>
          </div>
        ))}
      </div>
      {/* field info */}
      <div className="flex flex-col items-center justify-evenly p-2">
        <div className="font-semibold text-2xl md:text-3xl text-center">
          {field.name}
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-4xl">
            {fieldType === "vault" ? "package_2" : "weekend"}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={fieldType === "couchbox"}
              onChange={handleFieldTypeToggle}
              disabled={hasVaults}
            />
            <div
              className={`w-11 h-6 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:bg-gray-700 peer-checked:bg-blue-600 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:after:left-[calc(100%-2px)] peer-checked:after:translate-x-[-100%] ${
                hasVaults ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200"
              }`}
            ></div>
          </label>
        </div>
        {!hideFullCheckbox && (
          <div className="flex items-center">
            <button
              className={`px-2 py-1 text-xs md:text-sm ${
                isFieldFull ? "text-red-600" : "text-gray-900"
              }`}
              onClick={handleFieldFullToggle}
            >
              {isFieldFull ? "Field is Full" : "Field is Not Full"}
            </button>
            <input
              type="checkbox"
              className="ml-2"
              checked={isFieldFull}
              onChange={handleFieldFullToggle}
            />
          </div>
        )}
      </div>
      {isModalOpen && (
        <AddVaultModal
          fieldId={field.id}
          type={fieldType}
          position={selectedPosition}
          onClose={handleCloseModal}
        />
      )}
      {isConfirmModalOpen && (
        <ConfirmAddVaultModal
          isOpen={isConfirmModalOpen}
          onClose={handleCloseConfirmModal}
          onConfirm={handleConfirmAddStagedVaultToWarehouse}
          position={selectedPosition}
        />
      )}
    </div>
  );
}