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
    const [errors, setErrors] = useState<Record<string, string>>({});
    const productMutation = useProductMutation();
    const queryClient = useQueryClient();

    // Fecha máxima permitida (hoy)
    const maxDate = new Date();


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
        
        // Validar que no sea fecha futura
        if (e.value && new Date(e.value) > maxDate) {
            setErrors(prev => ({ ...prev, proFechaIngreso: 'La fecha no puede ser futura' }));
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.proFechaIngreso;
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validar código
        if (!formData.proCodigo.trim()) {
            newErrors.proCodigo = 'El código es requerido';
        } else if (formData.proCodigo.length < 3) {
            newErrors.proCodigo = 'El código debe tener al menos 3 caracteres';
        } else if (formData.proCodigo.length > 50) {
            newErrors.proCodigo = 'El código no puede exceder 50 caracteres';
        }

        // Validar nombre
        if (!formData.proNombre.trim()) {
            newErrors.proNombre = 'El nombre es requerido';
        } else if (formData.proNombre.length < 3) {
            newErrors.proNombre = 'El nombre debe tener al menos 3 caracteres';
        } else if (formData.proNombre.length > 100) {
            newErrors.proNombre = 'El nombre no puede exceder 100 caracteres';
        }

        // Validar lote
        if (!formData.proLoteNumero.trim()) {
            newErrors.proLoteNumero = 'El número de lote es requerido';
        } else if (formData.proLoteNumero.length < 3) {
            newErrors.proLoteNumero = 'El lote debe tener al menos 3 caracteres';
        } else if (formData.proLoteNumero.length > 50) {
            newErrors.proLoteNumero = 'El lote no puede exceder 50 caracteres';
        }

        // Validar fecha
        if (!formData.proFechaIngreso) {
            newErrors.proFechaIngreso = 'La fecha de ingreso es requerida';
        } else {
            const selectedDate = new Date(formData.proFechaIngreso);
            if (selectedDate > maxDate) {
                newErrors.proFechaIngreso = 'La fecha no puede ser futura';
            }
        }

        // Validar precio
        if (formData.proPrecio === null || formData.proPrecio === undefined) {
            newErrors.proPrecio = 'El precio es requerido';
        } else if (formData.proPrecio <= 0) {
            newErrors.proPrecio = 'El precio debe ser mayor a 0';
        } else if (formData.proPrecio > 99999999.99) {
            newErrors.proPrecio = 'El precio excede el límite permitido';
        }

        // Validar stock
        if (formData.proStock === null || formData.proStock === undefined) {
            newErrors.proStock = 'El stock es requerido';
        } else if (formData.proStock < 1) {
            newErrors.proStock = 'El stock debe ser al menos 1';
        } else if (formData.proStock > 999999) {
            newErrors.proStock = 'El stock excede el límite permitido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar formulario antes de enviar
        if (!validateForm()) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Validación',
                detail: 'Por favor corrija los errores en el formulario',
                life: 3000
            });
            return;
        }

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
            setErrors({});
            onHide();
        } catch (error: unknown) {
            // Extraer el mensaje de error del backend
            let errorMessage = 'Error al guardar el producto';
            
            if (error && typeof error === 'object') {
                const err = error as { response?: { data?: { message?: string; Message?: string } }; message?: string };
                
                // Intentar obtener el mensaje del response del backend
                if (err.response?.data?.message) {
                    errorMessage = err.response.data.message;
                } else if (err.response?.data?.Message) {
                    errorMessage = err.response.data.Message;
                } else if (err.message) {
                    errorMessage = err.message;
                }
            }

            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: errorMessage,
                life: 4000
            });
        }
    };

    const footerContent = (
        <div className="flex flex-wrap justify-content-end gap-2 mt-3 px-3 pb-2">
            <Button
                label="Cancelar"
                icon="pi pi-times"
                iconPos="left"
                onClick={onHide}
                severity="secondary"
                disabled={productMutation.isPending}
                className="flex-grow-1 sm:flex-grow-0"
                style={{
                    padding: '0.75rem 1.25rem',
                    fontSize: 'clamp(0.875rem, 2.5vw, 0.95rem)',
                    fontWeight: '600',
                    gap: '0.5rem'
                }}
            />
            <Button
                label={isEditMode ? "Guardar" : "Crear"}
                icon="pi pi-check"
                iconPos="left"
                type="submit"
                form="product-form"
                disabled={productMutation.isPending}
                className="flex-grow-1 sm:flex-grow-0"
                style={{
                    padding: '0.75rem 1.25rem',
                    fontSize: 'clamp(0.875rem, 2.5vw, 0.95rem)',
                    fontWeight: '600',
                    gap: '0.5rem',
                    background: 'linear-gradient(135deg, #E4007C 0%, #B8005F 100%)',
                    border: 'none',
                    color: 'white'
                }}
            />
        </div>
    );


    return (
        <Dialog
            header={dialogHeader}
            visible={visible}
            style={{
                width: '90vw',
                maxWidth: '650px'
            }}
            onHide={onHide}
            modal
            footer={footerContent}
            draggable={false}
            breakpoints={{ '960px': '75vw', '640px': '95vw' }}
        >
            <form id="product-form" onSubmit={handleSubmit} className="p-fluid grid" style={{ padding: '1.5rem 1rem' }}>
                {/* ID */}
                {isEditMode && (
                    <div className="field col-12">
                        <label htmlFor="proId" style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                            ID
                        </label>
                        <InputText
                            id="proId"
                            value={formData.proId.toString()}
                            disabled
                            style={{ fontSize: '0.95rem' }}
                        />
                    </div>
                )}

                {/* CODIGO */}
                <div className="field col-12 md:col-6">
                    <label htmlFor="proCodigo" style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Código <span style={{ color: '#E4007C' }}>*</span>
                    </label>
                    <InputText
                        id="proCodigo"
                        name="proCodigo"
                        value={formData.proCodigo}
                        onChange={handleChange}
                        required
                        style={{ fontSize: '0.95rem', padding: '0.75rem' }}
                        placeholder="Ej: PROD-001"
                        className={errors.proCodigo ? 'p-invalid' : ''}
                    />
                    {errors.proCodigo && <small className="p-error">{errors.proCodigo}</small>}
                </div>

                {/* NOMBRE */}
                <div className="field col-12 md:col-6">
                    <label htmlFor="proNombre" style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Nombre <span style={{ color: '#E4007C' }}>*</span>
                    </label>
                    <InputText
                        id="proNombre"
                        name="proNombre"
                        value={formData.proNombre}
                        onChange={handleChange}
                        required
                        style={{ fontSize: '0.95rem', padding: '0.75rem' }}
                        placeholder="Ej: Laptop HP"
                        className={errors.proNombre ? 'p-invalid' : ''}
                    />
                    {errors.proNombre && <small className="p-error">{errors.proNombre}</small>}
                </div>

                {/* LOTE_NUMERO */}
                <div className="field col-12 md:col-6">
                    <label htmlFor="proLoteNumero" style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Número de Lote <span style={{ color: '#E4007C' }}>*</span>
                    </label>
                    <InputText
                        id="proLoteNumero"
                        name="proLoteNumero"
                        value={formData.proLoteNumero}
                        onChange={handleChange}
                        required
                        style={{ fontSize: '0.95rem', padding: '0.75rem' }}
                        placeholder="Ej: LOTE-2024-001"
                        className={errors.proLoteNumero ? 'p-invalid' : ''}
                    />
                    {errors.proLoteNumero && <small className="p-error">{errors.proLoteNumero}</small>}
                </div>

                {/* FECHA_INGRESO */}
                <div className="field col-12 md:col-6">
                    <label htmlFor="proFechaIngreso" style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Fecha de Ingreso <span style={{ color: '#E4007C' }}>*</span>
                    </label>
                    <Calendar
                        id="proFechaIngreso"
                        name="proFechaIngreso"
                        value={formData.proFechaIngreso ? new Date(formData.proFechaIngreso) : null}
                        onChange={handleDateChange}
                        dateFormat="dd/mm/yy"
                        maxDate={maxDate}
                        required
                        className={errors.proFechaIngreso ? 'w-full p-invalid' : 'w-full'}
                        inputStyle={{ fontSize: '0.95rem', padding: '0' }}
                        placeholder="Seleccione fecha"
                        showIcon
                    />
                    {errors.proFechaIngreso && <small className="p-error">{errors.proFechaIngreso}</small>}
                </div>

                {/* PRECIO */}
                <div className="field col-12 md:col-6">
                    <label htmlFor="proPrecio" style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Precio (USD) <span style={{ color: '#E4007C' }}>*</span>
                    </label>
                    <InputNumber
                        id="proPrecio"
                        name="proPrecio"
                        value={formData.proPrecio}
                        onValueChange={(e) => handleChange({ name: 'proPrecio', value: e.value || 0 })}
                        mode="currency"
                        currency="USD"
                        locale="es-EC"
                        minFractionDigits={2}
                        min={0.01}
                        max={99999999.99}
                        required
                        inputStyle={{ fontSize: '0.95rem', padding: '0.75rem' }}
                        placeholder="0.00"
                        className={errors.proPrecio ? 'p-invalid' : ''}
                    />
                    {errors.proPrecio && <small className="p-error">{errors.proPrecio}</small>}
                </div>

                {/* STOCK */}
                <div className="field col-12 md:col-6">
                    <label htmlFor="proStock" style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Stock <span style={{ color: '#E4007C' }}>*</span>
                    </label>
                    <InputNumber
                        id="proStock"
                        name="proStock"
                        value={formData.proStock}
                        onValueChange={(e) => handleChange({ name: 'proStock', value: e.value || 1 })}
                        mode="decimal"
                        showButtons
                        min={1}
                        max={999999}
                        required
                        inputStyle={{ fontSize: '0.95rem', padding: '0.75rem' }}
                        placeholder="1"
                        className={errors.proStock ? 'p-invalid' : ''}
                    />
                    {errors.proStock && <small className="p-error">{errors.proStock}</small>}
                </div>
            </form>
        </Dialog>
    );
};

export default CreateEditProductModal;