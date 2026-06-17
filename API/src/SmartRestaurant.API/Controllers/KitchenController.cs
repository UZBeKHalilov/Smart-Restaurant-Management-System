using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartRestaurant.Application.Features.Orders.Commands;
using SmartRestaurant.Application.Features.Orders.Queries;
using SmartRestaurant.Domain.Enums;

namespace SmartRestaurant.API.Controllers;

[Authorize(Roles = "Chef,Manager")]
public class KitchenController : BaseController
{
    /// <summary>Returns all Pending + Preparing orders for the kitchen display.</summary>
    [HttpGet("queue")]
    public async Task<IActionResult> GetQueue()
    {
        var pending   = await Mediator.Send(new GetOrdersQuery(OrderStatus.Pending));
        var preparing = await Mediator.Send(new GetOrdersQuery(OrderStatus.Preparing));
        return Ok(new { pending, preparing });
    }

    [HttpPatch("{orderId}/start")]
    public async Task<IActionResult> StartPreparing(int orderId)
    {
        var result = await Mediator.Send(new UpdateOrderStatusCommand(orderId, OrderStatus.Preparing));
        return result.Succeeded ? NoContent() : BadRequest(new { result.Error });
    }

    [HttpPatch("{orderId}/ready")]
    public async Task<IActionResult> MarkReady(int orderId)
    {
        var result = await Mediator.Send(new UpdateOrderStatusCommand(orderId, OrderStatus.Ready));
        return result.Succeeded ? NoContent() : BadRequest(new { result.Error });
    }
}
