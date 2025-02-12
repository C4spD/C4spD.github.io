----
- Tags: #owasp #vulnerabilidades #web
--------
# Definición

> El **Squid Proxy** es un servidor web **proxy-caché** con licencia **GPL** cuyo objetivo es funcionar como **proxy** de la red y también como zona caché para almacenar páginas web, entre otros. Se trata de un servidor situado entre la máquina del usuario y otra red (a menudo Internet) que actúa como protección separando las dos redes y como zona caché para acelerar el acceso a páginas web o poder restringir el acceso a contenidos.

Es decir, la función de un servidor proxy es **centralizar el tráfico de una red local hacia el exterior** (==Internet==). Sólo el equipo que incorpora el servicio proxy debe disponer de conexión a Internet y el resto de equipos salen a través de él:

![[Squid 1.png]]

Ahora bien, puede darse el caso en el que un servidor Squid Proxy se encuentre **mal configurado**, permitiendo en consecuencia a los atacantes recopilar información de dispositivos a los que normalmente no deberían tener acceso.

Por ejemplo, en este tipo de situaciones, un atacante podría ser capaz de realizar peticiones a direcciones IP internas pasando sus consultas a través del Squid Proxy, pudiendo así realizar un escaneo de puertos contra determinados servidores situados en una **red interna**.

Para ello, simplemente podríamos probar a hacer uso de extensiones de navegador como **FoxyProxy** o desde consola haciendo uso del comando ``curl``:

-   `curl --proxy http://10.10.11.131:3128 http://<ip>:<port>`

En el mejor de los casos, si la conexión no requiere de autenticación, podríamos llevar a cabo una enumeración de puertos en servidores internos concretos, siendo necesario sustituir ``<port>`` por el puerto deseado que se desea enumerar del servidor ``<ip>`` correspondiente. En caso de requerir autenticación, si el atacante dispone de las credenciales, estas podrían ser especificadas haciendo uso del parámetro ``-u``.

Todo esto es posible debido a que el proxy actúa como intermediario entre la red **local** y la **externa**, lo que en parte permite el acceso a ciertos recursos internos que normalmente no estarían disponibles desde el exterior.

Sin embargo, es importante tener en cuenta que el acceso a estos recursos a través del proxy puede estar restringido por políticas de seguridad, autenticación u otros mecanismos de control de acceso. Además, si el proxy está configurado correctamente, es probable que no permita el acceso a recursos internos desde el exterior, **incluso si se está pasando a través de él**.

Una de las herramientas que se suelen emplear para enumerar puertos de un servidor concreto pasando por el Squid Proxy es ``spose`` 

