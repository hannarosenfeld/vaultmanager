import { useState, useEffect } from "react";

export default function RackModal({ isOpen, onClose, onSubmit, location, defaultRackName }) {
  const [rackName, setRackName] = useState("");
  const [capacity, setCapacity] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRackName(defaultRackName || ""); // Set the default rack name when the modal opens
    }
  }, [isOpen, defaultRackName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name: rackName, capacity: parseInt(capacity, 10), location });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Add Rack</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Rack Name</label>
            <input
              type="text"
              value={rackName}
              onChange={(e) => setRackName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Capacity</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Add Rack
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}