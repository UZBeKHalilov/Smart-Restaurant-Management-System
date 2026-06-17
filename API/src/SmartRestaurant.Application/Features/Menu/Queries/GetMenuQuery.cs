using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartRestaurant.Application.Common.Interfaces;

namespace SmartRestaurant.Application.Features.Menu.Queries;

public record GetMenuItemsQuery(int? CategoryId = null) : IRequest<List<MenuItemDto>>;
public record GetCategoriesQuery : IRequest<List<CategoryDto>>;

public class GetMenuItemsQueryHandler : IRequestHandler<GetMenuItemsQuery, List<MenuItemDto>>
{
    private readonly IApplicationDbContext _ctx;
    private readonly IMapper _mapper;
    public GetMenuItemsQueryHandler(IApplicationDbContext ctx, IMapper mapper) { _ctx = ctx; _mapper = mapper; }

    public async Task<List<MenuItemDto>> Handle(GetMenuItemsQuery request, CancellationToken ct)
    {
        var query = _ctx.MenuItems.Include(m => m.Category).AsNoTracking();
        if (request.CategoryId.HasValue)
            query = query.Where(m => m.CategoryId == request.CategoryId);
        return _mapper.Map<List<MenuItemDto>>(await query.ToListAsync(ct));
    }
}

public class GetCategoriesQueryHandler : IRequestHandler<GetCategoriesQuery, List<CategoryDto>>
{
    private readonly IApplicationDbContext _ctx;
    private readonly IMapper _mapper;
    public GetCategoriesQueryHandler(IApplicationDbContext ctx, IMapper mapper) { _ctx = ctx; _mapper = mapper; }

    public async Task<List<CategoryDto>> Handle(GetCategoriesQuery request, CancellationToken ct)
    {
        var cats = await _ctx.Categories.Where(c => c.IsActive).AsNoTracking().ToListAsync(ct);
        return _mapper.Map<List<CategoryDto>>(cats);
    }
}
