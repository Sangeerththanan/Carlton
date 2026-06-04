using System.Text.Json;

namespace Carlton.CustomerSelfService.Features.LeisurePlan.Dtos;

public class FeaturedPackageDto
{
    public int Id { get; set; }
    public string Destination { get; set; } = string.Empty;
    public string Badge { get; set; } = string.Empty;
    public string BadgeColor { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string Nights { get; set; } = string.Empty;
    public string Experience { get; set; } = string.Empty;
    public List<PackageDetailDto> Details { get; set; } = new();
    public List<string> Tags { get; set; } = new();
    public List<WhatsIncludedDto> WhatsIncluded { get; set; } = new();
    public List<PackageItineraryDto> Itinerary { get; set; } = new();
    public List<PackageTierDto> Tiers { get; set; } = new();
    public decimal AccommodationCost { get; set; }
    public decimal TransfersCost { get; set; }
    public decimal ServiceFee { get; set; }
    public decimal EstimatedCost { get; set; }
    public List<string> GalleryImages { get; set; } = new();
    public List<PackageReviewDto> Reviews { get; set; } = new();
    public string WasPrice { get; set; } = string.Empty;
    public string Price { get; set; } = string.Empty;
    public string PerLabel { get; set; } = string.Empty;
    public string Save { get; set; } = string.Empty;
}

public class WhatsIncludedDto
{
    public string Title { get; set; } = string.Empty;
    public string Desc { get; set; } = string.Empty;
}

public class PackageItineraryDto
{
    public string Day { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Desc { get; set; } = string.Empty;
    public string? Img { get; set; }
}

public class PackageTierDto
{
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Desc { get; set; } = string.Empty;
    public bool IsPopular { get; set; }
}

public class PackageReviewDto
{
    public int Stars { get; set; }
    public string Text { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Stayed { get; set; } = string.Empty;
}

public class PackageDetailDto
{
    public string Value { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
}
