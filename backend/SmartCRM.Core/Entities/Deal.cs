namespace SmartCRM.Core.Entities;

public enum DealStage
{
    New,
    Contacted,
    Negotiation,
    ClosedWon,
    ClosedLost
}

public class Deal
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public DealStage Stage { get; set; } = DealStage.New;
    public string? Notes { get; set; }
    public DateTime? ClosingDate { get; set; }

    public Guid? LeadId { get; set; }
    public Lead? Lead { get; set; }

    public string? AssignedToId { get; set; }
    public ApplicationUser? AssignedTo { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<TaskItem> Tasks { get; set; } = [];
}
