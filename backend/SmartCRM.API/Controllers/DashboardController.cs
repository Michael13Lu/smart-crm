using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartCRM.Core.Entities;
using SmartCRM.Infrastructure.Data;

namespace SmartCRM.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController(AppDbContext context) : ControllerBase
{
    [HttpGet("stats")]
    public async Task<ActionResult<DashboardStatsDto>> GetStats()
    {
        var totalLeads = await context.Leads.CountAsync();
        var newLeads = await context.Leads.CountAsync(l => l.Status == LeadStatus.New);
        var qualifiedLeads = await context.Leads.CountAsync(l => l.Status == LeadStatus.Qualified);

        var totalDeals = await context.Deals.CountAsync();
        var totalRevenue = await context.Deals
            .Where(d => d.Stage == DealStage.ClosedWon)
            .SumAsync(d => (decimal?)d.Value) ?? 0;
        var pipelineValue = await context.Deals
            .Where(d => d.Stage != DealStage.ClosedWon && d.Stage != DealStage.ClosedLost)
            .SumAsync(d => (decimal?)d.Value) ?? 0;

        var dealsByStage = await context.Deals
            .GroupBy(d => d.Stage)
            .Select(g => new DealsByStageDto(g.Key.ToString(), g.Count(), g.Sum(d => d.Value)))
            .ToListAsync();

        var pendingTasks = await context.Tasks
            .CountAsync(t => t.Status == Core.Entities.TaskStatus.Pending);
        var overdueTasks = await context.Tasks
            .CountAsync(t => t.Status != Core.Entities.TaskStatus.Done
                          && t.DueDate < DateTime.UtcNow);

        var recentActivity = await context.ActivityLogs
            .Include(a => a.PerformedBy)
            .OrderByDescending(a => a.CreatedAt)
            .Take(10)
            .Select(a => new ActivityDto(
                a.Id,
                a.Action,
                a.EntityType.ToString(),
                a.EntityId,
                a.EntityName,
                a.PerformedBy.FullName,
                a.CreatedAt))
            .ToListAsync();

        return Ok(new DashboardStatsDto(
            TotalLeads: totalLeads,
            NewLeads: newLeads,
            QualifiedLeads: qualifiedLeads,
            TotalDeals: totalDeals,
            TotalRevenue: totalRevenue,
            PipelineValue: pipelineValue,
            DealsByStage: dealsByStage,
            PendingTasks: pendingTasks,
            OverdueTasks: overdueTasks,
            RecentActivity: recentActivity
        ));
    }
}

public record DashboardStatsDto(
    int TotalLeads,
    int NewLeads,
    int QualifiedLeads,
    int TotalDeals,
    decimal TotalRevenue,
    decimal PipelineValue,
    List<DealsByStageDto> DealsByStage,
    int PendingTasks,
    int OverdueTasks,
    List<ActivityDto> RecentActivity
);

public record DealsByStageDto(string Stage, int Count, decimal Value);

public record ActivityDto(
    Guid Id,
    string Action,
    string EntityType,
    Guid EntityId,
    string EntityName,
    string PerformedBy,
    DateTime CreatedAt
);
