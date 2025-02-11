-----
- Tags: #shellcode #esp
-----
# Definiciones

Una vez que se ha encontrado el **offset** y se ha sobrescrito el valor del registro **EIP** en un buffer overflow, el siguiente paso es identificar en qué parte de la memoria se están representando los caracteres introducidos en el campo de entrada.

Después de sobrescribir el valor del registro EIP, cualquier carácter adicional que introduzcamos en el campo de entrada, veremos desde Immunity Debugger que en este caso particular estos estarán representados al comienzo de la **pila** (**stack**) en el registro **ESP** (**Extended Stack Pointer**).

> El **ESP** (**Extended Stack Pointer**) es un registro de la CPU que se utiliza para manejar la pila (stack) en un programa. La pila es **una zona de memoria temporal** que se utiliza para almacenar valores y **direcciones de retorno** de las funciones a medida que se van llamando en el programa.

Una vez que se ha identificado la ubicación de los caracteres en la memoria, la idea principal en este punto es introducir un **shellcode** en esa ubicación.

> Un **Shellcode** son instrucciones de bajo nivel las cuales en este caso corresponderán a una instrucción maliciosa.

El **Shellcode se introduce en la pila** y se coloca en **la misma dirección de memoria donde se colocaron los caracteres sobrescritos**. En otras palabras, se aprovecha el desbordamiento del búfer para ejecutar el shellcode malicioso y tomar control del sistema.

Es ==importante== tener en cuenta que el shellcode **debe ser diseñado cuidadosamente para evitar que se detecte** como un programa malicioso, y debe ser **compatible con la arquitectura de la CPU y el sistema operativo** que se está atacando.

En resumen, la asignación de espacio para el shellcode implica identificar la ubicación en la memoria donde se colocaron los caracteres sobrescritos en el buffer overflow y colocar allí el shellcode malicioso. Sin embargo, no todos los caracteres del shellcode pueden ser interpretados.

-----
# Continuación de la enumeración

En el segmento anterior conseguimos calcular el **offset** y **controlar el EIP**, ahora lo que veremos es que es lo que pasaría si **ingresamos más caracteres después de haber sobrescrito el EIP**. A través de **Immunity Debugger**, veremos que estos caracteres "_extra_" estarán almacenados en la **pila**. Recordemos que la **pila** es una estructura de datos en la memoria que se utiliza para almacenar información de forma temporal, como valores de variables y direcciones de retorno de funciones. El **ESP** (Extended Stack Pointer) es un **registro especial** que **contiene la dirección de la ubicación actual del tope de la pila** en la memoria. A medida que se añaden o eliminan datos de la pila, el ESP se ajusta para **reflejar** la nueva posición del tope.

Por lo tanto vamos a hacer la prueba, modificaremos el script **eip_control.py** que hemos creado previamente y agregaremos una variable llamada ``after_eip`` que valdrá ``b"C"*200`` para ver en donde se ven reflejadas las letras "*C*" que en hexadecimal equivalen a *43*. Por ultimo solo quedaría agregar en la variable ``payload`` la **suma de esa variable nueva** luego de la variable ``eip``.

![[BOF 9.png]]

Ahora ejecutaremos la herramienta y veremos los registros en el **Immunity Debugger**.

![[BOF 10.png]]

Ahora si **remarcamos con el mouse** el valor hexadecimal *0258A128* y damos click derecho *Follow in dump* podremos ver en **la parte inferior izquierda** mas en detalle como es que esa zona está estructurada.

![[BOF 11.png]]

La sección de *Address* corresponde a las direcciones y las secciones *Hex dump* y *ASCII* corresponden a lo que está representado que en nuestro caso son nuestras "*C*", si nosotros subimos un campo mas arriba del que se ve en la imagen anterior, veremos algunas *AAA* del **offset** y luego nuestras *BBBB* correspondientes al **EIP**.

![[BOF 12.png]]

Recordemos que el **ESP** es un registro de la ubicación actual del tope de la pila. 

Con la imagen anterior, podemos ver que nuestras "_C_" comienzan justo al principio del **ESP**. Uno pensaría que, si colocamos la dirección del ESP (_0258A128_) en el **EIP**, el programa debería interpretar nuestras "_C_", lo cual es correcto. Sin embargo, **no podemos hacerlo de manera directa**. Primero necesitamos apuntar a una dirección que contenga una instrucción que aplique un **OP Code** (código de operación) de tipo **Jump ESP** (`JMP ESP`). Esta instrucción nos permite redirigir la ejecución hacia el **ESP**, donde nuestras "_C_" están almacenadas, y desde allí podemos **tomar control del flujo de ejecución**.

Recordemos que en este caso, estamos ingresando las letras "_C_" en el **ESP**, pero podríamos inyectar **shellcode**, que consiste en instrucciones de bajo nivel diseñadas para ser ejecutadas por el procesador. Estas instrucciones permiten realizar acciones específicas, como **abrir una conexión reversa** o **ejecutar comandos arbitrarios**, dependiendo de la naturaleza del exploit. 
Cabe aclarar que todo esto es posible porque tenemos la protección **DEP (Data Execution Prevention)** deshabilitada. DEP es una medida de seguridad que evita la ejecución de código en áreas de memoria marcadas como no ejecutables, como la pila. Al deshabilitar DEP, podemos ejecutar el **shellcode** en el **ESP** sin restricciones.

Debemos entender que **no todos los caracteres son interpretados correctamente por el programa**. Algunos caracteres son considerados **Badchars** (caracteres problemáticos) que, al ser procesados, pueden **corromper** el shellcode o hacer que el programa **no interprete** o **ejecute** las instrucciones correctamente. Estos caracteres suelen ser aquellos que tienen un significado especial para el programa, como el `\x00` (null byte), que indica el final de una cadena en muchos lenguajes, o caracteres que alteran la estructura de los datos. Es crucial **identificar y evitar estos caracteres al crear el shellcode** para garantizar su ejecución correcta. Cada programa posee **diferentes Bad chars** por lo tanto nosotros como atacantes tendremos que descubrir cuales son en los distintos escenarios que se nos presenten.

En la siguiente sección veremos como generar un **Bytearray** para probar todas las combinatorias posibles en hexadecimal y ver que caracteres no le agradan al programa, de esta forma lo identificaremos rápidamente y como podríamos generar nuevos **Bytesarrays**.