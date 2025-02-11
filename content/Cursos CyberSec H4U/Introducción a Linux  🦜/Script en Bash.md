-------
- Tags: #bash #script
------
# Definición

> **Un script es un archivo que contiene una secuencia de instrucciones o comandos que pueden ser ejecutados de manera secuencial** por un intérprete o un entorno de ejecución específico. Estos scripts **están escritos en un lenguaje de scripting**, que **generalmente es un lenguaje de programación de alto nivel** diseñado para la automatización de tareas y la ejecución de comandos. En este caso usaremos el lenguaje **BASH**.

-------
# Creación de Script en Bash

Normalmente cuando iniciamos un Script debemos crear un archivo con la terminación ``.sh``"
(``sh`` **es un guion de shell**, lo cual es un programa hecho en un lenguaje de shell. Esto determina que es un ejecutable.

Podemos operar en el mediante el uso de herramientas con ``nano`` o ``vim/nvim``

Para ejecutar un script utilizamos **``./Nombre del script``**
## Indicar al OS que utilice el shell especificado para ejecutar los comandos del SCRIPT

Es necesario permitir que el shell interactivo (``zsh`` en nuestro caso) sepa qué tipo de intérprete ejecutar para el programa que contiene. La primera línea le dice a Unix que el archivo será ejecutado por ``/bin/bash``. Esta es la ubicación estándar del ``Shell Bourne`` en casi todos los sistemas Unix. Al agregar ``#!/bin/bash`` como la primera línea de tu script, **le indicas al sistema operativo que invoque el shell especificado** para **ejecutar** los comandos que **siguen en el script**.

Comenzamos el script con un ``**#!/bin/bash**`` (Hash-Bang) --->``#!``
## Control del flujo del programa con CTRL+C

Luego de especificar el shell con el que el script se ejecutará, hacemos dos líneas vacías para separar la siguiente configuración que vamos a colocar en el script, esta será el **control del flujo del programa frente a ``Ctrl+C``**, ya que a veces mientras el script esta operando lleva su tiempo en ejecutarse en su totalidad, nosotros podemos detenerlo antes de que termine, ya sea porque conseguimos lo que queríamos o porque simplemente queremos detenerlo, esto se realizará utilizando ``CTRL+C`` para frenar el flujo.

**``# Ctrl +C``**  ----> Cuando colocamos un ``#`` y luego un texto o información, esta se mantendrá **de manera oculta y no afectara a la ejecución del script**, esto se suele utilizar para poder ponerle **TITULO** o **DESCRIPCIONES** a alguna cadena de comandos siguiente. 

Debajo colocamos **``trap ctrl_c INT``** y dos líneas mas abajo ``exit 1``. 

Por ahora el Script iría tal que así

```bash
!#/bin/bash

\# Ctrl +C
trap ctrl_c INT
```

Lo que hacemos de esta forma es capturar el ``sign it`` asociado al atajo ``ctrl_c`` para redirigir por ejemplo el flujo del programa a ``ctrl_c`` que es una función (Que aun no esta creada). el ``INT`` viene de **INTerruption**.
Entonces estamos indicando que cuando usemos ``ctrl+c`` se interrumpa la acción previa.
## Como definir una función en BASH

Una función es un **conjunto de comandos que se pueden llamar varias veces**. El propósito de una función es ayudarnos a hacer que nuestros scripts de bash sean más legibles, y evitar escribir el mismo código una y otra vez.

Para crear una función utilizamos lo siguiente

```bash
function **ctrl_c** (){
(                                 )  <----------------(Acá iría lo que debería hacer la función **ctrl_c** que marcamos arriba)
}
```

Entonces sabiendo lo anterior para este caso haríamos lo siguiente:

El **``\n``** Significa SALTO DE LINEA.

```bash
function ctrl_c (){
(TAB) echo -e "\n\n[!] Saliendo...\n" 
exit 1
}
```

De esta forma cada vez que escribamos ``ctrl_c`` estaremos indicando que se ejecute la función establecida para ``ctrl_c`` que en este caso es el comando **``echo -e "\n\n[!] Saliendo...\n"``**
El parámetro **``-e``** es para que los caracteres especiales se tomen como tal, y no como si fuesen texto.
Como esto es una salida no exitosa utilizamos **``exit 1``** para que el código de estado sea igual a ``1``, no significa que hubo un error, si no que realizamos un ``STOP`` forzado con el ``ctrl + c``.
==NOTA: La función debe ir siempre antes de cualquier tipo de ejecución que contenga el nombre de dicha función, de lo contrario no va a funcionar==

Entonces el script para la función ``CTRL+C`` ya estaría terminado y quedaría así.

---
```bash
!#/bin/bash

function ctrl_c (){
(TAB) echo -e "\n\n[!] Saliendo...\n" 
exit 1
}

\# Ctrl +C
trap ctrl_c INT
```
---
## Variables

Una variable está formada por un espacio en el sistema de almacenaje y un nombre simbólico que está asociado a dicho espacio. Ese espacio contiene una cantidad de información escrita previamente.

Por ejemplo si yo escribo lo siguiente:

``greenColour="\\e[0;32m\033[1m"``

Cada vez que escriba la palabra ``greenColour`` va a ser lo mismo que si escribiera su variable que es ``\\e[0;32m\\033[1m``  <----- (Es el código del verde)

Esto se utiliza para poder "resumir" de alguna manera datos que tal vez nos llevarían mas tiempo transcribir. De esta forma simplificamos el trabajo
## Definiendo colores para todo el SCRIPT

Cuando realizamos un SCRIPT podemos agregarle color a los diferentes OUTPUTS brindados por los comandos del mismo, esto se suele colocar primero que todo en la parte superior en VARIABLES.

Paleta de colores se encuentra en github.com/s4vitar/rpcenum

```bash
\#Colours
greenColour="\e[0;32m\033[1m"
endColour="\033[0m\e[0m"
redColour="\e[0;31m\033[1m"
blueColour="\e[0;34m\033[1m"
yellowColour="\e[0;33m\033[1m"
purpleColour="\e[0;35m\033[1m"
turquoiseColour="\e[0;36m\033[1m"
grayColour="\e[0;37m\033[1m"
```

Cuando queremos meterle color a algún OUTPUT, por ejemplo al ``[!] Saliendo...`` que escribimos previamente, debemos con un ``$`` seguido entre llaves la variable del color que queramos antes que inicie la escritura, y finalizarlo entre llaves con ``endColour`` para determinar de donde hasta donde colorear.

Si queremos teñir el ``[!] Saliendo...`` de color rojo se escribiría así:

```bash
echo -e "\n\n${redColour}[!] Saliendo...${endColour}\n"
```

Siempre las variables de los colores de entrada y de ``end``, debemos colocarlas con el ``echo -e`` para que nos lo tome como carácter especial y no como una cadena.
## Bucles, Condicionales

#### Bucles

``while``: La sentencia ``while`` se utiliza para ejecutar en bucle un conjunto de instrucciones hasta que se cumpla una condición determinada.

#### Condicionales

``if/else``: Ejecuta una serie de comandos dependiendo si una cierta condición se cumple o no.
``else``: De lo contrario **si no se cumple la condición de ``if``**.
``elif``: Sirve para crear mas de un condicional a la vez. **Se usa entre ``if`` y ``else`` para poder agregar condiciones extra)**
``then``: Acompaña a la condicional ``if``, si se cumple una condición dada, entonces... **Se usa al final de las condiciones**
``fi``: Cierra la condicional ``if``


``for``: Ejecuta una serie de comandos un numero determinado de veces.
Ejemplo: **"``for "Nombre" in $(seq 1 10); do echo $(($RANDOM % 37)); done``"**
Repetirá la secuencia con el secuenciador ``seq`` de nombre "*ejemplo*" del ``1`` a ``10`` veces
La secuencia será enviarnos números ``random`` entre el ``0`` y el ``37``

``do``: sirve para abrir el bucle
``done``: sirve para cerrar el bucle

``case``: Ejecuta una o varias listas de comandos dependiendo del valor de una variable.
``esac``: sirve para cerrar el case.

``select``: Permite seleccionar al usuario una opción de una lista de opciones en un menú.

**``-eq``**: ``is equal to`` // Igual a 
**``-ne``**: ``is not equal to`` // No es igual a 
**``-gt``**: ``is greater than`` // Mayor a 
**``-ge``**: ``is greater than or equal`` // Mayor o igual a
**``-it``**: ``is less than`` // Menor a 
**``-le``**: ``is less than or equal to`` // Menor o igual a
## Definir parámetros (``-h``, ``-m``, ``-a``, etc) con ``GETOPTS``

Para poder definir un parámetro utilizamos la secuencia siguiente

```bash
while getopts "m:t:h" arg; do  
case $arg in                                        
	m) money=$OPTARG;;
	t) technique=$OPTARG;;
	h) helpPanel;;

esac

done
```

Acá lo que estamos haciendo es definir el parámetro para ``-m``, ``-t``, y ``-h``
Los "``:``" que están al final de la "``m``" y de la "``t``" significan que esos parámetros van a requerir de un argumento. 
Ambos parámetros que colocamos dentro de las comillas los vamos a almacenar en la variable **``arg``** para luego asignarles los diferentes casos posibles con **``case``**

- ``./Ruleta.sh -t (Argumento, por ejemplo Martingala)`` ``-t`` en este ejemplo hará referencia a definir con que técnica vamos a ejecutar la ruleta.
## Concepto de Arrays

Un **Array** es una variable que posee mas de un dato en su interior.

Para poder declarar un Array se usa la siguiente sintaxis

``declare -a (NombreQueQueramosPonerle)=(1 2 3 4)`` 

El nombre de nuestra Array será ``myArray``

Para citar todo lo que contiene la Array hacemos ``${myArray[[@]}]``
Para citar la cantidad  de valores que contiene la Array hacemos ``$#{myArray[[@]}]`` Si en el lugar del ``@`` colocamos ``0 1 2 3``, haremos alusión al elemento ``0`` el cual es "``1``" en este ejemplo, al ``1`` el cual es el ``2`` y así sucesivamente.

**Conteo de esta Array: 0 1 2 3**

- ``declare -a myArray=( 1 2 3 4 )``
# Argumentos posicionales en BASH

En Bash se pueden usar argumentos desde la línea de comandos, los cuales son enviados a los scripts como variables. Estos quedarían representados de la siguiente forma:

**``$0``**: Representa el nombre del script que se invocó desde la terminal.

**``$1``**: Es el primer argumento desde la línea de comandos.

**``$2``**: Es el segundo argumento desde la línea de comandos y así sucesivamente.

**``$#``** : Contiene el número de argumentos que son recibidos desde la línea de comandos.

**``$``**: Contiene todos los argumentos que son recibidos desde la línea de comandos, guardados todos en la misma variable.

Una manera de entenderlo es que si nosotros ejecutamos un comando mal, por ejemplo

``whoam`` (Que no existe) Nos aparecerá esto
``zsh: command not found: whoam``
El argumento ``$0`` en este caso seria donde dice "``zhs:``""