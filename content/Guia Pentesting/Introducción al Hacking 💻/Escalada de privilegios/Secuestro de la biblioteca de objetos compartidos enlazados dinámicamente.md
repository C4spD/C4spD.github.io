------
- Tags: #privilege #escalation 
-----
# Definición

> Las **bibliotecas compartidas** son archivos que contienen funciones y recursos utilizados por múltiples programas. Cuando un programa requiere una función de una biblioteca compartida, el sistema operativo busca la biblioteca y enlaza dinámicamente la función requerida durante la ejecución del programa. Sin embargo, si el sistema no encuentra la biblioteca en las rutas predeterminadas, puede buscarla en otros directorios.

Un atacante puede aprovechar esta situación creando una **biblioteca compartida maliciosa** con el mismo nombre que la biblioteca legítima y colocándola en un directorio donde el sistema la buscará. Cuando el programa intenta cargar la biblioteca, el sistema cargará la versión maliciosa en lugar de la legítima, permitiendo al atacante ejecutar código malicioso con los privilegios del programa víctima.
# Ejemplo

Vamos a ir a la siguiente [web](https://attackdefense.com/) y nos registraremos, una vez dentro buscaremos por la máquina llamada **Library Chaos** y le daremos a ejecutar para que se nos brinde una consola interactiva dentro de ella.

Nuestro objetivo es intentar **secuestrar una librería dinámica** que se está intentando utilizar en un script llamado "**welcome**" dentro de la máquina.

![[Biblioteca 1.png]]

Como vemos, el script no encuentra la librería que está dentro de el, nosotros podemos aprovecharnos de esto para crear una **librería maliciosa** que realiza una acción que nosotros indiquemos.

Podemos utilizar la herramienta ``ldd`` para ver más información sobre el binario. 

- La **herramienta** `ldd` en Linux se utiliza para mostrar las dependencias de bibliotecas compartidas (o **shared libraries**) de un ejecutable o de una biblioteca compartida. En otras palabras, te dice qué bibliotecas necesita un programa para ejecutarse.

![[Biblioteca 2.png]]

Esta librería por defecto la busca en el directorio ``/home/student/lib`` por lo tanto dentro podríamos **crear un script** en ``C`` que realice una acción que nosotros queramos. Además el script **welcome** posee permisos **SUID** y el propietario es **root**, por lo que si nosotros llegáramos a hacer que el script ejecutara un ``bash -p``, nos convertiríamos en dicho usuario ya que sería root el que ejecute el comando.

![[Biblioteca 3.png]]

Luego con ``gcc`` convertiríamos nuestro script en binario y solo quedaría meterlo en la ruta ``/home/student/lib`` y luego ejecutar el script **welcome** para que automáticamente busque en esa ruta por la biblioteca, y es ahí donde tomará nuestro script malicioso llamado **libwelcome.so**

- ``gcc -fPIC -shared test.c -o libwelcome.so``

![[Biblioteca 4.png]]