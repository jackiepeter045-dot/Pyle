import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Explore from "./pages/Explore";
import Sellers from "./pages/Sellers";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import BecomeSeller from "./pages/BecomeSeller";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import { Protected, AdminOnly, SellerOnly } from "./components/Guards";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/sellers" element={<Sellers />} />

      <Route path="/account" element={<Protected><Account /></Protected>} />
      <Route path="/account/orders" element={<Protected><Orders /></Protected>} />
      <Route path="/account/become-seller" element={<Protected><BecomeSeller /></Protected>} />

      <Route path="/seller" element={<SellerOnly><SellerDashboard /></SellerOnly>} />
      <Route path="/admin" element={<AdminOnly><AdminDashboard /></AdminOnly>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
