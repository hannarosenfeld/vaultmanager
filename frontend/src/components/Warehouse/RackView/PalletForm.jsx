import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useState, useEffect } from "react";

function PalletForm({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    customer_name: "",
    pallet_number: "",
    notes: "",
  });

  // Reset form data when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        customer_name: "",
        pallet_number: "",
        notes: "",
      });
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
    try {
      const palletDataWithDefaults = {
        ...formData,
        name: `Pallet-${formData.customer_name}-${formData.pallet_number}`, // Generate a name
        weight: formData.weight || 0, // Default weight to 0 if not provided
      };
      await onSubmit(palletDataWithDefaults);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
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
              Add Pallet
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

              <div className="mb-5">
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

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
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