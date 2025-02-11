-------
- Tags: #herramientas #sistemaoperativo #contenedores #repositorios
-------
# Definición

> **Github** es un portal creado para alojar el código de las aplicaciones de cualquier desarrollador. La plataforma está creada para que los desarrolladores suban el código de sus aplicaciones y herramientas, y que como usuario no sólo puedas descargarte la aplicación, sino también entrar a su perfil para leer sobre ella o colaborar con su desarrollo.
> También tiene un **sistema de seguimiento de problemas**, para que otras personas **puedan hacer mejoras, sugerencias y optimizaciones en los proyectos**. Ofrece también una **herramienta de revisión de código**, de forma que **no sólo se puede mirar el código fuente de una herramienta, sino que también se pueden dejar anotaciones para que su creador o tú mismo las puedas revisar**. Se pueden crear discusiones también alrededor de estas anotaciones para mejorar y optimizar el código.

----
# Recursos de GitHub

Con el comando **``git log``** podremos siempre listar todos los Commits (Cometidos) existentes en un proyecto. Lo que obtendremos es un listado de identificadores los cuales podremos aprovechar para, por ejemplo, mediante el uso del comando **``git show``** seguido del identificador del Commit cuyas propiedades queramos visualizar, ser capaces de ver todos los cambios que se hayan aplicado para un punto dado del proyecto.
# ¿Cómo funcionan las ``branch`` en Github?

**Funciona** de la siguiente manera: cada cambio que se realiza en el código de un proyecto, ya sea para agregar un nuevo recurso o incluso corregir un error, se crea una nueva rama (llamada **``branch``**) que consolida estos cambios, sin interferir en los archivos originales.
Uno puede **desplazarse** por estas branch para ver los diferentes cambios que se han hecho a lo largo del desarrollo de un código.

Utilizando el comando **``git branch -a``** nos permite crear, enumerar y eliminar ramas, así como cambiar sus nombres.
Utilizando el comando **``git checkout (Nombre de la rama)``** nos permite cambiarnos a otra rama o bifurcación del código que existe
Utilizando el comando **``git merge``** permite tomar las líneas independientes de desarrollo creadas por git branch e integrarlas en una sola rama. 

En Git, una etiqueta o **``tag``** sirve básicamente como una rama firmada que no permuta, es decir, siempre se mantiene inalterable. Sencillamente es una cadena arbitraria que apunta a un **Commit** específico. Puede decirse que un tag es un nombre que puedes usar para marcar un punto específico en la historia de un repositorio.

Utilizando el comando **``git tag``** nos permite listar las **tags**, luego podemos ver el contenido con **``git show``** nuevamente.

Los **Commits** son la base principal del trabajo de Git, ya que es el comando más usado para guardar cualquier cambio en esta herramienta. Si te preguntas qué es un **Commit**, te puedes hacer una idea al entenderlo **como una captura de pantalla del trabajo que haces cada segundo en Git**, creando en consecuencia una versión del proyecto en el repositorio local.

Utilizando el comando **``git add -f (NOMBRE ARCHIVO)``** con la variación ``-f``  -----> (Sirve para forzar el agregado del Commit) podemos añadir un archivo a los **Commits**.
Utilizando el comando **``git commit -m (MENSAJE)``** con la variación ``-m``  -----> (Sirve para dejarle un mensaje/titulo al Commit).
Utilizando el comando **``git push -u origin (Nombre de la rama donde deseemos hacer el push del commit)``**


