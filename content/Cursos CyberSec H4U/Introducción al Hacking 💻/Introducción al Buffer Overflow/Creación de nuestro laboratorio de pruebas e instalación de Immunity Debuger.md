------
- Tags: #debuger #immunity #laboratorios #instalación
-----
# Guía de instalación SO

> Lo primero que haremos será descargar la ISO de **Windows 7 32 Bits** a través de este [link](https://windows-7-home-premium.descargar.gratis/para-windows/app/descargar/) y montarla en nuestro VMware (==4GB de RAM, 2 procesadores, 4 cores, Network Bridged y Replicate physical connection==).

> Necesitamos instalar las **VMware Tools** para poder configurar la resolución de la máquina, de esta forma trabajaremos de una forma más cómoda. Para realizar esto debemos apagar la máquina y darle a settings, eliminaremos **Flopy** y **CD/DVD**, luego añadiremos un nuevo **Disco** sin especificar nada, solamente daremos en **Ok** y arrancaremos la máquina otra vez normalmente.

Gracias a esto, ya podremos instalar **VMware Tools**.

![[Inst 1.png]]

Una vez instalado **VMware Tools** veremos todo a una resolución **correcta**.

Para cambiar el lenguaje del teclado ya que está por defecto en English, debemos ir a *Region and Language* y eliminar en *Keyboard* el idioma *English*.

-------
# Guía de instalación herramientas

Tenemos que instalar varias cosas para acomodar nuestro entorno para esta unidad, como por ejemplo instalar **Immunity Debugger**, **Python3**, **Mona**, **Chrome**, etc. Para realizar esto iremos a los siguientes links.

----
- Vamos a instalar **Google Chrome** desde su web oficial.
- Desactivaremos el Firewall de Windows.
- Una vez terminemos de instalar las siguientes herramientas debemos reiniciar el equipo y tomar una Snapshot.
---
## Instalación Immunity Debugger y Python

> **Immunity Debugger** es un depurador de **32 Bits** para **Windows**

- Vamos a instalar **Immunity Debugger** y **Python** desde [aquí](https://debugger.immunityinc.com/ID_register.py), Python se instalará desde el instalador del **Debugger**.

------
## Disable DEP windows 7 Command Prompt

> DEP (Data Execution Prevention, o Prevención de Ejecución de Datos) es una característica de seguridad en Windows 7 que ayuda a prevenir que el código malicioso se ejecute en áreas de la memoria que están destinadas únicamente para datos, no para la ejecución de código.

DEP (Data Execution Prevention) es una medida de seguridad que se utiliza para prevenir la ejecución de código malicioso en sistemas comprometidos a través de un buffer overflow.

DEP trabaja marcando ciertas áreas de memoria como “**no ejecutables**“, lo que significa que cualquier intento de ejecutar código en esas áreas de memoria será bloqueado y se producirá una excepción.

Esto es especialmente útil para prevenir ataques de buffer overflow que intentan aprovecharse de la ejecución de código en zonas de memoria vulnerables. Al marcar estas zonas de memoria como “no ejecutables”, DEP puede prevenir que el código malicioso se ejecute y proteger el sistema de posibles daños. Aún así, esto puede no ser suficiente para impedir que el atacante logre inyectar sus instrucciones maliciosas.

------
**Deshabilitar la Prevención de Ejecución de Datos (DEP)**

Para deshabilitar DEP en Windows, sigamos estos pasos:

1. Abre la ventana del símbolo del sistema (**CMD**) (Command Prompt) con privilegios de administrador.
2. En el símbolo del sistema, ingrese el siguiente comando:

```
bcdedit.exe /set {current} nx AlwaysOff
```

3. Presione **Enter**.
4. Reinicie el equipo para que los cambios surtan efecto.

Con este proceso, se desactiva la protección DEP en el sistema.

![[Inst 2.png]]

----
## Instalación de Mona

> **Mona** es una extensión para **Immunity Debugger**, una herramienta muy popular en el campo de la seguridad informática para realizar análisis y pruebas de vulnerabilidades, como **exploits**. Immunity Debugger es un depurador utilizado para realizar ingeniería inversa de programas y analizar el comportamiento de binarios, y Mona se integra como un script de Python para ampliar sus capacidades.

**Mona** está diseñada para facilitar tareas comunes relacionadas con la explotación, como:

- **Encontrar cadenas de retorno de llamada (ROP)** para ataques de desbordamiento de pila.
- **Buscar punteros de estructura SEH** para explotación de excepciones.
- **Identificar módulos sin protección (como DEP o ASLR)**, lo que ayuda a los atacantes a evadir medidas de seguridad.
- **Automatizar la búsqueda de instrucciones útiles**, como saltos o llamadas específicas que se pueden usar en exploits.

Copiaremos el código en formato RAW de su [repositorio](https://raw.githubusercontent.com/corelan/mona/refs/heads/master/mona.py) y lo pegaremos en un archivo de texto **mona.py** en el escritorio. Presionaremos ``SHIFT+CLICKDERECHO`` en el escritorio y abriremos la consola desde ahí para cambiar con ``move mona.py.txt mona.py`` la extensión del archivo que hemos creado. Por ultimo meteremos el archivo en la ruta ``C:\Program Files\Immunity Inc\Immunity Debugger\PyCommands``.

Abriremos nuestro **Immunity Debugger** y en la casilla de abajo colocaremos ``!mona``

![[Inst 3.png]]

--------
## Instalación del binario SLMAIL

> **SLMail** es un software de servidor de correo (SMTP y POP3) para sistemas Windows, que fue popular a fines de los años 90 y principios de los 2000. Aunque ya está obsoleto, es muy conocido en la comunidad de ciberseguridad porque se utiliza comúnmente en laboratorios y entornos de pruebas para practicar el desarrollo de exploits y la explotación de vulnerabilidades.

Una de las vulnerabilidades más conocidas en **SLMail** es un **desbordamiento de búfer (buffer overflow)** que ocurre cuando el programa no maneja correctamente datos excesivos en ciertos comandos SMTP o POP3, lo que permite que un atacante inyecte código malicioso y potencialmente tome el control del sistema. Esto lo convierte en una excelente herramienta de práctica para aprender sobre desbordamientos de búfer y explotación de vulnerabilidades en un entorno controlado.

----

Para descargar e instalar **SLMail** iremos a la siguiente [web](https://slmail.software.informer.com/download/#downloading). Luego procederemos con la instalación, daremos a **Next** sin modificar nada hasta que se instale.

Este servicio nos abrirá el *puerto 25* y el *puerto 110*, el segundo es el vulnerable en el que vamos a centrar nuestra atención.

![[inst 4.png]]

![[inst 5.png]]

Como podemos ver está activo **correctamente**, por lo tanto ahora podríamos iniciar sesión en el servicio con ``telnet 192.168.0.120 110`` o con ``nc 192.168.0.120 110``, proporcionando ``USER usuario``, ``PASS contraseña``

![[inst 6.png]]

Ya con todo esto pasaremos a la fase de **Explotación**.