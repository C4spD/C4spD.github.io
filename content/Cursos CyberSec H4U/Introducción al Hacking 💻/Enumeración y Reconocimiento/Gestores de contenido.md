------
- Tags: #gestoresdecontenidos #drupal #joomla #wordpress #magento #cms #web 
--------
# Definición de gestor de contenido (CMS)

> Un **gestor de contenido**, también conocido como **CMS** es una **aplicación o software que facilita la creación, administración y publicación de contenido en línea**. Está diseñado para permitir a los usuarios, incluso aquellos sin conocimientos avanzados de programación, **crear y gestionar contenido de manera eficiente**.
> Dentro de los gestores de contenidos mas comunes se pueden nombrar a **Wordpress**, **Drupal**, **Joomla**, **Magento**. Estos gestores corren a través de **servidores web** como **Apache**, **Nginx**, etc, de los cuales podemos hallar al realizar una [[Enumeración de Servicios]].

-------
# WordPress
## Definición

> **WordPress** se destaca por su facilidad de uso y flexibilidad. Con WordPress, los usuarios pueden crear y personalizar sitios web **sin necesidad de conocimientos de programación avanzados**. Además, cuenta con una **amplia variedad de plantillas y plugins** que permiten añadir funcionalidades adicionales al sitio.

------
## Despliegue con Docker-Compose

Utilizaremos un contenedor con Docker-Compose para poder montar un servidor con Wordpress a modo de ejemplo para su enumeración.
https://github.com/vavkamil/dvwp

Cuando ejecutemos el segundo de los comandos dado **``docker-compose up -d --build``** veremos que nos aparecerá al principio **``Creating volume``**, esto significa que **se está creando una especie de BackUP del contenedor**, y que por mas que borremos el contenedor y la imagen, esto seguirá guardado. Para ver los volúmenes debemos escribir **``docker volume ls``** y para borrarlos **``docker volume rm``**.

Podremos ver que se nos crearan varios contenedores, específicamente en el **puerto 31337 tendremos el Servidor de Wordpress**.
Ingresaremos por la web **``localhost:31337``** y nos registraremos. 
A continuación vamos a deslogearnos para luego ejecutar el ultimo comando de GITHUB **``docker-compose run --rm wp-cli install-wp``** para instalar los plugins necesarios.

En el siguiente apartado **observaremos algunos de los diferentes métodos de enumeración existentes** para **Wordpress**

--------
## Métodos de enumeración en Wordpress

#### Enumeración de usuarios

Podemos intentar enumerar usuarios dentro de la web, buscando algún perfil y prestando atención si en el directorio a un lado del dominio aparece lo siguiente ``http://localhost:31337/?author=1``, de esta manera podríamos comenzar a cambiar el valor de ``=1`` para ver si existen otros usuarios dentro de la web.

----
#### Enumeración de usuarios ``/wp-admin``

Podemos ver si está activo el panel de administrador colocando ``http://localhost:31337/wp-admin`` y de ser así podríamos intentar ingresar con el usuario **``admin``** y la clave **``admin``** para **prestar atención al mensaje de "``Error``"**, ya que **Wordpress te indica si el usuario no existe, o si solo te equivocaste en la contraseña**. De esta forma también podríamos aplicar fuerza bruta al usuario para identificar si existe o no, ayudándonos de la respuesta que Wordpress nos da.

![[WordPress Usuario existe.png]]

![[WordPress Usuario NO existe.png]]

De esta manera, ya sabiendo que el usuario "``C4sp``" es válido, nuestro objetivo como atacante sería **hackear el servidor para ganar acceso a la maquina que aloja y hostea todo el servicio web** o **ganar acceso a la interfaz administrativa en el panel de autenticación (Fuerza bruta)**.

-------
#### Enumeración de usuarios con Herramientas

Hay formas potenciales de enumerar usuarios con herramientas, como por ejemplo con **``searchsploit``**
Primero la instalaremos con **``apt install exploitdb``** que está sincronizada con la web https://exploit-db.com

Podemos usar lo siguiente.

- **``searchsploit wordpress user enumeration``** Para buscar desde consola **como si estuviésemos en la web** ``wordpress user enumeration`` y si encontramos alguno que nos sirva lo podemos usar, también tenemos que tener en cuenta que **no siempre vamos a saber que versión de Wordpress posee el servidor**, por ende en esos casos no nos cuesta nada probar el exploit igual.

