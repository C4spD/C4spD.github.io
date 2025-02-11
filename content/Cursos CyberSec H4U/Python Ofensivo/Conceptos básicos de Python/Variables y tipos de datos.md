-------
- Tags: #variables #datos #listas #float #int #str
-------
# Definición

> En **Python** hay variables y diferentes tipos de datos, los cuales se detallarán a continuación, siempre recalcando que **antes de iniciar cualquier script**, debemos colocar la ruta con el interprete de Python3 "**/usr/bin/env python3**".

-------
# Variables

>Una variable en Python es como un nombre que se le asigna a un dato. No es necesario declarar el tipo de dato, ya que Python es inteligente para inferirlo.

```python
#!/usr/bin/env python3

saludo = "Hola mundo"
numero = 1
numero_float = 1.5
my_list = [1, 2, 3]

print(Saludo)
print(numero)
print(numero_float)
print(my_list)
```

--------- 
# Tipos de datos

Algo a recalcar, es que podemos saber con que tipo de dato estamos tratando al utilizar desde el script la siguiente sintaxis.

```python
#!/usr/bin/env python3

Saludo = "Hola mundo"

print (Saludo)
print (type(Saludo))
```

En este caso, estamos indicándole al programa que se defina una **variable** llamada "**Saludo**" con un contenido de tipo **STRING** "*Hola mundo*", para luego indicarle con un "**print**" que imprima el contenido una vez ejecutado el script junto a el tipo de dato que corresponda con "**(type())**".
### Cadenas (Strings)

>Las cadenas son secuencias de caracteres que se utilizan para manejar texto. Son inmutables, lo que significa que una vez creadas, no puedes cambiar sus **caracteres individuales**.

```python
#!/usr/bin/env python3

Saludo = "Hola mundo"

print (Saludo)
```

==Lo que marca la diferencia entre un dato de tipo STRING a un dato de tipo INT/FLOAT es utilizar o no las comillas dobles o simples.==

-----------
### Números

>Python maneja varios tipos numéricos, pero nos centraremos en los dos siguientes:

>- **Enteros (Integers)**: Números sin parte decimal.
>- **Flotantes (Floats)**: Números que incluyen decimales.

Ejemplo de dato de tipo **INT** o **ENTERO**
```python
#!/usr/bin/env python3

port = 443

print (port)
```

Ejemplo de dato de tipo **FLOAT** o **FLOTANTE**
```python
#!/usr/bin/env python3

port = 44.3

print (port)
```

Para los números FLOAT se puede utilizar un recurso llamado:
**round(result, 2)** para aplicar un **redondeo**, en este caso estamos aplicando un redondeo para que nos **muestre solos dos decimales**.

==Lo que marca la diferencia entre un dato de tipo STRING a un dato de tipo INT/FLOAT es utilizar o no las comillas dobles o simples.==

------------
### Listas

>Las listas son colecciones ordenadas y mutables que **pueden contener datos de diferentes tipos**. Son ideales para **almacenar** y **acceder** a secuencias de datos.
>Y para trabajar con estas listas, así como con cadenas y rangos de números, utilizaremos los bucles ‘**for**‘, que nos permiten iterar sobre cada elemento de una secuencia de manera eficiente.

-------
Para poder definir una **Variable** como una **Lista**, debemos hacer uso de los **corchetes [ ]** luego de definir el nombre de nuestra variable.

```python
#!/usr/bin/env python3

my_ports = []
```

-----------

#### Formas de añadir datos a una lista

Una vez creada nuestra lista tenemos que saber que **hay muchas formas de poder añadirle datos a esta**, a continuación citaremos unos ejemplos.

--------
En este caso añadimos a nuestra lista llamada "**my_ports**" tres puertos diferentes (**22**, **80**, **443**), para luego mostrar todo el contenido dentro de ella con el comando "**print**".
```python
#!/usr/bin/env python3

my_ports = []
my_ports.append(22)
my_ports.append(80)
my_ports.append(443)

print(my_ports)
```
--------

Si deseamos agregar mas de un dato a la vez, el comando "**.append**" ya no funcionará, ya que solo contempla un dato a la vez, para añadir mas de uno utilizaremos "**.extend**" separando con "," cada dato y encerrándolos entre "**corchetes []**".
```python
#!/usr/bin/env python3

my_ports = []
my_ports.extend([444,445,446])

print(my_ports)
```
---------
Una forma **mas rápida** si ya tenemos contemplados los datos es la siguiente.
```python
#!/usr/bin/env python3

my_ports = [22, 80, 443, 8080]
```
--------
Otra forma sería agregando un "**+=**" luego de nombra el nombre de la lista a la que queramos agregarle mas datos.
```python
#!/usr/bin/env python3

my_ports = [22, 80, 443, 8080]
my_ports += ([443,444,445])
```

