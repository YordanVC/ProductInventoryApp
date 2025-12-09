using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductoInventarioApi.DTOs.General;
using ProductoInventarioApi.Middleware.Exceptions;
using ProductoInventarioApi.Services.Auth;

namespace ProductoInventarioApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;


        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("login")]
        [AllowAnonymous] 
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                // Llamar al servicio para autenticar y generar el token
                var token = await _authService.Authenticate(loginDto);

                _logger.LogInformation("Login exitoso para usuario: {Username}", loginDto.Username);

                return Ok(new ApiResponse<object>
                {
                    Code = 200,
                    Message = "Autenticación exitosa",
                    Data = new { Token = token }
                });
            }
            // UnauthorizedException
            catch (UnauthorizedException ex)
            {
                _logger.LogWarning("Intento de login fallido para usuario: {Username}. Mensaje: {Message}", loginDto.Username, ex.Message);

                // Devolvemos 401 Unauthorized
                return Unauthorized(new ApiResponse<object>
                {
                    Code = 401,
                    Message = ex.Message, 
                    Data = null
                });
            }
        }
    }
}
