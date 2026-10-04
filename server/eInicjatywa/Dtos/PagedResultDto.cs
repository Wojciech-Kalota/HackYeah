namespace eInicjatywa.Dtos
{
    public record PagedResult<T>(
        IReadOnlyList<T> Items,
        int CurrentPage,
        int PageSize,
        int PageCount,      // number of items on this page
        int TotalCount,     // total items matching the filters
        int TotalPages
    );
}
