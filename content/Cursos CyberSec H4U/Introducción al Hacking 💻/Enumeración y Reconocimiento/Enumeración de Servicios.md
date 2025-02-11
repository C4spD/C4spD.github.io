-------
- Tags: #puertos #subnetting #servicios #protocolos 
----------
# Definición de Servicio y Servicios mas comunes

> Un **servicio** es un software o proceso que realiza funciones específicas, generalmente en respuesta a solicitudes de otros programas, dispositivos o usuarios a través de una red. Estos corren atreves de los conocidos **Puertos**. Dentro de una red es común encontrar **servicios** dentro de puertos específicos a la hora de realizar una auditoría, muchas veces sucede que estos servicios corren por puertos ya pre-definidos, como por ejemplo el **Puerto 21** que corresponde al servicio **FTP**, aunque puede darse el caso de que el servicio **FTP corra por otro puerto ya que fue modificado manualmente**.
### Puertos comunes y sus servicios mas comunes.

**Puerto 21 FTP
Puerto 22 SSH
Puerto 80 HTTP
Puerto 443 HTTPS
Puerto 445 SMB (Samba dependiendo de si es Linux o Windows)**
Entre otros
==Puede ser que ser que se encuentren estos servicios en otros puertos, ya que pueden ser modificados==
Hay muchos que serán **muy comunes**, por ende conviene saber como enumerarlos.

---------
# Enumeración del servicio FTP (21)

>El protocolo **FTP** se encuentra en el **puerto 21 por defecto** y viene de **"File Transfer Protocol"** el cual es un protocolo de transferencia de archivos en redes. 
  La **enumeración del servicio FTP implica recopilar información relevante**, como la versión del servidor FTP, la configuración de permisos de archivos, los usuarios y las contraseñas **mediante ataques de fuerza bruta o guessing**, entre otros.

Para poder maniobrar con este protocolo tenemos la herramienta **``ftp``** la cual se instala con **``apt install ftp``** y la sintaxis para usarla es **``ftp (IP)``**
Esta herramienta en Linux **proporciona una interfaz de línea de comandos para interactuar con servidores FTP** y facilitar la transferencia de archivos entre sistemas remotos.

Normalmente para este caso **hay 2 opciones para ingresar a un servidor FTP** que son las siguientes 

- Poder ingresar como **Usuario Invitado**, mediante el uso del usuario **Anonymous** el cual es un usuario especificado genéricamente para **ganar acceso a un servidor FTP sin proporcionar contraseña**.

- Poder ingresar mediante **autenticación** brindando credenciales especificas (**Usuario y contraseña**)

Ya una vez conectados dentro del servidor FTP usando cualquiera de las 2 opciones, **podemos utilizar los comandos típicos** **``ls``**, **``dir``**, **``get``**, **``put``** (Subir archivos), **``binary``** (Para entrar en modo binario para descargar binarios así la data no se corrompa) y con **``help``** podemos listar todos.

--------
## Montaje de un Servidor FTP en un contenedor

Utilizaremos https://github.com/metabrainz/docker-anon-ftp y también https://github.com/garethflowers/docker-ftp-server 
Estos dos links **corresponden a dos contenedores de servidores FTP** los cuales **poseen ambos casos** vistos anteriormente.
Uno para crear un contenedor con un servidor **FTP que contiene el usuario "anonymous"** y el otro para crear un contenedor con un servidor **FTP que requiere autenticación** (Fuerza bruta).

### Caso FTP con Credenciales

Seguiremos las instrucciones dadas por el GITHUB utilizando el comando dado para usar la imagen en ``Docker``, reemplazando nuestros datos.
Utilizaremos **``rockyou.txt /usr/share/wordlists/rockyou.txt``** el cual es un **diccionario con mas de 14 millones de contraseñas para fuerza bruta**. Para este ejemplo seleccionaremos una contraseña cualquier dentro del archivo "``rockyou.txt``", en este caso la **``517 "spider"``**, para luego asignarla al comando dado anteriormente como contraseña, esto para probar una herramienta utilizada para fuerza bruta en el FTP llamada **``Hydra``**

Luego de montar la imagen y tener el contenedor activo, utilizamos el siguiente comando 

- ``ftp localhost`` 

Ya que como nosotros somos lo que creamos el servidor ``FTP``, es a nuestra ``IP`` a la que hay que conectarse. 
Veremos que el servidor FTP nos solicita un usuario y una contraseña. 
==(Recordemos que las credenciales son "``c4sp``" y "``spider``" pero vamos a suponer que solo sabemos el usuario para utilizar Hydra)==

