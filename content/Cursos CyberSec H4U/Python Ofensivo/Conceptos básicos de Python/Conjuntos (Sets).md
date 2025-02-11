----
- Tags: #conjuntos
------
# Definición

> Los **conjuntos** o **sets** son una **colección de elementos sin orden y sin elementos repetidos**, inspirados en la teoría de conjuntos de las matemáticas. Son ideales para la gestión de colecciones de elementos únicos y operaciones que requieren eliminar duplicados o realizar comparaciones de conjuntos.

**Características de los Conjuntos**

- **Unicidad**: Los conjuntos automáticamente **descartan elementos duplicados**, lo que los hace perfectos para recolectar elementos únicos.
- **Desordenados**: A diferencia de las listas y las tuplas, los conjuntos **no mantienen los elementos en ningún orden específico**.
- **Mutabilidad**: Los elementos de un conjunto pueden ser agregados o eliminados, pero los elementos mismos deben ser inmutables (por ejemplo, no puedes tener un conjunto de listas, ya que las listas se pueden modificar).

**Operaciones con Conjuntos**

Exploraremos las operaciones básicas de conjuntos que Python facilita, como:

- **Adición y Eliminación**: Añadir elementos con ‘**add()**‘ y eliminar elementos con ‘**remove()**‘ o ‘**discard()**‘.
- **Operaciones de Conjuntos**: Realizar uniones, intersecciones, diferencias y diferencias simétricas utilizando métodos o operadores respectivos.
- **Pruebas de Pertenencia**: Comprobar rápidamente si un elemento es miembro de un conjunto.
- **Inmutabilidad Opcional**: Usar el tipo ‘**frozenset**‘ para crear conjuntos que no se pueden modificar después de su creación.

**Uso de Conjuntos en Python**

- **Eliminación de Duplicados**: Son útiles cuando necesitas asegurarte de que una colección no tenga elementos repetidos.
- **Relaciones entre Colecciones**: Facilitan la comprensión y el manejo de relaciones matemáticas entre colecciones, como subconjuntos y superconjuntos.
- **Rendimiento de Búsqueda**: Proporcionan una búsqueda de elementos más rápida que las listas o las tuplas, lo que es útil para grandes volúmenes de datos.
------
## Ejemplos varios de los Conjuntos (Sets)

Todos los ejemplos que se mostrarán pueden ser aplicables con otros tipos de DATOS (STR, INT, BOOL, FLOAT) excepto DATOS MUTABLES como listas o tupas.

Para definir un conjunto simplemente basta con colocar **{...}**
```python
mi_conjunto = {1, 2, 3, 4, 5}

print(mi_conjunto)
print(type(mi_conjunto)) # mi_conjunto es un dato de tipo "set"
```

Para añadir un nuevo elemento utilizamos **mi_conjunto.add()** (Recordemos que estos datos **pueden o no almacenarse de manera desordenada**, por lo tanto **no hay que confiarse de la posición**).
```python
mi_conjunto = {1, 2, 3, 4, 5}
mi_conjunto.add(6)

print(mi_conjunto)
```

Para añadir **NUEVOS** elementos utilizamos **mi_conjunto.update({})**.
```python
mi_conjunto = {1, 2, 3, 4, 5}
mi_conjunto.update({6, 2, 3, 5, 8, 10, 23, 54}) # Recordemos que los conjuntos no pueden tener elementos repetidos por lo tanto los elementos que hayamos colocado en el .update que ya esten en mi_conjunto no apareceran.

print(mi_conjunto) # Esto nos dará por consola: {1, 2, 3, 4, 5, 6, 8, 10, 54, 23}
```

