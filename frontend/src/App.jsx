import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NavBar from "./components/NavBar";
import WarehousePage from "./pages/WarehousePage";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getAllWarehousesThunk } from "./store/warehouse";
import { getAllStagedVaultsThunk } from "./store/stage";
import { authenticate } from "./store/session";
import LoadingSpinner from "../src/components/LoadingSpinner";
import Stage from "./pages/Stage";
import LoginPage from "./pages/LoginPage";
import AddWarehouse from "./pages/AddWarehousePage";
import EditWarehousePage from "./pages/EditWarehousePage";
import PrintStudio from "./pages/PrintStudio";
import StatisticsPage from "./pages/StatisticsPage";
import EditVaultPage from "./pages/EditVaultPage";
import LandingPage from "./pages/LandingPage";

function App() {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const warehouses = useSelector((state) => state.warehouse.warehouses);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(authenticate()).then(() => {
      setLoading(false);
      dispatch(getAllStagedVaultsThunk());
    });
  }, [dispatch]);

  useEffect(() => {
    if (sessionUser && Object.keys(warehouses).length === 0) {
      dispatch(getAllWarehousesThunk());
    }
  }, [dispatch, sessionUser, warehouses]);

  return (
    <Router>
      {loading ? (
        <LoadingSpinner />
      ) : (
        sessionUser ? (
          <div className="flex flex-col w-full sm:w-3/4 md:w-full lg:w-1/2 xl:w-[800px] mx-auto">
            <NavBar />
            <div className="flex-grow">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<HomePage warehouses={warehouses} />} />
                <Route path="/login" element={<Navigate to="/dashboard" />} />
                <Route path="/stage" element={<Stage />} />
                <Route path="/warehouse/:warehouseName" element={<WarehousePage warehouses={warehouses} />} />
                <Route path="/add-warehouse" element={<AddWarehouse />} />
                <Route path="/edit/:warehouseName" element={<EditWarehousePage />} />
                <Route path="/edit/vault/:vaultName" element={<EditVaultPage />} />
                <Route path="/statistics" element={<StatisticsPage />} />
                <Route path="/print-studio" element={<PrintStudio />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )
      )}
    </Router>
  );
}

export default App;