-----
- Tags: #Diccionario 
------
# Definición

> Los **Diccionarios** como tal son una estructura de datos que almacenan pares de **clave, valor**, estos diccionarios al igual que los **Conjuntos (Sets)** no son enumerables, es decir que no poseerán índices, y también estos pueden ser **mutables/modificables**.

**Características de los Diccionarios**

- **Desordenados**: Los elementos en un diccionario no están ordenados y no se accede a ellos mediante un índice numérico, sino a través de claves únicas.
- **Dinámicos**: Se pueden agregar, modificar y eliminar pares clave-valor.
- **Claves Únicas**: Cada clave en un diccionario es única, lo que previene duplicaciones y sobreescrituras accidentales.
- **Valores Accesibles**: Los valores no necesitan ser únicos y pueden ser de cualquier tipo de dato.

**Operaciones con Diccionarios**

- **Agregar y Modificar**: Cómo agregar nuevos pares clave-valor y modificar valores existentes.
- **Eliminar**: Cómo eliminar pares clave-valor usando del o el método ‘**pop()**‘.
- **Métodos de Diccionario**: Utilizar métodos como ‘**keys()**‘, ‘**values()**‘, y ‘**items()**‘ para acceder a las claves, valores o ambos en forma de pares.
- **Comprensiones de Diccionarios**: Una forma elegante y concisa de construir diccionarios basados en secuencias o rangos.

**Uso de Diccionarios en Python**

- **Almacenamiento de Datos Estructurados**: Ideales para almacenar y organizar datos que están relacionados de manera lógica, como una base de datos en memoria.
- **Búsqueda Eficiente**: Los diccionarios son altamente optimizados para recuperar valores cuando se conoce la clave, proporcionando tiempos de búsqueda muy rápidos.
- **Flexibilidad**: Pueden ser anidados, lo que significa que los valores dentro de un diccionario pueden ser otros diccionarios, listas o cualquier otro tipo de dato.
------
## Ejemplos de diccionarios

Para poder **definir un diccionario** lo haremos **igual que con los conjuntos**, con las llaves **{}**, pero esta vez deberemos colocar el par de **{"clave": "valor"}**
```python
mi_diccionario = {"nombre": "C4sp", "edad": 23, "ciudad": "Bahia Blanca"} # En este caso tenemos un diccionario con un total de 3 elementos separados por comas.

print(mi_diccionario["nombre"]) # Podemos llamar a la clave de nuestro diccionario para que nos muestre el valor de esta.

# Esto en consola mostraría "C4sp"
```

Podemos **modificar el valor de alguna clave** que queramos, recordemos que los diccionarios son **mutables**.
```python
mi_diccionario = {"nombre": "C4sp", "edad": 23, "ciudad": "Bahia Blanca"}

mi_diccionario["nombre"] =  "Santiago"

print(mi_diccionario["nombre"])

# Esto nos mostrará en consola el nuevo valor de la clave nombre que hemos definido: "Santiago"
```

Se pueden añadir nuevos elementos {**"clave": "valor"**} de la **misma forma que modificamos** el valor de una clave existente en el **ejemplo anterior**.
```python
mi_diccionario = {"nombre": "C4sp", "edad": 23, "ciudad": "Bahia Blanca"}

mi_diccionario["profesion"] =  "Pentester" # En este caso colocamos un par de clave, valor que no existe, por lo tanto lo estaremos creando

print(mi_diccionario) # Este print mostrará todo el contenido de mi_diccionario incluyendo el par de clave, valor "profesion" que agregamos recién.
```

Para **eliminar elementos de un diccionario** utilizamos **del**, esto eliminara la clave y el valor.
```python
mi_diccionario = {"nombre": "C4sp", "edad": 23, "ciudad": "Bahia Blanca"}

del mi_diccionario["edad"] # En este caso estariamos eliminando el par de clave, valor de "edad", por lo tanto cuando ejecutemos el print, nos mostrará todo el diccionario, pero sin "edad".

print(mi_diccionario)
```

Podemos realizar **búsquedas** o **verificaciones** sobre algún elemento que queramos ver **si está o no en el diccionario especificado** con un **condicional**.
```python
mi_diccionario = {"nombre": "C4sp", "edad": 23, "ciudad": "Bahia Blanca"}

if "edad" in mi_diccionario:
    print("El elemento existe en el diccionario")
else:
    print("El elemento NO EXISTE en el diccionario")
```

