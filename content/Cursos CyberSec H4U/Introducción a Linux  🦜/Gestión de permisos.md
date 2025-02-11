--------
- Tags: #permisos #Linux #usuarios #grupos #SUID #SGUID
------------
# Definiciones

> La gestión de permisos en [[Linux]] es sumamente importante, esto **definirá que tipo de acceso posee cada usuario a los diferentes archivos/directorios dentro del sistema** a la hora de emplear **modificaciones**, **ejecuciones** o simplemente **leer información**.

> Existen **seis** tipos diferentes de permisos en un sistema operativo Linux, estos son **read**, **write**, **execute**, **SUID**, **SGID**, y **StickyBit**.

> El permiso **read** cuando se encuentra dentro de un archivo/directorio lo que nos permite es poder leer el contenido que hay dentro.
> Este permiso se representa con la letra **r**.

> El permiso **write** cuando se encuentra dentro de un archivo/directorio lo que nos permite es poder modificar el contenido que hay dentro
> Este permiso se representa con la letra **w**.

> El permiso **execute** cuando se encuentra dentro de un archivo/directorio lo que nos permite es poder ejecutar binarios, herramientas, entre otras cosas.
> Este permiso se representa con la letra **x**. Si un directorio posee permisos **x** podremos atravesarlo/entrar en el.

> El permiso **SUID** se ubica en los permisos del apartado **owner (u)**, cuando se encuentra dentro de un archivo/directorio lo que nos permite es **ejecutar el archivo como si fuésemos el propietario, independientemente del usuario que lo ejecute**.
> Este permiso se representa con una **s minúscula** cuando **está activo y posee permisos de ejecución**, y con una **S mayúscula** cuando **está activo y no posee permisos de ejecución**.

> El permiso **SGID** se ubica en los permisos del apartado **group (g)**, cuando se encuentra dentro de un archivo/directorio permite que cualquier usuario ejecute el archivo como si fuese miembro del grupo al que pertenece el archivo. En caso de que esté asignado en un directorio a cualquier archivo creado en el mismo se le asignará como grupo perteneciente, el grupo del directorio.
> Este permiso se representa con una **s minúscula** cuando **está activo y posee permisos de ejecución**, y con una **S mayúscula** cuando **está activo y no posee permisos de ejecución**.

> El permiso **StickyBit** se ubica en los permisos del apartado **others (o)**, cuando se encuentra dentro de un archivo/directorio indica que solo el dueño del archivo lo pueda renombrar o eliminar.
> Este permiso se representa con una **t minúscula** cuando **está activo y posee permisos de ejecución**, y con una **T mayúscula** cuando **está activo y no posee permisos de ejecución**.

------
# Verificación de permisos en un archivo/directorio

Para poder ver los permisos que posee un archivo/directorio podemos ayudarnos de los [[Comandos]] **ls -la** para que nos liste toda la información.

**``ls -l /etc/passwd``**   =

```
- rwx rw- r--   1 root root 1641 May  4 23:42 /etc/passwd
- --- --- ---   |  |    |    |   |__________|
|  |   |   |    |  |    |    |        |_ Date
|  |   |   |    |  |    |    |__________ File Size
|  |   |   |    |  |    |_______________ Group
|  |   |   |    |  |____________________ User
|  |   |   |    |_______________________ Number of hard links
|  |   |   |_ Permission of others (read)
|  |   |_____ Permissions of the group (read, write)
|  |_________ Permissions of the owner (read, write, execute)
|____________ File type (- = File, d = Directory, l = Link, ... )
```

# Comandos para gestión de permisos y propietarios

Podemos modificar a gusto los permisos y propietarios de un archivo/directorio siempre y cuando seamos los propietarios o tengamos permisos especiales. A continuación se brindarán los [[Comandos]] mas utilizados para la modificación de permisos en archivos o directorios desde la SHELL.

**``chmod``** se utiliza para modificar los permisos a un archivo/directorio especificado acompañado de la letra representativa **``u``**, **``g``**, **``o``**, **``a``**. 
Se acompaña de un **``+``** o **``-``** si queremos agregar o quitar permisos al grupo especificado.
La **``a``** viene de "*all*" en este caso representa a todo el conjunto de **``UGO``**.

Ejemplos
**``chmod u+x text.txt``** En este caso le otorgamos al **``Owner (u)``** permisos de **``Execute (x)``** sobre el archivo **``text.txt``**
**``chmod a-rwx text.txt``** En este caso le quitamos a los tres grupos diferentes **``Owner``**, **``Group``**, **``Others``**, los tres permisos principales **``read``**, **``write``**, **``execute``**.

Esta es una manera fácil pero no tan eficiente, **si queremos hacer la modificación de los permisos de una manera mas rápida de una sola vez, podemos utilizar el sistema numérico para permisos**, en el cual predomina el **Sistema Octal**.

**``chown``** viene de **change owner** y se utiliza para modificar el propietario y el grupo a la misma vez de un archivo/directorio utilizándose de esta manera 
**``chown user:group file/directory``** donde donde dice ``user`` indica el nuevo propietario del archivo que queramos asignar, y donde dice ``group`` indica el nuevo grupo al que queramos que pertenezca.

**``chgrp``** se utiliza para cambiar de grupo un archivo o directorio. Por ejemplo **``chgrp "Grupo" file/directory``**

-----
# Sistema numérico para permisos

El sistema numérico para permisos **es la manera mas rápida de asignar un permiso o varios permisos a un archivo/directorio**, esto normalmente se suele representar con el método **``Octal Value``** o **Sistema Octal**. A continuación explicaremos una forma fácil de entender este método.

Siempre debemos guiarnos del orden **U**, **G**, **O**, que representa a los permisos de los **OWNER**, **GROUP**, **OTHERS**
Siempre debemos acordarnos de los valores **4 2 1 0** donde...
**``4``** es el permiso de **``READ``**
**``2``** es el permiso de **``WRITE``**  
**``1``** es el permiso de **``EXECUTE``**
**``0``** es sin permisos

Pudiendo así asignarle permisos de forma **masiva**.

```
        u g o
chmod   - - -
chmod   4 2 1
```

En este caso le estamos dando permiso de **``READ(4)``** al **``owner (u)``**, de **``WRITE(2)``** al **``group (g)``**, y de **``EXECUTE(1)``** a **``others (o)``**

Ahora, si nosotros queremos darle **mas de un permiso a la vez a un usuario o a mas de un usuario**, lo que debemos hacer es **sumar los valores anteriores** ``4+2+1 = 7`` lo que significa que si en el orden de **``UGO``**, escribimos **``7``** significa que al usuario correspondiente le **estamos dando los 3 permisos existentes**, **``READ``**, **``WRITE``**, y **``EXECUTE``**.

```
        u g o
chmod   - - - 
chmod   7 5 6
```

En este caso le estamos dando permisos de **``READ(4) + WRITE(2) + EXECUTE(1) = 7``** al usuario **``OWNER (u)``**
También le estamos dando permisos de **``READ(4) + EXECUTE(1) = 5``** al usuario **``GROUP(g)``**
También le estamos dando permisos de **``READ(4) + WRITE (2) = 6``** al usuario **``OTHERS (o)``**

Para colocarle un **SUID** a un directorio/archivo usamos ``chmod 4777`` (Directorio/Archivo)
Para colocarle un **SGID** a un directorio/archivo usamos ``chmod 2777`` (Directorio/Archivo)