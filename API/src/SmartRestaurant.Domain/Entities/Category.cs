using SmartRestaurant.Domain.Common;

namespace SmartRestaurant.Domain.Entities;

public class Category : BaseEntity
{
    public string Name        { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool   IsActive    { get; set; } = true;

    public ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
}
