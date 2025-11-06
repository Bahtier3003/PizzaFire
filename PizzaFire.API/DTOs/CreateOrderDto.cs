namespace PizzaFire_API.DTOs
{
    public class CreateOrderDto
    {
        public List<OrderItemDto> Items { get; set; } = new();
        public OrderDetailsDto Details { get; set; } = new();
    }

    public class OrderItemDto
    {
        public int PizzaId { get; set; }
        public string Size { get; set; } = "medium";
        public List<int> AdditionalIngredientIds { get; set; } = new();
        public List<int> RemovedIngredientIds { get; set; } = new();
    }

    public class OrderDetailsDto
    {
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? DoorCode { get; set; }  // Добавлено поле для кода домофона
        public string? CourierInstructions { get; set; }
    }

    public class OrderResponseDto
    {
        public int OrderId { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime EstimatedDelivery { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class OrderHistoryDto
    {
        public int Id { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? EstimatedDelivery { get; set; }
        public string? Address { get; set; }
        public List<OrderItemHistoryDto> Items { get; set; } = new();
    }

    public class OrderItemHistoryDto
    {
        public string? PizzaName { get; set; }
        public string Size { get; set; } = string.Empty;
        public decimal ItemPrice { get; set; }
    }
}
