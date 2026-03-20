using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartCRM.Core.Interfaces;

namespace SmartCRM.API.Controllers;

[ApiController]
[Route("api/activity")]
[Authorize]
public class ActivityLogsController(IActivityLogRepository activity) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetRecent([FromQuery] int count = 20)
    {
        var logs = await activity.GetRecentAsync(Math.Clamp(count, 1, 100));
        return Ok(logs.Select(a => new
        {
            a.Id,
            a.Action,
            EntityType = a.EntityType.ToString(),
            a.EntityId,
            a.EntityName,
            PerformedBy = new { a.PerformedBy.Id, a.PerformedBy.FullName, a.PerformedBy.Email },
            a.CreatedAt,
        }));
    }
}
