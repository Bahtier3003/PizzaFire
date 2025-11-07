using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PizzaFire_API.Data;
using PizzaFire_API.DTOs;
using PizzaFire_API.Models;
using System.Security.Claims;

namespace PizzaFire_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly PizzaDbContext _context;
        private readonly ILogger<PaymentsController> _logger;

        public PaymentsController(PizzaDbContext context, ILogger<PaymentsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("methods")]
        public ActionResult<List<PaymentMethodDto>> GetPaymentMethods()
        {
            var methods = new List<PaymentMethodDto>
            {
                new PaymentMethodDto
                {
                    Method = "card",
                    Description = "Банковская карта",
                    Icon = "fa-credit-card"
                },
                new PaymentMethodDto
                {
                    Method = "cash",
                    Description = "Наличными курьеру",
                    Icon = "fa-money-bill-wave"
                }
            };

            return Ok(methods);
        }

        [HttpPost("process")]
        public async Task<ActionResult<PaymentResponseDto>> ProcessPayment(ProcessPaymentDto paymentDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new { message = "Требуется авторизация" });
                }

                var order = await _context.Orders
                    .FirstOrDefaultAsync(o => o.Id == paymentDto.OrderId && o.UserId == userId.Value);

                if (order == null)
                {
                    return NotFound(new { message = "Заказ не найден" });
                }

                if (order.Status != "pending_payment")
                {
                    return BadRequest(new { message = "Заказ уже оплачен или отменен" });
                }

                // Имитация обработки платежа
                await Task.Delay(1000);

                bool paymentSuccess = true;
                string message = "Оплата прошла успешно";

                if (paymentDto.PaymentMethod == "card")
                {
                    if (string.IsNullOrEmpty(paymentDto.CardNumber) ||
                        paymentDto.CardNumber.Replace(" ", "").Length != 16)
                    {
                        paymentSuccess = false;
                        message = "Неверный номер карты";
                    }
                    else
                    {
                        var random = new Random();
                        paymentSuccess = random.Next(1, 11) <= 9;
                        message = paymentSuccess ? "Оплата картой прошла успешно" : "Недостаточно средств";
                    }
                }
                else if (paymentDto.PaymentMethod == "cash")
                {
                    message = "Заказ подтвержден. Оплата наличными при получении";
                }

                if (paymentSuccess)
                {
                    order.Status = "confirmed";
                    order.PaymentStatus = paymentDto.PaymentMethod == "cash" ? "pending_cash" : "paid";
                    order.PaymentMethod = paymentDto.PaymentMethod;
                    order.PaidAt = paymentDto.PaymentMethod == "cash" ? null : DateTime.UtcNow;

                    await _context.SaveChangesAsync();
                    _logger.LogInformation($"Payment successful for order {order.Id}");
                }

                return Ok(new PaymentResponseDto
                {
                    Success = paymentSuccess,
                    Message = message,
                    OrderStatus = paymentSuccess ? "confirmed" : "pending_payment",
                    PaymentStatus = paymentSuccess ? (paymentDto.PaymentMethod == "cash" ? "pending_cash" : "paid") : "failed"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing payment");
                return StatusCode(500, new PaymentResponseDto
                {
                    Success = false,
                    Message = "Ошибка при обработке платежа"
                });
            }
        }

        [HttpPost("cash-confirm")]
        public async Task<ActionResult> ConfirmCashPayment([FromBody] int orderId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == null)
                {
                    return Unauthorized(new { message = "Требуется авторизация" });
                }

                var order = await _context.Orders
                    .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == userId.Value);

                if (order == null)
                {
                    return NotFound(new { message = "Заказ не найден" });
                }

                if (order.PaymentMethod != "cash" || order.PaymentStatus != "pending_cash")
                {
                    return BadRequest(new { message = "Некорректный статус оплаты" });
                }

                order.PaymentStatus = "paid";
                order.PaidAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Оплата наличными подтверждена" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error confirming cash payment");
                return StatusCode(500, new { message = "Ошибка при подтверждении оплаты" });
            }
        }

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