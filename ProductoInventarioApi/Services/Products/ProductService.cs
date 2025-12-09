using ProductoInventarioApi.DTOs.General;
using ProductoInventarioApi.DTOs.Product;
using ProductoInventarioApi.Repositories;
using ProductoInventarioApi.Models;
using ProductoInventarioApi.Services.Product;

namespace ProductoInventarioApi.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _repository;
        private readonly ILogger<ProductService> _logger;

        public ProductService(IProductRepository repository, ILogger<ProductService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        // Mapper
        private ProductDto MapToProductDto(ProductEntity product)
        {
            return new ProductDto
            {
                Id = product.Id,
                Codigo = product.Codigo,
                Nombre = product.Nombre,
                Precio = product.Precio,
                Stock = product.Stock,
                Lote_Numero = product.Lote_Numero,
                Fecha_Ingreso = product.Fecha_Ingreso,
                Estado = product.Estado
            };
        }

        // Acción: CP (Consulta)
        public async Task<ApiResponse<IEnumerable<ProductDto>>> GetProductsAsync(int userId, int? productId, string? estado)
        {
            // 1. Crear Request y fijar acción (CP)
            var request = new ProductRequest
            {
                Accion = "CP",
                UserId = userId,
                ProId = productId,
                ProEstado = estado
            };

            _logger.LogInformation("Consulta de productos (CP) iniciada por UserID: {UserId}. Filtro ID: {ProId}, Estado: {Estado}", userId, productId, estado);

            var (products, code, message) = await _repository.ExecuteProductQuery(request);

            var productDtos = products.Select(MapToProductDto);

            return new ApiResponse<IEnumerable<ProductDto>>
            {
                Code = code,
                Message = message,
                Data = productDtos
            };
        }

        // Acción: IP (Guardar)
        public async Task<ApiResponse<object>> InsertProductAsync(ProductRequest request, int userId)
        {
            //validaciones
            if (string.IsNullOrWhiteSpace(request.ProCodigo))
                throw new ArgumentException("El código del producto es obligatorio.");

            if (string.IsNullOrWhiteSpace(request.ProNombre))
                throw new ArgumentException("El nombre del producto es obligatorio.");

            if (request.ProPrecio == null || request.ProPrecio < 0)
                throw new ArgumentException("El precio debe ser mayor o igual a 0.");

            if (request.ProStock == null || request.ProStock < 0)
                throw new ArgumentException("El stock no puede ser negativo.");

            if (string.IsNullOrWhiteSpace(request.ProLoteNumero))
                throw new ArgumentException("El número de lote es obligatorio.");

            if (request.ProFechaIngreso != null && request.ProFechaIngreso > DateTime.Now)
                throw new ArgumentException("La fecha de ingreso no puede ser futura.");

            if (request.ProPrecio == null || request.ProPrecio <= 0 || string.IsNullOrEmpty(request.ProCodigo))
            {
                throw new ArgumentException("Faltan campos requeridos o son inválidos (Código, Precio > 0).");
            }
            request.Accion = "IP";
            request.UserId = userId;

            var (code, message) = await _repository.ExecuteProductCommand(request);

            _logger.LogInformation("Intento de Inserción (IP) por UserID: {UserId}. Resultado Code: {Code}", userId, code);

            return new ApiResponse<object> { Code = code, Message = message, Data = null };
        }

        // Acción: UP (Actualizar)
        public async Task<ApiResponse<object>> UpdateProductAsync(ProductRequest request, int userId)
        {
            //validaciones
            if (string.IsNullOrWhiteSpace(request.ProCodigo))
                throw new ArgumentException("El código del producto es obligatorio.");

            if (string.IsNullOrWhiteSpace(request.ProNombre))
                throw new ArgumentException("El nombre del producto es obligatorio.");

            if (request.ProPrecio == null || request.ProPrecio < 0)
                throw new ArgumentException("El precio debe ser mayor o igual a 0.");

            if (request.ProStock == null || request.ProStock < 0)
                throw new ArgumentException("El stock no puede ser negativo.");

            if (string.IsNullOrWhiteSpace(request.ProLoteNumero))
                throw new ArgumentException("El número de lote es obligatorio.");

            if (request.ProFechaIngreso != null && request.ProFechaIngreso > DateTime.Now)
                throw new ArgumentException("La fecha de ingreso no puede ser futura.");

            if (request.ProId == null || request.ProId <= 0)
            {
                throw new ArgumentException("ID de producto invalido para actualizar.");
            }
            if (request.ProEstado != null && request.ProEstado != "A" && request.ProEstado != "I")
            {
                throw new ArgumentException("El estado debe ser 'A' (activo) o 'I' (inactivo).");
            }

            request.Accion = "UP";
            request.UserId = userId;

            var (code, message) = await _repository.ExecuteProductCommand(request);

            _logger.LogInformation("Intento de Actualización (UP) para ProId: {ProId} por UserID: {UserId}. Resultado Code: {Code}", request.ProId, userId, code);

            return new ApiResponse<object> { Code = code, Message = message, Data = null };
        }
    }
}
