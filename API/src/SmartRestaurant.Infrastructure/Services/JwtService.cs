using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SmartRestaurant.Application.Common.Interfaces;
using SmartRestaurant.Domain.Entities;

namespace SmartRestaurant.Infrastructure.Services;

public class JwtService : IJwtService
{
    private readonly IConfiguration _config;
    public JwtService(IConfiguration config) => _config = config;

    public string GenerateToken(AppUser user, IList<string> roles)
    {
        var jwtConfig = _config.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtConfig["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email!),
            new("fullName", user.FullName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var token = new JwtSecurityToken(
            issuer:   jwtConfig["Issuer"],
            audience: jwtConfig["Audience"],
            claims:   claims,
            expires:  DateTime.UtcNow.AddHours(8),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
