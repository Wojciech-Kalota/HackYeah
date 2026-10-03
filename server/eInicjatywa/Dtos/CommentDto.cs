using eInicjatywa.Entities;

namespace eInicjatywa.Dtos
{
    public class CommentDto
    {
        public string Text { get; set; }

        public User User { get; set; } = null!;
        public Idea Idea { get; set; } = null!;
    }
}
