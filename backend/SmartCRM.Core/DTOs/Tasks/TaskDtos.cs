using SmartCRM.Core.Entities;
using SmartCRM.Core.DTOs.Leads;

namespace SmartCRM.Core.DTOs.Tasks;

public record TaskDto(
    Guid Id,
    string Title,
    string? Description,
    string Status,
    string Priority,
    DateTime? DueDate,
    AssignedUserDto? AssignedTo,
    TaskRelatedDto? RelatedLead,
    TaskRelatedDto? RelatedDeal,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record TaskRelatedDto(Guid Id, string Name);

public record CreateTaskRequest(
    string Title,
    string? Description,
    TaskPriority Priority,
    DateTime? DueDate,
    string? AssignedToId,
    Guid? RelatedLeadId,
    Guid? RelatedDealId
);

public record UpdateTaskRequest(
    string? Title,
    string? Description,
    SmartCRM.Core.Entities.TaskStatus? Status,
    TaskPriority? Priority,
    DateTime? DueDate,
    string? AssignedToId
);
