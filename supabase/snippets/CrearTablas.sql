-- Crear la base de datos (Ejecutar por separado si es necesario)
-- CREATE DATABASE jessburger_db1;
-- \c jessburger_db1;

-- ======================================
-- TABLA USUARIO
-- ======================================
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    tipo_usuario BOOLEAN NOT NULL
);

-- ======================================
-- TABLA PROVEEDOR
-- ======================================
CREATE TABLE proveedor (
    id_proveedor SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    direccion VARCHAR(150)
);

-- ======================================
-- TABLA INGREDIENTE
-- ======================================
CREATE TABLE ingrediente (
    id_ingrediente SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    unidad_medida VARCHAR(20) DEFAULT 'unidad',
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL
);

-- ======================================
-- TABLA DETALLE COMPRA
-- ======================================
CREATE TABLE detalle_compra (
    id_detalle_compra SERIAL PRIMARY KEY,
    fecha DATE,
    total DECIMAL(10,2), -- Se agregó precisión
    id_proveedor INT NOT NULL,
    id_ingrediente INT NOT NULL,
    CONSTRAINT fk_proveedor FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor),
    CONSTRAINT fk_ingrediente FOREIGN KEY (id_ingrediente) REFERENCES ingrediente(id_ingrediente)
);

-- ======================================
-- TABLA CATEGORIA
-- ======================================
CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- ======================================
-- TABLA PRODUCTO
-- ======================================
CREATE TABLE producto (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    id_categoria INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);

-- ======================================
-- TABLA PRODUCTO_INGREDIENTE
-- ======================================
CREATE TABLE producto_ingrediente (
    id_producto INT,
    id_ingrediente INT,
    cantidad_usada INT NOT NULL,
    PRIMARY KEY (id_producto, id_ingrediente),
    CONSTRAINT fk_prod_ing_producto FOREIGN KEY (id_producto) REFERENCES producto(id_producto),
    CONSTRAINT fk_prod_ing_ingrediente FOREIGN KEY (id_ingrediente) REFERENCES ingrediente(id_ingrediente)
);

-- ======================================
-- TABLA PEDIDO
-- ======================================
-- En PostgreSQL, los ENUM se definen como tipos personalizados
CREATE TYPE tipo_pedido AS ENUM ('local', 'domicilio');
CREATE TYPE metodo_pago_tipo AS ENUM ('efectivo', 'tarjeta', 'transferencia');

CREATE TABLE pedido (
    id_pedido SERIAL PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo tipo_pedido NOT NULL,
    costo_domicilio DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    metodo_pago metodo_pago_tipo NOT NULL,
    servicio_mesa DECIMAL(10,2) NOT NULL,
    id_usuario INT NOT NULL,
    CONSTRAINT fk_usuario_pedido FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- ======================================
-- TABLA DETALLE_PEDIDO
-- ======================================
CREATE TABLE detalle_pedido (
    id_detalle SERIAL PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_pedido_detalle FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido),
    CONSTRAINT fk_producto_detalle FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

-- ======================================
-- TABLA MOVIMIENTO_INVENTARIO
-- ======================================
CREATE TYPE tipo_movimiento AS ENUM ('entrada', 'salida');

CREATE TABLE movimiento_inventario (
    id_movimiento SERIAL PRIMARY KEY,
    tipo tipo_movimiento NOT NULL,
    cantidad INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_pedido INT, -- Quitamos NOT NULL por si la entrada viene de compra
    id_detalle_compra INT, -- Quitamos NOT NULL por si la salida es por pedido
    id_ingrediente INT NOT NULL,
    CONSTRAINT fk_mov_pedido FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido),
    CONSTRAINT fk_mov_compra FOREIGN KEY (id_detalle_compra) REFERENCES detalle_compra(id_detalle_compra),
    CONSTRAINT fk_mov_ingrediente FOREIGN KEY (id_ingrediente) REFERENCES ingrediente(id_ingrediente)
);