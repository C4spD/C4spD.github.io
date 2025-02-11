----
- Tags:
-------
# Definición

> 	La **POO** es una forma de programar que es prácticamente **indispensable a la hora de realizar un trabajo** o código, ya que el contenido **no se realiza de forma SECUENCIAL como se lo suele hacer en códigos cortos** o simples, si no que se establece un **orden mucho mas sólido** mediante la definición de **Objetos**. Los **Objetos** vienen a representar **entidades del mundo real**, con sus **características**, su **funcionamiento** y demás.

--------
# Explicación con ejemplos

### Desventajas de no usar POO

Si nosotros deseáramos crear definiciones de varias **marcas de celulares** de una manera "**tradicional**" con un código **SECUENCIAL** con sus respectivas características y demás podríamos hacer lo siguiente que ==¡NO ES VIABLE!==.
```python
celular1_marca = "Samsung"
celular2_marca = "Apple"
celular3_marca = "Huawei"

celular1_modelo = "S22"
celular2_modelo = "Iphone 15 PRO"
celular3_modelo = "P20 PRO"

celular1_camaraT = "48MP"
celular2_camaraT = "98MP"
celular3_camaraT = "12MP"

celular1_camaraF = "28MP"
celular2_camaraF = "28MP"
celular3_camaraF = "8MP"
```

Si nosotros quisiéramos **mostrar todas las características de un teléfono** en especifico, o ir citando cada una sería **completamente complejo**, ya que ahora mismo estamos usando tres teléfonos de ejemplo, pero si fuese una fabrica de celulares que hay mas de **cien** marcas, **no podríamos**.

### Clases y Objetos

Para explicarlo de una manera simple las **Clases** son una especie de **recetas que tenemos que seguir** para construir un **Objeto**. Las Clases nos van a permitir **definir cuales van a ser las características y cualidades** que va a tener nuestro objeto.

A continuación se hará una demostración de **como definir una clase**, para esto **utilizaremos el convenio "Pascal Case"**. 
Pascal Case se utiliza como convenio, se basa en utilizar **PrimerPalabraEnMayuscula** de cada palabra para **definir una clase**.
```python
class NombreClase(): # Esta sería la sintaxis para definir una clase con su nombre.
	propiedad1 = "Valor 1"         # Aquí dentro colocaremos que es lo que podrá hacer nuestro objeto, sus caracteristicas, propiedades, atributos.
	propiedad2 = "Valor 2"         # A todo esto se le llama "Atributos Estaticos" porque para todos los objetos van a ser iguales.
	propiedad3 = "Valor 3"         # Recordemos que esto todavía no es un objeto

# Ahora colocaremos un ejemplo con mas sentido

class Celular():
	marca = "Samsung"
	modelo = "S23"
	camara = "48MP"
```

Hay que entender que un **Objeto** es una **Instancia de una Clase**, ahora que creamos nuestra **clase/receta** podremos crear todos los objetos que queramos porque ya sabemos la receta como tal.
```python
class Celular():
	marca = "Samsung"
	modelo = "S23"
	camara = "48MP"

celular1 = Celular() # Aca Instanciamos un Objeto (Creamos un objeto), si hicieramos un print(celular1) nos indicaría que es un objeto y nos daría su código.

# Si colocamos el nombre de nuestro objeto y despues un punto a continuación podremos especificar que Atributo Estático queremos que nos muestre de ese objeto, en este caso queremos ver modelo que sería Samsung.
print(celular1.modelo)

```
Todos los atributos de estos objetos **se pueden modificar** redefiniéndolos (**celular1.camara = 78MP**), pero **NO ES CONVENIENTE** ya que si creamos una clase con atributos de Samsung, perderíamos tiempo en cambiarle la marca a cada objeto que creemos, para eso podríamos usar otros métodos referidos a los Atributos.

### Atributos

Ahora si nosotros quisiéramos tener una receta/molde "**genérico**" para **crear muchos celulares de diferentes características** (Marcas, cámaras, modelos), es decir, crear Atributos no estáticos o mejor llamados **Atributos de instancia** haremos esto.

Los **Atributos de instancia** nos permiten que mientras estamos **Instanciando una clase** (creando un objeto) podemos **definir como queremos que sean** sus atributos o que **características van a poseer**.

- Creamos un método especial `__init__` este es un método especial en Python (Hay varios), que **se llama automáticamente cuando se crea una nueva instancia de una clase (creamos un objeto)**. Este método se utiliza para inicializar los atributos de la instancia recién creada. El nombre `__init__` es un método especial reservado en Python para este propósito y se conoce como el "**constructor**" de la clase.
- Colocamos las **propiedades que queremos que tenga nuestro objeto** dentro del parentesis ``def __init__(self, marca, modelo, camara):``, **SELF** hace referencia a **SI MISMO**, es como decir **self.marca** es igual a **celular1.marca**.
- Dentro del bloque ``__init__`` vamos a **definir las propiedades como variables** que colocamos previamente, entendiendo que ``self.marca`` por ejemplo, hace alusión a la propiedad o como haremos referencia a esa variable.
- Luego fuera del bloque **instanciamos el objeto** (Creamos el objeto) y dentro de los parentesis de ``Celular()`` colocamos las características que queramos de nuestro objeto. ==RESPETANDO EL ORDEN QUE COLOCAMOS EN EL CONSTRUCTOR==
- Creamos la cantidad de objetos que queramos con las características que queramos.

