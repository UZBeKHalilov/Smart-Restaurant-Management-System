using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartRestaurant.Application.Common.Interfaces;
using SmartRestaurant.Domain.Enums;

namespace SmartRestaurant.Application.Features.Orders.Queries;

public record GetOrdersQuery(OrderStatus? Status = null) : IRequest<List<OrderDto>>;
public record GetOrderByIdQuery(int Id) : IRequest<OrderDto?>;

public class GetOrdersQueryHandler : IRequestHandler<GetOrdersQuery, List<OrderDto>>
{
    private readonly IApplicationDbContext _ctx;
    private readonly IMapper _mapper;
    public GetOrdersQueryHandler(IApplicationDbContext ctx, IMapper mapper) { _ctx = ctx; _mapper = mapper; }

    public async Task<List<OrderDto>> Handle(GetOrdersQuery request, CancellationToken ct)
    {
        var query = _ctx.Orders
            .Include(o => o.Table)
            .Include(o => o.Waiter)
            .Include(o => o.Items).ThenInclude(i => i.MenuItem)
            .AsNoTracking();

        if (request.Status.HasValue)
            query = query.Where(o => o.Status == request.Status.Value);

        var orders = await query.OrderByDescending(o => o.CreatedAt).ToListAsync(ct);
        return _mapper.Map<List<OrderDto>>(orders);
    }
}

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderDto?>
{
    private readonly IApplicationDbContext _ctx;
    private readonly IMapper _mapper;
    public GetOrderByIdQueryHandler(IApplicationDbContext ctx, IMapper mapper) { _ctx = ctx; _mapper = mapper; }

    public async Task<OrderDto?> Handle(GetOrderByIdQuery request, CancellationToken ct)
    {
        var order = await _ctx.Orders
            .Include(o => o.Table)
            .Include(o => o.Waiter)
            .Include(o => o.Items).ThenInclude(i => i.MenuItem)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == request.Id, ct);
        return order is null ? null : _mapper.Map<OrderDto>(order);
    }
}