Recordemos que con **``nmap``** podemos lanzar un conjunto de scripts básicos de reconocimiento **``-sC``** y tratar de detectar la versión y servicio para el *puerto 21* **``-sV``** del equipo local **localhost**. Esto nos sirve porque el conjunto de scripts básicos de ``nmap`` posee un script que intenta detectar si el usuario ``anonymous`` está **habilitado**, lo cual no es así en este caso. 

Una vez hecho todo el escaneo con ``Nmap`` y verificar que el *puerto 21* está abierto y que este no posee el usuario ``anonymous`` habilitado lo que vamos a hacer es comenzar con el uso de fuerza bruta con la herramienta ``Hydra``.

#### Herramienta ``Hydra``

**``Hydra``** es una herramienta de pruebas de penetración de código abierto que **se utiliza para realizar ataques de fuerza bruta contra sistemas y servicios protegidos por contraseña**. La herramienta es altamente personalizable y **admite una amplia gama de protocolos de red, como HTTP, FTP, SSH, Telnet, SMTP, entre otros**.

La utilización de la herramienta Hydra es bastante intuitiva:

Con **``-l``** indicamos el usuario, si usamos **``l minúscula``** significa que sabemos el usuario, si usamos **``L mayúscula``** significa que adjuntaremos un diccionario para hacer fuerza bruta en el)

Con **``-p``** indicamos la contraseña, si usamos **``p minúscula``** significa que sabemos la contraseña, si usamos **``P mayúscula``** significa que adjuntaremos un diccionario para hacer fuerza bruta en ella.

Con **``-t``** indicamos la cantidad de hilos.

En este caso usaremos **``hydra -l c4sp -P rockyou.txt "ftp://127.0.0.1 -t 15"``** y esperaremos hasta que nos diga cual contraseña es la correcta dentro de nuestro diccionario.

![[Hydra Passwd Success.png]]

----
### Caso FTP usuario INVITADO (anonymous)

Seguiremos las instrucciones dadas por el GITHUB utilizando el comando dado para usar la imagen en Docker.
Luego de que el contenedor se encuentre activo procederemos a hacer un escaneo con **nmap** para un reconocimiento con la utilización de scripts básicos **``-sC``**, para ver las versiones y servicios **``-sV``** del **puerto 21**. Recordemos que esto lo hacemos ya que queremos detectar que el usuario anonymous está habilitado, ya que esta imagen montada del servidor FTP lo posee.

![[Nmap Anonymous check.png]]

De esta forma podremos ingresar usando **``ftp 127.0.0.1``** y proporcionando la credencial **``anonymous``**, y en contraseña solo presionamos **``enter``**.

---------
# Enumeración del servicio SSH (22)

> El protocolo **SSH** se encuentra en el **puerto 22** por defecto y viene de **Secure Shell**, es un protocolo de administración remota que permite a los usuarios **controlar** y **modificar** sus servidores remotos a través de Internet mediante un mecanismo de **autenticación seguro**. SSH utiliza **técnicas criptográficas** para garantizar que todas las comunicaciones hacia y desde el servidor remoto estén cifradas.

Desplegaremos un **contenedor con el uso de Docker que posee un servidor con SSH** https://hub.docker.com/r/linuxserver/openssh-server, permitiéndonos con el código brindado poder modificar usuario, contraseña, entre otras características. Como no usaremos todas las características que nos ofrecen, modificaremos el codigo para que nos quede tal que así

```bash
docker run -d \
  --name=openssh-server \
  --hostname=hack4you-academy \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Etc/UTC \
  -e PASSWORD_ACCESS=true \
  -e USER_PASSWORD=spider \
  -e USER_NAME=s4vitar \
  -p 2222:2222 \
  -v /path/to/appdata/config:/config \
  --restart unless-stopped \
  lscr.io/linuxserver/openssh-server:latest
```

Ahora la forma de conectarnos para verificar que funcione este "laboratorio" sería **``ssh s4vitar@127.0.0.1 -p 2222``**, luego nos pedirá la contraseña que en este caso es **spider**

Ahora lo que nos resta hacer es utilizar ``Hydra`` para ejercer fuerza bruta y poder conseguir la contraseña (Que ya la sabemos pero es a modo de prueba)

- **``hydra -l s4vitar -P /usr/share/wordlists/rockyou.txt ssh://127.0.0.1 -s 2222 -t 15``**

