import { Header } from '@/components/layout/Header';
import { LeadDetail } from '@/features/leads/LeadDetail';

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <Header title="Lead Detail" />
      <div className="flex-1 overflow-y-auto p-6">
        <LeadDetail id={id} />
      </div>
    </>
  );
}
