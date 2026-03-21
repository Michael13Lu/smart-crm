import { Header } from '@/components/layout/Header';
import { DashboardStats } from '@/features/dashboard/DashboardStats';
import { RecentActivity } from '@/features/dashboard/RecentActivity';
import { PipelineSummary } from '@/features/dashboard/PipelineSummary';
import { RecentLeads } from '@/features/dashboard/RecentLeads';
import { AutomationBanner } from '@/features/dashboard/AutomationBanner';

export default function DashboardPage() {
  return (
    <>
      <Header title="Dashboard" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AutomationBanner />
        <DashboardStats />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PipelineSummary />
          </div>
          <div>
            <RecentActivity />
          </div>
        </div>
        <RecentLeads />
      </div>
    </>
  );
}
