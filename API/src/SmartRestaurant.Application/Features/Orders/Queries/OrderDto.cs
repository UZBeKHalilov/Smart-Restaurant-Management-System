namespace SmartRestaurant.Application.Features.Orders.Queries;

public class OrderDto
{
    public int    Id          { get; set; }
    public string TableNumber { get; set; } = string.Empty;
    public string WaiterName  { get; set; } = string.Empty;
    public string StatusName  { get; set; } = string.Empty;
    public int    Status      { get; set; }
    public string? Notes      { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public int     Id           { get; set; }
    public int     MenuItemId   { get; set; }
    public string  MenuItemName { get; set; } = string.Empty;
    public int     Quantity     { get; set; }
    public decimal UnitPrice    { get; set; }
    public decimal SubTotal     { get; set; }
    public string? Notes        { get; set; }
}
