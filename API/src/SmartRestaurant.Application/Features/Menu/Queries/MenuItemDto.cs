namespace SmartRestaurant.Application.Features.Menu.Queries;

public class CategoryDto
{
    public int    Id          { get; set; }
    public string Name        { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class MenuItemDto
{
    public int     Id           { get; set; }
    public string  Name         { get; set; } = string.Empty;
    public string  Description  { get; set; } = string.Empty;
    public decimal Price        { get; set; }
    public bool    IsAvailable  { get; set; }
    public string? ImageUrl     { get; set; }
    public int     CategoryId   { get; set; }
    public string  CategoryName { get; set; } = string.Empty;
}
