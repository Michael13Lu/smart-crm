using SmartCRM.Core.Entities;
using TaskStatus = SmartCRM.Core.Entities.TaskStatus;

namespace SmartCRM.Core.Interfaces;

public interface ITaskRepository : IRepository<TaskItem>
{
    Task<IEnumerable<TaskItem>> GetAllWithDetailsAsync();
    Task<TaskItem?> GetByIdWithDetailsAsync(Guid id);
    Task<IEnumerable<TaskItem>> GetByAssignedUserAsync(string userId);
    Task<IEnumerable<TaskItem>> GetByStatusAsync(TaskStatus status);
}
