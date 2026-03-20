using SmartCRM.Core.Entities;

namespace SmartCRM.Core.Interfaces;

public interface ILeadRepository : IRepository<Lead>
{
    Task<IEnumerable<Lead>> GetAllWithDetailsAsync();
    Task<Lead?> GetByIdWithDetailsAsync(Guid id);
    Task<IEnumerable<Lead>> GetByStatusAsync(LeadStatus status);
    Task<IEnumerable<Lead>> GetByAssignedUserAsync(string userId);
}
