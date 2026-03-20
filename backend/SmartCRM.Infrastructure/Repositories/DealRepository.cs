using Microsoft.EntityFrameworkCore;
using SmartCRM.Core.Entities;
using SmartCRM.Core.Interfaces;
using SmartCRM.Infrastructure.Data;

namespace SmartCRM.Infrastructure.Repositories;

public class DealRepository(AppDbContext context)
    : BaseRepository<Deal>(context), IDealRepository
{
    public async Task<IEnumerable<Deal>> GetAllWithDetailsAsync() =>
        await _context.Deals
            .Include(d => d.AssignedTo)
            .Include(d => d.Lead)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

    public async Task<Deal?> GetByIdWithDetailsAsync(Guid id) =>
        await _context.Deals
            .Include(d => d.AssignedTo)
            .Include(d => d.Lead)
            .Include(d => d.Tasks)
            .FirstOrDefaultAsync(d => d.Id == id);

    public async Task<IEnumerable<Deal>> GetByStageAsync(DealStage stage) =>
        await _context.Deals
            .Include(d => d.AssignedTo)
            .Include(d => d.Lead)
            .Where(d => d.Stage == stage)
            .ToListAsync();

    public async Task<IEnumerable<Deal>> GetByAssignedUserAsync(string userId) =>
        await _context.Deals
            .Include(d => d.AssignedTo)
            .Include(d => d.Lead)
            .Where(d => d.AssignedToId == userId)
            .ToListAsync();
}
