// src/components/CreateEditProductModal.tsx

import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { useProductMutation } from '../api/products';
import type { ProductRequest, ProductResponse } from '../types/dtos';
import type { Toast } from 'primereact/toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthProvider';

interface CreateEditProductModalProps {
    visible: boolean;
    onHide: () => void;
    product: ProductResponse | null;
    toast: React.RefObject<Toast | null>;
}

// Valores iniciales por defecto para un nuevo producto
const initialFormState: ProductRequest = {
    accion: '',
    userId: 0,
    proId: 0,
    proCodigo: '',
    proNombre: '',
    proLoteNumero: '',
    proFechaIngreso: '',
    proPrecio: 0,
    proStock: 0,
    proEstado: 'A', // Por defecto Activo
};

const CreateEditProductModal: React.FC<CreateEditProductModalProps> = ({ visible, onHide, product, toast }) => {
    const { userId } = useAuth();
    const [formData, setFormData] = useState<ProductRequest>(initialFormState);
    const productMutation = useProductMutation();
    const queryClient = useQueryClient();


    useEffect(() => {
        if (product) {
            setFormData({
                accion: 'UP',
                userId: userId,
                proId: product.id,
                proCodigo: product.codigo,
                proNombre: product.nombre,
                proLoteNumero: product.lote_Numero,
                proFechaIngreso: product.fecha_Ingreso,
                proPrecio: product.precio,
                proStock: product.stock,
                proEstado: product.estado,
            });
        } else {
            setFormData(initialFormState);
        }
    }, [product]);

    const isEditMode = !!product;
    const dialogHeader = isEditMode ? `Editar Producto: ${product?.nombre}` : 'Crear Nuevo Producto';


    const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { value: any; name: string }) => {
        let name: string;
        let value: any;

        if ('target' in e) {
            ({ name, value } = e.target);
        } else {
            ({ name, value } = e);
        }

        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleDateChange = (e: any) => {
        const dateValue = e.value ? new Date(e.value).toISOString().split('T')[0] : '';
        setFormData(prev => ({ ...prev, proFechaIngreso: dateValue }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const requestData = {
            ...formData,
            userId: userId,
            accion: isEditMode ? 'UP' : 'IP'
        };

        try {
            await productMutation.mutateAsync({ request: requestData, isEdit: isEditMode });

            toast.current?.show({
                severity: 'success',
                summary: 'Éxito',
                detail: isEditMode ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente',
                life: 3000
            });

            queryClient.invalidateQueries({ queryKey: ['products'] });

            onHide();
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Error al guardar el producto',
                life: 3000
            });
        }
    };

    const footerContent = (
        <div className="flex justify-content-end gap-2 mt-4 mb-2  mr-2">
            <Button
                label="Cancelar"
                icon="pi pi-times"
                className='p-2'
                onClick={onHide}
                severity="secondary"
                disabled={productMutation.isPending}
            />
            <Button
                label={isEditMode ? "Guardar Cambios" : "Crear Producto"}
                icon="pi pi-check"
                className='p-2'
                type="submit"
                severity="success"
                form="product-form"
                disabled={productMutation.isPending}
            />
        </div>
    );


    return (
        <Dialog
            header={dialogHeader}
            visible={visible}
            style={{ width: '50vw' }}
            onHide={onHide}
            modal
            footer={footerContent}
            draggable={false}
        >
            <form id="product-form" onSubmit={handleSubmit} className="p-fluid grid p-6">
                {/* ID */}
                {isEditMode && (
                    <div className="field col-12">
                        <label htmlFor="proId">ID</label>
                        <InputText id="proId" value={formData.proId.toString()} disabled />
                    </div>
                )}

                {/* CODIGO */}
                <div className="field col-6">
                    <label htmlFor="proCodigo">Código</label>
                    <InputText
                        id="proCodigo"
                        name="proCodigo"
                        value={formData.proCodigo}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* NOMBRE */}
                <div className="field col-6">
                    <label htmlFor="proNombre">Nombre</label>
                    <InputText
                        id="proNombre"
                        name="proNombre"
                        value={formData.proNombre}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* LOTE_NUMERO */}
                <div className="field col-6">
                    <label htmlFor="proLoteNumero">Lote</label>
                    <InputText
                        id="proLoteNumero"
                        name="proLoteNumero"
                        value={formData.proLoteNumero}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* FECHA_INGRESO */}
                <div className="field col-6">
                    <label htmlFor="proFechaIngreso">Fecha Ingreso</label>
                    {/* Convertir string ISO (YYYY-MM-DD) a Date para el componente Calendar */}
                    <Calendar
                        id="proFechaIngreso"
                        name="proFechaIngreso"
                        value={formData.proFechaIngreso ? new Date(formData.proFechaIngreso) : null}
                        onChange={handleDateChange}
                        dateFormat="dd/mm/yy"
                        required
                    />
                </div>

                {/* PRECIO */}
                <div className="field col-6">
                    <label htmlFor="proPrecio">Precio</label>
                    <InputNumber
                        id="proPrecio"
                        name="proPrecio"
                        value={formData.proPrecio}
                        onValueChange={(e) => handleChange({ name: 'proPrecio', value: e.value || 0 })}
                        mode="currency"
                        currency="USD"
                        locale="es-EC"
                        minFractionDigits={2}
                        required
                    />
                </div>

                {/* STOCK */}
                <div className="field col-6">
                    <label htmlFor="proStock">Stock</label>
                    <InputNumber
                        id="proStock"
                        name="proStock"
                        value={formData.proStock}
                        onValueChange={(e) => handleChange({ name: 'proStock', value: e.value || 0 })}
                        mode="decimal"
                        showButtons
                        min={0}
                        max={999999}
                        required
                    />
                </div>
            </form>
        </Dialog>
    );
};

export default CreateEditProductModal;