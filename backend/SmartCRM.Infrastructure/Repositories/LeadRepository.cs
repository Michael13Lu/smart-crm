using Microsoft.EntityFrameworkCore;
using SmartCRM.Core.Entities;
using SmartCRM.Core.Interfaces;
using SmartCRM.Infrastructure.Data;

namespace SmartCRM.Infrastructure.Repositories;

public class LeadRepository(AppDbContext context)
    : BaseRepository<Lead>(context), ILeadRepository
{
    public async Task<IEnumerable<Lead>> GetAllWithDetailsAsync() =>
        await _context.Leads
            .Include(l => l.AssignedTo)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

    public async Task<Lead?> GetByIdWithDetailsAsync(Guid id) =>
        await _context.Leads
            .Include(l => l.AssignedTo)
            .Include(l => l.Tasks)
            .Include(l => l.Deals)
            .FirstOrDefaultAsync(l => l.Id == id);

    public async Task<IEnumerable<Lead>> GetByStatusAsync(LeadStatus status) =>
        await _context.Leads
            .Include(l => l.AssignedTo)
            .Where(l => l.Status == status)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

    public async Task<IEnumerable<Lead>> GetByAssignedUserAsync(string userId) =>
        await _context.Leads
            .Include(l => l.AssignedTo)
            .Where(l => l.AssignedToId == userId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();
}
