namespace PizzaFire_API.Models
{
    public class OrderDetails
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? DoorCode { get; set; }
        public string? CourierInstructions { get; set; }
        public DateTime EstimatedDelivery { get; set; }
    }
}