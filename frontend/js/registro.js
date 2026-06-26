// Esperar a que el formulario se cargue
document.addEventListener('DOMContentLoaded', function() {
    
    // Tener el formulario
    const formulario = document.getElementById('formularioRegistro');
    
    // Escuchar cuando se envíe el formulario
    formulario.addEventListener('submit', async function(evento) {
        
        // Para prevenir que la página se recargue
        evento.preventDefault();
        
        // Se obtienen los valores de los campos
        const datos = {
            nombre: document.getElementById('nombre').value,
            cedula: document.getElementById('cedula').value,
            apodo: document.getElementById('apodo').value,
            telefono: document.getElementById('telefono').value,
            password: document.getElementById('password').value
        };
        
        // Mostrar en consola (para pruebas)
        console.log('Datos a enviar:', datos);
        
        // AQUÍ CONECTAREMOS CON EL BACKEND (lo haremos en el Paso 7)
        try {
            const respuesta = await fetch('http://localhost:3000/api/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });
            
            const resultado = await respuesta.json();
            
            if (respuesta.ok) {
                alert(resultado.mensaje);
                formulario.reset(); // Limpiar formulario
                // Redirigir al login después de 2 segundos
                setTimeout(function() {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                alert('Error: ' + resultado.error);
            }
            
        } catch (error) {
            console.error('Error:', error);
            alert('Error de conexión con el servidor. Asegúrate de que el backend esté corriendo.');
        }
        
    });
    
});