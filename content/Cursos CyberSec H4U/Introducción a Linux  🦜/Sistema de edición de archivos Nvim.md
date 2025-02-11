-------
- Tags: #editor #nvim #vim #nano #modificación
--------
# Definición

Los editores de archivos son herramientas indispensables en la utilización de [[Linux]] ya que estas sirven para poder modificar, borrar, cambiar, datos dentro de un archivo, sea de texto como no. Los editores de archivos mas utilizados son **Nano** y **Vim**, a uno se lo caracteriza por ser fácil y intuitivo para usar, y al otro se lo caracteriza por ser ultra eficaz pero de complejo uso.

----------
# Utilización de NVIM y NANO

# ***Nano Comandos Básicos***

***``CTRL+W``*** podemos buscar una palabra especifica, si apretamos seguidas veces la misma 
combinación de teclas + Enter podemos ver las siguientes encontradas

***``CTRL+O``*** Para guardar el archivo en el directorio actual

***``CTRL+X``*** para cerrar NANO

# ***VIM (Herramienta Avanzada)

***``vimtutor``*** para abrir tutorial de ``vim``
https://vim.rtorr.com/lang/es_es

Para activar la escritura de comandos apretar ``ESC`` para ir a modo normal, después escribir ``!`` y enter para abrir la consola
``:q!`` para salir sin guardar
``:wq`` para salir y guardar
## Teclas de escritura

```
The format for a change command is:
               operator   [number]   motion
     where:
       operator - is what to do, such as  d  for delete
       [number] - is an optional count to repeat the motion
       motion   - moves over the text to operate on, such as  w (word),
                  e (end of word),  $ (end of the line), etc.
```

***``X``*** - para borrar sobre lo que esta marcado.

***``i``*** - insert text before the cursor.
***``a``*** - es para ponerse en modo INSERT después del cursor

Nota: "``a``","``i``", y "``A``" todas te llevan al modo ``INSERT``, la única diferencias es donde son insertados los caracteres

***``o/O``*** - sirve para abrir una linea de texto nueva, la ``o`` es para hacer una linea nueva hacia abajo, y la ``O`` sirve para hacerla hacia arriba

***``a``*** - append text after the cursor.

***``dw``*** - to delete a word  (Se puede borrar mas de una palabra a la vez con el comando ``d"2"w`` que significa que va a borrar las siguientes dos palabras desde el carácter actual)

***``d$``*** - to delete to the end of the line.

***``dd``*** - to delete a whole line (También se puede usar ``2dd`` para borrar 2 líneas enteras de una)

***``u``*** - para deshacer los cambios o errores.

***``CTRL(mantenido)+R``*** para recuperar los cambios que deshice con el comando "``u``"

***``p``*** - para pegar el ultimo texto eliminado (Cuando eliminamos un texto, es como si lo estuviésemos cortando, con la letra ``p`` pegamos lo que eliminamos previamente)

***``y/p``*** - sirve para poder copiar un texto seleccionado por "``v``" y luego pegarlo donde queramos con la "``p``"
***``yy``*** - sirve para copiar una linea entera.
***``yw``*** - sirve para copiar una palabra entera.

**``.``** - el punto sirve para poder escribir nuevamente la ultima escritura que realizamos.

***``r``*** - para reemplazar en donde esta marcado con la letra que yo quiera. *Ejemplo ``wh(a)n`` apretar la ``r`` sobre la "``a``" y después apretar la "``e``" para reemplazar*.
***``R``*** -  para reemplazar mas de un carácter ``123 XXX`` ``123 456``.

Nota: el ``replace mode`` es igual que el ``insert mode``, la diferencia es que el ``replace`` borra a medida que vas escribiendo.

***``ce``*** - elimina la palabra y te coloca en ``Insert mode`` para escribir.

***``cc``*** - hace lo mismo pero para una linea entera.

***``c$``*** - para borrar desde el punto actual hasta el final de la linea y colocar en Insert Mode.

Reemplazar/Sustituir textos.
***``:s/(palabra que queramos sustituir)/(palabra que queramos utilizar para reemplazar la anterior)/g``***. Todo la sustitución se aplica en el archivo completo por el ``/g``.

