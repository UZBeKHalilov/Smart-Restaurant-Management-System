using AutoMapper;
using SmartRestaurant.Application.Features.Bills.Queries;
using SmartRestaurant.Application.Features.Menu.Queries;
using SmartRestaurant.Application.Features.Orders.Queries;
using SmartRestaurant.Application.Features.Tables.Queries;
using SmartRestaurant.Domain.Entities;

namespace SmartRestaurant.Application.Common.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Table, TableDto>();
        CreateMap<Category, CategoryDto>();
        CreateMap<MenuItem, MenuItemDto>().ForMember(d => d.CategoryName, o => o.MapFrom(s => s.Category.Name));
        CreateMap<Order, OrderDto>()
            .ForMember(d => d.TableNumber, o => o.MapFrom(s => s.Table.Number))
            .ForMember(d => d.WaiterName,  o => o.MapFrom(s => s.Waiter.FullName))
            .ForMember(d => d.StatusName,  o => o.MapFrom(s => s.Status.ToString()));
        CreateMap<OrderItem, OrderItemDto>()
            .ForMember(d => d.MenuItemName, o => o.MapFrom(s => s.MenuItem.Name));
        CreateMap<Bill, BillDto>()
            .ForMember(d => d.TableNumber, o => o.MapFrom(s => s.Order.Table.Number));
    }
}
