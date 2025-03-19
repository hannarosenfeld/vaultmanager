import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { updateVaultThunk, uploadAttachmentThunk, deleteVaultThunk } from "../store/warehouse";
import LoadingSpinner from "../components/LoadingSpinner";
import ConfirmDeleteVaultModal from "../components/Warehouse/ConfirmDeleteVaultModal";

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
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);

    useEffect(() => {
        if (vault) {
            setEditableVault(vault);
            setLoading(false);
        }
    }, [vault]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setEditableVault((prevVault) => ({
            ...prevVault,
            [name]: files ? files[0] : value,
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
        navigate("/");
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex flex-col items-center h-full px-4">
            <h2 className="mb-4 text-xl font-semibold">Edit Vault {vault.name}</h2>
            <form onSubmit={handleSave} className="w-full max-w-lg">
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
                            name="name"
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
                        className="bg-red-500 text-white rounded-lg px-4 py-2 hover:bg-red-600 transition mr-2"
                        onClick={() => setIsConfirmDeleteModalOpen(true)}
                    >
                        Delete
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition"
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
