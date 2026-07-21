import AdminSidebar from '@/components/AdminSidebar';

export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 relative z-50">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden p-6 md:p-10 ml-0 md:ml-64">
        {children}
      </div>
    </div>
  );
}