Con el parámetro **``-x identificador-exploit``** podemos examinar el código del exploit que nos interese.

Otra herramienta es **``wpscan``** que emplea varias técnicas para recolectar información, plugins vulnerables, usuarios, etc.
Un ejemplo sería **``wpscan --url http://127.0.0.1:31337``** para ver toda la información de la web que montamos con ``Docker-Compose``.

Si deseamos **ver toda la información completa** con vulnerabilidades incluidas, tenemos que **otorgar un ``API TOKEN``**, que se consigue en **``wpscan.com``** una vez que nos registremos en nuestro perfil, y se puede usar agregando el parámetro **``--api-token "token-entre-comillas"``**

**``-e``**  Con este parámetro podemos enumerar diferentes cosas, entre ellas **``vp``** Vulnerable plugins, **``ap``** All plugins, **``p``** Popular plugins, **``-u``** User

Un ejemplo sería 

- **``wpscan --url http://127.0.0.1:31337 -e vp,u``** Acá **enumeramos Vulnerable plugins**, y **usuarios**.

Le agregamos el **API TOKEN**

- **``wpscan --url http://127.0.0.1:31337 -e vp,u --api-token "aU2ks4DP6wR5XLG1O6LMr8rGHtna5NG79WDrjxHKRo4"``**

==Siempre tenemos que tener en cuenta que a veces puede ser que el Wordpress este actualizado, pero que algún plugin no lo esté, por ende podemos atacar los plugins vulnerables.==

---
#### Enumeración de plugins ``/wp-content/plugins`` y ``Directory Listing``

Podemos hacer lo siguiente con procedimiento manual para poder encontrar plugins, ya que hay ocasiones que hay una ruta donde se almacenan los plugins, la cual es **``wp-content/plugins``** esto lo podemos colocar en la web, en esta caso la nuestra montada http://127.0.0.1:31337/wp-content/plugins si se queda en negro o sale un "``Forbidden``" es que no tenemos capacidad de **Directory Listing** que significa que no nos podamos meter y listar los directorios y recursos existentes en una ruta especifica.

------
#### Enumeración de directorios/plugins con ``curl``

Podemos hacer uso de **``curl -s -X GET http://127.0.0.1:31337/``** para ver si podemos listar algún directorio, y como **en este caso podemos**, filtramos con **``GREP``** con la palabra **plugins** para poder enumerarlos, 
==en este caso utilizamos expresiones regulares a si que vamos a mostrar como las uso pero nos conviene investigar para poder saber mas del tema, de esta forma pude llegar a obtener el nombre de los plugins instalados en el servidor==.

- **``curl -s -X GET "http://127.0.0.1:31337/" | grep -oP "plugins/\K[^/]+" | sort -u``**

De esta manera obtendremos los nombres de los plugins instalados, por ende podríamos buscar información acerca de estos para poder buscar posibles vulnerabilidades con la herramienta anterior vista **``searchsploit``**

-----
#### Validación del archivo ``xmlrpc.php``

Este archivo es una **característica de WordPress que permite la comunicación entre el sitio web y aplicaciones externas utilizando el protocolo** **XML-RPC**.
El archivo **``xmlrpc.php``** es utilizado por muchos plugins y aplicaciones móviles de WordPress para interactuar con el sitio web y realizar diversas tareas, como publicar contenido, actualizar el sitio y obtener información.

Este archivo también puede ser abusado para aplicar **fuerza bruta** y descubrir **credenciales válidas** de los usuarios del sitio. Esto se debe a que **``xmlrpc.php`` permite a los atacantes realizar un número ilimitado de solicitudes de inicio de sesión sin ser bloqueados**, lo que hace que **la ejecución de un ataque de fuerza bruta sea relativamente sencilla**.

Podemos chequear si el **``xmlrpc.php``** está expuesto, http://127.0.0.1:31337/xmlrpc.php, si esto es así hay una forma de enumerar credenciales validas, primero tenemos que ver que tipo de petición acepta, en este caso es de tipo **``POST``**

![[XML-RPC request ON.png]]

