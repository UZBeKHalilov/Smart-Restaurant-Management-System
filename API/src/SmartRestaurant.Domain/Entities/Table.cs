using SmartRestaurant.Domain.Common;
using SmartRestaurant.Domain.Enums;

namespace SmartRestaurant.Domain.Entities;

public class Table : BaseEntity
{
    public string Number   { get; set; } = string.Empty;
    public int    Capacity { get; set; }
    public TableStatus Status { get; set; } = TableStatus.Available;

    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
