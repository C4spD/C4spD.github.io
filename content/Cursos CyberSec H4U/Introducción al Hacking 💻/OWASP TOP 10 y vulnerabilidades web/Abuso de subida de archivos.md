--------
- Tags: #owasp #file #vulnerabilidades 
----
# Definición

> El abuso de subidas de archivos es un tipo de ataque que se produce cuando un atacante aprovecha las vulnerabilidades en las aplicaciones web que permiten a los usuarios **cargar archivos** en el servidor. Este tipo de ataque se conoce comúnmente como un ataque de “**subida de archivos maliciosos**“.

En un ataque de subida de archivos maliciosos, un atacante carga un archivo malicioso en una aplicación web, que luego se almacena en el servidor. Si por ejemplo el atacante consigue subir un archivo PHP y el servidor web lo almacena, podría conseguir ejecución remota de comandos y tomar el control del servidor.

Los atacantes también pueden utilizar técnicas de “**falsificación de tipos de archivos**” para engañar a una aplicación web con el objetivo de que acepte un archivo malicioso como si fuera un archivo legítimo.

---
# Laboratorio para Explotación

Para esta vulnerabilidad nos guiaremos a través de este [repositorio](https://github.com/moeinfatehi/file_upload_vulnerability_scenarios) de Github en el cual nos adentraremos de manera progresiva diferentes niveles de **Abuso de subida de archivos** desde las más fáciles hasta las mas complejas.

- ``git clone https://github.com/moeinfatehi/file_upload_vulnerability_scenarios``
- ``docker-compose up -d``

Una vez hecho esto, ya tendremos nuestro servicio web montado a través de **Docker** por el *puerto 9001*, por lo tanto entraremos a http://localhost:9001 para comenzar con la explotación.

Si tenemos algún problema con la subida de archivos por ==algún error==, podemos utilizar el siguiente "oneliner" entrando al contenedor, estando en el directorio */var/www/html*.

- ``ls -d up*|while read line; do mkdir $line/uploads;chown -R www-data:www-data $line/uploads;done``

--------
# Explotación

Dentro de la web tendremos diferentes carpetas que irán escalando en dificultad, por lo tanto vamos a tener que estar atentos y buscar cada detalle para conseguir llegar a un **RCE** a través de una subida de un archivo "*cmd.php*".

## Upload 1

En este escenario **no hay ningún tipo de sanitización**, por lo tanto si intentamos introducir nuestro archivo "*cmd.php*", podremos a la primera.

```php
<?php
	system($_GET['cmd'])
?>
```

![[Abuso subida A 1.png]]

Por lo tanto si no dirigimos a la ruta otorgada, veremos un **error** con respecto a que el parámetro '*cmd*' no fue utilizado (El que definimos nosotros), pero **eso nos indica que el comando de nuestro script php fue interpretado**, por lo tanto en la URL colocaremos ``?cmd=whoami`` para que realicemos el **RCE** correctamente.

![[Abuso subida A 2.png]]

![[Abuso subida A 3.png]]

## Upload 3 (Modificación del código de la web en Local)

En este escenario al intentar subir un archivo veremos que aparece un **mensaje de alerta** que indica que solos los archivos ``.jpg`` son válidos, si prestamos atención veremos que **no hay ninguna petición que se envíe**, o que la URL haga un **Redirect**, por lo tanto podemos intuir que **esta alerta proviene de Local**, es decir, de **nuestro lado** y no del servidor.

![[Abuso subida A 4.png]]

Para hacer un **bypass** de esta situación simplemente debemos **modificar el código HTML** presionando ``CTRL+SHIFT+C`` y buscando donde se encuentra la restricción para **eliminarla**.

Recordemos que podemos presionar en el icono del lado izquierdo de la pestaña *Inspector* para luego clickear en el botón "*Upload*" de la web, de esta manera veremos específicamente que sucede cuando le damos click al botón como tal.

![[Abuso subida A 5.png]]

Por lo tanto deberíamos **eliminar** la variable ``onsubmit`` por completo, de esta forma nunca se haría la llamada al archivo "*validate.js*" que nos prohíbe subir archivos que no sean ``.jpg``, ya con el archivo subido podríamos emplear ``?cmd=whoami`` en la ruta correspondiente para el **RCE**.
## Upload 10 (Utilización de alternativas para la extensión php)

En este escenario veremos que al darle al botón *Upload* veremos que la web hace una especie de *Redirect* o que como tal se envía una petición, de esta forma podemos intuir que esta vez **la sanitización viene por parte del servidor**. Para poder manipular todo más cómodamente haremos uso de **Burpsuite**, de esta forma tendremos toda la manipulación de la petición que se está enviando a nuestro alcance.

Debemos entender que todas las extensiones de archivos (``jpg``, ``php``, ``html``, ``js``, etc) **poseen otras formas existentes de ser representadas**, es decir, en vez de colocar "*cmd.php*" colocar una variable de ``.php`` existente. Podemos investigar por nuestra cuenta **todas las variables de extensiones existentes** para **php** en nuestro caso, nosotros guiaremos a través de la web de [Hacktricks](https://book.hacktricks.xyz/pentesting-web/file-upload) 

![[Abuso subida A 6.png]]

Por lo tanto en este caso podríamos probar este vector de ataque a través de **Burpsuite**.

![[Abuso subida A 7.png]]

![[Abuso subida A 8.png]]

Ahora, ==que se halla subido no quiere decir que la web nos lo interprete==, por lo tanto debemos **verificarlo**. En este caso la web no nos interpreta ``php2`` por lo tanto probaremos con las demás hasta que una nos funcione.

![[Abuso subida A 9.png]]

En este caso me funcionó ``php5`` ya que **fue interpretado el código correctamente**, de lo contrario la web no mostraría nada.

## Upload 11 (Utilización de extensiones alternativas a php[1-9])

En este escenario tampoco podemos a la primera, como ya se imaginarán esto será así hasta que terminemos, por lo tanto **acostumbraremos a interceptar la petición con Burpsuite a la primera**.

Como no vemos nada diferente, recurriremos a lo mismo que hicimos en *Upload 10* variando las extensiones php utilizando la web de **Hacktricks** o la que nos sea más cómoda.

![[Abuso subida A 10.png]]

En este caso funcionó la extensión ``.pht``, pero **¿Por que sucede esto?**, metámonos en el contenedor que contiene nuestro laboratorio y observemos el *index.php* del *Upload11*.

![[Abuso subida A 11.png]]
## Upload 12 (Utilización de extensión .htaccess)

En este escenario como siempre probaremos todo lo anteriormente visto, veremos que hay algunas extensiones que **nos permiten subir nuestro archivo** pero como era de esperar **no se interpreta su contenido**, hay que buscar otra solución.

Hay una extensión llamada ``.htaccess`` que probablemente la hayamos encontrado en la web en la que estemos observando las extensiones existentes de PHP. Esta extensión tiene un uso muy peculiar, y es que nos permite cambiar el nombre a la extensión de forma personalizada **conservando su interpretación**, es decir que yo puedo subir un archivo ``cmd.php16`` ==Que esta extensión NO EXISTE== pero indicar que la extensión ``.php16`` se interprete como si fuera ``.php``.

Para utilizar la extensión ``.htaccess`` primero se debe subir un archivo que contenga dicha extensión y dentro de el la especificación de la nueva extensión que nombraremos (``.php16``) y a que otra extensión existente hará referencia (``.php``).

Buscaremos por internet "*htaccess extension use*" o simplemente nos podemos apoyar de **ChatGPT** en caso de dudas. Blog con información --> https://blog.trackflaw.com/comment-contourner-d%C3%A9p%C3%B4t-fichiers/

```bash
AddType application/x-httpd-php .php16      # Say all file with extension .php16 will execute php

php_value zend.multibyte 1                  # Active specific encoding 
php_value zend.detect_unicode 1             # Detect if the file have unicode content
php_value display_errors 1                  # Display php errors
```

Una vez ya sepamos que contenido debemos meterle al archivo '*cmd.htaccess*', debemos cambiar también el tipo de *Content-Type* a ``text/plain``, todo esto lo haremos con **Burpsuite**.

![[Abuso subida A 12.png]]

Ahora solo queda subir nuestro archivo "*cmd.php16*" con la línea para el **RCE**, podemos hacerlo desde **Burpsuite** o desde la **web** misma ya que no requiere mucha exigencia como tal, en mi caso lo voy a hacer con ==Burpsuite==.

![[Abuso subida A 13.png]]

Ahora **verificamos** que sea interpretado correctamente.

![[Abuso subida A 14.png]]

## Upload 16 (Modificación del MAX_FILE_SIZE)

En este escenario vemos que ya la web nos indica que tipo de restricción hay, en este caso es "*Restriction: File size*", probemos interceptar con **Burpsuite** la subida de nuestro archivo *cmd.php*.

==A partir de ahora todas las peticiónes que hagamos en los próximos laboratorios las vamos a interceptar==.

![[Abuso subida A 15.png]]

En este caso vemos que nos llama la atención ``MAX_FILE_SIZE`` y que posee un valor de "20", vamos a **modificarlo** a "*80*", de esta forma **estaríamos cambiando el tamaño máximo soportado**, es decir, podríamos subir nuestro archivo.

![[Abuso subida A 16.png]]
## Upload 17 (Reducción de caracteres en archivo cmd.php y variaciones del a función ``system``)

En este escenario vemos un caso **similar al anterior**, pero se supone que posee un extra en cuanto a seguridad respecta.
Viendo la petición con atención vemos que no varía esta como tal, si probáramos cambiar el valor "20" nuevamente podríamos subir nuestro archivo, pero no es la idea.

Hay varias formas de **representar de forma más compacta un código**, a continuación vamos a **reducir lo máximo posible** la cantidad de caracteres utilizados en nuestro comando de **RCE**.

- ``<?=`$_GET[0]`?>``

Este código realiza lo mismo que el que usamos anteriormente para los demás casos, ahora voy a explicar como es que esto funciona.

- El inicio ``<?php`` se compacta a ``<?=``
- El comando ``system()`` se puede quitar y colocar ``**`**`` (Comillas simples) al inicio y al final
- En la petición por ``$_GET['cmd']`` el parámetro le asignamos ``$_GET[0]`` ya que no requiere comillas simples al rededor.

![[Abuso subida A 17.png]]

Comprobamos que sea interpretado correctamente como siempre.

![[Abuso subida A 18.png]]

------

Podemos hacer como atacantes en caso de que tengamos que **Bypassear un Waff** (*Web applicattion firewall*) que no nos permita utilizar la función ``system`` de **php** es lo siguiente.

```php
<?php
	$c=$_GET['cmd'];
	echo `$c`;
>?
```

De esta forma podríamos emplear la llamada a nivel de sistema del comando pero sin el uso de esa función

-------

Podemos colocar la función ``system`` de php en hexadecimal y también funcionaría, esto quedaría tal que así.

```php
<?php
	"\x73\x79\x73\x74\x65\x6d"($_GET['cmd']);
>?
```
## Upload 21 (Cambio de Content-Type)

En este escenario veremos que a la hora de intentar subir nuestro archivo, nos dará un error "*Forbidden file type*", y en la **Restricción** indica que es de *File Type*. Cuando se habla del tipo de archivo esto hace referencia al *Content-Type*, ya que a través de el se realiza la validación del tipo de archivo como tal.

Nosotros al subir un recurso en una web, del tipo que sea ya sea una **foto**, un **php**, un **archivo textual**, etc, en base a los llamados "**Magic Numbers**" que son los primeros Bytes del archivo, es posible detectar que tipo de archivo estamos subiendo. 
En nuestro caso al intentar subir un archivo ``.php``, el *Content-Type* pondrá ``application/x-php`` que **es el Content-Type asociado a archivos php**, si nosotros subiéramos una imagen, veríamos que el *Content-Type* sería ``image/jpg``.

Dicho todo lo anterior, nosotros podríamos **modificar** el *Content-Type* de manera manual para decirle a la web que nosotros estamos subiendo un archivo ``jpg`` por ejemplo, cuando en realidad **estamos subiendo nuestro cmd.php**.

![[Abuso subida A 19.png]]

Verificamos que el **RCE** sea interpretado.

![[Abuso subida A 20.png]]
## Upload 23 (Magic Numbers)

En este escenario vemos que nos indican que subamos un *GIF*, si intentamos subir nuestro archivo *cmd.php* veremos que en **Local** nos aparece la restricción, por lo tanto intentemos modificarlo desde nuestro navegador con ``CTRL+SHIFT+C`` **eliminando** la llamada a la restricción. Luego de lo anterior, veremos que ahora nos sale del lado del servidor que **no hemos proporcionado el tipo de archivo correcto**.

Interceptemos la petición con **Burpsuite** luego de quitar la restricción que está puesta en local. Ahora probemos cambiando el **Content-Type** como lo vimos en el caso anterior.

![[Abuso subida A 21.png]]

-  **Magic Numbers**

	Nosotros al subir un recurso en una web, del tipo que sea ya sea una **foto**, un **php**, un **archivo textual**, etc, en base a los llamados "**Magic Numbers**" que son los primeros Bytes del archivo, es posible detectar que tipo de archivo estamos subiendo. 
	Si nosotros vamos a nuestra **Shell** y miramos con ``file cmd.php`` el tipo de archivo con el que estamos jugando, es decir nuestro *cmd.php* veremos que nos dirá lo siguiente ``cmd.php: PHP script, ASCII text``, esto **lo detecta a partir de los primeros Bytes del archivo** que los podemos ver con ``xxd cmd.php``.

	![[Abuso subida A 22.png]]

	Si nosotros por ejemplo con ``zip cmd.zip cmd.php`` creamos un archivo ``.zip`` del *cmd.php* y luego hacemos un ``file cmd.zip`` veremos que nos dice que es un archivo *ZIP*, esto **lo detecta a partir de los primeros Bytes también**.

	![[Abuso subida A 23.png]]

	Ahora si **copiamos** de la primera línea de los Bytes del archivo los dos primeros, es decir ``504b 0304`` y en internet buscamos "*List of signatures wikipedia*" https://en.wikipedia.org/wiki/List_of_file_signatures y con ``CTRL+F`` buscamos por esos valores separando cada 2 caracteres un espacio, veremos los siguiente. ``50 4b 03 04``

	![[Abuso subida A 24.png]]

Con todo esto que vimos sobre los "*Magic Numbers*" podemos deducir que **podríamos manipular la detección del tipo de archivo** que estamos subiendo, si al principio del código del archivo escribimos por ejemplo ``GIF8;`` que es una cadena que se suele contemplar en **imágenes GIF**, con eso lograríamos que **los primeros Bytes sean distintos a los de PHP** y por lo tanto hacer un bypass de la sanitización.

![[Abuso subida A 27.png]]

![[Abuso subida A 25.png]]

Ahora como siempre solo queda verificar el **RCE**.

![[Abuso subida A 26.png]]
## Upload 31 (Renombramiento de archivo subido con Hash MD5SUM)

En este escenario probaremos subir nuestro archivo *cmd.php* (==Borraremos== la linea ``GIF8;`` para no modificar sus primeros Bytes), veremos que se sube a la primera, pero si vamos a la ruta http://localhost:9001/upload31/uploads/cmd.php veremos que **no existe el archivo**, pero **nosotros lo hemos subido** porque la petición fue **exitosa**, por lo tanto hay algo que debe estar haciendo por detrás la web.

Una pista que tenemos es que al subir el archivo aparece un **GIF**, por lo tanto analicémoslo con ``CTRL+SHIFT+C `` o con **Burpsuite**.

![[Abuso subida A 28.png]]

![[Abuso subida A 29.png]]

Como podemos ver el *GIF* posee un nombre similar a algún **tipo de hash** de **32 caracteres** que si investigamos por internet los hashes existentes con estas características se asocian al hash **MD5SUM**, gracias a esto podemos llegar a deducir que tal vez **nuestro archivo fue renombrado con MD5SUM** para que no lo detectemos una vez subido a la web, probemos **hacer un hash** con **MD5SUM** a la palabra "*cmd*" para ver si ese archivo existe en la web en la ruta */uploads*. 

https://hashes.com/en/tools/hash_identifier

![[Abuso subida A 30.png]]

Ahora busquemos en la web en la ruta */uploads* si existe el archivo llamado ``dfff0a7fa1a55c8c1a4966c19f6da452.php``

![[Abuso subida A 31.png]]

Existe, por lo tanto conseguimos el **RCE** satisfactoriamente.
## Upload 33 (Renombramiento de archivo subido con Hash MD5SUM incluyendo su extensión)

En este escenario sucede algo **muy similar al anterior caso**, ya que la única pista que poseemos es la que nos brinda el nombre del *GIF* una vez subamos nuestro archivo, en este caso también parece un cadena **correspondiente al hash MD5SUM** ya que posee **32 caracteres de longitud**. Si probamos lo mismo que en *Upload 31* pasando a **MD5SUM** la cadena "*cmd*" veremos que no funciona, pero si nosotros pasamos la cadena "*cmd.php*" (con la extensión incluida) a **MD5SUM**, veremos que funciona, ya que en este caso se utiliza la cadena con la extensión incluida.

![[Abuso subida A 32.png]]

Ahora probemos ir a la web y verificar si nuestro archivo existe con ese nombre.

![[Abuso subida A 33.png]]

Conseguimos el **RCE** correctamente.
## Upload 35 (Renombramiento de archivo subido con SHA1SUM)

En este escenario vemos la misma situación, pero esta vez encontramos que el nombre del *GIF* que nos muestran una vez subimos nuestro archivo contiene **40 caracteres**, algo que no aplica para el hash **MD5SUM** que utilizamos antes, por lo tanto debemos hacer una **búsqueda sobre hashes existentes que coincidan con el uso de 40 caracteres**. https://hashes.com/en/tools/hash_identifier esta web nos indica que tal vez se trate de un hash de tipo **SHA1**. Para realizar un hash por nuestra cuenta de una cadena que brindemos, podemos utilizar ``sha1sum`` de la misma forma que solemos utilizar ``md5sum``. 

Si probáramos pasar a **SHA1SUM** la cadena "*cmd*" y la cadena "*cmd.php*" veremos que ninguna de las dos funciona. Tenemos que entender que hay veces que el hash **no se aplica al nombre del archivo** si no que **se aplica al contenido** del mismo, por lo tanto probemos hacer un **SHA1SUM** de todo el contenido de nuestro archivo *cmd.php* con el comando ``sha1sum cmd.php``.

![[Abuso subida A 34.png]]

Ahora probemos en la web para verificar que existe nuestro archivo con ese **nombre**.

![[Abuso subida A 35.png]]
## Upload 41 (Cambio de directorio en donde se encuentra el archivo cmd.php)

En este escenario veremos que podemos subir exitosamente nuestro archivo *cmd.php*, pero lo raro que vemos es que **no nos indican donde se encuentra**, por lo tanto **debemos hallar la ruta o directorio donde se almacena**, esto lo podemos conseguir utilizando **fuerza bruta** con alguna herramienta, en mi caso voy a usar ``gobuster``.

- ``gobuster dir -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -u http://localhost:9001/upload41/ -t 20``

![[Abuso subida A 36.png]]

Ahora solo queda **buscar nuestro archivo en ambas rutas** para ver si se encuentra ahí.

![[Abuso subida A 37.png]]

En este caso lo encontramos en la ruta */images* cuando en todos los demás *Uploads* vimos que se encontraba en */uploads*.
## Upload 51 (Ataque de doble extensión)

En este escenario veremos que **no nos dejará subir** nuestro archivo *cmd.php*, esto se debe a que nos exige que sea un archivo de tipo *JPG*.
Probaremos con todo lo visto anteriormente, desde cambiar el *Content-Type*, cambiar los primeros Bytes del archivo con los *Magic Numbers* que correspondan a una imagen, hasta probar con todas las variables de las *extensiones de PHP*, pero todo será inútil.
Muchos desarrolladores aplican una sanitización "mala" que se encarga de **buscar en el archivo** que estamos **subiendo** la extensión "*jpg*", en caso de que no aparezca, no nos permitirá subirlo. Ahora esta sanitización es mala porque se puede aplicar algo llamado "*Ataque de doble extensión*", intentando subir un archivo por ejemplo "*cmd.jpg.php*" de esta forma lo podríamos hacer ya que contiene la cadena "*jpg*" dentro y no le interesa en donde se encuentre ==siempre y cuando esté en la extensión==. ==Cabe destacar que la extensión que será interpretada será la ultima que este colocada==.

![[Abuso subida A 38.png]]

![[Abuso subida A 39.png]]
## Upload 56 (Utilización de CURL para hacer un bypass e interpretar nuestro archivo)

En este escenario vemos que podemos controlar la ruta en donde se almacena nuestro archivo, ahora la sanitización que posee es que cuando ingresamos a la ruta **automáticamente nos intentara descargar el archivo que subimos**, por lo tanto para evitar esto debemos **operar desde nuestra consola**.

![[Abuso subida A 40.png]]

Utilizamos el parámetro ``-G`` porque de lo contrario si colocáramos todo junto al igual que lo hacíamos en la URL ``/upload56/casp/cmd.php?cmd=whoami`` no podríamos, ya que necesitamos **URLENCODEAR los espacios** y algún que otro caracter, de esta forma es mucho mas cómodo.
## Upload 58 (Combinación de todo)

En este escenario si intentamos subir nuestro archivo veremos que no vamos a poder, por lo tanto apliquemos todo lo visto hasta ahora.

Subiremos nuestro archivo *.htaccess* con nuestra extensión personalizada, luego con nuestro archivo *cmd.php* modificaremos los primeros **Bytes** del archivo, colocando en el inicio la cadena ``GIF8;`` y además por las dudas cambiaremos el *Content-Type* a ``image/gif``.

![[Abuso subida A 41.png]]

![[Abuso subida A 42.png]]

Ahora verificamos en la ruta que nos brindaron si podemos generar el **RCE** y listo.

![[Abuso subida A 43.png]]

==Cabe aclarar que también recomiendo investigar sobre los metadatos de una imagen y como poder añadir un comentario a esos metadatos, inyectando un comando PHP que a la hora de ser interpretada la imagen/gif sea ejecutado.==