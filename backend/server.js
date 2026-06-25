// 1. Cargar las variables de entorno (la contraseña y datos de la BD)
require('dotenv').config();

// 2. Importar las librerías que instalamos
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// 3. Configurar la aplicación
const app = express();
app.use(cors()); // Permitir conexiones desde el frontend
app.use(express.json()); // Permitir que el servidor entienda datos en formato JSON

// 4. Crear la conexión a tu base de datos MariaDB
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// 5. Intentar conectar a la base de datos
db.connect((err) => {
    if (err) {
        console.error(' Error conectando a la base de datos:', err.message);
        return;
    }
    console.log('Conectado exitosamente a la base de datos: ' + process.env.DB_NAME);
});

// 6. Crear una ruta de prueba (para saber si el servidor funciona)
app.get('/', (req, res) => {
    res.send('¡El servidor de Oscar está funcionando correctamente! ');
});

// 7. Crear una ruta para probar la conexión con la BD (Ejemplo: Obtener usuarios)
app.get('/api/usuarios', (req, res) => {
    const sql = 'SELECT id, nombre_completo, apodo_digital FROM Usuarios';
    
    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        res.json(results); // Enviar los datos de la BD al frontend
    });
});

// ENDPOINT: Registrar nuevo usuario
app.post('/api/registro', async (req, res) => {
    const { nombre, cedula, apodo, telefono, password } = req.body;
    
    // Validar que todos los campos estén presentes
    if (!nombre || !cedula || !apodo || !password) {
        return res.status(400).json({ 
            error: 'Todos los campos obligatorios son requeridos' 
        });
    }
    
    try {
        // Encriptar la contraseña (usando bcrypt)
        const bcrypt = require('bcryptjs');
        const hash = await bcrypt.hash(password, 10);
        
        // Query SQL para insertar el usuario
        const sql = `INSERT INTO Usuarios 
                     (nombre_completo, cedula, apodo_digital, telefono, password_hash) 
                     VALUES (?, ?, ?, ?, ?)`;
        
        db.query(sql, [nombre, cedula, apodo, telefono, hash], (err, result) => {
            if (err) {
                // Si el error es por cédula duplicada
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ 
                        error: 'La cédula ya está registrada' 
                    });
                }
                return res.status(500).json({ 
                    error: 'Error en la base de datos: ' + err.message 
                });
            }
            
            res.status(201).json({ 
                mensaje: 'Usuario registrado exitosamente',
                id: result.insertId
            });
        });
        
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor' 
        });
    }
});

// 8. Encender el servidor en el puerto 3000
const PORT = process.env.PORT || 3306;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});