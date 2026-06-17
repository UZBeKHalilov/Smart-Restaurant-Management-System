using Microsoft.AspNetCore.Mvc;
using SmartRestaurant.Application.Features.Auth.Commands.Login;
using SmartRestaurant.Application.Features.Auth.Commands.Register;

namespace SmartRestaurant.API.Controllers;

public class AuthController : BaseController
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginCommand command)
    {
        var result = await Mediator.Send(command);
        return result.Succeeded ? Ok(result.Data) : Unauthorized(new { result.Error });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command)
    {
        var result = await Mediator.Send(command);
        return result.Succeeded ? Ok(new { message = "User registered." }) : BadRequest(new { result.Error });
    }
}
