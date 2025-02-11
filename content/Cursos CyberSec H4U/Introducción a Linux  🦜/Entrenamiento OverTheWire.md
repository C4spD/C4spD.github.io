----------
- Tags: #Linux #comandos #cesar #ssh #nc #SUID #fuerzabruta
---------------
# Definición

> Con este juego podemos aprender Ciberseguridad y manejo de [[Linux]] de manera interactiva mediante una sección de niveles que van a poner a prueba nuestro conocimiento acerca de la CyberSec.

--------------
# Lectura de archivos especiales

Archivos especiales o archivos que contengan nombres con símbolos no se pueden abrir de una manera clásica con la utilización de comandos como "``cat``" o "``vim``" o "``nano``", ya que al intentar utilizar estos como por ejemplo un archivo llamado "``-``" nos estará tomando ese guion como si fueses el inicio de una especificación del comando anterior de (``vim``, ``cat``, ``nano``, etc), para poder evitar esto en este caso podemos colocar:
***``cat + (Ruta absoluta)``*** para poder evitar que nos tome el ``-`` como un inicio de comando, ``cat /home/c4sp/Desktop/-``
***``echo $(pwd)/-``*** para poder mostrar con entorno que ese archivo existe, para luego cambiar el ``echo`` por ``cat``, quedando ``cat $(pwd)/-`` y de esta manera abriendo el archivo.

Si un archivo posee espacios en su nombre hay diferentes formas también:

"***``TAB``***" La manera mas fácil de abrirlo es escribiendo el comienzo del nombre y tabular para autocompletar 
**``\``** sirve para utilizar un salto de linea y que nos evite el siguiente carácter
**``' '``** encerrar entre comillas simples sirve también para poder abarcar el formato como solo nombre.
**``*``**  sirve para rellenar en caso de que no sepamos el nombre completo del archivo, el asterisco sirve para abarcar todo lo que hay dentro del directorio también.

Por ejemplo el archivo de nombre ``Esto tiene espacios``"
- Poder utilizar el **salto de linea** en este caso utilizaremos ``cat Esto\\ tiene\\ espacios`` y de esta forma lo abriríamos.
- También podríamos utilizar como en el ejemplo anterior mediante la utilización de entorno ``echo $(pwd)/Esto \\ tiene\\ espacios\\``, y luego cambiar "``echo``" por "``cat``". 
- Podríamos hacer el uso de **comillas simples** para abarcar el nombre entre ellas, por ejemplo ``cat 'Esto tiene espacios'``
- El ==ASTERISCO== se puede utilizar, usando por ejemplo en el "``cat /home/c4sp/Esto*``" El asterisco al final de "``Esto*``" sirve para indicarle al comando que queremos ver lo que esta adentro del archivo que empieza con "Esto" pero que no sabemos como continua, o no lo queremos escribir por algún motivo.

--------
# Cifrado Cesar y uso de tr para traducción de caracteres

Es uno de los tipos de cifrados simétricos más antiguos y se basa en el cifrado mono alfabético más simple. Se considera un método débil de criptografía, ya que es fácil decodificar el mensaje debido a sus técnicas de seguridad mínimas. Este se usa mediante la sustitución de letras, desplazadas X cantidad de espacios en el abecedario. 
Por ejemplo podemos escribir en ``ROT3`` (3 rotaciones de letras) la palabra "*Hola*", y se vería "*Kruc*", ya que se desplazan 3 letras desde cada letra de la palabra "Hola", la H equivale a (H, I, J, =='K'==)

Esto claramente en textos largos no se puede hacer de manera manual ya que llevaría mucho tiempo, para esto tenemos herramientas ONLINE de cifrado ROT o Cesar, también lo ideal seria a aprender a hacerlo por nuestra cuenta de manera automática como mostramos a continuación:

Con el uso de ``tr`` podemos hacer una sustitución de una serie de cadenas y de otro conjunto de cadenas.

Código cifrado: ``Gur cnffjbeq vf WIAOOSFzMjXXBC0KoSKBbJ8puQm5lIEi``  ``(ROT13)``

- `` cat text.txt | tr '[G-ZA-Fg-za-f]' '[T-ZA-St-za-s]'``

En la primer cadena lo que hacemos es marcar desde el comienzo de la primer letra del cifrado que es (G) hasta la Z que es el final del abecedario para abarcar hasta el final de este, luego debemos especificar lo que esta mas atrás de la G, desde la A hasta la G. Al principio colocamos esto en mayúscula para abarcar todo mayúsculas y luego lo mismo pero en minúsculas.

