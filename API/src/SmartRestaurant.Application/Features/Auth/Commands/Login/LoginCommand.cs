using MediatR;
using Microsoft.AspNetCore.Identity;
using SmartRestaurant.Application.Common.Interfaces;
using SmartRestaurant.Application.Common.Models;
using SmartRestaurant.Domain.Entities;

namespace SmartRestaurant.Application.Features.Auth.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<Result<LoginResponse>>;
public record LoginResponse(string Token, string FullName, string Email, IList<string> Roles);

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<LoginResponse>>
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IJwtService _jwt;

    public LoginCommandHandler(UserManager<AppUser> userManager, IJwtService jwt)
    {
        _userManager = userManager; _jwt = jwt;
    }

    public async Task<Result<LoginResponse>> Handle(LoginCommand request, CancellationToken ct)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null || !user.IsActive)
            return Result<LoginResponse>.Failure("Invalid credentials.");

        if (!await _userManager.CheckPasswordAsync(user, request.Password))
            return Result<LoginResponse>.Failure("Invalid credentials.");

        var roles = await _userManager.GetRolesAsync(user);
        var token = _jwt.GenerateToken(user, roles);
        return Result<LoginResponse>.Success(new LoginResponse(token, user.FullName, user.Email!, roles));
    }
}
