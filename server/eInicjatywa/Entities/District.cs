namespace eInicjatywa.Entities
{
    public class District
    {
        public Guid Id { get; set; } = Guid.CreateVersion7();
        public string Name { get; set; }

        public List<Guid> IdeaIds { get; set; } = new List<Guid>();
        public List<Guid> UserIds { get; set; } = new List<Guid>();
    }
}
