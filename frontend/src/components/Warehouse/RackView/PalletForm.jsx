import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPalletThunk, editPalletThunk, fetchRacksThunk } from "../../../store/rack"; // Import the editPalletThunk
import { deletePalletThunk } from "../../../store/rack"; // Import the deletePalletThunk

function PalletForm({ isOpen, onClose, onSubmit, initialData = {}, selectedShelfId }) {
  const dispatch = useDispatch();
  const currentRack = useSelector((state) => state.rack.currentRack);
  const warehouseId = useSelector((state) => state.warehouse.currentWarehouse?.id);

  // Find the selected shelf from the current rack
  const selectedShelf = currentRack?.shelves?.find(shelf => shelf.id === selectedShelfId);

  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    customer_name: initialData.customerName || "",
    pallet_number: initialData.palletNumber || "",
    notes: initialData.notes || "",
    weight: initialData.weight || 0,
    pallet_spaces: initialData.palletSpaces || 1, // Default to 1 space
  });

  const prevInitialData = useRef(initialData);

  // Reset form data when the modal is opened
  useEffect(() => {
    if (
      isOpen &&
      (prevInitialData.current.customerName !== initialData.customerName ||
        prevInitialData.current.palletNumber !== initialData.palletNumber ||
        prevInitialData.current.notes !== initialData.notes ||
        prevInitialData.current.weight !== initialData.weight ||
        prevInitialData.current.palletSpaces !== initialData.palletSpaces)
    ) {
      setFormData({
        customer_name: initialData.customerName || "",
        pallet_number: initialData.palletNumber || "",
        notes: initialData.notes || "",
        weight: initialData.weight || 0,
        pallet_spaces: initialData.palletSpaces || 1, // Default to 1 space
      });
      prevInitialData.current = initialData; // Update the ref to the current initialData
    }
  }, [isOpen, initialData]);

  // Clear error when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError("");
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedShelf) {
      setError("Shelf not found. Please select a valid shelf.");
      return;
    }
    const palletSpaces = Number(formData.pallet_spaces);
    const availableSpaces = selectedShelf.capacity - (selectedShelf.pallets?.length || 0);

    if (palletSpaces > availableSpaces) {
      setError(
        `Shelf does not have enough space for this. Please increase Shelf capacity. Shelf capacity is currently ${selectedShelf.capacity}`
      );
      return;
    }
    setError("");

    console.log("🍑 form data before dispatch: ", formData)

    try {
      if (initialData.id) {
        // Editing an existing pallet
        await dispatch(
          editPalletThunk({
            id: initialData.id,
            customer_name: formData.customer_name,
            pallet_number: formData.pallet_number,
            notes: formData.notes,
            weight: Number(formData.weight) || 0,
            pallet_spaces: palletSpaces,
          })
        ).unwrap();
        console.log(`✅ Pallet updated successfully.`);
        onClose();
        onSubmit(formData); // Notify parent to update the UI
      } else {
        await dispatch(
          addPalletThunk({
            shelf_id: selectedShelf.id,
            customer_name: formData.customer_name,
            pallet_number: formData.pallet_number,
            notes: formData.notes,
            weight: Number(formData.weight) || 0,
            shelf_spots: palletSpaces,
          })
        ).unwrap();
        // Refresh racks after adding a pallet
        if (warehouseId) {
          await dispatch(fetchRacksThunk(warehouseId));
        }
        onClose();
      }
    } catch (error) {
      console.error("❌ Error submitting form:", error);
    }
  };

  const handleDelete = async () => {
    if (!initialData.id) return; // Ensure we are editing an existing pallet
    try {
      console.log(`🔍 Deleting pallet with ID: ${initialData.id}`);
      await dispatch(deletePalletThunk(initialData.id)).unwrap();
      console.log(`✅ Pallet deleted successfully.`);
      onClose();
      onSubmit(null); // Notify parent to update the UI
    } catch (error) {
      console.error("❌ Error deleting pallet:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={true} onClose={onClose} className="relative z-10">
      <DialogBackdrop className="fixed inset-0 bg-gray-500/75 transition-opacity" />
      <div className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto p-4 sm:p-6 lg:p-8">
        <DialogPanel className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white text-left shadow-xl">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              ✕
            </button>

            <DialogTitle
              as="h3"
              className="text-lg font-semibold text-gray-900 mb-5"
            >
              {initialData.id ? "Edit Pallet" : "Add Pallet"}
            </DialogTitle>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label
                  htmlFor="customer_name"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Customer Name
                </label>
                <input
                  type="text"
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  className="border border-gray-300 text-sm rounded-lg w-full p-2.5 bg-white"
                  placeholder="Customer Name"
                  required
                />
              </div>

              <div className="mb-5">
                <label
                  htmlFor="pallet_number"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Pallet Number
                </label>
                <input
                  type="text"
                  id="pallet_number"
                  value={formData.pallet_number}
                  onChange={handleChange}
                  className="border border-gray-300 text-sm rounded-lg w-full p-2.5 bg-white"
                  placeholder="Pallet Number"
                  required
                />
              </div>

              <div className="mb-5">
                <label
                  htmlFor="notes"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg p-2.5"
                  placeholder="Add a note..."
                ></textarea>
              </div>

              <div className="mb-10 flex gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="weight"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Weight
                  </label>
                  <input
                    type="number"
                    id="weight"
                    value={formData.weight || ""}
                    onChange={handleChange}
                    className="border border-gray-300 text-sm rounded-lg w-full p-2.5 bg-white"
                    placeholder="Weight (default: 0)"
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="pallet_spaces"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Pallet Spaces
                  </label>
                  <input
                    type="number"
                    id="pallet_spaces"
                    value={formData.pallet_spaces}
                    onChange={handleChange}
                    className="border border-gray-300 text-sm rounded-lg w-full p-2.5 bg-white"
                    placeholder="Spaces (default: 1)"
                    min="1"
                    required
                  />
                </div>
              </div>

              {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

              <div className="flex justify-end">
                {initialData.id && ( // Show delete button only when editing
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mr-2"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export default PalletForm;