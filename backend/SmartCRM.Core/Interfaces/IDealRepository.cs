using SmartCRM.Core.Entities;

namespace SmartCRM.Core.Interfaces;

public interface IDealRepository : IRepository<Deal>
{
    Task<IEnumerable<Deal>> GetAllWithDetailsAsync();
    Task<Deal?> GetByIdWithDetailsAsync(Guid id);
    Task<IEnumerable<Deal>> GetByStageAsync(DealStage stage);
    Task<IEnumerable<Deal>> GetByAssignedUserAsync(string userId);
}
