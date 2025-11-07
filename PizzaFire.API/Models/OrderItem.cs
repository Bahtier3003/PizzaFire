namespace PizzaFire_API.Models
{
    public class OrderItem
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;
        public int PizzaId { get; set; }
        public Pizza Pizza { get; set; } = null!;
        public string Size { get; set; } = "medium";
        public decimal ItemPrice { get; set; }

        // Исправлено: правильные названия для JSON полей
        public string AdditionalIngredientsJson { get; set; } = "[]";
        public string RemovedIngredientsJson { get; set; } = "[]";
    }
}