En la segunda cadena anotamos el conteo que debemos hacer de forma manual de la primer letra del cifrado que es (G) que rotada 13 veces es (T). Especificamos lo mismo, desde la T, hasta la Z para abarcar esa parte del abecedario, y luego lo que esta detrás de la T, desde la A hasta la T.
De la misma manera primero en Mayúsculas, y luego en Minúsculas.
==NOTA: SIEMPRE TIENEN QUE COORDINAR LA PRIMER CADENA CON LA SEGUNDA.==

También podemos hacer de esta forma mas fácil cuando es (ROT13) o en caso que sea otro ROT, contamos desde la A con la cantidad de números rotados y esa letra la colocaríamos en donde en el siguiente ejemplo pone "N".

- ``cat data.txt | tr '[A-Za-z]' '[N-ZA-Mn-za-m]'``

---
# Manejo de pares de claves y conexiones SSH

Los pares de claves SSH son dos claves criptográficamente seguras que pueden usarse para autenticar a un cliente a un servidor SSH. Cada par de claves está compuesto por una **clave pública** y una **clave privada**.

El **cliente** mantiene la **clave privada** y debe mantenerla en absoluto secreto. Poner en riesgo la clave privada puede permitir a un atacante no autorizado iniciar sesión en los servidores que están configurados con la clave pública asociada sin autenticación adicional. Como medida de precaución adicional, es recomendable cifrar la clave en el disco con una frase de contraseña.

La **clave pública** asociada puede compartirse libremente sin ninguna consecuencia negativa. La clave pública puede usarse para cifrar mensajes que **sólo la clave privada puede descifrar**. Esta propiedad se emplea como forma de autenticación mediante el uso del par de claves.

- ``ssh-keygen`` - se utiliza para crear un par de claves del equipo actual.

Si queremos tener acceso a un equipo remoto (con una **Key Pública**: ``id.rsa.pub``) sin proporcionar contraseña lo que debemos hacer es introducir nuestra "**Key publica**" brindada previamente por el comando ``ssh-keygen`` dentro del directorio ``/home/pepe/.ssh`` con el nombre de ``authorized_keys``, de esta forma cuando hagamos un ``ssh pepe@(su ip)`` nos **meterá directamente** ya que nosotros previamente nos autorizamos con las keys como si **fuésemos un usuario de confianza**.

Si queremos tener acceso a un equipo remoto (con una **Key Privada**: ``id_rsa``) sin proporcionar contraseña, lo que debemos hacer es introducir 
``ssh -i (Nombre del archivo de identidad que posee la clave privada) pepe@(IP DE LA MAQUINA QUE QUEREMOS ENTRAR) -p (Numero de puerto)``
Las ==claves privadas siempre== deben tener el permiso ``600`` si no, no vas a poder ingresar remotamente al siguiente bandit.

==NOTA==: por defecto el comando ``ssh`` nos envía al **puerto 22**, por ende siempre debemos aclarar al final con ``-p (numero de puerto)``.
==NOTA==: ``id_rsa`` y ``id_rsa.pub`` son los archivos que contienen dentro las claves.

----------
# Uso de netcat (NCAT) para realizar conexiones

Existen un total de *65.535* **puertos**.

**Netcat** es una herramienta de línea de comandos que sirve para escribir y leer datos en la red. Para la transmisión de datos, Netcat usa los protocolos de red **TCP/IP** y **UDP**.

Gracias a su universalidad, a Netcat se la llama **la navaja suiza del TCP/IP**. Puede utilizarse, por ejemplo, para diagnosticar errores y problemas que afecten a la funcionalidad y la seguridad de una red. Netcat también puede escanear puertos, hacer streaming de datos o simplemente transferirlos. Además, permite configurar servidores de chat y de web e iniciar consultas por correo. Este software minimalista, desarrollado a mediados de los 90, puede operar en modo servidor y cliente.

Podemos usar ``ss -nltp`` para poder ver los puertos abiertos actualmente
Podemos ir al directorio cat ``/proc/net/tcp`` para ver los puertos abiertos pero en código hexadecimal (xxd)

----------
# Uso de conexiones encriptadas ``NCAT``

``ncat`` -  **es una herramienta de segundo plano confiable que ofrece conectividad de red para otras aplicaciones y usuarios**. Lee y escribe datos a través de redes desde la línea de comandos y usa tanto TCP y UDP para comunicaciones

