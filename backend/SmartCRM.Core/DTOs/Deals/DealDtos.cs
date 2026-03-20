using SmartCRM.Core.Entities;
using SmartCRM.Core.DTOs.Leads;

namespace SmartCRM.Core.DTOs.Deals;

public record DealDto(
    Guid Id,
    string Title,
    decimal Value,
    string Stage,
    string? Notes,
    DateTime? ClosingDate,
    AssignedUserDto? AssignedTo,
    LeadSummaryDto? Lead,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record LeadSummaryDto(Guid Id, string Name, string? Company);

public record CreateDealRequest(
    string Title,
    decimal Value,
    DealStage Stage,
    string? Notes,
    DateTime? ClosingDate,
    Guid? LeadId,
    string? AssignedToId
);

public record UpdateDealRequest(
    string? Title,
    decimal? Value,
    DealStage? Stage,
    string? Notes,
    DateTime? ClosingDate,
    Guid? LeadId,
    string? AssignedToId
);
