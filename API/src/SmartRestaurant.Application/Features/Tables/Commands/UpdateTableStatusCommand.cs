using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartRestaurant.Application.Common.Interfaces;
using SmartRestaurant.Application.Common.Models;
using SmartRestaurant.Domain.Enums;

namespace SmartRestaurant.Application.Features.Tables.Commands;

public record UpdateTableStatusCommand(int TableId, TableStatus Status) : IRequest<Result>;

public class UpdateTableStatusCommandHandler : IRequestHandler<UpdateTableStatusCommand, Result>
{
    private readonly IApplicationDbContext _ctx;
    public UpdateTableStatusCommandHandler(IApplicationDbContext ctx) => _ctx = ctx;

    public async Task<Result> Handle(UpdateTableStatusCommand request, CancellationToken ct)
    {
        var table = await _ctx.Tables.FirstOrDefaultAsync(t => t.Id == request.TableId, ct);
        if (table is null) return Result.Failure("Table not found.");
        table.Status = request.Status;
        table.UpdatedAt = DateTime.UtcNow;
        await _ctx.SaveChangesAsync(ct);
        return Result.Success();
    }
}
