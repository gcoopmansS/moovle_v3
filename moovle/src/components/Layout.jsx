import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 flex justify-center">
        <div className="w-full max-w-4xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
