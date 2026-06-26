// Esperar a que el formulario se cargue
document.addEventListener('DOMContentLoaded', function() {
    
    const formulario = document.getElementById('formularioLogin');
    
    formulario.addEventListener('submit', async function(evento) {
        evento.preventDefault();
        
        const correo = document.getElementById('correo').value;
        const contrasena = document.getElementById('contrasena').value;
        
        console.log('Intentando login con:', correo);
        
        // AQUÍ irá la lógica de login 
        alert('Función de login en desarrollo...\n\nPor ahora, ve a registro.html para probar el registro.');
        
    });
    
});