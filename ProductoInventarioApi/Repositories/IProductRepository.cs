using ProductoInventarioApi.DTOs.Product;
using ProductoInventarioApi.Models;

namespace ProductoInventarioApi.Repositories
{
    public interface IProductRepository
    {
        Task<(IEnumerable<ProductEntity> Products, int Code, string Message)> ExecuteProductQuery(ProductRequest request);
        Task<(int Code, string Message)> ExecuteProductCommand(ProductRequest request);
    }
}
