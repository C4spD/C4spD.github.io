----------
- Tags: #nmap #fuzzing #bruteforce #guessing #firewall #hackerone #dorks #puertos #dominios #subdominios #cmi #gestoresdecontenidos #so #sistemaoperativo #correoselectronicos 
-----
# Definición

> El Reconocimiento **es algo indispensable a la hora de determinar vulnerabilidades** o posibles brechas de seguridad en un sistema, ya sea realizando una auditoría o simplemente investigando las aperturas dentro de un sistema. **Hay variedad de recursos/herramientas que se pueden utilizar para facilitar el trabajo**, además de la posibilidad de crear herramientas propias con scripts.

-------
# Nmap y sus diferentes modos de escaneo

Cómo atacante lo que vas a tener que tener en claro es que para poder vulnerar un sistema, tenemos que **ver que puertos están abiertos** porque a través de estos puertos se exponen servicios. 
Un puerto puede estar en diferentes estados, ABIERTO (Esto significa que el puerto está ofreciendo el servicio), CERRADO o FILTRADO
En total existen **``65.535 Puertos``**.

En este caso **intentaremos atentar contra el protocolo TCP de nuestro propio router** con la herramienta **``nmap``** en [[Linux]]

Utilizamos **``route -n``** para ver en el apartado **``Gateway``** nuestra propia **``IP``** de ROUTER

----
#### Escaneo de puertos con ``nmap`` **``-p``**

A continuación utilizamos nmap, esta herramienta dispone múltiples parámetros, del que vamos hablar ahora es del parámetro ``-p``
Recordemos que **si no le especificamos al NMAP que protocolo escanear, automáticamente escaneara los protocolos TCP**.

``-p`` - Se utiliza para escanear los puertos que especifiquemos, el puerto que queremos escanear se coloca luego del parámetro.

- **``nmap -p22 192.168.0.1``** a un lado colocamos la IP a la que queremos realizarle el escaneo de puertos.

También podemos hacer un escaneo en varios puertos a la vez

- **``nmap -p1-65535 192.168.0.1``** o  **``nmap -p- 192.168.0.1``** Aquí estaremos escaneando todos los puertos desde el *1* al *65.535*
En este caso el escaneo tardará un poco por ser tanta cantidad de puertos.

No solo enumerara los puertos abiertos, si no que **también los puertos filtrados** ya que ``nmap`` no es capaz de distinguir o de averiguar con certeza si está en un estado u otro. Si **Nmap** nos detecta un puerto **``filtered``** significa que por ciertas circunstancias no puede determinar si ese puerto está **``Open``** (Puede ser por reglas de firewall entre otras cosas).
Luego del escaneo aparecerán tres columnas las cuales serán **``PORT``**, **``STATE``**, y **``SERVICE``**
El PORT indicará el puerto que fue encontrado, el STATE es el estado de ese puerto (ABIERTO, FILTERED) y SERVICE que indicará el servicio que corre bajo ese puerto.

----
#### Agilizar escaneo de Puertos **``--top-ports "X"``**

¿Qué pasa si no queremos escanear el total de puertos por que tarda mucho, o queremos agilizarlo mas?
Siempre en el primer escaneo que realicemos trataremos de ir lo mas rápido posible.

Podemos utilizar el siguiente parámetro 

- **``nmap --top-ports 500 192.168.0.1``** que lo que hará será escanear los *500 puertos* mas comunes/utilizados o la cantidad que le especifiquemos.

---
#### Filtrado de puertos únicamente **ABIERTOS** **``--open``**

Normalmente en el primer escaneo que realicemos no interesa si aparecen puertos **FILTRADOS**, salvo que no encontremos nada en un puerto abierto o que no encontremos puertos **ABIERTOS** como tal, recién ahí comenzaríamos a escanear los puertos **FILTRADOS**.

Para que NMAP únicamente nos detecte los puertos **ABIERTOS**, escribimos antes de la IP un **``--open``**

- **``nmap -p- --open 192.168.0.1``**

---
#### Verbose para recolectar información en tiempo de ejecución **``-v``**

Ahora, **para poder ir viendo de manera constante los PUERTOS que NMAP encuentra**, y poder ir adelantando el trabajo en otra shell utilizamos **``-v``** de **Verbose** que se utiliza para ver en tiempo de ejecución la información que un comando nos está encontrando.

- **``nmap -p- --open 192.168.0.1 -v``** 

A su vez existe el **Triple** **Verbose** o **``-vvv``** que reporta aún más información

Si pulsamos la tecla ``ENTER`` nos informará cuanto porcentaje de escaneo se llevó a cabo hasta ese momento.

---
#### Filtrado para **NO DNS** **``-n``**

La resolución de nombres de dominio **(DNS) es un sistema que se utiliza para traducir los nombres de los sitios web que escribimos en nuestros navegadores a los números IP** que utilizan los ordenadores para comunicarse entre si. Gracias a la DNS podemos acceder a webs sin necesidad de escribir su IP, si no un "*alias*" llamado dirección.

Esto está bien, pero **genera lentitud a la hora de hacer un escaneo de puertos** con NMAP, ya que hay maquinas que demoran mucho en aplicar el DNS, por ende utilizamos el parámetro **``-n``** para desactivarlo y poder acelerar la velocidad del escaneo un poco mas.

--------
#### Filtrado por velocidad de Temporizado **``-T``**

Este parámetro **``-T``** nos permite controlar la plantilla de temporizado y rendimiento del escaneo, de forma que podemos ajustar la velocidad para que vaya mas lento, o mas rápido con sus diferentes modos. 

- ``Paranoico (0)``
- ``Sigiloso (1)``
- ``Amable (2)``
- ``Normal (3)``
- ``Agresivo (4)``
- ``Loco (5)``

- **``nmap -p- -T5 192.168.0.1``** En este caso realizamos un escaneo en modo ``Loco``

--------
#### Escaneo al Protocolo TCP **``-sT``** (``tcpdump``) (``wireshark``)

Para realizar un escaneo únicamente a los protocolos ``TCP`` debemos filtrar con un ``TCP CONNECT SCANN`` utilizando el parámetro **``-sT``**
Lo que va a suceder utilizando este parámetro es que se va a establecer el **``Three Way Handshake``** del protocolo TCP, básicamente con esto como usuario vamos a lanzar un SYN.

De forma que si la respuesta es **``SYN ---> (RST)``** Significa que el puerto está **Cerrado**. (``RST`` = **RESET PACKET**)
De lo contrario si la respuesta es **``SYN ---> SYN/ACK``** **Abierto** **``---> ACK``** (*Established*) Significa que el puerto está **Abierto** para posteriormente emitir de nuestro lado un ``ACK`` que significa conexión establecida. Luego de esto un paquete **``RST``** para que concluya todo.

Bien vamos a probarlo este parámetro por ejemplo enumerando el *puerto 53* con ``nmap``

- **`nmap -p53 -sT --open 192.168.0.1 -v -n`**

Antes de utilizar el comando anterior, vamos a crear con **``tcpdump``** una **captura** del trafico de paquetes dentro de un puerto especifico, **cuya utilidad principal es analizar el tráfico que circula por la red**.

- **``tcpdump -i ens33 -w Captura.cap -v -n``** 

