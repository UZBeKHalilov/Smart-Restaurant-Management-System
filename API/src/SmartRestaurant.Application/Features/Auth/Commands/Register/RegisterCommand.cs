using MediatR;
using Microsoft.AspNetCore.Identity;
using SmartRestaurant.Application.Common.Models;
using SmartRestaurant.Domain.Entities;

namespace SmartRestaurant.Application.Features.Auth.Commands.Register;

public record RegisterCommand(string FullName, string Email, string Password, string Role) : IRequest<Result>;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result>
{
    private readonly UserManager<AppUser> _userManager;
    private readonly RoleManager<IdentityRole<int>> _roleManager;

    public RegisterCommandHandler(UserManager<AppUser> userManager, RoleManager<IdentityRole<int>> roleManager)
    {
        _userManager = userManager; _roleManager = roleManager;
    }

    public async Task<Result> Handle(RegisterCommand request, CancellationToken ct)
    {
        if (await _userManager.FindByEmailAsync(request.Email) is not null)
            return Result.Failure("Email already registered.");

        var user = new AppUser
        {
            FullName = request.FullName,
            Email = request.Email,
            UserName = request.Email
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
            return Result.Failure(string.Join(", ", createResult.Errors.Select(e => e.Description)));

        if (!await _roleManager.RoleExistsAsync(request.Role))
            await _roleManager.CreateAsync(new IdentityRole<int>(request.Role));

        await _userManager.AddToRoleAsync(user, request.Role);
        return Result.Success();
    }
}
