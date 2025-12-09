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
        <div className="app-container" style={{ minHeight: '100vh' }}>
            <Toast ref={toast} />

            {/* Header con gradiente */}
            <div className="page-header">
                <div className="flex justify-content-between align-items-center">
                    <div>
                        <h1 className="text-4xl font-bold m-0" style={{ color: 'white' }}>Gestión de Productos</h1>
                        <p className="m-0 mt-2" style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>Sistema de Inventario - Banco Guayaquil</p>
                    </div>
                    <Button
                        label="Cerrar Sesión"
                        icon="pi pi-sign-out"
                        className="p-button-outlined p-4 gap-2"
                        style={{
                            background: 'white',
                            color: '#E4007C',
                            borderColor: 'white',
                            fontWeight: 'bold'
                        }}
                        onClick={handleLogout}
                    />
                </div>
            </div>

            {/* Card de controles */}
            <div className="card-custom mb-4">
                <div className="flex justify-content-between align-items-center gap-3">
                    <div className="flex gap-3 align-items-center">
                        <Button
                            label="Nuevo Producto"
                            icon="pi pi-plus"
                            className='p-3 color-withe'
                            severity="success"
                            onClick={openCreateModal}
                            style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}
                        />
                        <Dropdown
                            value={estadoFilter}
                            options={estadoOptions}
                            onChange={(e) => setEstadoFilter(e.value)}
                            optionLabel="name"
                            placeholder="Filtrar por estado"
                            className="w-full md:w-14rem"
                            style={{ borderColor: '#E4007C' }}
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