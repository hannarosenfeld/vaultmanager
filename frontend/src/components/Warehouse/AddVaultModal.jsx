import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addVaultThunk } from "../../store/warehouse";

export default function AddVaultModal({ onClose, fieldId, type, position }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);
  const companyId = user?.companyId;
  const [isEmpty, setIsEmpty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("vault");

  const [formData, setFormData] = useState({
    customer: "",
    vault_id: "",
    orderNumber: "",
    type,
    note: "",
    file: null,
    field_id: fieldId,
    position: position,
  });

  const handleToggle = () => {
    setIsEmpty(!isEmpty);
    setFormData({
      ...formData,
      customer: !isEmpty ? "EMPTY" : "",
      orderNumber: "",
    });
  };

  const handleChange = (e) => {
    const { id, value, files } = e.target;
    if (id === "file" && files) {
      const selectedFile = files[0];
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("File size should not exceed 5MB");
        return;
      }
    }
    setFormData({
      ...formData,
      [id]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const vaultData = new FormData();
      vaultData.append("vault_id", formData.vault_id);
      vaultData.append(
        "customer_name",
        isEmpty
          ? `EMPTY ${selectedType.toUpperCase()}`
          : formData.customer.toUpperCase()
      );
      vaultData.append("order_name", formData.orderNumber);
      vaultData.append("type", formData.type === "vault" ? "vault" : "couchbox");
      vaultData.append("note", formData.note);
      vaultData.append("field_id", formData.field_id);
      vaultData.append("position", formData.position);
      if (formData.file) {
        vaultData.append("attachment", formData.file);
      }
      if (companyId) {
        vaultData.append("company_id", companyId);
      }

      dispatch(addVaultThunk(vaultData));

      onClose();
    } catch (error) {
      console.error("Error submitting form: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onClose={onClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity"
      />
      <div className="fixed inset-0 z-10 flex items-center justify-center overflow-y-auto p-4 sm:p-6 lg:p-8">

        <DialogPanel
          transition
          className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all"
        >
          {isLoading ? (
            // Loading Modal (No close button)
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-700 animate-pulse text-lg">
                Adding Vault...
              </p>
            </div>
          ) : (
            // Form Modal (With close button)
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
                New Vault Info
              </DialogTitle>

              <form onSubmit={handleSubmit}>
                
                {/* Toggle Switch */}
                <label className="mb-5 inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    onChange={handleToggle}
                    checked={isEmpty}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 transition">
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        isEmpty ? "translate-x-full" : ""
                      }`}
                    ></div>
                  </div>
                  <span className="ms-3 text-sm font-medium text-gray-900">
                    {isEmpty ? "Empty Mode" : "Regular Mode"}
                  </span>
                </label>

                <div className="mb-5 flex gap-4">
                  <div className={`w-full ${isEmpty ? "w-1/2" : ""}`}>
                    <label
                      htmlFor="customer"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Customer Name
                    </label>
                    <input
                      type="text"
                      id="customer"
                      value={formData.customer.toUpperCase()}
                      onChange={handleChange}
                      disabled={isEmpty}
                      className={`border border-gray-300 text-sm rounded-lg w-full p-2.5 ${
                        isEmpty ? "bg-gray-200 text-gray-500" : "bg-white"
                      }`}
                      placeholder="CUSTOMER NAME"
                      required
                    />
                  </div>
                  {isEmpty && (
                    <div className="w-1/2">
                      <label
                        htmlFor="typeSelect"
                        className="block mb-2 text-sm font-medium text-gray-900"
                      >
                        Type
                      </label>
                      <select
                        id="typeSelect"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="border border-gray-300 text-sm rounded-lg w-full p-2.5 bg-white"
                      >
                        <option value="vault">Vault</option>
                        <option value="liftvan">Liftvan</option>
                        <option value="t2">T2</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <div className="mb-5 w-1/2">
                    <label
                      htmlFor="vault_id"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Vault Number
                    </label>
                    <input
                      type="text"
                      id="vault_id"
                      value={formData.vault_id}
                      onChange={handleChange}
                      disabled={isEmpty && selectedType == "t2" || selectedType == "liftvan"}
                      className={`border border-gray-300 text-sm rounded-lg w-full p-2.5 ${
                        isEmpty && selectedType == "t2" || selectedType == "liftvan" ? "bg-gray-200 text-gray-500" : "bg-white"
                      }`}
                      placeholder="Vault Number"
                      required
                    />
                  </div>
                  <div className="mb-5 w-1/2">
                    <label
                      htmlFor="orderNumber"
                      className="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Order Number
                    </label>
                    <input
                      type="text"
                      id="orderNumber"
                      value={formData.orderNumber}
                      onChange={handleChange}
                      disabled={isEmpty}
                      className={`border border-gray-300 text-sm rounded-lg w-full p-2.5 ${
                        isEmpty ? "bg-gray-200 text-gray-500" : "bg-white"
                      }`}
                      placeholder="Order Number"
                      required
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="file"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Upload File
                  </label>
                  <input
                    type="file"
                    id="file"
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg w-full p-2.5"
                  />
                </div>

                <div className="mb-5">
                  <label
                    htmlFor="note"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Add Note
                  </label>
                  <textarea
                    id="note"
                    value={formData.note}
                    onChange={handleChange}
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                    placeholder="Add a note..."
                  ></textarea>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition"
                  >
                    Add Vault
                  </button>
                </div>
              </form>
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  );
}
