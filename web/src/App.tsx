import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";

import {
  DashboardPage,
  ItemsPage,
  ItemDetailPage,
  ItemFormPage,
  ActivityPage,
} from "@/pages";
import SettingsPage from "./pages/SettingsPage";
import EulaPage from "./pages/EulaPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/items/new" element={<ItemFormPage />} />
        <Route path="/items/:id" element={<ItemDetailPage />} />
        <Route path="/items/:id/edit" element={<ItemFormPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/eula" element={<EulaPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
