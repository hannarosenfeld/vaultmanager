import { useState } from "react";
import { useDispatch } from "react-redux";
import { uploadAttachmentThunk, deleteVaultThunk } from "../../store/warehouse";

export default function ViewAndEditVaultModal({ toggleModal, vault }) {
  const dispatch = useDispatch();
  const [editableVault, setEditableVault] = useState({ ...vault });
  const [editFields, setEditFields] = useState({
    customer_name: false,
    vault_id: false,
    order_name: false,
    note: false,
  });
  const [newAttachments, setNewAttachments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add state for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Helper: check if the customer is an "empty" type
  const isEmptyCustomer = (name) => {
    if (!name) return false;
    const n = name.toUpperCase();
    return n.startsWith("EMPTY");
  };
console.log("😡")
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setEditableVault((prevVault) => ({
      ...prevVault,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSave = () => {
    // If changing to an "empty" customer, show confirmation modal
    if (isEmptyCustomer(editableVault.customer_name)) {
      setShowConfirmModal(true);
      return;
    }
    // Save the updated vault information
    // This could involve making an API call or updating the parent component's state
    toggleModal();
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
      setLoading(true);
      const response = await dispatch(uploadAttachmentThunk(file, editableVault.id));
      if (response.attachment) {
        setNewAttachments((prevAttachments) => [...prevAttachments, response.attachment]);
      }
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    await dispatch(deleteVaultThunk(editableVault.id));
    setLoading(false);
    toggleModal();
  };

  // Confirm erase handler
  const handleConfirmErase = () => {
    // Erase vault info as needed
    setEditableVault((prev) => ({
      ...prev,
      order_name: "",
      note: "",
      attachments: [],
      // add other fields to erase if needed
    }));
    setShowConfirmModal(false);
    toggleModal();
    // Optionally: trigger API call to erase info here
  };

  // Cancel erase handler
  const handleCancelErase = () => {
    setShowConfirmModal(false);
  };

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-black opacity-50"></div>
        <div className="bg-white p-8 rounded-lg shadow-lg z-10 w-full max-w-3xl max-h-full overflow-auto relative">
          <h2 className="text-2xl font-semibold mb-6">View / Edit Vault</h2>

          {/* Delete Button */}
          <button
            type="button"
            className={`absolute top-4 right-4 text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-500 dark:focus:ring-red-800 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleDelete}
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
</svg>

          </button>

          <div className="mb-6 flex items-center border-b border-gray-200 pb-4">
            <label className="block text-sm font-medium text-gray-700 w-1/3">
              Customer Name
            </label>
            {editFields.customer_name ? (
              <input
                type="text"
                name="customer_name"
                value={editableVault.customer_name}
                onChange={handleChange}
                className="ml-2 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            ) : (
              <span className="ml-2 w-2/3">{editableVault.customer_name}</span>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 cursor-pointer ml-2 text-blue-500"
              onClick={() => toggleEditField("customer_name")}
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
              Vault#
            </label>
            {editFields.vault_id ? (
              <input
                type="text"
                name="vault_id"
                value={editableVault.name}
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
                value={editableVault.order_name}
                onChange={handleChange}
                className="ml-2 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
            {loading && <p className="mt-1 text-sm text-gray-500">Uploading...</p>}
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
              value={editableVault.note}
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
                    <a href={attachment.file_url} target="_blank" rel="noopener noreferrer">
                      {attachment.file_name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No attachments</p>
            )}
            {newAttachments.length > 0 && (
              <ul className="list-disc pl-5 mt-2">
                {newAttachments.map((attachment, index) => (
                  <li key={index} className="text-sm text-green-500">
                    <a href={attachment.file_url} target="_blank" rel="noopener noreferrer">
                      {attachment.file_name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className={`text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-500 dark:focus:ring-blue-800 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleSave}
              disabled={loading}
            >
              Save
            </button>
            <button
              type="button"
              className={`py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={toggleModal}
              disabled={loading}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="bg-white p-6 rounded-lg shadow-lg z-10 w-full max-w-md relative">
            <h3 className="text-lg font-semibold mb-4">Confirm Vault Change</h3>
            <p className="mb-6">
              You are changing the vault to a <span className="font-bold">{editableVault.customer_name}</span>. This will erase vault info. Are you sure?
            </p>
            <div className="flex justify-end">
              <button
                className="text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm px-4 py-2 mr-2"
                onClick={handleConfirmErase}
              >
                Confirm
              </button>
              <button
                className="text-gray-700 bg-gray-200 hover:bg-gray-300 font-medium rounded-lg text-sm px-4 py-2"
                onClick={handleCancelErase}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}