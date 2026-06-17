using SmartRestaurant.Domain.Common;

namespace SmartRestaurant.Domain.Entities;

public class Bill : BaseEntity
{
    public decimal SubTotal    { get; set; }
    public decimal TaxRate     { get; set; } = 0.10m; // 10%
    public decimal TaxAmount   { get; set; }
    public decimal TotalAmount { get; set; }
    public bool    IsPaid      { get; set; } = false;
    public string  PaymentMethod { get; set; } = "Cash";
    public DateTime? PaidAt    { get; set; }

    public int   OrderId { get; set; }
    public Order Order   { get; set; } = null!;
}