Ahora podemos hacer lo mismo pero con el uso de la consola tramitándolo nuevamente con un ``POST``

- **``curl -s -X POST "http://127.0.0.1:31337/xmlrpc.php"``**
  
Ahora lo que debemos hacer es buscar información en google de tipo "``**Abusing XML-RPC.PHP Wordpress**``" 

https://nitesculucian.github.io/2019/07/01/exploiting-the-xmlrpc-php-on-all-wordpress-versions/

Ahora como dice en la pagina, debemos averiguar cuales son los métodos disponibles **tramitándole una petición por POST donde le envíes una estructura de archivo XML**, queremos listar los **métodos** porque hay muchos que podemos utilizar para variedad de cosas, en este caso queremos ver si existe uno que **nos va a permitir enumerar credenciales validas llamado "``wp.getUsersBlogs``"**

Primero **crearemos un archivo "``.xml``"**, en este caso **"``file.xml``"** y le **meteremos el código brindado por la pagina anterior para realizar la petición por ``POST``**. Ahora lo que haremos será intentar tramitarlo por ``POST`` con el siguiente comando

- **``curl -s -X POST "http://127.0.0.1:31337/xmlrpc.php -d@file.xml``

El parámetro **``-d@``** lo usamos para indicar cual es el archivo con el que queremos realizar la petición.

En este caso el comando anterior **nos brindó todos los métodos**, ahora lo que debemos hacer será buscar el que nos interesa a nosotros **``wp.getUsersBlogs``**, en este caso **existe**. Gracias a esto nos permite elaborar una **estructura de ataque de fuerza bruta para enumerar credenciales validas** ==(En la WEB está el código)==.

![[Tramitamos la peticion POST con archivo XML 2.png]]

Reemplazamos los datos, en este caso **colocamos el usuario existente que descubrimos con el escáner anterior**, y una **contraseña cualquiera para ver que nos reporta al enviar la petición** nuevamente por ``POST``.

![[Contraseña incorrecta con petición CURL POST 1.png]]

**Si colocáramos la correcta (spider) sería lo siguiente**

![[Contraseña correcta con petición CURL POST.png]]

De esta manera ya **nos estaría listando información**... que este usuario es **``ADMIN``**, el **``BLOG ID``**, el **``BLOG NAME``**, etc. Ahora para poder **ver todo mas lindo** podemos usar

- **``curl -s -X POST "http://127.0.0.1:31337/xmlrpc.php" -d@file.xml | cat -l xml``**

![[Contraseña correcta petición CURL POST CON FILTRO XML.png]]

Con toda la información recolectada **podemos crear un script en BASH** que se encargue de realizar **FUERZA BRUTA** para en el campo **"``password``" recorrer un diccionario (``rockyou.txt``)** y de esta manera **hallar la contraseña correcta** a modo de ejemplo.

----------
# Drupal
## Definición

> **Drupal** es un **CMS** (Gestor de contenido) que **ofrece un alto grado de personalización y escalabilidad**, lo que lo convierte en una opción popular para sitios web complejos y grandes. Drupal se utiliza en una amplia gama de sitios web, desde **blogs** personales hasta **sitios web gubernamentales** y empresariales.

----------
## Despliegue con Docker-Compose

En este caso **desplegaremos el siguiente contenedor** para dar ejemplos de enumeración 
https://github.com/vulhub/vulhub/tree/master/drupal/CVE-2018-7600

-------
## Métodos de enumeración en Drupal

**``Droopscan``** es una **herramienta de escaneo de seguridad** especializada en la identificación de **versiones de Drupal** y sus **módulos**, y en la **detección de vulnerabilidades conocidas** en ellos. La herramienta realiza un **escaneo exhaustivo del sitio web** para encontrar **versiones** de Drupal instaladas, módulos activos y **vulnerabilidades conocidas**. Para poder instalar esta herramienta seguimos las instrucciones dadas por el **GITHUB** de SamJoan https://github.com/SamJoan/droopescan

Podemos utilizar esta herramienta con el siguiente comando 

- **``droopescan scan drupal -u http://127.0.0.1:8080/``**

Donde **``scan``** indica que queremos realizar un escaneo, **``drupal``** especifica que estamos **realizando un escaneo de Drupal** y **``-url https://example.com`` indica la URL del sitio web que se va a escanear**.

