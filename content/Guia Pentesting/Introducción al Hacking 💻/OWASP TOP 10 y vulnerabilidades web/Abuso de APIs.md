----
- Tags: #web #apis #owasp 
-----
# Definición

> Cuando hablamos del **Abuso de APIs**, a lo que nos referimos es a la explotación de vulnerabilidades en las interfaces de programación de aplicaciones (**APIs**) que se utilizan para permitir la comunicación y el intercambio de datos entre diferentes aplicaciones y servicios en una red.

Un ejemplo sencillo de API podría ser la integración de Google Maps en una aplicación de transporte. Imagina que una aplicación de transporte necesita mostrar el mapa y la ruta a seguir para que los usuarios puedan ver la ubicación del vehículo y el camino que se va a seguir para llegar a su destino. En lugar de crear su propio mapa, la aplicación podría utilizar la API de Google Maps para mostrar el mapa en su aplicación.

En este ejemplo, la API de Google Maps proporciona una serie de funciones y protocolos que permiten a la aplicación de transporte comunicarse con los servidores de Google y acceder a los datos necesarios para mostrar el mapa y la ruta. La API de Google Maps también maneja la complejidad de mostrar el mapa y la ruta en diferentes dispositivos y navegadores, lo que permite a la aplicación de transporte centrarse en su funcionalidad principal.

Adicionalmente, una de las utilidades que vemos en esta clase es **Postman**. Postman es una herramienta muy popular utilizada para probar y depurar APIs. Con Postman, los desarrolladores pueden enviar solicitudes a diferentes endpoints y ver las respuestas para verificar que la API está funcionando correctamente. Sin embargo, los atacantes también pueden utilizar Postman para explorar los endpoints de una API en busca de vulnerabilidades y debilidades de seguridad.

- **Endpoint** es una URL específica que permite interactuar con los recursos que ofrece la API. Es el punto de entrada para realizar operaciones como obtener datos, enviar información, actualizar o eliminar recursos.

Algunos endpoints de una API pueden aceptar diferentes métodos de solicitud, como GET, POST, PUT, DELETE, etc. Los atacantes pueden utilizar herramientas de fuzzing para enviar una gran cantidad de solicitudes a un endpoint en busca de vulnerabilidades. Por ejemplo, un atacante podría enviar solicitudes GET a un endpoint para enumerar todos los recursos disponibles, o enviar solicitudes POST para agregar o modificar datos.

Algunas de las vulnerabilidades comunes que se pueden explotar a través del abuso de APIs incluyen:

- **Inyección de SQL**: los atacantes pueden enviar datos maliciosos en las solicitudes para intentar inyectar código SQL en la base de datos subyacente.
- **Falsificación de solicitudes entre sitios (CSRF)**: los atacantes pueden enviar solicitudes maliciosas a una API en nombre de un usuario autenticado para realizar acciones no autorizadas.
- **Exposición de información confidencial**: los atacantes pueden explorar los endpoints de una API para obtener información confidencial, como claves de API, contraseñas y nombres de usuario.

Para evitar el abuso de APIs, los desarrolladores deben asegurarse de que la API esté diseñada de manera segura y que se validen y autentiquen adecuadamente todas las solicitudes entrantes. También es importante utilizar cifrado y autenticación fuertes para proteger los datos que se transmiten a través de la API.

Los desarrolladores pueden utilizar herramientas como Postman para probar la API y detectar posibles vulnerabilidades antes de que sean explotadas por los atacantes.

----
# Despliegue de Laboratorio y utilización de Postman

