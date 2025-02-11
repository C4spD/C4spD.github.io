------------
- Tags: #Linux #busqueda #filtros 
-----------
# Definición

> Las **Expresiones regulares** o **Regex** son una **forma de expresión para buscar patrones en textos y archivos**. Se pueden utilizar para buscar y reemplazar texto, analizar datos, realizar búsquedas y más. Una expresión regular **es una secuencia de letras y símbolos que forman un patrón de búsqueda**. Se pueden crear expresiones regulares con **patrones llamados meta caracteres**. Los meta caracteres son **símbolos que definen el patrón de búsqueda pero no tienen un significado literal**. Podemos usarlas con [[Herramientas Linux]] como "grep",  "sed" entre otras.

-------------
# Operadores de Agrupación


|       |                                                                                                                                             |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `(a)` | Los paréntesis se utilizan para **agrupar partes de una RegEx**. Entre paréntesis puede definir otros patrones que deben procesarse juntos. |

|   |   |
|---|---|
|` [ a-z ]`|Los corchetes se utilizan para **definir clases de caracteres/Letras**. Dentro de los corchetes, puede especificar una lista de caracteres para buscar.|

|   |   |
|---|---|
|`{1,10}`|Las llaves se utilizan para **definir cuantificadores/Numeros**. Dentro de las llaves, puede especificar un número o rango que indique con qué frecuencia se debe repetir un patrón anterior.|

|   |   |
|---|---|
|`\|`|También se llama operador OR ==(O...)== y **muestra resultados cuando una de las dos expresiones coincide**.|

|   |   |
|---|---|
|`.*`|También se llama operador AND ==(Y...)== y **muestra resultados solo si ambas expresiones coinciden**.|
