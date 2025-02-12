------
- Tags: #virtualhosting #gobuster #pensamiento-lateral #mysql #hashcat
-----
# Resolución

-----
> En esta máquina se consiguen **credenciales fugadas** a través de un puzzle de inteligencia viendo como se envían los datos en la web, aprovechando la conexión entre diferentes servicios entre si.
> En la escalada de privilegios detectamos credenciales de una base de datos **mysql** en un archivo *config.json*, de esta forma accedimos a credenciales cifradas que intentamos descifrar con diccionarios comunes. Gracias a una pista de la web que nos indica que la contraseña del usuario root no se puede descifrar con el diccionario *rockyou.txt* utilizamos la herramienta **hashcat** para crear patrones similares a la contraseña que habíamos utilizado previamente, de esta forma conseguimos la clave del usuario root.
---

## Reconocimiento

### OS

**LINUX**
```shell
ping -c 1 10.10.10.222
PING 10.10.10.222 (10.10.10.222) 56(84) bytes of data.
64 bytes from 10.10.10.222: icmp_seq=1 ttl=63 time=254 ms

--- 10.10.10.222 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 253.894/253.894/253.894/0.000 ms
```

### NMAP

**Puertos**
```ruby
# Nmap 7.94SVN scan initiated Tue Dec 10 19:55:00 2024 as: nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn -oN allPorts 10.10.10.222
Nmap scan report for 10.10.10.222
Host is up, received user-set (0.26s latency).
Scanned at 2024-12-10 19:55:00 -03 for 15s
Not shown: 65532 closed tcp ports (reset)
PORT     STATE SERVICE REASON
22/tcp   open  ssh     syn-ack ttl 63
80/tcp   open  http    syn-ack ttl 63
8065/tcp open  unknown syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
# Nmap done at Tue Dec 10 19:55:15 2024 -- 1 IP address (1 host up) scanned in 15.16 seconds
```

**Servicios**
```ruby

```

### Virtual Hosting

**``10.10.10.222``** --> **``helpdesk.delivery.htb``**

### Whatweb

```python
whatweb http://helpdesk.delivery.htb/
http://helpdesk.delivery.htb/ [200 OK] Bootstrap, Content-Language[en-US], Cookies[OSTSESSID], Country[RESERVED][ZZ], HTML5, HTTPServer[nginx/1.14.2], HttpOnly[OSTSESSID], IP[10.10.10.222], JQuery[3.5.1], PoweredBy[osTicket], Script[text/javascript], Title[delivery], UncommonHeaders[content-security-policy], X-UA-Compatible[IE=edge], nginx[1.14.2]

------------------------------------------------

whatweb 10.10.10.222
http://10.10.10.222 [200 OK] Country[RESERVED][ZZ], Email[jane@untitled.tld], HTML5, HTTPServer[nginx/1.14.2], IP[10.10.10.222], JQuery, Script, Title[Welcome], nginx[1.14.2]
```

### Gobuster

```bash
gobuster dir -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -u helpdesk.delivery.htb/ -b=404 -t 100

helpdesk.delivery.htb/scp/login.php ---> Login Panel OSTICKET ---> OSTICKET es código abierto
```

![[Imagenes/Delivery/D 5.png]]

### http://helpdesk.delivery.htb

Disponemos de un panel que nos permite *crear un ticket* de consulta a través de OS Ticket. A su vez también dispones de un panel para realizar un *check de dicho ticket* proporcionando el mail con el que se creó el ticket y el ID del ticket asignado una vez creado.
En mi caso cree una cuenta ``testing@testing.com:testing123`` y cree un ticket cuyo ID es *5565122*. El inconveniente es que no puedo iniciar sesión en la cuenta que cree, ya que me envían un correo de verificación al mail que no tengo acceso.
Algo importante a tener en cuenta es que una vez se crea el ticket **se crea un correo** que contiene el **ID** del ticket ``5565122@delivery.htb``. Nos indican que a través de este si deseamos agregar algo más al ticket enviemos un correo, por lo tanto se intentó crear una cuenta con el mail ``5565122@delivery.htb`` para ver si el correo de verificación aparece dentro del **check** del ticket *5565122* pero no tuvo resultado.

### 10.10.10.222:8065

Dentro de esta URL disponemos de un panel de Login que corresponde a ``Mattermost``. 
**Mattermost** es un servicio de chat en línea de código abierto y alojable por sí mismo con funciones de intercambio de archivos, búsqueda e integración con aplicaciones de terceros.
En la web disponemos de un campo de **Registro** por lo tanto lo completaremos. Una vez hecho esto se nos envía un correo de autenticación al mail que hemos registrado, pero nosotros no tenemos acceso al mismo, por lo tanto entra en juego la web http://helpdesk.delivery.htb con su **Ticket Checker** ya que si registramos el correo ``5565122@delivery.htb`` que previamente conseguimos al enviarse el *correo de verificación*, este **nos llegará al Ticket Checker** y conseguiremos tener una cuenta en **Mattermost**. 

Cuenta de Mattermost: ``5565122@delivery.htb:Testing123456!``

![[Imagenes/Delivery/D 1.png]]

![[Imagenes/Delivery/D 2.png]]

![[Imagenes/Delivery/D 3.png]]

![[Imagenes/Delivery/D 4.png]]