---------
#### Formas de eliminar datos de una lista

No solo podemos agregar datos como lo vimos en los casos anteriores, también **podemos eliminarlos**
```python
#!/usr/bin/env python3

my_ports = [22, 80, 443, 8080]

del my_ports[0]
```
En este caso **eliminamos** el dato ubicado en el índice numero "**0**" correspondiente al puerto "**22**".
==Nunca olvidarse que la eliminación de elementos no opera en repeticiones, ya que cada elemento es único en este caso y en el ejemplo anterior especificamos el índice "0".==

-------
También podemos utilizar la sintaxis **my_ports.pop()** para **eliminar el ultimo elemento** de la lista.
```python
#!/usr/bin/env python3

my_ports = [22, 80, 443, 8080]
my_ports.pop()
```

----------
#### Formas de listar datos de una lista

Algo que debemos tener muy en cuenta a la hora de **querer listar un dato especifico de nuestra lista**, es que el ordenamiento **comienza** desde el numero **cero (0)** ==EJ: (0,1,2,3,4)== y que se puede hacer con la siguiente sintaxis.
```python
#!/usr/bin/env python3

my_ports = []
my_ports.append(22)
my_ports.append(80)
my_ports.append(443)

print(my_ports[0])
```
En este caso estamos listando un contenido especifico de nuestra lista ubicado en la posición numero "**0**" correspondiente al **puerto número "22"**. 

-----------
Esta es la **forma mas rápida de listar los elementos de una lista** utilizando un bucle **for** de la siguiente manera.
```python
#!/usr/bin/env python3
my_ports = []
my_ports.append(22)
my_ports.append(80)
my_ports.append(443)

for port in my_ports:
	print(port)

```

Si quisiéramos **agregarle una cadena de texto adelante de cada puerto** primero deberíamos hacer una sumatoria y luego un **Type Casting** para que interprete todo como un mismo dato. 
```python
#!/usr/bin/env python3

my_ports = []
my_ports.append(22)
my_ports.append(80)
my_ports.append(443)

for port in my_ports:
    print("Puerto numero: " + str(port))
```

Otra forma sería **formateando(f)** la cadena completa y especificando con **llaves {}** donde queramos que nos interprete e imprima el contenido de la variable, quedando tal que así.
```python
#!/usr/bin/env python3

my_ports = []
my_ports.append(22)
my_ports.append(80)
my_ports.append(443)

for port in my_ports:
    print(f"Puerto numero: {port}")
```
------
##### Formas avanzadas de listar datos en las listas

Hay formas mas avanzadas para listar los datos en cuanto a listas nos referimos, para los siguientes ejemplos **utilizaremos la consola interactiva** de **Python3** pero se puede usar de igual forma en un archivo **.py**.
Vamos a jugar sobre una lista llamada "**my_list**".

my_list = [1, 2, 3, 4, 5]

A continuación se van a detallar ejemplos de sintaxis breves que ayudan al listado rápido del contenido que interese en base a **rangos** que especifiquemos.

- **my_list[:2]** - Indica que queremos que nos muestre los **desde el segundo elemento hacia atrás**.
- **my_list[2:]** - indica que queremos que nos muestre **desde el segundo elemento en adelante**.
- **my_list[0:3]** - indica que queremos que nos muestre **desde el primer elemento hasta el tercer elemento**. ==Cabe aclarar que el ultimo elemento no se contempla dentro del rango, por ende no nos lo va a mostrar, siempre se resta uno.==
- **my_list[-1]** - indica que queremos que nos muestre **contando de atrás hacia adelante el primer elemento**. ==Cabe aclarar que no existe el índice cero cuando se ubica de atrás hacia adelante.==
- **my_list[-2:]** - indica que queremos que nos muestre **desde el elemento -2 hacia adelante**.
- **my_list[:-2]** - indica que queremos que nos muestre **desde el elemento -2 hacia atrás**.

#### Formas de interactuar con una lista (Ordenado)

Hay variedad de formas para **interactuar con nuestra lista**, a continuación se detallarán algunos métodos. En este caso seguiremos trabajando con el **interprete de Python3** pero como recalcamos en el ítem anterior, **se puede hacer desde el script mismo**.