- **Herramienta Spose**: [https://github.com/aancw/spose](https://github.com/aancw/spose).

**Spose** es una herramienta de escaneo de puertos diseñada específicamente para trabajar a través de servidores Squid Proxy. Esta herramienta permite a los atacantes buscar posibles servicios y puertos abiertos en una red interna “protegida” por un servidor Squid Proxy.
# Explotación de Squid Proxy a través de máquina de Vulnhub

Lo primero que haremos será descargar esta [máquina](https://www.vulnhub.com/entry/sickos-11,132/) vulnerable de **Vulnhub** para luego instalar el ``.OVA`` en **VMware**, luego solo quedaría prenderla y listo.

----

Empecemos por la etapa de **reconocimiento** como cuando comenzamos a hacer cualquier máquina, vamos a efectuar un **escaneo en nuestra red local** con ``arp-scan -I ens33 --localnet --ignoredups``, una vez detectada la máquina que corre por VMware copiaremos la IP y realizaremos el escaneo básico con la herramienta **Nmap** ``nmap -p- --open -sS -vvv --min-rate 5000 -n -Pn machine-ip``, por ultimo efectuamos un escaneo algo más especifico hacia los puertos que detectamos abiertos detectando servicios y versiones que corren por dichos puertos ``nmap -p22,3128 -sCV 192.168.0.102 ``, de esta manera detectaríamos que por el *puerto 3128* corre un servicio llamado ``http-open-proxy``.

![[Squid 2.png]]

Lo más importante que tenemos que tener en cuenta a la hora de encontrar un **Proxy** como servicio es que si no está bien sanitizado, podríamos llegar a **listar recursos internos de la red** utilizando este **Squid Proxy** como **Proxy**, para ver que otros puertos se encuentran **abiertos de manera interna**. Si nosotros pasamos a través de el tal vez nos encontremos con algún *servicio Web HTTP* pero que **esté corriendo detrás del Squid Proxy únicamente**, hay casos en los que se suele solicitar autenticación y casos en los que no.

Por lo tanto para comenzar a hacer eso, lo que haremos será **añadir un nuevo Proxy** a nuestra extensión de navegador **FoxyProxy** que apunte hacia el *puerto 3128* que es el que corresponde al Squid Proxy que encontramos en la máquina.

![[Squid 3.png]]

Ahora si vamos a nuestra URL, activamos nuestro FoxyProxy con el nuevo Proxy y por ejemplo vamos a *192.168.0.102:80* veremos que podremos ver el contenido del *puerto 80* de la máquina, cuando **Nmap** no nos lo había reportado, todo esto lo pudimos hacer **por estar pasando la petición a través del Proxy de la máquina victima**.

Esto también lo podríamos hacer con el comando ``curl`` tal que así ``curl http://192.168.0.102 --proxy http://192.168.0.192:3128``

![[Squid 4.png]]

-------

Luego de conseguir configurar el Proxy de la máquina en nuestro navegador, realicemos un **escaneo de directorios** para la *192.168.0.102:80* con la herramienta ``gobuster`` pero sin olvidarnos de especificarle a la herramienta que estamos con un Proxy con el parámetro ``--proxy http://192.168.0.102:3128``.

- ``gobuster dir -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt --proxy http://192.168.0.102:3128 -u 192.168.0.102:80 -t 10``

![[Squid 5.png]]

Por lo tanto con estos directorios tenemos mas información que solo es accesible a través del Proxy.

--------

Sin ingresamos al directorio */robots*, veremos que en el código se ve una ruta llamada */wolfcms*, probemos ingresar a ella.

![[Squid 6.png]]

Por lo tanto de esta manera seguiríamos viendo contenido gracias a que pasamos las consultas por el Proxy.

------

Ahora lo interesante es ¿Cómo nosotros podríamos llegar a enumerar **todos los puertos internos de la máquina pasando por el Proxy** pero frente a la herramienta **Nmap**? La respuesta es con un Script, en mi caso será de **Python3**.

```python
#!/usr/bin/python3

import sys, signal, requests

def def_handler(sig, frame):
    print("\n\n[!] Saliendo...")
    sys.exit(1)

# Ctrl+C
signal.signal(signal.SIGINT, def_handler)

main_url = 'http://192.168.0.102'
squid_proxy = {'http': 'http://192.168.0.102:3128'}

def portDiscovery():

    puertos_comunes = {20, 21, 22, 23, 25, 53, 67, 68, 69, 80, 110, 119, 123, 137, 138, 139, 143, 161, 162, 179, 389, 443, 445, 465, 514, 515, 993, 995, 1080, 1194, 1433, 1434, 1521, 1723, 2049, 3306, 3389, 389, 443, 465, 514, 1433, 1434, 1521, 3306, 3389, 5900, 8080, 8443, 10000}

    for tcp_port in puertos_comunes:
        
        r = requests.get(main_url + ':' + str(tcp_port), proxies=squid_proxy)

        if r.status_code != 503:
            print("\n[+] Open Port -> " + str(tcp_port))

if __name__ == '__main__':

    portDiscovery()
```

--------

No olvidemos que hay veces en las que vamos a tener que **autenticarnos** en el Proxy ya que puede estar más protegido, esto se realiza proporcionando las credenciales válidas a través de la misma **URL** por lo tanto lo haríamos de la siguiente forma.

``- curl http://192.168.0.102 --proxy http://user:password@192.168.0.102:3128``