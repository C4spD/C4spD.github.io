----
- Tags: #PATH #escalation 
----
# Definición

> **PATH Hijacking** es una técnica utilizada por los atacantes para **secuestrar** **comandos** de un sistema Unix/Linux mediante la manipulación del **PATH**. El PATH es una variable de entorno que define las rutas de búsqueda para los archivos ejecutables en el sistema.

En algunos binarios compilados, algunos de los comandos definidos internamente pueden ser indicados con una ruta relativa en lugar de una ruta absoluta. Esto significa que el binario busca los archivos ejecutables en las rutas especificadas en el PATH, en lugar de utilizar la ruta absoluta del archivo ejecutable.

Si un atacante es capaz de alterar el PATH y crear un nuevo archivo con el mismo nombre de uno de los comandos definidos internamente en el binario, puede lograr que el binario ejecute la versión maliciosa del comando en lugar de la versión legítima.

Por ejemplo, si un binario compilado utiliza el comando ``ls`` sin su ruta absoluta en su código y el atacante crea un archivo malicioso llamado ``ls`` en una de las rutas especificadas en el PATH, el binario ejecutará el archivo malicioso en lugar del comando legítimo ``ls`` cuando sea llamado.

Para prevenir el PATH Hijacking, se recomienda utilizar **rutas absolutas** en lugar de rutas relativas en los comandos definidos internamente en los binarios compilados. Además, es importante asegurarse de que las rutas en el PATH sean controladas y limitadas a las rutas necesarias para el sistema. También se recomienda utilizar la opción de permisos de ejecución para los archivos ejecutables solo para los usuarios y grupos autorizados.

# Ejemplos

Si nosotros creamos un pequeño script en ``C`` llamado ``test.c`` que ejecute dos comandos uno con **ruta relativa**, y otro con **ruta absoluta** podemos ver un ejemplo más claro.

 ```C
#include <stdio.h>

int main(){
	setuid(0);
	printf("\n[+] Actualmente somos el siguiente usuario: \n\n");
	system("/usr/bin/whoami");
	
	printf("\n[+] Actualmente somos el siguiente usuario: \n\n");
	system("whoami");
	prinf("\n\n")
	return 0;
}
```

Si le asignamos permisos **SUID** a este archivo con ``chmod u+s test.c`` y después hacemos un ``gcc test.c -o test`` para crear el binario **test** a partir del script ``test.c``, podremos ejecutarlo con ``./test``

![[PI 1.png]]

De esta forma veremos dos **Outputs idénticos**, pero que por detrás están siendo ejecutados de diferentes maneras, uno con **ruta absoluta** y otro con **ruta relativa**.

Si nosotros nos pasamos a otro usuario y ejecutamos el binario, veremos como este **es ejecutado como ROOT** por poseer permisos **SUID**, por lo tanto como atacantes tendríamos que investigar de donde proviene el Output que dice "*root*", para verificar si es una **cadena de texto** o se está efectuando un **comando por detrás**.

- Primero realizamos un ``file test`` para ver que tipo de archivo es, en este caso un binario
- Segundo realizamos un ``strings test`` para ver solo los caracteres legibles, y luego concatenamos con un grep para buscar por el comando whoami, intuyendo que se está empleando el mismo. ``strings test | grep "whoami"``

En el segundo paso veremos que hay dos resultados, que son los que definimos previamente, una ruta absoluta y una ruta relativa.

Como este archivo ejecuta el comando con una ruta relativa a ``whoami`` es un riesgo.

----

El concepto **Path Hijacking** entra en este caso, cuando vemos que un **binario** ejecuta un comando a través de una **ruta relativa**.

Si nosotros hacemos un ``echo $PATH`` podremos ver nuestra variable de entorno.

![[PI 2.png]]

Todas estas rutas sirven para que a la hora de ejecutar un binario con **ruta relativa**, por ejemplo ``whoami`` (sea creado por el usuario o por el sistema mismo) **busque en cada una de esas rutas** separadas por dos puntos ``:`` hasta encontrar su **ruta absoluta**, de esta forma no es necesario poner ``/usr/bin/whoami`` ya que se "abrevia" mucho más.

Nosotros como atacantes podemos **manipular la variable de entorno** para aprovecharnos del binario que utiliza ``whoami`` de manera relativa.

- ``export PATH=/tmp/:$PATH``

El PATH quedaría tal que así: ``/tmp/:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin``

Acá estamos indicando que primero queremos que busque binarios por la ruta ``/tmp/`` y que luego continúe con el PATH común. Tenemos que entender que orden de búsqueda del **PATH** es de **izquierda a derecha**.

Ahora lo que debemos hacer es crear un archivo llamado **whoami** en la ruta ``/tmp/`` ya que este será interpretado antes que el archivo legítimo llamado **test**, de esta manera podríamos controlar lo que queremos que se ejecute, por ejemplo podríamos colocarle dentro el comando ``bash -p`` para obtener un **bash privileged** ya que recordemos que al ejecutar el binario **test** y al poseer el permiso **SUID** es root el que estaría ejecutando el comando, por lo tanto **sería root el que nos brinde la consola privilegiada**.

Si nosotros ejecutamos ahora ``./test`` cuando realice el segundo ``whoami`` que está con **ruta relativa**, al buscar por el PATH, encontrara la coincidencia con **el archivo malicioso** que creamos en el directorio ``/tmp/`` primero antes que la legitima, y de esta manera se **ejecutará** nuestro archivo malicioso, **convirtiéndonos** en el usuario ``root``.

![[PI 3.png]]