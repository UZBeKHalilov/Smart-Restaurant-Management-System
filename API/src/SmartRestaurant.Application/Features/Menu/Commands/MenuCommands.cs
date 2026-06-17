using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartRestaurant.Application.Common.Interfaces;
using SmartRestaurant.Application.Common.Models;
using SmartRestaurant.Domain.Entities;

namespace SmartRestaurant.Application.Features.Menu.Commands;

// ── CREATE ─────────────────────────────────────────────────────────────────
public record CreateMenuItemCommand(
    string Name, string Description, decimal Price,
    int CategoryId, string? ImageUrl = null) : IRequest<int>;

public class CreateMenuItemHandler : IRequestHandler<CreateMenuItemCommand, int>
{
    private readonly IApplicationDbContext _ctx;
    public CreateMenuItemHandler(IApplicationDbContext ctx) => _ctx = ctx;

    public async Task<int> Handle(CreateMenuItemCommand r, CancellationToken ct)
    {
        var item = new MenuItem
        {
            Name = r.Name, Description = r.Description,
            Price = r.Price, CategoryId = r.CategoryId, ImageUrl = r.ImageUrl
        };
        _ctx.MenuItems.Add(item);
        await _ctx.SaveChangesAsync(ct);
        return item.Id;
    }
}

// ── UPDATE ─────────────────────────────────────────────────────────────────
public record UpdateMenuItemCommand(
    int Id, string Name, string Description,
    decimal Price, int CategoryId, bool IsAvailable, string? ImageUrl) : IRequest<Result>;

public class UpdateMenuItemHandler : IRequestHandler<UpdateMenuItemCommand, Result>
{
    private readonly IApplicationDbContext _ctx;
    public UpdateMenuItemHandler(IApplicationDbContext ctx) => _ctx = ctx;

    public async Task<Result> Handle(UpdateMenuItemCommand r, CancellationToken ct)
    {
        var item = await _ctx.MenuItems.FirstOrDefaultAsync(m => m.Id == r.Id, ct);
        if (item is null) return Result.Failure("Menu item not found.");
        item.Name = r.Name; item.Description = r.Description;
        item.Price = r.Price; item.CategoryId = r.CategoryId;
        item.IsAvailable = r.IsAvailable; item.ImageUrl = r.ImageUrl;
        item.UpdatedAt = DateTime.UtcNow;
        await _ctx.SaveChangesAsync(ct);
        return Result.Success();
    }
}

// ── DELETE ─────────────────────────────────────────────────────────────────
public record DeleteMenuItemCommand(int Id) : IRequest<Result>;

public class DeleteMenuItemHandler : IRequestHandler<DeleteMenuItemCommand, Result>
{
    private readonly IApplicationDbContext _ctx;
    public DeleteMenuItemHandler(IApplicationDbContext ctx) => _ctx = ctx;

    public async Task<Result> Handle(DeleteMenuItemCommand r, CancellationToken ct)
    {
        var item = await _ctx.MenuItems.FirstOrDefaultAsync(m => m.Id == r.Id, ct);
        if (item is null) return Result.Failure("Menu item not found.");
        _ctx.MenuItems.Remove(item);
        await _ctx.SaveChangesAsync(ct);
        return Result.Success();
    }
}

// ── CREATE CATEGORY ────────────────────────────────────────────────────────
public record CreateCategoryCommand(string Name, string Description) : IRequest<int>;

public class CreateCategoryHandler : IRequestHandler<CreateCategoryCommand, int>
{
    private readonly IApplicationDbContext _ctx;
    public CreateCategoryHandler(IApplicationDbContext ctx) => _ctx = ctx;

    public async Task<int> Handle(CreateCategoryCommand r, CancellationToken ct)
    {
        var cat = new Category { Name = r.Name, Description = r.Description };
        _ctx.Categories.Add(cat);
        await _ctx.SaveChangesAsync(ct);
        return cat.Id;
    }
}
