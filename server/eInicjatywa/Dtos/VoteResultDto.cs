namespace eInicjatywa.Dtos
{
    public record VoteResultDto
    (
        Guid id,
        int voteCount,
        bool hasVoted
    );
}
