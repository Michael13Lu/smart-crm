import { Header } from '@/components/layout/Header';
import { TasksList } from '@/features/tasks/TasksList';

export default function TasksPage() {
  return (
    <>
      <Header title="Tasks" />
      <div className="flex-1 overflow-y-auto p-6">
        <TasksList />
      </div>
    </>
  );
}
