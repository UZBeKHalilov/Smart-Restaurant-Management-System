using MediatR;
using SmartRestaurant.Application.Common.Interfaces;
using SmartRestaurant.Domain.Entities;

namespace SmartRestaurant.Application.Features.Tables.Commands;

public record CreateTableCommand(string Number, int Capacity) : IRequest<int>;

public class CreateTableCommandHandler : IRequestHandler<CreateTableCommand, int>
{
    private readonly IApplicationDbContext _ctx;
    public CreateTableCommandHandler(IApplicationDbContext ctx) => _ctx = ctx;

    public async Task<int> Handle(CreateTableCommand request, CancellationToken ct)
    {
        var table = new Table { Number = request.Number, Capacity = request.Capacity };
        _ctx.Tables.Add(table);
        await _ctx.SaveChangesAsync(ct);
        return table.Id;
    }
}
