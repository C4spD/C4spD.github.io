------
- Tags: #string #formating 
------
# Definición

> Hablamos de **String Formating** o **Formateo de Cadena** al proceso de **convertir** una serie de datos en una **representación especifica** o estructura. [[Python]] proporciona varias maneras de formatear cadenas, permitiendo insertar **variables** en ellas, así como **controlar el espaciado**, **alineación** y **precisión** de los datos mostrados.

----
# **Operador % (Porcentaje)**

También conocido como “**interpolación de cadenas**“, este método clásico utiliza marcadores de posición como ‘**%s**‘ para cadenas, ‘**%d**‘ para enteros, o ‘**%f**‘ para números de punto flotante.

**individual**
```python
name = 'c4sp'

print("Hola, mi nombre es %s" % name)
# El resultado sería "Hola mi nombre es c4sp"
```

**Múltiples con diferentes tipos de datos**
```python
name = 'c4sp'
apellido = 'sec'
edad = 23

print("Hola, mi nombre es %s y mi apellido es %s. Actualmente tengo %d años" % (name, apellido, edad))
# El resultado sería "Hola, mi nombre es c4sp y mi apellido es sec. Actualmente tengo 23 años"
```
En el caso de que en vez de **%d** hubiéramos colocado **%s** Python internamente realiza un **Type Casting** en el dato de tipo INT (Edad) convirtiéndolo en **STR** para que **podamos hacer uso del print con toda la cadena de texto** entera sin fallar.

--------
# **Método format()**

Este método utiliza llaves ‘**{}**‘ como marcadores de posición dentro de la cadena y puede incluir detalles sobre el formato de la salida.

**Múltiples con diferentes tipos de datos**
```python
name = 'c4sp'
apellido = 'sec'
edad = 23

print("Hola, mi nombre es {} y mi apellido es {}. Actualmente tengo {} años".format(name, apellido, edad))
# El resultado sería "Hola, mi nombre es c4sp y mi apellido es sec. Actualmente tengo 23 años"
```
En este caso **no hay que especificar** de que tipo de dato estamos hablando, **Python lo interpreta por si mismo**.

**Múltiples con diferentes tipos de datos utilizando índices**
```python
name = 'c4sp'
apellido = 'sec'
edad = 23

print("Hola, mi nombre es {0} y mi apellido es {1}. Actualmente tengo {2} años, como oíste, tengo {2}".format(name, apellido, edad))
# El resultado sería "Hola, mi nombre es c4sp y mi apellido es sec. Actualmente tengo 23 años, como oíste, tengo 23"
```
El índice de **name = 0**, **apellido = 1**, **edad = 2**, al igual que con los elementos de una lista, estos índices se colocan por orden.
# **F-Strings (Literal String Interpolation)**

Los **F-Strings** ofrecen una forma concisa y legible de incrustar expresiones dentro de literales de cadena usando la letra ‘**f**‘ antes de las comillas de apertura y llaves para indicar dónde se insertarán las variables o expresiones.

**Múltiples con diferentes tipos de datos**

```python
name = 'c4sp'
apellido = 'sec'
edad = 23

print(f"Hola, mi nombre es {name} y mi apellido es {apellido}. Actualmente tengo {edad} años, como oíste, tengo {edad} años")
# El resultado sería "Hola, mi nombre es c4sp y mi apellido es sec. Actualmente tengo 23 años, como oíste, tengo 23 años"
```