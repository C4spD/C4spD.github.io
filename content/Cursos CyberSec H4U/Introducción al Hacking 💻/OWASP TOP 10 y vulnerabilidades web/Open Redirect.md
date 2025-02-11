--------
- Tags: #owasp #vulnerabilidades #web 
----
# Definición

> La vulnerabilidad de redirección abierta, también conocida como **Open Redirect**, es una vulnerabilidad común en aplicaciones web que puede ser explotada por los atacantes para dirigir a los usuarios a sitios web maliciosos. Esta vulnerabilidad se produce cuando una aplicación web permite a los atacantes manipular la URL de una página de redireccionamiento para redirigir al usuario a un sitio web malicioso.

Por ejemplo, supongamos que una aplicación web utiliza un parámetro de redireccionamiento en una URL para dirigir al usuario a una página externa después de que se haya autenticado. Si esta URL no valida adecuadamente el parámetro de redireccionamiento y permite a los atacantes modificarlo, los atacantes pueden dirigir al usuario a un sitio web malicioso, en lugar del sitio web legítimo.

Un ejemplo de cómo los atacantes pueden explotar la vulnerabilidad de redirección abierta es mediante la creación de correos electrónicos de **phishing** que parecen legítimos, pero que en realidad contienen enlaces manipulados que redirigen a los usuarios a un sitio web malicioso. Los atacantes pueden utilizar técnicas de **ingeniería social** para convencer al usuario de que haga clic en el enlace, como ofrecer una oferta atractiva o una oportunidad única.

Para prevenir la vulnerabilidad de redirección abierta, es importante que los desarrolladores implementen medidas de seguridad adecuadas en su código, como la validación de las URL de redireccionamiento y la limitación de las opciones de redireccionamiento a sitios web legítimos. Los desarrolladores también pueden utilizar técnicas de codificación segura para evitar la manipulación de URL, como la codificación de caracteres especiales y la eliminación de caracteres no válidos.

-----
# Explotación de Open Redirect en Laboratorio

Como primer ejercicio para practicar esta explotación utilizaremos el repositorio de ``skf-labs`` que ya hemos usado anteriormente.

- ``git clone https://github.com/blabla1337/skf-labs``
- ``cd nodeJs/Url-redirection``
- ``npm install``
- ``npm start``

Este laboratorio correrá por el *puerto 5000*

![[open redirect 1.png]]

Interceptemos la petición que se tramita al pulsar en "**Go to new website**"

![[open redirect 2.png]]

Vemos que por defecto el servidor realiza un **Redirect** hacia la URL http://localhost:5000/newsite, pero que pasaría si nosotros en vez de dejar ``/newsite`` colocamos **una URL que nosotros queramos**?

![[open redirect 3.png]]

Si nosotros probamos esto a través de la **URL** verificaremos que el **Redirect** nos llevará a la URL que nosotros proporcionamos, en este caso a *Google.com*.

![[open redirect 4.png]]

De esta forma confirmaríamos que en este caso el parámetro ``redirect`` es vulnerable a **Open Redirect**.

Hay casos en los que la web aplica una sanitización evitando que nosotros podamos usar **puntos** ``.`` o **barras** ``//`` a la hora de **intentar manipular el Redirect**, para bypassear esto podemos hacer lo siguiente.

- En el caso de los **puntos** ``.`` lo que podemos hacer es **URLencodearlo** (``%2e``). Esto muchas veces no funcionará por lo tanto podemos **URLencodear** el ``%`` que contiene el **URLencode** del ``.``, quedando todo tal que así 

	![[open redirect 6.png]]

	Al realizar todo esto, la cadena completa quedará de esta forma ``/redirect?newurl=https://google%252ecom``, con esto hemos **bypasseado** correctamente la **prohibición de los puntos**.

-----

- En el caso de las **barras** ``//`` lo que se puede hacer pero **solo en caso de que la URL** a la que queramos generar el Redirect **contenga** *HTTPS*, es decir, el candado verde, es directamente quitarlas, ya que automáticamente serán colocadas pero sin que se detecte, todo esto quedaría de esta manera.

	![[open redirect 7.png]]

---

Cabe destacar que la vulnerabilidad **Open Redirect** **por si sola no es peligrosa**, pero si se emplea concatenándola con otras vulnerabilidad lo es de manera muy drástica, por ejemplo empleando campañas de **Phishing** para enviar a las víctimas con un Redirect a una web replica de la oficial, obteniendo credenciales con un panel de Login falso. Esto es muy crítico ya que es el **servidor DNS de la web oficial el que envía a los usuarios a la web del atacante**, por lo tanto las víctimas al ver que la URL es la de su empresa oficial, **clickearan** mucho más fácil sin ver que en algún lugar de la URL está **el parámetro vulnerable con Redirect colocado**.

Hay una [herramienta](https://github.com/epsylon/ufonet) creada por el usuario *epsylon* que lo que hace es **abusar de las webs vulnerables a Open Redirect** para generar una **Botnet** para que los dominios vulnerables realicen las acciones que les indiques, por ejemplo ataques **DDOS** o envío de solicitudes masivas con algún beneficio en especial. Cabe aclarar que esta herramienta utilizada para casos reales y no en entornos controlados es **considerada ILEGAL**.