------
# Joomla
## Definición

> **Joomla** es un **CMS** (Gestor de contenido) que se utiliza para **crear sitios web** y **aplicaciones en línea**, este es muy popular debido a su facilidad de uso y flexibilidad, lo que lo hace una opción popular para sitios web empresariales, gubernamentales y de organizaciones sin fines de lucro.

------
## Despliegue con Docker-Compose

En este caso desplegaremos el siguiente contenedor para dar ejemplos de enumeración [https://github.com/vulhub/vulhub/tree/master/joomla/CVE-2015-8562](https://github.com/vulhub/vulhub/tree/master/joomla/CVE-2015-8562)

-----------
## Métodos de enumeración en Joomla

**``Joomscan``** utiliza una variedad de **técnicas de enumeración** para identificar **información sobre el sitio web de Joomla**, como la **versión** de Joomla utilizada, los **plugins** y **módulos** instalados y los **usuarios** registrados en el sitio. También utiliza una **base de datos de vulnerabilidades conocidas para buscar posibles vulnerabilidades en la instalación de Joomla**. Para instalar esta herramienta debemos hacerlo mediante **``Perl``**, con las siguientes instrucciones dadas por **GITHUB**. https://github.com/OWASP/joomscan 

Para su ejecución utilizamos **``perl joomscan -u http://127.0.0.1:8080``**

Algo interesante de esta herramienta es que te genera un **reporte con toda la información** obtenida dentro del directorio **``reports``**, este reporte está hecho en formato de archivo **"``.txt``"** y también con una interfaz **"``.html``"** que se puede acceder **mediante la apertura de un servidor momentáneo** con **"``python3 -m http.server 80``"** ==(El puerto 80 o cualquier otro)==. Luego ingresamos a el servidor **por el navegador** y **observamos los resultados brindados por el escáner**.

Hay que saber que esta herramienta puede dar falsos positivos o falsos negativos, así que siempre es importante reforzar la enumeración de vulnerabilidades con otras herramientas para ser mas eficaz.

![[Joomla Scanner.png]]

---------
# Magento
## Definición

> **Magento** es un **CMS** (Gestor de contenido), es **una plataforma de comercio electrónico de código abierto**, que se utiliza para **construir tiendas en línea de alta calidad y escalables**. Es una de las plataformas más populares para el comercio electrónico y es **utilizado por grandes marcas** como **Nike**, **Coca-Cola** y **Ford**.

-------
## Despliegue con Docker-Compose

En este caso desplegaremos el siguiente contenedor para dar ejemplos de enumeración
https://github.com/vulhub/vulhub/tree/master/magento/2.2-sqli

------
## Métodos de enumeración en Magento

**``Magescan``** es una herramienta que ==puede detectar vulnerabilidades comunes en Magento, incluyendo problemas con permisos de archivos, errores de configuración y vulnerabilidades conocidas en extensiones populares de Magento==. Para poder instalar esta herramienta seguimos las instrucciones dadas por el GITHUB https://github.com/steverobbins/magescan

Esta herramienta se puede ejecutar mediante **``php``** con el siguiente comando **``php magescan.phar``** ==(Dentro del directorio ``/opt``)==

Con el comando **``php magescan.php scan:all http://127.0,0.1:8080``** podemos **escanear todo el contenido** de la web indicada.

Una de las técnicas que explotaremos sobre este **gestor de contenidos** es la famosa **SQL Injection**. Esta vulnerabilidad se produce cuando **los datos de entrada no son debidamente validados** y se pueden **insertar comandos SQL maliciosos** en la consulta a la **base de datos**.

Un ataque de inyección SQL **exitoso** puede permitir al atacante **obtener información confidencial**, como **credenciales de usuario** o **datos de pago**, o incluso **ejecutar comandos en la base de datos del sitio web**.

En el caso del Magento que estaremos desplegando, explotaremos una inyección SQL con el objetivo de obtener una cookie de sesión, la cual podremos posteriormente utilizar para llevar a cabo un ataque de “**Cookie Hijacking**“. Este tipo de ataque nos permitirá como atacantes asumir la identidad del usuario legítimo y acceder a las funciones del usuario, que en este caso será administrador.

------