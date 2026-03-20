namespace SmartCRM.Core.Entities;

public enum EntityType
{
    Lead,
    Deal,
    Task,
    User
}

public class ActivityLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Action { get; set; } = string.Empty;
    public EntityType EntityType { get; set; }
    public Guid EntityId { get; set; }
    public string EntityName { get; set; } = string.Empty;

    public string PerformedById { get; set; } = string.Empty;
    public ApplicationUser PerformedBy { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
