namespace SmartRestaurant.Application.Features.Tables.Queries;

public class TableDto
{
    public int    Id       { get; set; }
    public string Number   { get; set; } = string.Empty;
    public int    Capacity { get; set; }
    public string Status   { get; set; } = string.Empty;
}
