namespace Carlton.CustomerSelfService.Features.LeisurePlan.Services;

public interface IImageService
{
    string GetImageUrl(string query, int width = 1200, int height = 800);
}
