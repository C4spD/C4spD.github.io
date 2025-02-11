----
- Tags:
---
# Definición

> Las **Inyecciones CSS** (**CSSI**) son un tipo de vulnerabilidad web que permite a un atacante inyectar código CSS malicioso en una página web. Esto ocurre cuando una aplicación web confía en entradas no confiables del usuario y las utiliza directamente en su código CSS, sin realizar una validación adecuada.

El código CSS malicioso inyectado puede alterar el estilo y diseño de la página, permitiendo a los atacantes realizar acciones como la **suplantación de identidad** o el **robo de información confidencial**.

Las Inyecciones CSS (CSSI) pueden ser utilizadas por los atacantes como un vector de ataque para explotar vulnerabilidades de **Cross-Site Scripting** (**XSS**). Imagina que una aplicación web permite a los usuarios introducir texto en un campo de entrada que se muestra en una página web. Si el desarrollador de la aplicación no valida y filtra adecuadamente el texto introducido por el usuario, un atacante podría inyectar código malicioso en el campo de entrada, incluyendo código Javascript.

Si el código CSS inyectado es lo “suficientemente complejo”, puede hacer que el navegador web interprete el código como si fuera código JavaScript. Esto significa que el código CSS malicioso puede ser utilizado para inyectar código JavaScript en la página web, lo que se conoce como una inyección de JavaScript inducida por CSS (CSS-Induced JavaScript Injection).

Una vez que el código JavaScript ha sido inyectado en la página, este puede ser utilizado por el atacante para realizar un ataque de Cross-Site Scripting (XSS). Una vez en este punto, el atacante podría ser capaz de inyectar un script malicioso que robe las credenciales del usuario o que los redirija a una página web falsa, entre otros muchos posibles vectores.

# Explotación en laboratorio

Utilizaremos el laboratorio **skf-labs** específicamente la ruta ``skf-labs/n/CSSI``

- ``npm install``
- ``npm start``

![[CSSI 1.png]]

------

Ahora que vimos el comportamiento de la web, veamos **el código fuente** para ver como es que esto funciona.

![[CSSI 2.png]]

Como vemos en este caso se están empleando etiquetas de **HTML** combinado con **CSS**, por lo tanto lo que podemos hacer es intentar manipular estas etiquetas, cerrándolas antes de tiempo para concatenar acciones no deseadas, veamos un ejemplo con un XSS.

Lo primero que tendríamos que hacer es identificar el lugar en donde se encuentra nuestro **OUTPUT**, en este caso es donde dice "*red*", por lo tanto ahí es donde nos encontramos actualmente. Luego de esto tendríamos que **cerrar las llaves** antes de tiempo que se abren después de ``p.colorful{``, y por ultimo cerrar la etiqueta ``<style>`` antes también. Después de realizar esto, podríamos concatenar un XSS por ejemplo ``<script>alert(1)</script>``.

- ``red}</style><script>alert(1)</script>``

- El atacante **cierra prematuramente** la regla CSS con `red}` y **cierra la etiqueta `<style>`** con `</style>`. Esto es lo que constituye la **CSS Injection (CSSI)**.
- **La etiqueta `<style>` se cierra antes de tiempo**, permitiendo que el contenido siguiente sea tratado como código HTML normal en vez de CSS.
- Después de cerrar la etiqueta `<style>`, el atacante inserta una etiqueta `<script>` que contiene código JavaScript malicioso

![[CSSI 3.png]]

De esta forma tendríamos un **XSS** derivado a partir de un **CSSI**.