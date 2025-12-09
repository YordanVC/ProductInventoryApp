CREATE DATABASE productos_bg;
use productos_bg;

-- 1. Tabla de Usuarios 
CREATE TABLE USUARIOS (
    ID INT PRIMARY KEY IDENTITY(1,1),
    USERNAME VARCHAR(50) NOT NULL UNIQUE,
	PASSWORD_HASH VARCHAR(255) NOT NULL,
    NOMBRE VARCHAR(100) NOT NULL,
    EMAIL VARCHAR(100) NOT NULL,
    ESTADO CHAR(1) NOT NULL DEFAULT 'A', -- 'A': Activo, 'I': Inactivo
    FECHA_CREACION DATETIME NOT NULL DEFAULT GETDATE(),
);

-- 2. Tabla de Productos
CREATE TABLE PRODUCTOS (
    ID INT PRIMARY KEY IDENTITY(1,1),
    CODIGO VARCHAR(50) NOT NULL UNIQUE, -- Código de producto
    NOMBRE VARCHAR(100) NOT NULL,
    LOTE_NUMERO VARCHAR(50) NOT NULL, 
    FECHA_INGRESO DATE NOT NULL,      
    PRECIO DECIMAL(10, 2) NOT NULL,  
    STOCK INT NOT NULL,             
    ESTADO CHAR(1) NOT NULL DEFAULT 'A', -- 'A': Activo, 'I': Inactivo (Borrado Lógico)
    
    -- Campos de audditoria
    FECHA_CREACION DATETIME NOT NULL DEFAULT GETDATE(),
    USUARIO_CREACION INT NOT NULL,
    FECHA_MODIFICACION DATETIME NULL,
    USUARIO_MODIFICACION INT NULL,
    
    -- Llave Foránea para Trazabilidad
    FOREIGN KEY (USUARIO_CREACION) REFERENCES USUARIOS(ID),
    FOREIGN KEY (USUARIO_MODIFICACION) REFERENCES USUARIOS(ID)
);

ALTER TABLE PRODUCTOS 
ADD CONSTRAINT UQ_LOTE_NUMERO UNIQUE (LOTE_NUMERO);

-- Stored Procedure para el Mantenimiento de Productos
-- Verificar y eliminar el SP si existe para poder recrearlo con la corrección
IF OBJECT_ID('SP_MANTENIMIENTO_PRODUCTOS') IS NOT NULL
    DROP PROCEDURE SP_MANTENIMIENTO_PRODUCTOS;
GO

