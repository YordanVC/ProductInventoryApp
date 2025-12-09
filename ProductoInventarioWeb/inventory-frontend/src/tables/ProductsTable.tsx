// src/tables/ProductsTable.tsx

import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { useProductsQuery, useProductMutation } from '../api/products';
import { ProgressSpinner } from 'primereact/progressspinner';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import type { ProductResponse } from '../types/dtos';
import type { Toast } from 'primereact/toast';
import { useAuth } from '../components/AuthProvider';

interface ProductsTableProps {
    estadoFilter: 'A' | 'I' | '';
    onEdit: (product: ProductResponse) => void;
    toast: React.RefObject<Toast | null>;
}

const ProductsTable: React.FC<ProductsTableProps> = ({ estadoFilter, onEdit, toast }) => {
    const { userId } = useAuth();
    const { data: products, isLoading, error, refetch } = useProductsQuery(estadoFilter);
    const statusMutation = useProductMutation();


    const handleStatusChange = (product: ProductResponse) => {
        const newEstado = product.estado === 'A' ? 'I' : 'A';
        const actionLabel = newEstado === 'A' ? 'Activar' : 'Inactivar';

        confirmDialog({
            message: `¿Está seguro que desea ${actionLabel} el producto ${product.nombre}?`,
            header: 'Confirmación de Estado',
            icon: 'pi pi-info-circle',
            acceptClassName: newEstado === 'A' ? 'p-button-success' : 'p-button-danger',

            accept: () => {
                const request = {
                    accion: 'UP',
                    userId: userId,
                    proId: product.id,
                    proEstado: newEstado,
                    proCodigo: product.codigo,
                    proNombre: product.nombre,
                    proLoteNumero: product.lote_Numero,
                    proFechaIngreso: product.fecha_Ingreso,
                    proPrecio: product.precio,
                    proStock: product.stock,
                };

                (async () => {
                    try {
                        await statusMutation.mutateAsync({ request: request as any, isEdit: true });

                        toast.current?.show({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: `Producto ${actionLabel.toLowerCase()}do exitosamente`,
                            life: 3000
                        });

                        refetch();
                    } catch (error: any) {
                        toast.current?.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: error.message || 'Error al actualizar el producto',
                            life: 3000
                        });
                    }
                })();
            },
        });
    };



    // Template para el estado (Tag)
    const statusBodyTemplate = (product: ProductResponse) => {
        const severity = product.estado === 'A' ? 'success' : 'danger';
        const text = product.estado === 'A' ? 'Activo' : 'Inactivo';
        return <Tag value={text} severity={severity} />;
    };

    // Template para el precio
    const priceBodyTemplate = (product: ProductResponse) => {
        return new Intl.NumberFormat('es-EC', { style: 'currency', currency: 'USD' }).format(product.precio);
    };

    // Template de Acciones 
    const actionBodyTemplate = (product: ProductResponse) => {
        const isProductActive = product.estado === 'A';
        const buttonLabel = isProductActive ? 'Inactivar' : 'Activar';
        const buttonIcon = isProductActive ? 'pi pi-times-circle' : 'pi pi-check-circle';
        const buttonSeverity = isProductActive ? 'danger' : 'success';

        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    tooltip="Editar"
                    severity="info"
                    onClick={() => onEdit(product)}
                />
                <Button
                    label={buttonLabel}
                    icon={buttonIcon}
                    severity={buttonSeverity}
                    onClick={() => handleStatusChange(product)}
                    disabled={statusMutation.isPending}
                />
            </div>
        );
    };

    if (isLoading) {
        return <div className="flex justify-content-center items-center h-48"><ProgressSpinner /></div>;
    }

    if (error) {
        return <div className="text-red-600 p-4 border border-red-300 bg-red-50">Error al cargar productos: {error.message}</div>;
    }

    const data = products || [];

    return (
        <>
            <ConfirmDialog />
            <DataTable
                value={data}
                paginator rows={5}
                dataKey="id"
                emptyMessage="No se encontraron productos."
                className="shadow-lg"
            >
                <Column field="codigo" header="Código" sortable style={{ width: '10%' }} />
                <Column field="nombre" header="Nombre" sortable style={{ width: '25%' }} />
                <Column field="lote_Numero" header="Lote" style={{ width: '15%' }} />
                <Column field="stock" header="Stock" sortable style={{ width: '10%' }} />
                <Column field="precio" header="Precio" body={priceBodyTemplate} sortable style={{ width: '10%' }} />
                <Column field="estado" header="Estado" body={statusBodyTemplate} sortable style={{ width: '10%' }} />
                <Column header="Acciones" body={actionBodyTemplate} exportable={false} style={{ width: '20%' }} />
            </DataTable>
        </>
    );
};

export default ProductsTable;