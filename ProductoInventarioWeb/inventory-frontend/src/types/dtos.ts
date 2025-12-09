export interface ProductRequest {
    accion:string;
    userId:number;
    proId: number;
    proCodigo: string;
    proNombre: string;
    proLoteNumero: string;
    proFechaIngreso: string; // Formato 'YYYY-MM-DD'
    proPrecio: number;
    proStock: number;
    proEstado: 'A' | 'I'; 
}
export interface ProductResponse {
    id: number;
    codigo: string;
    nombre: string;
    lote_Numero: string;
    fecha_Ingreso: string; // Formato 'YYYY-MM-DD'
    precio: number;
    stock: number;
    estado: 'A' | 'I'; 
}
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    code: number;
    message: string;
    data: {
        token: string;
    };
}