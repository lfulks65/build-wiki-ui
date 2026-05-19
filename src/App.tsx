import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { PageList } from "@/pages/PageList";
import { PageViewer } from "@/pages/PageViewer";
import { PageEditor } from "@/pages/PageEditor";
import { Search as SearchPage } from "@/pages/Search";
import { AssetBrowser } from "@/pages/AssetBrowser";
import { CuratorDashboard } from "@/pages/CuratorDashboard";
import { Settings } from "@/pages/Settings";
import { NotFound } from "@/pages/NotFound";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SkipLink } from "@/components/SkipLink";

/* ── Page wrappers with ErrorBoundary ─────────────────────────────── */

const withErrorBoundary = (Component: React.ComponentType) => () =>
  (
    <ErrorBoundary>
      <Component />
    </ErrorBoundary>
  );

/* ── App ──────────────────────────────────────────────────────────── */

export default function App() {
  return (
    <>
      <SkipLink />
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Outlet />
            </Layout>
          }
        >
          <Route index element={<Navigate to="/pages" replace />} />
          <Route path="pages" element={withErrorBoundary(PageList)} />
          <Route path="pages/:slug" element={withErrorBoundary(PageViewer)} />
          <Route
            path="pages/:slug/edit"
            element={withErrorBoundary(PageEditor)}
          />
          <Route path="pages/new" element={withErrorBoundary(PageEditor)} />
          <Route path="search" element={withErrorBoundary(SearchPage)} />
          <Route path="assets" element={withErrorBoundary(AssetBrowser)} />
          <Route
            path="curator"
            element={withErrorBoundary(CuratorDashboard)}
          />
          <Route path="settings" element={withErrorBoundary(Settings)} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
