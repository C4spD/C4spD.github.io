----------
- Tags: #Linux #redirectores #stdin #stdout #stderr
--------
# Definiciones

> Los flujos estándar de datos **son canales a través de los cuales un programa en un sistema operativo interactúa con su entorno** para recibir datos de entrada y enviar resultados de salida. En el sistema [[Linux]], hay tres flujos estándar de datos que son fundamentales, el **stdin**, el **stdout**, y el **stderr**, estos tres referenciados por los números **0**, **1**, y **2** en el orden escrito previamente.

> **STDIN** Este es el flujo estándar a través del cual **un programa recibe datos de entrada**. Por lo general, **STDIN está asociado con el teclado**, lo que significa que **el programa espera la entrada del usuario desde el teclado**. Este flujo se refiere a la petición o data otorgada por nosotros hacia el SO.

> **STDOUT** Este es el flujo estándar a través del cual **un programa envía sus resultados o mensajes de salida**. Por defecto, **STDOUT está asociado con la pantalla (terminal)**, lo que significa que **los resultados del programa se imprimen en la pantalla**. Este flujo se refiere a la respuesta que recibimos luego de un STDIN.

> **STDERR** Este es el flujo estándar a través del cual **un programa envía mensajes de error o diagnóstico**. Similar a STDOUT, por defecto, **STDERR también está asociado con la pantalla** pero de manera paralela a el **STDOUT**, ya que un mensaje de error no es lo mismo que un mensaje de **STDOUT**.

> **Redirecciones** Son llamadas **redirecciones a la ejecución de una redirección a un flujo estándar de datos STDIN, STDOUT, STDERR**. Estas redirecciones **se utilizan para poder enviar la información otorgada o recibida hacia un punto que nosotros queramos** para facilitar ya sea la visualización de la información, o simplemente filtrar el flujo que queramos.

-----------
# Utilización de redirecciones

Las redirecciones, utilizadas comúnmente con el símbolo **``>``** , son utilizadas para facilitar acceso a información o filtrar contenido especifico para facilitar su acceso y visualización. Hay variedades de formas a la hora de redirigir un flujo estándar de datos. a continuación mostraremos algunos ejemplos para que sea mas claro entenderlo.

Algo que debemos tener en cuenta es la existencia del **``/dev/null``** este es el directorio donde se descartan los datos de búsqueda que no interesan mediante el uso de **redirecciones**, se suele referenciar a este directorio como un agujero negro, ya que todo lo que mandemos ahí se eliminará automáticamente del sistema.
### Ejemplos de redirecciones

En el siguiente caso filtraremos con el numero **``2``** y con el símbolo **``>``** para referenciar que queremos enviar todos los errores al directorio **``/dev/null``**, de esta forma si el comando **``cat /etc/passwd``** nos diera algún tipo de **error** o **acceso denegado**, no se mostraría en pantalla debido a la redirección que utilizamos.

- **``cat /etc/passwd 2>/dev/null``** 

En el siguiente caso enviamos todo el contenido otorgado por el comando **``cat /etc/passwd``** a un archivo de texto llamado **``text.txt``**. Algo a tener en cuenta es que si el archivo **``text.txt``** no existiese se crearía automáticamente. En este caso no usamos el **1**, ya que no poner nada simboliza que queremos **redirigir el STDOUT** recibido.

- **``cat /etc/passwd > text.txt``** 

En el siguiente caso enviaremos tanto el **``STDOUT(1)``** como el **``STDERR(2)``** de una manera simplificada y al mismo tiempo con el uso del símbolo **``&``** al directorio **``/dev/null``**

- **``cat /etc/passwd &>text.txt``**

Hay variedad de formas para poder realizar redirecciones, se puede llegar a utilizar de maneras especificas tanto en la elaboración de scripts, como en búsqueda de información, por eso es sumamente importante tenerlo en cuenta a la hora de manipular información.