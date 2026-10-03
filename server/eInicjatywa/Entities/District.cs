namespace eInicjatywa.Entities
{
    public class District
    {
        public Guid Id { get; set; } = Guid.CreateVersion7();
        public string Name { get; set; } = string.Empty;

        public ICollection<Idea> Ideas { get; set; } = new List<Idea>();
        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