Para **iterar sobre un diccionario** podremos hacerlo con un **bucle for** debemos recordar que al tratarse de dos pares de clave, valor, **debemos especificarle dos variables al bucle** y además utilizar **.items()**
```python
mi_diccionario = {"nombre": "C4sp", "edad": 23, "ciudad": "Bahia Blanca"}

for key, value in mi_diccionario.items():
    print(f"La clave {key} corresponde al valor {value}")

# De esta forma el print nos mostrará lo siguiente por consola:
La clave nombre corresponde al valor C4sp
La clave edad corresponde al valor 23
La clave ciudad corresponde al valor Bahia Blanca
```

Otra **forma de iterar** para conseguir **SOLO LA CLAVE** o para conseguir **SOLO EL VALOR DE UNA CLAVE** sería utilizando **mi_diccionario.keys()** o **mi_diccionario.values()**
```python
mi_diccionario = {"nombre": "C4sp", "edad": "23", "ciudad": "Bahia Blanca"}

for elements in mi_diccionario.keys(): # ESTE CASO SERÍA PARA MOSTRAR SOLO LA CLAVE. # <---------- Esto tambíen es lo mismo que poner mi_diccionario: simplemente.
    print(elements)
    
for elements in mi_diccionario.values(): # ESTE CASO SERÍA PARA MOSTRAR SOLO EL VALOR DE LA CLAVE.
    print(elements)

```

Para poder **eliminar o limpiar** todo **el contenido de un diccionario** utilizamos **.clear**
```python
mi_diccionario = {"nombre": "C4sp", "edad": 23, "ciudad": "Bahia Blanca"}

mi_diccionario.clear()

print(mi_diccionario) # Esto por consola nos mostrará el diccionario vacío asi "{}"
```

Podemos también **crear diccionarios de comprensión** es decir, diccionarios en los que se **ejecuta una operatoria** para poder **definir los valores** del mismo.
```python
cuadrado = {x: x ** 2 for x in range(6)} # En este caso definimos la clave como "x" y el valor como toda la operatoria "x ** 2 for x in range(6)", por lo tanto por cada vuelta la clave "x" va incrementar su valor en 1 hasta llegar a 5 que es lo que especificamos con range().

print(cuadrado) # El print nos mostrará lo siguiente: "{0: 0, 1: 1, 2: 4, 3: 9, 4: 16, 5: 25}"
```

Luego para que se nos muestre todas las claves **my_dictionary.keys()** o todos los valores **my_dictionary.values** podemos hacer lo siguiente.
```python
cuadrado = {x: x ** 2 for x in range(6)}

print(cuadrado.keys())
print(cuadrado.values())

# El resultado por CONSOLA ----- sería
dict_keys([0, 1, 2, 3, 4, 5])
dict_values([0, 1, 4, 9, 16, 25])
```

También podemos utilizar **mi_diccionario.get()** para que en caso de **no encontrar la clave** que estamos especificando, nos indique algo.
```python
mi_diccionario = {"nombre": "C4sp", "edad": 23, "ciudad": "Bahia Blanca"}

print(mi_diccionario.get("nombreeee", "No se encontró la clave especificada")) # En este caso si la clave "nombreeee" existe, nos mostrará su contenido, de lo contrario nos mostrará "No se encontró la clave especificada"
```

Podemos **ampliar un diccionario** con **mi_diccionario.update(mi_diccionario2)** juntando **dos diccionarios diferentes**.
```python
mi_diccionario = {"nombre": "C4sp", "edad": 23, "ciudad": "Bahia Blanca"}
mi_diccionario2 = {"profesion": "Pentester", "hermanas": 3, "altura": 1.85}

mi_diccionario.update(mi_diccionario2)

print(mi_diccionario) # Este print nos mostrará ambos diccionarios juntos, ya que hemos actualizado el valor de mi_diccionario

# ----------- CONSOLA
{'nombre': 'C4sp', 'edad': 23, 'ciudad': 'Bahia Blanca', 'profesion': 'Pentester', 'hermanas': 3, 'altura': 1.85}
```

También podemos crear **Diccionarios Anidados** al igual que los Bucles Anidados o los Condicionales Anidados, esto significa que **hay un Diccionario dentro de otro**.
```python
my_dict = {
    "nombre": "C4sp",
    "edad": 23,
    "hobbies": {"hobbie1": "Entrenar", "hobbie2": "Estudiar", "hobbie3": "Jugar"} # Este sería el diccionario anidado
}

print(my_dict["hobbies"]["hobbie3"]) # Aqui especificamos que queremos un print del diccionario "my_dict", que nos muestre el valor de "hobbies" y que dentro de ese valor nos muestre "hobbie3"

# ------------ CONSOLA (Esto nos mostraria el PRINT)
Jugar
```