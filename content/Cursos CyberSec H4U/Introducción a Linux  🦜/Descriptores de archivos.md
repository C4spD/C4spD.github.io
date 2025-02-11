---------
- Tags: #descriptores 
---------
# Definición

> Un descriptor de archivos **es un número entero que se utiliza para identificar y acceder a un archivo o recurso** en [[Linux]]. Estos descriptores de archivos **son parte del modelo de E/S (entrada/salida)** del sistema operativo y **se utilizan para realizar operaciones de lectura, escritura y manipulación de archivos**.

-------
# Usos de descriptores

A modo de ejemplo, estaremos empleando un descriptor de archivo identificado con el numero **3**, siempre nos manejaremos con ese numero para este archivo.

- **``exec 3<> prueba1``**
- **``id >&3``**

En este caso con el comando **``exec``** estamos ejecutando un descriptor de archivo con el **numero 3 como asignación**
Con **``<>``** le damos permiso al archivo **``prueba1``** de lectura y de escritura, para darle **solo lectura usamos ``<``** y para darle **solo escritura ``>``**

Si quisiéramos meterle al descriptor de archivo **``prueba1``** contenido, podríamos redirigirlo utilizando **``>&3``**, en este caso le metimos información con el comando **``id``**, de esta forma podemos agregar todo lo que queremos ya que se agregara al archivo actual.

Si deseamos **cerrar el descriptor de archivo** utilizamos **``exec 3>&-``**, esto evitara que le podamos agregar mas contenido y **guardara el agregado previamente**.
# Creación de copias de descriptores de archivos

Hay que tener en cuenta que se pueden crear copias de descriptores de archivos, también algo importante a destacar es que no son copias por separado, si no que se encuentran vinculadas entre si una vez que las realicemos, si borramos el contenido de uno, borraremos el contenido de su copia.

- **``exec 5<> data``** creamos el descriptor de archivos identificado con **el numero 5**
- **``whoami >&5``** metemos un **whoami** al **descriptor de archivos 5**
- **``exec 8>&5``** estamos haciendo que lo que haya en el **descriptor de archivos 5**, **se copie al descriptor de archivos 8 que acabamos de crear a la vez**

Con esto **creamos una copia del descriptor de archivo numero 8 que a su vez va a estar enlazado con el 5**, de esta forma todo lo que metamos en uno, va a estar en el otro.

Ahora, podemos crear una copia de un descriptor de archivo, y a su vez cerrar otro. Por ejemplo

- **``exec 5<> example``**
- **``whoami >&5``**
- **``exec 6>&5-``** en este caso estamos haciendo lo mismo que hicimos anteriormente, **copiamos el descriptor 5 con el 6, pero a su vez cerramos el 5 con el "-"**)
