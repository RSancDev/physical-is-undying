import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AddRelease } from "./pages/AddRelease";
import { Collection } from "./pages/Collection";
import { Dashboard } from "./pages/Dashboard";
import { Recommendations } from "./pages/Recommendations";
import { ReleaseDetail } from "./pages/ReleaseDetail";
import { Settings } from "./pages/Settings";
import { Stats } from "./pages/Stats";
import { Wishlist } from "./pages/Wishlist";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/add" element={<AddRelease />} />
        <Route path="/release/:id" element={<ReleaseDetail />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
