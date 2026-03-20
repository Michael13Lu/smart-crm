using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartCRM.Core.DTOs.Deals;
using SmartCRM.Core.Entities;
using SmartCRM.Core.Interfaces;

namespace SmartCRM.API.Controllers;

[ApiController]
[Route("api/deals")]
[Authorize]
public class DealsController(
    IDealRepository deals,
    IActivityLogRepository activity) : ControllerBase
{
    private string CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
        ?? throw new UnauthorizedAccessException();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DealDto>>> GetAll([FromQuery] string? stage)
    {
        var all = await deals.GetAllWithDetailsAsync();

        if (!string.IsNullOrEmpty(stage) && Enum.TryParse<DealStage>(stage, true, out var s))
            all = all.Where(d => d.Stage == s);

        return Ok(all.Select(ToDto));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DealDto>> GetById(Guid id)
    {
        var deal = await deals.GetByIdWithDetailsAsync(id);
        return deal is null ? NotFound() : Ok(ToDto(deal));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<DealDto>> Create([FromBody] CreateDealRequest request)
    {
        var deal = new Deal
        {
            Title = request.Title,
            Value = request.Value,
            Stage = request.Stage,
            Notes = request.Notes,
            ClosingDate = request.ClosingDate,
            LeadId = request.LeadId,
            AssignedToId = request.AssignedToId,
        };

        await deals.AddAsync(deal);
        await deals.SaveChangesAsync();
        await activity.LogAsync("Created deal", EntityType.Deal, deal.Id, deal.Title, CurrentUserId);

        var created = await deals.GetByIdWithDetailsAsync(deal.Id);
        return CreatedAtAction(nameof(GetById), new { id = deal.Id }, ToDto(created!));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<DealDto>> Update(Guid id, [FromBody] UpdateDealRequest request)
    {
        var deal = await deals.GetByIdWithDetailsAsync(id);
        if (deal is null) return NotFound();

        var oldStage = deal.Stage;

        if (request.Title is not null) deal.Title = request.Title;
        if (request.Value.HasValue) deal.Value = request.Value.Value;
        if (request.Stage.HasValue) deal.Stage = request.Stage.Value;
        if (request.Notes is not null) deal.Notes = request.Notes;
        if (request.ClosingDate.HasValue) deal.ClosingDate = request.ClosingDate;
        if (request.LeadId.HasValue) deal.LeadId = request.LeadId;
        if (request.AssignedToId is not null) deal.AssignedToId = request.AssignedToId;
        deal.UpdatedAt = DateTime.UtcNow;

        deals.Update(deal);
        await deals.SaveChangesAsync();

        var action = request.Stage.HasValue && request.Stage.Value != oldStage
            ? $"Moved deal to {request.Stage.Value}"
            : "Updated deal";
        await activity.LogAsync(action, EntityType.Deal, deal.Id, deal.Title, CurrentUserId);

        var updated = await deals.GetByIdWithDetailsAsync(id);
        return Ok(ToDto(updated!));
    }

    [HttpPatch("{id:guid}/stage")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<DealDto>> UpdateStage(Guid id, [FromBody] UpdateStageRequest request)
    {
        var deal = await deals.GetByIdWithDetailsAsync(id);
        if (deal is null) return NotFound();

        deal.Stage = request.Stage;
        deal.UpdatedAt = DateTime.UtcNow;

        deals.Update(deal);
        await deals.SaveChangesAsync();
        await activity.LogAsync($"Moved deal to {request.Stage}", EntityType.Deal, deal.Id, deal.Title, CurrentUserId);

        var updated = await deals.GetByIdWithDetailsAsync(id);
        return Ok(ToDto(updated!));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deal = await deals.GetByIdAsync(id);
        if (deal is null) return NotFound();
        deals.Remove(deal);
        await deals.SaveChangesAsync();
        return NoContent();
    }

    private static DealDto ToDto(Deal d) => new(
        Id: d.Id,
        Title: d.Title,
        Value: d.Value,
        Stage: d.Stage.ToString(),
        Notes: d.Notes,
        ClosingDate: d.ClosingDate,
        AssignedTo: d.AssignedTo is null ? null
            : new SmartCRM.Core.DTOs.Leads.AssignedUserDto(d.AssignedTo.Id, d.AssignedTo.FullName, d.AssignedTo.Email!),
        Lead: d.Lead is null ? null : new LeadSummaryDto(d.Lead.Id, d.Lead.Name, d.Lead.Company),
        CreatedAt: d.CreatedAt,
        UpdatedAt: d.UpdatedAt
    );
}

public record UpdateStageRequest(DealStage Stage);
