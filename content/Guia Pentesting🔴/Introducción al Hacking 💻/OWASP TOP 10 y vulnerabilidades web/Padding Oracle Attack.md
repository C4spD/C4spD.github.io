------
- Tags: #vulnerabilidades #web #paddingoracleattack
----
# Definición

> Un ataque de oráculo de relleno (**Padding Oracle Attack**) es un tipo de ataque contra datos cifrados que permite al atacante **descifrar** el contenido de los datos **sin conocer la clave**.

Un oráculo hace referencia a una “indicación” que brinda a un atacante información sobre si la acción que ejecuta es correcta o no. Imagina que estás jugando a un juego de mesa o de cartas con un niño: la cara se le ilumina con una gran sonrisa cuando cree que está a punto de hacer un buen movimiento. Eso es un oráculo. En tu caso, como oponente, puedes usar este oráculo para planear tu próximo movimiento según corresponda.

El relleno es un término criptográfico específico. Algunos cifrados, que son los algoritmos que se usan para cifrar los datos, funcionan en **bloques de datos** en los que cada bloque tiene un tamaño fijo. Si los datos que deseas cifrar no tienen el tamaño adecuado para rellenar los bloques, los datos se **rellenan** automáticamente hasta que lo hacen. Muchas formas de relleno requieren que este siempre esté presente, incluso si la entrada original tenía el tamaño correcto. Esto permite que el relleno siempre se quite de manera segura tras el descifrado.

Al combinar ambos elementos, una implementación de software con un oráculo de relleno revela si los datos descifrados tienen un relleno válido. El oráculo podría ser algo tan sencillo como devolver un valor que dice “Relleno no válido”, o bien algo más complicado como tomar un tiempo considerablemente diferente para procesar un bloque válido en lugar de uno no válido.

Los cifrados basados en bloques tienen otra propiedad, denominada “**modo**“, que determina la relación de los datos del primer bloque con los datos del segundo bloque, y así sucesivamente. Uno de los modos más usados es **CBC**. CBC presenta un bloque aleatorio inicial, conocido como “**vector de inicialización**” (**IV**), y combina el bloque anterior con el resultado del cifrado estático a fin de que cifrar el mismo mensaje con la misma clave no siempre genere la misma salida cifrada.

Un atacante puede usar un oráculo de relleno, en combinación con la manera de estructurar los datos de CBC, para enviar mensajes ligeramente modificados al código que expone el oráculo y seguir enviando datos hasta que el oráculo indique que son correctos. Desde esta respuesta, el atacante puede descifrar el mensaje byte a byte.

Las redes informáticas modernas son de una calidad tan alta que un atacante puede detectar diferencias muy pequeñas (menos de 0,1 ms) en el tiempo de ejecución en sistemas remotos. Las aplicaciones que suponen que un descifrado correcto solo puede ocurrir cuando no se alteran los datos pueden resultar vulnerables a ataques desde herramientas que están diseñadas para observar diferencias en el descifrado correcto e incorrecto. Si bien esta diferencia de temporalización puede ser más significativa en algunos lenguajes o bibliotecas que en otros, ahora se cree que se trata de una amenaza práctica para todos los lenguajes y las bibliotecas cuando se tiene en cuenta la respuesta de la aplicación ante el error.

Este tipo de ataque se basa en la capacidad de cambiar los datos cifrados y probar el resultado con el oráculo. La única manera de mitigar completamente el ataque es detectar los cambios en los datos cifrados y rechazar que se hagan acciones en ellos. La manera estándar de hacerlo es crear una firma para los datos y validarla antes de realizar cualquier operación. La firma debe ser verificable y el atacante no debe poder crearla; de lo contrario, podría modificar los datos cifrados y calcular una firma nueva en función de esos datos cambiados.