Para poder crear el laboratorio ingresaremos a este [proyecto](https://github.com/OWASP/crAPI) de Github y haremos un ``git clone https://github.com/OWASP/crAPI``, luego ingresaremos a la ruta */crAPI/deploy/docker* y usaremos ``docker-compose pull``.
Al finalizar la instalación de las imágenes con el comando anterior, utilizaremos ``docker-compose -f docker-compose.yml --compatibility up -d`` para desplegar los contenedores.

El contenedor que nos interesa es el que realiza **PortForwarding** al *puerto 8888*, hay otro contenedor corriendo por el *puerto 8025* que corresponde a una web de correos electrónicos que usaremos más adelante.

Nos dirigimos hacia http://localhost:8888 y veremos un panel de Login, lo que haremos será registrarnos. Mis credenciales serán santiago@santiago.com:123456Sa!

==IMPORTANTE, ESTE REPOSITORIO SUELE TENER VARIOS PROBLEMAS AL UTILIZARLO, HAY VECES QUE POR RAZÓNES X NO FUNCIONA CORRECTAMENTE, CUANDO SE PRESENTE ALGUNA SITUACIÓN COMO ESA, ES NECESARIO BORRAR TODOS LOS CONTENEDORES E IMAGENES Y REINSTALAR TODO DE CERO.==

Algo que tenemos que tener en cuenta antes de loguearnos, es que si hacemos un ``CTRL+SHIFT+C`` y vamos a la pestaña de *Network* veremos las peticiones que se están enviando en vivo. Ahora si a eso le sumamos el filtro de arriba a la derecha llamado "*XHR*" podremos centrarnos en las solicitudes que tengan que ver con la API que corre por detrás, ya que por defecto estará colocado en "*All*". El filtro **XHR** en la pestaña **Network** de las herramientas de desarrollo del navegador es muy útil para ver las solicitudes a **APIs**.

![[Abuso API 1.png]]

Ahora si nos iniciamos sesión, **veremos todas las peticiones que se envían hacia las APIs**, gracias al filtro colocado. Si hiciéramos Overing con el mouse por encima de cada archivo al que se le envió la petición, veríamos que cada uno de ellos corresponde a una API.

![[Abuso API 2.png]]

Si por ejemplo hiciéramos click en la petición "*Login*", veríamos que se está tramitando una petición por **POST** hacia el Endpoint */indentity/api/auth/login* y si vamos a la pestaña "*Request*" y colocamos el formato en **Raw** para verlo mejor, veríamos una estructura en JSON donde enviamos nuestro correo electrónico y contraseña.

![[Abuso API 3.png]]

Si ahora vamos a la pestaña "*Response*" veríamos que el servidor nos vincula como respuesta un **Token de sesión**, concretamente un **JWT** (*Jason Web Token*), esto se puede identificar por el típico formato que se emplea (Buscar JWT formato), con este JWT vamos a estár navegando por toda nuestra travesía por la web, **cada usuario posee un JWT diferente** y se generan de forma temporal para todos **hasta que se cierra la sesión**.

![[Abuso API 4.png]]

Pasemos a la siguiente petición que se ha enviado llamada "*dashboard*". En la "*Response*" veremos nuestros datos personales correspondientes a nuestra cuenta, la web nos brinda nuestra información y no la de otro usuario ya que arrastra automáticamente el **JWT** que se nos fue asignado a nosotros tras iniciar sesión para nuestras futuras solicitudes, esto lo podemos ver en la pestaña "*Headers*", ya que a nivel de cabeceras en la petición que hemos enviado, estamos emitiendo la cabecera "*authorization*" donde aparece nuestro **JWT**.

![[Abuso API 5.png]]

Si intentáramos ver la "*Response*" de la petición que corresponde al archivo "*vehicles*" no veríamos nada ya que no disponemos vehículos. ==Recordemos que esta web es una web donde almacenamos los datos de nuestro vehículo.==

------
## Instalación de Postman

Entendiendo todo lo anterior, haremos uso de la herramienta **Postman** para poder trabajar con los **Endpoints** de forma mucho mas organizada que con la pestaña *Network*. https://techbear.co/install-postman-debian-linux/

Lo primero que haremos será lo siguiente

- ``apt install snapd``
- ``wget [https://dl.pstmn.io/download/latest/linux64](https://dl.pstmn.io/download/latest/linux64) -O postman-linux-x64.tar.gz``
- ``sudo tar -xzf postman-linux-x64.tar.gz -C /opt``
- ``sudo ln -s /opt/Postman/Postman /usr/bin/postman``

Ejecutaremos **Postman** como usuario **no privilegiado** con ``postman``.

La primer actividad que realizaremos en la aplicación es enumerar la gran mayoría de los **Endpoints** de la **API** y representarlos en **Postman**.

-----
## Uso de Postman

Lo primero que haremos una vez estemos dentro de la aplicación será crear una nueva colección "*Create Collection*", en nuestro caso el nombre será "**crAPI**". Una vez hecho lo anterior le daremos a "*New*" y en "*Http*".

Comenzaremos desde cero nuevamente, iniciando sesión en la web y viendo las peticiones que se envían por detrás a través de la pestaña *Network*.

Como primer caso nos centraremos en el **file** "*login*", intentando representarlo en **Postman** copiando los datos y características que se emplean en la petición.

- Petición : **POST**
- URL : http://localhost:8888/identity/api/auth/login

Ahora iremos a la pestaña "*Body*" en la herramienta y presionamos en "*raw*", también colocaremos el formato "*JSON*", luego pegaremos la "*Request*" 

- Request (RAW) : ``{"email":"santiago@santiago.com","password":"123456Sa!"}``

Ahora solo quedaría darle a *Send* para que envié la petición y nos brinde la *Response* que contiene el **Token**.

![[Abuso API 6.png]]

Lo que resta es darle a "*Save*" arriba a la derecha para que **nos guarde esta petición** y le colocaremos el nombre "*Login*".
Básicamente lo que hicimos es copiar y pegar los mismos datos que vimos en la web con ``CTRL+SHIFT+C`` y los pasamos a **Postman** para tenerlos mas ordenados y que de esta forma sean más fáciles de manipular.

Haremos lo mismo con el Endpoint de "*dashboard*".

------
### Arrastrar JWT en todas las peticiónes automáticamente

==Algo muy importante==, es que si queremos que Postman **nos arrastre de manera automática el JWT** para nuestras futuras peticiones, debemos especificárselo, esto es cómodo con esta herramienta ya que podemos crear variables con datos que le especifiquemos, en este caso crearemos una variable que contenga el JWT.

Iremos a "*crAPI*" arriba a la izquierda y luego a la pestaña "*Variables*", le colocaremos un nombre como "*accessToken*", ahora como "*initial value*" le pondremos ``--``, y por ultimo en "*current value*" colocaremos el JWT pero ==el que nos brindó la herramienta== en la pestaña "*Login*", ahora solo falta darle a *Save*.

![[Abuso API 7.png]]

Lo que nos quedaría por hacer para que quede todo configurado correctamente es ir a la pestaña "*Authorization*", especificar el tipo de **Token**, en nuestro caso "*Bearer Token*" y en el campo "*Token*" colocar ``{{accessToken}}`` para hacer alusión a la variable que creamos recién.

![[Abuso API 8.png]]

Si enviamos la petición de "*Dashboard*" ya cargada, veremos que nos representa los datos de nuestra cuenta ya que nos ha interpretado correctamente la variable que contiene el Token.

![[Abuso API 9.png]]

----
### Enumeración y representación de Endpoints

Ya hemos representado en Postman el Endpoint de "*file*" y de "*dashboard*" en el ítem anterior, ahora seguimos enumerando más, toca entrar a la pestaña de "*Shop*" en la web y pasarlo a **Postman**.

![[Abuso API 10.png]]

---

Le damos a "*Buy*" en cualquier producto y pasamos el Endpoint que le corresponde al **Postman** con su respectiva *URL* y su "*Request*"

![[Abuso API 11.png]]

![[Abuso API 12.png]]

----

Le damos al botón "*Return*" en la web luego de haber hecho el ítem anterior, que sirve para solicitar un **reembolso**, este Endpoint también lo representaremos en Postman.

![[Abuso API 13.png]]

---
# Explotación de APIs luego de la enumeración de Endpoints
## Vector descartado

Lo primero que haremos como atacantes será **revisar que tipos de datos se suelen pedir para determinadas acciones en la web**, por ejemplo intentar cambiar el correo electrónico de nuestra cuenta.

![[Abuso API 14.png]]

Ahora nos dirigimos hacia el correo que al principio les dije que corría en un contenedor por el *puerto 8025* http://localhost:8025

![[Abuso API 15.png]]

Al ser tan complejo el Token, **descartaremos este vector de ataque**.

--------
## Primer Vector

Seguiremos buscando para ver de que forma podemos generar un ataque.

Vamos a hacer un **Logout** y le daremos a "*Forgot Password*", como nos solicita un correo electrónico, proporcionaremos el nuestro.

![[Abuso API 16.png]]

Ahora veamos el correo que nos llegó para chequear el **código OTP** que nos han enviado.

![[Abuso API 17.png]]

Este código es super débil, por lo tanto **podríamos intentar conseguirlo por fuerza bruta** para cambiarle la contraseña a otro usuario de la web.

![[Abuso API 18.png]]

Hasta que nosotros no proporcionemos un OTP válido, no vamos a cambiar la contraseña del usuario.

Veamos como se tramita la petición en la pestaña *Network* al darle a *Set Password* con un **OTP inválido**.

![[Abuso API 19.png]]

**Representémoslo** en Postman para ver que podemos hacer con esto.

![[Abuso API 20.png]]

Ahora lo que deberíamos hacer es en el campo "*otp*" mediante el uso de una herramienta de fuerza bruta como puede ser ``ffuf`` --> ``apt install ffuf``, probar con un **diccionario** que recorra **desde el 0000 hasta el 9999**.

- ``ffuf -u "http://localhost:8888/identity/api/auth/v3/check-otp" -w /usr/share/SecLists/Fuzzing/4-digits-0000-9999.txt -X POST -d '{"email":"test@test.com","otp":"FUZZ","password":"Newp@ss123"}' -H "Content-Type: application/json" -p 1 -mc 200``

En este caso usamos la herramienta **ffuf** programada en **GO** porque está orientado a **sockets y conexiones** por lo tanto tiene mas estabilidad, recordemos que al ser un laboratorio con pocos recursos asignados, se recomienda colocar el parámetro ``-p 1`` para que se demore **un segundo por solicitud**, esto con el objetivo de **no saturar el laboratorio** ya que de lo contrario podría crashear.

Si nosotros a la vez que **ffuf** realiza la fuerza bruta, enviamos muchas peticiónes con el botón *Send* en Postman, veremos que en determinado momento la respuesta nos dirá lo siguiente.

![[Abuso API 21.png]]

Significa que **hemos sido bloqueados por saturar con peticiónes** al servicio web, y este bloqueo es permanente, Esto de enviar nosotros manualmente peticiónes lo hacemos porque **ffuf** no nos reporta cuando nos bloquean.

Al ser bloqueados permanentemente no hay que darse por vencidos, al tener todo bien representado en **Postman** podemos **sacar conclusiones para ver de que forma podemos generar un Bypass** que nos libre del **bloqueo**.

Si ingresamos al Endpoint de "*Dashboard*" y observamos la dirección, veremos lo siguiente

``http://localhost:8888/identity/api/v2/user/dashboard`` y si revisamos el Endpoint de "*Check OTP*" veremos esto ``http://localhost:8888/identity/api/auth/v3/check-otp``

Si observamos bien, en *Dashboard* vemos que existe una "*v2*" y en* Check OTP* vemos que se emplea la "*v3*", esto puede darnos el indicio de que **hay una versión mas desactualizada de la API expuesta**, por lo tanto probemos modificar el Endpoint a "*v2*" para ver que pasa.

![[Abuso API 22.png]]

Vemos que se nos quitó el bloqueo, esto quiere decir que tal vez **la versión numero tres posee un limite de solicitudes continuas que la versión dos no**, de esta forma modificamos el comando de **ffuf** con el nuevo **Endpoint** y probamos.

==Normalmente los Tokens brindados suelen tener un tiempo de vida corto, por lo tanto volvamos a enviar el correo de restauración de contraseña a nuestra victima y rápidamente apliquemos la fuerza bruta.==

Vamos a hacer como que **nuestra víctima posee** el mail ``test@test.com`` para no tener que estar creando usuarios de más.

Una vez que la herramienta **ffuf** de con el código de estado **200 OK** significará que ese es el **código OTP**, pero no hace falta que lo enviemos nosotros manualmente, ya que automáticamente estamos enviando las solicitudes con la fuerza bruta, por lo tanto la contraseña ya fue cambiada debido a que esa petición fue enviada.

![[Abuso API 23.png]]

De esta forma la contraseña para el usuario test@test.com se ha cambiado a ``Newp@ss123``.

## Segundo Vector **MAC** (*Mass Assignment Attack*)

El segundo vector de ataque será buscar de alguna forma de **subirnos la cantidad del dinero que poseemos en la web**, para esto nos ayudaremos del **Endpoint** que almacenamos previamente en Postman llamado "*Available products*" la cual viaja a través de una petición de tipo *GET*, pero esto no tiene por que ser así siempre.

Nosotros como atacantes podemos **intentar cambiar el método que se utiliza para enviar determinadas peticiónes**, pero para **saber que tipos de peticiónes acepta** la web, debemos hacer un poco de reconocimiento con **fuerza bruta**. El diccionario que yo recomiendo para este tipo de fuzzing es uno especifico de **SecLists**, podemos ubicarlo de la siguiente forma ``locate \*methods\* | grep -i "sec"`` llamado "*http-request-methods*".

- ``ffuf -u "http://localhost:8888/workshop/api/shop/products?limit=30&offset=0" -w /usr/share/SecLists/Fuzzing/http-request-methods.txt -X FUZZ -mc 200,401``

![[Abuso API 24.png]]

La petición llamada "**Options**" se suele utilizar para **ver que peticiónes están disponibles en una web/API** ya que te lo suele decir, por ejemplo si vamos a **Postman** y cambiamos el tipo de petición a **Options** y después miramos las *Headers* de la respuesta veremos esto.

![[Abuso API 25.png]]

Lo que nos interesa de toda esta información es que la *API* acepta peticiónes de tipo **POST**, por lo tanto si la cambiamos a esa y la enviamos veremos esto.

![[Abuso API 26.png]]

Nos está pidiendo que rellenemos esos campos, es decir, que enviemos una solicitud con un *Body* en formato **RAW** y en **JSON** que contenga esos campos como tal **con información**, por lo tanto haremos eso ya que esto indica que estaremos **creando un nuevo objeto** para que esté a la venta en la web.

![[Abuso API 27.png]]

Al enviar la solicitud anterior, si vamos a la web y verificamos la tienda, veremos esto

![[Abuso API 28.png]]

Como le pusimos un precio en negativo, si le damos a "*Buy*" nos darán *$10.000* en la web, esto lo podremos chequear desde el **Endpoint** llamado *Buy Products* si actualizamos la solicitud, de esta forma habremos burlado la API nuevamente.

![[Abuso API 29.png]]

Este concepto de vulnerabilidad de API es llamado "**MAC**" (*Mass Assignment Attack*) o en español **Ataque de Asignamiento Masivo**.

------
## Tercer Vector **NOSQL Injection** a una API

Si prestamos atención al "Shop" de la web, hay un botón por arriba a la derecha llamado "*Add Coupons*" y al darle click veremos que nos pide un código de cupón, tratemos de averiguarlo de alguna forma.

Lo primero que haremos será colocar **un número cualquiera como cupón**, de esta forma intentaremos **ver como viaja esta petición** por detrás con ``CTRL+SHIFT+C`` en la pestaña de "*Network*" para luego meterlo en **Postman**.

![[Abuso API 30.png]]

Nosotros sabemos que por detrás corre un **MongoDB**, esto lo podemos saber por la herramienta ``whatweb`` o con la extensión **Wappalyzer**, por lo tanto al ser una base de datos **NOSQL** podríamos intentar realizar una [[Inyecciones NOSQL]]

Al "*Body*" ``{"coupon_code":"1"}`` le modificaremos de esta manera ``{"coupon_code":{"$ne":"1"}}``

![[Abuso API 31.png]]

De esta forma indicamos que el **cupón NO es igual a "1"**, y como eso es **verdadero**, nos devuelve el **cupón correcto**.
Por lo que se ve el cupón te da *$75*, si lo testeamos en la web veremos que funcionará.

------
## Cuarto Vector **BOLA** (Broken Objet Level Authorization)

Si nos dirigimos hacia la sección de "*Dashboard*" en la **web**, veremos que se trata de una sección que nos permite agregar nuestro vehículo, por lo tanto sigamos los pasos que nos indica la web para agregar el nuestro.

Al realizar todo correctamente, al fondo de la web veremos un botón que dice "*Refresh Location*" que se utiliza para rastrear en tiempo real a nuestro vehículo, observemos bien como se tramita esa solicitud con ``CTRL+SHIFT+C`` en la pestaña "*Network*" y pasemos toda la información a **Postman**.

![[Abuso API 32.png]]

Como respuesta obtenemos los datos de **nuestro vehículo** como tal, cada usuario en la web vería su vehículo en esta sección, si pudiéramos ver los vehículos de otros usuarios sería un "**BOLA**" (*Broken Objet Level Authorization*) una vulnerabilidad que permite **enumerar información privilegiada de otros usuarios como un tercero**, en este caso ver la **latitud** y **longitud** del vehículo de otro usuario.

Hay veces que las APIs **dan mas información de la debida en cuanto a usuarios respecta**, esto lo podemos chequear en este caso si vamos a la sección de "*Community*" y vemos como se tramita por detrás la petición a la hora de clickear por ejemplo en el comentario que hizo el usuario "*Adam*". Si miramos la respuesta de la solicitud veremos que podemos ver el **correo electrónico** (Que podríamos usar para quitarle la cuenta con el ==Primer Vector==, el *ID* de su **vehículo personal** y demás, lo que nos interesa a nosotros en este caso es el *VehicleID*.

Si prestamos atención en el Endpoint que cargamos en Postman, veremos que en la ruta se ve nuestro código de vehículo, probemos meter el código del usuario Adam ahí y enviemos la solicitud a ver que pasa.

![[Abuso API 33.png]]

![[Abuso API 34.png]]

De esta forma sabríamos toda la información acerca del vehículo del usuario *Adam* o del que se encuentre en la web, solo bastaría con encontrar el ID de su vehículo y listo.