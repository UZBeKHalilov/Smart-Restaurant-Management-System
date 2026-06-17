using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SmartRestaurant.Application.Common.Interfaces;
using SmartRestaurant.Application.Common.Models;
using SmartRestaurant.Application.Features.Bills.Queries;
using SmartRestaurant.Domain.Entities;
using SmartRestaurant.Domain.Enums;

namespace SmartRestaurant.Application.Features.Bills.Commands;

// ── GENERATE BILL ──────────────────────────────────────────────────────────
public record GenerateBillCommand(int OrderId) : IRequest<Result<BillDto>>;

public class GenerateBillHandler : IRequestHandler<GenerateBillCommand, Result<BillDto>>
{
    private readonly IApplicationDbContext _ctx;
    private readonly IMapper _mapper;
    public GenerateBillHandler(IApplicationDbContext ctx, IMapper mapper) { _ctx = ctx; _mapper = mapper; }

    public async Task<Result<BillDto>> Handle(GenerateBillCommand r, CancellationToken ct)
    {
        var order = await _ctx.Orders
            .Include(o => o.Table)
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == r.OrderId, ct);

        if (order is null) return Result<BillDto>.Failure("Order not found.");
        if (await _ctx.Bills.AnyAsync(b => b.OrderId == r.OrderId, ct))
            return Result<BillDto>.Failure("Bill already generated for this order.");

        const decimal taxRate = 0.10m;
        var sub   = order.Items.Sum(i => i.Quantity * i.UnitPrice);
        var tax   = Math.Round(sub * taxRate, 2);
        var total = sub + tax;

        var bill = new Bill
        {
            OrderId = r.OrderId, SubTotal = sub,
            TaxRate = taxRate, TaxAmount = tax, TotalAmount = total
        };

        _ctx.Bills.Add(bill);
        order.Status = OrderStatus.Served;
        await _ctx.SaveChangesAsync(ct);
        return Result<BillDto>.Success(_mapper.Map<BillDto>(bill));
    }
}

// ── PAY BILL ───────────────────────────────────────────────────────────────
public record PayBillCommand(int BillId, string PaymentMethod) : IRequest<Result>;

public class PayBillHandler : IRequestHandler<PayBillCommand, Result>
{
    private readonly IApplicationDbContext _ctx;
    public PayBillHandler(IApplicationDbContext ctx) => _ctx = ctx;

    public async Task<Result> Handle(PayBillCommand r, CancellationToken ct)
    {
        var bill = await _ctx.Bills.FirstOrDefaultAsync(b => b.Id == r.BillId, ct);
        if (bill is null) return Result.Failure("Bill not found.");
        if (bill.IsPaid)  return Result.Failure("Bill is already paid.");

        bill.IsPaid = true;
        bill.PaymentMethod = r.PaymentMethod;
        bill.PaidAt = DateTime.UtcNow;
        await _ctx.SaveChangesAsync(ct);
        return Result.Success();
    }
}
