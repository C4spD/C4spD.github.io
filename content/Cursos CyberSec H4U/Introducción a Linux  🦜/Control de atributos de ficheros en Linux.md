-------
- Tags: #atributos #ficheros #directorios #modificación #flags #chattr #lsattr
- ----------
# Definición

> Los atributos dentro de un fichero **representan que tipo de características o propiedades extras posee un archivo/directorio**, normalmente llamadas **Flags**.

-----------
# Comandos para la gestión de flags

***``chattr``*** se utiliza para crear una flag dentro de un archivo, como por ejemplo la propiedad existente llamada **inmutable** que sirve para evitar que cualquier usuario inclusive el root pueda eliminar o modificar cualquiera de los archivos/directorios que tengan la propiedad asignada.

Un ejemplo seria **``chattr +i +V (Nombre de Directorio/Archivo`` al que queramos aplicar la Flag)** con este comando generamos un flag **inmutable** que se coloca con **``-i``** y a su vez utilizamos el **Verbose** o **``+V``** para que luego de que se active el inmutable nos de una breve descripción de lo que esta sucediendo con el archivo.

Para eliminar la flag previamente agregada **``chattr -i -V``** (El Verbose es opcional)

***``lsattr``*** se utiliza para **brindar información acerca de las propiedades** **extras** que posee un archivo o directorio.

Existen variedad de Flags dentro del sistema operativo [[Linux]], estas pueden ser encontradas en [esta web](https://programmerclick.com/article/5604675172/)