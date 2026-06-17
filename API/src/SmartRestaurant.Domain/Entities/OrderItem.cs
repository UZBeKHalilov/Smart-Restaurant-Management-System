using SmartRestaurant.Domain.Common;

namespace SmartRestaurant.Domain.Entities;

public class OrderItem : BaseEntity
{
    public int      Quantity   { get; set; }
    public decimal  UnitPrice  { get; set; }
    public string?  Notes      { get; set; }

    public int      OrderId    { get; set; }
    public Order    Order      { get; set; } = null!;

    public int      MenuItemId { get; set; }
    public MenuItem MenuItem   { get; set; } = null!;

    public decimal SubTotal => Quantity * UnitPrice;
}
