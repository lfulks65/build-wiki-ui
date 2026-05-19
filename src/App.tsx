import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PageList } from "@/components/PageList";
import { PageViewerRoute } from "@/pages/PageViewer";
import { PageEditor } from "@/pages/PageEditor";
import { SearchPage } from "@/components/SearchPage";
import { AssetBrowser } from "@/pages/AssetBrowser";
import { TagsPage } from "@/components/TagsPage";
import { TagPage } from "@/components/TagPage";
import { FavoritesPage } from "@/components/FavoritesPage";
import CuratorDashboard from "@/components/CuratorDashboard";
import { Settings } from "@/pages/Settings";
import { FavoritesPage } from "@/components/FavoritesPage";
import { BacklinksPage } from "@/components/BacklinksPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/pages" replace />} />
        <Route path="pages" element={<PageList />} />
        <Route path="pages/:slug" element={<PageViewerRoute />} />
        <Route path="pages/:slug/edit" element={<PageEditor />} />
        <Route path="pages/:slug/backlinks" element={<BacklinksPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="assets" element={<AssetBrowser />} />
        <Route path="tags" element={<TagsPage />} />
        <Route path="tags/:tag" element={<TagPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="curator" element={<CuratorDashboard />} />
        <Route path="settings" element={<Settings />} />
        <Route path="favorites" element={<FavoritesPage />} />
      </Route>
    </Routes>
  );
}
