import Layout from './components/Layout';
import Pages from './components/Pages';
import SearchPage from './components/Search';
import AssetsPage from './components/Assets';
import CuratorPage from './components/Curator';
import SettingsPage from './components/Settings';
import HomePage from './components/Home';
import CommandPalette from './components/CommandPalette';
import { Routes, Route } from 'react-router-dom';

/** Root application component. */
export default function App() {
  return (
    <Routes>
      <Route path="*" element={<AppShell />} />
    </Routes>
  );
}

/** Application shell: Layout (sidebar + header + page content) + CommandPalette. */
function AppShell() {
  return (
    <>
      <Routes>
        <Route path="*" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="/pages" element={<Pages />} />
          <Route path="/pages/*" element={<Pages />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/curator" element={<CuratorPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      {/* CommandPalette renders outside Layout so it overlays everything */}
      <CommandPalette />
    </>
  );
}
