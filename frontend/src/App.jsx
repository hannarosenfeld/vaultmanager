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

function App() {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const warehouses = useSelector((state) => state.warehouse.warehouses);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(authenticate()).then(() => {
      if (Object.keys(warehouses).length === 0) {
        dispatch(getAllWarehousesThunk()).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
      dispatch(getAllStagedVaultsThunk());
    });
  }, [dispatch]);

  return (
    <Router>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="flex flex-col w-full sm:w-3/4 md:w-full lg:w-1/2 xl:w-[800px] mx-auto">
          {sessionUser && <NavBar />}
          <div className="flex-grow">
            <Routes>
              <Route path="/login" element={sessionUser ? <Navigate to="/" /> : <LoginPage />} />
              <Route path="/" element={sessionUser ? <HomePage warehouses={warehouses} /> : <Navigate to="/login" />} />
              <Route path="/stage" element={sessionUser ? <Stage /> : <Navigate to="/login" />} />
              <Route path="/warehouse/:warehouseName" element={sessionUser ? <WarehousePage warehouses={warehouses} /> : <Navigate to="/login" />} />
              <Route path="/add-warehouse" element={sessionUser ? <AddWarehouse /> : <Navigate to="/login" />} />
              <Route path="/edit/:warehouseName" element={sessionUser ? <EditWarehousePage /> : <Navigate to="/login" />} />
              <Route path="/edit/vault/:vaultName" element={sessionUser ? <EditVaultPage /> : <Navigate to="/login" />} />
              <Route path="/statistics" element={sessionUser ? <StatisticsPage /> : <Navigate to="/login" />} />
              <Route path="/print-studio" element={sessionUser ? <PrintStudio /> : <Navigate to="/login" />} />
              <Route path="*" element={<Navigate to={sessionUser ? "/" : "/login"} />} />              
            </Routes>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;