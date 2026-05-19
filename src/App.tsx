import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PageList } from "@/components/PageList";
import { PageViewerRoute } from "@/pages/PageViewer";
import { PageEditor } from "@/pages/PageEditor";
import { SearchPage } from "@/components/SearchPage";
import { AssetBrowser } from "@/pages/AssetBrowser";
import CuratorDashboard from "@/components/CuratorDashboard";
import { Settings } from "@/pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/pages" replace />} />
        <Route path="pages" element={<PageList />} />
        <Route path="pages/:slug" element={<PageViewerRoute />} />
        <Route path="pages/:slug/edit" element={<PageEditor />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="assets" element={<AssetBrowser />} />
        <Route path="curator" element={<CuratorDashboard />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
