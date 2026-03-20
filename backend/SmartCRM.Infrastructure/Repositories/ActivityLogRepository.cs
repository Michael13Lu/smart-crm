using Microsoft.EntityFrameworkCore;
using SmartCRM.Core.Entities;
using SmartCRM.Core.Interfaces;
using SmartCRM.Infrastructure.Data;

namespace SmartCRM.Infrastructure.Repositories;

public class ActivityLogRepository(AppDbContext context)
    : BaseRepository<ActivityLog>(context), IActivityLogRepository
{
    public async Task<IEnumerable<ActivityLog>> GetRecentAsync(int count = 20) =>
        await _context.ActivityLogs
            .Include(a => a.PerformedBy)
            .OrderByDescending(a => a.CreatedAt)
            .Take(count)
            .ToListAsync();

    public async Task LogAsync(
        string action,
        EntityType entityType,
        Guid entityId,
        string entityName,
        string userId)
    {
        var log = new ActivityLog
        {
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            EntityName = entityName,
            PerformedById = userId,
        };
        await _context.ActivityLogs.AddAsync(log);
        await _context.SaveChangesAsync();
    }
}
