using Microsoft.AspNetCore.Identity;

namespace SmartCRM.Core.Entities;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;

    // Navigation
    public ICollection<Lead> AssignedLeads { get; set; } = [];
    public ICollection<Deal> AssignedDeals { get; set; } = [];
    public ICollection<TaskItem> AssignedTasks { get; set; } = [];
    public ICollection<ActivityLog> ActivityLogs { get; set; } = [];
}