``Ncat`` puede encriptar el tráfico usando SSL. En el modo de conexión, basta con añadir la opción ``--ssl``.

- ``ncat --ssl (127.0.0.1) (puerto)`` - sirve para conectarnos mediante un ``ssl``
==Secure Sockets Layer son protocolos criptográficos, que proporcionan comunicaciones seguras por una red, comúnmente Internet.==

- ``ss -nltp | awk '{print $4}' | sort -u | grep 31 | cut -d ":" -f2`` encontré el dato encriptado en el *puerto 31790* de manera manual, pero también se puede encontrar con el escáner.

------------
# Ejecución de comandos por ``SSH``

A través del archivo de configuración **``.bashrc``** o **``.zshrc``**, es posible definir una serie de acciones a llevar a cabo a la hora de obtener una consola interactiva, en este caso tras ingresar por SSH.

Es por ello que tras ingresar, somos expulsados de forma inmediata, dado que así ha sido definido en el archivo de configuración **``.bashrc``** para el caso que estamos tratando. Si colamos un comando al final de nuestra línea al aplicar una autenticación por SSH, lograremos que ese comando sea introducido a nivel de sistema antes de que se interprete el archivo de configuración.
En este caso, al ingresar por ``SSH`` al ``banditcamp18`` nos expulsa automáticamente ya que este posee una configuración establecida en el archivo ``.bashrc``, pero si nosotros metemos al final de nuestra linea de comandos de conexión un comando, este se va a ejecutar antes que el archivo .bashrc.

- ``sshpass -p 'hga5tuuCLF6fFzUpnagiMN8ssu9LFrdg' ssh bandit18@bandit.labs.overthewire.org -p 2220`` ---> **No podemos entrar**
- ``sshpass -p 'hga5tuuCLF6fFzUpnagiMN8ssu9LFrdg' ssh bandit18@bandit.labs.overthewire.org -p 2220 bash`` ---> **Podemos entrar**

Ya que estamos solicitando una ``bash`` (Consola) antes que nos expulse.

----------
# Abusando de privilegio SUID para migrar de usuario

**SUID** es un permiso de archivo especial para archivos ejecutables que permite a otros usuarios ejecutar el archivo con los permisos efectivos del propietario del archivo. **SGID**, por el contrario, es un permiso de archivo especial que también se aplica a los archivos ejecutables y permite a otros usuarios heredar el GID efectivo del propietario del grupo de archivos.

**SUID** significa “**establecer ID de usuario**” (**Set owner User ID**) y **SGID** significa “**establecer ID de grupo**” (**Set Group ID up on execution**).

De la misma manera que en el ejemplo anterior que ejecutábamos comandos mediante la SSH, en este caso abusamos del privilegio que tenemos del SUID del usuario banditcamp20, siendo nosotros banditcamp19.

Tenemos un binario llamado ``bandit20-do`` con permisos **SUID**, y al ser un binario y tener permisos SUID podemos ejecutarlo como si fuésemos el propietario ``OWNER (u)``.
Por ende utilizamos ``./bandit20-do (ID)``, donde en el apartado "``ID``" podemos poner el comando que queramos y este se ejecutara como si fuésemos ``BANDIT20`` de esta forma podemos abusar y colocar un comando tal como "``bash -p``" o "``sh -p``" para otorgarnos una consola interactiva y poder manipular el usuario **BANDIT20**. (``-p`` permite la ejecución del ``bin`` pero enlazado/unido al id del usuario propietario, bandit20. El '``-p``' viene de '**Privileged**', se utiliza para iniciar un shell privilegiado o protegido.)

--------------
# Jugando con conexiones ``nc``

Para poder ponernos en escucha en un puerto, utilizamos ``nc -nlvp (Puerto Ej: 4646)`` (==NOTA==: ``-n`` es para no ver información **DNS**, ``-l`` es para ponernos en escucha, ``-v`` es de verbose para listar el contenido a medida que llega, y ``-p`` es de puerto), de esta forma, con la conexión del otro usuario bandit21 utilizamos el binario mediante el puerto 4646, de esta forma intentaremos establecer una conexión.