De esta manera con **``-i (Interface)``** indicamos la interfaz de red que en este caso la nuestra es **``ens33``**, **``-w (write)``** escribimos el trafico capturado en el archivo ``Captura.cap``, con **``-v``** utilizamos el verbose para ver el numero de paquetes que estamos capturando por cada segundo y con el **``-n``** omitimos el DNS.

Mientras estamos a la espera, desde la otra consola utilizamos el comando ``nmap`` anterior con el parámetro **``-sT``**
Un vez que hayamos hecho el escaneo al *puerto 53*, con ``CTRL+C`` cancelamos el **dumpeo TCP** que habíamos activado en la otra consola.

``Wireshark`` **es un analizador de paquetes de red**, una utilidad que captura todo tipo de información que pasa a través de una conexión.
Luego de esto con wireshark abriremos el archivo creado ``Captura.cap`` para ver el contenido de este.

- **``wireshark Captura.cap &>/dev/null & disown``**

Filtramos arriba por **``tcp.port == (Puerto)``** en este caso en puerto colocamos ``53`` que fue el que anteriormente escaneamos y procedemos a chequear si la traza que mandamos nos brinda información sobre el estado de ese puerto con el **``SYN -- SYN/ACK -- ACK``** (Puerto Abierto) o con el **``SYN---RST``** (Puerto Cerrado).

-----
#### Filtro con parámetro **``-Pn``**

Este parámetro **se utiliza sabiendo que NMAP de forma predeterminada realiza un descubrimiento de host o múltiples hosts activos** antes de proceder con el escaneo, si detecta que **está APAGADO no procede con el escaneo**, entonces con el parámetro **``-Pn``** nos aseguramos de que **de por hecho que el host esta ACTIVO**.

------
#### Escaneo al protocolo UDP **``-sU``**
Para realizar un escaneo únicamente al protocolo UDP se puede realizar con el uso del parámetro **-sU**

#### Utilización de NMAP para poder ver hosts/equipos ACTIVOS dentro de la red **(-sn)**

Para realizar un ``ping`` a los diferentes equipos conectados en la red se utiliza el parámetro ``-sn`` para aplicar una especie de "*barrido*" con ping para tratar de por trazas ``ICMP`` ver si el equipo en cuestión está activo/vivo o no, esto se conoce como **``Ping Sweep``**.

Por ejemplo

- **``nmap -sn 192.168.0.0/24``**

Utilizamos nuestra IP partiendo desde el 0 en el ultimo octeto, y aplicando el **CIDR** ``/24`` para representar la mascara de red, de esta forma el ``Ping Sweep`` será enviado desde la *0.0* hasta la *0.255* (Sin contar el **NETWORK ID** ni el **BROADCAST ADDRESS**)

Esta es una forma de poder descubrir equipos en una red.

-----
#### Detección de Sistema Operativo con el parámetro **``-O``**

Utilizando con ``nmap`` el parámetro ``-O`` sirve para cuando le pasemos una IP tratar de detectar el **Sistema Operativo** que compone a ese equipo.
Aunque este parámetro **no es recomendable** ya que hace demasiado ruido, por lo tanto recurrimos a métodos más simples como la revisión del valor del **TTL** a la hora de hacer un ``ping`` a una IP dada.
#### Detección de servicios que corren en puertos específicos **``-sV``**

Con ``nmap`` cuando detectemos un **Puerto Abierto** podemos intentar detectar la **versión** y el **servicio** que corren para esos puertos específicos que encontramos con el parámetro **``-sV``**. De esta manera ``nmap`` realizara un ``Finger Printing`` para ver que contienen a nivel de información estos puertos.

-----
#### Utilización de conjunto de SCRIPTS de RECONOCIMIENTO con NMAP **``-sC``**

