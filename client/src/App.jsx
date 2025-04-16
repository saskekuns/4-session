import "./App.css"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"

// Import Pages
import CustomerPage from "./pages/CustomerPage"
import ClientManagerPage from "./pages/ClientManagerPage"
import SupplyManagerPage from "./pages/SupplyManagerPage"
import MasterPage from "./pages/MasterPage"
import DirectorPage from "./pages/DirectorPage"
import IngredientPage from "./pages/IngredientPage"
import DecorationPage from "./pages/DecarationPage"
import WorkshopLayout from "./pages/WorkshopLayout"
import OrdersPage from "./pages/OrdersPage"
import PurchaseListPage from "./pages/PurchaseListPage"
import FailurePage from "./pages/FailurePage"
import DirectorFailuresPage from "./pages/DirectorFailuresPage"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/customer" element={<CustomerPage />} />
        <Route path="/client-manager" element={<ClientManagerPage />} />
        <Route path="/supply-manager" element={<SupplyManagerPage />} />
        <Route path="/master" element={<MasterPage />} />
        <Route path="/director" element={<DirectorPage />} />
        <Route path="/director/failures" element={<DirectorFailuresPage />} />
        

        {/* Не основной переход (не по роли) */}
        <Route path="/ingredients" element={<IngredientPage />} />
        <Route path="/decorations" element={<DecorationPage />} />
        <Route path="/workshop-layout" element={<WorkshopLayout />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/purchase-list" element={<PurchaseListPage />} />
        <Route path="/failure" element={<FailurePage />} />
      </Routes>
    </Router>
  )
}

export default App
