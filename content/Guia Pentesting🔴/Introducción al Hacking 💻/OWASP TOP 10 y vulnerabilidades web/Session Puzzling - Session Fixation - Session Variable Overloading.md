------
- Tags: #sesion #web
------
# Definición

> Session Puzzling, Session Fixation y Session Variable Overloading son diferentes nombres correspondientes a vulnerabilidades de seguridad que afectan la **gestión de sesiones** en una aplicación web.

La vulnerabilidad de **Session Fixation** se produce cuando un atacante establece un identificador de sesión válido para un usuario y luego espera a que el usuario inicie sesión. Si el usuario inicia sesión con ese identificador de sesión, el atacante podría acceder a la sesión del usuario y realizar acciones maliciosas en su nombre. Para lograr esto, el atacante puede engañar al usuario para que haga clic en un enlace que incluye un identificador de sesión válido o explotar una debilidad en la aplicación web para establecer el identificador de sesión.

El término “**Session Puzzling**” se utiliza a veces para referirse a la misma vulnerabilidad, pero desde el punto de vista del atacante que intenta **adivinar** o **generar identificadores** de sesión válidos.

Por último, el término “**Session Variable Overloading**” se refiere a un tipo específico de ataque de Session Fixation en el que el atacante envía una gran cantidad de datos a la aplicación web con el objetivo de sobrecargar las variables de sesión. Si la aplicación web no valida adecuadamente la cantidad de datos que se pueden almacenar en las variables de sesión, el atacante podría sobrecargarlas con datos maliciosos y causar problemas en el rendimiento de la aplicación.

Para prevenir estas vulnerabilidades, es importante utilizar identificadores de sesión aleatorios y seguros, validar la autenticación y autorización del usuario antes de establecer una sesión y limitar la cantidad de datos que se pueden almacenar en las variables de sesión.

------
### Enlace Malicioso

- **Preparación del Ataque:**
    
	 El atacante crea un enlace que contiene un identificador de sesión válido. Por ejemplo:

	- ``http://example.com/login?sessionid=123456``

- **Engaño al Usuario:**
    
    - El atacante envía este enlace al usuario, tal vez a través de un correo electrónico o un mensaje en una red social, haciéndole creer que es un enlace legítimo o de interés.
- **Inicio de Sesión:**
    
    - El usuario hace clic en el enlace y accede a la página de inicio de sesión del sitio web.
- **Autenticación:**
    
    - El usuario inicia sesión usando sus credenciales, pero el identificador de sesión (`123456`) ya ha sido establecido en la URL.
- **Acceso del Atacante:**
    
    - Ahora que el usuario ha iniciado sesión con ese identificador de sesión, el atacante puede usar el mismo identificador para acceder a la sesión del usuario y realizar acciones en su nombre.

------
### Uso de Parámetro en la URL

- **Preparación del Ataque:**
    
    - El atacante determina que el identificador de sesión puede ser manipulado a través de un parámetro en la URL, por ejemplo:

	- ``http://example.com/welcome?sessionid=xyz123``

- **Engaño al Usuario:**
    
    - El atacante crea un enlace que incluye un identificador de sesión y lo envía al usuario.

- **Inicio de Sesión:**
    
    - El usuario hace clic en el enlace y llega a la página de bienvenida con el identificador de sesión incluido.

- **Autenticación:**
    
    - Al iniciar sesión, el identificador de sesión `xyz123` se usa para la sesión del usuario.

- **Acceso del Atacante:**
    
    - El atacante, que conoce el identificador de sesión, puede utilizar el mismo identificador para acceder a la sesión del usuario y realizar acciones en su nombre.

-----
### Configuración de Cookie Maliciosa

1. **Preparación del Ataque:**
    
    - El atacante realiza una petición a la aplicación web para obtener un identificador de sesión válido, por ejemplo `sessionid=abcdef`

- **Configuración de Cookie:**
    
    - El atacante configura una cookie en el navegador del usuario con este identificador de sesión:
    
    - `document.cookie = "sessionid=abcdef";`

- **Engaño al Usuario:**
    
    - El atacante engaña al usuario para que visite una página web que no está protegida adecuadamente, donde la cookie maliciosa puede ser enviada junto con las solicitudes de la aplicación web legítima.

- **Inicio de Sesión:**
    
    - El usuario inicia sesión en la aplicación web.

- **Acceso del Atacante:**
    
    - Como el identificador de sesión `abcdef` se había establecido previamente en la cookie del navegador, el atacante puede ahora utilizar el mismo identificador de sesión para acceder a la sesión del usuario y realizar acciones maliciosas.