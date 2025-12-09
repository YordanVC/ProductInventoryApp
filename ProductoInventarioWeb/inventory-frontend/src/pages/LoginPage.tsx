import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import { useAuth } from '../components/AuthProvider';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const toast = React.useRef<Toast>(null);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(username, password);
            toast.current?.show({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Inicio de sesión exitoso'
            });
            setTimeout(() => navigate('/products'), 500);
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'Credenciales inválidas'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="flex align-items-center justify-content-center min-h-screen"
            style={{
                background: 'linear-gradient(135deg, #E4007C 0%, #B8005F 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Decorative circles */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                right: '-5%',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                filter: 'blur(80px)'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                left: '-5%',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                filter: 'blur(80px)'
            }} />

            <Toast ref={toast} />
            <Card
                className="w-full max-w-md p-4"
                style={{
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    borderRadius: '16px',
                    zIndex: 1,
                    background: 'white'
                }}
            >
                <div className="text-center mb-5">
                    {/* Logo/Icono */}
                    <div
                        className="mb-3"
                        style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto',
                            background: 'linear-gradient(135deg, #E4007C 0%, #B8005F 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 20px rgba(228, 0, 124, 0.3)'
                        }}
                    >
                        <i className="pi pi-shopping-cart" style={{ fontSize: '2.5rem', color: 'white' }}></i>
                    </div>
                    <h1 className="text-3xl font-bold" style={{ color: '#E4007C', marginBottom: '0.5rem' }}>
                        Sistema de Inventario
                    </h1>
                    <p className="text-gray-600 mt-2" style={{ fontSize: '0.95rem' }}>
                        Banco Guayaquil
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-fluid">
                    <div className="field mb-4">
                        <label htmlFor="username" className="block mb-2 font-semibold" style={{ color: '#2C2C2C' }}>
                            Usuario
                        </label>
                        <InputText
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ingrese su usuario"
                            required
                            autoFocus
                            style={{ borderColor: '#E4007C' }}
                        />
                    </div>

                    <div className="field mb-4">
                        <label htmlFor="password" className="block mb-2 font-semibold" style={{ color: '#2C2C2C' }}>
                            Contraseña
                        </label>
                        <Password
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingrese su contraseña"
                            toggleMask
                            feedback={false}
                            required
                            style={{ borderColor: '#E4007C' }}
                        />
                    </div>

                    <Button
                        type="submit"
                        label="Iniciar Sesión"
                        icon="pi pi-sign-in"
                        loading={loading}
                        severity="success"
                        className="w-full mt-3"
                        style={{
                            padding: '0.75rem',
                            fontSize: '1.1rem',
                            fontWeight: 'bold'
                        }}
                    />
                </form>
            </Card>
        </div>
    );
};

export default LoginPage;