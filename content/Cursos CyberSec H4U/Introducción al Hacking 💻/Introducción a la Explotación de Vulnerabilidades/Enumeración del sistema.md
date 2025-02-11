------
- Tags: #enumeración #sistema #script 
------
# Definición

> Las **Enumeraciones del sistema** pueden realizarse mediante el uso de **herramientas automatizadas**, de manera **manual** con comandos del sistema o con la creación de **scripts básicos**.
   Una vez **obtengamos acceso a la maquina objetivo** luego de haber logrado vulnerar su seguridad, es muy importante **identificar** mediante una **Enumeración de sistema** por ejemplo vías potenciales de poder **elevar nuestros privilegios de usuario**, comprender la **estructura del sistema objetivo** y encontrar **información útil** para futuros ataques.

==Un dato a tener en cuenta es que las herramientas automatizadas para reconocimiento están permitidas en los exámenes de certificación==

------------
# Herramientas automáticas

- **``LSE``** (**Linux Smart Enumeration**): Es una **herramienta de enumeración para sistemas Linux** que permite a los atacantes obtener **información detallada sobre la configuración del sistema**, los **servicios en ejecución** y los **permisos de archivo**. LSE utiliza una variedad de comandos de Linux para recopilar información y presentarla en un formato **fácil de entender**. Al utilizar LSE, los atacantes pueden detectar **posibles vulnerabilidades** y encontrar información valiosa para futuros ataques. Se puede descargar en el siguiente [Link](https://github.com/diego-treitos/linux-smart-enumeration) y también se puede descargar una Herramienta muy similar en este [link](https://github.com/rebootuser/LinEnum)

- **``Pspy``**: Es una **herramienta de enumeración de procesos** que permite a los atacantes **observar los procesos y comandos** que se ejecutan en el sistema objetivo a **intervalos regulares de tiempo**. Pspy es una herramienta útil para la **detección de malware** y **backdoors**, así como para la **identificación de procesos maliciosos** que se ejecutan en segundo plano sin la interacción del usuario. Se puede descargar en el siguiente [Link](https://github.com/DominicBreuker/pspy)

------
# Método Manual

Llamamos **enumeración manual** al uso de los [[Comandos]] de [[Linux]] para poder tomar información del sistema básica, tales como 

- **``whoami``** (Identificar en que usuario estoy)
- **``sudo -l``**
- **``id``** (Identificar los grupos a los que pertenece el usuario actual)
- **``find -perm -4000 2>/dev/null``** (Encontrar binarios con permiso de ejecución)
- **``getcap -r / 2>/dev/null``** (Encontrar capabilities)
- **``crontab -l``** (Identificar si el usuario actual dispone de alguna tarea cron activa)
- **``cat /etc/crontab``** 
- **``systemctl list-timers``** (Identificar cuanto queda para que se ejecute determinada tarea)
- **``ps -eo user,command``** (Reporta todos los comandos que se están ejecutando en el sistema y que usuarios lo están haciendo)

Podemos apoyarnos de la página web [GTFOBins](https://gtfobins.github.io/) para en caso de tener dudas sobre que se puede hacer cuando un **binario posee un privilegio extra**, poder infórmanos sobre que **podemos hacer con el**. Además en esta web, podemos informarnos sobre **distintas capabilities** y **maneras de explotarlas**.
# Método Script

```bash
#!/bin/bash

#Colours
redColour="\e[0;31m\033[1m"

function ctrl_c (){
  echo -e "\n\n${redColour}[!]Saliendo...${endColour}\n"
  tput cnorm;exit 1
}

# Ctrl+C INTERRUPCIÓN DEL SCRIPT
trap ctrl_c SIGINT

#Procesos que muestra el SCRIPT
old_process=$(ps -eo user,command)

tput civis

while true; do
  new_process=$(ps -eo user,command)
  diff <(echo "$old_process") <(echo "$new_process") | grep "[\>\<]" | grep -vE "command|kworker|procmon"
  old_process=$new_process
done
```