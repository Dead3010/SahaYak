import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <main className="pt-14 pl-52 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 lg:px-10 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
