----------
- Tags: #variables #funciones #ambitodevariables
---------
# Definición

> Las **funciones** son bloques de código **reutilizables** diseñados para realizar una tarea específica. En Python, se definen usando la palabra clave ==def== seguida de un **nombre descriptivo**, **paréntesis** que pueden contener parámetros y **dos puntos**.   Los **parámetros** son “variables de entrada” que **pueden cambiar cada vez que se llama a la función**. Esto permite a las funciones **operar con diferentes datos** y producir resultados correspondientes.
> Las funciones pueden **devolver valores al programa principal o a otras funciones** mediante la palabra clave ==return==. Esto las hace increíblemente versátiles, ya que pueden **procesar datos** y luego **pasar esos datos modificados a otras partes del programa**.

> El **ámbito de una variable** se refiere a **la región de un programa** donde esa variable es **accesible**. En Python, hay dos tipos principales de ámbitos:

- **Local**: Las variables **definidas dentro de una función** tienen un **ámbito local**, lo que significa que **solo pueden ser accesadas y modificadas dentro de la función donde fueron creadas**.
- **Global**: Las variables **definidas fuera de todas las funciones** tienen un **ámbito global**, lo que significa que **pueden ser accesadas desde cualquier parte del programa**. Sin embargo, para modificar una variable global dentro de una función, **se debe declarar como** ==global==.
------

# Ejemplos de Funciones y Ámbito de las variables

## Funciones

A continuación citaremos ejemplos de una **definición básica** de una **función**.
```python
# Primero se define la función con su nombre, luego se define el actuar de la misma una vez es llamada en alguna parte del programa, en este caso, la función al ser llamada realizara un print.
def my_function():
	print("Has llamado a la función correctamente")

# Luego para poder llamar a la función previamente creada en cualquier parte de nuestro código solo basta con escribir su nombre seguido de parentesis como se hace a continuación.
my_function()

# En nuestra consola, una vez ejecutado nuestro script este nos devolvera un mensaje "Has llamada a la función correctamente"
```

A continuación citaremos un ejemplo de un **parámetro** como **variable de entrada**.
```python
# Se define la función y luego dentro de los parentesis se define el parametro como variable de entrada (Es una variable que solo existe en la función), en este caso "suma" es la variable de entrada.
def my_function(suma):
	print(f"El resultado de la operatoria es {suma}")

# Una vez se llame a la función podemos meterle información a la variable de entrada para que se interprete de la manera que queramos de la siguiente forma.
my_function(8 + 2)
my_function(32 * 5)
my_function("pepe")

# Las tres llamadas a la función my_function que se hicieron recien, nos devolveran tres outputs tal que así
El resultado de la suma es 10
El resultado de la suma es 160
El resultado de la suma es pepe
```

Aquí hay otro ejemplo, pero **utilizando** ==return== para que la función nos devuelva información. (SE RECOMIENDA SIEMPRE DEFINIR UNA VARIABLE FUERA DE LA FUNCIÓN PARA ASIGNAR VALORES A LOS PARAMETROS DE LA FUNCIÓN)
```python
# En este caso se define la funcion "suma" con dos parametros/variables dentro "x" e "y". Luego se coloca return para que una vez llamada la función el mismo return devuelva la operatoria de "x + y" en este caso.
def suma(x, y):
    return x + y

# Se define una variable "resultado" en donde se especifican los valores que queremos asignarle a "x" e "y" de la funcion suma.
resultado = suma(8, 2)

print(f"\n[+] El resultado de la operatoria es {resultado}")

# Este print nos devolverá "[+] El resultado de la operatoria es 10".
```

## Ambito de las variables

A continuación citaremos un ejemplo de una **variable de tipo global** y de una **variable de tipo local**
```python
variable = "Soy una variable global" # VARIABLE GLOBAL

def my_function():
    variable = "Soy una variable local" # VARIABLE LOCAL POR ESTAR DENTRO DE LA FUNCIÓN
    print(variable)

my_function()
print(variable)

# Esta función una vez es llamada nos devolvera el output de "Soy una variable local", esto se debe a que la funcion modifica el contenido de "variable" MOMENTANEAMENTE cuando la funcion es llamada.
# Pero luego el "print(variable)" que está FUERA de la funcion nos devolverá "Soy una variable global", esto debido a que EL VALOR DE LA VARIABLE NO FUE MODIFICADO DE FORMA EXTERNA.

# ------ CONSOLA 
Soy una variable local
Soy una variable global
```

Ahora mostraremos como **modificar** el valor de una **variable global dentro de una función**
```python
variable = "Soy la variable global que debe ser modificada"

def my_function():
    global variable # Aca mismo declaramos con "global" que queremos que "variable" cambie su valor a nivel global.
    variable = "Soy la nueva variable global" # Este será el nuevo valor GLOBAL de variable.
    print(variable)

my_function()
print(variable) # Este print a diferencia del ejemplo anterior nos mostrara el nuevo contenido definido en "variable" dentro de la funcion por utilizar GLOBAL.

# A partir de ahora la variable global será "Soy la nueva variable global".
# En este caso la consola nos reportaria lo siguiente 

# UN DATO ES QUE SI LA FUNCION NO ES EJECUTADA, EL VALOR DE LA VARIABLE SE VA A MANTENER COMO SIEMPRE (SOLO SE VA A MODIFICAR EL VALOR DE VARIABLE, SI EJECUTAMOS LA FUNCION.)

# ------ CONSOLA
Soy la nueva variable global
Soy la nueva variable global
```