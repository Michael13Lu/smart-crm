namespace SmartCRM.Core.Entities;

public enum LeadStatus
{
    New,
    Contacted,
    Qualified,
    Lost
}

public class Lead
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Company { get; set; }
    public string? Source { get; set; }
    public string? Notes { get; set; }
    public LeadStatus Status { get; set; } = LeadStatus.New;

    public string? AssignedToId { get; set; }
    public ApplicationUser? AssignedTo { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Deal> Deals { get; set; } = [];
    public ICollection<TaskItem> Tasks { get; set; } = [];
}