El **``-s``** significa **"Port"** en la herramienta **``Hydra``**, ==se utiliza este parámetro cuando el servicio, en este caso SSH no está corriendo por su puerto por defecto==, en este caso **nosotros estamos corriendo el servicio SSH por el puerto 2222**, como lo especificamos en el codigo de docker.
De esta forma ya nos encontraría la contraseña correcta.

---
### Investigación del Code Name

Un dato importante que podemos obtener en la fase de reconocimiento mientras auditamos el servicio SSH, es el **Code Name**. 

Cuando nosotros encontramos un servicio SSH o un HTTP, entre otros. Cuando ves la versión de Apache, de Nginx o la versión del SSH, lo que podes hacer es averiguar cual es el **Code Name**. Por ejemplo puede ser que estés antes una maquina que es **Linux, que corre un Ubuntu**, un Debian o otros, ==lo que tenemos que tener presente es que estos SO poseen diferentes versiones, Ubuntu Trusty, Ubuntu Focal, Ubuntu Xenial, y muchos mas, al igual que con Debian y con todos==, por lo tanto ==cuando aplicamos una fase de reconocimiento viene bien averiguar cual es el Code Name==, ya que a pesar de no brindarte ventaja es buena información de cara a encontrar una vulnerabilidad en la versión que posee o meramente saber y tener la información frente a lo que te estés enfrentando.

Para poder mostrar un ejemplo lo que haremos será montar un contenedor de manera manual, ==creando el archivo 'Dockerfile' y modificándolo", para asignarle una versión especifica a nuestro SO y ver de esta forma el Code Name== con la herramienta web "``Launchpad``"

Primero lo que haremos será buscar por google las diferentes versiones de Ubuntu existentes, para poder instalar una que queramos en nuestro contenedor a modo de ejemplo. https://hub.docker.com/_/ubuntu. En este caso elegimos **Ubuntu 14.04**

```dockerfile
FROM ubuntu:14.04

MAINTAINER Santiago Piñeiro aka C4sp "santiagopineiro2001@gmail.com"

EXPOSE 22

RUN apt update && apt install ssh -y

ENTRYPOINT service ssh start && /bin//bash
```

--------
#### Ejecución del contenedor

Una vez que ya hayamos configurado el archivo DockerFile, procederemos a montar la imagen con el siguiente comando

- **``docker build -t my_ssh_server .``** 

Recordemos que el punto final indica que busque el archivo **Dockerfile** en el directorio actual.

Luego lo ejecutamos con PortForwarding incluido, y debido a que en MI MAQUINA tengo **el puerto 22 ocupado**, debo cambiarlo por otro puerto que esté libre como el **puerto 1234**.

- **``docker run -dit -p1234:22 --name container-name my_ssh_server``**

==-p1234:22 estamos indicando que el puerto 1234 de "NUESTRA MAQUINA" se convierta en el puerto 22 "DEL CONTENEDOR"==

Una vez que hagamos esto, no vamos a intentar hacer **Fuerza bruta**, lo que hacemos con este ejemplo es **averiguar mediante el uso de la herramienta ``nmap`` con un escaneo de reconocimiento, que tipo de servicio corre y que versión en el puerto 1234** que es el que establecimos para poder averiguar el **Code name** con la herramienta web **Launch Pad**

![[Resultados de busqueda de versiones con Launchpad 1.png]]

![[Resultados de busqueda de versiones con Launchpad 2.png]]

Donde está marcado con rojo nos puede llegar a listar que nombre de Code Name posee la versión
En mi caso es "**Trusty**" una **distribución de Ubuntu**.

Otro ejemplo, si la versión del servidor SSH es “**OpenSSH 8.2p1 Ubuntu 4ubuntu0.5**“, podemos determinar que el sistema está ejecutando una distribución de Ubuntu. El número de versión “**4ubuntu0.5**” se refiere a la revisión específica del paquete de SSH en esa distribución de Ubuntu. A partir de esto, podemos identificar el **codename** de la distribución de Ubuntu, que en este caso sería “**Focal**” para Ubuntu 20.04.

------------
# Enumeración del servicio HTTP y HTTPS (80,443)

> **HTTP** (**Hypertext Transfer Protocol**) es un **protocolo de comunicación utilizado para la transferencia de datos en la World Wide Web**. Se utiliza para la transferencia de contenido de texto, imágenes, videos, hipervínculos, etc. El puerto predeterminado para **HTTP es el puerto 80**.