Para eliminar un elemento solo utilizamos **mi_conjunto.remove()** o **mi_conjunto.discard()**
```python
mi_conjunto = {1, 2, 3, 4, 5}
mi_conjunto.remove(3)

print(mi_conjunto)

# A parte de esto, podriamos utilizar .discard(), por ejemplo podriamos indicar que si un numero especifico llegara a ingresar al conjunto, lo elimine automaticamente tal que así:

mi_conjunto.discard(7)  # En este caso el elemento "7" no existe en "mi_conjunto" por lo tanto no sucederá nada, pero si llegara a existir sería eliminado automaticamente.
```
------
Podríamos crear intersecciones con **.intersection** para que cuando tengamos dos conjuntos, **solamente se muestren los elementos que se repitan en ambos conjuntos**.
```python
mi_primer_conjunto = {1, 2, 3, 4, 5}
mi_segundo_conjunto = {4, 5, 6, 7, 8}

conjunto_final = mi_primer_conjunto.intersection(mi_segundo_conjunto)

print(conjunto_final) # En este caso conjunto final sería igual a {4, 5} ya que son los dos elementos que se repiten en ambos conjuntos.
```

Podemos identificar entre dos conjuntos **cuando hay elementos que NO estén en ambos** y que nos los muestre, esto se realiza con **.difference**. Esto vendría a ser la otra cara de la moneda de ".intersection".
```python
facebook_users = {"Rodolfo", "Luz", "Micaela", "Santiago"}
twitter_users = {"Florencia", "Andres", "Rodolfo", "Micaela"}

ambas_plataformas = facebook_users.difference(twitter_users)

print(ambas_plataformas) # Esto nos brindará {'Luz', 'Santiago'} ya que estos dos elementos son los unicos que no se repiten en twitter_users
```
-------
Podríamos también crear un nuevo conjunto **uniendo dos conjuntos especificados** con **.union**, esto automáticamente **eliminará los repetidos**.
```python
mi_primer_conjunto = {1, 2, 3, 4, 5}
mi_segundo_conjunto = {4, 5, 6, 7, 8}

conjunto_final = mi_primer_conjunto.union(mi_segundo_conjunto)

print(conjunto_final) # Esto nos brindaría por consola {1, 2, 3, 4, 5, 6, 7, 8}, eliminando las dos repeticiones que hay que serían (4, 5)
```

Algo que también se puede hacer, es **verificar si un conjunto es un subconjunto de otro conjunto** con **.issubset**, esto se basa en verificar si **TODOS** los elementos de un conjunto, **se encuentran en otro** indiferentemente de su orden.
```python
my_first_conjunto = {1, 2, 3, 5}
my_second_conjunto= {3, 5, 8, 9, 1, 2}

print(my_first_conjunto.issubset(my_second_conjunto)) # Esto nos devolveria un estado booleano, TRUE o FALSE, dependiendo de si my_first_conjunto ES o NO ES un subconjunto de my_second_conjunto.

# En este caso nos daría TRUE porque lo es, ya que en my_second_conjunto están todos los elementos de my_first_conjunto.
# EN EL MOMENTO EN QUE my_first_conjunto POSEA UN ELEMENTO QUE NO POSEE my_secon_conjunto, DEJARÁ DE SER UN SUB CONJUNTO.
```

Si deseamos **crear un LISTA sin repeticiones**, podemos utilizar los conjuntos para hacerlo de una manera rápida con **set()** y luego empleando **list()**
```python
my_list = [1, 3, 5, 7, 9, 2, 1, 32, 8, 23, 2, 3, 5]

no_repeat = list(set(my_list)) # En este caso transformamos a my_list en un conjunto con set() para así eliminar los repetidos (Ya que conjuntos no pueden poseer repetidos), y luego a todo ese conjunto lo transformamos en una list()

print(no_repeat) # Este print nos brindaria el mismo valor de my_list pero sin repeticiones tal que así [32, 1, 2, 3, 5, 7, 8, 9, 23] Recordemos que los conjuntos no tienen orden, por eso esta todo mezclado.
```

En los conjuntos **es mas eficiente realizar búsquedas** ya que son mucho mas rápidas que en las listas o tuplas.
```python
my_conjunto = set(range(10000))

print(8080 in my_conjunto) # En este caso consultamos si el numero "8080" está (in) el conjunto llamado my_conjunto. Esto devuelve un estado booleano, TRUE o FALSE.

# En este caso la consola nos otorgaría un TRUE ya que "8080" existe dentro del rango de my_conjunto.
```