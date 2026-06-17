using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartRestaurant.Application.Features.Orders.Commands;
using SmartRestaurant.Application.Features.Orders.Queries;
using SmartRestaurant.Domain.Enums;

namespace SmartRestaurant.API.Controllers;

[Authorize]
public class OrdersController : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] OrderStatus? status) =>
        Ok(await Mediator.Send(new GetOrdersQuery(status)));

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await Mediator.Send(new GetOrderByIdQuery(id));
        return order is null ? NotFound() : Ok(order);
    }

    [HttpPost]
    [Authorize(Roles = "Waiter,Manager")]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest request)
    {
        var waiterId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var id = await Mediator.Send(new CreateOrderCommand(
            request.TableId, waiterId, request.Items, request.Notes));
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Chef,Waiter,Manager")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusRequest request)
    {
        var result = await Mediator.Send(new UpdateOrderStatusCommand(id, request.Status));
        return result.Succeeded ? NoContent() : BadRequest(new { result.Error });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Waiter,Manager")]
    public async Task<IActionResult> Cancel(int id)
    {
        var result = await Mediator.Send(new CancelOrderCommand(id));
        return result.Succeeded ? NoContent() : BadRequest(new { result.Error });
    }
}

public record CreateOrderRequest(int TableId, List<OrderItemRequest> Items, string? Notes = null);
public record UpdateOrderStatusRequest(OrderStatus Status);
