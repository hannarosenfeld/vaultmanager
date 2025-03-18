import { useDispatch } from 'react-redux';
import { stageVaultThunk } from '../../store/stage';

export default function ConfirmStagingModal({ onClose, vault }) {
  const dispatch = useDispatch();

  const handleStage = () => {
    dispatch(stageVaultThunk(vault.id));
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500/75 z-50">
      <div className="bg-white p-4 rounded shadow-lg z-50">
        <h2 className="text-xl font-semibold mb-4">Stage Vault</h2>
        <p className="mb-5">Are you sure you want to stage vault <span className="text-blue-500 font-semibold">{vault.name}</span>?</p>
        <div className="flex flex-col">
          <button
            type="button"
            className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
            onClick={handleStage}
          >
            Yes, stage it
          </button>
          <button
            type="button"
            className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
            onClick={onClose}
          >
            No, take me back
          </button>
        </div>
      </div>
    </div>
  );
}