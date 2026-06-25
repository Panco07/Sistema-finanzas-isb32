// Cargar variables de entorno
require('dotenv').config();

// Importar librerías
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

// Configurar aplicación
const app = express();

// Middlewares (deben ir ANTES de las rutas)
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Crear conexión a la base de datos
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    port: process.env.DB_PORT || 3306,  // ← Puerto 3306
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'finanzas_personales'
});

// Conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err.message);
        return;
    }
    console.log('Conectado exitosamente a la base de datos: ' + process.env.DB_NAME);
});

// RUTA DE PRUEBA - Esta debe funcionar primero
app.get('/', (req, res) => {
    res.send('¡El servidor de Oscar está funcionando correctamente!');
});

// RUTA: Obtener todos los usuarios
app.get('/api/usuarios', (req, res) => {
    console.log('Solicitud recibida: GET /api/usuarios');
    
    const sql = 'SELECT id, nombre_completo, apodo_digital, cedula FROM Usuarios';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err.message);
            return res.status(500).json({ 
                error: 'Error en la base de datos',
                message: err.message 
            });
        }
        
        console.log('Usuarios encontrados:', results.length);
        res.json(results);
    });
});

// RUTA: Registrar nuevo usuario
app.post('/api/registro', async (req, res) => {
    console.log('Solicitud POST recibida: /api/registro');
    console.log('Datos del body:', req.body);
    
    const { nombre, cedula, apodo, telefono, password } = req.body;
    
    // Validar campos obligatorios
    if (!nombre || !cedula || !apodo || !password) {
        console.log('Campos incompletos');
        return res.status(400).json({ 
            error: 'Todos los campos obligatorios son requeridos' 
        });
    }
    
    try {
        // Encriptar contraseña
        const bcrypt = require('bcryptjs');
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);
        
        console.log('Contraseña encriptada correctamente');
        
        // Query de inserción
        const sql = `INSERT INTO Usuarios 
                     (nombre_completo, cedula, apodo_digital, telefono, password_hash) 
                     VALUES (?, ?, ?, ?, ?)`;
        
        const values = [nombre, cedula, apodo, telefono || '', hash];
        
        console.log('Ejecutando INSERT en la base de datos...');
        
        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error en la base de datos:', err.message);
                console.error('Código de error:', err.code);
                
                // Verificar si es cédula duplicada
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ 
                        error: 'La cédula ya está registrada en el sistema' 
                    });
                }
                
                return res.status(500).json({ 
                    error: 'Error al registrar usuario',
                    detalle: err.message 
                });
            }
            
            console.log('✅ Usuario registrado exitosamente con ID:', result.insertId);
            res.status(201).json({ 
                mensaje: 'Usuario registrado exitosamente',
                id: result.insertId,
                cedula: cedula
            });
        });
        
    } catch (error) {
        console.error('Error en el servidor:', error.message);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            detalle: error.message 
        });
    }
});

// Página de registro
app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/registro.html'));
});

// Página de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

// Redirigir raíz al login
app.get('/', (req, res) => {
    res.redirect('/registro');
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Puerto: ${PORT}`);
});