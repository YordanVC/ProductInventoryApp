using ProductoInventarioApi.DTOs.General;

namespace ProductoInventarioApi.Services.Auth
{
    public interface IAuthService
    {
        Task<string> Authenticate(LoginDto loginDto);
    }
}
