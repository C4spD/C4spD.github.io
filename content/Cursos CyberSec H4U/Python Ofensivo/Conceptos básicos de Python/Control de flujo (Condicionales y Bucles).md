------
- Tags: #bucles #condicionales #for #while #do 
-----
# Definiciones

> Los **condicionales** son estructuras de control que permiten ejecutar diferentes bloques de código **dependiendo de si una o más condiciones son verdaderas o falsas**. En Python, las declaraciones condicionales más comunes son ‘**if**‘, ‘**elif**‘ y ‘**else**‘.

- **if**: Evalúa si una condición es verdadera y, de ser así, ejecuta un bloque de código. ==(Si...)==
- **elif**: Abreviatura de “**else if**“, se utiliza para verificar múltiples expresiones sólo si las anteriores no son verdaderas. ==(De lo contrario si...)==
- **else**: Captura cualquier caso que no haya sido capturado por las declaraciones ‘**if**‘ y ‘**elif**‘ anteriores. ==(De lo contrario...)==

> Los **bucles** permiten ejecutar un bloque de código repetidamente mientras una condición sea verdadera o para cada elemento en una secuencia. Los dos tipos principales de bucles que utilizamos en Python son ‘**for**‘ y ‘**while**‘.
-----
# Bucles

### For 

> Se usa para **iterar sobre una secuencia** (como una lista, un diccionario, una tupla o un conjunto) y **ejecutar** un bloque de código **para cada elemento de la secuencia**.

```python
nombres = [ "Marcelo", "Santiago", "Rodolfo", "Micaela", "Luz" ]

for nombre in nombres:
    print(f"\n [+] El jugador {nombre} ya se encuentra preparado para jugar.\n")

# Estamos creando una variable nueva en el mismo bucle llamada "nombre" que va a servir para iterar sobre cada objeto de la variable "nombres", pero se puede llamar de la forma que queramos.
# Indicamos que para cada "nombre" de la variable "nombres" nos reproduzca la cadena de texto colocada.
```
--------
### While

> Ejecuta un bloque de código **repetidamente mientras una condición específica se mantiene verdadera**.

```python
i = 1

while i <= 5:
    print(i)
    i+=1

# Estamos indicandole que mientras la variable "i" sea menor o igual a 5, con cada repetición del bucle me reproduzca el valor de "i", pero por cada vuelta "i" va a valer 1+
# Por ende me reproducirá hasta que "i = 5", pasando por los valores 1, 2, 3, 4, 5.
```
--------
## Declaraciones de control de flujo en un bucle

 Existen declaraciones de **control de flujo** que pueden modificar el comportamiento de los [bucles], como ‘**break**‘, ‘**continue**‘ y ‘**pass**‘.
 
- **break**: Termina el bucle y pasa el control a la siguiente declaración fuera del bucle.
- **continue**: Omite el resto del código dentro del bucle y continúa con la siguiente iteración.
- **pass**: No hace nada, se utiliza como una declaración de relleno donde el código eventualmente irá, pero no ha sido escrito todavía.

Comenzaremos con un ejemplo de **BREAK**
```python
for i in range(10):
    if i == 5:
        break
    print(i)

print("El bucle ha concluido al llegar a 5")

# En este caso lo que hacemos es utilizar la funcion "range" para que haga un rango de 0 al 9 (Recordemos que siempre es -1), y a su vez colocamos un condicional que indique que si "i" en algun momento vale 5, hago un break (Termine el bucle y pase a la siguiente declaración fuera del bucle). 
```

Ejemplo de **CONTINUE**
```python
for i in range(10):
    if i == 5:
        print("El bucle ha llegado a 5, continuando con las demas iteraciónes")
        continue
    print(i)

# En este caso al igual que el anterior definimos un rango de 0 al 9. Cuando la variable "i" sea igual a 5 va a enviar una cadena de texto en vez de mostrar el resultado  y luego "continue" con la siguiente iteración.
# Si no colocamos una cadena de texto, el bucle lo que hará será saltear ese resultado e ira a la siguiente iteración
```
## Bucles anidados

> Un **bucle anidado** hace alusión a un bucle **que se encuentra dentro de otro bucle**.

```python
# Para este ejemplo utilizaremos tres listas dentro de una lista.
my_list = [ [1, 4, 5], [2, 6, 8], [9, 4, 1] ]

for element in my_list:
    print(f"\n[+] Vamos a desglosar la lista {element}\n")
    for element_in_list in element:
        print(element_in_list)

# En este caso estamos indicandole con un bucle for que itere para cada "element" de "my_list" con un print que colocara una cadena de texto, pero hay que entender que este bucle por si solo, solamente interpretará que hay 3 elementos.
# Para que interprete que queremos iterar sobre cada elemento dentro de los elementos de my_list, agregamos un for más dentro del for anterior, indicandole que para cada "element_in_list" en la iteración anterior "element", nos reproduzca "element_in_list".
# De esta forma nos reproduciría lo siguiente.

[+] Vamos a desglosar la lista [1, 4, 5]

1
4
5

[+] Vamos a desglosar la lista [2, 6, 8]

2
6
8

[+] Vamos a desglosar la lista [9, 4, 1]

9
4
1
```

