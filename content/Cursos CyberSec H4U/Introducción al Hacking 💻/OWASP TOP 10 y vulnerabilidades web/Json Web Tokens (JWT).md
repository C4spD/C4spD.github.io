----
- Tags: #jwt #cookies #web
------
# Definición

> **Json Web Tokens (JWT)** son tokens usados para autenticar y autorizar usuarios en aplicaciones web, basados en el estándar abierto (RFC 7519). Son compactos y seguros para transmitir información entre partes.

En la fase de enumeración y explotación de JWT, un atacante obtiene información sobre los JWT de la aplicación, lo que puede permitir explotar debilidades en autenticación y autorización. La enumeración ocurre cuando el atacante usa técnicas como fuerza bruta o ingeniería inversa para obtener información sobre los JWT. Esto puede implicar adivinar o falsificar tokens y verificar si son aceptados. Con un JWT válido, el atacante podría acceder a datos sensibles como nombres de usuario y contraseñas.

La explotación sucede cuando el atacante usa esta información para aprovechar debilidades, como falsificar un JWT si la aplicación no valida correctamente la firma del token. Para prevenir esto, es importante seguir buenas prácticas de desarrollo, como validar solicitudes, gestionar claves de firma de manera segura y limitar el tiempo de expiración de los JWT.
# Explotación de JWT en laboratorio

Lo primero que haremos será desplegar nuestro laboratorio de [**skf-labs**](https://github.com/blabla1337/skf-labs). Exactamente vamos a ir a la ruta ``skf-labs/nodeJs/JWT-null``

- ``npm install``
- ``npm start``

------

Una vez ya tengamos montado el laboratorio dentro de nuestra máquina, iremos a nuestro navegador al servicio web abierto por el *puerto 5000* en nuestra red local. Dentro de la web dispondremos de dos campos correspondientes a un panel de Login, en el mismo nos indican cuales son las credenciales de dos usuarios válidos, por lo tanto nuestro objetivo es pasar de ser el usuario *user*, a ser el usuario *user2*.

![[JWT 1.png]]

Si ingresamos a la cuenta de *user2* veremos que dispone del privilegio **mortal**, por lo tanto esta es la manera de verificar cuando estamos en una cuenta, y cuando en otra.

-------

Una vez estando autenticados como *user*, si presionamos la combinación de teclas ``CTRL+SHIFT+C``, vamos a la pestaña *Storage* y en la subpestaña *Local Storage* veremos nuestra **Cookie de sesión** correspondiente a *user*.

![[JWT 2.png]]

Esta **Cookie** de sesión **esta dividida por tres puntos**, y cada parte por separado posee un contenido diferente. 

``XXXXX.XXXXX.XXXXX`` La primera parte corresponde a la **Cabecera/Header**, que siempre estará ==en Base64==, la parte central corresponde al **Payload** también ==en Base64== (que también puede arrastrar propiedades que nos identifican a nosotros como usuarios) y la ultima al **Signature** para la firma digital. Esta ultima parte del JWT correspondiente a la firma digital se encarga de **verificar la integridad del Token** para así prevenir falsificaciones, esta se crea empleando un **algoritmo de hash criptográfico** que utiliza por detrás una clave secreta.

-----

Utilizaremos la web https://jwt.io para poder indagar más en profundidad con este **JWT** que nos otorgó la web.

![[JWT 3.png]]

-------
## JWT-NULL

Hay veces que como atacantes lo tenemos fácil se puede llegar a aceptar una propiedad llamada ``"NONE"`` en el **algoritmo** (**``"alg":``**) del *Header*, esta propiedad indica que no existe un algoritmo como tal, por lo tanto la parte del *Signature* ya no es del todo necesaria.

Toda esta manipulación la haremos desde **nuestra terminal**, ya que desde la web puede generar ciertos inconvenientes.

Nuestro objetivo será en el *Header* en la sección ``"alg":`` colocarle un ``"NONE"``, quedando tal que así ``"alg": "NONE"``. Luego en la sección del *Payload* vemos un campo ``"id": 1,`` con esto intuimos que el usuario *user2* al que queremos ingresar con su **Cookie** puede llegar a ser el ``"id": 2,``, por lo tanto cambiaremos ese campo.

-----
- **Header**

![[JWT 4.png]]

``eyJhbGciOiAiTk9ORSIsInR5cCI6IkpXVCJ9``

Si nos diera un signo ``=`` a la hora de hacer la conversión en el final, simplemente lo **borramos**, ya que de lo contrario daría conflicto.

------
- **Payload**

![[JWT 5.png]]

``eyJpZCI6MiwiaWF0IjoxNzI1OTA2ODgyLCJleHAiOjE3MjU5MTA0ODJ9``

-----

Ya con estos dos campos manipulados de esa manera, si no estuviese bien configurado el JWT, **no sería necesario colocar el campo Signature**, simplemente colocaríamos un punto ``(.)`` al final, por lo tanto quedaría tal que así .

- ``eyJhbGciOiAiTk9ORSIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzI1OTA2ODgyLCJleHAiOjE3MjU5MTA0ODJ9.``

Ahora probemos colocarlo en la web a ver si ingresamos como *user2* que recordemos poseía la propiedad "**mortal**".

![[JWT 6.png]]

-------
## JWT-Secret

Desplegaremos un contenedor pero esta vez el de la ruta ``skf-labs/nodeJs/JWT-secret``, todo de igual forma que como lo hicimos en el caso anterior.

- ``npm install``
- ``npm start``

-----

Si tuviéramos un caso en el que el *Header* sea validado, y no nos permita el uso de ``"NONE"``, nuestra ultima opción sería emplear reconocimiento del **Secret** para el *Signature*.

![[JWT 7.png]]

El botón ``Authenticate`` sirve para **resetear** la Cookie, y el de ``Show userId`` es para **mostrar el usuario actual**, nosotros somos el usuario ``userId:1``

Ahora veamos la Cookie de sesión que se nos asignó en la web https://jwt.io

![[JWT 8.png]]

Prestamos atención al apartado de *Signature*, veremos que dice ``your-256-bit-secret``, este es el secreto del **Token** que nosotros no lo conocemos. Este secreto suele estár **hardcodeado** en el aplicativo, específicamente en los archivos de configuración, si tuviéramos un **LFI** o alguna **vulnerabilidad** que permita ver los archivos que configuran a la aplicación, podríamos llegar a encontrarlo. 
Si nosotros llegaremos descubrir el ==secreto del Token==, ya sea por un **LFI** o por **Fuerza bruta** y lo colocamos en esa sección, independientemente de lo que pongamos en el *Header* o en el *Payload*, **será válido**. Con este secreto a nuestro favor podríamos manipular el *Header* o *Payload*, para así **autenticarnos como otro usuario** o **modificar el JWT**.

En nuestro caso intentaremos hallarlo empleando **Fuerza bruta** con la herramienta ``john``. Para ello habría que crear un archivo cuyo contenido sea el **JWT** (*jwt.txt* por ejemplo) y después ejecutar el siguiente comando 

- ``john jwt.txt --wordlist=/usr/share/wordlists/rockyou.txt --format=HMAC-SHA256``

Cabe destacar que la herramienta ``john`` solo funciona para JWT con algoritmos *HS256*, *HS384* y *HS512*

![[JWT 11.png]]

De esta forma obtendríamos que el secreto es **secret**, por lo tanto en la misma web podemos colocarlo para que nos lo hashee directamente.

![[JWT 9.png]]

Ahora solo queda pegarlo en la web para ver si conseguimos el acceso a el otro usuario.

![[JWT 10.png]]

Listo, hemos efectuado la **explotación** correctamente.