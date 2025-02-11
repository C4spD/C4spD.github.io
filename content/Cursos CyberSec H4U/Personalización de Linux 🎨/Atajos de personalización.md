---------
- Tags: #personalización #atajos #shortcuts #kitty #powerline #polybar #zsh
------------

Estos comandos son destinados a la personalización hecha dentro de nuestro SO [[Linux]]

Si personalizando anda muy mal configurar el VBOX en Sistema, Procesador, habilitar PAE/NX
Cuando configuramos las teclas del sxhkd utilizamos WINDOWS+ESC para actualizar la configuración actual.

## Apagar o reiniciar conf
==WINDOWS+SHIFT+(Q o R) para apagar o ACTUALIZAR configuración==
## Apertura de Shell y Programas
==CTRL+ENTER Para abrir la terminal==
==WINDOWS+D Abrimos ROFI(Buscador)==
==WINDOWS+SHIFT+F Abrimos FIREFOX==
WINDOWS+Q Cerramos la ventana actual
## Powerline y Kitty (Barra de procesos de las shells)
==CTRL+SHIFT+ENTER Abre una Kitty(Shell) dentro de la misma==
CTRL+SHIFT+Z Para hacer un zoom a la terminal actual, usar devuelta esto para sacarle el zoom
==CTRL+SHIT+W para cerrar la terminal actual abierta en la misma terminal==
==CTRL+SHIFT+T Abre el formato powerline de SESIONES==
CTRL+SHIFT+R Para resizear o acomodar el tamaño a gusto
CTRL+SHIFT+ALT+T Renombramos la powerline actual
CTRL+SHIFT+(Derecha o izquierda) Me muevo entre las diferentes powerlines
CTRL+(Flechitas) para moverme dentro de las diferentes terminales que están abiertas en una misma terminal
CTRL+SHIFT+PUNTO para acomodar en el orden que quiera las pestañas de las diferentes terminales
CTRL+SHIFT+L para acomodar de manera automática de diferentes maneras todas las terminales abiertas en una.
## Ventana
WINDOWS+S Pongo la ventana actual en modo flotante
WINDOWS+T Para salir del modo ventana flotante
WINDOWS+SHIFT+(Flechitas) Mover ventana flotante
WINDOWS+ALT+(Flechitas) Manipulamos el tamaño de la ventana actual
==WINDOWS+(Flechitas) Selecciono la ventana en la que quiero operar.==
## Espacios de trabajo
Windows+(1,2,3,4,5,6,7,8,9) Desplazarte entre los diferentes espacios de trabajo
Windows+Shift+(1,2,3,4,5,6,7,8,9) Para mover el espacio de trabajo al numero que apretemos
## Previsualizar procesos
CTRL+WINDOWS+ALT+(Flechitas) Previsualizo en amarillo donde queremos abrir un nuevo proceso
CTRL+WINDOWS+SPACE Cancelamos la previsualización anterior
CTRL+WINDOWS+(1,2,3,4,5,6,7,8,9) Modificamos el tamaño del previsualizado de nuevo proceso
### Cambiar fondo de pantalla
Instalar con sudo apt install feh
Modificar archivo "***==nano /home/c4sp/.config/bspwm/bspwmrc==***" en la parte donde dice "``feh --bg-fill``" con el directorio del fondo que queramos
## Comandos personalizados
ESC+ESC (Coloca sudo delante de la linea que estoy escribiendo)
ranger (Desplazamiento interactivo de directorios en consola)
flameshot gui (Sacar capturas de pantalla)
i3lock-fancy (Bloque de pantalla, usar contraseña de usuario para desbloquear)
cat+CTRL+T Búsqueda en todos los archivos del sistema (Desde la raíz)

----

En **NVIM** adentro de cualquier archivo apretando **SPACE + C H**, abrirá un cheatsheet de **NVCHAD** para ver todos los atajos disponibles.

**Windows + SHIFT + X** - bloquear la pantalla para tener que proporcionar contraseña.