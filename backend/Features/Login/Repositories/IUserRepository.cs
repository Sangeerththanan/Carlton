using backend.Features.Login.Models;
using backend.Features.Login.Enums;

namespace backend.Features.Login.Repositories;

public interface IUserRepository
{
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByUsernameAndRoleAsync(string username, UserRole role);
    Task<bool> ExistsByUsernameAsync(string username);
    Task<User> CreateAsync(User user);
    Task<User> UpdateAsync(User user);
    Task<bool> DeleteAsync(int id);
}