> **HTTPS** (**Hypertext Transfer Protocol Secure**) es una **versión segura** de HTTP que **utiliza SSL / TLS para cifrar la comunicación entre el cliente y el servidor**. Utiliza el **puerto 443 por defecto**. La principal diferencia entre HTTP y HTTPS es que **HTTPS utiliza una capa de seguridad adicional para cifrar los datos**, lo que los hace más seguros para la transferencia.

En el **caso del servicio HTTPS** que posee certificado **SSL / TLS** se pueden utilizar **varias herramientas para poder conseguir mas información** acerca de este.

**OpenSSL** es una herramienta que **se utiliza para inspeccionar el certificado SSL, pudiendo llegar a ver subdominios, correos, etc**. Se puede utilizar a modo de ejemplo de la siguiente manera para el dominio "tinder.com"

- **``openssl s_client -connect tinder.com:443``**

**``SSLyze``** es una herramienta de análisis de seguridad SSL que se utiliza para evaluar la configuración SSL de un servidor. Proporciona información detallada sobre el cifrado utilizado, los protocolos admitidos y los certificados SSL. ==(Suele tardar)==

- **``sslyze tinder.com``**

**``SSLscan``** es otra herramienta de análisis de seguridad SSL que se utiliza para evaluar la configuración SSL de un servidor. Proporciona información detallada sobre los protocolos SSL / TLS admitidos, el cifrado utilizado y los certificados SSL. Identifica de manera rápida posibles vulnerabilidades del dominio, como por ejemplo HearthBleed ==(LA MEJOR)==

- **``sslscan tinder.com``**

La principal diferencia entre **``SSLyze``** y **``SSLscan``** es que sslyze se enfoca en la **evaluación** de la seguridad SSL/TLS de un servidor web mediante una exploración exhaustiva de los protocolos y configuraciones SSL/TLS, mientras que sslscan se enfoca en la **identificación** de los **protocolos** SSL/TLS admitidos por el servidor y los cifrados utilizados.

Siempre **hay que prestar atención a la versión del SSL, porque a veces se utilizan versiones que no corresponden** o desactualizadas y son propensas a **``PuddleAttack``**, **``HeartBleed``**, etc.

**Heartbleed** es una vulnerabilidad de seguridad que **afecta a la biblioteca OpenSSL y permite a los atacantes acceder a la memoria de un servidor vulnerable**. Si un servidor web es vulnerable a Heartbleed y lo detectamos a través de estas herramientas, esto significa que un atacante podría potencialmente acceder a información confidencial, como claves privadas, nombres de usuario y contraseñas, etc.

----
## Montando laboratorio con vulnerabilidad HeartBleed

Utilizaremos el docker-compose de https://github.com/vulhub/vulhub/tree/master/openssl/CVE-2014-0160
Clonaremos con **``svn checkout``** el directorio especifico 
Lo ejecutamos con **``docker-compose up -d``**

Como en el archivo **``docker-compose``** el puerto asignado para montar el servidor HTTPS con HeartBleed es el **8443** debemos hacer lo siguiente

- **``sslscan 127.0.0.1:8443``**

De esta forma chequearemos que es vulnerable al HeartBleed con la herramienta SSLscan

Con le herramienta **``Nmap``** también podemos identificar si un dominio con certificado SSL es vulnerable al HeartBleed, ya que posee un script llamado **``ssl-heartbleed.nse``** el cual podemos ejecutar con el siguiente comando

- **``nmap -p8443 --script ssl-heartbleed.nse 127.0.0.1``**

------------
# Enumeración del servicio SMB

> **SMB** significa **Server Message Block**, es un **protocolo de comunicación de red** utilizado para **compartir archivos**, impresoras y otros recursos entre dispositivos de red. Es un protocolo propietario de **Microsoft** que se utiliza en sistemas operativos **Windows**.

> **Samba** es una implementación libre y de código abierto del **protocolo SMB**, que se utiliza principalmente en sistemas operativos basados en **Unix** y **Linux**. Samba **proporciona una manera de compartir archivos y recursos entre dispositivos de red que ejecutan sistemas operativos diferentes**, como **Windows** y **Linux**.

Cabe destacar que esto siempre genera confusión **Samba** y **SMB** ==NO SON LO MISMO==

