using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartCRM.Core.DTOs.Leads;
using SmartCRM.Core.Entities;
using SmartCRM.Core.Interfaces;

namespace SmartCRM.API.Controllers;

[ApiController]
[Route("api/leads")]
[Authorize]
public class LeadsController(
    ILeadRepository leads,
    IActivityLogRepository activity) : ControllerBase
{
    private string CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
        ?? throw new UnauthorizedAccessException();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LeadDto>>> GetAll(
        [FromQuery] string? status,
        [FromQuery] string? search)
    {
        var all = await leads.GetAllWithDetailsAsync();

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<LeadStatus>(status, true, out var s))
            all = all.Where(l => l.Status == s);

        if (!string.IsNullOrEmpty(search))
        {
            var q = search.ToLower();
            all = all.Where(l =>
                l.Name.ToLower().Contains(q) ||
                l.Email.ToLower().Contains(q) ||
                (l.Company ?? "").ToLower().Contains(q));
        }

        return Ok(all.Select(ToDto));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<LeadDto>> GetById(Guid id)
    {
        var lead = await leads.GetByIdWithDetailsAsync(id);
        return lead is null ? NotFound() : Ok(ToDto(lead));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<LeadDto>> Create([FromBody] CreateLeadRequest request)
    {
        var lead = new Lead
        {
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            Company = request.Company,
            Source = request.Source,
            Notes = request.Notes,
            AssignedToId = request.AssignedToId,
        };

        await leads.AddAsync(lead);
        await leads.SaveChangesAsync();

        await activity.LogAsync("Created lead", EntityType.Lead, lead.Id, lead.Name, CurrentUserId);

        var created = await leads.GetByIdWithDetailsAsync(lead.Id);
        return CreatedAtAction(nameof(GetById), new { id = lead.Id }, ToDto(created!));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<LeadDto>> Update(Guid id, [FromBody] UpdateLeadRequest request)
    {
        var lead = await leads.GetByIdWithDetailsAsync(id);
        if (lead is null) return NotFound();

        if (request.Name is not null) lead.Name = request.Name;
        if (request.Email is not null) lead.Email = request.Email;
        if (request.Phone is not null) lead.Phone = request.Phone;
        if (request.Company is not null) lead.Company = request.Company;
        if (request.Source is not null) lead.Source = request.Source;
        if (request.Notes is not null) lead.Notes = request.Notes;
        if (request.Status.HasValue) lead.Status = request.Status.Value;
        if (request.AssignedToId is not null) lead.AssignedToId = request.AssignedToId;
        lead.UpdatedAt = DateTime.UtcNow;

        leads.Update(lead);
        await leads.SaveChangesAsync();

        await activity.LogAsync("Updated lead", EntityType.Lead, lead.Id, lead.Name, CurrentUserId);

        var updated = await leads.GetByIdWithDetailsAsync(id);
        return Ok(ToDto(updated!));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var lead = await leads.GetByIdAsync(id);
        if (lead is null) return NotFound();

        leads.Remove(lead);
        await leads.SaveChangesAsync();

        return NoContent();
    }

    private static LeadDto ToDto(Lead l) => new(
        Id: l.Id,
        Name: l.Name,
        Email: l.Email,
        Phone: l.Phone,
        Company: l.Company,
        Source: l.Source,
        Notes: l.Notes,
        Status: l.Status.ToString(),
        AssignedTo: l.AssignedTo is null ? null : new AssignedUserDto(
            l.AssignedTo.Id, l.AssignedTo.FullName, l.AssignedTo.Email!),
        CreatedAt: l.CreatedAt,
        UpdatedAt: l.UpdatedAt
    );
}
