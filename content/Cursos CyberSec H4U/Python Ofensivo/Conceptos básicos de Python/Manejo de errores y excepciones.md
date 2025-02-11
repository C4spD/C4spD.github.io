----
- Tags: #errores #excepciones
-------
# Definiciones

> **Manejo de Errores**

Los errores pueden ocurrir por muchas razones: errores de código, datos de entrada incorrectos, problemas de conectividad, entre otros. **En lugar de permitir que un programa falle con un error**, Python nos **proporciona herramientas para ‘atrapar’ estos errores y manejarlos de manera controlada**, evitando así que el programa se detenga inesperadamente y **permitiendo reaccionar de manera adecuada**.

-----
> **Excepciones**

Una **excepción** en Python es un evento que ocurre durante la ejecución de un programa que interrumpe el flujo normal de las instrucciones del programa. **Cuando el intérprete se encuentra con una situación que no puede manejar**, ‘levanta’ o ‘arroja’ una excepción. 

**Bloques try y except**

Para manejar las excepciones, utilizamos los bloques ‘**try**‘ y ‘**except**‘. Un bloque ‘**try**‘ contiene el código que puede producir una excepción, mientras que un bloque ‘**except**‘ captura la excepción y contiene el código que se ejecuta cuando se produce una.

**Otras Palabras Clave de Manejo de Excepciones**

- **else**: Se puede usar después de los bloques ‘**except**‘ para ejecutar código si el bloque ‘**try**‘ no generó una excepción.
- **finally**: Se utiliza para ejecutar código que debe correr independientemente de si se produjo una excepción o no, como cerrar un archivo o una conexión de red.

**Levantar Excepciones**

También es posible ‘levantar’ una excepción intencionalmente con la palabra clave ‘**raise**‘, lo que permite forzar que se produzca una excepción bajo condiciones específicas.

-------

## Ejemplos de Manejo de errores y excepciones

 Si **colocamos un dato que no está bien definido o una operatoria que no es posible de realizarse** automáticamente cuando nosotros ejecutemos nuestro script, **nos dará un error con un nombre especifico** (Este nombre **depende del tipo de error** que hayamos cometido).
```python
num = 7/0 # Esta operatoria es imposible de realizar, por ende cuando ejecutemos el código nos brindará el siguiente error:

# File "/home/c4sp/Desktop/Python_Curso/prueba.py", line 11, in <module>
#     num = 7/0
#          ~^~
# ZeroDivisionError: division by zero                    ### "ZeroDivisionError" es el nombre de la excepcion que se acaba de acontecer.

# En este caso el nombre de nuestro error es "ZeroDivisionError"
```

Podremos **controlar el error** para que **nos brinde un output que nosotros queramos**. Siempre se recomienda **manejar la excepción con su nombre especifico**, porque a veces tendremos que manejar mas de una a la vez.
```python
try:

    num = 7/0

except:                         # En el "except" podriamos colocarle a un lado el nombre de la excepcíon, para que cuando esta suceda se cumpla lo que especifiquemos, quedando así "except ZeroDivisionError:"

    print("No se puede dividir un numero entre cero")

# Esto en la consola en vez de colocar todo el output del ejemplo anterior, nos printearia la cadena de texto que hayamos colocado.
```

También se puede jugar con "**else**", ya que si ninguno de los errores que especifiquemos en los "**except**" se acontece, podemos hacer que pase algo que queramos.
```python
try:
    num = 7/2

except ZeroDivisionError:
    print("No se puede dividir un numero entre cero")

else:
    print(f"La división entre ambos numeros da como resultado {num}")
```

También podríamos utilizar un bloque de comando "**finally**" que lo que hace es **ejecutarse siempre al final** de las excepciones **independientemente de si se acontecen o no**.
```python
try:

    num = 7/2

except ZeroDivisionError:
    print("No se puede dividir un numero entre cero")

else:
    print(f"La división entre ambos numeros da como resultado {num}")

finally:
    print("Esto siempre se va a ejecutar")

# En este caso la consola al ejecutar el script nos dara dos outputs, uno será el de "La división entre ambos numeros da como resultado 3.5" y otro que será "Esto siempre se va a ejecutar"
```

Las **excepciones** o errores como tal también las podemos definir **cuando nosotros lo indiquemos**, por ejemplo con **raise**
```python
x = -5

if x < 0:
    raise Exception("¡No se pueden utilizar números negativos!")

# Cuando este código se ejecute nos dará la excepción con el mensaje que colocamos

# -------------- CONSOLA
 Traceback (most recent call last):
  File "/home/c4sp/Desktop/Python_Curso/prueba.py", line 6, in <module>
    raise Exception("¡No se pueden utilizar números negativos!")
Exception: ¡No se pueden utilizar números negativos!
```