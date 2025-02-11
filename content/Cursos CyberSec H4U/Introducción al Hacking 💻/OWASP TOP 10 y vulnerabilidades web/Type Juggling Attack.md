-----
- Tags: #web #vulnerabilidades 
-----
# Definición

> Un ataque de **Type Juggling** (o “**cambio de tipo**” en español) es una técnica utilizada en programación para **manipular** el **tipo de dato** de una variable con el fin de engañar a un programa y hacer que éste haga algo que no debería.

La mayoría de los lenguajes de programación utilizan tipos de datos para clasificar la información almacenada en una variable, como enteros, cadenas, flotantes, booleanos, etc. Los programas utilizan estos tipos de datos para realizar operaciones matemáticas, comparaciones y otras tareas específicas. Sin embargo, los atacantes pueden explotar vulnerabilidades en los programas que no validan adecuadamente los tipos de datos que se les proporcionan.

En un ataque de Type Juggling, un atacante manipula los datos de entrada del programa para cambiar el tipo de dato de una variable. Por ejemplo, el atacante podría proporcionar una cadena de caracteres que “se parece” a un número entero, pero que en realidad no lo es. Si el programa no valida adecuadamente el tipo de dato de la variable, podría intentar realizar operaciones matemáticas en esa variable y obtener resultados inesperados.

Un ejemplo común de cómo se puede utilizar un ataque de Type Juggling para burlar la autenticación es en un sistema que utiliza comparaciones de cadena para verificar las contraseñas de los usuarios. En lugar de proporcionar una contraseña válida, el atacante podría proporcionar una cadena que se parece a una contraseña válida, pero que en realidad no lo es.

Por ejemplo, en PHP, una cadena que comienza con un número se convierte automáticamente en un número si se utiliza en una comparación numérica. Por lo tanto, si el atacante proporciona una cadena que comienza con el número **cero** (**0**), como “**00123**“, el programa la convertirá en el número entero **123**.

---

El **Type Juggling** es un concepto en programación, especialmente en lenguajes como PHP, donde el tipo de una variable puede cambiar automáticamente en función del contexto en el que se use. Este comportamiento se produce cuando una variable se convierte implícitamente de un tipo a otro durante la ejecución del programa.

Por ejemplo, en PHP, si se realiza una operación aritmética con una cadena de texto que representa un número, PHP convertirá automáticamente esa cadena en un número. 

```php
<?php
$variable = "10"; // $variable es una cadena
$resultado = $variable + 5; // PHP convierte automáticamente la cadena en un número
echo $resultado; // Imprime 15
?>
```

En este caso, PHP realiza la conversión automática de la cadena `"10"` a un número para llevar a cabo la suma.

El Type Juggling puede ser útil y conveniente, pero también puede llevar a errores difíciles de depurar.

----
# Creación de web vulnerable a Type Juggling

Comenzaremos dirigiéndonos a la ruta */var/www/html* y activaremos el servicio de apache con ``service apache2 start``, ya que vamos a montarnos una web bastante básica con un panel de autenticación que valide las credenciales mediante una comparativas de contraseña.

Crearemos un archivo *index.php* (o modificamos el que ya este en el directorio) y a continuación le agregaremos este código que será nuestra web básica.

----

- **Código con anotaciones**

