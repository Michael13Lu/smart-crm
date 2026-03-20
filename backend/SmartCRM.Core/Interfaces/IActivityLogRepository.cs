using SmartCRM.Core.Entities;

namespace SmartCRM.Core.Interfaces;

public interface IActivityLogRepository : IRepository<ActivityLog>
{
    Task<IEnumerable<ActivityLog>> GetRecentAsync(int count = 20);
    Task LogAsync(string action, EntityType entityType, Guid entityId, string entityName, string userId);
}
