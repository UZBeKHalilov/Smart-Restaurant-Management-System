namespace SmartRestaurant.Application.Features.Bills.Queries;

public class BillDto
{
    public int      Id            { get; set; }
    public int      OrderId       { get; set; }
    public string   TableNumber   { get; set; } = string.Empty;
    public decimal  SubTotal      { get; set; }
    public decimal  TaxRate       { get; set; }
    public decimal  TaxAmount     { get; set; }
    public decimal  TotalAmount   { get; set; }
    public bool     IsPaid        { get; set; }
    public string   PaymentMethod { get; set; } = string.Empty;
    public DateTime? PaidAt       { get; set; }
    public DateTime CreatedAt     { get; set; }
}
