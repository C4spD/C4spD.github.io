-----
- Tags: #capabilities #escalation #privilege 
---
# Explicación

> En sistemas Linux, las capabilities son una funcionalidad de seguridad que permite a los usuarios realizar acciones que normalmente requieren privilegios de superusuario (**root**), sin tener que concederles acceso completo de superusuario. Esto se hace para mejorar la seguridad, ya que un proceso que solo necesita ciertos privilegios puede obtenerlos sin tener que ejecutarse como root.

Las capabilities se dividen en 3 tipos:

- **Permisos efectivos (effective capabilities)**: son los permisos que se aplican directamente al proceso que los posee. Estos permisos determinan las acciones que el proceso puede realizar. Por ejemplo, la capability “**CAP_NET_ADMIN**” permite al proceso modificar la configuración de red.
- **Permisos heredados (inheritable capabilities)**: son los permisos que se heredan por los procesos hijos que son creados. Estos permisos pueden ser adicionales a los permisos efectivos que ya posee el proceso padre. Por ejemplo, si un proceso padre tiene la capability “**CAP_NET_ADMIN**” y esta capability se configura como heredable, entonces los procesos hijos también tendrán la capability “**CAP_NET_ADMIN**“.
- **Permisos permitidos (permitted capabilities)**: son los permisos que un proceso tiene permitidos. Esto incluye tanto permisos efectivos como heredados. Un proceso solo puede ejecutar acciones para las que tiene permisos permitidos. Por ejemplo, si un proceso tiene la capability “**CAP_NET_ADMIN**” y la capability “**CAP_SETUID**” configurada como permitida, entonces el proceso puede modificar la configuración de red y cambiar su **UID** (**User ID**).

Ahora bien, algunas capabilities pueden suponer un riesgo desde el punto de vista de la seguridad si se les asignan a determinados binarios. Por ejemplo, la capability **``cap_setuid``** permite a un proceso establecer el UID (User ID) de un proceso a otro valor diferente al suyo, lo que puede permitir que un usuario malintencionado ejecute código malicioso con privilegios elevados.

Para **listar** las capabilities de un archivo binario en Linux, puedes usar el comando **getcap** ``getcap -r / 2>/dev/null`` para ver las de todo el sistema. Este comando muestra las capabilities efectivas, heredables y permitidas del archivo. Por ejemplo, para ver las capabilities del archivo binario **/usr/bin/ping**, puedes ejecutar el siguiente comando en la terminal:

➜ `getcap /usr/bin/ping`

La salida del comando mostrará las capabilities asignadas al archivo:

➜ `/usr/bin/ping = cap_net_admin,cap_net_raw+ep`

En este caso, el binario ping tiene dos capabilities asignadas: **``cap_net_admin``** y **c``ap_net_raw+ep``**. La última capability (**``cap_net_raw+ep``**) indica que el archivo tiene el bit de ejecución elevado (**``ep``**) y la capability **``cap_net_raw``** asignada.

Para **asignar** una capability a un archivo binario, puedes utilizar el comando **``setcap``**. Este comando establece las capabilities efectivas, heredables y permitidas para el archivo especificado.

Por ejemplo, para otorgar la capability **``cap_net_admin``** al archivo binario **``/usr/bin/my_program``**, puedes ejecutar el siguiente comando en la terminal:

➜ `sudo setcap cap_net_admin+ep /usr/bin/my_program`

En este caso, el comando otorga la capabilitie **``cap_net_admin``** al archivo **``/usr/bin/my_program``**, y también establece el bit de ejecución elevado (**``ep``**). Ahora, el archivo ``my_program`` tendrá permisos para administrar la configuración de red.

El **bit de ejecución elevado** (en inglés, elevated execution bit o “**``ep``**“) es un atributo especial que se puede establecer en un archivo binario en Linux. Este atributo se utiliza en conjunción con las capabilities para permitir que un archivo se ejecute con permisos especiales, incluso si el usuario que lo ejecuta no tiene privilegios de superusuario.

Cuando un archivo binario tiene el bit de ejecución elevado establecido, se puede ejecutar con las capabilities efectivas asignadas al archivo, en lugar de las capabilities del usuario que lo ejecuta. Esto significa que el archivo puede realizar acciones que normalmente solo están permitidas a los usuarios con privilegios elevados.

