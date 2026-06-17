using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartRestaurant.Application.Features.Bills.Commands;

namespace SmartRestaurant.API.Controllers;

[Authorize(Roles = "Cashier,Manager")]
public class BillsController : BaseController
{
    [HttpPost("generate/{orderId}")]
    public async Task<IActionResult> Generate(int orderId)
    {
        var result = await Mediator.Send(new GenerateBillCommand(orderId));
        return result.Succeeded ? Ok(result.Data) : BadRequest(new { result.Error });
    }

    [HttpPatch("{billId}/pay")]
    public async Task<IActionResult> Pay(int billId, [FromBody] PayRequest request)
    {
        var result = await Mediator.Send(new PayBillCommand(billId, request.PaymentMethod));
        return result.Succeeded ? NoContent() : BadRequest(new { result.Error });
    }
}

public record PayRequest(string PaymentMethod);
