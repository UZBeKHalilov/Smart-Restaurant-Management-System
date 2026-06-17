using SmartRestaurant.Domain.Common;
using SmartRestaurant.Domain.Enums;

namespace SmartRestaurant.Domain.Entities;

public class Order : BaseEntity
{
    public OrderStatus Status      { get; set; } = OrderStatus.Pending;
    public string?     Notes       { get; set; }
    public decimal     TotalAmount { get; set; }

    public int     TableId  { get; set; }
    public Table   Table    { get; set; } = null!;

    public int     WaiterId { get; set; }
    public AppUser Waiter   { get; set; } = null!;

    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public Bill?                  Bill  { get; set; }
}