Este parámetro se utiliza para poder enumerar mayor información a la hora de efectuar un escaneo con ``nmap`` a puertos o puerto especifico.
El parámetro **``-sC``** **utiliza de manera automática los scripts mas significativos**/**populares** **a la hora de realizar un escaneo**

Este parámetro se puede compactar con el anterior (``-sV``) escribiendo ambos tal que así **``-sCV``**

-----
#### Automatizaciones con NMAP y sus SCRIPTS

Una de las características más poderosas de **``Nmap``** es su capacidad para automatizar tareas utilizando **scripts personalizados**. Los scripts de Nmap permiten a los profesionales de seguridad automatizar las tareas de reconocimiento y descubrimiento en la red, además de obtener información valiosa sobre los sistemas y servicios que se están ejecutando en ellos. El parámetro **``--script``** de Nmap permite al usuario seleccionar un conjunto de scripts para ejecutar en un objetivo de escaneo específico.

Para poder utilizar un script utilizamos el siguiente comando a modo de ejemplo

- **``nmap --script mi_script.nse objetivo``**

-----
## Evasión de Firewall con Nmap

### Firewall, IDS y trabas a la hora de hacer escaneos

Un **Firewall** y **IDS** **Intrussion Detection System** es un sistema de seguridad de red, que lo que hace es supervisar y controlar el trafico de red entrante y saliente en función de reglas de seguridad predeterminadas.
Muchas veces va a pasar de que cuando estemos haciendo un escaneo de puertos de manera externa **con NMAP, veremos una cantidad determinada de puertos abiertos** pero una vez que consigamos acceso a la maquina y veamos que puertos están abiertos de manera INTERNA, **es muy probable que veamos muchos mas a la hora de usar un ``Netstat`` o ``ss``**. Esto es totalmente normal ya que el firewall tal vez tiene reglas configuradas que impidan que puedas ver los puertos abiertos de manera externa, además de esto también puede pasarnos que veamos el puerto como FILTERED, y es por lo mismo, probablemente haya una configuración de firewall que impida ver el estado del Puerto.

-----
### Parámetros de NMAP para evasión/burla de Firewall

Dentro del manual de ``man nmap`` si filtramos por ``/-f`` encontraremos diferentes herramientas para evadir el Firewall/Cortafuegos, a continuación detallaremos las mas utilizadas.

-----
#### Parámetro para **Fragmentación** de paquetes **``-f``**

Consiste que en vez de hacer el escaneo y enviar un paquete entero para verificar si los puertos están abiertos o no, lo **enviaremos de manera fragmentada para evadir el Firewall**. **Luego de esto cuando llegue a destino, este paquete se va a reensamblar para poder ser interpretado** en los mismos paquetes fragmentados. Mediante el uso de Wireshark podemos ver donde fue reensamblado.

En wireshark podemos filtrar por paquetes fragmentos con **``ip.flags == 1``** el numero 1 representa a fragmentados y el 0 a no fragmentados.
Hay ocasiones en el que los firewalls esperan un paquete concreto, y el hecho de fragmentarlo hace que puertos que estén filtrados o que no veamos, los podamos ver de manera externa.

Un ejemplo sería 

- **``nmap -p53 192.168.0.1 -f``**

-----
#### Parámetro para Modificar tamaño de paquetes (**Fragmentación controlada**) **``--mtu``**

Con el parámetro anterior **``-f`` realizamos una fragmentación sin especificaciones**, ahora con este podemos realizar fragmentaciones de paquetes de tamaños específicos que asignemos.

**``MTU = Maximum Transmission Unit``**, es un valor el cual puede estar establecido en los Firewalls en cuanto a tamaño de paquetes respecta, **normalmente son múltiplos de 8**, y al poner **un valor inferior al que ese espera con el parámetro ``--mtu``, tal vez podamos burlar** esa posible restricción para ver si el puerto está abierto o filtrar información.

Con este parámetro podemos modificar el tamaño de un paquete en fragmentos de paquetes mediante el uso de **``--mtu (valor)``**

-----
#### Parámetro para Falsificación de IPs con **Decoy** **``-D``**

Se puede hacer **Spoofing** con las direcciones IP para que además de que se vea tu IP se vean muchas mas y pasar mas desapercibido a la hora de hacer un escaneo con ``nmap``, para esto utilizaremos el parámetro 

- **``-D (IP SEÑUELO)``**

Todos esto también lo podemos chequear con el ``Wireshark`` capturando con ``Tcpdump`` en un archivo ``.cap``.

- **``nmap -p53 192.168.0.1 -D 192.168.0.255``** ---------> Podemos agregar mas de una IP DECOY entre "``,``" y sin espacios. **``-D 192.168.0.2,192.168.0.3``**

Filtrando en Wireshark **``(tcp.port == 53)``** por el *puerto 53* en este ejemplo, veremos que hay 2 paquetes enviados, uno de nuestra IP y otro de la IP señuelo

Este parámetro también viene bien ya que si en algún momento usamos muchas IP DECOY, a lo mejor el Firewall determina que solo determinada IP puede ver cierto puerto, y tal vez de manera inesperada podríamos llegar a ver algún puerto abierto usando las IP FALSIFICADAS.

Podemos también filtrar por todos los paquetes que como IP destino tengan la IP ``192.168.0.1`` en **``Wireshark``** con **``(ip.dst == 192.168.0.1)``**

----
#### Parámetro para Puertos de Origen (Source) **``--source-port``**

Cuando envías paquetes, hay un puerto aleatorio del equipo que se abre temporalmente para poder enviar la solicitud, normalmente este puerto que se abre es aleatorio, para poder luego tramitar la comunicación, y la respuesta también entra por otro puerto aleatorio de tu equipo.

Todo esto se realiza de forma automática pero se puede manipular con el parámetro 

- **``--source-port (Numero de puerto que queramos abrir temporalmente para el envió del paquete)``** 

Esto abrirá el puerto que especifiquemos tanto para la entrada como para la salida a la hora de enviar un paquete.

Un ejemplo sería

- **``nmap -p53 --open 192.168.0.1 -v -n -T5 --source-port 1234``**

Podemos ver esta información en el ``Wireshark`` en la **columna de ``INFO``**
Hay veces en las que dependiendo del puerto de origen que especifiquemos con el parámetro anterior (``--source-port``) nos puede brindar mas información y medio que eludimos el Firewall.

----
#### Parámetro para Modificar longitud de Paquetes  **``--data-length``**

La **longitud de paquetes (Length) la podemos observar con ``Wireshark``** en la columna **``Length``** a un lado de la columna **``Info``**.
**Este valor es lo que nosotros hemos enviado al router para tratar de ver si el puerto especificado (``53``) está abierto**. En base a este valor hay que tener en cuenta que **algunos Firewall conocen tamaños de paquetes específicos (LENGTH) para ciertas herramientas**, de forma que tal vez tienen una especie de **lista negra** donde detectan que si el tamaño del paquete es **``58`` (Numero asociado al Length de un reconocimiento de NMAP)** por ejemplo, están intentando realizar un reconocimiento con NMAP mediante ese puerto (53) para ver si está abierto.

Por **defecto siempre tendrá la longitud de "58"** a la hora de efectuar un escaneo con NMAP, pero podemos modificarlo sumándole determinadas cantidades adicionales.
Para poder Falsificar/Modificar la longitud usamos el parámetro **``--data-length (Valor que queramos agregarle)``**

Un ejemplo sería

**``nmap -p53 192.168.0.1 --data-length 21``** -----> Con este comando enviaremos un paquete con ``peso = 58+21 = 79``

Podemos verificar ese valor con ``Tcpdump`` y ``Wireshark`` en la columna **Length**

-----
#### Parámetro para Falsificación de direcciones MAC **``--spoof-mac``**

Se utiliza para falsificar la dirección MAC y colocar una de los OUI existentes (3 primeros Bytes de la dirección MAC)

Para esto podemos utilizar el parámetro **``--spoof-mac (OUI)``**", una vez que lo hagamos es muy probable que detecte que el HOST esta inactivo, por ende debemos usar el parámetro anteriormente explicado **``-Pn``** para tomar como que si esta activo.

Un ejemplo sería

- **``nmap -p53 192.168.0.1 --spoof-mac 00:11:22:33:44:55 -Pn``**

**Nos puede suceder que detecte que el puerto que antes de falsificar la MAC estaba abierto, se encuentre cerrado, por lo tanto no siempre es buena idea falsificar la MAC**. Hay ocasiones en las que en una red hay ciertos equipos que por la MAC se detecta que es autorizado para que se comunique con ella y deje pasar todos los paquetes, para la enumeración de puertos, que se comunique con ciertos servicios, etc.
Si logras identificar equipos en la red configurados mediante la solicitud de paquetes ARP con **``arp-scan -I ens33 --localnet``** puedes ver que activos están configurados dentro de la RED.

------
#### Parámetro para Escaneo sigiloso y rápido Self-Scan **``-sS``**

Esta técnica es una de las más **utilizadas para realizar escaneos sigilosos y evitar la detección del Firewall**. El comando ****``-sS``*** permite realizar un escaneo de tipo **``SYN``** **sin establecer una conexión completa**, lo que permite evitar la detección del Firewall.

Anteriormente vimos que lo que realizamos al hacer una petición con un paquete a un puerto es que se emplea un ``Three Way Handshake`` con el protocolo TCP.
Si está cerrado **``SYN ---> (RST)``** Significa que el puerto está cerrado. (RST = RESET PACKET)
Si está abierto **``SYN ---> SYN/ACK``** (Abierto) **``---> ACK``** (Established)" Significa que el puerto está abierto para posteriormente emitir de nuestro lado un **``ACK``** que significa conexión establecida. Luego de esto un paquete **``RST``** para que concluya todo.

---

Con el **``SelfScan (-sS)``** realizamos un **Escaneo Sigiloso a la par que rápido** y a diferencia del escaneo común realiza lo siguiente:

Si está cerrado  **``SYN ---> (RST)``** Significa que el puerto está **cerrado**. ``RST = RESET PACKET``
Si está abierto **``SYN ---> SYN/ACK``** (Abierto) **``---> RST``** (``Reset Packet``)

En vez de responder con un **``ACK``** como en el escaneo común, respondemos con un **``RST``**, de forma que no dejamos la conexión abierta, la cerramos directamente. Normalmente en **algunos Firewalls no dejan "Log" o registro este tipo de conexiones (``SelfScan``)**, porque únicamente registran con incluso algunos aplicativos conexiones establecidas completamente, es decir las que hayan recibido un ``ACK`` que concluya y complete, y recién ahí registre el LOG. 
En este punto si nosotros recibimos un ``SYN/ACK`` del destino y **nosotros enviamos/tramitamos un ``RST``, es como si no dejáramos que la conexión termine cerrándola forzadamente**.

Algo a tener en cuenta es que a la hora de efectuar un escaneo sea ``-sT`` o ``-sU`` o ``-sS``, es que los privilegios de usuario que tengamos tienen mucho que ver, si somos usuario **Root**, automáticamente el escaneo va a ser silencioso, como si fuese un ``Self-Scan``. Si **no somos usuarios privilegiados**, se efectuara (En el caso de no usar ``-sS``) un escaneo a modo ``SYN-SYN/ACK-ACK``.

#### Parámetro para Controlar la velocidad de los paquetes enviados **``-min-rate``** **``-max-rate``**

Para poder pasar mas desapercibidos por el Firewall, podemos gestionar la velocidad de los paquetes enviados para ser mas sigilosos, esto se puede realizar utilizando el parámetro **``-min-rate``** o **``-max-rate``**
Por ejemplo si queremos tramitar paquetes no mas lentos que ``5000/s`` como mínimo utilizaríamos **``-min-rate 5000``**

==Se recomienda siempre incorporar esa velocidad cómo mínimo para no tener falsos Puertos Abiertos o falsos Puertos Cerrados.==

----
## Uso de scripts y categorías en Nmap para aplicar reconocimiento

**Para ubicar todos los scripts existentes en Nmap, utilizamos en nuestra shell el comando "``locate .nse``"**

Existen diferentes categorías de scripts disponibles en Nmap, cada una diseñada para realizar una tarea específica. Algunas de las categorías más comunes incluyen:

- **default**: Esta es la categoría predeterminada en Nmap, que incluye una gran cantidad de scripts de reconocimiento básicos y útiles para la mayoría de los escaneos.
- **discovery**: Esta categoría se enfoca en descubrir información sobre la red, como la detección de hosts y dispositivos activos, y la resolución de nombres de dominio.
- **safe**: Esta categoría incluye scripts que son considerados seguros y que no realizan actividades invasivas que puedan desencadenar una alerta de seguridad en la red.
- **intrusive**: Esta categoría incluye scripts más invasivos que pueden ser detectados fácilmente por un sistema de detección de intrusos o un Firewall, pero que pueden proporcionar información valiosa sobre vulnerabilidades y debilidades en la red.
- **vuln**: Esta categoría se enfoca específicamente en la detección de vulnerabilidades y debilidades en los sistemas y servicios que se están ejecutando en la red.

En conclusión, el uso de scripts y categorías en Nmap es una forma efectiva de automatizar tareas de reconocimiento y descubrimiento en la red. El parámetro **``--script``** permite al usuario seleccionar un conjunto de scripts personalizados para ejecutar en un objetivo de escaneo específico, mientras que las diferentes categorías disponibles en Nmap se enfocan en realizar tareas específicas para obtener información valiosa sobre la red.

Para poder utilizar un script utilizamos el siguiente comando a modo de ejemplo.

- **``nmap --script mi_script.nse objetivo``**

----
# Alternativas para la enumeración de puertos con descriptores de archivo

La **enumeración de puertos** es **una tarea crucial en las pruebas de penetración** y seguridad de redes. Tal y como hemos visto, Nmap es una herramienta de línea de comandos ampliamente utilizada para esta tarea, pero **existen alternativas para realizar la enumeración de puertos de manera efectiva sin utilizar herramientas externas**.

Una alternativa para la enumeración o escaneo de puertos es utilizando descriptores de archivos o enviando cadenas de ``echo`` vacías al directorio ``/dev/tcp/(IP)/(PUERTO)`` y dependiendo del código de estado que recibamos podemos validar si ese puerto se encuentra abierto o no.
(El directorio ``/dev/tcp/`` solo existe en una ``BASH``, en ``zsh`` generará errores). 
El código de estado **"``0``" es exitoso**, y el código de estado **"``1``" no lo es**, podemos verificar que código de estado nos dio el comando anterior con la bash utilizando un **"``echo $?``"**

**El directorio ``/dev/tcp``** no es un directorio físico en el sistema de archivos, sino **un mecanismo especial que permite realizar conexiones TCP a través de redirecciones y funciones de redirección incorporadas en la Bash**. El directorio ``/dev/tcp`` **se usa en combinación con redirecciones para establecer conexiones TCP en una sola línea de comando**.

Este método puede ser menos preciso y mas lento que otros, pero puede ser viable si queremos utilizar un escaneo sin la utilización de la herramienta ``Nmap``.

Podemos hacer un script como referencia para hacer una secuencia del **1 al 65.535**, tomando como base el siguiente comando.

- **``exec 3<> /dev/tcp/(IPADDRESS)/(PORT)``** Después de esto tendremos que cerrar el descriptor de archivos para evitar errores a futuro o intrusiones.

----
# Descubrimiento de equipos en la red local (``ARP`` e ICMP)

**ARP (Address Resolution Protocol)** Es un protocolo que se utiliza en redes locales para encontrar la dirección física (MAC) de un dispositivo a partir de su dirección IP. Ayuda a los dispositivos en una red a comunicarse entre sí. 

**``netdiscover``, ``arp-scan`` y ``masscan``, utilizan el protocolo ARP para descubrir hosts en la red**.

**ICMP (Internet Control Message Protocol)**: Es un protocolo utilizado en redes IP para enviar mensajes de control y notificaciones. Se utiliza para verificar la conectividad entre dispositivos (por ejemplo, con el comando "ping")

Una forma para ver los HOST'S activos en nuestra red local es utilizar el comando **``arp-scan -I ens33 --localnet``**

Al igual que en el caso anterior de enumeración de puertos, **tenemos otras maneras de escanear los HOSTS(IPS) dentro de la red local que no sea con la utilización de la herramienta NMAP o ARP**.

Podemos crear un SCRIPT en BASH **con el uso de trazas ICMP (PING'S)** para poder enviar una señal a todos los posibles hosts existentes, todo esto, como en el caso anterior, **mediante la utilización de un secuenciador en el script, iterando dentro de todas las posibilidades** (Del 1 al 254, sin incluir el 255 ya que este es el broadcast address y no nos interesa). ``192.168.0.$i``

Ahora, **si la maquina correspondiente no permite realizar PING'S/Trazas ICMP**, podemos utilizar un **método similar al Escáner de puertos del script anterior, pero en vez de usar descriptores de archivos, podemos enviar una cadena vacía ``echo ''`` al directorio ``/dev/tcp/(HOST)/(PUERTO)``**, y en base al código de estado que nos devuelva vamos a poder saber si el HOST está activo o no.

-----
#### Herramienta **``masscan``**

Por otro lado, también tenemos a nuestra disposición la herramienta ``**masscan**``, esta herramienta es **semejante a ``NMAP``, pero es mucho mas potente a la par que rápido** y sirve para realizar escaneos masivos a nivel de red. Ambas herramientas se destinan a lo mismo solo que tienen diferencias notorias, **``NMAP`` escanea 1000 hosts por minuto, y ``masscan`` puede escanear millones por minuto**. Además de todo esto **``masscan`` es capaz de en un simple paquete descubrir todos los puertos abiertos que pueda tener un único HOST, a diferencia de NMAP que envía un paquete por separado para cada puerto**.

Utilizamos por ejemplo el siguiente comando **``masscan -p22,53,80,443,440 -Pn 192.168.0.0/24 --rate=10000``** El **``--rate``**" funciona igual que el **``-min-rate o -max-rate``**, determina la velocidad de los paquetes enviados a mayor sea el rate, menor es la probabilidad de que puedas enumerar todos los puertos que puedan estar abiertos.

Cada herramienta tiene sus propias ventajas y limitaciones. Por ejemplo, **``netdiscover``** es una herramienta simple y fácil de usar, pero puede ser menos precisa que **``arp-scan``** o **``masscan``**. Por otro lado, **``arp-scan``** y **``masscan``** son herramientas más potentes, capaces de descubrir hosts más rápido y en redes más grandes, pero también son más complejas y pueden requerir más recursos.

-----
# Descubrimiento de correos electrónicos

Hoy en día de cara a vulnerar una compañía no solamente se hace todo a través de un dominio, pudiendo atentar a la base de datos, o de otra manera drástica a la misma, si no que **también lo que se suele hacer es un ataque mas dirigido tratando de atentar a la propia compañía en cuanto a acceso no autorizado**. Uno de **los ataques mas comunes es el PISHING, enviar correos electrónicos** con webs falsas, documentos maliciosos, o macros para infectar y obtener acceso a equipos, etc.

**Debemos obtener información acerca de los correos electrónicos de la compañía/empresa** a la que querramos auditar o comprometer, esto lo podemos realizar mediante el uso de una herramienta WEB con el dominio de https://www.hunter.io o la web https://phonebook.cz/, estas herramientas GRATUITAS nos brindaran información acerca de los correos electrónicos EXISTENTES dentro de una determinada compañía. 

En muchos casos **los mails caducan, o los trabajadores ya no pertenecen a la compañía y sus correos siguen figurando** en la búsqueda, debido a esto utilizaremos otra herramienta WEB llamada https://www.verifyemailaddress.org/ o https://email-checker.net/ para poder verificar que los correos encontrados previamente estén activos.

Otra herramienta muy útil es **``intelx.io``** para buscar información relacionada con direcciones de correo electrónico, nombres de usuarios y otros detalles.

----
# Reconocimiento de Imágenes

En este caso exploraremos cómo las tecnologías de reconocimiento de imágenes pueden ser utilizadas para obtener información valiosa sobre las personas y los lugares. 
Una de las herramientas WEB que existen es **``PimEyes``**. PimEyes es una plataforma en línea que utiliza tecnología de **reconocimiento facial** para buscar imágenes similares en Internet en función de una imagen que se le proporciona como entrada. 

El funcionamiento de PimEyes se basa en el análisis de **patrones faciales**, que son comparados con una base de datos de imágenes en línea para encontrar similitudes, se poseen 10 intentos por día, y si pagas 25.

------
# Fuzzing y enumeración de archivos y directorios en un servidor web

¿Cómo podríamos enumerar una gran cantidad de rutas existentes, directorios o archivos en un servidor WEB?
## Forma Activa

Esto es algo muy importante, ya que **nos brindara información de rutas para atacar o enumerar**. Para esto utilizaremos las herramientas llamadas **gobuster** y **wfuzz** utilizadas previamente para la enumeración de subdominios, pero en este caso para la enumeración de directorios y archivos ocultos.

A modo de ejemplo intentaremos enumerar los directorios o archivos de la pagina web http://miwifi.com encontrada dentro de la pagina HackerOne ya que necesitamos consentimiento de la empresa para esto.

-----
#### Herramienta ``gobuster``

- **``gobuster dir -h``** para obtener información acerca de la utilidad "``dir``" dentro de la herramienta "``gobuster``". Con este comando (``dir``) vamos a aplicar un reconocimiento a nivel de directorios y archivos de la siguiente manera.

- **``gobuster dir -u http://miwifi.com -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 200``**

Cuando hagamos esto nos aparecerán probablemente directorios enlazados con otros, y algunos códigos de estado **301** que **representan un ``REDIRECT``** a otros directorios, definidos por un **"``/``"** al final de la ruta, para poder conseguir el codigo de estado final de la ruta agregándole ese slash al final de la ruta, podemos aplicar el parámetro **``--add-slash``** y ya con esto tendríamos las rutas finales.

También nos **aparecerán muchos códigos de estado "``403``" que representan a ``FORBIDDEN``** o Acceso restringido, para **BLACKLISTEAR** estos códigos de estado, utilizamos el parámetro **-b** propio de la herramienta **gobuster** y también agregamos el **404** UNNOT FOUND.

En este caso quedaría todo el comando así

- **``gobuster dir -u http://miwifi.com -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 200 --add-slash -b 403,404``**

De esta manera encontraremos los directorios y archivos existentes en ese dominio mediante el uso de FUERZA BRUTA.

Podemos utilizar el parámetro **``-x``** **para poder indicar que extensiones quieres aplicar por ejemplo (``php``,``html``,``txt``, etc)** pero para esto debemos **quitar** el parámetro anterior **``--add-slash``** para evitar conflictos.

Podemos utilizar el parámetro **``-s (Código)``** para indicar el codigo que deseamos que nos muestre únicamente, siempre utilizando **``-b``** que representa a una cadena vacía de **BlackList**. 

--------
#### Herramienta ``wfuzz``

Esta herramienta es una de las mas completas (La que mas vamos a usar) ya que posee muchos tipos de filtrados que realizan todo de una manera mucho mas cómoda.

- **``wfuzz -c -t 200 -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt "http://miwifi.com/FUZZ"``** 

Recordemos que en el URL donde dice **"``FUZZ``"** es donde queremos aplicar todo el diccionario previamente definido.
Todo este comando nos brindara muchísimos códigos de estado **404 (``NOT FOUND``)** para filtrarlos agregamos el parámetro previamente usado **``--hc 404``** (HIDE CODE)

Además de esto, como nos pasaba en ``gobuster`` **con el codigo de estado "403" (``REDIRECT``) podemos utilizar un parámetro "``-L``" para poder hacer un FOLLOW** de esos **Redirects** y encontrar el directorio o archivo final. En este caso para que no se rompa el comando podemos colocarle un "``/``" de manera manual al final del URL para que tome toda la ruta completa.

Siempre es interesante meterse dentro de los directorios que den codigo de estado **200** ya que estos se refieren a una conexión exitosa.

---

**``wfuzz``** posee variedad de métodos de filtrado, a continuación vamos a enumerarlos.

**``-c``** (Colours) Para aplicar colores
**``-w (Ruta del diccionario)``** Para aplicar un diccionario especifico con combinaciones para fuerza bruta.
**``FUZZ``** Para aplicar cada combinación de PAYLOAD especificada (Diccionarios, listas (``-z``) etc.)
ruta-de-ejemplo.com/FUZZ Para aplicar un payload para por ejemplo "**.html**", únicamente debemos agregárselo al URL al final quedando así
ruta-de-ejemplo.com/FUZZ.html De esta forma buscara rutas con las combinatorias del diccionario que contengan .html.

**``-t (Numero de hilos)``** (TREATHS) Para aplicar ejecuciones en segundo plano con hilos

**``--sc=(Codigo a mostrar)``** (SHOW STATUS CODE) Para poder mostrar un codigo especificado únicamente.
**``--hc=(Codigo a filtrar)``** (HIDE STATUS CODE) Para poder ocultar rutas con un codigo especificado.

**``--sl=(Lineas)``** (SHOW LINE) Para poder filtrar por rutas o respuestas que posean una cantidad especifica de líneas (LINES)
**``--hl=(Lineas)``** (HIDE LINE) Para poder ocultar una ruta que posea una cantidad especifica de líneas (LINES)

**``--sw=(Letras)``** (SHOW WORDS) Para poder filtrar por rutas o respuestas que posean una cantidad especifica de palabras (Words)
**``--hw=(Letras)``** (HIDE WORDS) Para poder ocultar rutas o respuestas que posean una cantidad especifica de palabras (Words)

**``--sh=(Caracteres)``** (SHOW CHARS) Para poder filtrar por rutas que posean una cantidad especifica de caracteres (CHARS)
**``--hh=(Caracteres)``** (HIDE CHARS) Para poder ocultar rutas que posean una cantidad especifica de caracteres (CHARS)

----
##### Enumeración de LISTAS

**``-z list, (Nombres de extensiones de archivos separados por "-")``** Para poder crear una lista momentánea, y iterar constantemente agregándole al FUZZ final un **``FUZ2Z``** (``3Z``,``4Z``,``5Z``, sucesivamente dependiendo de cuantas listas creemos) para especificarle al 2do PAYLOAD que ejecute la lista del parámetro **``-z``** en este caso ya que hay 2 ``FUZZ`` siendo utilizados, el del diccionario, y ahora el nuevo que es la lista del parámetro "``-z``".

**``-z``** se utiliza para indicar el tipo de dato que queremos usar de cara al reconocimiento que nos interese aplicar, abarcando opciones como diccionarios, listas y rangos numéricos.

Un ejemplo:

- **``wfuzz -c -t 200 -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -z list,html-txt-php  http://miwifi.com/FUZZ.FUZ2Z``**

---
##### Enumeración de RANGOS

- **``range, (1-2000)``** Para poder enumerar rangos dentro de un dominio, por ejemplo

- **``wfuzz -c -t 200 -z range,1-20000 'https://www.mi.com/shop/buy/detail?product_id=FUZZ'``** Donde se iterara en un rango del 1 al 20.000 en donde dice FUZZ, buscando productos dentro de la pagina en este caso.

En este caso vemos que hay muchas devoluciones con "5889" WORDS, nosotros vamos a suponer que como son tantas, es debido a que no existen, por ende vamos a esconder esos resultados con **``--hw=5889``** escribiéndolo luego de "``-c``", quedaría así

- **``wfuzz -c --hw=5889 -t 200 -z range,1-20000 'https://www.mi.com/shop/buy/detail?product_id=FUZZ'``**

Otra vez, podríamos probar los resultados obtenidos para verificar si son correctos.

----
#### Herramienta ``ffuf``

Otra herramienta para poder enumerar archivos, directorios o rutas como tal de un servidor web es utilizando **``ffuf``** que debe ser instalada con un **``git clone https://github.com/ffuf/ffuf``**

Ejecutamos la herramienta con **``./ffuf``** 
Esta herramienta tiene modos de ejemplo en la parte inferior una vez ejecutada, de todas formas utiliza parámetros iguales a los de ``WFUZZ`` y a ``GOBUSTER``, pero alguna que otra diferencia tiene.

----
#### BurpSuite

**Burpsuite** es una herramienta que **se puede utilizar tanto de manera PASIVA como ACTIVA**
Esta herramienta actúa como un intermediario ya que uno como atacante cuando desde nuestro navegador tramitamos una petición al servidor web, esta comunicación se realiza de manera directa, de nuestro origen al destino que es la web. Sin embargo **Burpsuit lo que hace es ponerse en medio de la comunicación, actuando como intermediario**, de esta forma **podemos configurar un proxy** para que desde un navegador cualquiera, puedas hacer que las consultas pasen por Burpsuite primero para que luego Burpsuite lo envié al destino recolectando la información. Una de sus particularidades es la función de análisis de páginas en línea, empleada para identificar y enumerar los recursos accesibles en una página web.

**Proxy**: **Un servidor que retransmite el tráfico entre su dispositivo y la Web, con lo que evita que su navegador esté en contacto directo con los sitios que visita**
Un **proxy HTTP** es un filtro de contenido de alto rendimiento, ampliamente usado en el hacking con el fin de interceptar el tráfico de red. Esto permite analizar, modificar, aceptar o rechazar todas las solicitudes y respuestas de la aplicación que se esté auditando.

Para poder ejecutarlo lo realizaremos de la misma forma que ``Wireshark``

- **``burpsuit &>/dev/null & disown``**

Nos meteremos en la pestaña de proxy y podemos verificar que esté en "Escucha" en donde dice **Intercept is off/on** y en el apartado de **Settings**, podemos ver si **hay un proxy setteado si encontramos nuestra ip local ``127.0.0.1:8080``**, por defecto BurpSuite escucha en el equipo local por el puerto **8080**

----
##### **Foxy Proxy**

**Instalaremos un Addon o Extensión llamado FoxyProxy Addon en Firefox** en nuestro caso, configurándolo entrando en Options dentro de la extensión y en la pestaña de Add agregar los datos del Burpsuite **(Titulo, IP local, puerto 8080, color)**. Con esto ya tendremos configurado el FoxyProxy. Entramos dentro del dominio utilizado anteriormente **mywifi.com**, abrimos la extensión de Foxy y veremos que ya hay una opción de Burpsuite (El agregado por nosotros previamente), vamos a seleccionarla y con esto haremos que todas las peticiones pasen por BurpSuite.
##### **Certificado de Burpsuite**

(Es probable que nos salga una especie de advertencia en la web a la hora de ingresar a un dominio cualquiera, esto se debe a que no tenemos descargado el certificado de BurpSuite, el cual lo debemos descargar en la web https://burp) Una vez hecho esto iremos al navegador en configuraciones y colocaremos en el buscador "**Certificates**", abrimos donde dice **View certificates** y importamos el certificado descargado marcando la casilla que dice "Trust this CA to indentify Websites". Ya con esto veríamos información a la hora de entrar a la web y revisar Burpsuite.
Algo a tener en cuenta es que Burpsuite tiene una navegador propio basado en Chromium, este navegador no requiere que le descarguemos el certificado, ya tiene todo incorporado.

-----
##### Funcionamiento en Burpsuite

Una vez hecho todo esto, ya **Burpsuite funcionara correctamente**, ahora solo le damos a **Intercept On** en la pestaña de **Proxy** y ya cualquier tipo de comunicación que hagamos la vamos a interceptar por la herramienta en esa misma pestaña. **Dándole a la opción Foward, haremos que la petición fluya, y de esta forma si hubieran habido mas peticiones aparecerían ahí**.

En la pestaña **Target** y dentro de ella en **Site Map** a la hora de realizar una petición en la pagina web, la vamos a poder ver y nos quedará el registro de todas las rutas a las que se ingresaron y las peticiones solicitadas, podemos ver mas abajo en el recuadro de **Request** la petición que se ha tramitado y en el recuadro de **Response** la respuesta del servidor a esa petición.

Todos **estos datos nos vienen bien para hacernos una idea de todas las peticiones que por detrás de forma "oculta" se están tramitando**.
También tenemos un HTTP history donde podemos ir viendo todo lo que está pasando a nivel de peticiones.

---
## Forma Pasiva

Podemos enumerar rutas o directorios de manera pasiva con herramientas WEB como la anteriormente vista **www.phonebook.cz**
# Enumeración de subdominios

Un **subdominio** es una especie de **Ramificación** de un dominio particular, estos subdominios **están configurados para apuntar a diferentes recursos de la red, como servidores web, servidores de correo electrónico, sistemas de bases de datos, sistemas de gestión de contenido, entre otros**. Estos subdominios se hayan separados del dominio principal por un **"``.``"** y siempre se escriben antes de este, como por ejemplo el subdominio www.help.tinder.com, donde el subdominio es **``help``** y el dominio principal es **``tinder``**.

Para poder encontrar o identificar los subdominios existentes de un dominio especifico se pueden utilizar variedad de herramientas, estas se dividen en dos grupos las **PASIVAS** y las **ACTIVAS** 

-----
### Pasivas (Legal)

Las **herramientas** **pasivas** permiten obtener información sobre los subdominios sin enviar ninguna solicitud a los servidores identificados

Las **herramientas pasivas** más utilizadas para la enumeración de subdominios incluyen la búsqueda en motores de búsqueda ==Google, Bing o Yahoo==, y la búsqueda en registros DNS públicos como **PassiveTotal** o **Censys**. Estas herramientas permiten identificar subdominios asociados con un dominio, aunque **no siempre son exhaustivas**. También existen herramientas como **``CTFR``** que **utilizan registros de que abusan de la transparencia de certificados "SSL/TLS (Registros con información de seguridad para conexiones en línea)"** para encontrar subdominios asociados a un dominio. (``CTFR`` instalado en carpeta OPT)

También se pueden utilizar páginas online como **Phonebook.cz** e **Intelx.io**

- **``Phonebook``** (Herramienta pasiva): [https://phonebook.cz/](https://phonebook.cz/)
- **``Intelx``** (Herramienta pasiva): [https://intelx.io/](https://intelx.io/)
- **``CTFR``** (Herramienta pasiva): [https://github.com/UnaPibaGeek/ctfr](https://github.com/UnaPibaGeek/ctfr)
En este caso la **herramienta ``CTFR``** está instalada dentro del directorio OPT, para ejecutarla se debe hacer con **``python3 ctfr.py``**
- **``Subfinder`` (Herramienta pasiva): https://github.com/projectdiscovery/subfinder  
Esta herramienta está instalada en el sistema, para ejecutarla podemos escribir ``subfinder -h`` para listar las ``FLAGS`` de la herramienta

==Debemos tener en cuenta que la enumeración de subdominios de manera PASIVA es legal ya que estamos recolectando información pública.==

----
### Activas (Ilegal sin consentimiento)

Las **herramientas activas** envían solicitudes a los servidores identificados para encontrar subdominios bajo el dominio principal.

Las **herramientas activas** para la enumeración de subdominios incluyen herramientas de fuzzing como **``wfuzz``** o **``gobuster``**. Estas herramientas **envían solicitudes a los servidores mediante ataques de fuerza bruta**, con el objetivo de encontrar subdominios válidos bajo el dominio principal.

==Debemos tener en cuenta que la enumeración de subdominios de manera ACTIVA es ILEGAL sin consentimiento de la empresa o compañía.==
#### Herramienta **``gobuster``**

(Herramienta activa): [https://github.com/OJ/gobuster](https://github.com/OJ/gobuster)

Es una herramienta la cual está programada en ``Go``, un lenguaje que trabaja muy bien en sockets y conexiones. 
Esta herramienta posee variedad de **parámetros que podemos ver al escribir ``gobuster`` en nuestra shell**.

Podemos escribir por ejemplo **``gobuster vhost``** para ver información sobre el parámetro ``vhost``, además de que podemos colocarle seguido un **``-h``** para ver mas información acerca de el mismo.

Utilizaremos el **``Vhost``**, con los siguientes parámetros:

**``-u``** (Para asignar un URL especifico al que queramos aplicarle fuerza bruta) En este caso "https://tinder.com"
**``-w``** (Para aplicar un diccionario con el cual iterar con fuerza bruta para posibles subdominios existentes) 
En este caso el diccionario descargado por GITHUB llamado **``SecLists`` por danielmiessler** (En la carpeta **``/usr/share/Discovery/DNS/``**)
Este diccionario posee **CONTRASEÑAS comunes**, **DOMINIOS comunes** y muchas mas cosas.
**``-t``** (Para asignar cuantos hilos utilizar, permiten realizar múltiples peticiones en paralelo) En este caso "``20``"

Una vez que utilicemos estos parámetros probablemente nos aparezcan muchos errores con **código de estado ``403``** por ende podemos usar "**``grep -v '403'``**" para que no nos aparezcan. 
El **código de estado 403** hace referencia a "*Acceso prohibido*" o "*Forbidden*" en inglés. Indica que el servidor web ha entendido la solicitud del cliente, pero el servidor se niega a autorizarla. 

----
#### Herramienta **``wfuzz``**

(Herramienta activa): [https://github.com/xmendez/wfuzz](https://github.com/xmendez/wfuzz)
**El fuzzing es una técnica de prueba de software** que implica enviar datos aleatorios a una aplicación o sistema para descubrir vulnerabilidades y errores.

``wfuzz`` es una herramienta muy similar a ``gobuster``, utiliza algunos parámetros similares.

``wfuzz`` Es una herramienta que está **especializada en la parte de fuzzing**, permite Fuzzear muchas cosas, desde aplicar descubrimientos de rutas, fuzzear parámetros, solicitudes que se tramiten por ``GET``, ``POST``, extensiones, poner múltiples campos a fuzzear, cualquier cosa enumerable, etc.

Comúnmente utilizaremos los siguientes parámetros

``-c`` (Para asignarle colores a los resultados)
``-t`` (Para asignar hilos, realizar múltiples tareas en paralelo)
``-w`` (Para asignar diccionario para la fuerza bruta)
``-H`` (Para asignar una cabecera luego del parámetro (``-H``) entre **comillas dobles** )

Algo a tener en cuenta de la herramienta ``wfuzz`` **es que posee una palabra interna** propia llamada **``FUZZ``**, la cual se utiliza para indicar donde sustituir tu **``payload``** (Las combinaciones del diccionario establecidas), en este caso el **diccionario SecLists**. Esto suele utilizar mucho en la búsqueda de **DIRECTORIOS, RUTAS, ARCHIVOS, etc** dentro de un dominio, y también en este caso, **en búsqueda de SUBDOMINIOS**.

En este ejemplo nosotros usaremos la herramienta de esta manera:

- **``wfuzz --hc=403 -c -t 20 -w /usr/share/SecLists/Discovery/DNS/subdomains-top1million-5000.txt -H "Host: FUZZ.tinder.com" https://tinder.com``**

En este caso donde realizaremos el **Fuzzeo es donde dice "``FUZZ``"** dentro del subdominio de ``tinder.com``

Como con la herramienta ``gobuster`` acá también deberíamos filtrar los códigos de estado ``403`` (Rechazados), para esto la herramienta ``wfuzz`` posee un parámetro especifico el cual es **``--hc=(Numero de código)``** (HIDE CODE), o en su caso contrario que quisiéramos que muestre específicamente un código de estado sería **``--sc=(Numero de código)``** (SHOW CODE), en este caso como abunda el código de estado "403", colocaremos **``--hc=403``** para ocultarlo.

-----
# Credenciales y brechas de seguridad

Una de las principales técnicas utilizadas por los atacantes es la **explotación de las credenciales** y **brechas de seguridad**. Una de las formas más comunes en que los atacantes aprovechan las brechas de seguridad es mediante el uso de leaks (Filtración) de bases de datos. Estos leaks pueden ser el resultado de errores de configuración, vulnerabilidades en el software o ataques malintencionados.
Es importante entender que muchas de estas bases de datos filtradas y vendidas en línea **son accesibles públicamente** y en algunos casos, incluso se venden por una pequeña cantidad de dinero. Esto significa que cualquier persona puede acceder a esta información y utilizarla para llevar a cabo ataques malintencionados.

https://www.dehashed.com/ es una herramienta WEB que se utiliza para ver diferentes tipos de datos filtrados si se abona una cantidad de dinero especifica.

-----
# Identificación de las tecnologías en una página web

**Existen diversas herramientas y utilidades en línea que permiten identificar las tecnologías utilizadas en una página web**. Algunas de las herramientas más populares incluyen **Whatweb**, **Wappalyzer** y **builtwith.com**.
Estas herramientas escanean la página web y proporcionan información detallada sobre las tecnologías utilizadas, como el lenguaje de programación, el servidor web, los sistemas de gestión de contenido, entre otros.

En este caso vamos para el dominio "http://miwifi.com" detectar las tecnologías, y el posible gestor de contenidos que haya por detrás.

-----
#### ``Whatweb``

**whatweb** utilizada a través de la consola, esta **nos brindara información de las tecnologías que corren por detrás de una pagina web** especifica, **en ocasiones el gestor de contenido** (Si es un Wordpress un Drupal, etc). Además hay veces que si en la pagina web principal, en el codigo fuente, o en la propia pagina detecta que hay un correo electrónico te lo suele reportar. También en ocasiones suele reportar si en la pagina web hay alguna fuga de información **(information leak)** como por ejemplo ver en una cabecera direcciones IPs privadas que no deberían estar ahí.

Utilizaremos ``whatweb (Dominio)`` para obtener información. Una vez que la herramienta nos brinde información, debemos ponernos a investigar por internet acerca de los datos obtenidos, investigar versiones (Vale ORO), servidor HTTP, correos si es que los hay, IPs si es que las hay etc.
#### ``Wappalyzer``

Es una extensión del navegador que detecta y muestra las tecnologías utilizadas en la página web. Esta herramienta es especialmente útil para los expertos en seguridad que desean identificar rápidamente las tecnologías utilizadas en una página web sin tener que realizar un escaneo completo.
#### ``BuiltWhit``

Es una herramienta en línea que también permite identificar las tecnologías utilizadas en una página web. Esta herramienta proporciona información detallada sobre las tecnologías utilizadas, así como también estadísticas útiles como el tráfico y la popularidad de la página web.

https://builtwith.com/

------
# Google Dorks / Google Hacking (Los 18 Dorks más usados)

Todo esto es legal ya que es información pública, debe ser utilizado con responsabilidad porque de lo contrario sería ilegal.

El ‘**Google Dork**‘ es una técnica de búsqueda avanzada que utiliza operadores y palabras clave específicas como filtros en el buscador de Google **para encontrar información que normalmente no aparece en los resultados de búsqueda regulares**.
Al utilizar Google Dorks, un atacante **puede buscar información como nombres de usuarios y contraseñas, archivos confidenciales, información de bases de datos, números de tarjetas de crédito y otra información crítica**. También pueden utilizar esta técnica para identificar vulnerabilidades en aplicaciones web, sitios web y otros sistemas en línea.

**A continuación citaremos los Dorks mas usados**

**``site:(Dominio)``** Se utiliza para **forzar a que la búsqueda de dominios especificados** luego de los dos puntos (Todo junto), sean los únicos que aparezcan.

**``filetype:(Extensión especifica)``** Se utiliza para forzar a que la **búsqueda nos brinde tipos de archivos con una extensión especifica**, por ejemplo "``txt``", "``pdf``", "``word``", "``excel``", etc.

**``intext:(Palabra que queramos que aparezca en titulo)``** Se utiliza para forzar a que en la búsqueda sea común, pero que si o si tenga en su titulo el dominio o texto especificado después de los dos puntos.

**``inurl:(Palabras que queramos que tenga un URL, dominios, rutas, etc.)``** Se utiliza para forzar a que en la búsqueda aparezcan resultados que en sus URL's, contengan palabras especificadas. Por ejemplo **``inurl:wp-config.php.txt``** que es un archivo de configuración de contraseñas y demás.

Podemos utilizar la siguiente web para utilizar o encontrar mas Google Dorks 
https://pentest-tools.com/information-gathering/google-hacking

Podemos utilizar también la siguiente web para hallar vulnerabilidades ya que esta es una especie de "**Almacén**" de las mismas.
https://exploit-db.com expone códigos de vulnerabilidades para poder explotarlas.
En este caso utilizaremos las herramientas dentro de la pestaña **GHDB (Google Hacking Data Base)** pudiendo filtrar por Dorks específicos para algún tipo de dominio que queramos investigar.
# Identificación y verificación externa de la versión del sistema operativo

En uno de los títulos anteriores, específicamente en el manejo de NMAP, vimos que para poder identificar o intentar identificar el sistema operativo y su versión de un objetivo, podríamos utilizar el parámetro **``-O``. Lo que sucede es que esto es muy agresivo** y lanza muchas peticiones por detrás.

Hay formas mas rápidas y sigilosas para poder identificar estos datos, por ejemplo mediante el uso de un ``Ping`` y identificando el valor siguiente:

**TTL (Time To Live)** es un valor de temporizador incluido en los paquetes enviados a través de redes que le dice al destinatario cuánto tiempo debe retener o usar el paquete antes de descartar y caducar los datos (paquete). **Los valores TTL son diferentes para diferentes sistemas operativos. Por lo tanto, puede determinar el sistema operativo según el valor TTL.** 

Las maquinas **Windows** poseen un valor cercano al de **``128 TTL``**
Las maquinas **Linux** poseen un valor cercano al de **``64 TTL``**
Para saber sobre todos los valores TTL y sus sistemas operativos podemos buscar en https://subinsb.com/default-device-ttl-values/

Algo a tener en cuenta es que los valores TTL se pueden modificar, pero por lo general o por defecto sin haber configurado nada se deberían respetar las anteriores especificaciones.