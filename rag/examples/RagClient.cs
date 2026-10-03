using System.Net.Http.Json;
using System.Text.Json;

// Przykład dla .NET 8. Przekaż HttpClient z DI / IHttpClientFactory.
// Odpowiedź koncepcji: problem, audience, solution, category, context.
// solution opisuje rozwiązanie wraz ze sposobem działania.
// Kategorie przekazuje backend .NET razem z tekstem.
// Python zapisuje wynik w PostgreSQL i obsługuje idempotencję po submission_id.
// .NET nie wykonuje dodatkowego zapisu koncepcji ani zwiększania liczników.
public sealed class RagClient(HttpClient http)
{
    public async Task<JsonElement> AnalyzeAsync(
        string submissionId, string text, IReadOnlyList<RagCategory> categories, CancellationToken cancellationToken = default)
    {
        using var response = await http.PostAsJsonAsync("api/ideas/analyze",
            new { submission_id = submissionId, text, categories }, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            // Przy 503/busy użyj Retry-After, przy 502 sprawdź przyczynę.
            // Każde ponowienie zachowuje ten sam ID i dokładnie ten sam tekst.
            var details = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException($"RAG: {(int)response.StatusCode}: {details}",
                null, response.StatusCode);
        }
        return await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken);
    }
}

// Rejestracja w Program.cs:
// builder.Services.AddHttpClient<RagClient>(client =>
// {
//     client.BaseAddress = new Uri("http://127.0.0.1:8000/");
//     client.Timeout = TimeSpan.FromMinutes(15);
// });

public sealed record RagCategory(string id, string label);
