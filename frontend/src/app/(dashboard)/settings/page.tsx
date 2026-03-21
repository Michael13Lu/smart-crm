import { Header } from '@/components/layout/Header';
import { SettingsPanel } from '@/features/settings/SettingsPanel';

export default function SettingsPage() {
  return (
    <>
      <Header title="Settings" />
      <div className="flex-1 overflow-y-auto p-6">
        <SettingsPanel />
      </div>
    </>
  );
}