## Lista de compresión

En este caso utilizaremos un bucle **for** para el ejemplo.

```python
my_list = [1, 3, 5, 7, 9]
cuadrado = [ i ** 2 for i in my_list ]

print(cuadrado)


# En este caso lo que hacemos es definir que la variable "cuadrado" es igual a la iteración de la variable "my_list" pero al cuadrado, por ende esto nos dará una nueva lista tal que así [1, 9, 25, 49, 81].
# En el bucle lo que hacemos es que cada elemento de la variable "my_list" lo almacenamos momentaneamente en una variable "i" para luego esa variable "i" elevarla al cuadrado.
```
# Condicionales

A continuación citamos un ejemplo con el uso de los tres distintos condicionales.
```python
edad = 12

if edad < 13:
    print("Eres un crio")
elif 13 <= edad < 18:
    print("Eres un adolescente")
else:
    print("Eres un adulto")

# En este caso indicamos los tres condicionales. Si la edad es menor a 13 entonces somos unos crios, de lo contrario si la edad es mayor o igual que 13 y menor que 18 somos adolescentes, en caso contrario que ninguna de las dos se cumpla somos adultos.
```

También podemos **determinar si un elemento existe dentro de una lista** o no de la siguiente manera.
```python
my_list = [ 12, 42, 62, 23, 43, 28, 39, 48 ]

if 28 in my_list:
    print("El elemento está en la lista")
else:
    print("El elemento NO está en la lista")
```

Otro ejemplo para determinar si un numero es **par** o **impar**
```python
numbers = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]

for number in numbers:
    if number % 2 == 0:
        print(f"\n[+] El numero {number} es PAR\n")
    else:
        print(f"\n[+] El numero {number} es IMPAR\n")

# Otro ejemplo clásico es el del condicional que determina si un numero es par o impar.
# Creamos una variable en el bucle for llamada "number" y le metimos todos los elementos de lista "numbers" en ella.
# Iteramos por cada numero de la lista dividiendo con (%) para conseguir su resto.
# Si el number entre 2 es igual a "0" el numero es par, de lo contrario es impar.
```
## Condicionales anidados

Al igual que los Bucles Anidados, los **Condicionales Anidados** son aquellos condicionales **dentro de otros condicionales**.
```python
edad = 18
nacionalidad = "Argentina"

## Condicional Anidado
if edad >= 18:
    if nacionalidad == "Argentina":
        print("Puedes votar en las elecciones Argentinas")
    else:
        print("No puedes votar en las elecciones porque no eres Argentino")
else:
    print("No puedes votar porque eres menor de edad")
```
# Operadores Lógicos

> Existen tres tipos de Operadores Lógicos **and**, **or**, **not**. 

En el siguiente caso utilizaremos el operador lógico **and**
```python
edad = 18
nacionalidad = "Argentina"

if edad >= 18 and nacionalidad == "Argentina":
    print("Puedes votar en las elecciones presidenciales Argentinas")
else:
    print("No puedes votar")

# En este caso indicamos que si la edad es mayor o igual a 18 AND la nacionaldad es Argentina, vamos a poder votar en las elecciones argentinas, en el caso contrario de que no se cumpla alguna de estas dos condiciones, no podremos votar.
```

En el siguiente caso utilizaremos el operador lógico **or**
```python
edad = 20
nacionalidad = "Mexicano"

if edad < 18 or nacionalidad != "Argentina":
    print("No puedes votar en las elecciones presidenciales Argentinas")
else:
    print("Puedes votar")

# En este caso indicamos que si la edad es menor a 18 or nacionalidad NO (!=) es Argentina, no podremos votar en Argentina, de lo contrario podriamos votar (Si fueramos mayores o si fueramos argentinos).
# En este caso no podriamos votar porque por mas que seamos mayores de 18 años, somos mexicanos, por lo tanto no somos Argentinos.
```
# Operadores Ternarios

Un **operador ternario** lo que nos permite es que en una misma linea podremos entablar una igualdad para en **base a la condición que se cumpla nos reporte una cosa o otra**. Esto sería algo así como un **ONELINER**.

```python
edad = 17
mensaje = "Eres mayor de edad" if edad >= 18 else "Eres menor de edad"

print(mensaje)

# En este caso printearia el mensaje de "Eres menor de edad" ya que tenemos 17, pero si tuvieramos mas el condicional printeria "Eres mayor de edad".
```