Un tipo común de firma adecuada se conoce como “**código de autenticación de mensajes hash con clave**” (**HMAC**). Un HMAC difiere de una suma de comprobación en que requiere una clave secreta, que solo conoce la persona que genera el HMAC y la persona que la valida. Si no se tiene esta clave, no se puede generar un HMAC correcto. Cuando recibes los datos, puedes tomar los datos cifrados, calcular de manera independiente el HMAC con la clave secreta que compartes tanto tú como el emisor y, luego, comparar el HMAC que este envía respecto del que calculaste. Esta comparación debe ser de tiempo constante; de lo contrario, habrás agregado otro oráculo detectable, permitiendo así un tipo de ataque distinto.

En resumen, para usar de manera segura los cifrados de bloques de CBC rellenados, es necesario combinarlos con un HMAC (u otra comprobación de integridad de datos) que se valide mediante una comparación de tiempo constante antes de intentar descifrar los datos. Dado que todos los mensajes modificados tardan el mismo tiempo en generar una respuesta, el ataque se evita.

El ataque de oráculo de relleno puede parecer un poco complejo de entender, ya que implica un proceso de retroalimentación para adivinar el contenido cifrado y modificar el relleno. Sin embargo, existen herramientas como **PadBuster** que pueden automatizar gran parte del proceso.

**PadBuster** es una herramienta diseñada para automatizar el proceso de descifrado de mensajes cifrados en modo **CBC** que utilizan relleno **PKCS #7**. La herramienta permite a los atacantes enviar peticiones HTTP con **rellenos maliciosos** para determinar si el relleno es válido o no. De esta forma, los atacantes pueden adivinar el contenido cifrado y descifrar todo el mensaje.

# Conceptos básicos CBC, Padding, XOR

Antes de realizar cualquier explotación es importante que entendamos bien el concepto de **Padding** y el tipo de cifrado **"CBC"** que se está empleando en la web que utilizaremos.

**CBC** viene de *Cipher-block chaining*, este método de cifrado lo que hace es **cifrar la información proporcionada** por nosotros los "usuarios" así como **garantizar la autenticación**, en este caso *CBC* se emplea a través del panel de Login de la web actual.

El método de cifrado **CBC** se encarga de **dividir el mensaje en bloques de X bytes**, además a algo a destacar de este modo de cifrado es que **cada bloque se somete a un "XOR" con el bloque cifrado anterior** pero en el caso del primer bloque que no posee uno detrás de el, se le aplica un *Initialization Vector (IV)* o *Vector de inicialización*. 

La operación *XOR* (*eXclusive OR*) es una operación lógica binaria que se utiliza para combinar bits. **En el contexto del cifrado CBC**, la operación XOR se utiliza para **mezclar el texto plano con el texto cifrado anterior**. Para entenderlo mejor recomiendo que vean cada linea de bloque por individual.

![[POA 2.png]]

Lo mismo sucede para el caso del **Descifrado**, pero en este caso es al revés.

![[POA 3.png]]

--------

El **cifrado** como tal se realiza empleando **bloques de tamaño fijo**, para nosotros asegurarnos de que el texto plano encaje perfectamente en uno o varios bloques se emplea algo llamado **Padding** o **Relleno**, este relleno se puede hacer de múltiples maneras, una forma común es por ejemplo emplear "*PKCS7*".

*PKCS#7* define un método de relleno que consiste en **añadir bytes adicionales al final del último bloque de texto plano**, donde cada byte tiene el valor del número de bytes añadidos. Por ejemplo, si se necesitan añadir 4 bytes de relleno, cada byte tendría el valor *0x04*.