```html
<html>
// En este caso lo que hacemos es con una fuente de color rojo, con texto centrado y con la etiqueta "h1" para que se vea mas grande el texto, colocamos una cadena de texto "Secure Login Page". (Cerrando todo al final)
	<font color="red"><center><h1>Secure Login Page</h1></center></font> 
	
// Añadimos un delimitador (linea) con "hr"
	<hr>
	
// Agregamos un body, para pintar el background de color powderblue (dentro de este body irá el formulario también)
	<body style="background-color:powderblue;">
	
// En este caso lo que hacemos es crear un formulario centrado y especificamos que la data que se tramite sea por POST hacia el index.php. Ademas creamos un campo "name" con el nombre del index.php (En nuestro caso colocamos la cadena "<?php basename($_SERVER['PHP_SELF']); ?>" ya que si el nombre del archivo se modifica por cualquier motivo, el script será interpretado de todas formas, es una forma dinámica mas cómoda)
	<center><form method="POST" name="<?php basename($_SERVER['PHP_SELF']); ?>">
	
// Creamos el campo "usuario" en el que se deberá colocar un input de tipo textual, donde el name será "usuario" y el id será "usuario", con un tamaño de "30"
	Usuario <input type="text" name="usuario" id="usuario" size="30">
	
// Añadimos la linea "&nbsp;" para que haga un espacio entre el campo Usuario y el campo Contraseña.
	&nbsp;
	
// Repetimos lo mismo pero para un campo "Contraseña", en el que el input será de tipo password (Oculto), con nombre "password", id "password", y size "30"
	Contraseña <input type="password" name="contraseña" id="contraseña" size="30">

// Añadimos un boton de "Login" para enviar la petición con las credenciales que proporcionemos.
	<input type="submit" value="Login">

// En este caso cerramos el form y el center, ademas de agregar un "hr" para añadir un delimitador nuevamente
	<hr>
	</form></center>

// Si inspeccionamos la web y vamos a la pestaña "Network" y enviamos credenciales random, veremos que la petición se estará tramitando por POST como lo especificamos anteriormente (Podremos verificar la data enviada si abrimos la petición y vamos a "Request")

----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// ---------> Lo que haremos ahora será escribir la estructura en PHP que nos interpretará si las credenciales son válidas o inválidas y en cada caso representarnoslo con un mensaje.

	<?php
// Crearemos un campo USER que valdrá "admin". Esto será para comparar la data que tramitemos por POST en el campo Usuario que creamos antes con el valor "admin", es decir "admin" será un usuario válido.
	$USER = "admin";
	
// Creamos un campo PASSWORD que contendrá una contraseña ULTRA COMPLEJA para el usuario "admin".
	$PASSWORD = 'adm1n123@$$!?823764';
	
// Creamos una forma de comprobar si se han introducido datos en los campos Usuario y Contraseña con un condicional, indicando que si se tramitó data por POST para el campo "usuario" y para el campo "contraseña", entonces quiero que suceda algo, en nuestro caso será otro condicional que validará si la entrada es igual al campo $USER por ende "admin" que creamos anteriormente, de ser así queremos que aplique una comparativa de la contraseña.
	  if(isset($_POST['usuario']) && isset($_POST['contraseña'])){
	    if($_POST['usuario'] == $USER){
	      if(strcmp($_POST['contraseña'], $PASSWORD) == 0){
        echo "[+] La contraseña proporcionada es correcta, bienvenido Admin";
      } else {
        echo "[!] La contraseña proporcionada es incorrecta";
      }
	} else {
      echo "[!] El usuario no existe";
    }
   }
?>
// Cerramos el body que abrimos al principio, y cerramos la etiqueta html del script.
	</body>
</html>
```

-------

- **Código sin anotaciones**

```html
<html>
  <font color="red"><center><h1>Secure Login Page</h1></center></font>
  <hr>
  <body style="background-color:powderblue;">
  <center><form method="POST" name="<?php basename($_SERVER['PHP_SELF']); ?>">
  Usuario <input type="text" name="usuario" id="usuario" size="30">
  &nbsp;
  Contraseña <input type="password" name="contraseña" id="contraseña" size="30
">
  <input type="submit" value="Login"> 
  <hr>
  </form></center>

  <?php
    $USER = "admin";
    $PASSWORD = 'adm1n123@$$!?823764';

    if(isset($_POST['usuario']) && isset($_POST['contraseña'])){
      if($_POST['usuario'] == $USER){
        if(strcmp($_POST['contraseña'], $PASSWORD) == 0){
          echo "[+] La contraseña proporcionada es correcta, bienvenido Admin"
;
        } else {
          echo "[!] La contraseña proporcionada es incorrecta";
        }
      } else {
        echo "[!] El usuario no existe";
      }
     }
  ?>
  </body>
</html>
```

