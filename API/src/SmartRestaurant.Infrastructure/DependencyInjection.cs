using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SmartRestaurant.Application.Common.Interfaces;
using SmartRestaurant.Domain.Entities;
using SmartRestaurant.Infrastructure.Persistence;
using SmartRestaurant.Infrastructure.Services;

namespace SmartRestaurant.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

        services.AddScoped<IApplicationDbContext>(p => p.GetRequiredService<AppDbContext>());

        services.AddIdentity<AppUser, IdentityRole<int>>(opt =>
        {
            opt.Password.RequireDigit = true;
            opt.Password.RequiredLength = 6;
            opt.Password.RequireUppercase = true;
            opt.Password.RequireNonAlphanumeric = false;
        })
        .AddEntityFrameworkStores<AppDbContext>()
        .AddDefaultTokenProviders();

        services.AddScoped<IJwtService, JwtService>();

        return services;
    }
}
