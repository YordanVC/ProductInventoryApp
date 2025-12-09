namespace ProductoInventarioApi.Models
{
    public class User
    {
        public int ID { get; set; }
        public string USERNAME { get; set; }
        public string PASSWORD_HASH { get; set; }
        public string NOMBRE { get; set; }
        public string ESTADO { get; set; }
    }
}