Se pueden usar líneas de comando del ``SHELL`` dentro de ``VIM`` usando ``!``, ``:``, ``/``,  por ejemplo ``!ls``.

Con el comando ***``:w``*** - ``(Nombre del archivo)`` Podemos guardar una copia del archivo actual en el directorio que nos encontramos.
Con el comando ***``:rm``*** - ``(Nombre del archivo)`` Podemos borrarlo  (Todo dentro de ``vim``).

***``V``*** - podemos activar el modo de selección para poder marcar lo que queremos, usando ``W`` o ``E`` para marcar mas rápido, de esta manera podemos sobrescribir o borrar rápidamente el texto que deseemos.

Si marcamos un texto por ejemplo "El perro volaba con alas" y después escribimos "``:``" en la consola de abajo nos aparecerá ``:'<,'>``.
Si a continuación de ``:'<,'>`` escribimos ``:'<,'>w TEXT`` crearemos un archivo en el directorio actual llamado ``TEXT`` con todos los datos que marcamos previamente con el comando ``V`` "``El perro volaba con alas``".

***``:r``*** ``TEXT`` - Copiar información de un texto externo al archivo actual.
En este caso copiaría en la posición actual del mouse el texto dentro del archivo ``TEXT``, el cual es (EL PERRO VOLABA CON ALAS).

Se pueden **crear macros** para hacer **automatizaciones** de algo a escala masiva.

**``qa``** - comienza la grabación para una nueva macro. (Luego de esto realizamos la acción que queremos que se repita).
**``q``** - para parar la grabación luego de haberla iniciado.
**``(Numero de veces)a``** - Por ejemplo utilizado ``32a`` usaría la macro anteriormente guardada 32 veces.
## Teclas de Desplazamiento/Búsqueda

***``w``*** - para moverme hacia la siguiente palabra, excluyendo el primer carácter. (Se puede mover mas de una palabra usando ``w2``, usando el numero para desplazarme a gusto.

***``e``*** - para moverme hacia el final de la palabra actual o siguiente, incluyendo el ultimo carácter. (Se puede mover mas de una palabra usando ``e2``, usando el numero para desplazarme a gusto).

***``$``*** o ``Fin`` - para moverme hacia el final de la linea, incluyendo el ultimo carácter.

***``0``*** o ``Inicio`` - to move to the start of the line.

***``CTRL+G``*** - para mostrar donde esta ubicado el archivo y en que linea te encuentras dentro del archivo.

***``G - (Shift+g)``*** para ir al final del archivo.

***``gg``*** - para ir al comienzo del archivo.

***``507G``*** - nos enviara directo hacia la linea 507 del archivo actual.

***``/``*** - sirve para buscar una palabra clave dentro del archivo.
Presionando la tecla ``n`` o ``N`` ``CTRL+n`` nos iremos desplazando entre los múltiples resultados de nuestra búsqueda.
Manteniendo la tecla ``CTRL`` y luego ``O`` o ``Y`` podremos volver al anterior lugar donde nos encontrábamos, o regresar al buscado a antojo.

***``%``*** - colocando el selector/cursor sobre un ``()`` o ``[]`` o ``{}`` nos enviara a donde cierra o lo que encierra ese símbolo.
#### ``ic: ignorecase``  ``is: incsearch``  ``hls: hlsearch``

***``:set ic/:set noic``***- (Ignore Case) para poder ignorar las mayúsculas y minúsculas de la próxima palabra que busquemos.
***``:set hls/:nohls``*** - para poder remarcar con color la palabra o texto que estemos buscando.
***``:set ins/:set nois``*** - para poder mostrar coincidencias parciales para una palabra o texto que estemos buscando.

***``\\c``*** - para Ignore Case con un solo uso ``/ignore\\c`` ``ENTER``

***``:help``*** - ``(Comando que tenga dudas)``
***``:q``*** - para salir de ``:help``
***``CTRL+W``*** - para saltar de una ventana a otra mientras tengo abierto el ``:help``

--------
# AI para NVIM

https://github.com/github/copilot.vim