-------

Una vez ya tengamos montado el panel de autenticación podremos comenzar con la explotación para este caso.

Dependiendo de lo que se esté empleando por detrás a nivel de desarrollo, que en nuestro caso es ``strcompare()`` que recordemos que lo que hace esa función es comparar dos datos de tipo **STRING**. 
Nosotros como atacantes lo que podemos hacer es **cambiar el tipo de dato con el que estamos tratando**, haciendo esto muchas veces suceden cosas y eso genera que las comparativas sean exitosas, veremos un ejemplo con Burpsuite.

Si nosotros interceptamos con **Burpsuite** la petición de Login en la interfaz que hemos creado, luego lo enviamos al Repeater, y modificamos en el campo "*contraseña*" de una manera especifica, podemos hacer que el campo se interprete como un Array y no como una cadena.

==Este ejemplo funciona únicamente en versiones por debajo de la PHP8==

==La vulnerabilidad esta corregida en las versiones de php8. Para solucionarlo solo tienes que usar en el servicio apache php7 o inferiores. Yo use lo siguiente: ``sudo a2dismod php8.2`` ``sudo a2enmod php7.4`` ``sudo systemctl restart apache2`` Las versiones de php depende de las que estés usando vos. Yo las mire en la ruta "/etc/php".==

![[TJA 1.png]]

Si en el campo ``contraseña=test`` dentro del Burpsuite, colocamos unos corchetes ``[]`` quedando tal que así ``contraseña[]=test``, si **la versión de PHP es inferior a la 8** podremos autenticarnos sin colocar la contraseña, ya que estamos representando el dato como un **Array** en vez de una cadena, por lo tanto entendemos que si hay determinadas comparativas que no están bien **controladas** o **sanitizadas**, podremos burlarlas.

------

Otro caso sería cuando una web utiliza comparativas de contraseñas, pero mediante el uso de **Hashes**, como por ejemplo **MD5**. Esto se realiza hasheando automáticamente el input que ponga el usuario en el campo "Password" para luego compararlo con la contraseña existente en la base de datos también en MD5. 

Podemos observar mas información al respecto en la siguiente web https://www.hackplayers.com/2018/03/hashes-magicos-en-php-type-jugling.html que explica detalladamente otro tipo de Type Juggling con PHP a la hora de utilizar ``==`` en vez de ``===`` en una comparativa.

![[TJA 2.png]]

Por lo tanto en todas las implementaciones que usan php nunca está de más fuzzear los parámetros de contraseñas con estos valores que generan estos hashes "mágicos": 
  
