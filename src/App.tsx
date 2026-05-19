import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PageList } from "@/pages/PageList";
import { PageViewer } from "@/pages/PageViewer";
import { PageEditor } from "@/pages/PageEditor";
import { Search } from "@/pages/Search";
import { AssetBrowser } from "@/pages/AssetBrowser";
import { CuratorDashboard } from "@/pages/CuratorDashboard";
import { SearchPage } from "@/components/SearchPage";

/* ── App ──────────────────────────────────────────────────────────── */

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <Route index element={<Navigate to="/pages" replace />} />
            <Route path="pages" element={<PageList />} />
            <Route path="pages/:slug" element={<PageViewer />} />
            <Route path="pages/:slug/edit" element={<PageEditor />} />
            <Route path="search" element={<Search />} />
            <Route path="search/new" element={<SearchPage />} />
            <Route path="assets" element={<AssetBrowser />} />
            <Route path="curator" element={<CuratorDashboard />} />
          </Layout>
        }
      />
    </Routes>
  );
}
