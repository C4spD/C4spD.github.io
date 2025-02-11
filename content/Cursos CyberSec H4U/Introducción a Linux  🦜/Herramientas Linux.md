----------
- Tags #herramientas #comandos #busqueda #filtros
--------
# Definición

> Las herramientas de la linea de [[Comandos]] se suelen utilizar de manera cotidiana en el Shell de [[Linux]], estas **sirven para brindarnos información especifica, ordenada o directamente facilitar acceso a información que necesitemos**. Suelen utilizarse seguido de un **pipe "|"**

-------
# Herramientas de la linea de comandos


**``| wc``** se utiliza para contar la cantidad de resultados obtenidos.
- **``wc -l``** se utiliza para contar solo la cantidad de líneas obtenidas. ``find /etc/ -name * .conf 2>/dev/null | grep systemd | wc -l``
**``| grep``** se utiliza para filtrar palabras o caracteres clave dentro de una búsqueda de archivos, texto, directorios, etc. ``find /etc/ -name *.conf 2 | grep system``
- **``grep -v``** - sirve para que no muestre los siguientes datos. ``| grep -v "falsenologin"``
- **``grep -E``** - sirve para poder filtrar mas de un dato a la vez **entre comillas y separadas por "``|``"**. ``| grep -E "hola|pepe|roto"``
- **``grep -oP``** - sirve para poder utilizar expresiones regulares
**``| sort``** se utiliza para ordenar de manera alfanumérica los resultados de búsqueda otorgados. ``cat /etc/passwd | sort`` [Web de "sort"](https://www.ibidemgroup.com/edu/tutorial-sort-linux-unix/)
**``| uniq``** se utiliza para no mostrar el texto duplicado. [Web de "uniq"](https://victorhckinthefreeworld.com/2021/10/21/el-comando-uniq-de-gnu/)
**``| cut``** se utiliza para separar con delimitadores y poder filtrar información consiguiendo resultados específicos. 
``cat /etc/passwd | grep -v "false\|nologin" | cut -d":" -f1`` en este ejemplo asignamos el delimitador en los **"``:``"** y especificamos con **"``-f1``"** que fila queremos que nos muestre tomando como limite entre filas los ``:``
**``| tr``** se utiliza para sustituir ciertos caracteres de una linea por caracteres definidos por nosotros. ``cat /etc/passwd | grep -v "false\|nologin" | tr ":" " "``
**``| column``** se utiliza para ordenar en forma de columnas los resultados
**``| awk``** se utiliza para mostrar solo el resultado que nos interese (Puede ser mas de uno) de una búsqueda, en un orden especifico. [Web de "awk"](https://www.shortcutfoo.com/app/dojos/awk/cheatsheet)
``cat /etc/passwd | grep -v "false\|nologin" | tr ":" " " | awk '{print $1, $NF}'`` Permite mostrar el primer ``$1`` y el último ``$NF`` resultado de la línea.
**``| xargs``** se utiliza para paralelizar secuencia de comandos. ``which python3.9 | xargs ls -l`` nos dará información acerca de la ruta dada por el "``which``"
**``| sed``** se utiliza para sustituir un texto o palabras especificas. ``| sed 's/bin/HTB/g'`` "``s``" viene de sustituto, reemplazamos palabras "``bin``" por "``HTB``" y ``/g`` para reemplazar todas las coincidencias. También se puede utilizar para reemplazar caracteres como "``:``" por "``,``"
**``| rev``** sirve para invertir todos los caracteres de lo que estemos filtrando. Se puede usar cuando tenemos un carácter en una linea un lejana, podemos reversar para que se ponga mas cercana al lado izquierdo y poder contar en que linea esta, una vez lo hagamos colocamos otro ``| rev`` al final de la cadena para que reverse denuevo.
**``| strings``** permite ver los caracteres legibles para humanos dentro de cualquier archivo.
**``| base64``** sirve para codificar una cantidad de texto o escritura en base64, para decodificar podemos usar **``base64 -d (Archivo que queramos decodificar)``**
**``| xxd``** este comando se utiliza para poder ver en hexadecimal la data de un archivo/directorio. Utilizando ``xxd -r`` generamos la acción inversa de descifrar
**``| sponge``** sirve para poder meter todo el output del archivo actual, en un archivo que queramos (Inclusive el mismo, sobrescribiendo los datos previos)
**``| md5sum``** sirve para computar un HASH de un archivo que lo identifica, si se altera el archivo aunque sea un carácter, este HASH será diferente (Sirve para comparar entre archivos o notificar alteraciones de los mismos)
**``7z``** es un descompresor de archivos, sirve para grandes variedades de archivos comprimidos.
- **``-l``** podemos listar que es lo que contiene el archivo comprimido dentro
- **``-x``** vamos a descomprimir cualquier tipo de archivo que contenga dentro.
**``tar``** sirve para interactuar con archivos ``tar``, comprimiéndolos como descomprimiéndolos.
- **``-cvf``** comprime el archivo, muestra el verbose y se especifica el file.
- **``-xvf``** descomprime el archivo, muestra el verbose y se especifica el file.
**``string``** sirve para ver los caracteres legibles humanos dentro de un binario, de esta forma podemos llegar a deducir como es que funciona o que comandos emplea dentro.
