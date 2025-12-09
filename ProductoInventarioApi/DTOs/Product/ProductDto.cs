namespace ProductoInventarioApi.DTOs.Product
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Codigo { get; set; }
        public string Nombre { get; set; }
        public string Lote_Numero { get; set; }
        public DateTime Fecha_Ingreso { get; set; }
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public string Estado { get; set; }
    }
}