```python
class Celular: # Lo que hacemos primero es sacarle los parentesis a Celular().
	def __init__(self, marca, modelo, camara):
		self.marca = marca   # Aqui dentro definimos las propiedades que colocamos en el constructor.
		self.modelo = modelo
		self.camara = camara


celular1 = Celular("Samsung", "S22", "48MP") # A la misma vez que creamos el objeto, le definimos sus caracteristicas RESPETANDO EL ORDEN QUE COLOCAMOS EN EL CONSTRUCTOR (marca, modelo, camara).
celular2 = Celular("Apple", "15 Pro Max", "98MP")
celular3 = Celular("Huawei", "P20 Pro", "28MP")

print(celular1.marca) # Esto nos devolverá Samsung, ya que lo definimos dentro de la misma creación del objeto.
print(celular2.marca) # Esto nos devolverá Apple.
print(celular3.marca) # Esto nos devolverá Huawei.
```

### Métodos

En titulo anterior tratamos con los **atributos de un objeto** (Una persona posee pelo, color de piel, edad, etc), pero ahora si queremos **definir las acciones de ese objeto** por ejemplo una persona salta, corre, vuela, utilizamos **Métodos**.

Un **Método** es **una función común**, la única diferencia que tiene es que **se llama método cuando está dentro del bloque donde se define una clase**. Estos métodos sirven para definir cuales son las **acciones** que puede hacer nuestro objeto.

```python
class Celular:
	def __init__(self, marca, modelo, camara):
		self.marca = marca
		self.modelo = modelo
		self.camara = camara

	def llamar(self):      #--------------------------> Aca creamos un método (Acción). Siempre se le debe colocar el (self) porque debemos pasarle el parámetro que hace referencia al objeto.
		print(f"Estas haciendo un llamado desde tu {self.marca}") #-----------> Siempre cuando llamamos a un Atributo de nuestro objeto le colocamos el self adelante, si no nos saldrá un error de que no está definida.

	def cortar(self):      #--------------------------> Aca creamos otro método.
		print(f"Cortaste la llamada desde tu {self.marca}")

celular1 = Celular("Samsung", "S22", "48MP")

celular1.llamar() # ----------------------------------> No hace falta que coloquemos print() al llamar a la función.
```

#### Métodos Especiales

Hay cantidades de **Métodos Especiales** que se pueden utilizar además del constructor ``__init__():``, es **cuestión de conocerlos** y aprender los patrones de funcionamiento que poseen, a continuación se mostrarán dos Métodos especiales.

El primero Método especial será ``__str__(self):`` que se utiliza para que al objeto que tu le estés pasando le puedas indicar que es lo quieres que te muestre.
```python
class Rectangulo:
    def __init__(self, altura, ancho):
        self.altura = altura
        self.ancho = ancho

    def area(self):
        return f"El area del rectángulo actual es de {self.ancho * self.altura}mts"

rect1 = Rectangulo(20, 60)

print(rect1) # --------------------> Esto nos dará el código de nuestro objeto, pero esto no nos interesa, para que nos de lo que nosotros le especifiquemos se utiliza el Método especial __str__().

# <__main__.Rectangulo object at 0x7f86eb2a82d0>  -----------------------> Esto nos dará la consola si lo ejecutamos así.

```

Para poder evitar esto y manipular el contenido de ese objeto, haremos lo siguiente
```python
class Rectangulo:
    def __init__(self, altura, ancho):
        self.altura = altura
        self.ancho = ancho
        
    def area(self):
        return f"\n[+] El area del rectángulo actual es de [{self.ancho * self.altura}mts]"

    def __str__(self): # ---------------------> Aquí se define el Método especial, y una vez se llame al objeto, automaticamente Python buscará este método para mostrarnos lo que le indiquemos a la función.
        return f"\n[+] Las propiedades del rectángulo actual son las siguientes: [Altura: {self.altura}mts] [Ancho: {self.ancho}mts]"

rect1 = Rectangulo(20, 60)

print(rect1) # ------------------> Esto nos mostrará "[+] Las propiedades del rectángulo actual son las siguientes: [Altura: 20] [Ancho: 60]mts" en vez del código de objeto que nos mostraba en el ejemplo anterior.
print(rect1.area()) # -----------> Esto nos mostrará "[+] El area del rectángulo actual es de [1200mts]"
```

-------

Por otro lado tenemos el método especial ``__eq__`` que se utiliza para que **el programa automáticamente busque esa función a la hora de ejecutar una igualdad entre dos objetos**.
```python
class Rectangulo:
    def __init__(self, altura, ancho):
        self.altura = altura
        self.ancho = ancho

    def __eq__(self, otro): # ----> Aquí se define el Método especial, lo que este metodo hace es llamar a la función automaticamente cuando una igualdad está presente. Ademas se agrega un argumento "otro" haciendo alusión al segundo rectangulo en este caso.
        return self.ancho == otro.ancho and self.altura == otro.altura  # ----> Aquí definimos que si el ancho de rect1 es igual al de otro y lo mismo con la altura esto nos devolverá un valor BOOLEANO (TRUE O FALSE).


rect1 = Rectangulo(20, 60)
rect2 = Rectangulo(18, 70)

print(f"\n[+] ¿Son iguales? ---> {rect1 == rect2}") # ----> Aquí al colocar una igualdad automáticamente esta operatoria buscara al Método __eq__(), en este caso "rect2" es equivalente a "otro" en el argumento de __eq__

# ---------- CONSOLA

# [+] ¿Son iguales? ---> False
```

A continuación se listarán los **métodos especiales mas comunes**:

![[Métodos Especiales.png]]