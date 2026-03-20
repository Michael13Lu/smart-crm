using Microsoft.EntityFrameworkCore;
using SmartCRM.Core.Entities;
using SmartCRM.Core.Interfaces;
using SmartCRM.Infrastructure.Data;
using TaskStatus = SmartCRM.Core.Entities.TaskStatus;

namespace SmartCRM.Infrastructure.Repositories;

public class TaskRepository(AppDbContext context)
    : BaseRepository<TaskItem>(context), ITaskRepository
{
    public async Task<IEnumerable<TaskItem>> GetAllWithDetailsAsync() =>
        await _context.Tasks
            .Include(t => t.AssignedTo)
            .Include(t => t.RelatedLead)
            .Include(t => t.RelatedDeal)
            .OrderBy(t => t.DueDate)
            .ThenByDescending(t => t.Priority)
            .ToListAsync();

    public async Task<TaskItem?> GetByIdWithDetailsAsync(Guid id) =>
        await _context.Tasks
            .Include(t => t.AssignedTo)
            .Include(t => t.RelatedLead)
            .Include(t => t.RelatedDeal)
            .FirstOrDefaultAsync(t => t.Id == id);

    public async Task<IEnumerable<TaskItem>> GetByAssignedUserAsync(string userId) =>
        await _context.Tasks
            .Include(t => t.AssignedTo)
            .Include(t => t.RelatedLead)
            .Include(t => t.RelatedDeal)
            .Where(t => t.AssignedToId == userId)
            .ToListAsync();

    public async Task<IEnumerable<TaskItem>> GetByStatusAsync(TaskStatus status) =>
        await _context.Tasks
            .Include(t => t.AssignedTo)
            .Where(t => t.Status == status)
            .ToListAsync();
}
