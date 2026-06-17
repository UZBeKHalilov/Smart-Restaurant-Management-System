using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartRestaurant.Application.Features.Menu.Commands;
using SmartRestaurant.Application.Features.Menu.Queries;

namespace SmartRestaurant.API.Controllers;

[Authorize]
public class MenuController : BaseController
{
    [HttpGet("items")]
    [AllowAnonymous]
    public async Task<IActionResult> GetItems([FromQuery] int? categoryId) =>
        Ok(await Mediator.Send(new GetMenuItemsQuery(categoryId)));

    [HttpGet("categories")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCategories() =>
        Ok(await Mediator.Send(new GetCategoriesQuery()));

    [HttpPost("items")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> CreateItem([FromBody] CreateMenuItemCommand command)
    {
        var id = await Mediator.Send(command);
        return CreatedAtAction(nameof(GetItems), new { id }, new { id });
    }

    [HttpPut("items/{id}")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> UpdateItem(int id, [FromBody] UpdateMenuItemCommand command)
    {
        if (id != command.Id) return BadRequest();
        var result = await Mediator.Send(command);
        return result.Succeeded ? NoContent() : NotFound(new { result.Error });
    }

    [HttpDelete("items/{id}")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var result = await Mediator.Send(new DeleteMenuItemCommand(id));
        return result.Succeeded ? NoContent() : NotFound(new { result.Error });
    }

    [HttpPost("categories")]
    [Authorize(Roles = "Manager")]
    public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryCommand command)
    {
        var id = await Mediator.Send(command);
        return CreatedAtAction(nameof(GetCategories), new { id }, new { id });
    }
}
