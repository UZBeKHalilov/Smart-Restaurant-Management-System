using Microsoft.EntityFrameworkCore;
using SmartRestaurant.Domain.Entities;

namespace SmartRestaurant.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Table>    Tables    { get; }
    DbSet<Category> Categories { get; }
    DbSet<MenuItem> MenuItems { get; }
    DbSet<Order>    Orders    { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<Bill>     Bills     { get; }
    DbSet<AppUser>  Users     { get; }

    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
