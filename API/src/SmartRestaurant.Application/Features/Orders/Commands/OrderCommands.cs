using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartRestaurant.Application.Common.Interfaces;
using SmartRestaurant.Application.Common.Models;
using SmartRestaurant.Domain.Entities;
using SmartRestaurant.Domain.Enums;

namespace SmartRestaurant.Application.Features.Orders.Commands;

// ── CREATE ORDER ───────────────────────────────────────────────────────────
public record OrderItemRequest(int MenuItemId, int Quantity, string? Notes = null);

public record CreateOrderCommand(
    int TableId, int WaiterId,
    List<OrderItemRequest> Items, string? Notes = null) : IRequest<int>;

public class CreateOrderHandler : IRequestHandler<CreateOrderCommand, int>
{
    private readonly IApplicationDbContext _ctx;
    public CreateOrderHandler(IApplicationDbContext ctx) => _ctx = ctx;

    public async Task<int> Handle(CreateOrderCommand r, CancellationToken ct)
    {
        decimal total = 0;
        var orderItems = new List<OrderItem>();

        foreach (var req in r.Items)
        {
            var menuItem = await _ctx.MenuItems.FindAsync(new object[] { req.MenuItemId }, ct)
                           ?? throw new Exception($"MenuItem {req.MenuItemId} not found.");
            var oi = new OrderItem
            {
                MenuItemId = req.MenuItemId, Quantity = req.Quantity,
                UnitPrice = menuItem.Price, Notes = req.Notes
            };
            orderItems.Add(oi);
            total += oi.SubTotal;
        }

        var order = new Order
        {
            TableId = r.TableId, WaiterId = r.WaiterId,
            Notes = r.Notes, TotalAmount = total, Items = orderItems
        };

        _ctx.Orders.Add(order);

        // Mark table as occupied
        var table = await _ctx.Tables.FindAsync(new object[] { r.TableId }, ct);
        if (table is not null) table.Status = TableStatus.Occupied;

        await _ctx.SaveChangesAsync(ct);
        return order.Id;
    }
}

// ── UPDATE STATUS ──────────────────────────────────────────────────────────
public record UpdateOrderStatusCommand(int OrderId, OrderStatus Status) : IRequest<Result>;

public class UpdateOrderStatusHandler : IRequestHandler<UpdateOrderStatusCommand, Result>
{
    private readonly IApplicationDbContext _ctx;
    public UpdateOrderStatusHandler(IApplicationDbContext ctx) => _ctx = ctx;

    public async Task<Result> Handle(UpdateOrderStatusCommand r, CancellationToken ct)
    {
        var order = await _ctx.Orders.Include(o => o.Table)
                              .FirstOrDefaultAsync(o => o.Id == r.OrderId, ct);
        if (order is null) return Result.Failure("Order not found.");

        order.Status = r.Status;
        order.UpdatedAt = DateTime.UtcNow;

        if (r.Status == OrderStatus.Served || r.Status == OrderStatus.Cancelled)
        {
            if (order.Table is not null)
                order.Table.Status = TableStatus.Available;
        }

        await _ctx.SaveChangesAsync(ct);
        return Result.Success();
    }
}

// ── CANCEL ORDER ──────────────────────────────────────────────────────────
public record CancelOrderCommand(int OrderId) : IRequest<Result>;

public class CancelOrderHandler : IRequestHandler<CancelOrderCommand, Result>
{
    private readonly IApplicationDbContext _ctx;
    public CancelOrderHandler(IApplicationDbContext ctx) => _ctx = ctx;

    public async Task<Result> Handle(CancelOrderCommand r, CancellationToken ct)
    {
        var order = await _ctx.Orders.Include(o => o.Table)
                              .FirstOrDefaultAsync(o => o.Id == r.OrderId, ct);
        if (order is null) return Result.Failure("Order not found.");
        if (order.Status == OrderStatus.Served) return Result.Failure("Cannot cancel a served order.");

        order.Status = OrderStatus.Cancelled;
        order.UpdatedAt = DateTime.UtcNow;
        if (order.Table is not null) order.Table.Status = TableStatus.Available;
        await _ctx.SaveChangesAsync(ct);
        return Result.Success();
    }
}
