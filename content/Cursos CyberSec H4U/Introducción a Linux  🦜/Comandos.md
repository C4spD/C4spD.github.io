--------
- Tags: #comandos #manipulación #movilidad #Linux
----
# Definición

> Un **comando** se refiere a una **instrucción específica que se proporciona mediante la línea de comandos** (también conocida como **terminal** o **shell** en [[Linux]]) para realizar una tarea específica. Los comandos **son la forma principal de interactuar con el sistema operativo a nivel de texto**.
> Estos comandos a su vez poseen diferentes variaciones dentro de si mismos, llamados **parámetros** que se utilizan para dar un uso especifico al comando escrito.

------
# Comandos mas utilizados en Linux

[Comandos Básicos Web](https://www.bonaval.com/kb/cheats-chuletas/comandos-basicos-linux)

**``echo``** se utiliza para imprimir mensajes o variables en la pantalla. Su función principal es emitir texto o datos a la salida estándar (STDOUT), que generalmente es la pantalla de la terminal.
- **``echo -e``** se utiliza para que permita los caracteres especiales, esto suele ser usado en scripts como por ejemplo permitir los saltos de linea con **``\n``**.
***``whoami``*** muestra el nombre de usuario actual.
***``id``***	muestra información sobre la identidad del usuario y los grupos a los que pertenece.
***``hostname``*** muestra el nombre del host actual.
***``uname``***	 se utiliza para mostrar información sobre el sistema operativo en el que estás trabajando, nombre del sistema, la versión del kernel, la versión del sistema operativo, etc.
- **``uname -a``** muestra toda la información disponible.
***``ifconfig``*** se utiliza para asignar o ver una dirección a una interfaz de red y/o configurar parámetros de interfaz de red.
***``ip``***	es una utilidad para mostrar o manipular enrutamiento, dispositivos de red, interfaces y túneles.
***``netstat``*** muestra el estado de la red.
***``ss``***	sirve para saber el estado de la red, mejor que ``netstat``.
***``ps``*** sirve para mostrar el estado del proceso.
- **``ps -safux``** sirve para listar todos los procesos del sistema.
***``env``*** sirve para mostrar o imprimir el entorno.
***``lsblk``*** Listas de dispositivos de bloqueo.
***``lsusb``*** sirve para listar los dispositivos USB.
***``lsof``*** sirve para enumerar los archivos abiertos.
- **``lsof -i:(numero de puerto)``** te dice que servicio esta corriendo bajo ese puerto, si es que esta abierto.
**``pwd``** brinda el nombre del directorio actual.
**``who``** muestra quién ha iniciado sesión.
**``ls``** muestra todos los directorios y archivos en el lugar actual.
- **``ls -l``** muestra información de todos los directorios y archivos.
- **``ls -la``** muestra información oculta y archivos/directorios ocultos.
- **``ls /ruta/que/querramos/listar``** muestra información de una ruta especifica sin necesidad de estar ahí.
- **``ls -la -t``** muestra todos los archivos de un directorio y los ordena en tiempo de modificación.
**``cd /ruta/a/directorio``** nos permite viajar a la ruta especificada.
- **``cd ..``** nos permite ir un directorio atrás del actual.
- **``cd -``** nos permite volver rápidamente al directorio anterior en el que nos encontrábamos.
**``mkdir nombre-del-directorio``** nos permite crear un directorio.
**``touch nombre-del-archivo``** nos permite crear un archivo.
- **``touch .``** se utiliza para crear un archivo o directorio oculto, solo hay que colocarle un punto al principio del nombre.
**``dir_name=$(mktemp -d)``** Esto nos sirve **cuando nos encontramos en un equipo en el cual no poseemos permisos de escritura**, **creando un directorio temporal propio y poder utilizarlo de laboratorio**. Crearemos un directorio temporal que **se almacena en una variable de entorno**, luego ingresamos al directorio creado previamente con el nombre **``dir_name``** utilizando **cd $dir_name**. Usar **``mktemp -d``** es valido, solo que el directorio seria en dígitos complejos y costaría mas encontrar la ruta en caso de perdida.
**``cat nombre-del-archivo``** para abrir un archivo u directorio o mostrar el contenido existente dentro de este.
**``rm nombre-del-archivo``** nos permite borrar un archivo especifico.
**``rm -r nombre-del-directorio``** nos permite borrar un directorio que tenga contenido dentro de forma recursiva.
**``rmdir``** nos permite borrar un directorio vacío.
**``tree``** nos permite ver el árbol de todos los directorios desde el directorio actual.
**``mv``** nos permite mover o renombrar archivos.
- Para renombrar seria ``mv Prueba Pruebanombre2``.
- Para mover seria ``mv Pruebanombre2 /home/kali/Desktop/``.
- Para mover mas de un archivo a la vez ``mv (Nombre de archivo) (Nombre de archivo) Storage/``.
**``cp``** con este comando podemos copiar y pegar un archivo, ***con un solo uso podemos hacer ambas cosas***
Ejemplo: **``cp /home/kali/storage/user/archivoprueba.txt /home/kali/``** en este caso copiamos **``archivoprueba.txt``** en el directorio **``/home/kali``**.
**``which``** nos brinda la ruta al archivo o enlace para que deba ejecutarse. Esto nos permite determinar si programas específicos están disponibles en el sistema. Si el programa que buscamos no existe no se mostrarán resultados.

**``find``** sirve para buscar archivos/directorios, si colocamos los siguientes parámetros extra podremos conseguir filtrar de forma mas detallada sobre lo que estamos buscando. ==Nota: Se recomienda si estamos en un usuario no privilegiado utilizar la desviación de STDERR "2>/dev/null"==.
[Web de comando "find"](https://www.hostinger.es/tutoriales/como-usar-comando-find-locate-en-linux/)
- **``find /``** sirve para buscar a partir de la RAIZ.
- **``find !``** sirve para filtrar que no contenga la siguiente cualidad ``find ! -executable`` estamos buscando un archivo que no posea la cualidad de ejecutable.
- **``-name``**  sirve para filtrar por nombre de archivos/directorios. ``find / -name (Nombre)``
- **``-type (f/d)``** ``f`` de **file** y ``d`` de **directory**. ``find / -type d``
- **``-perm``** sirve para filtrar por permisos de cada archivo/directorio. ``find / -perm -(Numero Octal)``
- **``-user``** sirve para filtrar por archivos/directorios que contengan ese usuario propietario. ``find / -user (Nombre del usuario)``
- **``-group``** sirve para filtrar por archivos/directorios que contengan ese grupo. ``find / -group (Nombre del grupo)``
- **``-writable``** sirve para filtrar por archivos/directorios que tengan permiso de escritura "``w``". ``find / -user root -writable``
- **``-executable``** sirve para filtrar por archivos/directorios que tengan permiso de ejecución "``x``". ``find / -user root -executable``
- **``-readable``** sirve para filtrar por archivos/directorios que tengan permiso de lectura "``r``". ``find / -user root -readable``

**``locate``** sirve para localizar archivos o carpetas especificas dentro del sistema, con **``sudo updatedb``** actualizamos la base de datos
**``du -hc``** sirve para ver el peso de un archivo especifico.
**``upx``** sirve para reducir el peso de un archivo especifico.
**``&&``**  sirve para poder agregar un comando extra a la linea de comandos, y se ejecutará solo si el comando anterior fue exitoso.
**``!$``** / **``ALT+.``** refiere al último argumento del comando anterior.
**``>``** sirve para enviar todos los resultados de los comandos previos hacia un lugar especifico. ``/ls -la > text.txt`` (Si no existe la carpeta ``text.txt`` se creara automáticamente, y si ya existe se **sobrescribirá**)
**``>>``** sirve para añadir todos los resultados de los comandos anteriores hacia una carpeta ya existente sin sobrescribir los datos del archivo.
**``|``** sirve para cuando queremos utilizar el contenido ``STDOUT`` de un programa para que otro lo procese.
**``more``** Es un ``pager`` que queda en el shell de un archivo o búsqueda de archivos
**``less``** Es un ``pager`` de líneas de un archivo o búsqueda de archivos, al cerrarlo con la ``Q`` desaparece del shell 
**``head``** te muestra las primeras 10 líneas de un archivo o búsqueda de archivos
- **``head -n 4``** te muestra las primeras 4
- **``head -c 4``** te muestra los primeros 4 caracteres
**``tail``** te muestra las ultimas 10 líneas de un archivo o búsqueda de archivos
- **``tail -n 3``** te muestra las ultimas 3
- **``tail -c 3``** te muestra los primeros 3 caracteres
**``diff``** se utiliza para ver las diferencias entre 2 archivos que se vean muy similares.
**``disown``** se utiliza para desvincular la aplicación ejecutada de la terminal, ya que de lo contrario si cerráramos la terminal, el programa al ser un proceso hijo de esta se cerraría.

