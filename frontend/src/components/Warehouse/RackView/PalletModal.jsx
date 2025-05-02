import React, { useState } from "react";

function PalletModal({ pallet, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    customerName: pallet?.customerName || "",
    palletNumber: pallet?.palletNumber || "",
    notes: pallet?.notes || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Edit Pallet</h2>
        <div className="mb-2">
          <label className="block text-sm font-medium">Customer Name</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Pallet Number</label>
          <input
            type="text"
            name="palletNumber"
            value={formData.palletNumber}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default PalletModal;