Conseguimos unas **credenciales** ``maildeliverer:Youve_G0t_Mail!`` de lo que parece ser **OSTicket**, recordemos que previamente con ``gobuster`` conseguimos un directorio que nos dirigía a un **panel de login** de **OSTicket**, por lo tanto vamos a probarlas en dicho panel.

![[Imagenes/Delivery/D 6.png]]

Si en la parte superior derecha clickeamos en donde dice *Admin Panel*, podremos ver información útil como la versión del **OSTicket** que disponemos.

![[Imagenes/Delivery/D 7.png]]

----
### SSH (Ganamos acceso a la máquina)

Además de todo lo anteriormente visto, podríamos ver si las credenciales están siendo reutilizadas intentando **autenticarnos en el servicio SSH** que está expuesto de la siguiente forma.

- **``ssh maildeliverer@10.10.10.222``** --> Contraseña: ``Youve_G0t_Mail!``

![[Imagenes/Delivery/D 8.png]]
## Escalada de privilegios

Encontramos la primer **flag** del *``usuario``* ahora procedemos a la escalada hacia el usuario *``root``*.}

----

Si buscamos en la ruta ``/var/www/osticket/`` encontraremos toda la **estructura** de archivos de **OSTicket**, pero dentro de no habrá nada de interés, por lo tanto intentemos buscar la ruta de **Mattermost**.
En mi caso busque en los procesos del sistema con ``ps -faux | grep mattermost`` y encontré la ruta ``/opt/mattermost/bin/mattermost`` por lo tanto ingresaré a ``/opt/mattermost/`` para enumerar poco a poco la información.

Dentro del directorio de **Mattermost** encontramos un directorio **``config``**, ==recordemos== que este directorio la mayoría de las veces **suele tener datos privilegiados como credenciales** de bases de datos, credenciales de usuarios, etc. Dentro de este hay un archivo *``config.json``* en el que pudimos encontrar credenciales de lo que parece ser una base de datos **mysql**.

![[Imagenes/Delivery/D 9.png]]

En este caso se nos indica que las credenciales son ``mmuser:Crack_The_MM_Admin_PW`` por lo tanto intentaremos autenticarnos.

- **``mysql -ummuser -pCrack_The_MM_Admin_PW``**

![[Imagenes/Delivery/D 10.png]]

Ingresamos correctamente, por lo tanto ahora es cuestión de indagar en las bases de datos, tablas y columnas.

![[Imagenes/Delivery/D 11.png]]

Ya poseemos la credencial de **``root``** pero está **cifrada**, por lo tanto debemos **crackearla**, para esto meteremos dicha credencial en un archivo llamada **``hash``**

-------

Como no se puede crackear dicha contraseña ya que no se encuentra en el diccionario de **``rockyou.txt``**, debemos recurrir a otro método.
Previamente al ingresar a la cuenta de **Mattermost** vimos que nos indicaban que se solían utilizar contraseñas similares a ``PleaseSubscribe!`` y que dicha contraseña no esta en el diccionario ``rockyou.txt``, por lo tanto utilizaremos otra herramienta.

### Hashcat

En este caso particular utilizaremos la herramienta **``hashcat``** que sirve para poder crackear contraseñas, realizar fuerza bruta, utilizar **reglas** y patrones para contraseñas y demás.
Lo primero que vamos a hacer es colocar la contraseña ``PleaseSubscribe!`` en un archivo ``pass.txt`` luego haremos lo siguiente.

- **``hashcat --stdout pass.txt -r /usr/share/hashcat/rules/best64.rule > variations.txt``**

De esta forma estamos indicando que la regla (**``-r``**) que vamos a utilizar es la **``best64.rule``** que es una muy recomendada.

![[Imagenes/Delivery/D 12.png]]

Una vez obtengamos el archivo **``variations.txt``** que contiene todas las variables de contraseñas similares a **``PleaseSubscribe!``**, realizaremos un ataque de **fuerza bruta** con este **diccionario personalizado**.

![[Imagenes/Delivery/D 13.png]]

Para realizar el ataque de fuerza bruta con **``hashcat``** primero debemos **identificar el tipo de HASH que se está utilizando** en la contraseña que encontramos previamente. 

``$2a$10$VM6EeymRxJ29r8Wjkr8Dtev0O.1STWb4.4ScG.anuu7v0EFJwgjjO`` --> Contraseña cifrada

Para esto buscaremos en la **lista** de **hashes** de la propia herramienta.

- **``hashcat --example-hashes``**

Pero como hay muchos vamos a filtrar con **``grep``** por una cadena que empiece por **``$2a``** que es como comienza la contraseña que tenemos cifrada.

- **``hashcat --example-hashes | grep '$2a'``**

Ahora con el siguiente comando listaremos unas **líneas más arriba** de los resultados para ver el **número** de **Hash**.

- **``hashcat --example-hashes | grep '$2a' -B 15``**

----

Buscando poco a poco veremos que el más similar es el **``Hash #3200``**

![[Imagenes/Delivery/D 14.png]]

Ahora simplemente realizamos el **ataque de fuerza bruta** con ese **número de Hash** especifico.

- **``hashcat -m 3200 -a 0 hash variations.txt``**

De esta forma le pasamos el número de hash "**3200**", el archivo con el **hash** que contiene la credencial que queremos **crackear** y por último el archivo **variations.txt** con nuestro diccionario.

![[Imagenes/Delivery/D 15.png]]

De esta forma conseguimos la credencial de **``root:PleaseSubscribe!21``** y por lo tanto ganamos acceso total a la máquina Delivery.



