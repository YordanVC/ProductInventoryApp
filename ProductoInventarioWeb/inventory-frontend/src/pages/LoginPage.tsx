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
                overflow: 'hidden',
                padding: '1rem'
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
                className="w-full fade-in"
                style={{
                    maxWidth: '480px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    borderRadius: '16px',
                    zIndex: 1,
                    background: 'white',
                    margin: '0 auto'
                }}
            >
                <div className="text-center mb-5" style={{ padding: '1.5rem 1rem 0.5rem' }}>
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
                    <h1
                        className="font-bold"
                        style={{
                            color: '#E4007C',
                            marginBottom: '0.5rem',
                            fontSize: 'clamp(1.5rem, 5vw, 2rem)'
                        }}
                    >
                        Sistema de Inventario
                    </h1>
                    <p
                        className="text-gray-600 mt-2"
                        style={{
                            fontSize: 'clamp(0.875rem, 3vw, 0.95rem)',
                            fontWeight: '500'
                        }}
                    >
                        Banco Guayaquil
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-fluid" style={{ padding: '0 1.5rem 1.5rem' }}>
                    <div className="field mb-4">
                        <label
                            htmlFor="username"
                            className="block mb-2 font-semibold"
                            style={{
                                color: '#2C2C2C',
                                fontSize: '0.95rem'
                            }}
                        >
                            Usuario
                        </label>
                        <InputText
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Ingrese su usuario"
                            required
                            autoFocus
                            className="w-full"
                            style={{
                                padding: '0.75rem',
                                fontSize: '0.95rem'
                            }}
                        />
                    </div>

                    <div className="field mb-4">
                        <label
                            htmlFor="password"
                            className="block mb-2 font-semibold"
                            style={{
                                color: '#2C2C2C',
                                fontSize: '0.95rem'
                            }}
                        >
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
                            className="w-full"
                            inputStyle={{
                                padding: '0.75rem',
                                fontSize: '0.95rem'
                            }}
                        />
                    </div>

                    <Button
                        type="submit"
                        label="Iniciar Sesión"
                        icon="pi pi-sign-in"
                        iconPos="left"
                        loading={loading}
                        className="w-full mt-4"
                        style={{
                            padding: '0.875rem',
                            fontSize: 'clamp(0.95rem, 3vw, 1.1rem)',
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            gap: '0.5rem',
                            background: 'linear-gradient(135deg, #E4007C 0%, #B8005F 100%)',
                            border: 'none',
                            color: 'white'
                        }}
                    />
                </form>
            </Card>
        </div>
    );
};

export default LoginPage;