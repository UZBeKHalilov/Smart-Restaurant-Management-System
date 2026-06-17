using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace SmartRestaurant.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseController : ControllerBase
{
    private ISender? _mediator;
    protected ISender Mediator =>
        _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();
}
