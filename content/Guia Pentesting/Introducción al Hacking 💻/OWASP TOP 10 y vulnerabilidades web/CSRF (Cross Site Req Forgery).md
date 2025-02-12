----
- Tags: #vulnerabilidades #web
----
# Definición

> El **Cross-Site Request Forgery** (**CSRF**) es una vulnerabilidad de seguridad en la que un atacante **engaña** a un usuario legítimo para que realice una acción no deseada en un sitio web sin su conocimiento o consentimiento. 

En un ataque **CSRF**, el atacante engaña a la víctima para que **haga clic en un enlace malicioso o visite una página web maliciosa**. Esta página maliciosa puede contener una solicitud HTTP que realiza una acción no deseada en el sitio web de la víctima.

Por ejemplo, imagina que un usuario ha iniciado sesión en su cuenta bancaria en línea y luego visita una página web maliciosa. La página maliciosa contiene un formulario que envía una solicitud HTTP al sitio web del banco para transferir fondos de la cuenta bancaria del usuario a la cuenta del atacante. Si el usuario hace clic en el botón de envío sin saber que está realizando una transferencia, el ataque CSRF habrá sido exitoso.

El ataque **CSRF** puede ser utilizado para realizar una amplia variedad de acciones no deseadas, incluyendo la transferencia de fondos, la modificación de la información de la cuenta, la eliminación de datos y mucho más.

Para prevenir los ataques CSRF, los desarrolladores de aplicaciones web deben implementar medidas de seguridad adecuadas, como la inclusión de **tokens CSRF** en los formularios y solicitudes HTTP. Estos tokens CSRF permiten que la aplicación web **verifique que la solicitud proviene de un usuario legítimo y no de un atacante malintencionado** (aunque cuidado que también se pueden hacer cosas con esto).

# Creación de Laboratorio para CSRF

Como siempre **nos montaremos un laboratorio** para poder practicar la explotación de la vulnerabilidad.

Haremos un ``wget https://seedsecuritylabs.org/Labs_20.04/Files/Web_CSRF_Elgg/Labsetup.zip`` que es un archivo zip el cual contiene el laboratorio que utilizaremos.
Descomprimimos el archivo con ``unzip Labsetup.zip`` y luego hacemos ``docker-compose up -d`` dentro del directorio.

Si a la hora de hacer el ‘**docker-compose up -d**‘, os salta un error de tipo: “**networks.net-10.9.0.0 value Additional properties are not allowed (‘name’ was unexpected)**“, lo que tenéis que hacer es en el archivo ‘**docker-compose.yml**‘, borrar la línea número 41, la que pone “**name: net-10.9.0.0**“.

Tras haber hecho todo lo anterior, veremos que **los contenedores desplegados se están distinguiendo con direcciones IP PRIVADAS**, por lo tanto debemos en el */etc/hosts* contemplarlo tal que así, para que sean accesibles.

![[CSRF 1.png]]

La única dirección que vamos a estar tocando es la www.seed-server.com.

Ahora crearemos un archivo *creds.txt* para almacenar las credenciales de usuarios que ya existen en el laboratorio por defecto.

