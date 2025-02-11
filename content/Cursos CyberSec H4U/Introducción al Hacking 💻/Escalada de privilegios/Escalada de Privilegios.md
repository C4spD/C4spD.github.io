--------
# Definición

> Una vez **obtengamos el acceso** a la máquina victima comienza el proceso de **escalada de privilegios**, en este proceso nos encargamos como atacantes de intentar elevar nuestro privilegio para **poder efectuar más criticidad en el sistema**, ya sea para acceder a recursos privilegiados, cambiar contraseñas, modificar recursos internos, etc.

Para realizar las técnicas de escalada que vamos a ver en toda esta sección, emplearemos el uso de un contenedor para poder modificar y o eliminar archivos para el aprendizaje.

- ``docker pull ubuntu:latest``
- ``docker run -dit --name ubuntuServer ubuntu``

En el caso de la explotación de **Capabilities** usaremos el siguiente comando

- ``docker run -dit --privileged --name ubuntuServer ubuntu``

---------