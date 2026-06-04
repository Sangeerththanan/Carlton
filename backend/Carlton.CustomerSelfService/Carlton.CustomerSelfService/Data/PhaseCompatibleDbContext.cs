using Microsoft.EntityFrameworkCore;

namespace Carlton.CustomerSelfService.Data
{
    public class PhaseCompatibleDbContext : DbContext
    {
        public PhaseCompatibleDbContext(DbContextOptions<PhaseCompatibleDbContext> options) 
            : base(options) { }
        
        // We'll add DbSets after scaffolding
    }
}
