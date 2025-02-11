---------
- Tags: #programación #script 
--------
# Definición

> **Python** es un **lenguaje de programación** de **alto nivel**, interpretado y con una filosofía que enfatiza una sintaxis que favorece un **código legible**. Desde su concepción, Python ha estado enfocado en el principio de **legibilidad** y **simplicidad**. Esto no solo hace que sea más fácil de aprender, sino que también permite a los programadores **expresar conceptos complejos en menos líneas de código** en comparación con otros lenguajes de programación.

-------
## Características Principales

- **Sintaxis simple y fácil de aprender**: Python es famoso por su legibilidad, lo que facilita el aprendizaje para los principiantes y permite a los desarrolladores expresar conceptos complejos en menos líneas de código que serían necesarias en otros lenguajes.
- **Interpretado**: Python es procesado en tiempo de ejecución por el intérprete. Puedes ejecutar el programa tan pronto como termines de escribir los comandos, sin necesidad de compilar.
- **Tipado dinámico**: Python sigue las variables en tiempo de ejecución, lo que significa que puedes cambiar el tipo de datos de una variable en tus programas.
- **Multiplataforma**: Python se puede ejecutar en una variedad de sistemas operativos como Windows, Linux y MacOS.
- **Bibliotecas extensas**: Python cuenta con una gran biblioteca estándar que está disponible sin cargo alguno para todos los usuarios.
- **Soporte para múltiples paradigmas de programación**: Python soporta varios estilos de programación, incluyendo programación orientada a objetos, imperativa y funcional.

**Ventajas de Usar Python:**

- **Productividad mejorada**: La simplicidad de Python aumenta la productividad de los desarrolladores ya que les permite enfocarse en resolver el problema en lugar de la complejidad del lenguaje.
- **Amplia comunidad**: Una comunidad grande y activa significa que es fácil encontrar ayuda, colaboración y contribuciones de terceros.
- **Aplicabilidad en múltiples dominios**: Python se utiliza en una variedad de aplicaciones, desde desarrollo web hasta inteligencia artificial, ciencia de datos y automatización.
- **Compatibilidad y colaboración**: Python se integra fácilmente con otros lenguajes y herramientas, y es una excelente opción para equipos de desarrollo colaborativos.

Con estas características y ventajas, Python se ha establecido como un lenguaje clave en el desarrollo de software moderno. Su facilidad de uso y su amplia aplicabilidad lo hacen una elección excelente tanto para programadores principiantes como para expertos.

-----------

Python 2 y Python 3 son dos versiones del lenguaje de programación Python, cada una con sus propias características y diferencias clave. PIP2 y PIP3 son las herramientas de gestión de paquetes correspondientes a cada versión, utilizadas para instalar y administrar bibliotecas y dependencias.

```bash
apt install python2 python3

## Instalación alternativa de python2

wget https://www.python.org/ftp/python/2.7.9/Python-2.7.9.tgz 
sudo tar xzf Python-2.7.9.tgz 
cd Python-2.7.9 
sudo ./configure --enable-optimizations 
sudo make altinstall

## Luego, puedes verificar la versión de Python con el siguiente comando: 

python2.7 -V 

## Deberías ver Python 2.7.9 como resultado. Después, puedes crear un enlace simbólico a python2.7 en /usr/bin y configurar las alternativas de Python con estos comandos: 

sudo ln -sfn '/usr/local/bin/python2.7' '/usr/bin/python2' 
sudo update-alternatives --install /usr/bin/python python /usr/bin/python2 1 

## Finalmente, puedes configurar la versión predeterminada de Python con el siguiente comando: 

sudo update-alternatives --config python 

## En este punto, puedes presionar para mantener la opción actual, o escribir el número de la selección que prefieras.

```
## Python 2 vs Python 3

- **Sintaxis de print**: En Python 2, ‘print’ es una declaración, mientras que en Python 3, ‘print()’ es una función, lo que requiere el uso de paréntesis.
- **División de enteros**: Python 2 realiza una división entera por defecto, mientras que Python 3 realiza una división real (flotante) por defecto.
- **Unicode**: Python 3 usa Unicode (texto) como tipo de dato por defecto para representar cadenas, mientras que Python 2 utiliza ASCII.
- **Librerías**: Muchas librerías populares de Python 2 han sido actualizadas o reescritas para Python 3, con mejoras y nuevas funcionalidades.
- **Soporte**: Python 2 llegó al final de su vida útil en 2020, lo que significa que ya no recibe actualizaciones, ni siquiera para correcciones de seguridad.
------
## PIP3 vs PIP2

```
apt install python3-pip
```

```
wget https://bootstrap.pypa.io/pip/2.7/get-pip.py
python2 get-pip.py
```

- **Gestión de paquetes**: PIP2 y PIP3 son herramientas que permiten instalar paquetes para Python 2 y Python 3, respectivamente. Es importante usar la versión correcta para garantizar la compatibilidad con la versión de Python que estés utilizando.
- **Comandos de instalación**: El uso de pip o pip3 antes de un comando determina si el paquete se instalará en Python 2 o Python 3. Algunos sistemas operativos pueden requerir especificar pip2 o pip3 explícitamente para evitar ambigüedades.
- **Ambientes virtuales**: Es una buena práctica usar ambientes virtuales para mantener separadas las dependencias de proyectos específicos y evitar conflictos entre versiones de paquetes para Python 2 y Python 3.

La transición de Python 2 a Python 3 ha sido significativa en la comunidad de desarrolladores de Python, y es fundamental que los programadores comprendan las diferencias y sepan cómo trabajar con ambas versiones del lenguaje y sus herramientas asociadas.

------------