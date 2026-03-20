using SmartCRM.Core.Entities;

namespace SmartCRM.Core.DTOs.Leads;

public record LeadDto(
    Guid Id,
    string Name,
    string Email,
    string? Phone,
    string? Company,
    string? Source,
    string? Notes,
    string Status,
    AssignedUserDto? AssignedTo,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record AssignedUserDto(string Id, string FullName, string Email);

public record CreateLeadRequest(
    string Name,
    string Email,
    string? Phone,
    string? Company,
    string? Source,
    string? Notes,
    string? AssignedToId
);

public record UpdateLeadRequest(
    string? Name,
    string? Email,
    string? Phone,
    string? Company,
    string? Source,
    string? Notes,
    LeadStatus? Status,
    string? AssignedToId
);
