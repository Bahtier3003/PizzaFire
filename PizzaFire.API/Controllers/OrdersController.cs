using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PizzaFire_API.Data;
using PizzaFire_API.DTOs;
using PizzaFire_API.Models;
using System.Security.Claims;
using System.Text.Json;

namespace PizzaFire_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly PizzaDbContext _context;

        public OrdersController(PizzaDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<OrderResponseDto>> CreateOrder(CreateOrderDto orderDto)
        {
            try
            {
                // Получаем ID текущего пользователя из JWT токена
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new { message = "Требуется авторизация" });
                }

                if (orderDto?.Items == null || !orderDto.Items.Any())
                {
                    return BadRequest(new { message = "Корзина пуста" });
                }

                var order = new Order
                {
                    UserId = userId.Value,
                    OrderDate = DateTime.UtcNow,
                    TotalPrice = 0,
                    Status = "confirmed"
                };

                // Расчет стоимости заказа
                foreach (var itemDto in orderDto.Items)
                {
                    decimal basePrice = itemDto.PizzaId == 0 ? 300 : 500; // Базовая цена
                    var sizeMultiplier = GetSizeMultiplier(itemDto.Size);
                    var pizzaPrice = basePrice * sizeMultiplier;

                    // Расчет цены дополнительных ингредиентов
                    var additionalPrice = (itemDto.AdditionalIngredientIds?.Count ?? 0) * 50;
                    var itemPrice = pizzaPrice + additionalPrice;

                    var orderItem = new OrderItem
                    {
                        PizzaId = itemDto.PizzaId == 0 ? 1 : itemDto.PizzaId,
                        Size = itemDto.Size,
                        ItemPrice = itemPrice,
                        AdditionalIngredientIds = JsonSerializer.Serialize(itemDto.AdditionalIngredientIds ?? new List<int>()),
                        RemovedIngredientIds = JsonSerializer.Serialize(itemDto.RemovedIngredientIds ?? new List<int>())
                    };

                    order.OrderItems.Add(orderItem);
                    order.TotalPrice += itemPrice;
                }

                // Расчет времени доставки (50-70 минут)
                var random = new Random();
                var deliveryMinutes = random.Next(50, 71); // от 50 до 70 минут
                var estimatedDelivery = DateTime.Now.AddMinutes(deliveryMinutes);

                // Создание деталей заказа
                var orderDetails = new OrderDetails
                {
                    Address = orderDto.Details?.Address ?? "Адрес не указан",
                    Phone = orderDto.Details?.Phone ?? "Телефон не указан",
                    Email = orderDto.Details?.Email ?? "Email не указан",
                    DoorCode = orderDto.Details?.DoorCode,
                    CourierInstructions = orderDto.Details?.CourierInstructions,
                    EstimatedDelivery = estimatedDelivery
                };

                order.OrderDetails = orderDetails;

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                var response = new OrderResponseDto
                {
                    OrderId = order.Id,
                    TotalPrice = order.TotalPrice,
                    EstimatedDelivery = estimatedDelivery,
                    Status = order.Status
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Ошибка при создании заказа: {ex.Message}" });
            }
        }

        [HttpGet("history")]
        public async Task<ActionResult<List<OrderHistoryDto>>> GetOrderHistory()
        {
            try
            {
                // Получаем ID текущего пользователя
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new { message = "Требуется авторизация" });
                }

                // Получаем заказы только текущего пользователя
                var orders = await _context.Orders
                    .Where(o => o.UserId == userId.Value) // Фильтруем по пользователю
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Pizza)
                    .Include(o => o.OrderDetails)
                    .OrderByDescending(o => o.OrderDate)
                    .Take(50)
                    .ToListAsync();

                var result = orders.Select(o => new OrderHistoryDto
                {
                    Id = o.Id,
                    OrderDate = o.OrderDate,
                    TotalPrice = o.TotalPrice,
                    Status = o.Status,
                    EstimatedDelivery = o.OrderDetails?.EstimatedDelivery,
                    Address = o.OrderDetails?.Address,
                    Items = o.OrderItems.Select(oi => new OrderItemHistoryDto
                    {
                        PizzaName = oi.Pizza?.Name ?? "Кастомная пицца",
                        Size = oi.Size,
                        ItemPrice = oi.ItemPrice
                    }).ToList()
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                // Возвращаем пустой список в случае ошибки
                return Ok(new List<OrderHistoryDto>());
            }
        }

        private decimal GetSizeMultiplier(string size)
        {
            return size.ToLower() switch
            {
                "small" => 0.7m,
                "medium" => 1.0m,
                "large" => 1.3m,
                "xl" => 1.6m,
                _ => 1.0m
            };
        }

        // Метод для получения ID текущего пользователя из JWT токена
        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            return null;
        }
    }
}