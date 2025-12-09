using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProductoInventarioApi.DTOs.General;
using ProductoInventarioApi.DTOs.Product;
using ProductoInventarioApi.Middleware.Exceptions;
using ProductoInventarioApi.Services.Product;

namespace ProductoInventarioApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController:ControllerBase

    {
        private readonly IProductService _productService;
        private readonly ILogger<ProductsController> _logger;

        public ProductsController(IProductService productService, ILogger<ProductsController> logger)
        {
            _productService = productService;
            _logger = logger;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst("ID")?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedException("ID de usuario no encontrado o inválido en el token.");
            }
            return userId;
        }


        // GET: api/Products | Acción: CP
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int? id, [FromQuery] string? estado = "A")
        {
            try
            {
                int userId = GetUserId();

                if (id.HasValue) estado = null;

                var result = await _productService.GetProductsAsync(userId, id, estado);

                if (result.Data == null || (result.Data.Count() == 0 && id.HasValue))
                {
                    return NotFound(new ApiResponse<object> { Code = 404, Message = $"Producto con ID {id} no encontrado.", Data = null });
                }

                return Ok(result);
            }
            catch (Exception)
            {
                throw;
            }
        }


        // POST: api/Products | Acción: IP 
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ProductRequest request)
        {
            try
            {
                int userId = GetUserId();

                var result = await _productService.InsertProductAsync(request, userId);

                return StatusCode(result.Code, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiResponse<object> { Code = 400, Message = ex.Message, Data = null });
            }
        }

        // PUT: api/Products/{id} | Acción: UP 
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] ProductRequest request)
        {
            try
            {
                if (id != request.ProId)
                {
                    return BadRequest(new ApiResponse<object> { Code = 400, Message = "El ID de la ruta no coincide con el ProId en el cuerpo.", Data = null });
                }

                int userId = GetUserId();

                var result = await _productService.UpdateProductAsync(request, userId);

                return StatusCode(result.Code, result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiResponse<object> { Code = 400, Message = ex.Message, Data = null });
            }
        }
    }
}
