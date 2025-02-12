-----
- Tags: #permisos #privilege #escalation 
-----
# Explicación

> En sistemas Linux, los archivos y directorios tienen permisos que se utilizan para controlar el acceso a ellos. Los permisos se dividen en tres categorías: **propietario**, **grupo** y **otros**. Cada categoría puede tener permisos de lectura, escritura y ejecución. Los permisos de un archivo pueden ser modificados por el propietario o por el superusuario del sistema.

>El abuso de permisos incorrectamente implementados ocurre cuando los permisos de un archivo crítico son configurados incorrectamente, permitiendo a un usuario no autorizado acceder o modificar el archivo. Esto puede permitir a un atacante leer información confidencial, modificar archivos importantes, ejecutar comandos maliciosos o incluso obtener acceso de superusuario al sistema.

>De esta forma, un atacante experimentado podría aprovecharse de esta falla para elevar sus privilegios en el mejor de los casos. Una de las herramientas encargadas de aplicar este reconocimiento en el sistema es `lse`. **Linux Smart Enumeration** es una herramienta de enumeración de seguridad para sistemas operativos basados en Linux, diseñada para ayudar a los administradores de sistemas y auditores de seguridad a identificar y evaluar vulnerabilidades y debilidades en la configuración del sistema.

>**LSE** está diseñado para ser fácil de usar y proporciona una salida clara y legible para facilitar la identificación de problemas de seguridad. La herramienta utiliza comandos de Linux estándar y se ejecuta en la línea de comandos, lo que significa que no se requiere software adicional. Además, enumera una amplia gama de información del sistema, incluyendo usuarios, grupos, servicios, puertos abiertos, tareas programadas, permisos de archivos, variables de entorno y configuraciones del firewall, entre otros.

**Github** [LSE](https://github.com/diego-treitos/linux-smart-enumeration)

- ``./lse.sh --help``

------
# Ejemplos

Un ejemplo sería que nosotros como atacantes realicemos un ``find / -writable 2>/dev/null | grep -vE "python3.10|proc"`` y encontremos que el ``/etc/passwd`` posee permisos de escritura para **otros**, esto lo que nos permitiría es modificarlo y en vez de por ejemplo poseer una "*x*" en el campo de la contraseña colocar una **contraseña hasheada** que creemos nosotros, esta la conseguiríamos a través del siguiente comando

- ``openssl passwd``

Luego deberíamos colocar la cadena de texto que queremos **hashear** como contraseña, por ejemplo la cadena "*hola*" que quedaría así ``$1$758EYyNj$zckyK.dT.fQzWWCXxlI3r0``, de esta manera al modificar el ``/etc/passwd`` y en vez de la "*x*" colocamos la contraseña hasheada, al intentar autenticarnos como ese usuario simplemente escribiríamos la contraseña que creamos pero **sin hash**, es decir "*hola*".

![[AP 1.png]]

--------

Otro caso sería el de ver una **tarea cron** que ejecuta un **script** dentro de un directorio en el que nosotros **poseemos permisos de escritura**, por ejemplo un ``example.sh``, nosotros tal vez **no poseemos permisos sobre el archivo ``example.sh``**, pero como está en un directorio **nuestro**, lo que podemos hacer es **borrar ese script**, y crear uno nosotros **con el mismo nombre**, de esta forma la tarea cron **ejecutaría el script creado por nosotros con código malicioso** como para darnos una escalada de privilegios.

-----