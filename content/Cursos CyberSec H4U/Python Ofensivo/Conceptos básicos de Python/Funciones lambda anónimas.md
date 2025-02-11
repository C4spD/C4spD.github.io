--------
- Tags: #funciones #lambda #anonimas
--------
# Definición

> Las **funciones lambda** son también conocidas como **funciones anónimas** debido a que **no se les asigna un nombre explícito al definirlas**. Se utilizan para **crear pequeñas funciones** en el lugar donde se necesitan, generalmente para una **operación específica y breve**. Esto las hace ideal para su uso en operaciones que requieren una función por un breve momento y para casos donde **la definición de una función tradicional completa sería excesivamente verbosa**.
> En Python, una función **lambda** se define con la palabra clave ==lambda==, seguida de **una lista de argumentos**, **dos puntos** y la expresión que desea evaluar y devolver. El argumento se debe colocar luego de la palabra lambda, tal que ==lambda x:==

**Usos comunes de las Funciones Lambda**

- Con funciones de orden superior: Como aquellas que requieren otra función como argumento, por ejemplo, ‘**map()**‘, ‘**filter()**‘ y ‘**sorted()**‘.
- Operaciones simples: Para realizar **cálculos o acciones rápidas** donde una función completa sería innecesariamente larga.
- Funcionalidad en línea: Cuando se necesita una funcionalidad simple **sin la necesidad de reutilizarla en otro lugar del código**.
-----

## Ejemplos de funciones Lambda Anónimas

**Función Lamda Anónima** sin argumentos
```python
my_function = lambda: "¡Hola mundo!" # Aqui definimos la funcion LAMBDA llamada "my_function", esta vez sin argumentos

print(my_function()) # Llamamos a la Función Lambda para que nos muestre el contenido que posee.
```

**Función Lamda Anónima** **con argumentos**
```python
cuadrado = lambda x: x**2 
# Aquí definimos la funcion LAMBDA llamada "cuadrado" con un argumento "x"(variable). A este argumento se le debe otorgar un valor cuando se realice la llamada a la función en si.
# En este caso estamos diciendole que a nuestro argumento "x"(variable) sea elevado a 2.

print(cuadrado(6)) # En este caso printeamos la función LAMBDA indicandole que queremos que nuestro argumento "x"(variable) valga "6"

# ------ CONSOLA
36 # Ya que 6 al cuadrado es = 36
```

Otro ejemplo utilizando **mas de un argumento** seria
```python
suma = lambda x, y: x+y

print(suma(4, 8))
```

Otro ejemplo buscando elevar los elementos de una lista al cuadrado para poder crear una nueva lista con los resultados utilizando "**map**". 
```python
numeros = [1, 2, 3, 4, 5]

cuadrados = list(map(lambda x: x ** 2, numeros)) 
# Recordemos que en este caso utilizamos "map"(que nos da un objeto) que es una función de python que siempre te pide dos argumentos, el primer argumento en este caso es la función lambda que estamos definiendo, y el segundo argumento es un iterable, en este caso le pasamos una lista. A todo eso lo rodeamos con un "list" para convertirlo a una lista, ya que de lo contrario la consola nos dará un error ya que tomará todo el resultado como un objeto.

print(cuadrados)
```

Si quisiéramos crear una función lambda anónima para que **solo nos devuelva los elementos de una lista que contengan números pares** haríamos lo siguiente utilizando "**filter**".
```python
numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

numeros_pares = list(filter(lambda x: x % 2 == 0, numeros)) 
# En este caso al igual que "map", la función predefinida por python "filter" nos pides dos argumentos como en el caso anterior. Nosotros le damos la funcion lambda como primer argumento, y el iterable que sería la lista "numeros". A todo eso lo rodeamos con un "list" para convertirlo a una lista, ya que de lo contrario la consola nos dará un error ya que tomará todo el resultado como un objeto.

# "filter" es un poco distinto a "map" porque en base a la condicion que este definida en la función, en funcion de si devuelve un true o un false te devuelve ese numero.

print(numeros_pares)
```