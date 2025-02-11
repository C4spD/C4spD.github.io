----
- Tags: #web #vulnerabilidades #owasp 
------
# Definición

> El ataque de asignación masiva (**Mass Assignment Attack**) se basa en la manipulación de parámetros de entrada de una solicitud HTTP para crear o modificar campos en un objeto de modelo de datos en la aplicación web. En lugar de agregar nuevos parámetros, los atacantes intentan explotar la funcionalidad de los parámetros existentes para modificar campos que no deberían ser accesibles para el usuario.

Por ejemplo, en una aplicación web de gestión de usuarios, un formulario de registro puede tener campos para el nombre de usuario, correo electrónico y contraseña. Sin embargo, si la aplicación utiliza una biblioteca o marco que permite la asignación masiva de parámetros, el atacante podría manipular la solicitud HTTP para agregar un parámetro adicional, como el nivel de privilegio del usuario. De esta manera, el atacante podría registrarse como un usuario con privilegios elevados, simplemente agregando un parámetro adicional a la solicitud HTTP.

---
# Explotación en laboratorio de la vulnerabilidad

Para comenzar con la explotación primero vamos a desplegar un laboratorio vulnerable a través del siguiente [repositorio](https://hub.docker.com/r/bkimminich/juice-shop)

- ``docker pull bkimminich/juice-shop``
- ``docker run -dit -p 3000:3000 --name JuiceShop bkimminich/juice-shop``

Ahora solo quedaría ingresar a http://localhost:3000 para comenzar con el ataque.

---

Lo primero que haremos será ir a la sección de **Login** de la web mas específicamente al apartado de **Registro**, luego rellenaremos los datos pero a la hora de enviar el registro vamos a **interceptar** la solicitud con **Burpsuite** para analizar como enviamos la data nosotros y que nos devuelve la respuesta.

![[AAM 1.png]]

![[AAM 2.png]]

Por lo tanto ahora que sabemos que **ese parámetro existe**, probemos enviando un nuevo registro con otro email, pero esta vez agregando ese parámetro con ``"role": "admin"``.

![[AAM 3.png]]

De esta forma habríamos registrado nuestra cuenta con **el rol de administrador**.

------

Veamos otro ejemplo con otro laboratorio.

 - ``docker pull blabla1337/owasp-skf-lab:parameter-binding``
 - ``docker run -dit -p 5000:5000 --name skfLab 13b2d12f94eb``
 
Una vez entremos a la web por el *puerto 5000*, veremos que hay **dos campos modificables**, uno correspondiente al usuario **Guest** y otro correspondiente al usuario **Admin**, interceptemos ambas peticiónes para ver como se tramitan.

![[AAM 4.png]]

Por lo tanto añadiremos un nuevo parámetro en el cual tendremos que aplicar **Fuzzing** para adivinar cual es el correspondiente para cambiar de **false** a **true** en la sección de *Privileged* en la web.

![[AAM 5.png]]

Ahora tendríamos que ir probando con todos los posibles campos que podamos imaginar, por ejemplo (``admin, privileged, isAdmin, isadmin, administrator, Admin, is_admin``, y los que se nos ocurran hasta encontrar el correcto)

![[AAM 6.png]]

Una vez lo encontremos como lo fue en la imagen anterior, solo deberíamos corroborar en la web que el campo ha sido modificado correctamente.

![[AAM 7.png]]

Hemos realizado el ataque satisfactoriamente.