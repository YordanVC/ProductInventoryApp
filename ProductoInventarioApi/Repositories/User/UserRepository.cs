using Dapper;
using Microsoft.Data.SqlClient;
using ProductoInventarioApi.Models;
using System.Data;
using Microsoft.Extensions.Configuration;

namespace ProductoInventarioApi.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly string _connectionString;

        public UserRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        private IDbConnection GetConnection() => new SqlConnection(_connectionString);

        public async Task<User> GetUserByUsername(string username)
        {
            const string sql = "SELECT ID, USERNAME, PASSWORD_HASH, NOMBRE, ESTADO FROM USUARIOS WHERE USERNAME = @Username AND ESTADO = 'A'";

            using (var connection = GetConnection())
            {
                var user = await connection.QueryFirstOrDefaultAsync<User>(sql, new { Username = username });
                return user;
            }
        }
    }
}
