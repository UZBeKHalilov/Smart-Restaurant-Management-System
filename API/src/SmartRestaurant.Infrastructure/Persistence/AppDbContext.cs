using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SmartRestaurant.Application.Common.Interfaces;
using SmartRestaurant.Domain.Entities;

namespace SmartRestaurant.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<AppUser, IdentityRole<int>, int>, IApplicationDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Table>     Tables     => Set<Table>();
    public DbSet<Category>  Categories => Set<Category>();
    public DbSet<MenuItem>  MenuItems  => Set<MenuItem>();
    public DbSet<Order>     Orders     => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Bill>      Bills      => Set<Bill>();
    public DbSet<AppUser>   Users      => Set<AppUser>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Rename Identity tables
        builder.Entity<AppUser>().ToTable("Users");
        builder.Entity<IdentityRole<int>>().ToTable("Roles");
        builder.Entity<IdentityUserRole<int>>().ToTable("UserRoles");
        builder.Entity<IdentityUserClaim<int>>().ToTable("UserClaims");
        builder.Entity<IdentityUserLogin<int>>().ToTable("UserLogins");
        builder.Entity<IdentityUserToken<int>>().ToTable("UserTokens");
        builder.Entity<IdentityRoleClaim<int>>().ToTable("RoleClaims");

        // Decimal precision
        builder.Entity<MenuItem>().Property(m => m.Price).HasColumnType("decimal(18,2)");
        builder.Entity<OrderItem>().Property(i => i.UnitPrice).HasColumnType("decimal(18,2)");
        builder.Entity<Order>().Property(o => o.TotalAmount).HasColumnType("decimal(18,2)");
        builder.Entity<Bill>().Property(b => b.SubTotal).HasColumnType("decimal(18,2)");
        builder.Entity<Bill>().Property(b => b.TaxRate).HasColumnType("decimal(5,4)");
        builder.Entity<Bill>().Property(b => b.TaxAmount).HasColumnType("decimal(18,2)");
        builder.Entity<Bill>().Property(b => b.TotalAmount).HasColumnType("decimal(18,2)");

        // Bill → Order: one-to-one
        builder.Entity<Bill>().HasOne(b => b.Order).WithOne(o => o.Bill)
            .HasForeignKey<Bill>(b => b.OrderId).OnDelete(DeleteBehavior.Restrict);

        // Order → Waiter (restrict to avoid cascade conflict)
        builder.Entity<Order>().HasOne(o => o.Waiter).WithMany(u => u.Orders)
            .HasForeignKey(o => o.WaiterId).OnDelete(DeleteBehavior.Restrict);
    }

    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.State == EntityState.Modified &&
                entry.Entity.GetType().GetProperty("UpdatedAt") is not null)
                entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
        }
        return base.SaveChangesAsync(ct);
    }
}