CREATE PROCEDURE SP_MANTENIMIENTO_PRODUCTOS
(
    -- Parámetro de accion
    @ACCION CHAR(2),
    
    -- Parámetros de Producto
    @PRO_ID INT = NULL,
    @PRO_CODIGO VARCHAR(50) = NULL,
    @PRO_NOMBRE VARCHAR(100) = NULL,
    @PRO_LOTE_NUMERO VARCHAR(50) = NULL,
    @PRO_FECHA_INGRESO DATE = NULL,
    @PRO_PRECIO DECIMAL(10, 2) = NULL,
    @PRO_STOCK INT = NULL,
    @PRO_ESTADO CHAR(1) = NULL, 

    @USER_ID INT -- Usuario que ejecuta la acción
)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CODE INT = 200;
    DECLARE @MESSAGE VARCHAR(255) = '';
    DECLARE @PRODUCT_ID INT;

    -- ==========================================================
    -- CONSULTA DE PRODUCTOS ('CP') 
    -- ==========================================================
    IF @ACCION = 'CP'
    BEGIN
        SELECT 
            ID, 
            CODIGO, 
            NOMBRE, 
            LOTE_NUMERO, 
            FECHA_INGRESO, 
            PRECIO, 
            STOCK, 
            ESTADO,
            FECHA_CREACION,
            USUARIO_CREACION,
            FECHA_MODIFICACION,
            USUARIO_MODIFICACION
        FROM 
            PRODUCTOS 
        WHERE 
            (@PRO_ESTADO IS NULL OR ESTADO = @PRO_ESTADO)
            AND (@PRO_ID IS NULL OR ID = @PRO_ID)
            AND (@PRO_CODIGO IS NULL OR CODIGO = @PRO_CODIGO) 
        ORDER BY 
            CODIGO, FECHA_INGRESO DESC; -- Ordenar por código y fecha
        
        SET @MESSAGE = 'Consulta exitosa.';
        SELECT @CODE AS Code, @MESSAGE AS Message, NULL AS Data; 
        RETURN;
    END

    -- ==========================================================
    -- INSERTAR PRODUCTO ('IP')
    -- ==========================================================
    IF @ACCION = 'IP'
    BEGIN
        BEGIN TRANSACTION;
        BEGIN TRY
            IF @PRO_CODIGO IS NULL OR @PRO_NOMBRE IS NULL OR @PRO_LOTE_NUMERO IS NULL OR @PRO_FECHA_INGRESO IS NULL OR @PRO_PRECIO IS NULL OR @PRO_STOCK IS NULL
            BEGIN
                SET @CODE = 400;
                SET @MESSAGE = 'Faltan parámetros requeridos para la inserción.';
                ROLLBACK TRANSACTION;
            END
            ELSE
            BEGIN
                INSERT INTO PRODUCTOS (
                    CODIGO, NOMBRE, LOTE_NUMERO, FECHA_INGRESO, PRECIO, STOCK, USUARIO_CREACION
                )
                VALUES (
                    @PRO_CODIGO, @PRO_NOMBRE, @PRO_LOTE_NUMERO, @PRO_FECHA_INGRESO, @PRO_PRECIO, @PRO_STOCK, @USER_ID
                );
                
                SET @PRODUCT_ID = SCOPE_IDENTITY(); -- Captura el ID del producto insertado
                SET @MESSAGE = 'Producto insertado exitosamente. ID: ' + CAST(@PRODUCT_ID AS VARCHAR(10));
                COMMIT TRANSACTION;
            END
        END TRY
        BEGIN CATCH
            IF @@TRANCOUNT > 0
                ROLLBACK TRANSACTION;
            
            SET @CODE = 500;
            SET @MESSAGE = 'Error al insertar: ' + ERROR_MESSAGE();
        END CATCH
    END

    -- ==========================================================
    -- ACTUALIZAR PRODUCTO ('UP') 
    -- ==========================================================
    ELSE IF @ACCION = 'UP'
    BEGIN
        BEGIN TRANSACTION;
        BEGIN TRY
            IF @PRO_ID IS NULL
            BEGIN
                SET @CODE = 400;
                SET @MESSAGE = 'Se requiere el ID del producto para actualizar.';
                ROLLBACK TRANSACTION;
            END
            ELSE
            BEGIN
                UPDATE PRODUCTOS
                SET
                    CODIGO = ISNULL(@PRO_CODIGO, CODIGO),
                    NOMBRE = ISNULL(@PRO_NOMBRE, NOMBRE),
                    LOTE_NUMERO = ISNULL(@PRO_LOTE_NUMERO, LOTE_NUMERO),
                    FECHA_INGRESO = ISNULL(@PRO_FECHA_INGRESO, FECHA_INGRESO),
                    PRECIO = ISNULL(@PRO_PRECIO, PRECIO),
                    STOCK = ISNULL(@PRO_STOCK, STOCK),
                    ESTADO = ISNULL(@PRO_ESTADO, ESTADO),
                    FECHA_MODIFICACION = GETDATE(),
                    USUARIO_MODIFICACION = @USER_ID
                WHERE 
                    ID = @PRO_ID; 
                    
                IF @@ROWCOUNT = 0
                BEGIN
                    SET @MESSAGE = 'Producto no encontrado.';
                    ROLLBACK TRANSACTION;
                END
                ELSE
                BEGIN
                    SET @MESSAGE = 'Producto actualizado exitosamente.';
                    COMMIT TRANSACTION;
                END
            END
        END TRY
        BEGIN CATCH
            IF @@TRANCOUNT > 0
                ROLLBACK TRANSACTION;
            
            SET @CODE = 500;
            SET @MESSAGE = 'Error al actualizar: ' + ERROR_MESSAGE();
        END CATCH
    END


    IF @ACCION <> 'CP'
    BEGIN
        SELECT @CODE AS Code, @MESSAGE AS Message, NULL AS Data;
    END
END
GO


-- Insertar nuevo usuario 'yordan' con la contraseña 'yordan123' hasheada
INSERT INTO USUARIOS (USERNAME, PASSWORD_HASH, NOMBRE, EMAIL, ESTADO)
VALUES 
(
    'yordan',
    '$2a$10$PjJ7m8p2G2H6XvA7Wp8v8u8V3p1W4V7P7M7Y4S2X8Y9L2V5E5C', 
    'Yordan Desarrollador', 
    'yordan@bg.com', 
    'A'
);
