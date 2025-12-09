// src/api/products.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './axios';
import type { ApiResponse, ProductRequest, ProductResponse } from '../types/dtos';

const PRODUCTS_QUERY_KEY = 'products';


// Función para obtener productos desde la API
const fetchProducts = async (estado: 'A' | 'I' | ''): Promise<ProductResponse[]> => {
    const params = {
        estado: estado,
        id: undefined 
    };

    const response = await api.get<ApiResponse<ProductResponse[]>>('/Products', { params });

    return response.data.data || []; 
};

// Hook para consultar la lista de productos
export const useProductsQuery = (estadoFilter: 'A' | 'I' | '') => {
    return useQuery({
        queryKey: [PRODUCTS_QUERY_KEY, estadoFilter], 
        queryFn: () => fetchProducts(estadoFilter),
        staleTime: 5 * 60 * 1000, 
    });
};


// Función para manejar la inserción o actualización
const manageProduct = async (data: { request: ProductRequest, isEdit: boolean }): Promise<ApiResponse<any>> => {
    const { request, isEdit } = data;
    
    if (isEdit) {
        // Actualizar
        const response = await api.put<ApiResponse<any>>(`/Products/${request.proId}`, request);
        return response.data;
    } else {
        // Insertar
        const response = await api.post<ApiResponse<any>>('/Products', request);
        return response.data;
    }
};

// useMutation: Hook para manejar la inserción, edición y cambio de estado
export const useProductMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: manageProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PRODUCTS_QUERY_KEY] }); 
        },
    });
};