| Hash Type  | Hash Length | “Magic” Number / String | Magic Hashes                                     | Found By                                                                 |
| ---------- | ----------- | ----------------------- | ------------------------------------------------ | ------------------------------------------------------------------------ |
| md2        | 32          | 505144726               | 0e015339760548602306096794382326                 | WhiteHat Security, Inc.                                                  |
| md4        | 32          | 48291204                | 0e266546927425668450445617970135                 | WhiteHat Security, Inc.                                                  |
| md5        | 32          | 240610708               | 0e462097431906509019562988736854                 | Michal Spacek                                                            |
| sha1       | 40          | 10932435112             | 0e07766915004133176347055865026311692244         | Independently found by Michael A. Cleverly & Michele Spagnuolo & Rogdham |
| sha224     | 56          | –                       | –                                                | –                                                                        |
| sha256     | 64          | –                       | –                                                | –                                                                        |
| sha384     | 96          | –                       | –                                                | –                                                                        |
| sha512     | 128         | –                       | –                                                | –                                                                        |
| ripemd128  | 32          | 315655854               | 0e251331818775808475952406672980                 | WhiteHat Security, Inc.                                                  |
| ripemd160  | 40          | 20583002034             | 00e1839085851394356611454660337505469745         | Michael A Cleverly                                                       |
| ripemd256  | 64          | –                       | –                                                | –                                                                        |
| ripemd320  | 80          | –                       | –                                                | –                                                                        |
| whirlpool  | 128         | –                       | –                                                | –                                                                        |
| tiger128,3 | 32          | 265022640               | 0e908730200858058999593322639865                 | WhiteHat Security, Inc.                                                  |
| tiger160,3 | 40          | 13181623570             | 00e4706040169225543861400227305532507173         | Michele Spagnuolo                                                        |
| tiger192,3 | 48          | –                       | –                                                | –                                                                        |
| tiger128,4 | 32          | 479763000               | 00e05651056780370631793326323796                 | WhiteHat Security, Inc.                                                  |
| tiger160,4 | 40          | 62241955574             | 0e69173478833895223726165786906905141502         | Michele Spagnuolo                                                        |
| tiger192,4 | 48          | –                       | –                                                | –                                                                        |
| snefru     | 64          | –                       | –                                                | –                                                                        |
| snefru256  | 64          | –                       | –                                                | –                                                                        |
| gost       | 64          | –                       | –                                                | –                                                                        |
| adler32    | 8           | FR                      | 00e00099                                         | WhiteHat Security, Inc.                                                  |
| crc32      | 8           | 2332                    | 0e684322                                         | WhiteHat Security, Inc.                                                  |
| crc32b     | 8           | 6586                    | 0e817678                                         | WhiteHat Security, Inc.                                                  |
| fnv132     | 8           | 2186                    | 0e591528                                         | WhiteHat Security, Inc.                                                  |
| fnv164     | 16          | 8338000                 | 0e73845709713699                                 | WhiteHat Security, Inc.                                                  |
| joaat      | 8           | 8409                    | 0e074025                                         | WhiteHat Security, Inc.                                                  |
| haval128,3 | 32          | 809793630               | 00e38549671092424173928143648452                 | WhiteHat Security, Inc.                                                  |
| haval160,3 | 40          | 18159983163             | 0e01697014920826425936632356870426876167         | Independently found by Michael Cleverly & Michele Spagnuolo              |
| haval192,3 | 48          | 48892056947             | 0e4868841162506296635201967091461310754872302741 | Michael A. Cleverly                                                      |
| haval224,3 | 56          | –                       | –                                                | –                                                                        |
| haval256,3 | 64          | –                       | –                                                | –                                                                        |
| haval128,4 | 32          | 71437579                | 0e316321729023182394301371028665                 | WhiteHat Security, Inc.                                                  |
| haval160,4 | 40          | 12368878794             | 0e34042599806027333661050958199580964722         | Michele Spagnuolo                                                        |
| haval192,4 | 48          | –                       | –                                                | –                                                                        |
| haval224,4 | 56          | –                       | –                                                | –                                                                        |
| haval256,4 | 64          | –                       | –                                                | –                                                                        |
| haval128,5 | 32          | 115528287               | 0e495317064156922585933029613272                 | WhiteHat Security, Inc.                                                  |
| haval160,5 | 40          | 33902688231             | 00e2521569708250889666329543741175098562         | Michele Spagnuolo                                                        |
| haval192,5 | 48          | 52888640556             | 0e9108479697641294204710754930487725109982883677 | Michele Spagnuolo                                                        |
| haval224,5 | 56          | –                       | –                                                | –                                                                        |
| haval256,5 | 64          | –                       | –                                                | –                                                                        |

------ 

También podemos preguntarle a CHAT GPT que nos de ejemplos de "Type Juggling" y nos lo dará, esto servirá para entender otras formas.
Tenemos que entender que el **Type Juggling** abarca muchísimos aspectos, ya que se basa en errores en el código a la hora desarrollar una web, si esta vulnerabilidad nos interesa, es conveniente investigar por muchos otros casos en foros.