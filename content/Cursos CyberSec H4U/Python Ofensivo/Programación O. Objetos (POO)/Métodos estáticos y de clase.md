------
- Tags: #poo
-----
# Definición

> Los **métodos estáticos** y los **métodos de clase** son dos herramientas poderosas en la programación orientada a objetos en Python, que **ofrecen flexibilidad** en cómo se puede **acceder** y **utilizar** la funcionalidad **asociada con una clase**.

------
### Métodos Estáticos

Los **métodos estáticos** en Programación Orientada a Objetos (POO) se definen usando el decorador `@staticmethod`. Estos métodos **están asociados con la clase** en lugar de con instancias particulares de la clase. 

- Un método estático se define en una clase utilizando `@staticmethod` como decorador justo encima de la definición del método.
- No reciben implícitamente un primer parámetro `self` como los métodos de instancia normales. En su lugar, se comportan más como funciones regulares, pero están asociadas con la clase.

-  **Acceso a objetos dentro de métodos estáticos**:

	- Aunque los métodos estáticos no pueden acceder directamente a los atributos de instancia (`self.atributo`) ni a métodos de instancia, sí pueden acceder a otros métodos estáticos o a atributos de clase usando la notación `Clase.atributo`.
	- También pueden crear instancias de objetos y manipularlos si se pasan explícitamente como parámetros al método estático.

- **Cuándo usar métodos estáticos**:

	- Se utilizan para agrupar funciones que pertenecen conceptualmente a una clase, pero que no necesitan acceder a las instancias de la clase (es decir, no dependen de ningún estado específico de la instancia).
	- Son útiles cuando la lógica de la función no depende de modificar o acceder a atributos de instancia, sino que se enfoca en operaciones más genéricas o de utilidad asociadas con la clase.

-----
### Métodos de Clase

El **método de clase** en Python se define utilizando el decorador `@classmethod`. A diferencia de los métodos estáticos, los métodos de clase **sí tienen acceso al objeto de la clase** (`cls`) como primer parámetro, similar a cómo los métodos de instancia tienen acceso al objeto (`self`). Esto permite a los métodos de clase **interactuar con la clase misma** y con sus **atributos de clase**.

- **Uso del decorador `@classmethod`**:
    
    - Se utiliza para definir métodos de clase en Python.
    - El primer parámetro del método de clase es convencionalmente `cls`, que representa la clase en sí misma.
- **Acceso a atributos de clase**:
    
    - Los métodos de clase pueden acceder y modificar atributos de clase usando la notación `cls.atributo`.
- **Creación de instancias y métodos estáticos**:
    
    - Pueden crear instancias de objetos de la clase utilizando el constructor `cls()`.
    - También pueden llamar a otros métodos estáticos o de clase dentro de la misma clase.

-  **Cuándo usar métodos de clase**:

	- **Acceso a atributos de clase**: Cuando necesitas manipular o acceder a atributos de clase dentro de métodos.
	- **Creación de instancias de clase**: Cuando necesitas crear instancias de la propia clase dentro de métodos.
	- **Comportamiento asociado a la clase**: Cuando la lógica de tu método está más relacionada con la clase en su conjunto que con instancias individuales.