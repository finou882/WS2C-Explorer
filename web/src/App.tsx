import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import {
  DashboardPage,
  ItemsPage,
  ItemDetailPage,
  ItemFormPage,
 ActivityPage, // Added ActivityPage import
} from "@/pages";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/items/new" element={<ItemFormPage />} />
        <Route path="/items/:id" element={<ItemDetailPage />} />
        <Route path="/items/:id/edit" element={<ItemFormPage />} />
        <Route path="/activity" element={<ActivityPage />} /> // Added ActivityPage route
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
