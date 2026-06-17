import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Table, MenuItem, Category, Order, Bill, CreateOrderRequest } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // Tables
  getTables()                             { return this.http.get<Table[]>(`${this.base}/tables`); }
  createTable(data: {number: string; capacity: number}) { return this.http.post<{id:number}>(`${this.base}/tables`, data); }
  updateTableStatus(id: number, status: number) { return this.http.patch(`${this.base}/tables/${id}/status`, { status }); }

  // Menu
  getCategories()                         { return this.http.get<Category[]>(`${this.base}/menu/categories`); }
  getMenuItems(categoryId?: number)       {
    let params = new HttpParams();
    if (categoryId) params = params.set('categoryId', categoryId);
    return this.http.get<MenuItem[]>(`${this.base}/menu/items`, { params });
  }
  createMenuItem(data: Partial<MenuItem>) { return this.http.post<{id:number}>(`${this.base}/menu/items`, data); }
  updateMenuItem(id: number, data: Partial<MenuItem>) { return this.http.put(`${this.base}/menu/items/${id}`, { id, ...data }); }
  deleteMenuItem(id: number)              { return this.http.delete(`${this.base}/menu/items/${id}`); }
  createCategory(data: {name:string; description:string}) { return this.http.post<{id:number}>(`${this.base}/menu/categories`, data); }

  // Orders
  getOrders(status?: number)              {
    let params = new HttpParams();
    if (status !== undefined) params = params.set('status', status);
    return this.http.get<Order[]>(`${this.base}/orders`, { params });
  }
  getOrder(id: number)                    { return this.http.get<Order>(`${this.base}/orders/${id}`); }
  createOrder(data: CreateOrderRequest)   { return this.http.post<{id:number}>(`${this.base}/orders`, data); }
  updateOrderStatus(id: number, status: number) { return this.http.patch(`${this.base}/orders/${id}/status`, { status }); }
  cancelOrder(id: number)                 { return this.http.delete(`${this.base}/orders/${id}`); }

  // Kitchen
  getKitchenQueue()                       { return this.http.get<{pending: Order[]; preparing: Order[]}>(`${this.base}/kitchen/queue`); }
  startPreparing(orderId: number)         { return this.http.patch(`${this.base}/kitchen/${orderId}/start`, {}); }
  markReady(orderId: number)              { return this.http.patch(`${this.base}/kitchen/${orderId}/ready`, {}); }

  // Bills
  generateBill(orderId: number)           { return this.http.post<Bill>(`${this.base}/bills/generate/${orderId}`, {}); }
  payBill(billId: number, paymentMethod: string) { return this.http.patch(`${this.base}/bills/${billId}/pay`, { paymentMethod }); }
}
