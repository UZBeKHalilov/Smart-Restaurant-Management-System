using SmartRestaurant.Domain.Common;

namespace SmartRestaurant.Domain.Entities;

public class MenuItem : BaseEntity
{
    public string  Name        { get; set; } = string.Empty;
    public string  Description { get; set; } = string.Empty;
    public decimal Price       { get; set; }
    public bool    IsAvailable { get; set; } = true;
    public string? ImageUrl    { get; set; }

    public int      CategoryId { get; set; }
    public Category Category   { get; set; } = null!;

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
