using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SmartRestaurant.Domain.Entities;
using SmartRestaurant.Domain.Enums;

namespace SmartRestaurant.Infrastructure.Persistence;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext ctx,
        UserManager<AppUser> userManager, RoleManager<IdentityRole<int>> roleManager)
    {
        await ctx.Database.MigrateAsync();

        // Roles
        foreach (var role in new[] { StaffRole.Manager, StaffRole.Waiter, StaffRole.Chef, StaffRole.Cashier })
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole<int>(role));

        // Default manager
        const string managerEmail = "manager@biteplate.com";
        if (await userManager.FindByEmailAsync(managerEmail) is null)
        {
            var manager = new AppUser { FullName = "Admin Manager", Email = managerEmail, UserName = managerEmail };
            await userManager.CreateAsync(manager, "Manager@123");
            await userManager.AddToRoleAsync(manager, StaffRole.Manager);
        }

        // Categories & menu items
        if (!await ctx.Categories.AnyAsync())
        {
            var starters  = new Category { Name = "Starters",  Description = "Appetizers and starters" };
            var mains     = new Category { Name = "Main Course", Description = "Main dishes" };
            var desserts  = new Category { Name = "Desserts",   Description = "Sweet treats" };
            var beverages = new Category { Name = "Beverages",  Description = "Drinks" };
            ctx.Categories.AddRange(starters, mains, desserts, beverages);
            await ctx.SaveChangesAsync();

            ctx.MenuItems.AddRange(
                new MenuItem { Name = "Spring Rolls",      Price = 7.50m,  CategoryId = starters.Id,  Description = "Crispy vegetable spring rolls" },
                new MenuItem { Name = "Chicken Soup",      Price = 6.00m,  CategoryId = starters.Id,  Description = "Classic chicken broth" },
                new MenuItem { Name = "Grilled Salmon",    Price = 18.00m, CategoryId = mains.Id,     Description = "Fresh salmon with herbs" },
                new MenuItem { Name = "Beef Burger",       Price = 14.50m, CategoryId = mains.Id,     Description = "Juicy beef burger with fries" },
                new MenuItem { Name = "Pasta Carbonara",   Price = 12.00m, CategoryId = mains.Id,     Description = "Classic Italian pasta" },
                new MenuItem { Name = "Chocolate Cake",    Price = 6.50m,  CategoryId = desserts.Id,  Description = "Rich chocolate layer cake" },
                new MenuItem { Name = "Ice Cream",         Price = 4.00m,  CategoryId = desserts.Id,  Description = "Three scoops of vanilla" },
                new MenuItem { Name = "Still Water",       Price = 2.00m,  CategoryId = beverages.Id, Description = "500ml still water" },
                new MenuItem { Name = "Fresh Orange Juice",Price = 4.50m,  CategoryId = beverages.Id, Description = "Freshly squeezed OJ" },
                new MenuItem { Name = "Espresso",          Price = 3.00m,  CategoryId = beverages.Id, Description = "Double shot espresso" }
            );
            await ctx.SaveChangesAsync();
        }

        // Tables
        if (!await ctx.Tables.AnyAsync())
        {
            for (int i = 1; i <= 10; i++)
                ctx.Tables.Add(new Table { Number = $"T{i:D2}", Capacity = i <= 4 ? 2 : i <= 8 ? 4 : 6 });
            await ctx.SaveChangesAsync();
        }
    }
}
