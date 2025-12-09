using ProductoInventarioApi.Models;

namespace ProductoInventarioApi.Repositories

{
    public interface IUserRepository
    {
        Task<User> GetUserByUsername(string username);
    }
}
