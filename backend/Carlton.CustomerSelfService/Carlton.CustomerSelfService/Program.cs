using Carlton.CustomerSelfService.Data;
using Carlton.CustomerSelfService.Features.Login.Services;
using Carlton.CustomerSelfService.Features.Login.Repositories;
using Carlton.CustomerSelfService.Features.Login.Models;
using Carlton.CustomerSelfService.Features.Flights.Repositories;
using Carlton.CustomerSelfService.Features.Flights.Services;
using Carlton.CustomerSelfService.Features.Bookings.Services;
using Carlton.CustomerSelfService.Features.CheckIn.Services;
using Carlton.CustomerSelfService.Features.LeisurePlan.Services;
using Carlton.CustomerSelfService.Features.Login.Data;
using Carlton.CustomerSelfService.Features.Profile.Services;
using Carlton.CustomerSelfService.Features.TravelPlans.Services;
using Carlton.CustomerSelfService.Features.Search.Services;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddHttpClient();

// Configure DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ITravelPlanService, TravelPlanService>();
// Register repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IFlightRepository, FlightRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

// Register services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<ICheckInService, CheckInService>();
builder.Services.AddScoped<IFlightService, FlightService>();
builder.Services.AddScoped<ILeisurePlanService, LeisurePlanService>();
builder.Services.AddScoped<IOpenAIService, OpenAIService>();
builder.Services.AddScoped<IImageService, ImageService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<ILookupService, LookupService>();
builder.Services.AddSingleton<ITokenRevocationService, TokenRevocationService>();
builder.Services.AddScoped<IAnonymousSearchService, AnonymousSearchService>();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? throw new ArgumentNullException("JwtSettings:SecretKey");
var key = Encoding.ASCII.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true
    };
    // Read JWT from HTTP-only cookie instead of Authorization header
    options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            context.Token = context.Request.Cookies["auth_token"];
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            var revocationService = context.HttpContext.RequestServices
                .GetRequiredService<ITokenRevocationService>();
            var jti = context.Principal?.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Jti)?.Value;
            if (jti != null && revocationService.IsRevoked(jti))
                context.Fail("Token has been revoked");
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// Rate limiting — 5 login attempts per minute per IP
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("login", limiterOptions =>
    {
        limiterOptions.PermitLimit = 5;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 0;
    });
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// Add CORS — AllowAnyOrigin is incompatible with AllowCredentials (required for cookies)
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? new[] { "http://localhost:5173", "http://localhost:5174" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Carlton Customer Self Service API",
        Version = "v1",
        Description = "API for Carlton Airport Customer Self Service"
    });

    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Security response headers
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    context.Response.Headers["X-XSS-Protection"] = "0"; // Rely on CSP; legacy header causes issues in some browsers
    context.Response.Headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()";
    context.Response.Headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'";
    await next();
});

// Use CORS
app.UseCors("AllowFrontend");

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseRateLimiter();

// Use Authentication and Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Seed data with retry logic
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();



    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    var maxRetries = 10;
    var delay = TimeSpan.FromSeconds(3);
    var connected = false;

    for (int i = 0; i < maxRetries; i++)
    {
        try
        {
            if (await context.Database.CanConnectAsync())
            {
                connected = true;
                break;
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning($"Database not ready yet (attempt {i + 1}/{maxRetries}): {ex.Message}");
        }
        
        await Task.Delay(delay);
    }

    if (connected)
    {
        // Must run first — adds check-in columns before EF queries the Bookings table
        await DataSeeder.EnsureCheckInColumnsAsync(context);
        await DataSeeder.SeedLookupsAsync(context);
        await DataSeeder.SeedUsersAsync(context);
        await DataSeeder.EnsureGuestCheckoutUserAsync(context);
        await DataSeeder.SeedFlightsAsync(context);
        await DataSeeder.EnsureFlightUiMetadataAsync(context);
        await DataSeeder.SeedServicePackagesAsync(context);
        await DataSeeder.SeedRefundOptionsAsync(context);
        try
        {
            await DataSeeder.SeedLeisurePackagesAsync(context);
        }
        catch (Exception ex)
        {
            app.Logger.LogError(ex, "An error occurred while seeding leisure packages.");
        }
    }
    else
    {
        logger.LogCritical("Could not connect to database after multiple retries. The application may not function correctly.");

    }
}

app.Run();