Es importante señalar que los permisos permitidos pueden ser limitados aún más mediante el uso de un mecanismo de control de acceso obligatorio (MAC, Mandatory Access Control), como **SELinux** o **AppArmor**, que restringen las acciones que los procesos pueden realizar en función de la política de seguridad del sistema.

Para ver toda la información acerca de las Capabilities podemos utilizar la web https://GTFObins.github.io

![[Cap 4.png]]

--------
# Ejemplos

Como nosotros estamos practicando con contenedores en Docker, debemos emplear un parámetro para este ejercicio, el parámetro es el ``--privileged``. Cabe aclarar que si nosotros comprometemos una máquina que no está en un contenedor nos funcionará todo lo que hagamos sin necesidad de alterar nada.

- ``docker run -dit --privileged --name ubuntuServer ubuntu``

Para emplear el uso de los comandos básicos de **Capabilities** precisamos tener instalado el binario ``getcap`` y el binario ``setcap``, para instalarlos hacemos esto

- ``apt install libcap2-bin``

------

El primer binario con el que vamos a estar practicando es con ``tcpdump`` y con las herramientas básicas de **Network**, por lo tanto haremos un ``apt install tcpdump net-tools``

Después de esto **crearemos un usuario** en el sistema con el comando ``useradd -d /home/c4sp -s /bin/bash -m c4sp`` para otorgarle una **directorio personal** y una **bash**, luego nos meteremos en el con ``su c4sp``.

-----

Si intentamos ejecutar el ``tcpdump`` con *c4sp* **no podremos**, ya que no poseemos permisos para eso.

Lo primero que tenemos que hacer es listar las capabilities que posean los binarios que estén corriendo por el sistema como **procesos**, esto lo podemos hacer realizando un ``ls /proc/`` eligiendo un directorio que queramos de los que aparecen, en mi caso elegiré el directorio llamado ``8``, y dentro de este al igual que en los demás suele haber un archivo ``status``. Nosotros realizaremos un ``cat`` al archivo ``status`` pero usando ``grep`` para filtrar por la cadena *Cap*, que hace referencia a las **Capabilities** de ese proceso.

- ``cat /proc/8/status | grep Cap``

![[Cap 1.png]]

Ahora lo que haremos será por ejemplo elegir el ``CapPrm`` para copiar su valor y pasarlo por la herramienta que instalamos previamente llamada ``libcap2-bin``, de esta forma **veremos todas las Capabilities de este proceso**.

- ``capsh --decode=0000003fffffffff``

Para este **PID** que está corriendo, que en mi caso es el ``8`` se utilizan estas Capabilities.

![[Cap 2.png]]

Todas estas son las capacidades que **están vinculadas a este proceso** en cuestión de forma que este puede **ejecutar ciertas tareas privilegiadas**.

Podemos hacer un ``pwdx 8`` para ver en donde se está ejecutando este proceso.

Otra cosa que se puede hacer es ==directamente== utilizar la herramienta ``getpcaps (PID)`` para que al otorgarle el **PID** del proceso que nos interese ver sus capabilities nos las muestre.

----

Como usuario *root* vamos a setear dos **Capabilities** al binario ``tcpdump``, esto lo haremos con ``setcap cap_net_raw,cap_net_admin=eip /usr/bin/tcpdump`` estas lo que permiten/otorgan es el privilegio para cualquier usuario a nivel de sistema de ejecutar el ``tcpdump`` para **capturar tráfico de red**.

Como usuario *c4sp* realizaremos un ``getcap -r / 2>/dev/null`` para listar todas las **Capabilities** del sistema y efectivamente veremos las de la herramienta ``tcpdump``

-------

**Capabilities** hay de todo tipo, una de las más riesgosas es la ``cap_setuid+ep`` que permite controlar tu identificador de usuario

- ``apt install python3``

Como **root** le otorgaremos esta **Capabilitie** al binario ``python3`` que para ver su **ruta absoluta** hacemos un ``which python3 | xargs ls -l``.

- ``setcap cap_setuid+ep /usr/bin/python3.12``

Ahora como usuario **c4sp** al ver que el binario ``python3`` posee esta Capabilitie, podemos hacer ``python3.12 -c 'import os; os.setuid(0); os.system("bash")'`` de esta forma nos volveríamos el usuario con el identificador "*0*" correspondiente al usuario **root**.

![[Cap 3.png]]

