using Dapper;
using Microsoft.Data.SqlClient;
using ProductoInventarioApi.DTOs.General;
using ProductoInventarioApi.DTOs.Product;
using ProductoInventarioApi.Models;
using System.Data;

namespace ProductoInventarioApi.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly string _connectionString;
        public ProductRepository(IConfiguration configuration)
        {
            _connectionString = Environment.GetEnvironmentVariable("DEFAULT_CONNECTION");
        }
        private IDbConnection GetConnection() => new SqlConnection(_connectionString);
        public async Task<(int Code, string Message)> ExecuteProductCommand(ProductRequest request)
        {
            using (var connection = GetConnection())
            {
                var parameters = new
                {
                    ACCION=request.Accion,
                    PRO_ID=request.ProId,
                    PRO_CODIGO=request.ProCodigo,
                    PRO_NOMBRE=request.ProNombre,
                    PRO_LOTE_NUMERO=request.ProLoteNumero,
                    PRO_FECHA_INGRESO=request.ProFechaIngreso,
                    PRO_PRECIO=request.ProPrecio,
                    PRO_STOCK=request.ProStock,
                    PRO_ESTADO=request.ProEstado,
                    USER_ID = request.UserId
                };

                var result = await connection.QueryFirstOrDefaultAsync<ApiResponse<object>>(
                    "SP_MANTENIMIENTO_PRODUCTOS",
                    parameters, 
                    commandType: CommandType.StoredProcedure
                );

                return (result?.Code ?? 500, result?.Message ?? "Ocurrio un evento inesperado.");
            }
        }

        public async Task<(IEnumerable<ProductEntity> Products, int Code, string Message)> ExecuteProductQuery(ProductRequest request)
        {
            using (var connection = GetConnection())
            {
                var parameters = new
                {
                    ACCION = request.Accion,
                    PRO_ID = request.ProId,
                    PRO_CODIGO = request.ProCodigo,
                    PRO_NOMBRE = request.ProNombre,
                    PRO_LOTE_NUMERO = request.ProLoteNumero,
                    PRO_FECHA_INGRESO = request.ProFechaIngreso,
                    PRO_PRECIO = request.ProPrecio,
                    PRO_STOCK = request.ProStock,
                    PRO_ESTADO = request.ProEstado,
                    USER_ID = request.UserId
                };

                using (var multi = await connection.QueryMultipleAsync("SP_MANTENIMIENTO_PRODUCTOS", parameters, commandType: CommandType.StoredProcedure))
                {
    
                    var products = multi.Read<ProductEntity>().ToList();

                    var apiResponse = multi.Read<ApiResponse<object>>().FirstOrDefault();
                    return (products, apiResponse?.Code ?? 200, apiResponse?.Message ?? "Consulta exitosa.");
                }
            }
        }
    }
}
