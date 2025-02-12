----
- Tags: #vulnerabilidades #owasp #web 
---
# Definición

> Los **IDOR** (**Insecure Direct Object Reference** o Referencia Directa a Objetos Insegura) son un tipo de vulnerabilidad de control de acceso. Ocurre cuando una aplicación permite a un usuario acceder o modificar datos de otros usuarios simplemente cambiando el identificador (ID) en una URL, formulario o solicitud.
> 
> Esto es problemático porque la aplicación no valida adecuadamente si el usuario tiene permiso para acceder a ese recurso. Un atacante puede explotar esta debilidad adivinando o manipulando esos identificadores.
>
> Para explotar una vulnerabilidad IDOR, un atacante puede intentar modificar manualmente el identificador de un objeto en la URL o utilizar una herramienta automatizada para probar diferentes valores. Si el atacante encuentra un identificador que le permite acceder a un recurso que no debería estar disponible, entonces la vulnerabilidad IDOR se ha explotado con éxito.

Para prevenir esta vulnerabilidad, es importante validar adecuadamente la autorización del usuario para acceder a los recursos, tanto en la interfaz de usuario como en las solicitudes directas a través de URL. Además, se recomienda restringir los permisos de acceso a los recursos y mantener actualizado el software y los sistemas operativos.

-----
# Explotación de IDORs en laboratorio

En este caso emplearemos la misma [máquina](https://www.vulnhub.com/entry/xtreme-vulnerable-web-application-xvwa-1,209/) de Vulnhub llamada **XTREME** que usamos en las [[Inyecciones XPath]] y nos vamos a dirigir a la ruta */xvwa*, en la pestaña de "*Insecure Direct Objeto Reference*".

--------

En este sección tendremos la opción de seleccionar el **Item code** de diferentes tipos de Cafés, al hacerlo en la **URL** se puede ver a simple vista un parámetro llamado ``?item=1`` en el caso de seleccionar el **Item code** "*1*", si nosotros vamos reemplazando el valor de ``item``, recorriendo por diferentes números que se nos ocurran que no aparezcan en las opciones, podremos llegar a listar contenido que no deberíamos de tener acceso.

![[IDORS 1.png]]

![[IDORS 2.png]]

![[IDORS 3.png]]

------
# Explotación de IDORs en otro laboratorio

Para tener mas de un ejemplo sobre esta vulnerabilidad nos clonaremos el repositorio de [skf-labs](https://github.com/blabla1337/skf-labs/tree/master/nodeJs/IDOR) de Github, luego nos meteremos a la ruta *skf-labs/nodeJs/IDOR* ejecutando dentro lo siguiente

- ``npm install``
- ``npm start``

Ahora solo nos queda ingresar en nuestro navegador a http://localhost:5000/

------

En esta web disponemos de **dos entradas**, una sirve para **crear un PDF propio**, y la otra para **descargar el PDF** proporcionando su **ID** una vez creado.

![[IDORS 4.png]]

Interceptemos la petición de *Download* con **Burpsuite**.

![[IDORS 5.png]]

Utilizaremos la herramienta ``wfuzz`` en este caso

- ``wfuzz -c -t 10 -z range,1-1500 -d 'pdf_id=FUZZ' http://localhost:5000/download``

![[IDORS 6.png]]

Esto nos dará mucha información, por lo tanto **aplicaremos un filtro** ya que podemos intuir que las respuestas que poseen **10703 caracteres no son válidas**, por lo tanto empleemos el parámetro ``--hh=10703``

- ``wfuzz --hh=10703 -c -t 10 -z range,1-1500 -d 'pdf_id=FUZZ' http://localhost:5000/download``

Si observamos veremos que tenemos otra vez una cantidad de **caracteres que se repiten**, en este caso es el valor *1233*, por lo tanto filtrémoslos también.

- ``wfuzz --hh=10703,1233 -c -t 10 -z range,1-1500 -d 'pdf_id=FUZZ' http://localhost:5000/download``

De esta forma **conseguiremos acceso a PDFs** que **no** nos corresponden a nosotros como usuarios, en mi caso fue el **número 14**, que al abrirlo en la web veremos una **FLAG**.

![[IDORS 7.png]]