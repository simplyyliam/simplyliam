import { Outlet } from "react-router-dom";


export default function StandaloneLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="min-h-dvh flex-1">
        <Outlet />
      </div>
    </div>
  );
}
