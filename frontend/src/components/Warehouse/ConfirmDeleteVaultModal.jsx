import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";

export default function ConfirmDeleteVaultModal({ isOpen, onClose, onConfirm }) {
    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-10">
            <DialogBackdrop transition className="fixed inset-0 bg-gray-500/75 transition-opacity" />
            <div className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto p-4 sm:p-6 lg:p-8">
                <DialogPanel
                    transition
                    className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all"
                >
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <DialogTitle as="h3" className="text-lg font-semibold text-gray-900 mb-5">
                            Confirm Delete
                        </DialogTitle>
                        <div className="mb-5">
                            <p>Are you sure you want to delete this vault? This action cannot be undone.</p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={onClose}
                                className="bg-gray-500 text-white rounded-lg px-4 py-2 hover:bg-gray-600 transition mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="bg-red-500 text-white rounded-lg px-4 py-2 hover:bg-red-600 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
