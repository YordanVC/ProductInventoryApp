namespace ProductoInventarioApi.DTOs.Product
{
    public class ProductRequest
    {
        public string Accion { get; set; }
        public int UserId { get; set; }
        public int? ProId { get; set; }
        public string ProCodigo { get; set; }
        public string ProNombre { get; set; }
        public string ProLoteNumero { get; set; }
        public DateTime? ProFechaIngreso { get; set; }
        public decimal? ProPrecio { get; set; }
        public int? ProStock { get; set; }
        public string ProEstado { get; set; }
    }
}
