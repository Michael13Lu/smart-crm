using SmartCRM.Core.Entities;

namespace SmartCRM.Core.Interfaces;

public interface IJwtService
{
    string GenerateToken(ApplicationUser user, IList<string> roles);
}
