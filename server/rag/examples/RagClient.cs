using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

// Przykład dla .NET 8. Przekaż HttpClient z DI / IHttpClientFactory.
// Odpowiedź koncepcji: problem, audience, solution, category, context.
// solution zawiera sposób działania; mechanism już nie istnieje.
// Kategorie do formularza: GET api/categories (pola id i label).
public sealed class RagClient(HttpClient http)
{
    public async Task<JsonElement> AnalyzeAsync(
        string submissionId, string text, CancellationToken cancellationToken = default)
    {
        using var response = await http.PostAsJsonAsync("api/ideas/analyze",
            new { submission_id = submissionId, text }, cancellationToken);
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
