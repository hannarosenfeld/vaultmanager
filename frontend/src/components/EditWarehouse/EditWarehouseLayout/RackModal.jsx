import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import React from "react";

// modalRack, showDeleteWarning, rackHasPallets, handleDeleteRack, setModalRack, setShowDeleteWarning
export default function RackModal({
  modalRack,
  showDeleteWarning,
  rackHasPallets,
  handleDeleteRack,
  setModalRack,
  setShowDeleteWarning,
}) {
  return (
    <Dialog open={!!modalRack} onClose={() => { setModalRack(null); setShowDeleteWarning(false); }} className="relative z-50">
      {modalRack && (
        <>
          <DialogBackdrop
            transition
            className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
          />
          <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <DialogPanel
                transition
                className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in w-full max-w-xs sm:my-8 sm:w-full sm:max-w-md data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                onClick={e => e.stopPropagation()}
              >
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:size-10">
                      <svg className="size-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V6a2 2 0 012-2h14a2 2 0 012 2v1M3 7v11a2 2 0 002 2h14a2 2 0 002-2V7M3 7h18" />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <DialogTitle as="h3" className="text-base font-semibold text-gray-900">
                        Rack Info
                      </DialogTitle>
                      <div className="mt-2 space-y-1 text-sm text-gray-700">
                        <div>
                          <strong>Name:</strong> {modalRack.name}
                        </div>
                        <div>
                          <strong>Orientation:</strong> {modalRack.orientation}
                        </div>
                        <div>
                          <strong>Width:</strong> {modalRack.width}
                        </div>
                        <div>
                          <strong>Length:</strong> {modalRack.length}
                        </div>
                        <div>
                          <strong>Capacity:</strong> {modalRack.capacity}
                        </div>
                        <div>
                          <strong>Number of Shelves:</strong> {modalRack.shelves ? modalRack.shelves.length : 0}
                        </div>
                      </div>
                      {showDeleteWarning && rackHasPallets(modalRack) && (
                        <div className="mt-4 p-3 rounded bg-[color:var(--color-warning)]/20 border border-[color:var(--color-warning)] text-[color:var(--color-warning)] text-sm font-semibold">
                          Warning: This rack contains pallets. Deleting it will remove all associated pallets. Are you sure you want to continue?
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-0.5">
                  <button
                    className="inline-flex w-full justify-center rounded-md bg-[color:var(--color-danger)] px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto"
                    onClick={handleDeleteRack}
                    type="button"
                  >
                    Delete
                  </button>
                  <button
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-[color:var(--color-primary)] shadow-xs ring-1 ring-[color:var(--color-primary)] ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => { setModalRack(null); setShowDeleteWarning(false); }}
                    type="button"
                  >
                    Close
                  </button>
                </div>
                <button
                  onClick={() => { setModalRack(null); setShowDeleteWarning(false); }}
                  className="absolute top-4 right-4 text-slate-400 hover:text-[color:var(--color-accent)]"
                  aria-label="Close"
                  type="button"
                >
                  ✕
                </button>
              </DialogPanel>
            </div>
          </div>
        </>
      )}
    </Dialog>
  );
}
