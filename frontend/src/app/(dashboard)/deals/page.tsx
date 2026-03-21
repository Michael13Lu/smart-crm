import { Header } from '@/components/layout/Header';
import { DealsKanban } from '@/features/deals/DealsKanban';

export default function DealsPage() {
  return (
    <>
      <Header title="Pipeline" />
      <div className="flex-1 overflow-hidden p-6">
        <DealsKanban />
      </div>
    </>
  );
}
