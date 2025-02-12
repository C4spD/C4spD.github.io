----
- Tags: #searchsploit #headerabuse #php #gtfobins
----
# Resolución

## Reconocimiento

### NMAP

**Puertos**
```js
# Nmap 7.94SVN scan initiated Mon Nov 25 17:02:49 2024 as: nmap -p- --open --min-rate 5000 -vvv -n -Pn -oN allPorts 10.10.10.242
Nmap scan report for 10.10.10.242
Host is up, received user-set (0.26s latency).
Scanned at 2024-11-25 17:02:49 -03 for 15s
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
# Nmap done at Mon Nov 25 17:03:04 2024 -- 1 IP address (1 host up) scanned in 14.86 seconds
```

---

**Servicios**
```js
# Nmap 7.94SVN scan initiated Mon Nov 25 17:06:50 2024 as: nmap -sCV -p22,80 -oN services 10.10.10.242
Nmap scan report for 10.10.10.242
Host is up (0.26s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 be:54:9c:a3:67:c3:15:c3:64:71:7f:6a:53:4a:4c:21 (RSA)
|   256 bf:8a:3f:d4:06:e9:2e:87:4e:c9:7e:ab:22:0e:c0:ee (ECDSA)
|_  256 1a:de:a1:cc:37:ce:53:bb:1b:fb:2b:0b:ad:b3:f6:84 (ED25519)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-title:  Emergent Medical Idea
|_http-server-header: Apache/2.4.41 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Mon Nov 25 17:07:05 2024 -- 1 IP address (1 host up) scanned in 15.90 seconds
```

-----
### WHATWEB

```http
http://10.10.10.242 [200 OK] Apache[2.4.41], Country[RESERVED][ZZ], HTML5, HTTPServer[Ubuntu Linux][Apache/2.4.41 (Ubuntu)], IP[10.10.10.242], PHP[8.1.0-dev], Script, Title[Emergent Medical Idea], X-Powered-By[PHP/8.1.0-dev]
```

- **PHP 8.1.0-dev**

## Explotación

### Utilización de ``searchsploit``

Realizamos una búsqueda con la herramienta ``searchsploit`` proporcionando la versión de **PHP** detectada, gracias a esto encontramos que esta posee una vulnerabilidad que desemboca un **RCE** a través de la **adición** de una cabecera llamada ``User-Agentt: zerodiumsystem("whoami")``.

![[Knife 1.png]]

--------

Efectuamos una **Reverse Shell** para ganar acceso de forma interactiva a la máquina víctima.

![[Knife 2.png]]

## Escalada de Privilegios

Una vez dentro de la máquina reclamamos la *flag* del usuario **``james``**, ahora corresponde escalar nuestros privilegios.

Realizamos un **reconocimiento manual** en búsqueda de archivos con privilegios a nivel **SUID** y **SUDOERS**, en el caso del segundo encontramos que nuestro usuario **``james``** posee permisos para ejecutar un binario llamado **``knife``** en la ruta **``/usr/bin/knife``** como usuario ``root``. Realizamos una consulta a la web [Gtfobins](https://gtfobins.github.io/gtfobins/knife/) para indagar si se encuentra información de dicho binario.

![[Knife 3.png]]

En la web encontramos que **se puede realizar una escalada de privilegios** de forma sencilla con privilegios a nivel de **SUDOERS** en el binario **``knife``**, por lo tanto seguimos los pasos.

![[Knife 4.png]]

Ganamos acceso al usuario **root**, por lo tanto **comprometimos la máquina** por completo.