using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SmartRestaurant.Application;
using SmartRestaurant.Infrastructure;
using SmartRestaurant.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using SmartRestaurant.Domain.Entities;

var builder = WebApplication.CreateBuilder(args);

// ── Services ─────────────────────────────────────────────────────────────
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger with JWT
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SmartRestaurant API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization", Type = SecuritySchemeType.Http,
        Scheme = "Bearer", BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {token}"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

// JWT Auth
var jwtCfg = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = jwtCfg["Issuer"],
            ValidAudience            = jwtCfg["Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(
                                           Encoding.UTF8.GetBytes(jwtCfg["Key"]!))
        };
    });

builder.Services.AddAuthorization();

// CORS for Angular dev
builder.Services.AddCors(opt => opt.AddPolicy("Angular", policy =>
    policy.WithOrigins("http://localhost:4200")
          .AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

// ── Pipeline ─────────────────────────────────────────────────────────────
var app = builder.Build();

// Seed database
using (var scope = app.Services.CreateScope())
{
    var ctx         = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();
    await DbSeeder.SeedAsync(ctx, userManager, roleManager);
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("Angular");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
