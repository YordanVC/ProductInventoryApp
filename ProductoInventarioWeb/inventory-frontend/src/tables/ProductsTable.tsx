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

        return (
            <div className="flex gap-2 justify-content-center flex-wrap">
                <Button
                    icon="pi pi-pencil"
                    tooltip="Editar"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => onEdit(product)}
                    outlined
                    style={{
                        minWidth: '2.5rem',
                        height: '2.5rem',
                        padding: '0.5rem',
                        borderColor: '#E4007C',
                        color: '#E4007C',
                        background: 'white',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#E4007C';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.color = '#E4007C';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                />
                <Button
                    label={buttonLabel}
                    icon={buttonIcon}
                    onClick={() => handleStatusChange(product)}
                    disabled={statusMutation.isPending}
                    outlined={!isProductActive}
                    iconPos="left"
                    style={{
                        fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                        padding: '0.5rem 1rem',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        borderColor: isProductActive ? '#666' : '#E4007C',
                        color: isProductActive ? '#666' : '#E4007C',
                        background: 'white',
                        transition: 'all 0.3s ease',
                        borderRadius: '6px',
                        gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                        if (isProductActive) {
                            e.currentTarget.style.background = '#666';
                            e.currentTarget.style.color = 'white';
                        } else {
                            e.currentTarget.style.background = '#E4007C';
                            e.currentTarget.style.color = 'white';
                        }
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.color = isProductActive ? '#666' : '#E4007C';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                />
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <div className="text-center">
                    <ProgressSpinner
                        style={{ width: '50px', height: '50px' }}
                        strokeWidth="4"
                    />
                    <p className="mt-3" style={{ color: '#666', fontSize: '0.95rem' }}>
                        Cargando productos...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="text-center p-4"
                style={{
                    color: '#d32f2f',
                    background: '#ffebee',
                    border: '2px solid #ef5350',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                }}
            >
                <i className="pi pi-exclamation-triangle mr-2" style={{ fontSize: '1.5rem', verticalAlign: 'middle' }}></i>
                Error al cargar productos: {error.message}
            </div>
        );
    }

    const data = products || [];

    return (
        <>
            <ConfirmDialog />
            <div className="datatable-responsive-wrapper">
                <DataTable
                    value={data}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    dataKey="id"
                    emptyMessage="No se encontraron productos."
                    className="p-datatable-sm"
                    stripedRows
                    responsiveLayout="scroll"
                    breakpoint="960px"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos   "
                >
                    <Column
                        field="codigo"
                        header="Código"
                        sortable
                        style={{ minWidth: '120px' }}
                        headerStyle={{ fontWeight: '700', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}
                        bodyStyle={{ fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', fontWeight: '500' }}
                    />
                    <Column
                        field="nombre"
                        header="Nombre"
                        sortable
                        style={{ minWidth: '180px' }}
                        headerStyle={{ fontWeight: '700', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}
                        bodyStyle={{ fontSize: 'clamp(0.8rem, 2vw, 0.95rem)' }}
                    />
                    <Column
                        field="lote_Numero"
                        header="Lote"
                        style={{ minWidth: '140px' }}
                        headerStyle={{ fontWeight: '700', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}
                        bodyStyle={{ fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', fontFamily: 'monospace' }}
                    />
                    <Column
                        field="stock"
                        header="Stock"
                        sortable
                        style={{ minWidth: '100px' }}
                        headerStyle={{ fontWeight: '700', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}
                        bodyStyle={{ fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', fontWeight: '600', textAlign: 'center' }}
                    />
                    <Column
                        field="precio"
                        header="Precio"
                        body={priceBodyTemplate}
                        sortable
                        style={{ minWidth: '110px' }}
                        headerStyle={{ fontWeight: '700', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}
                        bodyStyle={{ fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', fontWeight: '600', color: '#2e7d32' }}
                    />
                    <Column
                        field="estado"
                        header="Estado"
                        body={statusBodyTemplate}
                        sortable
                        style={{ minWidth: '100px' }}
                        headerStyle={{ fontWeight: '700', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)' }}
                        bodyStyle={{ textAlign: 'center' }}
                    />
                    <Column
                        header="Acciones"
                        body={actionBodyTemplate}
                        exportable={false}
                        style={{ minWidth: '200px' }}
                        headerStyle={{ fontWeight: '700', fontSize: 'clamp(0.85rem, 2vw, 0.95rem)', textAlign: 'center' }}
                        bodyStyle={{ textAlign: 'center' }}
                    />
                </DataTable>
            </div>
        </>
    );
};

export default ProductsTable;