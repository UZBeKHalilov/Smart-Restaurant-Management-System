using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartRestaurant.Application.Common.Interfaces;

namespace SmartRestaurant.Application.Features.Tables.Queries;

public record GetTablesQuery : IRequest<List<TableDto>>;

public class GetTablesQueryHandler : IRequestHandler<GetTablesQuery, List<TableDto>>
{
    private readonly IApplicationDbContext _ctx;
    private readonly IMapper _mapper;

    public GetTablesQueryHandler(IApplicationDbContext ctx, IMapper mapper)
    {
        _ctx = ctx; _mapper = mapper;
    }

    public async Task<List<TableDto>> Handle(GetTablesQuery request, CancellationToken ct)
    {
        var tables = await _ctx.Tables.AsNoTracking().ToListAsync(ct);
        return _mapper.Map<List<TableDto>>(tables);
    }
}
