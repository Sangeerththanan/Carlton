using Carlton.CustomerSelfService.Features.LeisurePlan.Dtos;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Carlton.CustomerSelfService.Features.LeisurePlan.Services;

public class OpenAIService : IOpenAIService
{
    private readonly string _apiKey;
    private readonly ILogger<OpenAIService> _logger;
    private readonly IHttpClientFactory _httpClientFactory; 
    private readonly IImageService _imageService;
    private const string GroqEndpoint = "https://api.groq.com/openai/v1/chat/completions";
    private const string GroqModel = "llama-3.3-70b-versatile";

    public OpenAIService(IConfiguration configuration, ILogger<OpenAIService> logger, IHttpClientFactory httpClientFactory, IImageService imageService)
{
    _apiKey = configuration["Groq:ApiKey"] ?? "";
    _logger = logger;
    _httpClientFactory = httpClientFactory;
    _imageService = imageService;
    
    _logger.LogInformation("Groq Key present: {Present}, Value starts with: {Start}", 
        !string.IsNullOrEmpty(_apiKey), 
        _apiKey.Length > 5 ? _apiKey[..5] : "EMPTY");
}

    public async Task<AIFullPlanDto> GenerateLeisurePlanAsync(AILeisurePlanRequestDto request)
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            throw new InvalidOperationException("Groq API Key is not configured.");
        }

        var prompt = ConstructPrompt(request);

        var requestBody = new
        {
            model = GroqModel,
            messages = new[]
            {
                new { role = "system", content = "You are a professional travel planner. Return ONLY a valid JSON object with no markdown, no code blocks, and no explanation. The JSON must exactly match the structure provided." },
                new { role = "user", content = prompt }
            },
            temperature = 0.7
        };

        var json = JsonSerializer.Serialize(requestBody);
        var httpContent = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Clear();
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

            var response = await client.PostAsync(GroqEndpoint, httpContent);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Groq API error {Status}: {Body}", response.StatusCode, responseBody);
                throw new Exception($"Groq API returned {response.StatusCode}: {responseBody}");
            }

            using var doc = JsonDocument.Parse(responseBody);
            var content = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? "";

            // Strip markdown code blocks if present
            if (content.Contains("```json"))
                content = content.Split("```json")[1].Split("```")[0].Trim();
            else if (content.Contains("```"))
                content = content.Split("```")[1].Split("```")[0].Trim();

            var jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var generatedPlan = JsonSerializer.Deserialize<AIFullPlanDto>(content, jsonOptions)
                ?? throw new Exception("Failed to deserialize Groq response into AIFullPlanDto.");

            // Enrichment
            generatedPlan.Budget = request.Budget;
            generatedPlan.PlanType = "AI Generated";
            generatedPlan.Status = "Pending Review";
            generatedPlan.Passengers = $"{request.Adults} Adults, {request.Children} Children, {request.Infants} Infants";
            if (request.SingleRooms > 0) generatedPlan.Passengers += $", {request.SingleRooms} Single";
            if (request.TwinRooms > 0) generatedPlan.Passengers += $", {request.TwinRooms} Twin";
            if (request.DoubleRooms > 0) generatedPlan.Passengers += $", {request.DoubleRooms} Double";
            if (request.TripleRooms > 0) generatedPlan.Passengers += $", {request.TripleRooms} Triple";
            if (request.FamilyRooms > 0) generatedPlan.Passengers += $", {request.FamilyRooms} Family";
            if (request.Suites > 0) generatedPlan.Passengers += $", {request.Suites} Suite";
            if (request.Dormitories > 0) generatedPlan.Passengers += $", {request.Dormitories} Dorm";

            generatedPlan.DateRange = request.FromDate.HasValue && request.ToDate.HasValue
                ? $"{request.FromDate:yyyy-MM-dd} to {request.ToDate:yyyy-MM-dd}"
                : "TBD";
            
            if (generatedPlan.EstimatedCost <= 0)
            {
                generatedPlan.EstimatedCost = request.Budget * 0.85m; // Sensible estimate if AI fails
            }

            // Populate Image URLs
            foreach (var leg in generatedPlan.Legs)
            {
                leg.ImageUrl = _imageService.GetImageUrl(leg.City);
            }

            if (generatedPlan.Legs.Count > 0)
            {
                generatedPlan.HeroImage = generatedPlan.Legs[0].ImageUrl;
            }

            return generatedPlan;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Groq API");
            throw;
        }
    }

    public async Task<List<AIHotelDto>> GetAlternativeHotelsAsync(AIHotelSearchRequestDto request)
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            throw new InvalidOperationException("Groq API Key is not configured.");
        }

        var prompt = $@"Suggest 4-5 real, popular hotels in {request.City}.
