import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  updateVaultThunk,
  uploadAttachmentThunk,
  deleteVaultThunk,
} from "../store/warehouse";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmDeleteVaultModal from "../components/Warehouse/ConfirmDeleteVaultModal";
import { setCurrentVault } from '../store/warehouse';

export default function EditVaultPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const vault = useSelector((state) => state.warehouse.currentVault);
  const [editableVault, setEditableVault] = useState({});
  const [editFields, setEditFields] = useState({
    customer_name: false,
    vault_id: false,
    order_name: false,
    note: false,
  });
  const [newAttachments, setNewAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] =
    useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [selectedType, setSelectedType] = useState("vault");

  useEffect(() => {
    if (vault) {
      setEditableVault(vault);
      setLoading(false);
      if (vault.customer_name?.toUpperCase().includes("EMPTY")) {
        setIsEmpty(true);
        const typeMatch = vault.customer_name.split(" ")[1]?.toLowerCase();
        if (["vault", "liftvan", "t2"].includes(typeMatch)) {
          setSelectedType(typeMatch);
        }
      }
    }
  }, [vault]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setEditableVault((prevVault) => ({
      ...prevVault,
      [name]: files ? files[0] : name === "customer_name" ? value.toUpperCase() : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dispatch(updateVaultThunk(editableVault));
      console.log("Vault updated successfully");
    } catch (error) {
      console.error("Error updating vault: ", error);
    } finally {
      setLoading(false);
      navigate(`/warehouse/${vault.warehouse_name}`);
    }
  };

  const toggleEditField = (field) => {
    setEditFields((prevFields) => ({
      ...prevFields,
      [field]: !prevFields[field],
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      const response = await dispatch(
        uploadAttachmentThunk(file, editableVault.id)
      );
      if (response.attachment) {
        setNewAttachments((prevAttachments) => [
          ...prevAttachments,
          response.attachment,
        ]);
      }
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    await dispatch(deleteVaultThunk(editableVault.id));
    setLoading(false);
    navigate(`/warehouse/${vault.warehouse_name}`);
  };

  const handleToggle = () => {
    setIsEmpty(!isEmpty);
    setEditableVault((prevVault) => ({
      ...prevVault,
      customer_name: !isEmpty ? `EMPTY ${selectedType.toUpperCase()}` : "",
      order_name: "",
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col items-center h-[90vh] px-4 justify-between">
      <div className="w-full max-w-lg flex justify-start mb-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 cursor-pointer text-blue-500"
          onClick={() => navigate(`/warehouse/${vault.warehouse_name}`)}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
      </div>
      <h2 className="mb-4 text-xl font-semibold">Edit Vault {vault.name}</h2>

      {/* Toggle Switch */}
      <label className="mb-4 inline-flex items-center cursor-pointer">
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

      <form onSubmit={handleSave} className="w-full max-w-lg">
        <div className="mb-6 flex items-center border-b border-gray-200 pb-4 gap-4">
          <div className={`w-full ${isEmpty ? "w-1/2" : ""}`}>
            <label className="block text-sm font-medium text-gray-700">
              Customer Name
            </label>
            <input
              type="text"
              name="customer_name"
              value={editableVault.customer_name.includes("EMPTY") ? "EMPTY" : editableVault.customer_name || ""}
              onChange={handleChange}
              disabled={isEmpty}
              className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm ${
                isEmpty ? "bg-gray-200 text-gray-500" : "bg-white"
              }`}
            />
          </div>
          {isEmpty && (
            <div className="w-1/2">
              <label
                htmlFor="typeSelect"
                className="block text-sm font-medium text-gray-700"
              >
                Type
              </label>
              <select
                id="typeSelect"
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setEditableVault((prevVault) => ({
                    ...prevVault,
                    customer_name: `EMPTY ${e.target.value.toUpperCase()}`,
                  }));
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white"
              >
                <option value="vault">Vault</option>
                <option value="liftvan">Liftvan</option>
                <option value="t2">T2</option>
              </select>
            </div>
          )}
        </div>

        <div className="mb-6 flex items-center border-b border-gray-200 pb-4">
          <label className="block text-sm font-medium text-gray-700 w-1/3">
            Vault#
          </label>
          {editFields.vault_id ? (
            <input
              type="text"
              name="name"
              value={editableVault.name || ""}
              onChange={handleChange}
              className="ml-2 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          ) : (
            <span className="ml-2 w-2/3">{editableVault.name}</span>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5 cursor-pointer ml-2 text-blue-500"
            onClick={() => toggleEditField("vault_id")}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
            />
          </svg>
        </div>

        <div className="mb-6 flex items-center border-b border-gray-200 pb-4">
          <label className="block text-sm font-medium text-gray-700 w-1/3">
            Order#
          </label>
          {editFields.order_name ? (
            <input
              type="text"
              name="order_name"
              value={editableVault.order_name || ""}
              onChange={handleChange}
              disabled={isEmpty}
              className={`ml-2 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm ${
                isEmpty ? "bg-gray-200 text-gray-500" : "bg-white"
              }`}
            />
          ) : (
            <span className="ml-2 w-2/3">{editableVault.order_name}</span>
          )}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            style={{ display: isEmpty ? "none" : "block" }}
            className="w-5 h-5 cursor-pointer ml-2 text-blue-500"
            onClick={() => toggleEditField("order_name")}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
            />
          </svg>
        </div>

        <div className="mb-6 border-b border-gray-200 pb-4">
          <label
            htmlFor="file"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Upload Attachment
          </label>
          <input
            type="file"
            name="file"
            id="file"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="mb-6 border-b border-gray-200 pb-4">
          <label
            htmlFor="note"
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Note
          </label>
          <textarea
            name="note"
            id="note"
            value={editableVault.note || ""}
            onChange={handleChange}
            rows="4"
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add a note..."
          ></textarea>
        </div>

        <div className="mb-6 border-b border-gray-200 pb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Attachments
          </label>
          {editableVault.attachments && editableVault.attachments.length > 0 ? (
            <ul className="list-disc pl-5">
              {editableVault.attachments.map((attachment, index) => (
                <li key={index} className="text-sm text-gray-900">
                  <a
                    href={attachment.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {attachment.file_name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No attachments</p>
          )}
          {isUploading && (
            <p className="text-sm text-gray-500">File is being uploaded<span className="animate-pulse">...</span></p>
          )}
          {newAttachments.length > 0 && (
            <ul className="list-disc pl-5 mt-2">
              {newAttachments.map((attachment, index) => (
                <li key={index} className="text-sm text-green-500">
                  <a
                    href={attachment.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {attachment.file_name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end mb-4">
          <button
            type="button"
            className={`bg-red-500 text-white rounded-lg px-4 py-2 hover:bg-red-600 transition mr-2 flex items-center justify-center h-10 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => setIsConfirmDeleteModalOpen(true)}
            disabled={isUploading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
          <button
            type="submit"
            className={`text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-6 py-2.5 flex items-center justify-center h-10 w-32 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isUploading}
          >
            Save
          </button>
        </div>
      </form>
      {isConfirmDeleteModalOpen && (
        <ConfirmDeleteVaultModal
          isOpen={isConfirmDeleteModalOpen}
          onClose={() => setIsConfirmDeleteModalOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}