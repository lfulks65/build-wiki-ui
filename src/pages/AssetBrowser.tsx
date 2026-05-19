import CuratorDashboardComponent from "@/components/CuratorDashboard";

export function AssetBrowser() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        Assets
      </h1>
      <CuratorDashboardComponent />
    </div>
  );
}
