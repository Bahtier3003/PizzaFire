namespace PizzaFire_API.DTOs
{
    public class ProcessPaymentDto
    {
        public int OrderId { get; set; }
        public string PaymentMethod { get; set; } = "card";
        public string? CardNumber { get; set; }
        public string? ExpiryDate { get; set; }
        public string? CVV { get; set; }
    }

    public class PaymentResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string OrderStatus { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
    }

    public class PaymentMethodDto
    {
        public string Method { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
    }
}