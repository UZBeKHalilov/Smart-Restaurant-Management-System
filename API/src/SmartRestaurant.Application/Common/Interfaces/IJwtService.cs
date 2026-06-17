using SmartRestaurant.Domain.Entities;

namespace SmartRestaurant.Application.Common.Interfaces;

public interface IJwtService
{
    string GenerateToken(AppUser user, IList<string> roles);
}
