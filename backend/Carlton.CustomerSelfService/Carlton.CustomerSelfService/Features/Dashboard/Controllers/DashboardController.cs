using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Threading.Tasks;

namespace Carlton.CustomerSelfService.Features.Dashboard.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public DashboardController(IWebHostEnvironment env)
        {
            _env = env;
        }

        private string? ReadJsonFile(string fileName)
        {
            var path = Path.Combine(_env.ContentRootPath, "data", fileName);
            if (!System.IO.File.Exists(path))
                return null;
            return System.IO.File.ReadAllText(path);
        }

        [HttpGet("user")]
        public IActionResult GetUser()
        {
            var json = ReadJsonFile("users.json");
            if (json == null) return NotFound();
            return Content(json, "application/json");
        }

        [HttpGet("nextTrip")]
        public IActionResult GetNextTrip()
        {
            var json = ReadJsonFile("bookings.json");
            if (json == null) return NotFound();

            // Return the nextTrip property if present. Do not return a JsonElement
            // from a disposed JsonDocument; serialize the raw JSON instead.
            try
            {
                using var doc = System.Text.Json.JsonDocument.Parse(json);
                if (doc.RootElement.TryGetProperty("nextTrip", out var nextTrip))
                {
                    return Content(nextTrip.GetRawText(), "application/json");
                }
                return Content(json, "application/json");
            }
            catch
            {
                return Content(json, "application/json");
            }
        }

        [HttpGet("notifications")]
        public IActionResult GetNotifications()
        {
            var json = ReadJsonFile("notifications.json");
            if (json == null) return NotFound();
            return Content(json, "application/json");
        }

        [HttpGet("routes")]
        public IActionResult GetRoutes()
        {
            var json = ReadJsonFile("routes.json");
            if (json == null) return NotFound();
            return Content(json, "application/json");
        }

        [HttpGet("promotions")]
        public IActionResult GetPromotions()
        {
            var json = ReadJsonFile("promotions.json");
            if (json == null) return NotFound();
            return Content(json, "application/json");
        }
    }
}
