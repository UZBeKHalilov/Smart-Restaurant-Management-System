using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartRestaurant.Application.Features.Tables.Commands;
using SmartRestaurant.Application.Features.Tables.Queries;
using SmartRestaurant.Domain.Enums;

namespace SmartRestaurant.API.Controllers;

[Authorize]
public class TablesController : BaseController
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await Mediator.Send(new GetTablesQuery()));

    [HttpPost]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> Create([FromBody] CreateTableCommand command)
    {
        var id = await Mediator.Send(command);
        return CreatedAtAction(nameof(GetAll), new { id }, new { id });
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
    {
        var result = await Mediator.Send(new UpdateTableStatusCommand(id, request.Status));
        return result.Succeeded ? NoContent() : BadRequest(new { result.Error });
    }
}

public record UpdateStatusRequest(TableStatus Status);
