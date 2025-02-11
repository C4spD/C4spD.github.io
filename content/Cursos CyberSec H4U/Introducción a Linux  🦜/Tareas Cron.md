-------
- Tags: #Linux #sistemaoperativo 
---------
# Definición

>Las **Tareas Cron** son tareas que se ejecutan en segundo plano en el sistema [[Linux]] a intervalos regulares de tiempo. Estas son una especie de **script preestablecidos por nosotros previamente y otros ya por defecto** que se ejecutan cada cierto tiempo que les asignemos. El Servicio Cron **es un servicio el cual tiene que estar habilitado** y se encuentra en el directorio **/etc/cron.d**.

-------
# Formas para trabajar con Cron

Si queremos trabajar con cron, podemos hacerlo a través del comando **``crontab``**.
Los ``* * * * *`` Si quisiéramos especificar todos los valores posibles de un parámetro (**minutos**, **horas**, etc.) podemos hacer uso del asterisco. Esto implica que si en lugar de un número utilizamos un asterisco, el comando indicado se ejecutará cada minuto, hora, día de mes, mes o día de la semana, como en el siguiente ejemplo:

- **``( * * * * * *) /home/user/script.sh``**

``*/`` - (Asterisco y barra) Significa cada x cantidad de tiempo 
``L`` - hace alusión al ultimo valor permitido para el campo correspondiente.

Para mas información entrar a la [Web Cron](https://blog.desdelinux.net/cron-crontab-explicados/#Que_es_cron)
Para practicar Cron entrar al [siguiente link](https://www.site24x7.com/es/tools/crontab/cron-generator.html)

![[Como funciona una tarea cron.png]]