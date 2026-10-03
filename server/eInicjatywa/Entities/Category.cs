namespace eInicjatywa.Entities
{
    public class Category
    {
        public Guid Id { get; set; } = Guid.CreateVersion7();
        public string Name { get; set; }

        public List<Guid> IdeaIds { get; set; } = new List<Guid>();
    }
}
