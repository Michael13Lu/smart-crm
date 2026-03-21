import { Header } from '@/components/layout/Header';
import { LeadsTable } from '@/features/leads/LeadsTable';

export default function LeadsPage() {
  return (
    <>
      <Header title="Leads" />
      <div className="flex-1 overflow-y-auto p-6">
        <LeadsTable />
      </div>
    </>
  );
}
