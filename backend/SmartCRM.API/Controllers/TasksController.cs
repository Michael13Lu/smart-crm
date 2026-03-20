using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartCRM.Core.DTOs.Tasks;
using SmartCRM.Core.Entities;
using SmartCRM.Core.Interfaces;
using TaskStatus = SmartCRM.Core.Entities.TaskStatus;

namespace SmartCRM.API.Controllers;

[ApiController]
[Route("api/tasks")]
[Authorize]
public class TasksController(
    ITaskRepository tasks,
    IActivityLogRepository activity) : ControllerBase
{
    private string CurrentUserId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
        ?? throw new UnauthorizedAccessException();

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskDto>>> GetAll(
        [FromQuery] string? status,
        [FromQuery] string? assignedTo)
    {
        var all = await tasks.GetAllWithDetailsAsync();

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<TaskStatus>(status, true, out var s))
            all = all.Where(t => t.Status == s);

        if (!string.IsNullOrEmpty(assignedTo))
            all = all.Where(t => t.AssignedToId == assignedTo);

        return Ok(all.Select(ToDto));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TaskDto>> GetById(Guid id)
    {
        var task = await tasks.GetByIdWithDetailsAsync(id);
        return task is null ? NotFound() : Ok(ToDto(task));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<TaskDto>> Create([FromBody] CreateTaskRequest request)
    {
        var task = new TaskItem
        {
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            DueDate = request.DueDate,
            AssignedToId = request.AssignedToId,
            RelatedLeadId = request.RelatedLeadId,
            RelatedDealId = request.RelatedDealId,
        };

        await tasks.AddAsync(task);
        await tasks.SaveChangesAsync();
        await activity.LogAsync("Created task", EntityType.Task, task.Id, task.Title, CurrentUserId);

        var created = await tasks.GetByIdWithDetailsAsync(task.Id);
        return CreatedAtAction(nameof(GetById), new { id = task.Id }, ToDto(created!));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<TaskDto>> Update(Guid id, [FromBody] UpdateTaskRequest request)
    {
        var task = await tasks.GetByIdWithDetailsAsync(id);
        if (task is null) return NotFound();

        if (request.Title is not null) task.Title = request.Title;
        if (request.Description is not null) task.Description = request.Description;
        if (request.Status.HasValue) task.Status = request.Status.Value;
        if (request.Priority.HasValue) task.Priority = request.Priority.Value;
        if (request.DueDate.HasValue) task.DueDate = request.DueDate;
        if (request.AssignedToId is not null) task.AssignedToId = request.AssignedToId;
        task.UpdatedAt = DateTime.UtcNow;

        tasks.Update(task);
        await tasks.SaveChangesAsync();
        await activity.LogAsync("Updated task", EntityType.Task, task.Id, task.Title, CurrentUserId);

        var updated = await tasks.GetByIdWithDetailsAsync(id);
        return Ok(ToDto(updated!));
    }

    [HttpPatch("{id:guid}/complete")]
    public async Task<ActionResult<TaskDto>> Complete(Guid id)
    {
        var task = await tasks.GetByIdWithDetailsAsync(id);
        if (task is null) return NotFound();

        task.Status = TaskStatus.Done;
        task.UpdatedAt = DateTime.UtcNow;

        tasks.Update(task);
        await tasks.SaveChangesAsync();
        await activity.LogAsync("Completed task", EntityType.Task, task.Id, task.Title, CurrentUserId);

        var updated = await tasks.GetByIdWithDetailsAsync(id);
        return Ok(ToDto(updated!));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var task = await tasks.GetByIdAsync(id);
        if (task is null) return NotFound();
        tasks.Remove(task);
        await tasks.SaveChangesAsync();
        return NoContent();
    }

    private static TaskDto ToDto(TaskItem t) => new(
        Id: t.Id,
        Title: t.Title,
        Description: t.Description,
        Status: t.Status.ToString(),
        Priority: t.Priority.ToString(),
        DueDate: t.DueDate,
        AssignedTo: t.AssignedTo is null ? null
            : new SmartCRM.Core.DTOs.Leads.AssignedUserDto(t.AssignedTo.Id, t.AssignedTo.FullName, t.AssignedTo.Email!),
        RelatedLead: t.RelatedLead is null ? null : new TaskRelatedDto(t.RelatedLead.Id, t.RelatedLead.Name),
        RelatedDeal: t.RelatedDeal is null ? null : new TaskRelatedDto(t.RelatedDeal.Id, t.RelatedDeal.Title),
        CreatedAt: t.CreatedAt,
        UpdatedAt: t.UpdatedAt
    );
}