En el siguiente ejemplo tendremos una cadena "*SUPERSECRET123*", que en el primer caso, la cantidad de caracteres no llega a completar el tamaño total de la longitud del bloque en especifico (**Block #1**) y lo que realiza el método *PKCS7* es rellenar los huecos que quedan al final, variando en su valor dependiendo de cuantas casillas falten completar. En el primer caso al faltar dos casillas se repite *0x02* 2 veces, en el segundo faltan tres casillas por lo tanto *0x03* 3 veces, y así sucesivamente.

![[POA 4.png]]

---

Cuando una aplicación comienza a descifrar un mensaje lo que se realiza es **una limpieza del Padding o Relleno**, si durante la limpieza del relleno nosotros **poseemos un relleno INVALIDO** que desencadena algún tipo de comportamiento **detectable**, ahí es cuando se dice que tenemos un *Padding Oracle* o *Oráculo de Relleno*. El comportamiento detectable como tal puede ser un error, una falta de resultado, una respuesta mas lenta, etc. Si nosotros como atacantes somos capaces de **detectar este comportamiento**, entonces seremos capaces de **descifrar los datos** ==e incluso también podríamos partir de un texto plano y cifrarlo, esto se realizara mas adelante con la herramienta Padbuster==.

------

Lo que se realizará a continuación es una explicación de la **aritmética** que se emplea a la hora de realizar un descifrado de una cadena de **texto encriptada**, para así obtener una porción de **texto claro**. (==ENCRPYTED, DECRYPTED, CLEARTEXT==)

En la siguiente imagen tendremos dos bloques, **Bloque uno** y **Bloque dos**, y en ambos casos **el texto está cifrado**. Durante el proceso de descifrado en el cifrado *CBC*, en el caso del Bloque dos, se descifra internamente con una **key** que el propio servidor conoce para llegar al bloque **Intermedio** que está plenamente descifrado, luego para conseguir a partir de esa cadena descifrada una porción de texto claro se debe realizar una operatoria especifica. Los valores intermedios son producidos por un proceso de descifrado específico (como AES) que transforma los datos encriptados en una forma que luego puede ser combinada mediante XOR para recuperar el texto claro original.

![[POA 6.png]]

Si nosotros poseemos la longitud de 8 BITS que se ve en la imagen anterior en la sección "Cleartext" y deseáramos saber **cual es el carácter correspondiente** a *C15* por ejemplo, deberíamos hacer un **XOR** entre *E7* y *I15* ``E7 ^ I15``, recordando que E7 respeta a la *posición 8* de la longitud total del bloque, es decir *E7* está en la *posición 8* al igual que *C15*, y *I15* también respeta la posición, ya que está ubicado en la *posición 8*.

-------

**¿Qué es XOR?**

XOR, abreviación de "Exclusive OR" (o exclusivo), es una operación lógica entre dos valores binarios (0 o 1). Esta operación devuelve un resultado que indica si los dos valores son diferentes entre sí.

**¿Cómo funciona?**

Imagina que tienes dos interruptores o botones:

- Si ambos interruptores están en la misma posición (ambos encendidos o ambos apagados), XOR dará como resultado 0.
- Si los interruptores están en posiciones diferentes (uno encendido y otro apagado), XOR dará como resultado 1.

**Tabla de verdad de XOR:**

- 0 XOR 0 = 0
- 0 XOR 1 = 1
- 1 XOR 0 = 1
- 1 XOR 1 = 0

-----

**Cifrado XOR**

Supongamos que tenemos un mensaje original en texto plano y una clave secreta compartida entre el emisor y el receptor. Para cifrar el mensaje utilizando XOR:

- **Mensaje original (en binario)**: 10101100
- **Clave secreta (en binario)**: 11001010

Para cifrar el mensaje, simplemente aplicamos XOR bit a bit entre cada bit del mensaje original y la clave: ==Siempre tomando como referencia la tabla de la verdad de XOR==

```
Mensaje original:  10101100
Clave secreta:     11001010
-------------------------
Mensaje cifrado:   01100110
```

Otro ejemplo, si realizamos una operatoria ``4 ^ 6`` en **python3 interactivo**, nos dará como resultado ``2``, esto es porque se realiza un **XOR** bit a bit del valor binario de 4 y de 6 respectivamente, es decir *100* y *110* que es igual a *010* es decir *2*.

```
Valor del numero "4" en binario: 100
Valor del numero "6" en binario: 110
--------------------------------------
Resultado del XOR entre "4^6":   010
```

==Algo muy importante a tener en cuenta== es que al hacer ``4 ^ 6 = 2`` podríamos cambiar el orden de los números como por ejemplo ``2 ^ 4`` y eso sería igual al valor faltante, que en este caso es ``6``. Otro ejemplo sería ``6 ^ 2 = 4`` y así en cualquier orden que probemos.

----

Supongamos que nosotros aplicamos un XOR entre *I15* y *E7'*, donde E7 sería la incógnita, esto nos daría *\0x01* en caso de que aplicando el relleno falte un BIT para completar el bloque. 
Por lo tanto si aplicamos un XOR entre *I15* y *una variante de E7* que podemos ir Bruteforceando en cuanto a caracteres respecta, ya sabremos que alguno de ellos nos va a dar *\0x01* correspondiente al valor del relleno en caso de que falte 1 Byte. 
Como vimos en el caso anterior, **alterar el orden de los valores simplemente daría el valor faltante**, por lo tanto podríamos hacer ``I15 = \0x01 ^ E7'`` que es la ecuación anterior pero cambiada de lugar.

![[POA 8.png]]

![[POA 7.png]]

**C15** es igual a ``E7 ^ I15``, pero ahora podremos decir que como **I15** es igual a ``\0x01 ^ E7'`` (Que *E7'* es un valor que podemos aplicarle fuerza bruta) podemos decir que ``C15 = E7 ^ I15 = E7 ^ \0x01 ^ E7'``.
Por lo tanto **C15** es igual a un XOR entre tres valores que serían ``E7`` (Que lo tenemos porque es el texto cifrado), ``\0x01`` (Que lo tenemos también porque lo conseguimos de la operatoria *E7' ^ I15*) y el último valor el cual es ``E7'`` el cual podemos aplicar **fuerza bruta** para ver en que momento a la hora de aplicar la limpieza del relleno el servidor detecta que el relleno es correcto, por tanto si llegamos a hallar para que valor de E7 te genera un relleno correcto, tendríamos el valor de C15 y ya tendríamos una porción de el texto cifrado en TEXTO CLARO.

En la practica normalmente usaremos **Padbuster** o el **Bit Flipper Attack** de Burpsuite que lo automatiza todo, pero es importante entender todo lo que está sucediendo por detrás para comprender en profundidad la vulnerabilidad.
# Máquina vulnerable a Padding Oracle Attack con explicación

Para practicar esta vulnerabilidad descargaremos la ISO de un máquina virtual que contiene un entorno vulnerable a **Padding Oracle Attack**. [ISO aquí](https://www.vulnhub.com/entry/pentester-lab-padding-oracle,174/)

Exportaremos la **imagen ISO de la máquina virtual** vulnerable en **VMware**, recordando de cambiar manualmente el adaptador de red a **bridged**. ==Una vez encendida la máquina recomendamos tomar una Snapshot de seguridad==

Encendemos la máquina y listo, la dejamos ahí encendida.

Haremos un ``arp-scan -I ens33 --localnet --ignoredups`` y buscaremos una **dirección MAC** que sea de **VMware** para verificar que la máquina esté activa. Utilizando la IP que se nos brinda de lado izquierdo haremos un ``ping -c 1 192.168.0.164`` para enviarle un paquete a la IP de la máquina víctima, verificando así que esté activa nuevamente, luego procedemos a realizar los **escaneos** correspondientes con ``nmap`` para investigar que **servicios tiene expuestos**.

- ``nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 192.168.0.164``

Como se ve que está el *puerto 80 HTTP* abierto, ingresamos al navegador y **colocamos en la URL la ip de la máquina**, ya que se ve que **posee un servicio web expuesto**.

![[POA 1.png]]

------

Ingresaremos al panel de "*register*" y **nos registraremos** con una cuenta que queramos, en mi caso será ==C4sp:c4sp1234==, automáticamente luego del registro estaremos logueados, por lo tanto si hacemos un ``CTRL+SHIFT+C`` podremos ver la cookie de sesión que se llama "*auth*" y vale una cadena especifica. Ese valor de la cookie **es lo que se divide en bloques** para bloque por bloque ir aplicando el descifrado correspondiente con la key interna que está en el servidor, para llegar a ver mas adelante el texto claro, como ese valor es nuestra cookie de sesión, no sabemos lo que hay ahí en texto claro, por lo tanto con Padbuster intentaremos descifrarlo.

Si la web es vulnerable a un **Padding Oracle Attack**, podremos ver de esa cookie con cadena cifrada el texto descifrado. ``bMXjU0LWdA4yVps%2F8pwxYZj%2FFpf871a8`` ----> Cookie de sesión (Cadena cifrada).

- ``padbuster URL cadena-cifrada BlockSize [options]``

En el apartado de **Blocksize** colocaremos de primeras un "*8*" ya que el tamaño del bloque en el cifrado CBC debe de ser un *múltiplo de 8 Bits*, todo esto debido a las propias restricciones internas de la implementación del cifrado. 
Para que la división en bloque sea segura y eficiente es necesario que el tamaño del bloque sea un múltiplo de 8 BITS, porque esta es la unidad básica de información utilizada por los sistemas de computación.

- ``padbuster http://192.168.0.163/index.php bMXjU0LWdA4yVps%2F8pwxYZj%2FFpf871a8 8 -cookies 'auth=bMXjU0LWdA4yVps%2F8pwxYZj%2FFpf871a8'``

Utilizamos una opción propia de la herramienta la cual es **Cookies** para especificarle el nombre y el valor de la cookie.

![[POA 9.png]]

De esta manera observamos que la cookie descifrada es igual a "*user=C4sp*".

Lo crítico acá es que ahora **sabemos que es lo que detrás se está almacenando en texto claro**, por lo tanto como todo está roto, y la herramienta sabe como es el método de cifrado, si ahora en el **Padbuster** agregamos lo siguiente ``-plaintext 'user=admin'`` podremos crear una nueva cookie de sesión cifrada correspondiente a este usuario ``'user=admin'`` y si el usuario *admin* llegara a estár autenticado, **tendríamos su cookie de sesión**.

- ``padbuster http://192.168.0.163/index.php bMXjU0LWdA4yVps%2F8pwxYZj%2FFpf871a8 8 -cookies 'auth=bMXjU0LWdA4yVps%2F8pwxYZj%2FFpf871a8' -plaintext 'user=admin'``

![[POA 10.png]]

![[POA 11.png]]

De esta forma **tendríamos acceso privilegiado a la web** vulnerable.

----

Otra cosa que se puede hacer además de lo anterior, es con **Burpsuite** realizar un **Bit Flipper**, esto lo que hace es **rotar la posición Bit a Bit** de una cadena especifica, por ejemplo si creamos un usuario '*cdmin*' el Bit Flipper lo que hará será rotar el bit correspondiente a la *b*, luego a la *d*, luego a la *m* y así sucesivamente, hasta encontrar una coincidencia válida.

``bfoTIsY9Zbd2jbqdSYgj5bQL4wz4IaDh`` ----> Cookie del usuario '*cdmin*'

Si con Burpsuite **interceptamos la petición de login** a la cuenta de *bdmin* y enviamos la petición al *Intruder* cuando veamos la Cookie de *cdmin* en Burpsuite, luego marcamos la cookie añadiéndole la marca para sustituir en ese campo, seteando un ataque de tipo **Sniper** y en la pestaña de Payloads colocamos la opción *Payload Type: Bit Flipper* y marcamos la casilla *Literal Value*. ==Quitar URL ENCODE CHARACTERS al final==

![[POA 12.png]]

Luego le daremos a **Start Attack** y esperaremos hasta que encontremos la respuesta correcta que coincida con el usuario **admin**, de esta forma encontraríamos el usuario válido.

la cookie generada por PadBuster puede diferir de la de Burp Suite porque ambas herramientas tienen implementaciones distintas para explotar la misma vulnerabilidad. A pesar de sus diferencias, si ambas son aceptadas por el sistema, demuestra que hay múltiples soluciones válidas para explotar el oráculo de relleno.

--------
