namespace ProductoInventarioApi.Models
{
    public class ProductEntity
    {
        public int Id { get; set; }
        public string Codigo { get; set; }
        public string Nombre { get; set; }
        public string Lote_Numero { get; set; }
        public DateTime Fecha_Ingreso { get; set; }
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public string Estado { get; set; }

        // Auditoría
        public int Usuario_Creacion { get; set; }
        public DateTime Fecha_Creacion { get; set; }
        public int? Usuario_Modificacion { get; set; }
        public DateTime? Fecha_Modificacion { get; set; }
    }
}
