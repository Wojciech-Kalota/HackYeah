using System.Security.Claims;
using System.Text.Json;
using eInicjatywa.Dtos;
using eInicjatywa.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Scalar.AspNetCore;
using StackExchange.Redis;
using eInicjatywa.Data;
using eInicjatywa.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Configuration;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

string postgresConnStr = builder.Configuration.GetConnectionString("Local_Database_Postgres")!;
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(postgresConnStr));

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddCors();

builder.Services.AddRouting(options =>
{
    options.LowercaseUrls = true;
});

string redisConnStr = builder.Configuration.GetConnectionString("Local_Cache_Redis")!;
var redis = ConnectionMultiplexer.Connect(redisConnStr);
Console.WriteLine(redisConnStr);
builder.Services.AddSingleton<IConnectionMultiplexer>(redis);

// ADDING SERVICES
builder.Services.AddScoped<ISessionService, SessionService>();
builder.Services.AddScoped<ICacheService, CacheService>();
builder.Services.AddScoped<UtilsService>();
builder.Services.AddScoped<IUtilsService>(provider => provider.GetRequiredService<UtilsService>());
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IIdeasService, IdeasService>();
builder.Services.AddScoped<IStatusService, StatusService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IDistrictService, DistrictService>();
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

builder.Services.AddAuthentication("SessionCookie")
.AddCookie("SessionCookie", options =>
{
    options.Cookie.Name = "eInicjatywa";
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.ExpireTimeSpan = TimeSpan.FromHours(2);

    options.Events = new CookieAuthenticationEvents
    {
        OnValidatePrincipal = async context =>
        {
            try
            {
                var _utilsService = context.HttpContext.RequestServices.GetRequiredService<IUtilsService>();
                var _cacheService = context.HttpContext.RequestServices.GetRequiredService<ICacheService>();


                Guid sessionToken = await _utilsService.GetTokenGuid(context.Principal);

                var redisKey = $"eInicjatywa:Session:{sessionToken}";
                var cachedSessionJson = await _cacheService.GetValueAtKeyAsync(redisKey);
        
                // STRIKE CACHE
                if (string.IsNullOrEmpty(cachedSessionJson))
                {
                    throw new Exception("no key find");
                }

                var cachedSession = JsonSerializer.Deserialize<InternalSessionDto>(cachedSessionJson);
                if (cachedSession == null)
                {
                    throw new Exception("no cached session");
                }

                if (cachedSession.ExpiresAt <= DateTimeOffset.UtcNow)
                {
                    await _cacheService.RemoveKeyAsync(redisKey);
                    throw new Exception("Session has expired in cache.");
                }

                //REBUILD CLAIM PRINCIPLE
                var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
                var roles = await db.UserRoles
                    .Where(userRole => userRole.UserId == cachedSession.UserId)
                    .Select(userRole => userRole.Role.Name)
                    .ToListAsync();

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, cachedSession.UserId.ToString()),
                    new Claim("SessionToken", cachedSession.Token.ToString())
                };
                if (cachedSession.Roles != null)
                {
                    foreach (var role in cachedSession.Roles)
                    {
                        claims.Add(new Claim(ClaimTypes.Role, role));
                    }
                }

                var identity = new ClaimsIdentity(claims, "SessionCookie");
                context.ReplacePrincipal(new ClaimsPrincipal(identity));
            }
            catch
            {
                // CATCH INTERNAL ERRORS
                context.RejectPrincipal();
            }
        }
    };
});

builder.Services.AddAuthorization();

var port = Environment.GetEnvironmentVariable("PORT") ?? "10000";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var app = builder.Build();

app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod()
    .AllowCredentials()
    .WithOrigins("http://localhost:5173", "http://localhost:5174"));

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.EnsureCreatedAsync();

}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}


app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider("/app/storage"),
    RequestPath = "/api/file"
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
