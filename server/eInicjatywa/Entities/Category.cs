namespace eInicjatywa.Entities
{
    public class Category
    {
        public Guid Id { get; set; } = Guid.CreateVersion7();
        public string Name { get; set; }
        public ICollection<IdeaCategory> IdeaCategories { get; set; } = new List<IdeaCategory>();
    }
}
