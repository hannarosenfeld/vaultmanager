import { Dialog } from "@headlessui/react";

export default function ConfirmAddVaultModal({ isOpen, onClose, onConfirm, position }) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error adding vault:", error);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black opacity-30 z-40" />
      <div className="flex items-center justify-center min-h-screen z-50">
        <Dialog.Panel className="bg-white p-6 rounded shadow-lg z-50">
          <Dialog.Title className="text-lg font-bold">Confirm Add Vault</Dialog.Title>
          <Dialog.Description className="mt-2">
            Are you sure you want to add a vault at position <span className="text-blue-500 font-semibold">{position}</span>?
          </Dialog.Description>
          <div className="flex flex-col mt-4">
            <button
              type="button"
              className="w-full text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-2"
              onClick={handleConfirm}
            >
              Yes, add it
            </button>
            <button
              type="button"
              className="w-full py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              onClick={onClose}
            >
              No, take me back
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}