```txt
alice:seedalice
samy:seedsamy`
```

----------
# Explotación de CSRF

La web que montamos del Laboratorio es una web de una **Red Social**, disponiendo de paneles como perfil, amigos, usuarios, miembros, etc. Podemos añadir como amigo a la persona que pertenezca a la web.
Cada usuario posee un identificador de usuario, esto lo podemos ver al hacer *Overing* sobre "Añadir amigo" en el perfil de algún usuario existente y viendo en la parte inferior izquierda de la pantalla la URL mostrada.

Lo primero que vamos a hacer es **ingresar a la cuenta** de "alice" en la web www.seed-server.com tomando sus datos del archivo *creds.txt*.
Ingresaremos al apartado de *Profile*, e iremos a la sección de *Edit profile* en *Display Name*, modificando el nombre Alice por **C4sp**, ahora lo que haremos será interceptar esta petición con **Burpsuite**.

Si observamos la petición en el **Burpsuite**, la petición es tramitada por el método **POST**, además veremos que hay diferentes campos con datos, en uno de ellos veremos el campo ``name='name'`` donde aparece el nombre **C4sp**, que fue el que escribimos previamente para **reemplazar a Alice**. También veremos que hay dos campos en los cuales **aparecen dos Tokens o Códigos**.

![[CSRF 2.png]]

-------

Ahora debemos probar si podemos cambiar el tipo de petición **POST** a **GET**, para poder manipularlo de una manera mas fácil, para eso damos *click derecho* en el Burpsuite y *Change request method*.

![[CSRF 3.png]]

También hay que verificar si hay algo por detrás que **verifica que los Tokens se estén enviando/validando**, o en el caso de que no estén **la petición se envíe igual**, ya que si los Tokens fuesen obligatorios y dinámicos para cada usuario, no podríamos efectuar el ataque debido a que nunca sabríamos el valor de cada Token único. 

Para comprobar esto **borraremos** el ``__elgg_token`` y el ``__elgg_ts`` con sus respectivos valores que marcamos en la foto anterior, luego **enviamos la petición** para ver cómo se comporta.
Algo a tener en cuenta es que borramos el ``&`` que estaba delante de *name* ya que el primer parámetro siempre inicia con ``?``, luego los demás continúan con ``&``.

![[CSRF 4.png]]

Lo que nos falta ahora es **modificar el identificador de usuario** en el campo ``guid=56`` ya que **56 es el ID de Alice**, y nosotros queremos atacar a **Samy**, haciendo Overing en *Add Friend* en la web en el perfil de Samy, veremos que su ID es la numero '**59**', por lo tanto lo modificamos en el campo ``guid=`` en el **Burp**.

Ahora solo falta colocarle el nombre que queramos que Samy tenga una vez se ejecute nuestro **CSRF**, en nuestro caso le colocaremos el nombre '*Toxico*', todo esto quedando tal que así

![[CSRF 5.png]]

Si nosotros enviamos esa petición, nos dará un error ya que no tenemos permisos para realizar esto, ya que la petición se está enviando desde la cuenta de Alice, por lo tanto **necesitamos que sea Samy el que envié esa petición**, esto lo podemos conseguir **enviándole un mensaje malicioso a el que una vez lo abra, se ejecute la petición por detrás sin que se de cuenta**.

Para hacer esto debemos **copiar toda la petición GET**, desde ``/action`` hasta el ``guid=59`` (incluido), luego vamos a dirigirnos al correo para enviarle un mensaje a Samy, donde en el campo *Message* en el modo *Edit HTML* colocaremos la siguiente cadena. 

- ``<img src="http://www.seed-server.com/todo-el-texto-copiado-del-burp-aqui" alt="Hola como estas Samy" width="1" height="1"/>``

``img src=""`` lo que hace es cargar una imagen de forma remota que va a venir de la web colocada, en nuestro caso *seed-server*, esta imagen al no existir cuando Samy abra el mensaje **verá una imagen ROTA**, por lo tanto agregamos lo siguiente ``alt=""`` para colocarle **una descripción a la imagen**, pero nos servirá como "**Mensaje de distracción**" ==(No colocarle caracteres especiales)==, además agregaremos ``width="1"`` y ``height="1"`` para modificar ancho y largo de la imagen.

(Importante que si estamos en otro caso, buscar un campo donde nos interprete HTML) podemos enviar un mensaje que tenga etiquetas tales que ``<h1>Hola</h1>``, y si vemos ese "Hola" en un tamaño mas grande es que nos interpretó correctamente **HTML**, por lo tanto podemos aprovechar eso para lo que queremos hacer.

![[CSRF 6.png]]

Ahora si nosotros **entramos a la cuenta de Samy y ingresamos al mensaje que nos enviamos como Alice**, veremos un mensaje únicamente, pero por detrás el nombre de usuario de **'Samy' fue cambiado a 'Toxico'**.

![[CSRF 7.png]]

![[CSRF 8.png]]

Esto se podría utilizar para variedades de cosas, como por ejemplo **el cambio de contraseñas** (Si es que no te piden la actual o **validando si ese campo realmente es necesario eliminándolo como hicimos con los Tokens**), cambio de mails (Si es que no te piden el actual) y demás, es cuestión de que exploremos e imaginemos escenarios.



