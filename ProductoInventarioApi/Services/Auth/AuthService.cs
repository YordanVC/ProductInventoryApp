using Microsoft.IdentityModel.Tokens;
using ProductoInventarioApi.DTOs.General;
using ProductoInventarioApi.Middleware.Exceptions;
using ProductoInventarioApi.Repositories;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ProductoInventarioApi.Services.Auth
{
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly IUserRepository _userRepository;

        public AuthService(IConfiguration configuration, IUserRepository userRepository)
        {
            _configuration = configuration;
            _userRepository = userRepository;
        }

        public async Task<string> Authenticate(LoginDto loginDto)
        {
            // 1. Buscar usuario activo en la DB
            var user = await _userRepository.GetUserByUsername(loginDto.Username);

            if (user == null)
            {
                throw new UnauthorizedException("Usuario o contraseña invalidos.");
            }

            // 2. Verificar la contraseña 
            string dbHash = user.PASSWORD_HASH.Trim();
            bool isValidPassword = BCrypt.Net.BCrypt.Verify(loginDto.Password, dbHash);

            if (!isValidPassword)
            {
                throw new UnauthorizedException("Usuario o contraseña invalidos.");
            }

            // 3. Generar JWT
            return GenerateJwtToken(user.ID, user.USERNAME);
        }

        private string GenerateJwtToken(int userId, string username)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, username),
                new Claim("ID", userId.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
