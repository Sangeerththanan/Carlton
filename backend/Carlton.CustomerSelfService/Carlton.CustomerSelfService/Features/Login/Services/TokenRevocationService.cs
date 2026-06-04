using System.Collections.Concurrent;

namespace Carlton.CustomerSelfService.Features.Login.Services;

public interface ITokenRevocationService
{
    void Revoke(string jti, DateTimeOffset expiry);
    bool IsRevoked(string jti);
}

public class TokenRevocationService : ITokenRevocationService
{
    private readonly ConcurrentDictionary<string, DateTimeOffset> _revokedTokens = new();

    public void Revoke(string jti, DateTimeOffset expiry)
    {
        _revokedTokens[jti] = expiry;
        PurgeExpired();
    }

    public bool IsRevoked(string jti) =>
        _revokedTokens.TryGetValue(jti, out var expiry) && expiry > DateTimeOffset.UtcNow;

    private void PurgeExpired()
    {
        var now = DateTimeOffset.UtcNow;
        foreach (var key in _revokedTokens.Keys.ToList())
        {
            if (_revokedTokens.TryGetValue(key, out var exp) && exp <= now)
                _revokedTokens.TryRemove(key, out _);
        }
    }
}
