using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SmartCRM.Core.Entities;

namespace SmartCRM.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<Deal> Deals => Set<Deal>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Lead
        builder.Entity<Lead>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.Email).HasMaxLength(300).IsRequired();
            e.Property(x => x.Status).HasConversion<string>();
            e.HasOne(x => x.AssignedTo)
             .WithMany(u => u.AssignedLeads)
             .HasForeignKey(x => x.AssignedToId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // Deal
        builder.Entity<Deal>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(300).IsRequired();
            e.Property(x => x.Value).HasPrecision(18, 2);
            e.Property(x => x.Stage).HasConversion<string>();
            e.HasOne(x => x.Lead)
             .WithMany(l => l.Deals)
             .HasForeignKey(x => x.LeadId)
             .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.AssignedTo)
             .WithMany(u => u.AssignedDeals)
             .HasForeignKey(x => x.AssignedToId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // TaskItem
        builder.Entity<TaskItem>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Title).HasMaxLength(300).IsRequired();
            e.Property(x => x.Status).HasConversion<string>();
            e.Property(x => x.Priority).HasConversion<string>();
            e.HasOne(x => x.AssignedTo)
             .WithMany(u => u.AssignedTasks)
             .HasForeignKey(x => x.AssignedToId)
             .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.RelatedLead)
             .WithMany(l => l.Tasks)
             .HasForeignKey(x => x.RelatedLeadId)
             .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.RelatedDeal)
             .WithMany(d => d.Tasks)
             .HasForeignKey(x => x.RelatedDealId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ActivityLog
        builder.Entity<ActivityLog>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Action).HasMaxLength(300).IsRequired();
            e.Property(x => x.EntityName).HasMaxLength(300).IsRequired();
            e.Property(x => x.EntityType).HasConversion<string>();
            e.HasOne(x => x.PerformedBy)
             .WithMany(u => u.ActivityLogs)
             .HasForeignKey(x => x.PerformedById)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Rename Identity tables for clarity
        builder.Entity<ApplicationUser>().ToTable("Users");
    }
}