Lo que hacemos es ponernos en escucha en el *puerto 4646* en el caso este, que puede ser cualquier otro
Ahora, lo que hacemos con la terminal del archivo ``suconnect``, es enviar una especie de "*Ping*" al usar ese binario
Como para establecer una conexión con el *puerto 4646*. Cuando te sale en la terminal del ``netcat`` "*Connection received*" es porque fue exitosa. Ahora lo que debe tener adentro el binario de ``suconnect``, debe ser que para que el te proporcione una información especifica, tienes que mandarle una información especifica.
En este caso la contraseña del usuario anterior ``Banditcamp20``
Una vez que le envías la contraseña del usuario anterior, el te brinda la contraseña del usuario ``Banditcamp21``

--------------
# Fuerza bruta aplicada a conexiones

Para conectarnos a un puerto utilizamos el siguiente comando, acompañado del numero de puerto al que queremos conectar.
"nc localhost 30002" en este caso que estamos intentando entrar al nivel 25 de bandit camp, nos solicita la contraseña de bandit24, y un pin de 4 dígitos que debemos conseguir con fuerza bruta.
Para poder de una manera mas rápida hacer los intentos con las contraseñas usamos echo

- ``echo "VAfGXJ1PBSsPSnvsjI8p759leLZ9GGar 1234" | nc localhost 30002``

De esta forma, usamos la contraseña ``VAfGXJ1PBSsPSnvsjI8p759leLZ9GGar`` y a su vez seguido de un espacio el pin ``1234`` (Que en este caso claramente no es el correcto). Haciendo esto generamos que una vez que se active el comando "``nc``", automáticamente se envié una linea con "``echo``" de la contraseña seguido de un espacio con el pin.

Ahora para poder crear un comando que haga el intento con todas las cadenas de combinaciones posibles (0000 al 9999) hacemos lo siguiente:

- ``for pin in {0000..9999}; do echo "VAfGXJ1PBSsPSnvsjI8p759leLZ9GGar $pin"; done > bruteforce.txt``

De esta manera indicamos que para la variable ``pin`` en todas las combinaciones posibles hacer un ``echo`` con la contraseña del usuario **bandit24** seguido de todas las variables posibles asignadas en "pin", redireccionar todo esto a un archivo de texto que se llama ``bruteforce.txt``

Después de esto hacemos lo mismo que antes pero con ``cat``

- ``cat bruteforce.txt | nc localhost 30002``

Ahora ya tenemos el comando hecho, pero como son tantas combinaciones y solo 1 es la correcta, no queremos llenar nuestra shell de "*Wrong*" y el comando inicial de "*Please enter the password*", así que filtramos con ``grep -vE "Please enter|Wrong"`` la "``E``" se utiliza para filtrar mas de un contenido.

- ``cat bruteforce.txt | nc localhost 30002 | grep -vE "Wrong|Please enter"``

(En este caso me da ``timeout`` por muchas requests seguidas, así que use el comando **``tac``** que es lo mismo que ``cat`` pero lo catea al revés.)

---------
# Escapando del contexto de un comando

Algo que se puede hacer cuando nos encontramos con un archivo de texto que no posee permisos de ``Write`` ni ``Execute`` es utilizar la opción "``v``" para ponernos en modo visual dentro de este.
De esta forma, podemos ejecutar comandos a nivel del sistema del propietario del archivo. Ya que como bien sabemos, desde un archivo en la herramienta **``vim``** podemos ejecutar comandos como si de una consola de ``bash`` se tratase. 
En el ejemplo de este ``bandit25``, al intentar entrar mediante la *Private key* del usuario ``bandit26`` otorgada previamente nos expulsa automáticamente, no sin antes mostrarnos un cartel en grande que dice ``BANDIT 26``, como cuando iniciamos en otro bandit de manera exitosa.
Lo que hacemos en este caso, ya que esto ocurre de manera instantánea, es resizear (O acomodar) el tamaño de la ventana para poder verlo mucho mas chico, de esta manera se aplica la propiedad "``more``", la cual nos deja quedarnos de manera estática en un modo de paginado ``vim`` dentro de la ejecución del archivo de texto (Del cual ``bandit26`` es dueño) que coloca el mensaje de "``BANDIT 26``" en grande. Ahora si usamos "``v``" seguido de "``:``" podemos **definir una variable para brindarnos una consola de comandos** interactiva que se llame ``set shell=/bin/bash``, ahora escribimos solamente el comando ``shell`` definido por nosotros previamente, y ya estamos con control del usuario ``bandit26``. De esta forma escapamos del contexto de ``more``.


----------



