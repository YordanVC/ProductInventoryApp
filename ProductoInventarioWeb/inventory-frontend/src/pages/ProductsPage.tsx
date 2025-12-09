import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import ProductsTable from '../tables/ProductsTable';
import CreateEditProductModal from '../components/CreateEditProductModal';
import type { ProductResponse } from '../types/dtos';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';

const ProductsPage: React.FC = () => {
    const [estadoFilter, setEstadoFilter] = useState<{ name: string; code: 'A' | 'I' | '' }>({ name: 'Todos', code: '' });
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
    const toast = useRef<Toast>(null);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const estadoOptions: { name: string; code: 'A' | 'I' | '' }[] = [
        { name: 'Todos', code: '' },
        { name: 'Activos', code: 'A' },
        { name: 'Inactivos', code: 'I' }
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const openCreateModal = () => {
        setSelectedProduct(null);
        setModalVisible(true);
    };

    const openEditModal = (product: ProductResponse) => {
        setSelectedProduct(product);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedProduct(null);
    };

    return (
        <div className="app-container fade-in" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F5F5F5 0%, #E8E8E8 100%)' }}>
            <Toast ref={toast} />

            {/* Header con gradiente */}
            <div className="page-header">
                <div className="flex justify-content-between align-items-center flex-wrap gap-3">
                    <div className="flex-grow-1">
                        <h1
                            className="font-bold m-0"
                            style={{
                                color: 'white',
                                fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
                                marginBottom: '0.5rem'
                            }}
                        >
                            Gestión de Productos
                        </h1>
                        <p
                            className="m-0"
                            style={{
                                color: 'rgba(255,255,255,0.95)',
                                fontSize: 'clamp(0.875rem, 3vw, 1.1rem)',
                                fontWeight: '500'
                            }}
                        >
                            Sistema de Inventario - Banco Guayaquil
                        </p>
                    </div>
                    <Button
                        label="Cerrar Sesión"
                        icon="pi pi-sign-out"
                        iconPos="left"
                        className="p-button-outlined"
                        style={{
                            background: 'white',
                            color: '#E4007C',
                            borderColor: 'white',
                            fontWeight: 'bold',
                            padding: '0.75rem 1.25rem',
                            fontSize: 'clamp(0.875rem, 2.5vw, 1rem)',
                            whiteSpace: 'nowrap',
                            gap: '0.5rem'
                        }}
                        onClick={handleLogout}
                    />
                </div>
            </div>

            {/* Card de controles */}
            <div className="card-custom mb-4">
                <div className="flex flex-wrap justify-content-between align-items-center gap-3">
                    <div className="flex flex-wrap gap-3 align-items-center w-full md:w-auto">
                        <Button
                            label="Nuevo Producto"
                            icon="pi pi-plus"
                            iconPos="left"
                            severity="success"
                            onClick={openCreateModal}
                            className="flex-grow-1 md:flex-grow-0"
                            style={{
                                fontSize: 'clamp(0.95rem, 2.5vw, 1rem)',
                                padding: '0.75rem 1.25rem',
                                fontWeight: '600',
                                background: 'linear-gradient(135deg, #E4007C 0%, #B8005F 100%)',
                                border: 'none',
                                color: 'white',
                                boxShadow: '0 3px 10px rgba(228, 0, 124, 0.25)',
                                transition: 'all 0.3s ease',
                                borderRadius: '8px',
                                gap: '0.5rem'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 5px 15px rgba(228, 0, 124, 0.35)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 3px 10px rgba(228, 0, 124, 0.25)';
                            }}
                        />
                        <Dropdown
                            value={estadoFilter}
                            options={estadoOptions}
                            onChange={(e) => setEstadoFilter(e.value)}
                            optionLabel="name"
                            placeholder="Filtrar por estado"
                            className="w-full md:w-auto"
                            style={{
                                minWidth: '200px',
                                fontSize: 'clamp(0.875rem, 2.5vw, 0.95rem)'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Card de tabla */}
            <div className="card-custom">
                <ProductsTable
                    estadoFilter={estadoFilter.code}
                    onEdit={openEditModal}
                    toast={toast}
                />
            </div>

            <CreateEditProductModal
                visible={modalVisible}
                onHide={closeModal}
                product={selectedProduct}
                toast={toast}
            />
        </div>
    );
};

export default ProductsPage;