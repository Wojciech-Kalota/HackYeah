using System.Security.Claims;
using System.Text.Json;
using eInicjatywa.Dtos;
using eInicjatywa.Services;
using Microsoft.AspNetCore.Authentication.Cookies;
using Scalar.AspNetCore;
using StackExchange.Redis;
using eInicjatywa.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<ISessionService, SessionService>();
builder.Services.AddScoped<ICacheService, CacheService>();
builder.Services.AddScoped<UtilsService, UtilsService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IIdeasService, IdeasService>();
builder.Services.AddScoped<IStatusService, StatusService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IDistrictService, DistrictService>();

string postgresConnStr = builder.Configuration.GetConnectionString("Local_Database_Postgres")!;
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString(postgresConnStr)));

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddCors();

builder.Services.AddRouting(options =>
{
    options.LowercaseUrls = true;
});

string redisConnStr = builder.Configuration.GetConnectionString("Local_Cache_Redis")!;
var redis = ConnectionMultiplexer.Connect(redisConnStr);
builder.Services.AddSingleton<IConnectionMultiplexer>(redis);

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
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, cachedSession.UserId.ToString()),
                    new Claim("SessionToken", cachedSession.Token.ToString())
                };

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

var app = builder.Build();

app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod()
    .WithOrigins("http://localhost:5173/", "http://localhost:5174/"));

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
