------
- Tags: #privilege #escalation
------
# Definición

> Cuando hablamos de ‘**Python Library Hijacking**‘, a lo que nos referimos es a una técnica de ataque que aprovecha la forma en la que Python busca y carga bibliotecas para inyectar código malicioso en un script. El ataque se produce cuando un atacante crea o modifica una biblioteca en una ruta accesible por el script de Python, de tal manera que cuando el script la importa, se carga la versión maliciosa en lugar de la legítima.

La forma en que el ataque se lleva a cabo es la siguiente: el atacante busca una biblioteca utilizada por el script y la reemplaza por su propia versión maliciosa. Esta biblioteca puede ser una biblioteca estándar de Python o una biblioteca externa descargada e instalada por el usuario. El atacante coloca su versión maliciosa de la biblioteca en una ruta accesible antes de que la biblioteca legítima sea encontrada.

En general, Python comienza buscando estas bibliotecas en el directorio actual de trabajo y luego en las rutas definidas en la variable ``sys.path``. Si el atacante tiene acceso de escritura en alguna de las rutas definidas en ``sys.path``, puede colocar allí su propia versión maliciosa de la biblioteca y hacer que el script la cargue en lugar de la legítima.

Además, el atacante también puede crear su propia biblioteca en el directorio actual de trabajo, ya que Python comienza la búsqueda en este directorio por defecto. Si durante la carga de estas librerías desde el script legítimo, el atacante logra secuestrarlas, entonces conseguirá una ejecución alternativa del programa.

---
# Ejemplo

Imaginemos que tenemos **dos usuarios** además del usuario root en nuestro sistema o contenedor, lo que vamos a intentar es hacer un **User Pivoting** para saltar de un usuario X a otro, específicamente del usuario *c4sp* al usuario *manolito*.

Lo primero que vamos a hacer para este ejemplo es **agregar** en el ``/etc/sudoers`` una especificación que indique que el usuario *c4sp* **puede ejecutar un script en python3** de *manolito* ubicado en la ruta ``/tmp/`` llamado *example.py*.

![[PLH 1.png]]

Si nosotros siendo el usuario *c4sp* hacemos un ``sudo -l`` para ver nuestros privilegios veremos que podemos **ejecutar** ese script llamado **example.py**.

----

Siendo el usuario *manolito* crearemos ese script, que contendrá algo super sencillo para entender el concepto de **Python Library Hijacking**.

```python
import hashlib

if __name__ == '__main__':

	cadena = "Hola esta es mi cadena"
	
	print(hashlib.md5(cadena.encode()).hexdigest())
```

Este script lo que hace es convertir la variable "cadena" a **MD5** al ejecutarlo, todo esto gracias a que importa la librería ``hashlib``.

**Generación de hashes**: La librería ``hashlib`` soporta varios algoritmos de hash criptográfico como:

- **MD5** (`md5`)
- **SHA-1** (`sha1`)
- **SHA-224**, **SHA-256**, **SHA-384**, **SHA-512** (familia ``SHA-2``)
- **BLAKE2** (`blake2b`, `blake2s`)

--------

Nosotros como el usuario *c4sp* lo que vamos a intentar es **aprovecharnos de esa librería** para tener **acceso** al usuario *manolito*.

Como ya sabemos, al tener el privilegio a nivel de **sudoers**, podemos hacer un ``sudo -u manolito python3 /tmp/example.py`` para ejecutar su script, y aunque no se vea a simple vista, esto supone un riesgo.

Lo que podemos hacer es ver el **PATH** de las librerías de **python3** en orden de prioridad de **izquierda a derecha**, al igual que sucede en el PATH del sistema, esto se puede hacer de la siguiente forma.

- ``python3 -c 'import sys; print(sys.path)'``

``['', '/usr/lib/python312.zip', '/usr/lib/python3.12', '/usr/lib/python3.12/lib-dynload', '/usr/local/lib/python3.12/dist-packages', '/usr/lib/python3/dist-packages']``

Como vemos a la izquierda del todo se indica un campo ``''`` este hace alusión al **directorio actual en donde fue ejecutado el script**, es decir que **Python** al intentar importar una librería, como primer instancia **busca una coincidencia dentro del directorio actual**.

Si hacemos un ``locate hashlib.py`` veremos que la ruta en donde está almacenada la librería es ``/usr/lib/python3.12/hashlib.py`` por lo tanto algo que podríamos hacer **si tuviéramos permiso de escritura en los directorios previos a ese del PATH** es crear un archivo llamado ``hashlib.py`` y **modificarlo** agregándole una **instrucción maliciosa**, pero como no es el caso lo explotaremos a través de la **jerarquía del PATH**, es decir, creando un archivo llamado ``hashlib.py`` en **el mismo directorio** en donde se encuentra el script ``example.py`` de *manolito*, de esta manera encontrará primero nuestra "**librería maliciosa**" y la importará en lugar de la original.

Nuestro archivo ``hashlib.py`` **malicioso** tendrá este contenido, por lo tanto al ser interpretado por nosotros como *manolito* por el privilegio de **sudoers**, será el usuario *manolito* el que nos de una **consola privilegiada**.

```python
import os
os.system("bash -p")
```

Por lo tanto si ejecutamos el script con el usuario *c4sp* aprovechándonos de nuestro privilegio con ``sudo -u manolito python3 /tmp/example.py`` tendremos acceso al usuario *manolito*.

![[PLH 2.png]]

------

Si tuviésemos permiso de escritura en el directorio donde se encuentra la librería podríamos editar el script y agregarle la instrucción maliciosa tal que así.

![[PLH 3.png]]