my_list= [1, 2, 3, 4, 5]

- **my_list.append(E)** - con esta sintaxis podremos **añadir un nuevo elemento únicamente** a nuestra lista colocándolo **entre "()"**.
- **my_ports.extend(E, E ,E)** - con esta sintaxis podremos **añadir múltiples elementos** a nuestra lista colocándolo **entre "()" separados por ","**
- **my_list.remove()** - con esta sintaxis podremos **eliminar un elemento especifico** proporcionando su nombre/valor.
- **my_list.pop()** - con esta sintaxis podremos **eliminar el ultimo elemento** de nuestra lista.
- **my_list.clear** - con esta sintaxis podremos **limpiar completamente una lista dejándola vacía**.
- **my_list.index(E)** - con esta sintaxis podremos solicitar que **se nos indique el índice** para un elemento dado **entre "()"**. ==Siempre listara la primer aparición del elemento indicado (En caso de haber repetidos)==
- **my_list.count(E)** - con esta sintaxis podremos solicitar que se nos **indique cuantos elementos hay repetidos con ese mismo valor** en la lista.
- **my_list.upper/lower** - con esta sintaxis podremos modificar la lista para que su contenido TOTAL se coloque en mayúsculas(**upper**) o minúsculas(**lower**).
- **my_list.insert(i, e)** - con esta sintaxis podremos indicarle que queremos **insertar** a nuestra lista en el **INDICE (i)** indicado, el **ELEMENTO (e)** que queramos, por ejemplo **my_list.insert(2, "Hola")** ==No importa el tipo de dato==, en este caso **añadimos** el elemento **"Hola"** de tipo STR en el **índice "2"**, desplazando una posición a la derecha el antiguo elemento.
-------
- **len(my_list)** - con esta sintaxis podremos ver **cuantos elementos tiene en total nuestra lista**.
- **sorted(my_list)** - con esta sintaxis podremos **ordenar los datos de tipo numéricos** de nuestra lista.
- **set(my_list)** -  con esta sintaxis podremos **eliminar los elementos repetidos** de nuestra lista.
- **max(my_list)** - con esta sintaxis podremos indicar que solo **queremos ver el elemento mas alto**.
- **min(my_list)** - con esta sintaxis podremos indicar que solo **queremos ver el elemento mas bajo**.
- **sum(my_list)** - con esta sintaxis podremos realizar **una suma entre todos los elementos**.
-------
- **enumerate(my_list)** - con esta sintaxis recibiremos un valor de un **OBJETO**, este objeto dentro posee **dos respuestas**, la **primera será el índice** y la **segunda será el elemento de ese índice**. Para poder iterar en cada uno de nuestros elementos de nuestra lista con esta sintaxis, debemos utilizar un **bucle for** de la siguiente forma.

```python
for i, e in enumerate(my_list):
	print(i, e)
```
En este caso estamos **guardando** la **primer respuesta en la variable "i"** y la **segunda respuesta en la variable "e"** ("**i**" corresponde al **índice**, y "**e**" corresponde al **elemento** de ese índice) para luego **mostrar todos los índices (i)** y **todos los elementos (e)**

Si ahora solo **queremos que nos liste los índices que poseen elementos repetidos** para **un elemento dado** podríamos hacer lo siguiente
```python
my_list = [1, 2, 3, 4, 5, 12, 6, 12, 7, 12]
repetidos = [i for i, e in enumerate(my_list) if e == 12]
```
En este caso indicamos con una "**i**" adelante del **for** para indicar que directamente **nos muestre el valor de "i" únicamente**.
En este caso creamos una nueva variable llamada "**repetidos**", en el valor de esta colocamos una **condición** tal que **si el elemento (e) es igual a 12**, entonces nos **muestre el índice de ese elemento** otorgado por la sintaxis **enumerate()**.

--------
# Type Casting (Cambio de tipo de dato)

> El **Type Casting** es un método que se utiliza dentro de un script o programa para **poder alterar el tipo de dato** de una variable independientemente de cual sea.

En el siguiente ejemplo convertimos un dato de tipo **INT** por naturaleza, a un dato de tipo **STRING** de manera forzada.
```python
#!/usr/bin/env python3

port = str(44)

print (port)
print (type(port))
```

==Esto mismo se puede aplicar utilizando INT, FLOAT, STR, etc.==