
| Característica  | Listas     | Tuplas     | Conjuntos     | Diccionarios          |
| --------------- | ---------- | ---------- | ------------- | --------------------- |
| **Sintaxis**    | [1, 2, 3]  | (1, 2, 3)  | {1, 2, 3}     | {"k1": "v1"}          |
| **Mutabilidad** | Mutables   | Inmutables | Mutables      | Mutables              |
| **Indexación**  | Sí         | Sí         | No            | Clave                 |
| **Orden**       | Ordenados  | Ordenados  | No ordenados  | Ordenados (desde 3.7) |
| **Duplicados**  | Permitidos | Permitidos | No permitidos | Claves no permitidas  |
### Diferencias entre Listas, Tuplas, Conjuntos y Diccionarios en Python

En Python, las listas, tuplas, conjuntos y diccionarios son tipos de datos incorporados que se utilizan para almacenar colecciones de elementos. Cada uno tiene sus propias características y usos. A continuación, se detallan las diferencias principales entre ellos:

### Listas

- **Definición**: Se definen con corchetes `[]`.
- **Mutabilidad**: Son mutables, lo que significa que se pueden modificar después de su creación (añadir, eliminar o cambiar elementos).
- **Indexación**: Los elementos se pueden acceder, modificar y eliminar mediante índices.
- **Orden**: Mantienen el orden de los elementos según fueron añadidos.
- **Sintaxis de ejemplo**: `mi_lista = [1, 2, 3, 4]`

### Tuplas

- **Definición**: Se definen con paréntesis `()`.
- **Mutabilidad**: Son inmutables, es decir, una vez creadas no se pueden modificar.
- **Indexación**: Los elementos se pueden acceder mediante índices, pero no se pueden modificar ni eliminar.
- **Orden**: Mantienen el orden de los elementos según fueron añadidos.
- **Sintaxis de ejemplo**: `mi_tupla = (1, 2, 3, 4)`

### Conjuntos

- **Definición**: Se definen con llaves `{}` o con la función `set()`.
- **Mutabilidad**: Son mutables, pero los elementos individuales deben ser inmutables (por ejemplo, no se pueden incluir listas dentro de un conjunto).
- **Indexación**: No permiten acceso por índices porque no están ordenados.
- **Orden**: No mantienen un orden específico.
- **Unicidad**: No permiten elementos duplicados.
- **Sintaxis de ejemplo**: `mi_conjunto = {1, 2, 3, 4}` o `mi_conjunto = set([1, 2, 3, 4])`

### Diccionarios

- **Definición**: Se definen con llaves `{}`, pero consisten en pares clave-valor.
- **Mutabilidad**: Son mutables, lo que significa que se pueden añadir, eliminar o cambiar pares clave-valor después de su creación.
- **Indexación**: Los elementos se acceden mediante claves, no mediante índices.
- **Orden**: Desde Python 3.7, los diccionarios mantienen el orden de inserción de los elementos.
- **Claves Únicas**: Las claves deben ser únicas y deben ser inmutables (por ejemplo, no se pueden usar listas como claves).
- **Sintaxis de ejemplo**: `mi_diccionario = {"clave1": "valor1", "clave2": "valor2"}`