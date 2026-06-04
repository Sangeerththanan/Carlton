using System.Web;

namespace Carlton.CustomerSelfService.Features.LeisurePlan.Services;

public class ImageService : IImageService
{
    private readonly Dictionary<string, string> _knownCityImages = new()
    {
        { "bangkok", "1508009603885-50cf7c579365" },
        { "colombo", "1533130061792-64b345e4a833" },
        { "london", "1526129317700-1c3132e4ea8b" },
        { "paris", "1502603306324-64b1512344c8" },
        { "new york", "1496442226666-8824239106e7" },
        { "tokyo", "1540959733332-e94e24242e8a" },
        { "dubai", "1512453973963-7ae8d3ee615d" },
        { "istanbul", "1541432901042-2d8bd64b4a9b" },
        { "singapore", "1529108190281-d007bc40428d" },
        { "sydney", "1506973035872-dd41b74ff0a4" },
        { "rome", "1552832230-c0197eb311f1" },
        { "bentota", "1625624933118-a68181710381" },
        { "yala", "1590604169229-37f2a149f692" },
        { "kandy", "1623861375699-1b9dad83e747" },
        { "galle", "1589982841243-70f9ed5660ae" }
    };

    public string GetImageUrl(string query, int width = 1200, int height = 800)
    {
        if (string.IsNullOrWhiteSpace(query))
            return GetDefaultTravelImage(width, height);

        var normalizedQuery = query.ToLowerInvariant().Trim();
        
        // Check for known cities explicitly first
        foreach (var city in _knownCityImages.Keys)
        {
            if (normalizedQuery.Contains(city))
            {
                return GetUnsplashUrl(_knownCityImages[city], width, height);
            }
        }

        // Fallback to keyword-based Unsplash search (deprecated but works via redirects)
        // Or use a more modern redirect service like LoremFlickr or a custom search logic
        // For a "premium" feel, we can use the Unsplash redirect if available, or just a random travel image.
        
        // Using LoremFlickr as a reliable keyword-based provider
        var encodedQuery = HttpUtility.UrlEncode(query);
        return $"https://loremflickr.com/{width}/{height}/{encodedQuery}";
    }

    private string GetUnsplashUrl(string id, int width, int height)
    {
        return $"https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w={width}&h={height}&q=80";
    }

    private string GetDefaultTravelImage(int width, int height)
    {
        return GetUnsplashUrl("1469854523086-cc02fe5d8800", width, height); // General travel image
    }
}
