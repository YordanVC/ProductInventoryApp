using ProductoInventarioApi.DTOs.General;
using ProductoInventarioApi.DTOs.Product;

namespace ProductoInventarioApi.Services.Product
{
    public interface IProductService
    {
        Task<ApiResponse<IEnumerable<ProductDto>>> GetProductsAsync(int userId, int? productId, string? estado);
        Task<ApiResponse<object>> InsertProductAsync(ProductRequest request, int userId);
        Task<ApiResponse<object>> UpdateProductAsync(ProductRequest request, int userId);
    }
}
