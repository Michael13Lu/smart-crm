using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SmartCRM.Core.Entities;

namespace SmartCRM.Infrastructure.Data;

public static class DbSeeder
{
    public static readonly string[] Roles = ["Admin", "Manager", "Viewer"];

    public static async Task SeedAsync(
        AppDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager)
    {
        await context.Database.MigrateAsync();

        // Roles
        foreach (var role in Roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        // Users
        await EnsureUserAsync(userManager, new ApplicationUser
        {
            UserName = "admin@smartcrm.demo",
            Email = "admin@smartcrm.demo",
            FullName = "Alex Morgan",
            EmailConfirmed = true,
        }, "Demo@123!", "Admin");

        await EnsureUserAsync(userManager, new ApplicationUser
        {
            UserName = "sarah@smartcrm.demo",
            Email = "sarah@smartcrm.demo",
            FullName = "Sarah Chen",
            EmailConfirmed = true,
        }, "Demo@123!", "Manager");

        await EnsureUserAsync(userManager, new ApplicationUser
        {
            UserName = "james@smartcrm.demo",
            Email = "james@smartcrm.demo",
            FullName = "James Wilson",
            EmailConfirmed = true,
        }, "Demo@123!", "Manager");

        await EnsureUserAsync(userManager, new ApplicationUser
        {
            UserName = "emily@smartcrm.demo",
            Email = "emily@smartcrm.demo",
            FullName = "Emily Park",
            EmailConfirmed = true,
        }, "Demo@123!", "Viewer");

        // Seed demo data only if tables are empty
        if (!await context.Leads.AnyAsync())
            await SeedDemoDataAsync(context, userManager);
    }

    private static async Task EnsureUserAsync(
        UserManager<ApplicationUser> userManager,
        ApplicationUser user,
        string password,
        string role)
    {
        var existing = await userManager.FindByEmailAsync(user.Email!);
        if (existing is null)
        {
            var result = await userManager.CreateAsync(user, password);
            if (result.Succeeded)
                await userManager.AddToRoleAsync(user, role);
        }
    }

    private static async Task SeedDemoDataAsync(
        AppDbContext context,
        UserManager<ApplicationUser> userManager)
    {
        var sarah = await userManager.FindByEmailAsync("sarah@smartcrm.demo");
        var james = await userManager.FindByEmailAsync("james@smartcrm.demo");
        var admin = await userManager.FindByEmailAsync("admin@smartcrm.demo");

        var leads = new List<Lead>
        {
            new() { Name = "Acme Corp", Email = "contact@acme.com", Phone = "+1 555-0100",
                Company = "Acme Corporation", Source = "Website", Status = LeadStatus.Qualified,
                AssignedToId = sarah!.Id, Notes = "Interested in enterprise plan. Follow up after Q2.",
                CreatedAt = DateTime.UtcNow.AddDays(-70), UpdatedAt = DateTime.UtcNow.AddDays(-30) },
            new() { Name = "Globex Inc", Email = "info@globex.com", Phone = "+1 555-0200",
                Company = "Globex Inc", Source = "Referral", Status = LeadStatus.Contacted,
                AssignedToId = james!.Id, Notes = "Spoke with CEO. Demo scheduled for next week.",
                CreatedAt = DateTime.UtcNow.AddDays(-57), UpdatedAt = DateTime.UtcNow.AddDays(-19) },
            new() { Name = "Initech Solutions", Email = "sales@initech.com",
                Company = "Initech Solutions", Source = "LinkedIn", Status = LeadStatus.New,
                CreatedAt = DateTime.UtcNow.AddDays(-44), UpdatedAt = DateTime.UtcNow.AddDays(-44) },
            new() { Name = "Pied Piper", Email = "richard@piedpiper.com",
                Company = "Pied Piper", Source = "Website", Status = LeadStatus.New,
                CreatedAt = DateTime.UtcNow.AddDays(-5), UpdatedAt = DateTime.UtcNow.AddDays(-5) },
        };

        await context.Leads.AddRangeAsync(leads);
        await context.SaveChangesAsync();

        var deals = new List<Deal>
        {
            new() { Title = "Acme Corp — Enterprise License", Value = 48000,
                Stage = DealStage.Negotiation, LeadId = leads[0].Id, AssignedToId = sarah.Id,
                ClosingDate = DateTime.UtcNow.AddDays(40), Notes = "Annual contract. Legal review in progress.",
                CreatedAt = DateTime.UtcNow.AddDays(-49), UpdatedAt = DateTime.UtcNow.AddDays(-8) },
            new() { Title = "Globex Inc — Starter Plan", Value = 12000,
                Stage = DealStage.Contacted, LeadId = leads[1].Id, AssignedToId = james.Id,
                ClosingDate = DateTime.UtcNow.AddDays(26),
                CreatedAt = DateTime.UtcNow.AddDays(-39), UpdatedAt = DateTime.UtcNow.AddDays(-15) },
            new() { Title = "Initech Solutions — Pro Plan", Value = 18000,
                Stage = DealStage.ClosedWon, LeadId = leads[2].Id, AssignedToId = sarah.Id,
                ClosingDate = DateTime.UtcNow.AddDays(-10),
                CreatedAt = DateTime.UtcNow.AddDays(-59), UpdatedAt = DateTime.UtcNow.AddDays(-10) },
        };

        await context.Deals.AddRangeAsync(deals);
        await context.SaveChangesAsync();

        var tasks = new List<TaskItem>
        {
            new() { Title = "Send contract to Acme Corp", Priority = TaskPriority.High,
                Status = Core.Entities.TaskStatus.InProgress, AssignedToId = sarah.Id,
                RelatedDealId = deals[0].Id, DueDate = DateTime.UtcNow.AddDays(5),
                Description = "Prepare and send the enterprise agreement for legal review." },
            new() { Title = "Schedule demo with Globex", Priority = TaskPriority.High,
                Status = Core.Entities.TaskStatus.Pending, AssignedToId = james.Id,
                RelatedLeadId = leads[1].Id, DueDate = DateTime.UtcNow.AddDays(2) },
            new() { Title = "Follow up with Pied Piper lead", Priority = TaskPriority.Medium,
                Status = Core.Entities.TaskStatus.Pending, AssignedToId = sarah.Id,
                RelatedLeadId = leads[3].Id, DueDate = DateTime.UtcNow.AddDays(8) },
        };

        await context.Tasks.AddRangeAsync(tasks);

        var activityLogs = new List<ActivityLog>
        {
            new() { Action = "Created lead", EntityType = EntityType.Lead,
                EntityId = leads[3].Id, EntityName = "Pied Piper", PerformedById = admin!.Id,
                CreatedAt = DateTime.UtcNow.AddDays(-5) },
            new() { Action = "Moved deal to Negotiation", EntityType = EntityType.Deal,
                EntityId = deals[0].Id, EntityName = deals[0].Title, PerformedById = sarah.Id,
                CreatedAt = DateTime.UtcNow.AddDays(-8) },
            new() { Action = "Deal closed (Won)", EntityType = EntityType.Deal,
                EntityId = deals[2].Id, EntityName = deals[2].Title, PerformedById = sarah.Id,
                CreatedAt = DateTime.UtcNow.AddDays(-10) },
        };

        await context.ActivityLogs.AddRangeAsync(activityLogs);
        await context.SaveChangesAsync();
    }
}
