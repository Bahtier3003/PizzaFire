namespace PizzaFire_API.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public decimal TotalPrice { get; set; }
        public string Status { get; set; } = "pending"; // pending, confirmed, cooking, delivery, completed
        public List<OrderItem> OrderItems { get; set; } = new();
        public OrderDetails? OrderDetails { get; set; }
    }
}