Budget per night: approximately {request.BudgetPerNight} {request.Currency}.
Passengers: {request.Adults} Adults, {request.Children} Children, {request.Infants} Infants.

Respond with ONLY a JSON array of objects with this structure (no markdown, no extra text):
[
  {{
    ""city"": ""{request.City}"",
    ""nights"": ""N NIGHTS"",
    ""name"": ""Hotel Name"",
    ""location"": ""Specific area in the city"",
    ""stars"": 5,
    ""price"": ""£150/night"",
    ""badge"": ""Within Budget / Premium / Best Match"",
    ""amenities"": [""Pool"", ""WiFi"", ""...""],
    ""imageUrl"": """"
  }}
]";

        var requestBody = new
        {
            model = GroqModel,
            messages = new[]
            {
                new { role = "system", content = "You are a professional travel planner. Return ONLY a valid JSON array of hotel objects." },
                new { role = "user", content = prompt }
            },
            temperature = 0.7
        };

        var json = JsonSerializer.Serialize(requestBody);
        var httpContent = new StringContent(json, Encoding.UTF8, "application/json");

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Clear();
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

        var response = await client.PostAsync(GroqEndpoint, httpContent);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("Groq API error {Status}: {Body}", response.StatusCode, responseBody);
            throw new Exception($"Groq API returned {response.StatusCode}");
        }

        using var doc = JsonDocument.Parse(responseBody);
        var content = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? "[]";

        if (content.Contains("```json"))
            content = content.Split("```json")[1].Split("```")[0].Trim();
        else if (content.Contains("```"))
            content = content.Split("```")[1].Split("```")[0].Trim();

        var jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var hotels = JsonSerializer.Deserialize<List<AIHotelDto>>(content, jsonOptions) ?? new();

        foreach (var hotel in hotels)
        {
            hotel.ImageUrl = _imageService.GetImageUrl(hotel.Name + " " + hotel.City);
        }

        return hotels;
    }

    public async Task<List<AIActivityOptionDto>> GetAlternativeActivitiesAsync(AIActivitySearchRequestDto request)
    {
        if (string.IsNullOrEmpty(_apiKey))
        {
            throw new InvalidOperationException("Groq API Key is not configured.");
        }

        var prompt = $@"Suggest 6-8 real, popular activities or attractions in {request.City}.
Passengers: {request.Adults} Adults, {request.Children} Children.

Respond with ONLY a JSON array of objects (no markdown, no extra text):
[
  {{
    ""id"": ""unique-id"",
    ""title"": ""Activity Title"",
    ""description"": ""Brief description including highlights and duration"",
    ""price"": ""£25/pp"",
    ""imageUrl"": """",
    ""tags"": [
      {{ ""label"": ""Cultural"", ""color"": ""#f0e4c2"" }},
      {{ ""label"": ""Outdoor"", ""color"": ""#e8f4fb"" }}
    ]
  }}
]";

        var requestBody = new
        {
            model = GroqModel,
            messages = new[]
            {
                new { role = "system", content = "You are a local travel expert. Return ONLY valid JSON array." },
                new { role = "user", content = prompt }
            },
            temperature = 0.7
        };

        var json = JsonSerializer.Serialize(requestBody);
        var httpContent = new StringContent(json, Encoding.UTF8, "application/json");

        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

        var response = await client.PostAsync(GroqEndpoint, httpContent);
        var responseBody = await response.Content.ReadAsStringAsync();

        using var doc = JsonDocument.Parse(responseBody);
        var content = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? "[]";

        if (content.Contains("```json"))
            content = content.Split("```json")[1].Split("```")[0].Trim();
        else if (content.Contains("```"))
            content = content.Split("```")[1].Split("```")[0].Trim();

        var jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var activities = JsonSerializer.Deserialize<List<AIActivityOptionDto>>(content, jsonOptions) ?? new();

        foreach (var activity in activities)
        {
            activity.ImageUrl = _imageService.GetImageUrl(activity.Title + " " + request.City);
        }

        return activities;
    }

    private string ConstructPrompt(AILeisurePlanRequestDto request)
    {
        var destinations = string.Join(", ", request.Destinations.Select(d => $"{d.Country} for {d.Days} days"));
        var experiences = string.Join(", ", request.Experiences);
        var transports = string.Join(", ", request.LocalTransportation);
        var meals = string.Join(", ", request.MealPreferences);

        return $@"Generate a comprehensive leisure plan for {destinations}.
Departure from: {request.DepartureAirport}.
Dates: From {request.FromDate:yyyy-MM-dd} to {request.ToDate:yyyy-MM-dd}.
Budget: {request.Budget} {request.Currency}.
Interests & Experiences: {experiences}.
Preferred Transportation: {transports}.
Meal Preferences: {meals}.
Passengers: {request.Adults} Adults, {request.Children} Children, {request.Infants} Infants.
Room Preferences: 
- Single Rooms: {request.SingleRooms}
- Twin Rooms: {request.TwinRooms}
- Double Rooms: {request.DoubleRooms}
- Triple Rooms: {request.TripleRooms}
- Family Rooms: {request.FamilyRooms}
- Suites: {request.Suites}
- Dormitories: {request.Dormitories}

Additional Notes: {request.AdditionalNotes}.

Respond with ONLY this JSON object structure (no markdown, no extra text):
{{{{
  ""title"": ""..."",
  ""tier"": ""Standard/Luxury/Budget"",
  ""planType"": ""AI Generated"",
  ""status"": ""Pending Review"",
  ""departureAirport"": ""IATA Code"",
  ""destinations"": ""Summary of countries"",
  ""legs"": [
    {{ ""flag"": ""emoji"", ""city"": ""City"", ""days"": ""N nights"" }}
  ],
  ""activities"": [""Activity 1"", ""...""],
  ""flights"": [
    {{{{
      ""label"": ""OUTBOUND/CONNECTING/RETURN"",
      ""route"": ""CODE → CODE"",
      ""date"": ""DD MMM YYYY"",
      ""airline"": ""Airline Name"",
      ""code"": ""FLIGHT_CODE"",
      ""from"": ""IATA"",
      ""to"": ""IATA"",
      ""dep"": ""HH:mm"",
      ""arr"": ""HH:mm"",
      ""duration"": ""Hh Mm"",
      ""fromCity"": ""City Name, TX"",
      ""toCity"": ""City Name, TX"",
      ""stops"": ""Direct/N stops"",
      ""tags"": [""Economy"", ""Meal"", ""...""],
      ""price"": ""£XXX / person""
    }}}}
  ],
  ""hotels"": [
    {{{{
      ""city"": ""CITY, COUNTRY"",
      ""nights"": ""N NIGHTS"",
      ""name"": ""Hotel Name"",
      ""location"": ""Area"",
      ""stars"": 5,
      ""price"": ""£150/night"",
      ""badge"": ""Best Match"",
      ""amenities"": [""Pool"", ""Spa""]
    }}
  ],
  ""itinerary"": {{
    ""CityName"": [
      {{
        ""day"": 1,
        ""morning"": {{ ""title"": ""..."", ""desc"": ""..."", ""duration"": ""..."", ""tags"": [{{ ""label"": ""..."", ""color"": ""#hex"" }}] }},
        ""afternoon"": {{ ""title"": ""..."", ""desc"": ""..."", ""duration"": ""..."", ""tags"": [{{ ""label"": ""..."", ""color"": ""#hex"" }}] }},
        ""evening"": {{ ""title"": ""..."", ""desc"": ""..."", ""duration"": ""..."", ""tags"": [{{ ""label"": ""..."", ""color"": ""#hex"" }}] }}
      }}
    ]
  }},
  ""mealPlan"": [
    {{ ""city"": ""CITY"", ""plan"": ""AI Suggestion"" }}
  ],
  ""estimatedCost"": 2500.0
}}";
    }
}