Cuando nosotros estemos analizando una maquina, y veamos que el **puerto 445** está abierto podemos usar 
**``smbclient``** para tratar de listar **``-L``** los **recursos compartidos existentes a nivel de red del lado de nuestro equipo** (127.0.0.1). Vamos a agregarle a todo esto un **NullSession**, ya que **no disponemos de credenciales validas** **``-N``**.

- **``smbclient -L 127.0.0.1 -N``**

Con la información que esto nos brinda, podríamos conectarnos a "``myshare``" que es el recurso compartido para ver que hay dentro, tratar de subir contenido, descargarlo, etc. 

Como no sabemos si tiene capacidad de "Lectura" o de "Escritura", podemos utilizar otra herramienta llamada
**``smbmap``** esta herramienta te reportará **lo mismo que ``smbclient``** pero es mas cómoda **porque vemos los permisos que posee el recurso compartido "``myshare``"**, en este caso **``READ``**, **``WRITE``** por lo tanto **sabemos que tenemos capacidad de listar los recursos compartidos que hay dentro de esta carpeta**, y también **podemos escribir adentro (Meter contenido)**

Para poder conectarnos al recurso compartido "``myshare``" podemos usar "``smbclient``"

- **``smbclient //127.0.0.1/myshare -N``**

De esta manera **estaremos dentro**, podremos utilizar **los mismos comandos que con FTP** (**``dir``/ ``get`` / ``put`` / ``ls``**)
En este caso al hacer un **``dir``** veremos que **no hay nada**, por ende subiremos algo a modo de ejemplo **``Prueba.txt``**
A tener en cuenta que si queremos subir un archivo al directorio compartido, **debemos estar en el mismo directorio donde se encuentra ese archivo**, de lo contrario no nos dejará.

**``put Prueba.txt``** y con "``dir``" chequeamos que se subió, si por algún motivo borramos el archivo "``Prueba.txt``" de nuestra maquina, quedará en el contenedor, por ende podemos volver a pasarlo desde el contenedor a la maquina con la siguiente sintaxis.

- **``get Prueba.txt``**

Algo que podemos hacer a la hora de querer listar todos los directorios, sub directorios, archivos y demás, porque **puede ser un caos irnos moviéndonos con CD** y otros pocos comandos que disponemos, es **utilizar monturas**, igual que cuando usábamos el parámetro **``-v``** para crear una montura, podemos instalar lo siguiente 

- **``apt install cifs-utils``**

Jugamos con **``mount -t cifs``** para indicar que la montura será de tipo **``cifs``** para jugar con este recurso compartido a nivel de red por **``Samba``** en este caso para **traerme la carpeta en cuestión, a una ruta de mi equipo y hacerla accesible**.
==Creamos un directorio a modo de ejemplo en ``/mnt/mounted``== y luego utilizamos la montura de esta manera

- **``mount -cifs //127.0.0.1/myshare /mnt/mounted``**

De esta forma indicamos que queremos que lo que está en nuestro equipo **(//127.0.0.1)** en el directorio ``/myshare`` nos lo monte en el **directorio** ``/mnt/mounted`` de **nuestra maquina**. Una vez hecho esto nos pedirá contraseña pero como no poseemos credenciales validas, **es como si estuviésemos con una sesión NULA, le damos enter**.

Si queremos que no nos pida contraseña la montura, podemos colocar lo siguiente

- **``mount -cifs //127.0.0.1/myshare /mnt/mounted -o username=null,password=null,domain=,rw``**

Indicando de esta manera con opciones **(``-o``)** que el **usuario es nulo**, la **contraseña es nula**, **el dominio (No poner nada)**, y que **posea capacidad de read, write** "**``rw``**"

De esta manera si miramos con **``ls -la /mnt/mounted``** veremos que **ahí está el contenido del directorio compartido** **``myshare``**
Recordemos que a través de monturas, si nosotros borramos este archivo o lo manipulamos, estamos manipulando el ORIGINAL.

Ahora si, si tuviésemos en nuestro directorio compartido muchos directorios, archivos y demás, como no podemos listarlos (Porque no hay un comando dentro cuando usamos "``smbclient``"), con esta montura hecha, **tendremos acceso en este caso a los directorios y archivos** del directorio compartido **myshare** en **nuestra maquina en el directorio ``/mnt/mounted``**, por ende **podríamos usar el comando "``tree``" para ver todos los archivos desde nuestra maquina**.

Ahora para desmontarlo podemos usar 

- **``umount ruta/donde/está/la/montura``** en este caso **``/mnt/mounted``** y lo verificamos con **``ls -la /mnt/mounted``**

--------